#!/usr/bin/env python3
# [CONFIG:naming-lint]
# PostToolUse-хук: принудительный контроль правил архитектуры стилей из
# .claude/skills/css-architecture-craft/RULES.md при записи CSS и JS.
# Модуль: skills/css-architecture-craft. Зависимости: только стандартная библиотека.
# Контракт ввода/вывода дословно повторяет .claude/hooks/motion-lint.py:
#   stdin -> JSON события, реакция на Write/Edit/MultiEdit, решение печатается
#   в stdout как JSON, выход всегда с кодом 0.
# Блокирует однозначные нарушения (цветовой литерал и px-литерал в компоненте,
# --модификатор, переключаемый из JS) и возвращает готовую замену; спорное —
# предупреждает, не блокируя. Формулировки правил менять только вместе с RULES.md.
import json
import os
import re
import sys
from pathlib import Path

RULEBOOK = ".claude/skills/css-architecture-craft/RULES.md"

CSS_EXTENSIONS = {".css", ".scss", ".sass", ".less"}
JS_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"}

# Проверяются только слои, где литералы запрещены сводом (§5).
GUARDED_DIRS = ("styles/components/", "styles/pages/")

# Унаследованные исключения RULES.md §5.6 — цвет в них не проверяется.
GRANDFATHERED = {"spinner.css", "file-upload.css"}

# [BLOCK:naming-lint.scales]
# Шкала кеглей --fs-* (styles/base/variables.css)
FS_SCALE = {
    12: "--fs-xs", 13: "--fs-sm", 14: "--fs-base", 15: "--fs-md", 16: "--fs-lg",
    18: "--fs-xl", 20: "--fs-2xl", 24: "--fs-3xl", 30: "--fs-4xl",
}
# Шкала отступов --space-* (шаг 4px)
SPACE_SCALE = {
    4: "--space-1", 8: "--space-2", 12: "--space-3", 16: "--space-4", 20: "--space-5",
    24: "--space-6", 32: "--space-8", 40: "--space-10", 48: "--space-12",
    64: "--space-16", 80: "--space-20", 96: "--space-24",
}
SPACING_PROPS = {
    "padding", "margin", "gap", "row-gap", "column-gap", "inset",
    "padding-top", "padding-right", "padding-bottom", "padding-left",
    "padding-block", "padding-inline", "padding-block-start", "padding-block-end",
    "padding-inline-start", "padding-inline-end",
    "margin-top", "margin-right", "margin-bottom", "margin-left",
    "margin-block", "margin-inline", "margin-block-start", "margin-block-end",
    "margin-inline-start", "margin-inline-end",
}
# Свойства, где цветовой литерал легален по §5.5 (маска — альфа-канал, не цвет).
MASK_PROPS = {"mask", "-webkit-mask", "mask-image", "-webkit-mask-image"}
# Разбор одной декларации `prop: value` (селекторы и скобки уже отрезаны).
DECLARATION = re.compile(r"^\s*(--[a-z0-9-]+|[a-z-]+)\s*:\s*(.+?)\s*$", re.IGNORECASE)

HEX = re.compile(r"#[0-9a-fA-F]{3,8}\b")
RGB = re.compile(r"\brgba?\(", re.IGNORECASE)
PX = re.compile(r"(?<![\w.\-])(\d{1,4})px")
IS_CLASS = re.compile(r"\.(is-[a-z0-9-]+)")
JS_MODIFIER_TOGGLE = re.compile(
    r"classList\s*\.\s*(?:add|remove|toggle|replace)\s*\(\s*[\"'`]([^\"'`]*--[^\"'`]*)[\"'`]"
)
COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)

# Подсказка по замене частых цветовых литералов.
COLOR_HINTS = [
    (re.compile(r"#fff(?:fff)?\b", re.IGNORECASE),
     "белый — это var(--color-surface) (поверхность), var(--color-text-on-accent) "
     "(текст на заливке) или var(--surface-glass) (стекло)"),
    (re.compile(r"#000(?:000)?\b"),
     "чёрный — это var(--color-text) (текст) или var(--color-overlay) (подложка)"),
    (re.compile(r"\brgba\(\s*0\s*,\s*0\s*,\s*0", re.IGNORECASE),
     "полупрозрачный чёрный — var(--color-overlay), var(--color-on-accent-dim) "
     "или var(--color-swatch-inset)"),
    (re.compile(r"\brgba\(\s*255\s*,\s*255\s*,\s*255", re.IGNORECASE),
     "полупрозрачный белый — var(--color-on-accent-soft), var(--color-on-accent-strong), "
     "var(--color-scrim-light) или var(--surface-veil)"),
]
# </BLOCK:naming-lint.scales>


# [FUNC:naming_lint.extract_written_text_v1]
def extract_written_text(tool_input: dict) -> str:
    """Собирает текст, который агент только что записал в файл."""
    parts = [tool_input.get("content", ""), tool_input.get("new_string", "")]
    for edit in tool_input.get("edits", []) or []:
        parts.append(edit.get("new_string", ""))
    return "\n".join(p for p in parts if p)
# </FUNC:naming_lint.extract_written_text_v1>


# [FUNC:naming_lint.strip_comments_v1]
def strip_comments(text: str) -> str:
    """Убирает /* ... */ — в комментариях литералы легальны (обоснования, ссылки)."""
    return COMMENT.sub(" ", text)
# </FUNC:naming_lint.strip_comments_v1>


# [FUNC:naming_lint.color_hint_v1]
def color_hint(line: str) -> str:
    for pattern, hint in COLOR_HINTS:
        if pattern.search(line):
            return hint
    return ("подобрать семантический токен --color-* из styles/base/variables.css "
            "(RULES.md §1.1); если роли нет — завести токен по §1.3, а не литерал")
# </FUNC:naming_lint.color_hint_v1>


# [FUNC:naming_lint.declarations_v1]
def declarations(text: str):
    """Выдаёт пары (prop, value) из записанного CSS.

    Строка режется по `{`, `}` и `;`: селекторы, медиазапросы и хвосты правил
    отсеиваются сами (в них нет пары `prop: value`). Значения, разорванные на
    несколько строк (многослойная тень, градиент), намеренно не разбираются —
    лучше промолчать, чем заблокировать на догадке.
    """
    for raw_line in strip_comments(text).splitlines():
        for chunk in re.split(r"[{};]", raw_line):
            m = DECLARATION.match(chunk)
            if not m:
                continue
            prop = m.group(1).strip().lower()
            value = m.group(2).strip()
            if prop.startswith("@") or not value:
                continue
            yield prop, value, f"{prop}: {value}"
# </FUNC:naming_lint.declarations_v1>


# [FUNC:naming_lint.check_css_v1]
def check_css(path: Path, text: str) -> tuple[list[str], list[str]]:
    """Проверки (a), (a') и (b). Разбираются только полные декларации `prop: value`."""
    blocks: list[str] = []
    warns: list[str] = []
    if not any(d in path.as_posix() for d in GUARDED_DIRS):
        return blocks, warns

    color_checked = path.name not in GRANDFATHERED

    for prop, value, decl in declarations(text):
        # (a) / (a') цветовой литерал
        if color_checked and prop not in MASK_PROPS and "url(" not in value:
            if HEX.search(value) or RGB.search(value):
                if prop.startswith("--"):
                    warns.append(
                        f"объявление токена литералом: `{decl}` — приём §5.8 допустим "
                        "только внутри блока с принудительно светлой палитрой "
                        "(.print-sheet / .spec-sheet / .code-panel), значения обязаны быть "
                        "скопированы из светлой палитры styles/base/variables.css "
                        "и сопровождены комментарием, почему палитра фиксирована"
                    )
                else:
                    blocks.append(
                        f"цветовой литерал в компоненте: `{decl}` — {color_hint(value)}"
                    )

        # (b) px вместо токена
        if prop == "font-size":
            for m in PX.finditer(value):
                px = int(m.group(1))
                token = FS_SCALE.get(px)
                if token:
                    blocks.append(
                        f"кегль литералом: `{decl}` — заменить {px}px на var({token})"
                    )
                else:
                    warns.append(
                        f"кегль вне шкалы: `{decl}` — {px}px нет в --fs-* "
                        "(12/13/14/15/16/18/20/24/30). Если это не текст, а глиф иконки — "
                        "оставить и пояснить комментарием, иначе взять соседний токен"
                    )
        elif prop in SPACING_PROPS:
            hits = {
                f"{m.group(1)}px → var({SPACE_SCALE[int(m.group(1))]})"
                for m in PX.finditer(value)
                if int(m.group(1)) in SPACE_SCALE
            }
            if hits:
                blocks.append(f"отступ литералом: `{decl}` — " + ", ".join(sorted(hits)))

    return blocks, warns
# </FUNC:naming_lint.check_css_v1>


# [FUNC:naming_lint.collect_state_classes_v1]
def collect_state_classes(text: str) -> list[str]:
    """Имена is-* состояний, объявленных в записанном CSS."""
    return sorted({m.group(1) for m in IS_CLASS.finditer(strip_comments(text))})
# </FUNC:naming_lint.collect_state_classes_v1>


# [FUNC:naming_lint.project_consumers_v1]
def project_consumers(root: Path) -> str:
    """Склеенный текст скриптов и разметки проекта — источник для проверки (d)."""
    chunks: list[str] = []
    candidates: list[Path] = []
    main_js = root / "main.js"
    if main_js.exists():
        candidates.append(main_js)
    for pattern in ("js/*.js", "js/**/*.js", "*.html", "pages/*.html"):
        candidates.extend(sorted(root.glob(pattern)))
    for f in candidates[:200]:
        try:
            chunks.append(f.read_text(encoding="utf-8", errors="ignore"))
        except OSError:
            continue
    return "\n".join(chunks)
# </FUNC:naming_lint.project_consumers_v1>


# [FUNC:naming_lint.check_js_v1]
def check_js(text: str) -> list[str]:
    """(c) --модификатор, переключаемый из JS."""
    blocks = []
    for m in JS_MODIFIER_TOGGLE.finditer(text):
        name = m.group(1)
        state = "is-" + name.split("--", 1)[1].strip("-") if "--" in name else "is-state"
        blocks.append(
            f"модификатор переключается из JS: `{name}` — по RULES.md §2.2 `--модификатор` "
            f"выбирает автор разметки, а меняющееся во времени значение обязано называться "
            f"`is-*`. Переименовать класс в `{state}` в CSS, разметке и скрипте"
        )
    return blocks
# </FUNC:naming_lint.check_js_v1>


# [FUNC:naming_lint.analyze_v1]
def analyze(file_path: str, text: str, root: Path | None = None) -> tuple[list[str], list[str]]:
    """Единая точка анализа: возвращает (блокирующие, предупреждения)."""
    path = Path(file_path)
    suffix = path.suffix.lower()
    blocks: list[str] = []
    warns: list[str] = []

    if suffix in CSS_EXTENSIONS:
        b, w = check_css(path, text)
        blocks += b
        warns += w
        states = collect_state_classes(text)
        if states and root is not None:
            consumers = project_consumers(root)
            if consumers:
                orphan = [s for s in states if s not in consumers]
                if orphan:
                    warns.append(
                        "состояние без сеттера: " + ", ".join(f"`.{s}`" for s in orphan) +
                        " — по RULES.md §2.3.1 у каждого is-* обязан быть код, который его "
                        "ставит и снимает (main.js, js/*.js или скрипт страницы). Если класс "
                        "не переключается во времени — это вариант, переименовать в --modifier"
                    )
    elif suffix in JS_EXTENSIONS:
        blocks += check_js(text)

    return blocks, warns
# </FUNC:naming_lint.analyze_v1>


# [FUNC:naming_lint.render_v1]
def render(name: str, blocks: list[str], warns: list[str]) -> str:
    lines = [f"🧱 naming-lint: в {name} нарушены правила архитектуры стилей ({RULEBOOK}):", ""]
    lines += [f"• {b}" for b in blocks]
    if warns:
        lines += ["", "Требует внимания (не блокирует):"]
        lines += [f"• {w}" for w in warns]
    if blocks:
        lines += ["", "Исправить сейчас же, до перехода к следующему шагу."]
    return "\n".join(lines)
# </FUNC:naming_lint.render_v1>


# [FUNC:naming_lint.main_v1]
def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    if payload.get("tool_name") not in ("Write", "Edit", "MultiEdit"):
        sys.exit(0)

    tool_input = payload.get("tool_input", {}) or {}
    file_path = str(tool_input.get("file_path", ""))
    path = Path(file_path)
    if path.suffix.lower() not in (CSS_EXTENSIONS | JS_EXTENSIONS):
        sys.exit(0)
    # Сам свод и слои токенов описывают правила, а не нарушают их.
    if "css-architecture-craft" in path.as_posix() or path.name in ("variables.css", "motion.css"):
        sys.exit(0)

    text = extract_written_text(tool_input)
    if not text:
        sys.exit(0)

    root_raw = payload.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or "."
    root = Path(root_raw)

    blocks, warns = analyze(file_path, text, root)
    if not blocks and not warns:
        sys.exit(0)

    if blocks:
        reason = render(path.name, blocks, warns)
        print(json.dumps({
            "decision": "block",
            "reason": reason,
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": reason,
            },
        }, ensure_ascii=False))
        sys.exit(0)

    note = "\n".join(
        [f"🧱 naming-lint: замечания по {path.name} ({RULEBOOK}):", ""] +
        [f"• {w}" for w in warns]
    )
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": note,
        },
    }, ensure_ascii=False))
    sys.exit(0)
# </FUNC:naming_lint.main_v1>


# [TEST:naming-lint.selftest]
SELFTEST_CASES = [
    # (описание, путь, текст, ожидание блокировки, ожидание предупреждения)
    (
        "цветовой литерал в компоненте",
        "styles/components/demo.css",
        ".demo { background: #fafaf9; }",
        True, False,
    ),
    (
        "цвет в комментарии не считается",
        "styles/components/demo.css",
        "/* был хардкод #fbbf24 — теперь токен */\n.demo { color: var(--color-warning); }",
        False, False,
    ),
    (
        "унаследованное исключение §5.6",
        "styles/components/spinner.css",
        ".spinner-white { border-top-color: #fff; }",
        False, False,
    ),
    (
        "маска: #000 как альфа-канал",
        "styles/components/demo.css",
        ".demo { mask: radial-gradient(farthest-side, transparent 60%, #000 60%); }",
        False, False,
    ),
    (
        "бумажная палитра — предупреждение, не блок",
        "styles/components/demo-sheet.css",
        ".demo-sheet { --color-text: #18181b; }",
        False, True,
    ),
    (
        "кегль литералом со шкалы",
        "styles/pages/demo.css",
        ".demo-title { font-size: 24px; }",
        True, False,
    ),
    (
        "кегль вне шкалы — предупреждение",
        "styles/pages/demo.css",
        ".demo-glyph { font-size: 56px; }",
        False, True,
    ),
    (
        "отступ литералом со шкалы",
        "styles/components/demo.css",
        ".demo { padding: 16px; }",
        True, False,
    ),
    (
        "отрицательный сдвиг не трогаем",
        "styles/components/demo.css",
        ".demo::before { margin: -8px 0 0 -8px; }",
        False, False,
    ),
    (
        "брейкпоинт в медиазапросе легален",
        "styles/components/demo.css",
        "@media (max-width: 767px) { .demo { gap: var(--space-2); } }",
        False, False,
    ),
    (
        "базовый слой вне проверки",
        "styles/base/utilities.css",
        ".u-demo { padding: 16px; background: #fff; }",
        False, False,
    ),
    (
        "модификатор переключается из JS",
        "main.js",
        "panel.classList.toggle('picklist__panel--top', flip);",
        True, False,
    ),
    (
        "состояние из JS — норма",
        "main.js",
        "panel.classList.toggle('is-open', open);",
        False, False,
    ),
]


def selftest() -> int:
    failed = 0
    for name, path, text, want_block, want_warn in SELFTEST_CASES:
        blocks, warns = analyze(path, text, None)
        got_block, got_warn = bool(blocks), bool(warns)
        ok = (got_block == want_block) and (got_warn == want_warn)
        print(f"{'PASS' if ok else 'FAIL'}  {name}")
        if not ok:
            failed += 1
            print(f"      ожидали block={want_block} warn={want_warn}, "
                  f"получили block={got_block} warn={got_warn}")
            for m in blocks + warns:
                print(f"      → {m}")
    print(f"\n{len(SELFTEST_CASES) - failed}/{len(SELFTEST_CASES)} проверок пройдено")
    return 1 if failed else 0
# </TEST:naming-lint.selftest>


if __name__ == "__main__":
    if "--selftest" in sys.argv:
        sys.exit(selftest())
    main()
# </CONFIG:naming-lint>

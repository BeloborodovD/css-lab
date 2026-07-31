#!/usr/bin/env python3
# [CONFIG:motion-lint]
# PostToolUse-хук: принудительный контроль правил движения из
# .claude/skills/ui-motion-craft/RULES.md при записи UI-кода.
# Модуль: hooks. Зависимости: только стандартная библиотека.
# Срабатывает на Write/Edit по файлам стилей и компонентов, блокирует однозначные
# дефекты (ease-in в UI, transition: all, scale(0), анимация layout-свойств и т. д.)
# и возвращает агенту готовую замену. Формулировки правил менять только вместе с RULES.md.
import json
import re
import sys
from pathlib import Path

RULEBOOK = ".claude/skills/ui-motion-craft/RULES.md"
EXTENSIONS = {".css", ".scss", ".sass", ".less", ".tsx", ".jsx", ".ts", ".js", ".vue", ".svelte"}

# [BLOCK:motion-lint.patterns]
# (regex, краткое имя дефекта, требуемое исправление)
PATTERNS = [
    (
        re.compile(r"(?<![\w-])ease-in(?!-out)(?![\w-])"),
        "ease-in в UI",
        "ease-in начинается медленно ровно в тот момент, когда пользователь смотрит "
        "внимательнее всего — интерфейс кажется вялым. Заменить на var(--ease-out) "
        "(cubic-bezier(0.23, 1, 0.32, 1)); это касается и анимаций выхода.",
    ),
    (
        re.compile(r"transition\s*:\s*all[\s;,]", re.IGNORECASE),
        "transition: all",
        "Анимируются непредвиденные свойства мимо GPU. Перечислить конкретные: "
        "transition: transform 200ms var(--ease-out), opacity 200ms var(--ease-out).",
    ),
    (
        re.compile(r"scale\(\s*0\s*\)|scale3d\(\s*0\s*,"),
        "scale(0)",
        "Ничто в реальном мире не появляется из ничего. Входить с scale(0.95) "
        "(диапазон 0.9-0.97) вместе с opacity: 0.",
    ),
    (
        re.compile(
            r"transition\s*:\s*(?:[^;{}]*[\s,])?(width|height|margin|padding|top|left|right|bottom|font-size)\s+\d",
            re.IGNORECASE,
        ),
        "анимация layout-свойства",
        "width/height/margin/padding/top/left/font-size запускают layout + paint каждый кадр. "
        "Анимировать только transform и opacity (масштаб — scale, смещение — translate).",
    ),
    (
        re.compile(r"animation-duration\s*:\s*0\.0*1m?s\s*!important", re.IGNORECASE),
        "reduced-motion как рубильник",
        "Уменьшенное движение означает мягче, а не «выключено»: снять перемещение "
        "(transform: none), оставить transition: opacity 200ms ease.",
    ),
]
# </BLOCK:motion-lint.patterns>


# [BLOCK:motion-lint.press-feedback]
# Отдельная проверка, а не строка в PATTERNS: ей мало факта совпадения — нужно
# разобрать КАЖДОЕ объявление transition и понять, на нажимаемом ли оно элементе.
# Ловит регрессию, найденную глазами на шаге 03: `transition` — шорткат, он
# сбрасывает список целиком, а компонент лежит в слое `components` и бьёт
# правило нажатия из `base/motion.css` (слой `tokens`). В итоге
# `:active { transform: scale(0.97) }` применяется, но отыгрывает мгновенно.
# Лечение одно: список начинается с var(--transition-press).

# Селектор нажимаемого элемента: настоящая кнопка, роль кнопки, явный маркер
# либо принятые в библиотеке имена собственных кнопок компонентов.
PRESSABLE_SELECTOR = re.compile(
    r"""(?:^|[\s,>+~])(?:
          button\b
        | \[role=['"]?button
        | \[data-pressable
        | \.btn\b
        | [.\w-]*(?:__|-)(?:trigger|toggle|close|remove|copy|action|btn|button)s?\b
        | \.(?:tab|chip-choice|chip-remove|dropdown-item|page-btn)\b
    )""",
    re.VERBOSE | re.IGNORECASE,
)

# Объявление transition вместе с предшествующим ему куском правила (селектор).
TRANSITION_DECL = re.compile(r"([^{}]*)\{([^{}]*?transition\s*:\s*([^;}]+))", re.DOTALL)


# [FUNC:motion_lint.find_press_feedback_loss_v1]
def find_press_feedback_loss(text: str, path) -> list:
    """Ищет transition на нажимаемом элементе без сегмента отклика нажатия.

    Работает по тексту правила целиком, поэтому надёжен при Write и при Edit,
    захватившем селектор; точечная правка одной строки `transition:` без
    открывающей скобки правила не проверяется — это ограничение, а не гарантия.
    """
    posix = path.as_posix()
    # Токены движения сами объявляют сегмент; страницы и слои темы кнопок не заводят.
    if path.name == "motion.css" or "/styles/base/" in posix:
        return []
    if path.suffix.lower() not in {".css", ".scss", ".sass", ".less"}:
        return []

    # Комментарии выбрасываются до разбора: слово button в пояснении рядом с
    # правилом — не селектор, а ложная тревога, и блокировать из-за него нельзя.
    text = re.sub(r"/\*.*?\*/", " ", text, flags=re.DOTALL)

    bad = []
    for selector, _body, value in TRANSITION_DECL.findall(text):
        selector = selector.split("}")[-1].strip()
        if not selector or selector.startswith("@"):
            continue
        if not PRESSABLE_SELECTOR.search(selector):
            continue
        # Отклик уже внесён — либо токеном, либо руками через transform.
        if "--transition-press" in value or re.search(r"\btransform\b", value):
            continue
        # `transition: none` ловится отдельным правилом свода, здесь не дублируем.
        if value.strip() in {"none", "inherit", "initial", "unset", "revert"}:
            continue
        bad.append(" ".join(selector.split())[:80])
    return bad
# </FUNC:motion_lint.find_press_feedback_loss_v1>


# [FUNC:motion_lint.extract_written_text_v1]
def extract_written_text(tool_input: dict) -> str:
    """Собирает текст, который агент только что записал в файл."""
    parts = [tool_input.get("content", ""), tool_input.get("new_string", "")]
    for edit in tool_input.get("edits", []) or []:
        parts.append(edit.get("new_string", ""))
    return "\n".join(p for p in parts if p)
# </FUNC:motion_lint.extract_written_text_v1>


# [FUNC:motion_lint.main_v1]
def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    if payload.get("tool_name") not in ("Write", "Edit", "MultiEdit"):
        sys.exit(0)

    tool_input = payload.get("tool_input", {}) or {}
    path = Path(str(tool_input.get("file_path", "")))
    if path.suffix.lower() not in EXTENSIONS:
        sys.exit(0)
    # Собственные токены движения и сам rulebook описывают правила, а не нарушают их.
    if "ui-motion-craft" in path.as_posix() or path.name == "motion.css":
        sys.exit(0)

    text = extract_written_text(tool_input)
    if not text:
        sys.exit(0)

    found = [(name, fix) for pattern, name, fix in PATTERNS if pattern.search(text)]

    press_loss = find_press_feedback_loss(text, path)
    if press_loss:
        found.append((
            "потерян отклик нажатия (" + "; ".join(press_loss) + ")",
            "`transition` — шорткат: он сбрасывает список целиком, а компонент лежит в "
            "слое components и бьёт правило нажатия из base/motion.css (слой tokens). "
            "Масштаб :active останется, но отыграет мгновенно. Начать список с "
            "var(--transition-press): transition: var(--transition-press), color … . "
            "Подробности — в шапке styles/base/motion.css.",
        ))

    if not found:
        sys.exit(0)

    lines = [f"🎛 motion-lint: в {path.name} нарушены правила движения ({RULEBOOK}):", ""]
    lines += [f"• {name} — {fix}" for name, fix in found]
    lines += ["", "Исправить сейчас же, до перехода к следующему шагу."]
    reason = "\n".join(lines)

    print(json.dumps({
        "decision": "block",
        "reason": reason,
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": reason,
        },
    }, ensure_ascii=False))
    sys.exit(0)
# </FUNC:motion_lint.main_v1>


if __name__ == "__main__":
    main()
# </CONFIG:motion-lint>

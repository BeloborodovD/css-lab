---
_meta:
  type: pipeline-step
  pipeline: redesign-by-css-lab
  step: 3
  agent: dev-brand-identity, dev-css, dev-frontend, dev-web-animation
  export: false
---

# Шаг 03 — Пополнение библиотеки (library-first)

**Агенты (конвейером):** `dev-brand-identity` → `dev-css` → `dev-frontend` →
`dev-web-animation`. Выполняется **в репозитории css-lab**, не в целевом проекте.

**Вход:** записи `gap` и `new` из mapping.yaml (шаг 02).
**Выход:** новые/доработанные компоненты в css-lab, показанные на витрине,
покрытые e2e, закоммиченные и запушенные.

## Порядок на каждый новый компонент

1. **`dev-brand-identity`** — только если `proposal.tokens` содержит отсутствующие
   токены: добавить их в `styles/base/variables.css` (light + dark + перекрытия
   в трёх темах `styles/themes/`). Ни одного литерала в будущем компоненте.
2. **`dev-css`** — `styles/components/<block>.css` строго по proposal из
   mapping.yaml (BEM, состояния `is-*`, [BLOCK:] теги, скрытие панелей через
   visibility+opacity, hover за `@media (hover:hover)`), `@import` в
   `styles/core.css`. Для `gap` — доработка существующего файла компонента.
3. **`dev-frontend`** — секция на витрине `components.html` (образец + пункт в
   сайдбаре) и e2e-тест в `e2e/smoke.e2e.spec.ts`. Классы — строго из proposal.
4. **`dev-web-animation`** — движение компонента по
   `.claude/skills/ui-motion-craft/RULES.md`: только motion-токены, асимметрия
   enter/exit, transform-origin от триггера, reduced-motion мягче но не ноль.

Шаги 2–3 могут идти параллельно (файлы не пересекаются) при зафиксированном
контракте классов; 4 — после 2.

## Гейт

`loop-evaluator`: полный прогон `npx playwright test` зелёный, компонент виден на
витрине во всех трёх брендах и обеих темах, grep литералов чистый. При PASS
оркестратор коммитит css-lab (`feat(<block>): …`), пушит в Gitea+GitLab и только
после этого открывает шаг 04.

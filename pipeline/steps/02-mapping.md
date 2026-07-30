---
_meta:
  type: pipeline-step
  pipeline: redesign-by-css-lab
  step: 2
  agent: dev-css
  export: false
---

# Шаг 02 — Маппинг на библиотеку

**Агент:** `dev-css`.

**Вход:** `audit.yaml` (шаг 01), каталог `css-lab/styles/components-v3/`,
витрина `css-lab/components.html`.
**Выход:** `<target>/.claude/redesign/mapping.yaml`.

## Задача

Каждый элемент из аудита отнести к одной из трёх категорий:

| Категория | Значение | Дальше |
| --- | --- | --- |
| `exists` | Компонент css-lab покрывает элемент как есть | шаг 04 |
| `gap` | Компонент есть, но не хватает варианта/модификатора | шаг 03 (доработка компонента) |
| `new` | Аналога в библиотеке нет | шаг 03 (новый компонент) |

Для `exists` указать точный компонент и классы. Для `gap` — чего не хватает
(модификатор, размер, состояние). Для `new` — эскиз API компонента: имя блока по
BEM, элементы, состояния `is-*`, какие токены нужны.

## Формат mapping.yaml

```yaml
mapped:
  - element: <из audit.yaml>
    verdict: exists|gap|new
    component: components-v3/<file>.css   # для exists/gap
    classes: [<точные классы>]            # для exists
    missing: <чего не хватает>            # для gap
    proposal:                             # для new
      block: <bem-имя>
      elements: [__x, __y]
      states: [is-open, is-active]
      tokens: [<нужные --токены, вкл. отсутствующие>]
```

## Гейт

Ни одного элемента без вердикта. Списки `gap` + `new` — вход шага 03; если оба
пусты, оркестратор идёт сразу на шаг 04.

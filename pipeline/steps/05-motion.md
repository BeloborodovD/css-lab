---
_meta:
  type: pipeline-step
  pipeline: redesign-by-css-lab
  step: 5
  agent: dev-web-animation
  export: false
---

# Шаг 05 — Движение

**Агент:** `dev-web-animation`.

**Вход:** целевой проект после шага 04, `audit.yaml` (находки по движению),
скиллы `ui-motion-craft/RULES.md`, `find-animation-opportunities`,
`review-animations` (читать через Read).
**Выход:** движение целевого проекта на motion-токенах css-lab.

## Задача

1. Прогнать чек-лист RULES.md по всем перенесённым компонентам: только
   transform/opacity, кривые и длительности — токенами из `base/motion.css`,
   асимметрия enter/exit, transform-origin от триггера.
2. Убрать легаси-анимации целевого проекта, конфликтующие с контрактом
   (spring/bounce > 300ms, ease-in на появлении, transition: all).
3. По audit.yaml добавить недостающее движение ТОЛЬКО там, где оно несёт смысл
   (частотный гейт: частые действия — быстрые и тихие); где движение вредит —
   убрать.
4. `prefers-reduced-motion`: смягчение, не отключение (fade вместо slide).

## Гейт

Ревью собственного диффа по скиллу `review-animations`; ни одного хардкода
`cubic-bezier`/`ms` в компонентных стилях (grep). Спорные места — списком
оркестратору, не молча.

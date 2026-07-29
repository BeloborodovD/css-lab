---
name: ui-motion-craft
description: Обязательный свод правил движения и визуального ремесла для любого UI-кода — гейт «анимировать ли вообще», кривые и длительности, физика входа/выхода, прерываемость, производительность, доступность, токены. Use when writing or reviewing CSS, React components, transitions, animations, gestures, or design tokens; when an agent needs the exact cubic-bezier/duration/spring values instead of inventing them; when auditing an interface that feels sluggish or over-animated. TRIGGERS - анимация, движение, переход, микровзаимодействия, кривая, easing, motion tokens, CSS transition, Framer Motion, prefers-reduced-motion.
---

# UI Motion Craft

Единый свод правил движения для всех агентов воркспейса, чтобы интерфейсы разных проектов
ощущались одинаково выверенно.

## Что здесь

| Файл | Назначение |
| --- | --- |
| [RULES.md](RULES.md) | Свод правил с точными значениями. Читается перед написанием любого motion-кода |
| [tokens/motion.css](tokens/motion.css) | Готовый слой токенов: три кривые, четыре длительности, отклик на нажатие, reduced-motion |
| `LICENSE-emilkowalski` | MIT-лицензия источника |

## Порядок применения

1. Прочитать [RULES.md](RULES.md) целиком — значения оттуда копируются буквально,
   а не подбираются по памяти.
2. Скопировать [tokens/motion.css](tokens/motion.css) в проект и подключить первым в
   каскаде; хардкод `cubic-bezier`/`ms` в компонентах после этого — дефект.
3. Прогнать результат по чек-листу в конце RULES.md.

Соблюдение подкреплено хуком `.claude/hooks/motion-lint.py`: при записи CSS/TSX он
блокирует однозначные нарушения (`ease-in`, `transition: all`, `scale(0)`, анимация
layout-свойств, reduced-motion-рубильник) и возвращает готовую замену.

## Смежные скиллы

| Скилл | Когда |
| --- | --- |
| `emil-design-eng` | Глубокая проработка компонента, clip-path, жесты, принципы Sonner |
| `apple-design` | Жесты, пружины, передача скорости, материалы и полупрозрачность, типографика |
| `review-animations` | Строгое ревью конкретного диффа с анимациями |
| `improve-animations` | Аудит всего кодовой базы и планы исправлений для исполнителей |
| `find-animation-opportunities` | Поиск мест, где движения не хватает (и где оно вредно) |
| `animation-vocabulary` | Подобрать точное название эффекта |
| `pick-ui-library` | Выбор библиотеки под задачу вместо самописного тоста или диалога |
| `prototype` | Несколько вариантов одного UI с переключателем |

## Источник

Свод собран из скиллов Emil Kowalski (MIT, [github.com/emilkowalski/skills](https://github.com/emilkowalski/skills),
курс [animations.dev](https://animations.dev/)) и докладов Apple WWDC *Designing Fluid
Interfaces*. Оригинальные скиллы установлены рядом без изменений — RULES.md сводит их
обязательную часть в один короткий документ и разрешает противоречия в пользу источника.

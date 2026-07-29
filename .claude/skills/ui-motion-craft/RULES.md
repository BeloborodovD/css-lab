# Motion & UI Craft — Non-Negotiable Rules

Canonical rulebook for every agent that produces CSS, UI components, or animation code.
Values here are exact — **copy them, never approximate**. Derived from Emil Kowalski's
design-engineering philosophy (MIT, see `LICENSE-emilkowalski`) and Apple's *Designing
Fluid Interfaces*. Deeper material: `../emil-design-eng/SKILL.md`, `../apple-design/SKILL.md`.

## 0. The Gate — should this animate at all?

Answer before writing a single line of motion code.

| Frequency the user sees it | Verdict |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette, core nav) | **No animation. Ever.** |
| Tens of times/day (hover, list navigation, frequent toggles) | Remove, or near-imperceptible only |
| Occasional (modals, drawers, toasts, settings) | Standard animation |
| Rare / first-time (onboarding, empty state, success) | Delight budget lives here |

**Keyboard-initiated actions are never animated** — not a judgment call. Raycast has no
open/close animation; that is the correct experience.

Then name the purpose, in one of these words: **feedback**, **spatial consistency**,
**state indication**, **preventing a jarring change**, **explanation**, **delight**
(rare tier only). "It looks cool" is not a purpose — drop the animation.

## 1. Easing

```
Entering or exiting?      → ease-out
Moving/morphing on screen? → ease-in-out
Hover / color change?      → ease
Constant motion (marquee, progress)? → linear
Default                    → ease-out
```

**`ease-in` in UI is always a defect** — it delays the exact moment the user is watching,
which makes the whole interface feel sluggish. This includes exit animations: an exit uses
`ease-out`, not `ease-in`.

Built-in CSS curves are too weak. Use these tokens (`tokens/motion.css`):

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);     /* UI enter/exit */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer/sheet */
```

## 2. Duration — UI stays under 300ms

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

Asymmetric timing: the deliberate phase is slow (hold-to-delete 2s linear), the system's
response snaps (200ms ease-out). Symmetric press/release timing is a defect.

## 3. Physicality & origin

- **Never `scale(0)`.** Nothing in the real world appears from nothing. Enter from
  `scale(0.95)` (range 0.9–0.97) + `opacity: 0`.
- **Popovers, dropdowns, tooltips, menus scale from their trigger** —
  `transform-origin: var(--transform-origin)` (Base UI), not `center`.
  **Modals are exempt**: they are not trigger-anchored, `center` is correct there.
- **Every pressable element gets press feedback**: `:active { transform: scale(0.97) }`
  with `transition: transform 160ms var(--ease-out)`. Subtle range: 0.95–0.98.
- **Enter and exit along the same path.** A panel that slides in from the right dismisses
  to the right. A toast enters and exits the same edge — that is what makes
  swipe-to-dismiss feel intuitive.
- Use **percentage translates** (`translateY(100%)` = the element's own height), never
  hardcoded pixel offsets.

## 4. Interruptibility

CSS **transitions** retarget from the current state mid-flight; **`@keyframes` restart from
zero**. Anything triggered rapidly or reversible (toasts stacking, toggles, drags,
expand/collapse) must use transitions or springs — never keyframes.

- Entry without JS: `@starting-style` (legacy fallback: `data-mounted` set in `useEffect`).
- Gesture-driven motion uses springs; they carry velocity through an interruption.
- Spring config, Apple-style: `{ type: "spring", duration: 0.5, bounce: 0.2 }`.
  Bounce stays 0.1–0.3, and only where the gesture carried momentum (a flick, a drag
  release). Default UI springs have **no** bounce.
- Always animate from the **presentation (current on-screen) value**, never the target
  value — otherwise an interrupt visibly jumps.
- Dismiss a drag by **velocity**, not distance alone: `Math.abs(distance) / elapsedMs > 0.11`.
- At a boundary, apply rising friction (rubber-banding), never a hard stop.

## 5. Performance

- **Animate `transform` and `opacity` only.** `width`/`height`/`margin`/`padding`/`top`/
  `left` trigger layout + paint + composite.
- **`transition: all` is always a defect** — name the exact properties.
- **Framer Motion `x` / `y` / `scale` shorthands are not hardware-accelerated** (they run on
  the main thread and drop frames under load). Use the full transform string:
  `animate={{ transform: "translateX(100px)" }}`.
- Never drive child transforms via a CSS variable on the parent — it recalculates styles
  for every child. Set `transform` on the element itself.
- CSS and WAAPI beat rAF-based JS under load: CSS for predetermined motion, JS/springs for
  dynamic and gesture-driven motion.
- Transition-time `filter: blur()` stays under 20px (expensive, especially in Safari).

## 6. Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .element { transition: opacity 200ms ease; transform: none; }
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); }
}
```

- Reduced motion means **gentler, not zero**. Keep opacity/colour transitions that aid
  comprehension; drop movement, parallax and overshoot. A blanket
  `animation-duration: 0.01ms !important` reset is a defect — it destroys feedback.
- Gate every hover animation behind `@media (hover: hover) and (pointer: fine)` — touch
  devices fire hover on tap.
- Also honour `prefers-reduced-transparency: reduce` (frostier/solid surfaces, no blur) and
  `prefers-contrast: more` (near-solid backgrounds, defined border).
- No flashing above 3 Hz. Motion must never be the only carrier of information.

## 7. Cohesion & tokens

- Curves and durations live as **shared tokens**, never hand-typed per component. Five
  near-identical cubic-beziers is a consolidation defect.
- Motion matches the product's personality: a crisp dashboard stays fast and quiet, a
  playful consumer app can be bouncier. One bouncy component in a crisp app is a defect.
- Group entrances get a **30–80ms stagger**, never everything at once. Stagger is
  decorative and must never block interaction.
- A crossfade that visibly double-exposes can be masked with `filter: blur(2px)` during
  the transition.

## 8. Visual craft (not motion, still mandatory)

- Semi-transparent shadows and rings over solid 1px borders for elevation.
- Type: tracking is size-specific — tighten large text (`letter-spacing: -0.02em`), body
  near `0`; line-height tight on headings, looser on body. Never one tracking value for
  all sizes.
- Translucent chrome (`backdrop-filter: blur()` + semi-transparent background) with content
  scrolling underneath, rather than opaque bars. Never stack two light translucent surfaces.
- Every spacing, timing and alignment value is a deliberate choice you can defend.

## Self-check before delivering

- [ ] Frequency gate passed; keyboard-initiated actions unanimated
- [ ] Purpose named for each animation (`/* PURPOSE: … */` in code)
- [ ] No `ease-in`, no `transition: all`, no `scale(0)`, no animated layout properties
- [ ] Duration inside budget; enter/exit paths symmetric
- [ ] Trigger-anchored surfaces use `transform-origin: var(--transform-origin)`
- [ ] Rapidly-triggered UI uses transitions/springs, not keyframes
- [ ] `prefers-reduced-motion` handled gently; hover gated behind `hover: hover`
- [ ] Curves/durations come from tokens, not literals

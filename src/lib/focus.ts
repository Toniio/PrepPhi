/**
 * Focus ring presets.
 *
 * Every focusable element in the design system draws the same ring. Before
 * this file there were sixteen distinct patterns across twenty-one components,
 * and two of them drew nothing at all: `ring-focus` was never a real Tailwind
 * utility — `--ring-*` is not a v4 theme namespace for widths — so the class
 * emitted no CSS and the elements using it had no visible focus indicator.
 *
 * The width comes from `--space-focus-ring-width`, the token the system
 * already declared. `ring-(length:…)` is the v4 form that reads a custom
 * property as a length; `ring-1`, `ring-2` and `ring-3` are raw pixel widths
 * and are forbidden by the repository's first rule.
 */

/**
 * Ring thickness alone. Use directly only when the element supplies its own
 * ring color — Sidebar does, through `ring-sidebar-ring`. Everywhere else
 * prefer FOCUS_RING, which carries the color too.
 */
export const FOCUS_RING_WIDTH =
  "focus-visible:ring-(length:--space-focus-ring-width)"

/** Ring drawn by every focusable element. */
export const FOCUS_RING = `focus-visible:border-ring ${FOCUS_RING_WIDTH} focus-visible:ring-ring/50`

/**
 * Color override for elements in an invalid or destructive state. Compose it
 * after FOCUS_RING: the width stays shared, only the color changes.
 */
export const FOCUS_RING_DESTRUCTIVE =
  "focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"

/**
 * Same ring, drawn when a descendant control takes focus rather than the
 * element itself — used by wrappers such as InputGroup.
 */
export const FOCUS_RING_WITHIN =
  "focus-within:border-ring focus-within:ring-(length:--space-focus-ring-width) focus-within:ring-ring/50"

/**
 * Suppresses the native outline. Prefer this over `outline-none`, which drops
 * the outline in forced-colors mode where box-shadow rings are not painted,
 * leaving no indicator at all. Both set `--tw-outline-style` to none, which is
 * what silently disabled ScrollArea's and NavigationMenu's own `outline-1`: an
 * element that resets its outline and draws one at focus adds `outline-solid`.
 */
export const FOCUS_OUTLINE_RESET = "outline-hidden"

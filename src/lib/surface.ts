/**
 * Outline widths for surfaces drawn with a ring rather than a border.
 *
 * Cards, menus, popovers and dialogs are outlined with a `box-shadow` ring:
 * unlike a `border`, a ring takes no layout space, so the content box and the
 * overflow clipping stay the same whatever the outline. Tailwind compiles
 * `ring-1` and a bare `ring` to a fixed `1px`, though, while `border` reads
 * `--border-width-default`: change the token and fields follow, surfaces do
 * not. `ring-(length:…)` reads the token instead.
 *
 * Only the width lives here; each component keeps its ring color. A width
 * under a variant (`group-data-[…]:`, `*:`) is written out at the call site
 * with the same `ring-(length:…)` form. lint-raw-values rejects `ring-<n>` and
 * a bare `ring` everywhere.
 */

/** Width of the outline around a surface: Card, Popover, menus, dialogs. */
export const SURFACE_OUTLINE = "ring-(length:--border-width-default)"

/**
 * Width of the background-colored ring that cuts an element out from the one
 * it overlaps: stacked avatars, an avatar's badge.
 */
export const SEPARATION_RING = "ring-(length:--border-width-separation)"

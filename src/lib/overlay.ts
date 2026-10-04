import { SURFACE_OUTLINE } from "@/lib/surface"

/**
 * Class bases shared by the modal surfaces.
 *
 * Dialog, AlertDialog, Sheet and Drawer each wrote their overlay out in full,
 * and the copies had already drifted: only Dialog isolates its overlay, Drawer
 * lost `duration-fast`, and Sheet sets a text size on a backdrop that holds no
 * text. A fix applied to one copy is forgotten in the others; a base exists in
 * one place.
 *
 * Each base holds only what every consumer shares. What a component adds on
 * top stays in the component, next to the reason for it — including the
 * outline reset, whose `focus-managed:` justification lint-focus-ring checks
 * at the call site.
 */

/** The backdrop behind a modal surface: a static-black scrim that fades. */
export const OVERLAY_BASE =
  "fixed inset-0 z-modal bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"

/** A surface centered in the viewport that zooms in: Dialog, AlertDialog. */
export const MODAL_CONTENT_BASE = `fixed top-1/2 left-1/2 z-modal grid w-full -translate-x-1/2 -translate-y-1/2 gap-4 rounded-none bg-popover p-4 text-popover-foreground ${SURFACE_OUTLINE} ring-foreground/10 duration-fast data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`

/** A panel pinned to one edge of the viewport: Sheet, Drawer. */
export const SIDE_PANEL_CONTENT_BASE =
  "fixed z-modal flex flex-col bg-popover text-xs/relaxed text-popover-foreground"

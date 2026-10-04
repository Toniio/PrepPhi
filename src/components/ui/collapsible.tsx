import { Collapsible as CollapsiblePrimitive } from "radix-ui"

import type { ComponentProps } from "react"
/**
 * The root of a single disclosure that shows or hides one section; use `Accordion` when several sections belong together.
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>Show advanced options</CollapsibleTrigger>
 *   <CollapsibleContent>Choose how often we sync your data.</CollapsibleContent>
 * </Collapsible>
 */
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/**
 * The control that opens and closes its `Collapsible`; Radix sets `aria-expanded`, so do not manage it yourself.
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>Show details</CollapsibleTrigger>
 *   <CollapsibleContent>Your export is ready to download.</CollapsibleContent>
 * </Collapsible>
 */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

/**
 * The section a `CollapsibleTrigger` reveals; keep out of it anything the page needs to be understood at a glance.
 *
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>More options</CollapsibleTrigger>
 *   <CollapsibleContent>Send me a summary every Monday.</CollapsibleContent>
 * </Collapsible>
 */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }

export type CollapsibleProps = ComponentProps<typeof Collapsible>
export type CollapsibleContentProps = ComponentProps<typeof CollapsibleContent>
export type CollapsibleTriggerProps = ComponentProps<typeof CollapsibleTrigger>

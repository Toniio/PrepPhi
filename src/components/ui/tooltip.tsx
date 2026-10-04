"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Sets the shared hover delay for every `Tooltip` below it; mount it once high in the tree, such as the root layout.
 *
 * @example
 * <TooltipProvider delayDuration={300}>
 *   <App />
 * </TooltipProvider>
 */
function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

/**
 * A small label that appears when its trigger is hovered or focused, to name an icon button or show a shortcut.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button size="icon" aria-label="Copy link">
 *       <CopyIcon />
 *     </Button>
 *   </TooltipTrigger>
 *   <TooltipContent>Copy link</TooltipContent>
 * </Tooltip>
 */
function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

/**
 * The element that shows its `Tooltip` on hover or focus; use `asChild` to keep your own button or link.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger asChild>
 *     <Button variant="ghost">Help</Button>
 *   </TooltipTrigger>
 *   <TooltipContent>Open the help center</TooltipContent>
 * </Tooltip>
 */
function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/**
 * The one-line text bubble of a `Tooltip`, which carries no interactive element.
 *
 * @example
 * <Tooltip>
 *   <TooltipTrigger>Plan</TooltipTrigger>
 *   <TooltipContent>Your plan renews on the first of each month.</TooltipContent>
 * </Tooltip>
 */
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-tooltip inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-none bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-tooltip **:data-[slot=kbd]:rounded-none data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=instant-open]:animate-in data-[state=instant-open]:fade-in-0 data-[state=instant-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {/* allow-raw: subpixel-offset — translate-y calc compensates for arrow rotation alignment, no token equivalent */}
        <TooltipPrimitive.Arrow className="z-tooltip size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-none bg-foreground fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }

export type TooltipProps = React.ComponentProps<typeof Tooltip>
export type TooltipContentProps = React.ComponentProps<typeof TooltipContent>
export type TooltipProviderProps = React.ComponentProps<typeof TooltipProvider>
export type TooltipTriggerProps = React.ComponentProps<typeof TooltipTrigger>

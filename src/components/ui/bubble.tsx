import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Stacks the consecutive bubbles of one turn in a column, inside a `MessageContent`.
 *
 * @example
 * <MessageContent>
 *   <BubbleGroup>
 *     <Bubble>
 *       <BubbleContent>Here is the summary you asked for.</BubbleContent>
 *     </Bubble>
 *     <Bubble>
 *       <BubbleContent>I can also turn it into a checklist.</BubbleContent>
 *     </Bubble>
 *   </BubbleGroup>
 * </MessageContent>
 */
function BubbleGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bubble-group"
      className={cn("flex min-w-0 flex-col gap-2", className)}
      {...props}
    />
  )
}

// A BubbleContent rendered as a button or a link (asChild) takes the hover of
// its variant; a plain one is text and does not react.
/**
 * Returns the classes of a `Bubble` frame for a `variant`, for an element that has to look like a bubble without being one.
 *
 * @example
 * <div data-slot="bubble" className={bubbleVariants({ variant: "secondary" })}>
 *   <div data-slot="bubble-content">Your export is ready.</div>
 * </div>
 */
const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-4/5 min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default:
          "*:data-[slot=bubble-content]:bg-primary *:data-[slot=bubble-content]:text-primary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary-hover",
        secondary:
          "*:data-[slot=bubble-content]:bg-secondary *:data-[slot=bubble-content]:text-secondary-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-secondary-hover",
        muted:
          "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-secondary-hover",
        tinted:
          "*:data-[slot=bubble-content]:bg-primary/10 *:data-[slot=bubble-content]:text-foreground dark:*:data-[slot=bubble-content]:bg-primary/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-primary-tint-hover",
        outline:
          "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-overlay-hover",
        ghost:
          "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-overlay-hover",
        destructive:
          "*:data-[slot=bubble-content]:bg-destructive/10 *:data-[slot=bubble-content]:text-destructive dark:*:data-[slot=bubble-content]:bg-destructive/20 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive-hover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Frames one bubble of a turn and sets, through `variant`, which side of the conversation it speaks for.
 *
 * @example
 * <Bubble variant="secondary">
 *   <BubbleContent>Your export is ready to download.</BubbleContent>
 * </Bubble>
 */
function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof bubbleVariants> & {
    align?: "start" | "end"
  }) {
  return (
    <div
      data-slot="bubble"
      data-variant={variant}
      data-align={align}
      className={cn(bubbleVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * Holds the text of a `Bubble` and takes its variant colors; use `asChild` to make the bubble a button or a link.
 *
 * @example
 * <Bubble variant="muted">
 *   <BubbleContent asChild>
 *     <button type="button">Retry sending</button>
 *   </BubbleContent>
 * </Bubble>
 */
function BubbleContent({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="bubble-content"
      className={cn(
        "w-fit max-w-full min-w-0 overflow-hidden rounded-none border border-transparent px-2.5 py-2 text-xs leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:outline-hidden [button,a]:transition-colors [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-(length:--space-focus-ring-width) [button,a]:focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

// The ring cuts the reactions out of the bubble they overlap: the color of the
// surface the conversation sits on, at the width of the focus ring — the
// design system's only ring width, where shadcn/ui draws a raw ring-2.
/**
 * Returns the classes that pin a reactions bar to a `side` and an `align` of its bubble, for a custom reactions element.
 *
 * @example
 * <div data-slot="bubble-reactions" className={bubbleReactionsVariants({ side: "top", align: "start" })}>
 *   👍 3
 * </div>
 */
const bubbleReactionsVariants = cva(
  // allow-raw: local-stacking — z-10 lifts the reactions over the bubble they overlap
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-none bg-muted px-1.5 py-0.5 text-xs ring-(length:--border-width-separation) ring-card has-[button]:p-0",
  {
    variants: {
      side: {
        top: "top-0 -translate-y-3/4",
        bottom: "bottom-0 translate-y-3/4",
      },
      align: {
        start: "left-3",
        end: "right-3",
      },
    },
    defaultVariants: {
      side: "bottom",
      align: "end",
    },
  }
)

/**
 * Pins emoji reactions or a count to an edge of a `Bubble`, five at most.
 *
 * @example
 * <Bubble>
 *   <BubbleContent>Lunch at noon?</BubbleContent>
 *   <BubbleReactions side="bottom" align="end">
 *     👍 3
 *   </BubbleReactions>
 * </Bubble>
 */
function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "end"
  side?: "top" | "bottom"
}) {
  return (
    <div
      data-slot="bubble-reactions"
      data-align={align}
      data-side={side}
      className={cn(bubbleReactionsVariants({ side, align }), className)}
      {...props}
    />
  )
}

export { BubbleGroup, Bubble, BubbleContent, BubbleReactions }

export type BubbleProps = React.ComponentProps<typeof Bubble>
export type BubbleContentProps = React.ComponentProps<typeof BubbleContent>
export type BubbleGroupProps = React.ComponentProps<typeof BubbleGroup>
export type BubbleReactionsProps = React.ComponentProps<typeof BubbleReactions>

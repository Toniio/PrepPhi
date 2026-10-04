import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Returns the class names of a `Marker` line, to give another element the plain, separator or border look.
 *
 * @example
 * <div className={markerVariants({ variant: "border" })}>Conversation resumed</div>
 */
const markerVariants = cva(
  "group/marker relative flex min-h-4 w-full items-center gap-2 text-left text-xs text-muted-foreground [&_svg:not([class*='size-'])]:size-3.5 [a]:underline [a]:underline-offset-3 [a]:hover:text-foreground",
  {
    variants: {
      variant: {
        default: "",
        separator:
          "before:mr-1 before:h-px before:min-w-0 before:flex-1 before:bg-border after:ml-1 after:h-px after:min-w-0 after:flex-1 after:bg-border",
        border: "border-b border-border pb-2",
      },
    },
  }
)

/**
 * A muted line that marks an event in a conversation, such as a date or a resumed session; `variant` picks the plain, separator or border line.
 *
 * @example
 * <Marker variant="separator">
 *   <MarkerContent>Today</MarkerContent>
 * </Marker>
 */
function Marker({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof markerVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="marker"
      data-variant={variant}
      className={cn(markerVariants({ variant, className }))}
      {...props}
    />
  )
}

/**
 * A Phosphor icon placed before the `MarkerContent`, hidden from screen readers because the text carries the meaning.
 *
 * @example
 * <Marker>
 *   <MarkerIcon>
 *     <MagnifyingGlassIcon />
 *   </MarkerIcon>
 *   <MarkerContent>Searched 4 sources</MarkerContent>
 * </Marker>
 */
function MarkerIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="marker-icon"
      aria-hidden="true"
      className={cn(
        "size-3.5 shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

/**
 * The one-line text of a `Marker`, and the only part a screen reader announces.
 *
 * @example
 * <Marker>
 *   <MarkerContent>Conversation resumed</MarkerContent>
 * </Marker>
 */
function MarkerContent({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="marker-content"
      className={cn(
        "min-w-0 wrap-break-word group-data-[variant=separator]/marker:flex-none group-data-[variant=separator]/marker:text-center *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Marker, MarkerIcon, MarkerContent, markerVariants }

export type MarkerProps = React.ComponentProps<typeof Marker>
export type MarkerContentProps = React.ComponentProps<typeof MarkerContent>
export type MarkerIconProps = React.ComponentProps<typeof MarkerIcon>

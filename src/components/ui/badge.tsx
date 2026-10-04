import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_RING, FOCUS_RING_DESTRUCTIVE } from "@/lib/focus"

/**
 * The classes of a `Badge` for a `variant`, to give another element the same look.
 *
 * @example
 * <a href="/changelog" className={badgeVariants({ variant: "secondary" })}>What's new</a>
 */
const badgeVariants = cva(
  `group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all ${FOCUS_RING} has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!`,
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [a]:hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary-hover",
        destructive: `bg-destructive/10 text-destructive ${FOCUS_RING_DESTRUCTIVE} focus-visible:outline-(length:--border-width-default) focus-visible:outline-destructive focus-visible:outline-solid dark:bg-destructive/20 [a]:hover:bg-destructive-hover`,
        success:
          "bg-success/10 text-success dark:bg-success/20 [a]:hover:bg-success-hover",
        warning:
          "bg-warning/10 text-warning dark:bg-warning/20 [a]:hover:bg-warning-hover",
        info: "bg-info/10 text-info dark:bg-info/20 [a]:hover:bg-info-hover",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-overlay-hover",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * A compact label that marks the status or category of an element; use `variant` to say what kind of status it is.
 *
 * @example
 * <Badge variant="success">Paid</Badge>
 */
function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

export type BadgeProps = React.ComponentProps<typeof Badge>

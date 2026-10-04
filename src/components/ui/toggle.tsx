import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/**
 * Use `toggleVariants` to give another element the `Toggle` look, as `ToggleGroup` does for its items.
 *
 * @example
 * <button className={toggleVariants({ variant: "outline", size: "sm" })}>Bold</button>
 */
const toggleVariants = cva(
  `group/toggle inline-flex items-center justify-center gap-1 rounded-none text-xs font-medium whitespace-nowrap transition-all ${FOCUS_OUTLINE_RESET} hover:bg-muted hover:text-foreground ${FOCUS_RING} disabled:pointer-events-none disabled:opacity-disabled aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid aria-pressed:border-foreground aria-pressed:bg-muted data-[state=on]:border-foreground data-[state=on]:bg-muted dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-transparent focus-visible:border-transparent focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid",
        outline:
          "border border-input bg-transparent hover:bg-muted focus-visible:aria-pressed:border-ring focus-visible:data-[state=on]:border-ring",
      },
      size: {
        default:
          "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-7 min-w-7 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
        lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * A button that switches one option on or off while the user works, such as bold text or a filter.
 *
 * @example
 * <Toggle aria-label="Bold" variant="outline">
 *   <TextBIcon />
 * </Toggle>
 */
function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }

export type ToggleProps = React.ComponentProps<typeof Toggle>

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/**
 * A two-state control for a setting whose effect is immediate; pair it with a visible `Label`.
 *
 * @example
 * <div className="flex items-center gap-2">
 *   <Switch id="notifications" defaultChecked />
 *   <Label htmlFor="notifications">Email notifications</Label>
 * </div>
 */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        `peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all ${FOCUS_OUTLINE_RESET} after:absolute after:-inset-x-3 after:-inset-y-2 group-has-[>[data-slot=field]]/field-label:focus-visible:ring-0 group-has-[>[data-slot=field]]/field-label:focus-visible:not-aria-invalid:border-transparent ${FOCUS_RING} aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid data-[size=default]:h-5 data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-disabled`,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground" /* allow-raw: subpixel-offset — translate-x calc(100%-2px) compensates for thumb border inset, no token equivalent */
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

export type SwitchProps = React.ComponentProps<typeof Switch>

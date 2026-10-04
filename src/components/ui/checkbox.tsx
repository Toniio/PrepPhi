"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { CheckIcon, MinusIcon } from "@phosphor-icons/react"

/**
 * A two-state or indeterminate choice in a form; pair it with a visible label and never use it for mutually exclusive options.
 *
 * @example
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Accept the terms of use</Label>
 * </div>
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        `group/checkbox peer relative flex size-4 shrink-0 items-center justify-center rounded-none border border-input transition-colors ${FOCUS_OUTLINE_RESET} group-has-[[data-slot=checkbox]:disabled]/field:opacity-disabled after:absolute after:-inset-x-3 after:-inset-y-2 group-has-[>[data-slot=field]]/field-label:focus-visible:ring-0 group-has-[>[data-slot=field]]/field-label:focus-visible:data-[state=indeterminate]:border-primary group-has-[>[data-slot=field]]/field-label:focus-visible:data-checked:border-primary group-has-[>[data-slot=field]]/field-label:focus-visible:not-aria-invalid:data-unchecked:border-input ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-disabled aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid aria-invalid:aria-checked:border-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground focus-visible:data-[state=indeterminate]:border-ring aria-invalid:data-[state=indeterminate]:border-primary dark:bg-input-fill/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:aria-checked:border-primary dark:data-[state=indeterminate]:bg-primary dark:aria-invalid:data-[state=indeterminate]:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary`,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon className="group-data-[state=indeterminate]/checkbox:hidden" />
        <MinusIcon className="hidden group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

export type CheckboxProps = React.ComponentProps<typeof Checkbox>

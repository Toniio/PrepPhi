import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/**
 * A set of radio buttons for picking exactly one of two to five options, all visible at once; use `Select` beyond that.
 *
 * @example
 * <RadioGroup defaultValue="standard">
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="standard" id="standard" />
 *     <Label htmlFor="standard">Standard delivery</Label>
 *   </div>
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="express" id="express" />
 *     <Label htmlFor="express">Express delivery</Label>
 *   </div>
 * </RadioGroup>
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

/**
 * One option of a `RadioGroup`, identified by its `value`; tie it to a `Label` so its name is announced.
 *
 * @example
 * <RadioGroup defaultValue="monthly">
 *   <div className="flex items-center gap-2">
 *     <RadioGroupItem value="monthly" id="monthly" />
 *     <Label htmlFor="monthly">Billed monthly</Label>
 *   </div>
 * </RadioGroup>
 */
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        `group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input ${FOCUS_OUTLINE_RESET} after:absolute after:-inset-x-3 after:-inset-y-2 group-has-[>[data-slot=field]]/field-label:focus-visible:ring-0 group-has-[>[data-slot=field]]/field-label:focus-visible:data-checked:border-primary group-has-[>[data-slot=field]]/field-label:focus-visible:not-aria-invalid:data-unchecked:border-input ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-disabled aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid aria-invalid:aria-checked:border-primary dark:bg-input-fill/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:aria-checked:border-primary data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary`,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }

export type RadioGroupProps = React.ComponentProps<typeof RadioGroup>
export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupItem>

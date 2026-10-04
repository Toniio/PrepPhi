import * as React from "react"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { CaretDownIcon } from "@phosphor-icons/react"

export type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

/**
 * The browser's own dropdown, the light choice for picking one value out of a short list, especially below `md`.
 *
 * @example
 * <NativeSelect aria-label="Country" defaultValue="">
 *   <NativeSelectOption value="">Select a country</NativeSelectOption>
 *   <NativeSelectOption value="fr">France</NativeSelectOption>
 *   <NativeSelectOption value="us">United States</NativeSelectOption>
 * </NativeSelect>
 */
function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-disabled",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={`h-8 w-full min-w-0 appearance-none rounded-none border border-input bg-transparent py-1 pr-8 pl-2.5 text-xs transition-colors ${FOCUS_OUTLINE_RESET} select-none selection:bg-primary selection:text-primary-foreground has-[option[value='']:checked]:text-muted-foreground ${FOCUS_RING} disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid data-[size=sm]:h-7 data-[size=sm]:rounded-none data-[size=sm]:py-0.5 dark:bg-input-fill/30 dark:hover:bg-overlay-hover dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40`}
        {...props}
      />
      <CaretDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  )
}

/**
 * One choice of a `NativeSelect`; an empty `value` makes it the placeholder.
 *
 * @example
 * <NativeSelect aria-label="Role">
 *   <NativeSelectOption value="">Select a role</NativeSelectOption>
 *   <NativeSelectOption value="editor">Editor</NativeSelectOption>
 * </NativeSelect>
 */
function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      /* allow-raw: css-system-color — Canvas/CanvasText are CSS system color keywords required for native <option> rendering */
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

/**
 * Groups related `NativeSelectOption`s under a label inside a `NativeSelect`.
 *
 * @example
 * <NativeSelect aria-label="Time zone">
 *   <NativeSelectOptGroup label="Europe">
 *     <NativeSelectOption value="paris">Paris</NativeSelectOption>
 *   </NativeSelectOptGroup>
 * </NativeSelect>
 */
function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      /* allow-raw: css-system-color — Canvas/CanvasText are CSS system color keywords required for native <optgroup> rendering */
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }

export type NativeSelectOptGroupProps = React.ComponentProps<
  typeof NativeSelectOptGroup
>
export type NativeSelectOptionProps = React.ComponentProps<
  typeof NativeSelectOption
>

import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_RING_WIDTH } from "@/lib/focus"

/**
 * Picks a number, or a range with two values, between `min` and `max`; always name it and name each thumb of a range.
 *
 * @example
 * <Slider
 *   defaultValue={[20, 80]}
 *   min={0}
 *   max={100}
 *   step={5}
 *   aria-label="Price range"
 *   thumbLabels={["Minimum price", "Maximum price"]}
 * />
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabels,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & {
  /** Accessible name of each thumb, in value order. */
  thumbLabels?: string[]
}) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )
  // The thumbs are the focusable role="slider" elements; the root is a span
  // with no role, so a name left on it is announced by nothing. One thumb:
  // the Slider's name is the thumb's. Several: it names the group, and each
  // thumb takes its thumbLabels entry, else Radix's own ("Minimum"…).
  const single = _values.length === 1

  return (
    <SliderPrimitive.Root
      role={single ? undefined : "group"}
      aria-label={single ? undefined : ariaLabel}
      aria-labelledby={single ? undefined : ariaLabelledBy}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-disabled data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-none bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          {...thumbName(
            thumbLabels?.[index],
            single,
            ariaLabel,
            ariaLabelledBy
          )}
          className={`relative block size-3 shrink-0 rounded-none border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-(length:--space-focus-ring-width) ${FOCUS_RING_WIDTH} focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid active:ring-(length:--space-focus-ring-width) disabled:pointer-events-none disabled:opacity-disabled`}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

// Only the attributes that carry a name: Radix spreads the thumb's props over
// its own, so an explicit aria-label={undefined} would erase Radix's default.
function thumbName(
  thumbLabel: string | undefined,
  single: boolean,
  ariaLabel: string | undefined,
  ariaLabelledBy: string | undefined
) {
  if (thumbLabel) return { "aria-label": thumbLabel }
  if (!single) return {}
  if (ariaLabel) return { "aria-label": ariaLabel }
  if (ariaLabelledBy) return { "aria-labelledby": ariaLabelledBy }
  return {}
}

export { Slider }

export type SliderProps = React.ComponentProps<typeof Slider>

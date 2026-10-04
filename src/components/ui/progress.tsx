"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * A linear bar that shows how far a task has gone; `value` runs from 0 to 100, and it needs an `aria-label` for its name.
 *
 * @example
 * <Progress value={66} aria-label="Upload progress" />
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-none bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

export type ProgressProps = React.ComponentProps<typeof Progress>

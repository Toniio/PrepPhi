"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Names a form control through `htmlFor`; every field needs a visible one, a `placeholder` does not replace it.
 *
 * @example
 * <>
 *   <Label htmlFor="name">Full name</Label>
 *   <Input id="name" />
 * </>
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-xs leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-disabled peer-disabled:cursor-not-allowed peer-disabled:opacity-disabled",
        className
      )}
      {...props}
    />
  )
}

export { Label }

export type LabelProps = React.ComponentProps<typeof Label>

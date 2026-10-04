"use client"

import { AspectRatio as AspectRatioPrimitive } from "radix-ui"

import type { ComponentProps } from "react"
/**
 * Locks a single media child, such as an image, video or map, to a fixed width-to-height `ratio` so the layout does not shift as it loads.
 *
 * @example
 * <AspectRatio ratio={16 / 9}>
 *   <img src="/cover.jpg" alt="A mountain lake at sunrise" className="size-full object-cover" />
 * </AspectRatio>
 */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }

export type AspectRatioProps = ComponentProps<typeof AspectRatio>

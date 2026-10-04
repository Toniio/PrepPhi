import { cn } from "@/lib/utils"

import type { ComponentProps } from "react"
/**
 * A loading placeholder that holds the place of content to come; size it to the final content so nothing shifts on arrival.
 *
 * @example
 * <div className="flex items-center gap-3">
 *   <Skeleton className="size-10" />
 *   <Skeleton className="h-4 w-48" />
 * </div>
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

export type SkeletonProps = ComponentProps<typeof Skeleton>

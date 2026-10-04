import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * A thin rule that divides two groups of content; keep `decorative` unless the division carries meaning.
 *
 * @example
 * <Card>
 *   <CardContent>Account details</CardContent>
 *   <Separator />
 *   <CardContent>Billing details</CardContent>
 * </Card>
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

export type SeparatorProps = React.ComponentProps<typeof Separator>

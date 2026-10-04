import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

import type { ComponentProps } from "react"
/**
 * The classes that merge the borders and corners of adjacent controls for an `orientation`, to join the children of another container.
 *
 * @example
 * <div role="group" className={buttonGroupVariants({ orientation: "vertical" })}>
 *   <Button variant="outline">Zoom in</Button>
 *   <Button variant="outline">Zoom out</Button>
 * </div>
 */
const buttonGroupVariants = cva(
  "group/button-group flex w-fit items-stretch rounded-none *:focus-visible:relative *:focus-visible:z-dropdown has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-none [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        vertical:
          "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

/**
 * Joins related buttons, inputs or selects into one control; set `orientation="vertical"` to stack them in a column.
 *
 * @example
 * <ButtonGroup>
 *   <Button variant="outline">Previous</Button>
 *   <Button variant="outline">Next</Button>
 * </ButtonGroup>
 */
function ButtonGroup({
  className,
  orientation,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    />
  )
}

/**
 * A static label joined to the controls of a group, such as a prefix or a unit next to an input.
 *
 * @example
 * <ButtonGroup>
 *   <ButtonGroupText>https://</ButtonGroupText>
 *   <Input placeholder="example.com" />
 * </ButtonGroup>
 */
function ButtonGroupText({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="button-group-text"
      className={cn(
        "flex items-center gap-2 rounded-none border bg-muted px-2.5 text-xs font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * A divider that splits a button group into sub-groups of related actions.
 *
 * @example
 * <ButtonGroup>
 *   <Button variant="secondary">Archive</Button>
 *   <ButtonGroupSeparator />
 *   <Button variant="secondary">Report</Button>
 * </ButtonGroup>
 */
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "relative self-stretch bg-input-fill data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}

export type ButtonGroupProps = ComponentProps<typeof ButtonGroup>
export type ButtonGroupSeparatorProps = ComponentProps<
  typeof ButtonGroupSeparator
>
export type ButtonGroupTextProps = ComponentProps<typeof ButtonGroupText>

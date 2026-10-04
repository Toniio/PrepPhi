import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { Separator } from "@/components/ui/separator"

/**
 * The list container for several `Item`s; it gives each direct `Item` child the list item role.
 *
 * @example
 * <ItemGroup>
 *   <Item>
 *     <ItemContent>
 *       <ItemTitle>Ada Lovelace</ItemTitle>
 *     </ItemContent>
 *   </Item>
 *   <ItemSeparator />
 *   <Item>
 *     <ItemContent>
 *       <ItemTitle>Grace Hopper</ItemTitle>
 *     </ItemContent>
 *   </Item>
 * </ItemGroup>
 */
function ItemGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn(
        "group/item-group flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2",
        className
      )}
      {...props}
    >
      {React.Children.map(children, asListItem)}
    </div>
  )
}

// A direct Item child of an ItemGroup becomes a list item, unless it has an
// explicit role. Rendered through asChild (link, button), it keeps its native
// role: a wrapper carries listitem instead.
function asListItem(child: React.ReactNode) {
  if (!React.isValidElement<ItemProps>(child) || child.type !== Item) {
    return child
  }
  if (child.props.role) return child
  if (child.props.asChild) return <div role="listitem">{child}</div>
  return React.cloneElement(child, { role: "listitem" })
}

/**
 * A horizontal rule between two `Item`s of an `ItemGroup` that marks where one entry ends.
 *
 * @example
 * <ItemGroup>
 *   <Item>
 *     <ItemContent>
 *       <ItemTitle>Inbox</ItemTitle>
 *     </ItemContent>
 *   </Item>
 *   <ItemSeparator />
 *   <Item>
 *     <ItemContent>
 *       <ItemTitle>Drafts</ItemTitle>
 *     </ItemContent>
 *   </Item>
 * </ItemGroup>
 */
function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-2", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  `group/item flex w-full flex-wrap items-center rounded-none border text-xs transition-colors duration-fast ${FOCUS_OUTLINE_RESET} ${FOCUS_RING} [a]:transition-colors [a]:hover:bg-muted`,
  {
    variants: {
      variant: {
        default: "border-transparent",
        outline: "border-border",
        muted: "border-transparent bg-muted/50",
      },
      size: {
        default: "gap-2.5 px-3 py-2.5",
        sm: "gap-2.5 px-3 py-2.5",
        xs: "gap-2 px-2.5 py-2 in-data-[slot=dropdown-menu-content]:p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * One entry of a list, composed of media, content, actions, a header and a footer; use `variant` to frame it and `size` to set its density.
 *
 * @example
 * <Item variant="outline">
 *   <ItemContent>
 *     <ItemTitle>Invoice 1042</ItemTitle>
 *     <ItemDescription>Paid on March 3.</ItemDescription>
 *   </ItemContent>
 * </Item>
 */
function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof itemVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      className={cn(itemVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "[&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 overflow-hidden rounded-none group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * The leading visual of an `Item`: an icon or an image that helps people recognize the entry; set `variant` to match.
 *
 * @example
 * <Item>
 *   <ItemMedia variant="icon">
 *     <FileTextIcon />
 *   </ItemMedia>
 *   <ItemContent>
 *     <ItemTitle>Quarterly report</ItemTitle>
 *   </ItemContent>
 * </Item>
 */
function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

/**
 * The main column of an `Item` that stacks its `ItemTitle` and `ItemDescription`.
 *
 * @example
 * <Item>
 *   <ItemContent>
 *     <ItemTitle>Weekly digest</ItemTitle>
 *     <ItemDescription>Sent every Monday morning.</ItemDescription>
 *   </ItemContent>
 * </Item>
 */
function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn(
        "flex flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * The name of an `Item`, required in every entry so people and screen readers can tell it apart.
 *
 * @example
 * <Item>
 *   <ItemContent>
 *     <ItemTitle>Workspace backup</ItemTitle>
 *   </ItemContent>
 * </Item>
 */
function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "line-clamp-1 flex w-fit items-center gap-2 text-xs font-medium underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * The secondary line under an `ItemTitle` that adds a detail, clamped to two lines.
 *
 * @example
 * <ItemContent>
 *   <ItemTitle>Workspace backup</ItemTitle>
 *   <ItemDescription>Last saved two hours ago.</ItemDescription>
 * </ItemContent>
 */
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "line-clamp-2 text-left text-xs/relaxed font-normal text-muted-foreground group-data-[size=xs]/item:text-xs/relaxed [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

/**
 * The trailing area of an `Item` for its buttons or badges, limited to three so the row stays scannable.
 *
 * @example
 * <Item>
 *   <ItemContent>
 *     <ItemTitle>Design review</ItemTitle>
 *   </ItemContent>
 *   <ItemActions>
 *     <Button size="sm">Open</Button>
 *   </ItemActions>
 * </Item>
 */
function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2", className)}
      {...props}
    />
  )
}

/**
 * A full-width row above the content of an `Item`, for an image or a label that spans the entry.
 *
 * @example
 * <Item>
 *   <ItemHeader>
 *     <ItemTitle>Launch checklist</ItemTitle>
 *   </ItemHeader>
 * </Item>
 */
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * A full-width row below the content of an `Item`, for a summary or a secondary action that spans the entry.
 *
 * @example
 * <Item>
 *   <ItemContent>
 *     <ItemTitle>Launch checklist</ItemTitle>
 *   </ItemContent>
 *   <ItemFooter>3 of 5 tasks done</ItemFooter>
 * </Item>
 */
function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
}

export type ItemProps = React.ComponentProps<typeof Item>
export type ItemActionsProps = React.ComponentProps<typeof ItemActions>
export type ItemContentProps = React.ComponentProps<typeof ItemContent>
export type ItemDescriptionProps = React.ComponentProps<typeof ItemDescription>
export type ItemFooterProps = React.ComponentProps<typeof ItemFooter>
export type ItemGroupProps = React.ComponentProps<typeof ItemGroup>
export type ItemHeaderProps = React.ComponentProps<typeof ItemHeader>
export type ItemMediaProps = React.ComponentProps<typeof ItemMedia>
export type ItemSeparatorProps = React.ComponentProps<typeof ItemSeparator>
export type ItemTitleProps = React.ComponentProps<typeof ItemTitle>

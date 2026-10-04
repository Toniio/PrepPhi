"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING, FOCUS_RING_WIDTH } from "@/lib/focus"

/**
 * The root that switches between mutually exclusive panels; use `orientation` for a horizontal or a vertical list of triggers.
 *
 * @example
 * <Tabs defaultValue="preview">
 *   <TabsList>
 *     <TabsTrigger value="preview">Preview</TabsTrigger>
 *     <TabsTrigger value="code">Code</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="preview">Your changes appear here.</TabsContent>
 * </Tabs>
 */
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

/**
 * Applies the `TabsList` styles to another element through `variant`, for example a custom tab strip.
 *
 * @example
 * <div className={cn(tabsListVariants({ variant: "line" }))}>…</div>
 */
const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-none p-1 text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * The row of `TabsTrigger`s; use `variant` to choose a filled background or an underline on the active tab.
 *
 * @example
 * <TabsList variant="line">
 *   <TabsTrigger value="preview">Preview</TabsTrigger>
 *   <TabsTrigger value="code">Code</TabsTrigger>
 * </TabsList>
 */
function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * The control that selects one panel; its `value` matches the `value` of a `TabsContent`.
 *
 * @example
 * <TabsList>
 *   <TabsTrigger value="preview">Preview</TabsTrigger>
 *   <TabsTrigger value="code" disabled>Code</TabsTrigger>
 * </TabsList>
 */
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        /* allow-raw: subpixel-tab-border — the active tab overlaps the 1px bottom border of the tab list */
        "h-[calc(100%-1px)]",
        `${FOCUS_RING_WIDTH} relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-none border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-1.25 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-disabled has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-overlay-selected dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-1 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

/**
 * The panel shown when the `TabsTrigger` with the same `value` is selected.
 *
 * @example
 * <TabsContent value="preview">
 *   <p>Your changes appear here.</p>
 * </TabsContent>
 */
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        `flex-1 text-xs/relaxed ${FOCUS_OUTLINE_RESET} ${FOCUS_RING} focus-visible:outline-(length:--border-width-default) focus-visible:outline-ring focus-visible:outline-solid`,
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }

export type TabsProps = React.ComponentProps<typeof Tabs>
export type TabsContentProps = React.ComponentProps<typeof TabsContent>
export type TabsListProps = React.ComponentProps<typeof TabsList>
export type TabsTriggerProps = React.ComponentProps<typeof TabsTrigger>

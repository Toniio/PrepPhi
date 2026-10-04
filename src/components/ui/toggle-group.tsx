"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

/**
 * A set of toggle buttons that share one `variant` and `size`; use `type="single"` for an exclusive choice and `type="multiple"` otherwise.
 *
 * @example
 * <ToggleGroup type="single" variant="outline" aria-label="View">
 *   <ToggleGroupItem value="list">List</ToggleGroupItem>
 *   <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
 * </ToggleGroup>
 */
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(
        // allow-raw: toggle-group-spacing — `spacing` is a multiple of the scale unit,
        // shadcn/ui's prop; the product is computed at runtime from --spacing.
        "group/toggle-group flex w-fit flex-row items-center gap-[calc(var(--spacing)*var(--gap))] rounded-none data-[size=sm]:rounded-none data-vertical:flex-col data-vertical:items-stretch",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

/**
 * One toggle button of a `ToggleGroup`, which passes down its `variant` and `size`; `value` identifies it.
 *
 * @example
 * <ToggleGroup type="multiple" aria-label="Text formatting">
 *   <ToggleGroupItem value="bold" aria-label="Bold">
 *     <TextBIcon />
 *   </ToggleGroupItem>
 * </ToggleGroup>
 */
function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "shrink-0 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-2 focus:z-dropdown focus-visible:z-dropdown group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5 group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5 group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-none group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-none group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-none group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-none group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }

export type ToggleGroupProps = React.ComponentProps<typeof ToggleGroup>
export type ToggleGroupItemProps = React.ComponentProps<typeof ToggleGroupItem>

import * as React from "react"

import { cn } from "@/lib/utils"
import { SURFACE_OUTLINE } from "@/lib/surface"

/**
 * A bordered surface that groups one topic: a title, some content and its actions.
 *
 * @example
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Team settings</CardTitle>
 *   </CardHeader>
 *   <CardContent>Manage who can edit this project.</CardContent>
 * </Card>
 */
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        `group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-none bg-card py-(--card-spacing) text-xs/relaxed text-card-foreground ${SURFACE_OUTLINE} ring-foreground/10 [--card-spacing:var(--space-scale-4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:var(--space-scale-3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-none *:[img:last-child]:rounded-none`,
        className
      )}
      {...props}
    />
  )
}

/**
 * The top of a `Card`: holds the `CardTitle`, the `CardDescription` and an optional `CardAction`.
 *
 * @example
 * <CardHeader>
 *   <CardTitle>Billing</CardTitle>
 *   <CardDescription>Your plan renews on the first of each month.</CardDescription>
 * </CardHeader>
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-none px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

/**
 * The heading of a `Card`, inside its `CardHeader`.
 *
 * @example
 * <CardTitle>Team settings</CardTitle>
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-sm font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * A supporting sentence under the `CardTitle`.
 *
 * @example
 * <CardDescription>Choose who can see this project.</CardDescription>
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * A control aligned to the end of the `CardHeader`, such as a menu button.
 *
 * @example
 * <CardAction>
 *   <Button variant="outline" size="sm">Edit</Button>
 * </CardAction>
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * The body of a `Card`.
 *
 * @example
 * <CardContent>
 *   <p>Three people have access to this project.</p>
 * </CardContent>
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-spacing)", className)}
      {...props}
    />
  )
}

/**
 * The bottom of a `Card`: holds the actions that finish its task.
 *
 * @example
 * <CardFooter>
 *   <Button>Save changes</Button>
 * </CardFooter>
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-none border-t p-(--card-spacing)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}

export type CardProps = React.ComponentProps<typeof Card>
export type CardActionProps = React.ComponentProps<typeof CardAction>
export type CardContentProps = React.ComponentProps<typeof CardContent>
export type CardDescriptionProps = React.ComponentProps<typeof CardDescription>
export type CardFooterProps = React.ComponentProps<typeof CardFooter>
export type CardHeaderProps = React.ComponentProps<typeof CardHeader>
export type CardTitleProps = React.ComponentProps<typeof CardTitle>

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { MODAL_CONTENT_BASE, OVERLAY_BASE } from "@/lib/overlay"
import { FOCUS_OUTLINE_RESET } from "@/lib/focus"
import { Button } from "@/components/ui/button"

/**
 * The root of a blocking confirmation: it owns the open state and stops the user until they answer a critical action.
 *
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <Button variant="destructive">Delete project</Button>
 *   </AlertDialogTrigger>
 *   <AlertDialogContent>…</AlertDialogContent>
 * </AlertDialog>
 */
function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

/**
 * The control that opens the `AlertDialog`; pass `asChild` to use your own `Button`.
 *
 * @example
 * <AlertDialogTrigger asChild>
 *   <Button variant="destructive">Delete project</Button>
 * </AlertDialogTrigger>
 */
function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

/**
 * Mounts the dialog outside the page flow; `AlertDialogContent` already includes it, so reach for it only to build a custom surface.
 *
 * @example
 * <AlertDialogPortal>
 *   <AlertDialogOverlay />
 * </AlertDialogPortal>
 */
function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

/**
 * The dimmed layer behind an `AlertDialog` that blocks the rest of the interface; `AlertDialogContent` already renders it.
 *
 * @example
 * <AlertDialogPortal>
 *   <AlertDialogOverlay />
 * </AlertDialogPortal>
 */
function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(OVERLAY_BASE, "duration-fast", className)}
      {...props}
    />
  )
}

/**
 * The modal surface of an `AlertDialog`; use `size` to choose a compact or a standard width.
 *
 * @example
 * <AlertDialogContent size="sm">
 *   <AlertDialogHeader>
 *     <AlertDialogTitle>Delete this project?</AlertDialogTitle>
 *   </AlertDialogHeader>
 * </AlertDialogContent>
 */
function AlertDialogContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content> & {
  size?: "default" | "sm"
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          MODAL_CONTENT_BASE,
          // focus-managed: Radix mounts this surface with tabIndex={-1} and moves
          // focus to a control inside it, so a ring on the surface itself would mark
          // something the user cannot act on.
          // allow-raw: alert-dialog-viewport-gutter — the content is as wide as the
          // viewport minus one gutter on each side, up to its max width.
          `group/alert-dialog-content ${FOCUS_OUTLINE_RESET} w-[calc(100%-var(--space-scale-8))] data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-sm`,
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

/**
 * Groups the `AlertDialogTitle`, the `AlertDialogDescription` and an optional `AlertDialogMedia` at the top of the dialog.
 *
 * @example
 * <AlertDialogHeader>
 *   <AlertDialogTitle>Delete this project?</AlertDialogTitle>
 *   <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
 * </AlertDialogHeader>
 */
function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        "grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-4 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Holds the `AlertDialogCancel` and `AlertDialogAction` buttons that let the user answer the dialog.
 *
 * @example
 * <AlertDialogFooter>
 *   <AlertDialogCancel>Keep project</AlertDialogCancel>
 *   <AlertDialogAction>Delete project</AlertDialogAction>
 * </AlertDialogFooter>
 */
function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * An icon or illustration slot in the header that signals the kind of decision, such as a warning.
 *
 * @example
 * <AlertDialogHeader>
 *   <AlertDialogMedia>
 *     <WarningIcon />
 *   </AlertDialogMedia>
 *   <AlertDialogTitle>Delete this project?</AlertDialogTitle>
 * </AlertDialogHeader>
 */
function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "mb-2 inline-flex size-10 items-center justify-center rounded-none bg-muted sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * The name of the `AlertDialog`, announced by screen readers: state the decision as a question.
 *
 * @example
 * <AlertDialogTitle>Delete this project?</AlertDialogTitle>
 */
function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "font-heading text-sm font-medium sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * The consequence of the action, in one or two sentences, read after the `AlertDialogTitle`.
 *
 * @example
 * <AlertDialogDescription>
 *   The project and its files are removed for everyone on your team.
 * </AlertDialogDescription>
 */
function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-xs/relaxed text-balance text-muted-foreground md:text-pretty *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * The button that confirms the action and closes the dialog; use `variant` to mark a destructive confirmation.
 *
 * @example
 * <AlertDialogAction variant="destructive">Delete project</AlertDialogAction>
 */
function AlertDialogAction({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Action
        data-slot="alert-dialog-action"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

/**
 * The button that dismisses the dialog without acting; every `AlertDialog` offers one.
 *
 * @example
 * <AlertDialogCancel>Keep project</AlertDialogCancel>
 */
function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <Button variant={variant} size={size} asChild>
      <AlertDialogPrimitive.Cancel
        data-slot="alert-dialog-cancel"
        className={cn(className)}
        {...props}
      />
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}

export type AlertDialogProps = React.ComponentProps<typeof AlertDialog>
export type AlertDialogActionProps = React.ComponentProps<
  typeof AlertDialogAction
>
export type AlertDialogCancelProps = React.ComponentProps<
  typeof AlertDialogCancel
>
export type AlertDialogContentProps = React.ComponentProps<
  typeof AlertDialogContent
>
export type AlertDialogDescriptionProps = React.ComponentProps<
  typeof AlertDialogDescription
>
export type AlertDialogFooterProps = React.ComponentProps<
  typeof AlertDialogFooter
>
export type AlertDialogHeaderProps = React.ComponentProps<
  typeof AlertDialogHeader
>
export type AlertDialogMediaProps = React.ComponentProps<
  typeof AlertDialogMedia
>
export type AlertDialogOverlayProps = React.ComponentProps<
  typeof AlertDialogOverlay
>
export type AlertDialogPortalProps = React.ComponentProps<
  typeof AlertDialogPortal
>
export type AlertDialogTitleProps = React.ComponentProps<
  typeof AlertDialogTitle
>
export type AlertDialogTriggerProps = React.ComponentProps<
  typeof AlertDialogTrigger
>

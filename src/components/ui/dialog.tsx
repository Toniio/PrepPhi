"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { MODAL_CONTENT_BASE, OVERLAY_BASE } from "@/lib/overlay"
import { FOCUS_OUTLINE_RESET } from "@/lib/focus"
import { Button } from "@/components/ui/button"
import { XIcon } from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
/**
 * The root of a modal window for a form, details or a confirmation; it owns the open state.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Edit profile</Button>
 *   </DialogTrigger>
 *   <DialogContent>…</DialogContent>
 * </Dialog>
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * The control that opens the `Dialog`; pass `asChild` to use your own `Button`.
 *
 * @example
 * <DialogTrigger asChild>
 *   <Button>Edit profile</Button>
 * </DialogTrigger>
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * Mounts the dialog outside the page flow; `DialogContent` already includes it, so reach for it only to build a custom surface.
 *
 * @example
 * <DialogPortal>
 *   <DialogOverlay />
 * </DialogPortal>
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * A control that closes the `Dialog` when pressed, such as a cancel button in the footer.
 *
 * @example
 * <DialogClose asChild>
 *   <Button variant="outline">Cancel</Button>
 * </DialogClose>
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/**
 * The dimmed layer behind a `Dialog` that separates it from the page; `DialogContent` already renders it.
 *
 * @example
 * <DialogPortal>
 *   <DialogOverlay />
 * </DialogPortal>
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(OVERLAY_BASE, "isolate duration-fast", className)}
      {...props}
    />
  )
}

/**
 * The modal surface of a `Dialog`; it shows a close button unless `showCloseButton` is false, and `closeLabel` names it.
 *
 * @example
 * <DialogContent closeLabel="Close">
 *   <DialogHeader>
 *     <DialogTitle>Edit profile</DialogTitle>
 *   </DialogHeader>
 * </DialogContent>
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel = UI_STRINGS.dialog.close,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          MODAL_CONTENT_BASE,
          // focus-managed: Radix mounts this surface with tabIndex={-1} and moves
          // focus to a control inside it, so a ring on the surface itself would mark
          // something the user cannot act on.
          // allow-raw: viewport-gutter — the dialog is capped at the viewport minus one
          // gutter on each side. A token can hold the gutter; it cannot hold the
          // subtraction from a width the component does not know.
          `max-w-[calc(100%-var(--space-scale-8))] text-xs/relaxed ${FOCUS_OUTLINE_RESET} sm:max-w-sm`,
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon />
              <span className="sr-only">{closeLabel}</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * Groups the `DialogTitle` and the `DialogDescription` at the top of the dialog.
 *
 * @example
 * <DialogHeader>
 *   <DialogTitle>Edit profile</DialogTitle>
 *   <DialogDescription>Update how your name appears to your team.</DialogDescription>
 * </DialogHeader>
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-1 text-left", className)}
      {...props}
    />
  )
}

/**
 * Holds the actions that finish the dialog's task; set `showCloseButton` to add a cancel button.
 *
 * @example
 * <DialogFooter showCloseButton>
 *   <Button>Save changes</Button>
 * </DialogFooter>
 */
function DialogFooter({
  className,
  showCloseButton = false,
  closeLabel = UI_STRINGS.dialog.close,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  closeLabel?: string
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">{closeLabel}</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

/**
 * The name of the `Dialog`, announced by screen readers; every `Dialog` renders one.
 *
 * @example
 * <DialogTitle>Edit profile</DialogTitle>
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}

/**
 * A supporting sentence under the `DialogTitle` that explains what the dialog asks of the user.
 *
 * @example
 * <DialogDescription>
 *   Update how your name appears to your team.
 * </DialogDescription>
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}

export type DialogProps = React.ComponentProps<typeof Dialog>
export type DialogCloseProps = React.ComponentProps<typeof DialogClose>
export type DialogContentProps = React.ComponentProps<typeof DialogContent>
export type DialogDescriptionProps = React.ComponentProps<
  typeof DialogDescription
>
export type DialogFooterProps = React.ComponentProps<typeof DialogFooter>
export type DialogHeaderProps = React.ComponentProps<typeof DialogHeader>
export type DialogOverlayProps = React.ComponentProps<typeof DialogOverlay>
export type DialogPortalProps = React.ComponentProps<typeof DialogPortal>
export type DialogTitleProps = React.ComponentProps<typeof DialogTitle>
export type DialogTriggerProps = React.ComponentProps<typeof DialogTrigger>

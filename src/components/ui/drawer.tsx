import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"
import { OVERLAY_BASE, SIDE_PANEL_CONTENT_BASE } from "@/lib/overlay"

/**
 * A panel that slides in from a screen edge and follows the user's swipe; use it below `md`, and pick the edge with `direction`.
 *
 * @example
 * <Drawer>
 *   <DrawerTrigger asChild>
 *     <Button>Filters</Button>
 *   </DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerTitle>Filters</DrawerTitle>
 *   </DrawerContent>
 * </Drawer>
 */
function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

/**
 * The element that opens its `Drawer` when the user activates it.
 *
 * @example
 * <Drawer>
 *   <DrawerTrigger asChild>
 *     <Button>Open settings</Button>
 *   </DrawerTrigger>
 * </Drawer>
 */
function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

/**
 * Mounts the drawer layers at the end of the document body, outside the parent's layout.
 *
 * @example
 * <DrawerPortal>
 *   <DrawerOverlay />
 * </DrawerPortal>
 */
function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

/**
 * The element that closes its `Drawer` when the user activates it, such as a cancel or done button.
 *
 * @example
 * <DrawerFooter>
 *   <DrawerClose asChild>
 *     <Button variant="outline">Cancel</Button>
 *   </DrawerClose>
 * </DrawerFooter>
 */
function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

/**
 * The dimmed backdrop behind an open `Drawer` that keeps the page underneath out of reach.
 *
 * @example
 * <DrawerPortal>
 *   <DrawerOverlay />
 * </DrawerPortal>
 */
function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(OVERLAY_BASE, "", className)}
      {...props}
    />
  )
}

/**
 * The sliding panel of a `Drawer`, which brings its own portal and overlay and holds the header, body and footer.
 *
 * @example
 * <Drawer>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Sort results</DrawerTitle>
 *     </DrawerHeader>
 *   </DrawerContent>
 * </Drawer>
 */
function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          SIDE_PANEL_CONTENT_BASE,
          "group/drawer-content h-auto data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-t data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:rounded-none data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:rounded-none data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-none data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=left]:sm:max-w-sm data-[vaul-drawer-direction=right]:sm:max-w-sm" /* allow-raw: viewport-constraint — max-h-[80vh] caps the drawer against the viewport, outside the spacing scale */,
          className
        )}
        {...props}
      >
        <div className="mx-auto mt-4 hidden h-1 w-24 shrink-0 rounded-none bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

/**
 * The top of a `DrawerContent`: groups the `DrawerTitle` and the `DrawerDescription`.
 *
 * @example
 * <DrawerHeader>
 *   <DrawerTitle>Notifications</DrawerTitle>
 *   <DrawerDescription>Choose what we send to your phone.</DrawerDescription>
 * </DrawerHeader>
 */
function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-0.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

/**
 * The bottom of a `DrawerContent`: stacks the actions that confirm or dismiss the drawer.
 *
 * @example
 * <DrawerFooter>
 *   <Button>Apply filters</Button>
 *   <DrawerClose asChild>
 *     <Button variant="outline">Cancel</Button>
 *   </DrawerClose>
 * </DrawerFooter>
 */
function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

/**
 * The name of a `Drawer`, which screen readers announce when it opens.
 *
 * @example
 * <DrawerHeader>
 *   <DrawerTitle>Edit profile</DrawerTitle>
 * </DrawerHeader>
 */
function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn(
        "font-heading text-sm font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * The supporting line under a `DrawerTitle` that says what the drawer is for.
 *
 * @example
 * <DrawerHeader>
 *   <DrawerTitle>Edit profile</DrawerTitle>
 *   <DrawerDescription>Update how your name appears to others.</DrawerDescription>
 * </DrawerHeader>
 */
function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}

export type DrawerProps = React.ComponentProps<typeof Drawer>
export type DrawerCloseProps = React.ComponentProps<typeof DrawerClose>
export type DrawerContentProps = React.ComponentProps<typeof DrawerContent>
export type DrawerDescriptionProps = React.ComponentProps<
  typeof DrawerDescription
>
export type DrawerFooterProps = React.ComponentProps<typeof DrawerFooter>
export type DrawerHeaderProps = React.ComponentProps<typeof DrawerHeader>
export type DrawerOverlayProps = React.ComponentProps<typeof DrawerOverlay>
export type DrawerPortalProps = React.ComponentProps<typeof DrawerPortal>
export type DrawerTitleProps = React.ComponentProps<typeof DrawerTitle>
export type DrawerTriggerProps = React.ComponentProps<typeof DrawerTrigger>

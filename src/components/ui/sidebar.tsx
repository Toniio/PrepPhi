"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { FOCUS_RING_WIDTH } from "@/lib/focus"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SidebarIcon } from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
import { SURFACE_OUTLINE } from "@/lib/surface"
const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "var(--space-layout-sidebar)"
const SIDEBAR_WIDTH_MOBILE = "var(--space-layout-sidebar-mobile)"
const SIDEBAR_WIDTH_ICON = "var(--space-layout-sidebar-icon)"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

/**
 * Reads the sidebar state and its `toggleSidebar`, `setOpen` and mobile controls from inside a `SidebarProvider`.
 *
 * @example
 * const { state, toggleSidebar } = useSidebar()
 */
function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

/**
 * Holds the open state, the mobile state and the keyboard shortcut for every sidebar part below it; place it at the root of the layout.
 *
 * @example
 * <SidebarProvider defaultOpen>
 *   <Sidebar />
 *   <SidebarInset>Dashboard</SidebarInset>
 * </SidebarProvider>
 */
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

/**
 * The side navigation panel of an app: a sheet on mobile, collapsible on desktop through `collapsible`, on the `side` you choose.
 *
 * @example
 * <Sidebar side="left" collapsible="icon">
 *   <SidebarContent />
 * </Sidebar>
 */
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  dir,
  mobileTitle = UI_STRINGS.sidebar.mobileTitle,
  mobileDescription = UI_STRINGS.sidebar.mobileDescription,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  mobileTitle?: string
  mobileDescription?: string
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{mobileTitle}</SheetTitle>
            <SheetDescription>{mobileDescription}</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-normal ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? // allow-raw: sidebar-icon-gutter — the floating and inset variants sit inside a
              // padded shell, so the collapsed rail is its own width plus that padding. The
              // sum belongs to the variant, not to the scale.
              "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--space-scale-4))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          // allow-raw: sidebar-offcanvas-shift — the offcanvas panel is pushed out by exactly
          // its own width, mirrored per side. The multiplication by -1 is the mirroring,
          // and no token can carry a sign.
          "fixed inset-y-0 z-fixed hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-normal ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? /* allow-raw: subpixel-offset — +2px compensates for the floating variant border width */ "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--space-scale-4)+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-none group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-(length:--border-width-default) group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * A button that opens and closes the sidebar; translate its `toggleLabel` in an interface that is not in English.
 *
 * @example
 * <SidebarTrigger toggleLabel="Toggle sidebar" />
 */
function SidebarTrigger({
  className,
  onClick,
  toggleLabel = UI_STRINGS.sidebar.toggle,
  ...props
}: React.ComponentProps<typeof Button> & { toggleLabel?: string }) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <SidebarIcon />
      <span className="sr-only">{toggleLabel}</span>
    </Button>
  )
}

/**
 * A thin strip on the edge of the sidebar that toggles it when pressed.
 *
 * @example
 * <Sidebar>
 *   <SidebarContent />
 *   <SidebarRail />
 * </Sidebar>
 */
function SidebarRail({
  className,
  toggleLabel = UI_STRINGS.sidebar.toggle,
  ...props
}: React.ComponentProps<"button"> & { toggleLabel?: string }) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={toggleLabel}
      tabIndex={-1}
      onClick={toggleSidebar}
      title={toggleLabel}
      className={cn(
        "absolute inset-y-0 z-sticky hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-0.5 hover:after:bg-sidebar-border sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * The main content area next to the `Sidebar`, adapted to its `inset` variant.
 *
 * @example
 * <SidebarProvider>
 *   <Sidebar variant="inset" />
 *   <SidebarInset>Your projects</SidebarInset>
 * </SidebarProvider>
 */
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * A search or filter field inside the sidebar, styled for the sidebar background.
 *
 * @example
 * <SidebarHeader>
 *   <SidebarInput placeholder="Search projects" />
 * </SidebarHeader>
 */
function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("h-8 w-full bg-background shadow-none", className)}
      {...props}
    />
  )
}

/**
 * The top of the sidebar: holds a logo, a workspace switcher or a search field.
 *
 * @example
 * <Sidebar>
 *   <SidebarHeader>Acme workspace</SidebarHeader>
 * </Sidebar>
 */
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

/**
 * The bottom of the sidebar: holds the account menu or secondary actions.
 *
 * @example
 * <Sidebar>
 *   <SidebarFooter>Maya Johnson</SidebarFooter>
 * </Sidebar>
 */
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

/**
 * A divider that sets apart two groups of the sidebar.
 *
 * @example
 * <SidebarContent>
 *   <SidebarGroup />
 *   <SidebarSeparator />
 *   <SidebarGroup />
 * </SidebarContent>
 */
function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
}

/**
 * The scrollable middle of the sidebar, holding its `SidebarGroup`s.
 *
 * @example
 * <Sidebar>
 *   <SidebarContent>
 *     <SidebarGroup />
 *   </SidebarContent>
 * </Sidebar>
 */
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

/**
 * A titled section of the sidebar: a `SidebarGroupLabel` above a `SidebarGroupContent`.
 *
 * @example
 * <SidebarGroup>
 *   <SidebarGroupLabel>Projects</SidebarGroupLabel>
 *   <SidebarGroupContent />
 * </SidebarGroup>
 */
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

/**
 * The title of a `SidebarGroup`, hidden when the sidebar collapses to its icons.
 *
 * @example
 * <SidebarGroup>
 *   <SidebarGroupLabel>Workspace</SidebarGroupLabel>
 * </SidebarGroup>
 */
function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        `flex h-8 shrink-0 items-center rounded-none px-2 text-xs text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-normal ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 ${FOCUS_RING_WIDTH} [&>svg]:size-4 [&>svg]:shrink-0`,
        className
      )}
      {...props}
    />
  )
}

/**
 * A button in the corner of a `SidebarGroup` that acts on the whole group, such as creating an item in it.
 *
 * @example
 * <SidebarGroup>
 *   <SidebarGroupLabel>Projects</SidebarGroupLabel>
 *   <SidebarGroupAction aria-label="Add project">+</SidebarGroupAction>
 * </SidebarGroup>
 */
function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        `absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-none p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${FOCUS_RING_WIDTH} md:after:-inset-0.5 [&>svg]:size-4 [&>svg]:shrink-0`,
        className
      )}
      {...props}
    />
  )
}

/**
 * The body of a `SidebarGroup`, wrapping its `SidebarMenu`.
 *
 * @example
 * <SidebarGroup>
 *   <SidebarGroupContent>
 *     <SidebarMenu />
 *   </SidebarGroupContent>
 * </SidebarGroup>
 */
function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-xs", className)}
      {...props}
    />
  )
}

/**
 * The list of entries of a `SidebarGroup`, with one `SidebarMenuItem` per entry.
 *
 * @example
 * <SidebarMenu>
 *   <SidebarMenuItem>
 *     <SidebarMenuButton>Dashboard</SidebarMenuButton>
 *   </SidebarMenuItem>
 * </SidebarMenu>
 */
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-0", className)}
      {...props}
    />
  )
}

/**
 * One entry of a `SidebarMenu`: a `SidebarMenuButton` with an optional action, badge or submenu.
 *
 * @example
 * <SidebarMenuItem>
 *   <SidebarMenuButton>Inbox</SidebarMenuButton>
 *   <SidebarMenuBadge>12</SidebarMenuBadge>
 * </SidebarMenuItem>
 */
function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  `peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-none p-2 text-left text-xs ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${FOCUS_RING_WIDTH} active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-disabled aria-disabled:pointer-events-none aria-disabled:opacity-disabled data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate`,
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: `bg-background ${SURFACE_OUTLINE} ring-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:ring-sidebar-accent`,
      },
      size: {
        default: "h-8 text-xs",
        sm: "h-7 text-xs",
        lg: "h-12 text-xs group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * The button or link of a menu entry; set `isActive` on the current page and `tooltip` to name it when the sidebar shows icons only.
 *
 * @example
 * <SidebarMenuItem>
 *   <SidebarMenuButton isActive tooltip="Dashboard">
 *     Dashboard
 *   </SidebarMenuButton>
 * </SidebarMenuItem>
 */
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot.Root : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

/**
 * A secondary button on a menu entry, shown only on hover when `showOnHover` is set.
 *
 * @example
 * <SidebarMenuItem>
 *   <SidebarMenuButton>Design review</SidebarMenuButton>
 *   <SidebarMenuAction showOnHover aria-label="More options">
 *     ...
 *   </SidebarMenuAction>
 * </SidebarMenuItem>
 */
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        `absolute top-1.5 right-1 -m-0.5 flex aspect-square w-5 min-w-target items-center justify-center rounded-none p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${FOCUS_RING_WIDTH} md:after:-inset-0.5 [&>svg]:size-4 [&>svg]:shrink-0`,
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * A count or status pinned to the end of a menu entry.
 *
 * @example
 * <SidebarMenuItem>
 *   <SidebarMenuButton>Notifications</SidebarMenuButton>
 *   <SidebarMenuBadge>3</SidebarMenuBadge>
 * </SidebarMenuItem>
 */
function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-none px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * A placeholder for a menu entry while the list loads; `showIcon` adds an icon block.
 *
 * @example
 * <SidebarMenu>
 *   <SidebarMenuItem>
 *     <SidebarMenuSkeleton showIcon />
 *   </SidebarMenuItem>
 * </SidebarMenu>
 */
function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-none px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-none"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

/**
 * A nested list of links under a `SidebarMenuItem`, hidden when the sidebar shows icons only.
 *
 * @example
 * <SidebarMenuItem>
 *   <SidebarMenuButton>Settings</SidebarMenuButton>
 *   <SidebarMenuSub>
 *     <SidebarMenuSubItem />
 *   </SidebarMenuSub>
 * </SidebarMenuItem>
 */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

/**
 * One entry of a `SidebarMenuSub`, wrapping its `SidebarMenuSubButton`.
 *
 * @example
 * <SidebarMenuSub>
 *   <SidebarMenuSubItem>
 *     <SidebarMenuSubButton href="/settings/team">Team</SidebarMenuSubButton>
 *   </SidebarMenuSubItem>
 * </SidebarMenuSub>
 */
function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

/**
 * The link of a nested entry; set `isActive` on the current page and `size` to `sm` for a denser row.
 *
 * @example
 * <SidebarMenuSubItem>
 *   <SidebarMenuSubButton href="/settings/billing" isActive>
 *     Billing
 *   </SidebarMenuSubButton>
 * </SidebarMenuSubItem>
 */
function SidebarMenuSubButton({
  asChild = false,
  size = "default",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean
  size?: "sm" | "default"
  isActive?: boolean
}) {
  const Comp = asChild ? Slot.Root : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        `flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-none px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${FOCUS_RING_WIDTH} active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-disabled aria-disabled:pointer-events-none aria-disabled:opacity-disabled data-[size=default]:text-xs data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground`,
        className
      )}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}

export type SidebarProps = React.ComponentProps<typeof Sidebar>
export type SidebarContentProps = React.ComponentProps<typeof SidebarContent>
export type SidebarFooterProps = React.ComponentProps<typeof SidebarFooter>
export type SidebarGroupProps = React.ComponentProps<typeof SidebarGroup>
export type SidebarGroupActionProps = React.ComponentProps<
  typeof SidebarGroupAction
>
export type SidebarGroupContentProps = React.ComponentProps<
  typeof SidebarGroupContent
>
export type SidebarGroupLabelProps = React.ComponentProps<
  typeof SidebarGroupLabel
>
export type SidebarHeaderProps = React.ComponentProps<typeof SidebarHeader>
export type SidebarInputProps = React.ComponentProps<typeof SidebarInput>
export type SidebarInsetProps = React.ComponentProps<typeof SidebarInset>
export type SidebarMenuProps = React.ComponentProps<typeof SidebarMenu>
export type SidebarMenuActionProps = React.ComponentProps<
  typeof SidebarMenuAction
>
export type SidebarMenuBadgeProps = React.ComponentProps<
  typeof SidebarMenuBadge
>
export type SidebarMenuButtonProps = React.ComponentProps<
  typeof SidebarMenuButton
>
export type SidebarMenuItemProps = React.ComponentProps<typeof SidebarMenuItem>
export type SidebarMenuSkeletonProps = React.ComponentProps<
  typeof SidebarMenuSkeleton
>
export type SidebarMenuSubProps = React.ComponentProps<typeof SidebarMenuSub>
export type SidebarMenuSubButtonProps = React.ComponentProps<
  typeof SidebarMenuSubButton
>
export type SidebarMenuSubItemProps = React.ComponentProps<
  typeof SidebarMenuSubItem
>
export type SidebarProviderProps = React.ComponentProps<typeof SidebarProvider>
export type SidebarRailProps = React.ComponentProps<typeof SidebarRail>
export type SidebarSeparatorProps = React.ComponentProps<
  typeof SidebarSeparator
>
export type SidebarTriggerProps = React.ComponentProps<typeof SidebarTrigger>

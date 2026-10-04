import * as React from "react"
import {
  MessageScroller as MessageScrollerPrimitive,
  useMessageScroller,
  useMessageScrollerScrollable,
  useMessageScrollerVisibility,
} from "@shadcn/react/message-scroller"

import { cn } from "@/lib/utils"
import { UI_STRINGS } from "@/lib/ui-strings"
import { Button } from "@/components/ui/button"
import { ArrowDownIcon } from "@phosphor-icons/react"

// no-data-slot: MessageScrollerProvider renders no element, it holds the scroll state for the scroller below it
/**
 * Holds the scroll state that the scroller's parts and hooks read, so wrap the whole scroller in it.
 *
 * @example
 * <MessageScrollerProvider>
 *   <MessageScroller>
 *     <MessageScrollerViewport>
 *       <MessageScrollerContent>{messages}</MessageScrollerContent>
 *     </MessageScrollerViewport>
 *   </MessageScroller>
 * </MessageScrollerProvider>
 */
function MessageScrollerProvider(
  props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>
) {
  return <MessageScrollerPrimitive.Provider {...props} />
}

/**
 * The bounded panel that fills its parent, follows new messages and positions the jump buttons over the viewport.
 *
 * @example
 * <MessageScroller>
 *   <MessageScrollerViewport>
 *     <MessageScrollerContent>{messages}</MessageScrollerContent>
 *   </MessageScrollerViewport>
 *   <MessageScrollerButton />
 * </MessageScroller>
 */
function MessageScroller({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Root>) {
  return (
    <MessageScrollerPrimitive.Root
      data-slot="message-scroller"
      className={cn(
        "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

/**
 * The scrolling region of a thread, named for assistive technology, which stays at the end while the reader is there.
 *
 * @example
 * <MessageScroller>
 *   <MessageScrollerViewport>
 *     <MessageScrollerContent>{messages}</MessageScrollerContent>
 *   </MessageScrollerViewport>
 * </MessageScroller>
 */
function MessageScrollerViewport({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport>) {
  return (
    <MessageScrollerPrimitive.Viewport
      data-slot="message-scroller-viewport"
      aria-label={UI_STRINGS.messageScroller.viewport}
      className={cn(
        "size-full min-h-0 min-w-0 scroll-fade-b overflow-y-auto overscroll-contain contain-content data-pending-scroll:invisible",
        className
      )}
      {...props}
    />
  )
}

/**
 * The column that stacks the messages of a thread with a gap between them, inside the viewport.
 *
 * @example
 * <MessageScrollerViewport>
 *   <MessageScrollerContent>
 *     <MessageScrollerItem messageId="m1">Welcome back.</MessageScrollerItem>
 *   </MessageScrollerContent>
 * </MessageScrollerViewport>
 */
function MessageScrollerContent({
  className,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Content>) {
  return (
    <MessageScrollerPrimitive.Content
      data-slot="message-scroller-content"
      className={cn("flex h-max min-h-full flex-col gap-6", className)}
      {...props}
    />
  )
}

// content-visibility skips the layout of the messages out of view; the
// intrinsic size keeps the scrollbar stable until they render.
/**
 * One message of a thread; give it a stable `messageId` when code scrolls to it or reads its visibility.
 *
 * @example
 * <MessageScrollerContent>
 *   <MessageScrollerItem messageId="m42" scrollAnchor>
 *     Your export is ready.
 *   </MessageScrollerItem>
 * </MessageScrollerContent>
 */
function MessageScrollerItem({
  className,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item>) {
  return (
    <MessageScrollerPrimitive.Item
      data-slot="message-scroller-item"
      scrollAnchor={scrollAnchor}
      className={cn(
        "min-w-0 shrink-0 [contain-intrinsic-size:auto_var(--space-scale-40)] [content-visibility:auto]",
        className
      )}
      {...props}
    />
  )
}

/**
 * The button that jumps to the latest message, or to the first with `direction="start"`, and hides while that end is in view.
 *
 * @example
 * <MessageScroller>
 *   <MessageScrollerViewport>
 *     <MessageScrollerContent>{messages}</MessageScrollerContent>
 *   </MessageScrollerViewport>
 *   <MessageScrollerButton direction="end" />
 * </MessageScroller>
 */
function MessageScrollerButton({
  direction = "end",
  className,
  children,
  render,
  variant = "secondary",
  size = "icon-sm",
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <MessageScrollerPrimitive.Button
      data-slot="message-scroller-button"
      data-direction={direction}
      data-variant={variant}
      data-size={size}
      direction={direction}
      className={cn(
        "absolute start-1/2 -translate-x-1/2 border-border bg-background text-foreground transition-[translate,scale,opacity] duration-normal hover:bg-muted hover:text-foreground data-[active=false]:pointer-events-none data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=false]:duration-slow data-[active=false]:ease-in data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 data-[active=true]:ease-out data-[direction=end]:bottom-4 data-[direction=end]:data-[active=false]:translate-y-full data-[direction=start]:top-4 data-[direction=start]:data-[active=false]:-translate-y-full rtl:translate-x-1/2 data-[direction=start]:[&_svg]:rotate-180",
        className
      )}
      render={render ?? <Button variant={variant} size={size} />}
      {...props}
    >
      {children ?? (
        <>
          <ArrowDownIcon />
          <span className="sr-only">
            {direction === "end"
              ? UI_STRINGS.messageScroller.scrollToEnd
              : UI_STRINGS.messageScroller.scrollToStart}
          </span>
        </>
      )}
    </MessageScrollerPrimitive.Button>
  )
}

export {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  /**
   * Scrolls the nearest `MessageScroller` from code: to its end, its start or a message by id.
   *
   * @example
   * const { scrollToMessage } = useMessageScroller()
   * scrollToMessage("message-42")
   */
  useMessageScroller,
  /**
   * Tells whether there is more to scroll toward the start or the end, to show or hide your own controls.
   *
   * @example
   * const { start, end } = useMessageScrollerScrollable()
   */
  useMessageScrollerScrollable,
  /**
   * Tells which messages are in view and which one is the current anchor.
   *
   * @example
   * const { visibleMessageIds, currentAnchorId } = useMessageScrollerVisibility()
   */
  useMessageScrollerVisibility,
}

export type MessageScrollerProps = React.ComponentProps<typeof MessageScroller>
export type MessageScrollerButtonProps = React.ComponentProps<
  typeof MessageScrollerButton
>
export type MessageScrollerContentProps = React.ComponentProps<
  typeof MessageScrollerContent
>
export type MessageScrollerItemProps = React.ComponentProps<
  typeof MessageScrollerItem
>
export type MessageScrollerProviderProps = React.ComponentProps<
  typeof MessageScrollerProvider
>
export type MessageScrollerViewportProps = React.ComponentProps<
  typeof MessageScrollerViewport
>

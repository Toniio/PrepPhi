import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Stacks the consecutive turns of one speaker in a column.
 *
 * @example
 * <MessageGroup>
 *   <Message>
 *     <MessageContent>
 *       <Bubble variant="secondary">
 *         <BubbleContent>Your report is ready.</BubbleContent>
 *       </Bubble>
 *     </MessageContent>
 *   </Message>
 * </MessageGroup>
 */
function MessageGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-group"
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
      {...props}
    />
  )
}

/**
 * Lays out one turn of a conversation and aligns it to the start, or to the end with `align` for the user's own turns.
 *
 * @example
 * <Message align="end">
 *   <MessageContent>
 *     <Bubble>
 *       <BubbleContent>Can you send me the latest numbers?</BubbleContent>
 *     </Bubble>
 *   </MessageContent>
 * </Message>
 */
function Message({
  className,
  align = "start",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  return (
    <div
      data-slot="message"
      data-align={align}
      className={cn(
        "group/message relative flex w-full min-w-0 gap-1.5 text-xs data-[align=end]:flex-row-reverse",
        className
      )}
      {...props}
    />
  )
}

/**
 * Frames the speaker's `Avatar` at the bottom of a turn, lifted above the `MessageFooter` when there is one.
 *
 * @example
 * <Message>
 *   <MessageAvatar>
 *     <Avatar>
 *       <AvatarFallback>MJ</AvatarFallback>
 *     </Avatar>
 *   </MessageAvatar>
 * </Message>
 */
function MessageAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-avatar"
      className={cn(
        "flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted group-has-data-[slot=message-footer]/message:-translate-y-8",
        className
      )}
      {...props}
    />
  )
}

/**
 * Holds the `Bubble`s, attachments and other content of a turn, inside its `Message`.
 *
 * @example
 * <Message>
 *   <MessageContent>
 *     <Bubble variant="secondary">
 *       <BubbleContent>Your plan renews on the first of each month.</BubbleContent>
 *     </Bubble>
 *   </MessageContent>
 * </Message>
 */
function MessageContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex w-full min-w-0 flex-col gap-2 wrap-break-word group-data-[align=end]/message:*:data-slot:self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Names the speaker or shows the time above the content of a turn.
 *
 * @example
 * <Message>
 *   <MessageContent>
 *     <MessageHeader>Maya Johnson, 9:41 AM</MessageHeader>
 *     <Bubble variant="secondary">
 *       <BubbleContent>Good morning, the draft is ready.</BubbleContent>
 *     </Bubble>
 *   </MessageContent>
 * </Message>
 */
function MessageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-header"
      className={cn(
        "flex max-w-full min-w-0 items-center px-2.5 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Shows a status or actions below the content of a turn, such as whether it was read or edited.
 *
 * @example
 * <Message align="end">
 *   <MessageContent>
 *     <Bubble>
 *       <BubbleContent>See you tomorrow.</BubbleContent>
 *     </Bubble>
 *     <MessageFooter>Read</MessageFooter>
 *   </MessageContent>
 * </Message>
 */
function MessageFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="message-footer"
      className={cn(
        "flex max-w-full min-w-0 items-center px-2.5 text-xs font-medium text-muted-foreground group-has-data-[variant=ghost]/message:px-0 group-data-[align=end]/message:justify-end",
        className
      )}
      {...props}
    />
  )
}

export {
  MessageGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
}

export type MessageProps = React.ComponentProps<typeof Message>
export type MessageAvatarProps = React.ComponentProps<typeof MessageAvatar>
export type MessageContentProps = React.ComponentProps<typeof MessageContent>
export type MessageFooterProps = React.ComponentProps<typeof MessageFooter>
export type MessageGroupProps = React.ComponentProps<typeof MessageGroup>
export type MessageHeaderProps = React.ComponentProps<typeof MessageHeader>

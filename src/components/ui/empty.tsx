import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

import type { ComponentProps } from "react"
/**
 * The root of an empty state: use it once per view when a list, table or section has no data yet.
 *
 * @example
 * <Empty>
 *   <EmptyHeader>
 *     <EmptyTitle>No projects yet</EmptyTitle>
 *     <EmptyDescription>Create your first project to get started.</EmptyDescription>
 *   </EmptyHeader>
 * </Empty>
 */
function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-none border-dashed p-6 text-center text-balance",
        className
      )}
      {...props}
    />
  )
}

/**
 * Groups the `EmptyMedia`, `EmptyTitle` and `EmptyDescription` that say what is missing and why.
 *
 * @example
 * <Empty>
 *   <EmptyHeader>
 *     <EmptyTitle>No results found</EmptyTitle>
 *     <EmptyDescription>Try a different search term.</EmptyDescription>
 *   </EmptyHeader>
 * </Empty>
 */
function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "flex size-8 shrink-0 items-center justify-center rounded-none bg-muted text-foreground [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * A decorative visual for an empty state; use `variant="icon"` to set a Phosphor icon on a muted square.
 *
 * @example
 * <EmptyMedia variant="icon">
 *   <FolderOpenIcon />
 * </EmptyMedia>
 */
function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

// A real heading, so screen readers list it; the level follows the page
// outline, the look does not.
/**
 * The heading of an empty state; set `as` so its level follows the heading of the section that holds it.
 *
 * @example
 * <EmptyTitle as="h3">No messages yet</EmptyTitle>
 */
function EmptyTitle({
  className,
  as: Comp = "h2",
  ...props
}: React.ComponentProps<"h2"> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}) {
  return (
    <Comp
      data-slot="empty-title"
      className={cn("font-heading text-sm font-medium", className)}
      {...props}
    />
  )
}

/**
 * One or two sentences under the `EmptyTitle` that frame the action the user can take next.
 *
 * @example
 * <EmptyDescription>Invite a teammate to start a conversation.</EmptyDescription>
 */
function EmptyDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-xs/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

/**
 * Holds the actions of an empty state, such as a create `Button` or a link to the documentation.
 *
 * @example
 * <EmptyContent>
 *   <Button>Create a project</Button>
 * </EmptyContent>
 */
function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-2.5 text-xs text-balance",
        className
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}

export type EmptyProps = ComponentProps<typeof Empty>
export type EmptyContentProps = ComponentProps<typeof EmptyContent>
export type EmptyDescriptionProps = ComponentProps<typeof EmptyDescription>
export type EmptyHeaderProps = ComponentProps<typeof EmptyHeader>
export type EmptyMediaProps = ComponentProps<typeof EmptyMedia>
export type EmptyTitleProps = ComponentProps<typeof EmptyTitle>

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Use `alertVariants` to give another element the `Alert` colors for a message tone, such as an error or a success.
 *
 * @example
 * <div className={alertVariants({ variant: "warning" })}>Your session expires in five minutes.</div>
 */
const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-none border px-2.5 py-2 text-left text-xs has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
        success:
          "bg-card text-success *:data-[slot=alert-description]:text-success/90 *:[svg]:text-current",
        warning:
          "bg-card text-warning *:data-[slot=alert-description]:text-warning/90 *:[svg]:text-current",
        info: "bg-card text-info *:data-[slot=alert-description]:text-info/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * A non-modal banner that tells the user about a state they should notice; `variant` sets its tone: default, destructive, success, warning or info.
 *
 * @example
 * <Alert variant="success">
 *   <AlertTitle>Settings saved</AlertTitle>
 *   <AlertDescription>Your changes are live for the whole team.</AlertDescription>
 * </Alert>
 */
function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

/**
 * The short headline of an `Alert`, which says what happened in a few words.
 *
 * @example
 * <Alert>
 *   <AlertTitle>Session expired</AlertTitle>
 * </Alert>
 */
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * The supporting text of an `Alert`, which explains the cause and what the user can do next.
 *
 * @example
 * <Alert variant="destructive">
 *   <AlertTitle>Payment failed</AlertTitle>
 *   <AlertDescription>Check your card details and try again.</AlertDescription>
 * </Alert>
 */
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-xs/relaxed text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-2",
        className
      )}
      {...props}
    />
  )
}

/**
 * A slot pinned to the top right of an `Alert` for one compact action, such as a dismiss or undo button.
 *
 * @example
 * <Alert>
 *   <AlertTitle>New version available</AlertTitle>
 *   <AlertAction>
 *     <Button size="xs">Refresh</Button>
 *   </AlertAction>
 * </Alert>
 */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-1.25 right-1.25", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }

export type AlertProps = React.ComponentProps<typeof Alert>
export type AlertActionProps = React.ComponentProps<typeof AlertAction>
export type AlertDescriptionProps = React.ComponentProps<
  typeof AlertDescription
>
export type AlertTitleProps = React.ComponentProps<typeof AlertTitle>

import { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import type { ComponentProps } from "react"
/**
 * Groups related controls in a semantic `fieldset`, such as the options of one multiple choice; nest it at most two levels deep.
 *
 * @example
 * <FieldSet>
 *   <FieldLegend>Notifications</FieldLegend>
 *   <FieldGroup>
 *     <Field orientation="horizontal">
 *       <Checkbox id="email" />
 *       <FieldLabel htmlFor="email">Email me about new replies</FieldLabel>
 *     </Field>
 *   </FieldGroup>
 * </FieldSet>
 */
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

/**
 * The caption of a `FieldSet`; use `variant` `legend` for a fieldset and `label` everywhere else.
 *
 * @example
 * <FieldSet>
 *   <FieldLegend>Shipping method</FieldLegend>
 * </FieldSet>
 */
function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-2.5 font-medium data-[variant=label]:text-xs data-[variant=legend]:text-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * Stacks several `Field`s with even spacing and supplies the container width that `responsive` fields read.
 *
 * @example
 * <FieldGroup>
 *   <Field>
 *     <FieldLabel htmlFor="first-name">First name</FieldLabel>
 *     <Input id="first-name" />
 *   </Field>
 *   <Field>
 *     <FieldLabel htmlFor="last-name">Last name</FieldLabel>
 *     <Input id="last-name" />
 *   </Field>
 * </FieldGroup>
 */
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

/**
 * Ties one label to its control and carries the invalid state; set `data-invalid` from your validation and `orientation` to choose the layout.
 *
 * @example
 * <Field data-invalid="true">
 *   <FieldLabel htmlFor="email">Email address</FieldLabel>
 *   <Input id="email" type="email" aria-invalid="true" />
 *   <FieldError>Enter a valid email address.</FieldError>
 * </Field>
 */
function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

/**
 * Wraps an option's title and description in one column when the control sits beside them.
 *
 * @example
 * <Field orientation="horizontal">
 *   <Checkbox id="updates" />
 *   <FieldContent>
 *     <FieldLabel htmlFor="updates">Product updates</FieldLabel>
 *     <FieldDescription>Hear about new features once a month.</FieldDescription>
 *   </FieldContent>
 * </Field>
 */
function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

/**
 * The label of a `Field`: use it, not `FieldTitle`, to tie text to a control through `htmlFor`.
 *
 * @example
 * <Field>
 *   <FieldLabel htmlFor="name">Full name</FieldLabel>
 *   <Input id="name" />
 * </Field>
 */
function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-disabled has-data-checked:border-primary has-data-checked:bg-primary-selected has-[>[data-slot=field]]:rounded-none has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-overlay-hover has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-(length:--space-focus-ring-width) has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-2",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
    />
  )
}

/**
 * Titles an option inside a `FieldLabel` or `FieldContent`; it is not a `label` and ties to no control.
 *
 * @example
 * <RadioGroup defaultValue="pro" aria-label="Plan">
 *   <FieldLabel htmlFor="plan-pro">
 *     <Field orientation="horizontal">
 *       <FieldContent>
 *         <FieldTitle>Pro plan</FieldTitle>
 *         <FieldDescription>Unlimited projects for your team.</FieldDescription>
 *       </FieldContent>
 *       <RadioGroupItem value="pro" id="plan-pro" />
 *     </Field>
 *   </FieldLabel>
 *   <FieldLabel htmlFor="plan-free">
 *     <Field orientation="horizontal">
 *       <FieldContent>
 *         <FieldTitle>Free plan</FieldTitle>
 *         <FieldDescription>Up to three projects.</FieldDescription>
 *       </FieldContent>
 *       <RadioGroupItem value="free" id="plan-free" />
 *     </Field>
 *   </FieldLabel>
 * </RadioGroup>
 */
function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-xs/relaxed group-data-[disabled=true]/field:opacity-disabled",
        className
      )}
      {...props}
    />
  )
}

/**
 * Standing help text under a control that explains what to enter; use `FieldError` for a validation message.
 *
 * @example
 * <Field>
 *   <FieldLabel htmlFor="email">Email address</FieldLabel>
 *   <Input id="email" type="email" />
 *   <FieldDescription>We only use it to send receipts.</FieldDescription>
 * </Field>
 */
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-xs/relaxed leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className
      )}
      {...props}
    />
  )
}

/**
 * A rule that splits a `FieldGroup` into parts; pass `children` to print a short label, such as `Or`, on it.
 *
 * @example
 * <FieldGroup>
 *   <Field>
 *     <Button>Continue with email</Button>
 *   </Field>
 *   <FieldSeparator>Or</FieldSeparator>
 *   <Field>
 *     <Button variant="outline">Continue with Google</Button>
 *   </Field>
 * </FieldGroup>
 */
function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-xs group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

/**
 * A validation message announced as an alert; pass `children` or an `errors` list, and it renders nothing when both are empty.
 *
 * @example
 * <Field data-invalid="true">
 *   <FieldLabel htmlFor="password">Password</FieldLabel>
 *   <Input id="password" type="password" aria-invalid="true" />
 *   <FieldError errors={[{ message: "Use at least 8 characters." }]} />
 * </Field>
 */
function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("text-xs font-normal text-destructive", className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}

export type FieldProps = ComponentProps<typeof Field>
export type FieldContentProps = ComponentProps<typeof FieldContent>
export type FieldDescriptionProps = ComponentProps<typeof FieldDescription>
export type FieldErrorProps = ComponentProps<typeof FieldError>
export type FieldGroupProps = ComponentProps<typeof FieldGroup>
export type FieldLabelProps = ComponentProps<typeof FieldLabel>
export type FieldLegendProps = ComponentProps<typeof FieldLegend>
export type FieldSeparatorProps = ComponentProps<typeof FieldSeparator>
export type FieldSetProps = ComponentProps<typeof FieldSet>
export type FieldTitleProps = ComponentProps<typeof FieldTitle>

import * as React from "react"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/**
 * A multi-line text field that grows with its content, for comments, messages and other free-form text.
 *
 * @example
 * <Field>
 *   <FieldLabel htmlFor="comment">Comment</FieldLabel>
 *   <Textarea id="comment" placeholder="Share what you think." />
 * </Field>
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `flex field-sizing-content min-h-16 w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-xs transition-colors ${FOCUS_OUTLINE_RESET} placeholder:text-muted-foreground ${FOCUS_RING} disabled:cursor-not-allowed disabled:bg-input-fill/50 disabled:opacity-disabled aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid md:text-xs dark:bg-input-fill/30 dark:disabled:bg-input-fill/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40`,
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

export type TextareaProps = React.ComponentProps<typeof Textarea>

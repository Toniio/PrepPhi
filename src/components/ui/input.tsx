import * as React from "react"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"

/**
 * Takes a single line of text or a file; pair it with a `Label` through `id` and set `aria-invalid` to show an error.
 *
 * @example
 * <>
 *   <Label htmlFor="email">Email address</Label>
 *   <Input id="email" type="email" placeholder="you@example.com" />
 * </>
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        `h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors ${FOCUS_OUTLINE_RESET} file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground ${FOCUS_RING} disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input-fill/50 disabled:opacity-disabled aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:focus-visible:outline-(length:--border-width-default) aria-invalid:focus-visible:outline-destructive aria-invalid:focus-visible:outline-solid md:text-xs dark:bg-input-fill/30 dark:disabled:bg-input-fill/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40`,
        className
      )}
      {...props}
    />
  )
}

export { Input }

export type InputProps = React.ComponentProps<typeof Input>

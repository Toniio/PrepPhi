import { cn } from "@/lib/utils"
import { SpinnerIcon } from "@phosphor-icons/react"

import { UI_STRINGS } from "@/lib/ui-strings"
import type { ComponentProps } from "react"
/**
 * An indicator that an operation is in progress; replace its default `aria-label` with one that names the action.
 *
 * @example
 * <Spinner aria-label="Signing in" />
 */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <SpinnerIcon
      data-slot="spinner"
      role="status"
      aria-label={UI_STRINGS.spinner.label}
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }

export type SpinnerProps = ComponentProps<typeof Spinner>

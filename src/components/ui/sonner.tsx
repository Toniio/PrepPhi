import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

export type { ToasterProps }
import {
  CheckCircleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
  SpinnerIcon,
} from "@phosphor-icons/react"

/**
 * The single mount point for toast notifications, placed once at the root of the layout; call `toast()` from `sonner` to show one.
 *
 * @example
 * <Toaster />
 * // elsewhere: toast("Changes saved")
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      data-slot="toaster"
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircleIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <WarningIcon className="size-4" />,
        error: <XCircleIcon className="size-4" />,
        loading: <SpinnerIcon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--color-popover)",
          "--normal-text": "var(--color-popover-foreground)",
          "--normal-border": "var(--color-border)",
          "--border-radius": "var(--radius-none)",
          // sonner sets its own system font stack on the list; the toasts
          // take the design system's, as every other component does.
          fontFamily: "var(--font-mono)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * The classes of a `Heading` for a `level`, to give another element a heading's size and typeface.
 *
 * @example
 * <p className={headingVariants({ level: 3 })}>Recent activity</p>
 */
const headingVariants = cva("font-heading font-semibold tracking-tight", {
  variants: {
    level: {
      1: "text-2xl",
      2: "text-xl",
      3: "text-lg",
      4: "text-base",
    },
  },
  defaultVariants: {
    level: 1,
  },
})

type HeadingLevel = 1 | 2 | 3 | 4

/**
 * A semantic heading in the heading typeface, where `level` sets both the tag and the size and `as` changes only the tag.
 *
 * @example
 * <Heading level={2}>Team settings</Heading>
 */
function Heading({
  className,
  level = 1,
  as,
  ...props
}: React.ComponentProps<"h1"> &
  VariantProps<typeof headingVariants> & {
    as?: `h${HeadingLevel}`
  }) {
  const Comp = as ?? (`h${level}` as `h${HeadingLevel}`)

  return (
    <Comp
      data-slot="heading"
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  )
}

export { Heading, headingVariants }

export type HeadingProps = React.ComponentProps<typeof Heading>

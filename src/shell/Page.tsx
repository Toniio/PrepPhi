import type { ReactNode } from 'react'
import { Heading } from '@/components/ui/heading'

// One page container for every page (pattern "navigation"): the content
// never jumps from one page to the next.

type Props = {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function Page({ title, description, action, children }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-section px-page py-section">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Heading level={1}>{title}</Heading>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

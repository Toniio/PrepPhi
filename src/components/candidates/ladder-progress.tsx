import { CheckIcon, LockIcon } from '@phosphor-icons/react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Candidate component (absent from DSAIReadable): spec in LadderProgress.md.

export type LadderProgressStep = {
  level: number
  nameFr: string
  /** `3 × 8–12`, `30–60 s`. */
  rangeLabel: string
}

export type LadderProgressLabels = {
  list: (ladder: string) => string
  done: string
  current: string
  upcoming: string
  locked: string
}

export const LADDER_PROGRESS_LABELS_FR: LadderProgressLabels = {
  list: (ladder) => `Paliers de l’échelle ${ladder}`,
  done: 'franchi',
  current: 'palier actuel',
  upcoming: 'à venir',
  locked: 'verrouillé',
}

const markerVariants = cva('flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium', {
  variants: {
    status: {
      done: 'border-primary bg-primary text-primary-foreground',
      current: 'border-foreground bg-background text-foreground',
      upcoming: 'border-border bg-background text-muted-foreground',
      locked: 'border-border bg-muted text-muted-foreground',
    },
  },
  defaultVariants: { status: 'upcoming' },
})

const textVariants = cva('text-xs', {
  variants: {
    status: {
      done: 'text-muted-foreground',
      current: 'font-medium text-foreground',
      upcoming: 'text-muted-foreground',
      locked: 'text-muted-foreground',
    },
  },
  defaultVariants: { status: 'upcoming' },
})

type Status = 'done' | 'current' | 'upcoming' | 'locked'

type Props = {
  ladderName: string
  steps: LadderProgressStep[]
  current: number
  unlocked: boolean
  /** Shown under the current step: the targets, a proposal. */
  currentDetail?: React.ReactNode
  labels?: LadderProgressLabels
  className?: string
}

export function LadderProgress({
  ladderName,
  steps,
  current,
  unlocked,
  currentDetail,
  labels = LADDER_PROGRESS_LABELS_FR,
  className,
}: Props) {
  const statusOf = (level: number): Status =>
    !unlocked ? 'locked' : level < current ? 'done' : level === current ? 'current' : 'upcoming'

  return (
    <ol data-slot="ladder-progress" aria-label={labels.list(ladderName)} className={cn('flex flex-col', className)}>
      {steps.map((step, index) => {
        const status = statusOf(step.level)
        return (
          <li
            key={step.level}
            data-slot="ladder-progress-step"
            data-status={status}
            aria-current={status === 'current' ? 'step' : undefined}
            className="relative flex gap-3 pb-3 last:pb-0"
          >
            {index < steps.length - 1 && (
              <span
                aria-hidden
                data-slot="ladder-progress-rail"
                className="absolute top-6 bottom-0 left-3 w-px bg-border"
              />
            )}
            <span aria-hidden className={markerVariants({ status })}>
              {status === 'done' ? (
                <CheckIcon className="size-3" />
              ) : status === 'locked' ? (
                <LockIcon className="size-3" />
              ) : (
                step.level
              )}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
              <span className={textVariants({ status })}>
                {step.nameFr}
                <span className="sr-only">, {labels[status]}</span>
              </span>
              <span className="text-xs text-muted-foreground">{step.rangeLabel}</span>
              {status === 'current' && currentDetail}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

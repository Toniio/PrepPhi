import { CheckIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react'
import { cva } from 'class-variance-authority'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Candidate component (absent from DSAIReadable): spec in SetCounter.md.

export type SetCounterLabels = {
  set: (index: number) => string
  decrease: (index: number) => string
  increase: (index: number) => string
  target: (value: string) => string
  done: string
  markDone: (index: number) => string
}

export const SET_COUNTER_LABELS_FR: SetCounterLabels = {
  set: (i) => `Série ${i + 1}`,
  decrease: (i) => `Retirer une unité à la série ${i + 1}`,
  increase: (i) => `Ajouter une unité à la série ${i + 1}`,
  target: (value) => `cible ${value}`,
  done: 'Faite',
  markDone: (i) => `Marquer la série ${i + 1} comme faite`,
}

const rowVariants = cva('flex items-center gap-2 py-1.5', {
  variants: {
    done: {
      true: 'text-foreground',
      false: 'text-muted-foreground',
    },
  },
  defaultVariants: { done: false },
})

type Props = {
  /** Target per set; the values start there. */
  targets: number[]
  values: number[]
  onValuesChange: (values: number[]) => void
  completed: boolean[]
  /** Called when a set is marked done, to start the rest timer. */
  onSetDone?: (index: number) => void
  onCompletedChange: (completed: boolean[]) => void
  unit: 'reps' | 's'
  /** +1 rep, or +5 s on a hold. */
  step?: number
  format: (value: number) => string
  /** False for a plain counter (a total, a number of holds): no done button. */
  showDone?: boolean
  labels?: SetCounterLabels
  className?: string
}

export function SetCounter({
  targets,
  values,
  onValuesChange,
  completed,
  onSetDone,
  onCompletedChange,
  unit,
  step = unit === 's' ? 5 : 1,
  format,
  showDone = true,
  labels = SET_COUNTER_LABELS_FR,
  className,
}: Props) {
  const change = (index: number, delta: number) => {
    const next = [...values]
    next[index] = Math.max(0, (next[index] ?? 0) + delta)
    onValuesChange(next)
  }
  const markDone = (index: number) => {
    const next = [...completed]
    next[index] = !next[index]
    onCompletedChange(next)
    if (next[index]) onSetDone?.(index)
  }

  return (
    <div data-slot="set-counter" role="group" className={cn('flex flex-col', className)}>
      {targets.map((target, index) => (
        <div
          key={index}
          data-slot="set-counter-row"
          data-done={completed[index] ?? false}
          className={rowVariants({ done: completed[index] ?? false })}
        >
          <span data-slot="set-counter-label" className="w-16 shrink-0 text-xs">
            {labels.set(index)}
          </span>
          <Button
            variant="outline"
            size="icon"
            aria-label={labels.decrease(index)}
            onClick={() => change(index, -step)}
          >
            <MinusIcon />
          </Button>
          <span
            data-slot="set-counter-value"
            aria-live="polite"
            className="w-16 text-center text-sm font-medium tabular-nums text-foreground"
          >
            {format(values[index] ?? target)}
          </span>
          <Button variant="outline" size="icon" aria-label={labels.increase(index)} onClick={() => change(index, step)}>
            <PlusIcon />
          </Button>
          <span data-slot="set-counter-target" className="hidden text-xs text-muted-foreground sm:inline">
            {labels.target(format(target))}
          </span>
          {showDone && (
            <Button
              className="ml-auto"
              size="sm"
              variant={completed[index] ? 'secondary' : 'outline'}
              aria-pressed={completed[index] ?? false}
              aria-label={labels.markDone(index)}
              onClick={() => markDone(index)}
            >
              <CheckIcon />
              {labels.done}
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}

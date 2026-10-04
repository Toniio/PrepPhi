import { CalendarXIcon, FloppyDiskIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ExerciseCard } from '@/components/candidates/exercise-card'
import { RestTimer, Sequencer } from '@/components/candidates/sequencer'
import { SetCounter } from '@/components/candidates/set-counter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { getExercise } from '@/catalog'
import type { ExerciseResult, Feeling, PlannedExercise, PlannedSession, WeekId } from '@/engine'
import { FEELINGS, formatMinutes, formatTargets, formatValue, LEVEL } from '@/i18n/fr'
import { checkIn } from '@/model/actions'
import { useAppData } from '@/model/context'
import { eventMessages } from './messages'
import { usePostpone } from './usePostpone'
import { useDraft } from './useDraft'

const HOLD_SECONDS = 15

type ExerciseDraft = {
  values: number[]
  completed: boolean[]
  feeling: Feeling
  pain: boolean
  /** Cumulative step: holds of at least 15 s. */
  longHolds: number
}

function initialDraft(exercises: PlannedExercise[]): Record<string, ExerciseDraft> {
  return Object.fromEntries(
    exercises.map((e) => [
      e.ladderId,
      { values: [...e.targets], completed: e.targets.map(() => false), feeling: 'right', pain: false, longHolds: 0 },
    ]),
  )
}

/**
 * A cumulative step is logged as its holds: the long holds of 15 s, then the
 * rest of the total, so the engine reads both the total and the holds.
 */
function valuesOf(exercise: PlannedExercise, draft: ExerciseDraft): number[] {
  if (!exercise.cumulative) return draft.values
  const total = draft.values[0] ?? 0
  const long = Math.min(draft.longHolds, Math.floor(total / HOLD_SECONDS))
  const rest = total - long * HOLD_SECONDS
  return [...Array(long).fill(HOLD_SECONDS), ...(rest > 0 ? [rest] : [])]
}

function FeelingPicker({
  labelId,
  value,
  onChange,
}: {
  labelId: string
  value: Feeling
  onChange: (f: Feeling) => void
}) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      aria-labelledby={labelId}
      value={value}
      onValueChange={(next) => next && onChange(next as Feeling)}
    >
      {FEELINGS.map((f) => (
        <ToggleGroupItem key={f.value} value={f.value}>
          {f.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function ExerciseBlock({
  exercise,
  draft,
  onChange,
}: {
  exercise: PlannedExercise
  draft: ExerciseDraft
  onChange: (draft: ExerciseDraft) => void
}) {
  const [resting, setResting] = useState<number | null>(null)
  const info = getExercise(exercise.exercise)
  const format = (v: number) => formatValue(v, exercise.unit)
  const targets = exercise.cumulative
    ? `${formatValue(exercise.targets[0], 's')} cumulées, tenues de ${HOLD_SECONDS} s ou plus`
    : formatTargets(exercise.targets, exercise.unit, exercise.perSide)

  return (
    <ExerciseCard exercise={info} levelLabel={LEVEL(exercise.level)} targetsLabel={targets}>
      <SetCounter
        targets={exercise.targets}
        values={draft.values}
        onValuesChange={(values) => onChange({ ...draft, values })}
        completed={draft.completed}
        onCompletedChange={(completed) => onChange({ ...draft, completed })}
        onSetDone={(index) => setResting(index < exercise.sets - 1 ? Date.now() : null)}
        unit={exercise.unit}
        format={format}
        showDone={!exercise.cumulative}
        labels={
          exercise.cumulative
            ? {
                set: () => 'Total',
                decrease: () => 'Retirer 5 secondes au total',
                increase: () => 'Ajouter 5 secondes au total',
                target: (v) => `cible ${v}`,
                done: 'Faite',
                markDone: () => 'Marquer comme fait',
              }
            : undefined
        }
      />
      {exercise.cumulative && (
        <SetCounter
          targets={[0]}
          values={[draft.longHolds]}
          onValuesChange={([longHolds]) => onChange({ ...draft, longHolds })}
          completed={[false]}
          onCompletedChange={() => {}}
          unit="reps"
          format={(v) => `${v}`}
          showDone={false}
          labels={{
            set: () => `Tenues ≥ ${HOLD_SECONDS} s`,
            decrease: () => 'Retirer une tenue',
            increase: () => 'Ajouter une tenue',
            target: () => '',
            done: 'Faite',
            markDone: () => '',
          }}
        />
      )}
      {resting !== null && <RestTimer key={resting} seconds={exercise.restSec} onComplete={() => setResting(null)} />}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground" id={`${exercise.ladderId}-feeling-label`}>
          Ressenti
        </span>
        <FeelingPicker
          labelId={`${exercise.ladderId}-feeling-label`}
          value={draft.feeling}
          onChange={(feeling) => onChange({ ...draft, feeling })}
        />
      </div>
      <Field orientation="horizontal">
        <Checkbox
          id={`${exercise.ladderId}-pain`}
          checked={draft.pain}
          onCheckedChange={(checked) => onChange({ ...draft, pain: checked === true })}
        />
        <FieldLabel htmlFor={`${exercise.ladderId}-pain`}>Douleur pendant l’exercice</FieldLabel>
      </Field>
    </ExerciseCard>
  )
}

export function StrengthSession({ session, weekId }: { session: PlannedSession; weekId: WeekId }) {
  const { update, today } = useAppData()
  const [drafts, setDrafts, clearDraft] = useDraft(session.id, () => initialDraft(session.exercises))
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    const results: ExerciseResult[] = session.exercises.map((exercise) => {
      const draft = drafts[exercise.ladderId]
      return {
        ladderId: exercise.ladderId,
        level: exercise.level,
        values: valuesOf(exercise, draft),
        feeling: draft.feeling,
        pain: draft.pain,
      }
    })
    let lines: string[] = []
    await update((data) => {
      const outcome = checkIn(data, { weekId, sessionId: session.id, date: today, results })
      lines = eventMessages(outcome.events, outcome.unlocked)
      return outcome.data
    })
    clearDraft()
    setSaving(false)
    toast.success('Bilan enregistré.', { description: lines.join(' ') || undefined })
  }

  const postpone = usePostpone(weekId, session.id, clearDraft)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{session.title}</CardTitle>
          <CardDescription>
            {formatMinutes(session.durationMin)} environ · {session.exercises.length} exercices
          </CardDescription>
        </CardHeader>
        {session.coachNote && (
          <CardContent>
            <p className="text-xs">{session.coachNote}</p>
          </CardContent>
        )}
      </Card>

      {session.exercises.map((exercise) => (
        <ExerciseBlock
          key={exercise.ladderId}
          exercise={exercise}
          draft={drafts[exercise.ladderId] ?? initialDraft([exercise])[exercise.ladderId]}
          onChange={(draft) => setDrafts({ ...drafts, [exercise.ladderId]: draft })}
        />
      ))}

      {session.accessories?.map((accessory) => (
        <ExerciseCard
          key={accessory.exercise}
          exercise={getExercise(accessory.exercise)}
          targetsLabel={`${formatTargets(Array(accessory.sets).fill(accessory.target), accessory.unit)} · accessoire`}
        />
      ))}

      {session.sequences.map((sequence) => (
        <Card key={sequence.label}>
          <CardHeader>
            <CardTitle>{sequence.label}</CardTitle>
            <CardDescription>
              {sequence.rounds} tours ·{' '}
              {sequence.blocks
                .filter((b) => b.kind === 'work')
                .map((b) => b.label)
                .join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Sequencer sequence={sequence} />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="text-xs text-muted-foreground">
          Les répétitions sont pré-remplies avec tes cibles : corrige seulement ce qui a changé.
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving}>
            <FloppyDiskIcon />
            Enregistrer le bilan
          </Button>
          <Button variant="outline" onClick={postpone} disabled={saving}>
            <CalendarXIcon />
            Reporter la séance
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

import { CalendarXIcon, FloppyDiskIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Sequencer } from '@/components/candidates/sequencer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import type { PlannedSession, WeekId } from '@/engine'
import { formatMinutes } from '@/i18n/fr'
import { logElliptical } from '@/model/actions'
import { useAppData } from '@/model/context'
import { usePostpone } from './usePostpone'
import { useDraft } from './useDraft'

type Draft = { durationMin: string; resistance: string; rpe: number }

export function EllipticalSession({ session, weekId }: { session: PlannedSession; weekId: WeekId }) {
  const { update, today } = useAppData()
  const cardio = session.cardio
  const [draft, setDraft, clearDraft] = useDraft<Draft>(session.id, () => ({
    durationMin: String(cardio?.durationMin ?? session.durationMin),
    resistance: cardio?.resistance != null ? String(cardio.resistance) : '',
    rpe: 4,
  }))
  const [saving, setSaving] = useState(false)
  const [checked, setChecked] = useState(false)
  const duration = Number(draft.durationMin.replace(',', '.'))
  const durationInvalid = !Number.isFinite(duration) || duration < 5 || duration > 180
  const showError = checked && durationInvalid
  const zone = cardio?.hrZone

  const save = async () => {
    setChecked(true)
    if (durationInvalid) {
      document.getElementById('elliptical-duration')?.focus()
      return
    }
    setSaving(true)
    await update((data) =>
      logElliptical(data, {
        weekId,
        sessionId: session.id,
        date: today,
        durationMin: Math.round(duration),
        rpe: draft.rpe,
        resistance: draft.resistance === '' ? null : Number(draft.resistance),
      }),
    )
    clearDraft()
    setSaving(false)
    toast.success('Bilan enregistré.', {
      description: 'La fréquence cardiaque arrivera avec l’import Garmin de la semaine.',
    })
  }

  const postpone = usePostpone(weekId, session.id, clearDraft)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{session.title}</CardTitle>
          <CardDescription>
            {formatMinutes(cardio?.durationMin ?? session.durationMin)}
            {cardio?.resistance != null && ` · résistance ${cardio.resistance}`}
            {zone && ` · FC entre ${zone[0]} et ${zone[1]} bpm`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-xs">
          <p>Effort visé : 3 à 4 sur 10, tu dois pouvoir parler en phrases courtes.</p>
          {session.coachNote && <p>{session.coachNote}</p>}
        </CardContent>
      </Card>

      {session.sequences.map((sequence) => (
        <Card key={sequence.label}>
          <CardHeader>
            <CardTitle>{sequence.label}</CardTitle>
            <CardDescription>{sequence.rounds} × (1 min rapide / 2 min récupération)</CardDescription>
          </CardHeader>
          <CardContent>
            <Sequencer sequence={sequence} />
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Bilan</CardTitle>
          <CardDescription>
            La fréquence cardiaque vient de l’import Garmin : note ici ce que la montre ne sait pas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={showError || undefined}>
              <FieldLabel htmlFor="elliptical-duration">Durée, en minutes</FieldLabel>
              <Input
                id="elliptical-duration"
                inputMode="numeric"
                value={draft.durationMin}
                aria-invalid={showError || undefined}
                aria-describedby={showError ? 'elliptical-duration-error' : 'elliptical-duration-help'}
                onChange={(e) => setDraft({ ...draft, durationMin: e.target.value })}
              />
              {showError ? (
                <FieldError id="elliptical-duration-error">Entre une durée entre 5 et 180 minutes.</FieldError>
              ) : (
                <FieldDescription id="elliptical-duration-help">Entre 5 et 180 minutes.</FieldDescription>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="elliptical-resistance">Résistance (facultatif)</FieldLabel>
              <Input
                id="elliptical-resistance"
                inputMode="numeric"
                value={draft.resistance}
                onChange={(e) => setDraft({ ...draft, resistance: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel id="elliptical-rpe-label">Effort perçu : {draft.rpe} sur 10</FieldLabel>
              <Slider
                min={1}
                max={10}
                step={1}
                value={[draft.rpe]}
                onValueChange={([rpe]) => setDraft({ ...draft, rpe })}
                aria-labelledby="elliptical-rpe-label"
              />
              <FieldDescription>1 : très facile. 10 : effort maximal.</FieldDescription>
            </Field>
          </FieldGroup>
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

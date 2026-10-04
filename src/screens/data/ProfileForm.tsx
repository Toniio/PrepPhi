import { FloppyDiskIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Profile } from '@/engine'
import { WEEKDAYS } from '@/i18n/fr'
import { updateProfile } from '@/model/actions'
import { useAppData } from '@/model/context'

type Draft = {
  availableDays: string[]
  calisthenicsPerWeek: string
  ellipticalPerWeek: string
  parkSessions: boolean
  freeWallAtHome: boolean
  preferredTime: string
  barLengthCm: string
  restingHr: string
  maxHr: string
  age: string
}

const text = (n: number | null) => (n === null ? '' : String(n))
const num = (s: string) => (s.trim() === '' ? null : Number(s.replace(',', '.')))

function toDraft(p: Profile): Draft {
  return {
    availableDays: p.availableDays.map(String),
    calisthenicsPerWeek: String(p.calisthenicsPerWeek),
    ellipticalPerWeek: String(p.ellipticalPerWeek),
    parkSessions: p.parkSessions,
    freeWallAtHome: p.freeWallAtHome,
    preferredTime: p.preferredTime,
    barLengthCm: text(p.barLengthCm),
    restingHr: text(p.restingHr),
    maxHr: text(p.maxHr),
    age: text(p.age),
  }
}

/** The answers of the onboarding, editable; the next plan uses them. */
export function ProfileForm() {
  const { data, update } = useAppData()
  const profile = data.profile!
  const [draft, setDraft] = useState<Draft>(() => toDraft(profile))
  const [checked, setChecked] = useState(false)
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch })

  const resting = num(draft.restingHr)
  const restingInvalid = resting === null || !Number.isFinite(resting) || resting < 30 || resting > 110
  const daysInvalid = draft.availableDays.length === 0
  const invalid = restingInvalid || daysInvalid

  const save = async () => {
    setChecked(true)
    if (invalid) {
      document.getElementById(daysInvalid ? 'profile-days' : 'profile-resting')?.focus()
      return
    }
    await update((d) =>
      updateProfile(d, {
        ...profile,
        availableDays: draft.availableDays.map(Number).sort(),
        calisthenicsPerWeek: Number(draft.calisthenicsPerWeek),
        ellipticalPerWeek: Number(draft.ellipticalPerWeek),
        parkSessions: draft.parkSessions,
        freeWallAtHome: draft.freeWallAtHome,
        preferredTime: draft.preferredTime || '18:30',
        barLengthCm: num(draft.barLengthCm),
        restingHr: resting,
        maxHr: num(draft.maxHr),
        age: num(draft.age),
      }),
    )
    toast.success('Profil enregistré. Le prochain plan en tiendra compte.')
  }

  return (
    <FieldGroup>
      <Field data-invalid={checked && daysInvalid ? true : undefined}>
        <FieldLabel id="profile-days-label">Jours disponibles</FieldLabel>
        <ToggleGroup
          id="profile-days"
          type="multiple"
          variant="outline"
          size="sm"
          aria-labelledby="profile-days-label"
          value={draft.availableDays}
          onValueChange={(availableDays) => set({ availableDays })}
          className="flex-wrap"
        >
          {WEEKDAYS.map((day, i) => (
            <ToggleGroupItem key={day} value={String(i + 1)} aria-label={day}>
              {day.slice(0, 3)}.
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {checked && daysInvalid && <FieldError>Choisis au moins un jour.</FieldError>}
      </Field>
      <FieldSet>
        <FieldLegend variant="label">Séances de callisthénie par semaine</FieldLegend>
        <RadioGroup
          value={draft.calisthenicsPerWeek}
          onValueChange={(calisthenicsPerWeek) => set({ calisthenicsPerWeek })}
          className="flex gap-4"
        >
          {['2', '3', '4'].map((n) => (
            <Field key={n} orientation="horizontal">
              <RadioGroupItem value={n} id={`cal-${n}`} />
              <FieldLabel htmlFor={`cal-${n}`}>{n}</FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Séances d’elliptique par semaine</FieldLegend>
        <RadioGroup
          value={draft.ellipticalPerWeek}
          onValueChange={(ellipticalPerWeek) => set({ ellipticalPerWeek })}
          className="flex gap-4"
        >
          {['0', '1', '2', '3'].map((n) => (
            <Field key={n} orientation="horizontal">
              <RadioGroupItem value={n} id={`ell-${n}`} />
              <FieldLabel htmlFor={`ell-${n}`}>{n}</FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>
      <Field orientation="horizontal">
        <Switch id="profile-park" checked={draft.parkSessions} onCheckedChange={(parkSessions) => set({ parkSessions })} />
        <FieldContent>
          <FieldLabel htmlFor="profile-park">Séance au parc le week-end</FieldLabel>
          <FieldDescription>Facultative, pour le muscle-up.</FieldDescription>
        </FieldContent>
      </Field>
      <Field orientation="horizontal">
        <Switch
          id="profile-wall"
          checked={draft.freeWallAtHome}
          onCheckedChange={(freeWallAtHome) => set({ freeWallAtHome })}
        />
        <FieldLabel htmlFor="profile-wall">Mur libre à la maison</FieldLabel>
      </Field>
      <Field>
        <FieldLabel htmlFor="profile-time">Heure habituelle</FieldLabel>
        <Input
          id="profile-time"
          type="time"
          value={draft.preferredTime}
          onChange={(e) => set({ preferredTime: e.target.value })}
        />
      </Field>
      <Field data-invalid={checked && restingInvalid ? true : undefined}>
        <FieldLabel htmlFor="profile-resting">FC de repos, en bpm</FieldLabel>
        <Input
          id="profile-resting"
          inputMode="numeric"
          value={draft.restingHr}
          aria-invalid={checked && restingInvalid ? true : undefined}
          onChange={(e) => set({ restingHr: e.target.value })}
        />
        {checked && restingInvalid && <FieldError>Entre une valeur entre 30 et 110 bpm.</FieldError>}
      </Field>
      <Field>
        <FieldLabel htmlFor="profile-max">FC maximale, en bpm (facultatif)</FieldLabel>
        <Input id="profile-max" inputMode="numeric" value={draft.maxHr} onChange={(e) => set({ maxHr: e.target.value })} />
        <FieldDescription>Sans valeur, elle est estimée à partir de ton âge.</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="profile-age">Âge (facultatif)</FieldLabel>
        <Input id="profile-age" inputMode="numeric" value={draft.age} onChange={(e) => set({ age: e.target.value })} />
      </Field>
      <Field>
        <FieldLabel htmlFor="profile-bar">Longueur de la barre de porte, en cm (facultatif)</FieldLabel>
        <Input
          id="profile-bar"
          inputMode="numeric"
          value={draft.barLengthCm}
          onChange={(e) => set({ barLengthCm: e.target.value })}
        />
      </Field>
      <Button onClick={save} className="self-start">
        <FloppyDiskIcon />
        Enregistrer le profil
      </Button>
    </FieldGroup>
  )
}

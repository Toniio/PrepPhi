import { ArrowLeftIcon, CheckIcon, PlayIcon, XIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { buildDemoData } from '@/demo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireTitle,
} from '@/components/ui/questionnaire'
import { getStep, LADDERS, type LadderState, type Profile } from '@/engine'
import { formatRange, formatTargets, WEEKDAYS } from '@/i18n/fr'
import { completeOnboarding, redoOnboarding } from '@/model/actions'
import { useAppData } from '@/model/context'
import { Page } from '@/shell/Page'
import { QuestionnaireFr } from './onboarding/QuestionnaireFr'
import { CALISTHENICS_HINT, SESSION_COUNTS } from './onboarding/sessionCounts'

type Rhythm = Pick<
  Profile,
  'availableDays' | 'calisthenicsPerWeek' | 'ellipticalPerWeek' | 'parkSessions' | 'preferredTime' | 'freeWallAtHome'
>
type Body = Pick<Profile, 'barLengthCm' | 'restingHr' | 'maxHr' | 'age' | 'ellipticalResistance'>

/** The answers and placement already given, when the onboarding is done again. */
export type PreviousAnswers = { profile: Profile; ladderState: Record<string, LadderState> }

const REQUIRED_ERROR = 'Choisis une réponse pour continuer.'
const OPTIONAL_ERROR = 'Choisis une réponse, ou passe la question.'

const countLabel = (n: string) => (n === '0' ? 'Aucune' : `${n} séance${n === '1' ? '' : 's'}`)

/** The answers given before, kept in view while the new ones are entered. */
function Reference({ lines }: { lines: string[] }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Tes réponses actuelles</CardTitle>
        <CardDescription>Elles sont déjà cochées ou remplies : change seulement ce qui a évolué.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1 text-xs">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

const orMissing = (value: number | null, unit: string) => (value === null ? 'non renseignée' : `${value} ${unit}`)

function rhythmReference(p: Profile): string[] {
  const days = p.availableDays.length === 7 ? 'tous les jours' : p.availableDays.map((d) => WEEKDAYS[d - 1]).join(', ')
  return [
    `Jours disponibles : ${days}.`,
    `${countLabel(String(p.calisthenicsPerWeek))} de callisthénie, ${countLabel(String(p.ellipticalPerWeek)).toLowerCase()} d’elliptique par semaine.`,
    `Séance au parc : ${p.parkSessions ? 'oui' : 'non'}. Mur libre à la maison : ${p.freeWallAtHome ? 'oui' : 'non'}.`,
    `Heure habituelle : ${p.preferredTime.replace(':', ' h ')}.`,
  ]
}

function bodyReference(p: Profile): string[] {
  return [
    `Barre de porte : ${p.barLengthCm === null ? 'longueur non renseignée' : `${p.barLengthCm} cm`}.`,
    `FC de repos : ${orMissing(p.restingHr, 'bpm')}. FC maximale : ${p.maxHr === null ? 'estimée à partir de l’âge' : `${p.maxHr} bpm`}. Âge : ${p.age === null ? 'non renseigné' : `${p.age} ans`}.`,
    `Résistance de l’elliptique : de ${p.ellipticalResistance.min} à ${p.ellipticalResistance.max}.`,
  ]
}

const number = (value: FormDataEntryValue | null): number | null => {
  const n = Number(String(value ?? '').replace(',', '.'))
  return String(value ?? '').trim() === '' || !Number.isFinite(n) ? null : n
}

function RhythmStep({
  reference,
  initial,
  onDone,
}: {
  reference?: Profile
  initial?: Rhythm
  onDone: (rhythm: Rhythm) => void
}) {
  const calisthenics = String(initial?.calisthenicsPerWeek ?? 3)
  const elliptical = String(initial?.ellipticalPerWeek ?? 2)
  return (
    <>
      {reference && <Reference lines={rhythmReference(reference)} />}
      <QuestionnaireFr
        submitLabel="Continuer"
        onAnswers={(form) =>
          onDone({
            availableDays: form.getAll('days').map(Number).sort(),
            calisthenicsPerWeek: Number(form.get('calisthenics') ?? 3),
            ellipticalPerWeek: Number(form.get('elliptical') ?? 2),
            parkSessions: form.get('park') === 'yes',
            preferredTime: String(form.get('time') || '18:30'),
            freeWallAtHome: form.get('wall') !== 'no',
          })
        }
      >
        <QuestionnaireItem name="days" multiple required>
          <QuestionnaireTitle>Quels jours peux-tu t’entraîner ?</QuestionnaireTitle>
          <QuestionnaireDescription>
            Coche tous les jours possibles. Le plan n’en utilise qu’une partie.
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            {WEEKDAYS.map((day, i) => (
              <QuestionnaireChoice
                key={day}
                value={String(i + 1)}
                defaultChecked={initial?.availableDays.includes(i + 1) ?? true}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>{REQUIRED_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="calisthenics" required>
          <QuestionnaireTitle>Combien de séances de callisthénie par semaine ?</QuestionnaireTitle>
          <QuestionnaireDescription>{CALISTHENICS_HINT}</QuestionnaireDescription>
          <QuestionnaireChoices className="grid-cols-2 sm:grid-cols-4">
            {SESSION_COUNTS.map((n) => (
              <QuestionnaireChoice key={n} value={n} defaultChecked={n === calisthenics}>
                {countLabel(n)}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>{REQUIRED_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="elliptical" required>
          <QuestionnaireTitle>Combien de séances d’elliptique par semaine ?</QuestionnaireTitle>
          <QuestionnaireChoices className="grid-cols-2 sm:grid-cols-4">
            {SESSION_COUNTS.map((n) => (
              <QuestionnaireChoice key={n} value={n} defaultChecked={n === elliptical}>
                {countLabel(n)}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>{REQUIRED_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="park" required>
          <QuestionnaireTitle>Une séance au parc le week-end, pour le muscle-up ?</QuestionnaireTitle>
          <QuestionnaireDescription>
            Elle reste facultative : la manquer ne compte pas comme une séance ratée.
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="yes" defaultChecked={initial?.parkSessions ?? true}>
              Oui, quand je peux
            </QuestionnaireChoice>
            <QuestionnaireChoice value="no" defaultChecked={initial ? !initial.parkSessions : false}>
              Pas pour l’instant
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>{REQUIRED_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="wall" required>
          <QuestionnaireTitle>As-tu un mur libre à la maison pour le handstand ?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="yes" defaultChecked={initial?.freeWallAtHome ?? true}>
              Oui
            </QuestionnaireChoice>
            <QuestionnaireChoice value="no" defaultChecked={initial ? !initial.freeWallAtHome : false}>
              Non
            </QuestionnaireChoice>
          </QuestionnaireChoices>
          <QuestionnaireError>{REQUIRED_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="time">
          <QuestionnaireTitle>À quelle heure t’entraînes-tu d’habitude ?</QuestionnaireTitle>
          <QuestionnaireDescription>Elle sert aux séances ajoutées à ton agenda.</QuestionnaireDescription>
          <QuestionnaireInput
            type="time"
            defaultValue={initial?.preferredTime ?? '18:30'}
            aria-label="Heure habituelle"
          />
          <QuestionnaireError>{OPTIONAL_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
      </QuestionnaireFr>
    </>
  )
}

function BodyStep({
  reference,
  initial,
  onDone,
}: {
  reference?: Profile
  initial?: Body
  onDone: (body: Body) => void
}) {
  return (
    <>
      {reference && <Reference lines={bodyReference(reference)} />}
      <QuestionnaireFr
        submitLabel="Continuer"
        onAnswers={(form) => {
          const min = number(form.get('rmin')) ?? 1
          const max = number(form.get('rmax')) ?? 16
          onDone({
            barLengthCm: number(form.get('bar')),
            restingHr: number(form.get('restingHr')),
            maxHr: number(form.get('maxHr')),
            age: number(form.get('age')),
            ellipticalResistance: { min: Math.min(min, max), max: Math.max(min, max) },
          })
        }}
      >
        <QuestionnaireItem name="bar">
          <QuestionnaireTitle>Quelle est la longueur de ta barre de porte, en cm ?</QuestionnaireTitle>
          <QuestionnaireDescription>
            Les tractions prise large et archer demandent de la place entre les mains.
          </QuestionnaireDescription>
          <QuestionnaireInput
            type="number"
            inputMode="numeric"
            min={40}
            max={150}
            defaultValue={initial?.barLengthCm ?? undefined}
            aria-label="Longueur de la barre en cm"
          />
          <QuestionnaireError>{OPTIONAL_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="restingHr" required>
          <QuestionnaireTitle>Quelle est ta fréquence cardiaque de repos, en bpm ?</QuestionnaireTitle>
          <QuestionnaireDescription>Ta montre l’affiche, en général entre 45 et 75.</QuestionnaireDescription>
          <QuestionnaireInput
            type="number"
            inputMode="numeric"
            min={30}
            max={110}
            required
            defaultValue={initial?.restingHr ?? undefined}
            aria-label="Fréquence cardiaque de repos en bpm"
          />
          <QuestionnaireError>Entre une valeur entre 30 et 110 bpm.</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="maxHr">
          <QuestionnaireTitle>Connais-tu ta fréquence cardiaque maximale, en bpm ?</QuestionnaireTitle>
          <QuestionnaireDescription>Sinon, passe : ton âge suffit pour l’estimer.</QuestionnaireDescription>
          <QuestionnaireInput
            type="number"
            inputMode="numeric"
            min={120}
            max={230}
            defaultValue={initial?.maxHr ?? undefined}
            aria-label="Fréquence cardiaque maximale en bpm"
          />
          <QuestionnaireError>{OPTIONAL_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="age">
          <QuestionnaireTitle>Quel âge as-tu ?</QuestionnaireTitle>
          <QuestionnaireInput
            type="number"
            inputMode="numeric"
            min={14}
            max={99}
            defaultValue={initial?.age ?? undefined}
            aria-label="Âge"
          />
          <QuestionnaireError>{OPTIONAL_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="rmin">
          <QuestionnaireTitle>Quelle est la résistance la plus basse de ton elliptique ?</QuestionnaireTitle>
          <QuestionnaireInput
            type="number"
            inputMode="numeric"
            min={0}
            max={50}
            defaultValue={initial?.ellipticalResistance.min ?? 1}
            aria-label="Résistance minimale"
          />
          <QuestionnaireError>{OPTIONAL_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem name="rmax">
          <QuestionnaireTitle>Et la plus haute ?</QuestionnaireTitle>
          <QuestionnaireInput
            type="number"
            inputMode="numeric"
            min={1}
            max={50}
            defaultValue={initial?.ellipticalResistance.max ?? 16}
            aria-label="Résistance maximale"
          />
          <QuestionnaireError>{OPTIONAL_ERROR}</QuestionnaireError>
        </QuestionnaireItem>
      </QuestionnaireFr>
    </>
  )
}

const BASE_LADDERS = LADDERS.filter((l) => l.entry === null)

type Placement = Record<string, { level: number; value: string }>

function PlacementStep({
  previous,
  onDone,
}: {
  previous?: PreviousAnswers
  onDone: (tested: Record<string, Record<number, number>>) => void
}) {
  // Redone, each ladder opens on its current step; left without a value, it keeps it.
  const [placement, setPlacement] = useState<Placement>(() =>
    Object.fromEntries(BASE_LADDERS.map((l) => [l.id, { level: previous?.ladderState[l.id]?.level ?? 1, value: '' }])),
  )

  const finish = () => {
    const tested: Record<string, Record<number, number>> = {}
    for (const ladder of BASE_LADDERS) {
      const { level, value } = placement[ladder.id]
      const n = number(value)
      if (n === null) continue
      // The steps below the one tried count as held: placement keeps the
      // tried step if its bottom is held, else the one under it.
      const results: Record<number, number> = {}
      for (const step of ladder.steps.filter((s) => s.level < level)) results[step.level] = step.range[1]
      results[level] = n
      tested[ladder.id] = results
    }
    onDone(tested)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Pour chaque échelle, essaie les paliers dans l’ordre. Arrête-toi au premier dont tu ne tiens pas le bas de la
        fourchette sur une série propre, et note ta meilleure série au dernier palier essayé.{' '}
        {previous
          ? 'Sans valeur, l’échelle garde son palier actuel : laisse vide celles que tu ne retestes pas.'
          : 'Sans valeur, l’échelle commence au palier 1.'}
      </p>
      {BASE_LADDERS.map((ladder) => {
        const current = placement[ladder.id]
        const step = ladder.steps.find((s) => s.level === current.level)!
        const unitLabel = step.unit === 's' ? 'secondes' : 'répétitions'
        const before = previous?.ladderState[ladder.id]
        return (
          <Card key={ladder.id} size="sm">
            <CardHeader>
              <CardTitle>{ladder.nameFr}</CardTitle>
              <CardDescription>
                {before
                  ? `Actuellement : palier ${before.level} sur ${ladder.steps.length}, ${getStep(ladder.id, before.level).nameFr}, cibles ${formatTargets(before.targets, getStep(ladder.id, before.level).unit, getStep(ladder.id, before.level).perSide)}.`
                  : `${ladder.steps.length} paliers`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor={`${ladder.id}-level`}>Dernier palier essayé</FieldLabel>
                  <NativeSelect
                    id={`${ladder.id}-level`}
                    value={String(current.level)}
                    onChange={(e) =>
                      setPlacement({ ...placement, [ladder.id]: { ...current, level: Number(e.target.value) } })
                    }
                  >
                    {ladder.steps.map((s) => (
                      <NativeSelectOption key={s.level} value={String(s.level)}>
                        {s.level}. {s.nameFr}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldDescription>Fourchette : {formatRange(step.range, step.unit, step.perSide)}</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${ladder.id}-value`}>Meilleure série, en {unitLabel} (facultatif)</FieldLabel>
                  <Input
                    id={`${ladder.id}-value`}
                    inputMode="numeric"
                    value={current.value}
                    onChange={(e) => setPlacement({ ...placement, [ladder.id]: { ...current, value: e.target.value } })}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        )
      })}
      <Button onClick={finish} className="self-start">
        <CheckIcon />
        {previous ? 'Terminer et mettre le plan à jour' : 'Terminer et voir ma séance'}
      </Button>
    </div>
  )
}

const STEPS = ['Ton rythme', 'Ton matériel et ton cœur', 'Ta séance test'] as const

type Props = {
  /** Set when the onboarding is done again: the answers and placement to start from and keep in view. */
  previous?: PreviousAnswers
  /** Leaves the redo without changing anything. */
  onExit?: () => void
}

export function OnboardingScreen({ previous, onExit }: Props) {
  const { update, replaceAll, today } = useAppData()
  const [step, setStep] = useState(0)
  const [rhythm, setRhythm] = useState<Rhythm | null>(null)
  const [body, setBody] = useState<Body | null>(null)
  const redo = previous !== undefined

  const complete = async (tested: Record<string, Record<number, number>>) => {
    if (!rhythm || !body) return
    const profile: Profile = { createdAt: today, ...rhythm, ...body }
    if (redo) {
      await update((data) => redoOnboarding(data, { profile, tested, today }))
      toast.success('Onboarding refait. Ton historique est intact et le plan de la semaine est à jour.')
      onExit?.()
      return
    }
    await update((data) => completeOnboarding(data, { profile, tested, today }))
    toast.success('Ton plan de la semaine est prêt.')
  }

  const intro = step < 2 ? 'Compte 2 à 3 minutes.' : 'Fais la séance test, puis note tes résultats.'

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Page
        title={redo ? 'Refaire l’onboarding' : 'Bienvenue dans PrepPhi'}
        description={`Étape ${step + 1} sur ${STEPS.length} : ${STEPS[step]}. ${redo ? 'Ton historique reste en place.' : intro}`}
        action={
          redo ? (
            <Button variant="outline" onClick={onExit}>
              <XIcon />
              Annuler
            </Button>
          ) : (
            <Button variant="outline" onClick={() => replaceAll(buildDemoData(today))}>
              <PlayIcon />
              Essayer avec des données de démo
            </Button>
          )
        }
      >
        {step === 0 && (
          <RhythmStep
            reference={previous?.profile}
            initial={rhythm ?? previous?.profile}
            onDone={(r) => {
              setRhythm(r)
              setStep(1)
            }}
          />
        )}
        {step === 1 && (
          <BodyStep
            reference={previous?.profile}
            initial={body ?? previous?.profile}
            onDone={(b) => {
              setBody(b)
              setStep(2)
            }}
          />
        )}
        {step === 2 && <PlacementStep previous={previous} onDone={complete} />}
        {step > 0 && (
          <Button variant="ghost" className="self-start" onClick={() => setStep(step - 1)}>
            <ArrowLeftIcon />
            Revenir à l’étape précédente
          </Button>
        )}
      </Page>
    </div>
  )
}

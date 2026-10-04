import { FirstAidIcon, PauseCircleIcon, WarningIcon } from '@phosphor-icons/react'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { familyOf, getLadder, getStep, type Family, type ReviewFacts, type Trip } from '@/engine'
import { formatDay } from '@/i18n/fr'
import { decideStepUp, reactivateFamily, reenterLadders } from '@/model/actions'
import { useAppData } from '@/model/context'
import { FAMILIES, list, TRIGGERS } from './labels'

export type ReviewChoices = {
  deload: boolean | null
  trips: Trip[]
  decisions: string[]
}

type Props = {
  facts: ReviewFacts
  nextTrips: Trip[]
  choices: ReviewChoices
  onChoices: (choices: ReviewChoices) => void
}

/** What the rules leave to Anthony: steps, semaine allégée, pain, breaks, trips. */
export function Decisions({ facts, nextTrips, choices, onChoices }: Props) {
  const { data, update } = useAppData()
  const record = (text: string, patch: Partial<ReviewChoices> = {}) =>
    onChoices({ ...choices, ...patch, decisions: [...choices.decisions, text] })

  const stepUps = Object.values(data.ladderState).filter((s) => s.stepUpProposed)
  const paused = [
    ...new Set(
      Object.values(data.ladderState)
        .filter((s) => s.paused)
        .map((s) => familyOf(s.ladderId)),
    ),
  ]
  const frozen = [
    ...new Set(
      Object.values(data.ladderState)
        .filter((s) => s.frozen && !s.paused)
        .map((s) => familyOf(s.ladderId)),
    ),
  ]
  const nothing =
    stepUps.length === 0 &&
    facts.deloadTriggers.length === 0 &&
    facts.recurringPain.length === 0 &&
    paused.length === 0 &&
    frozen.length === 0 &&
    facts.stale.length === 0 &&
    nextTrips.length === 0

  if (nothing)
    return (
      <p className="text-xs text-muted-foreground">Rien à décider cette semaine : les règles suivent leur cours.</p>
    )

  const reactivate = (family: Family) => {
    void update((d) => reactivateFamily(d, family))
    record(`Famille ${FAMILIES[family]} réactivée.`)
  }

  return (
    <div className="flex flex-col gap-4">
      {facts.recurringPain.length > 0 && (
        <Alert variant="destructive">
          <FirstAidIcon />
          <AlertTitle>Douleur deux semaines de suite : {list(facts.recurringPain.map((f) => FAMILIES[f]))}</AlertTitle>
          <AlertDescription>
            Consulte un médecin ou un kiné. Ces exercices restent en pause jusqu’à ce que tu les réactives.
          </AlertDescription>
        </Alert>
      )}

      {facts.deloadTriggers.length > 0 && (
        <Alert variant="warning">
          <WarningIcon />
          <AlertTitle>Semaine allégée proposée</AlertTitle>
          <AlertDescription>
            Cette semaine : {list(facts.deloadTriggers.map((t) => TRIGGERS[t]))}. La semaine prochaine garderait les
            mêmes exercices, avec 2 séries au lieu de 3, l’elliptique en zone basse et aucune progression.
          </AlertDescription>
          <AlertAction className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={choices.deload === true ? 'secondary' : 'outline'}
              aria-pressed={choices.deload === true}
              onClick={() => record('Semaine allégée acceptée.', { deload: true })}
            >
              Accepter
            </Button>
            <Button
              size="sm"
              variant={choices.deload === false ? 'secondary' : 'ghost'}
              aria-pressed={choices.deload === false}
              onClick={() => record('Semaine allégée refusée.', { deload: false })}
            >
              Garder une semaine normale
            </Button>
          </AlertAction>
        </Alert>
      )}

      {(stepUps.length > 0 || facts.stale.length > 0) && (
        <ItemGroup>
          {stepUps.map((s) => (
            <Item key={s.ladderId} variant="outline">
              <ItemContent>
                <ItemTitle>
                  {getLadder(s.ladderId).nameFr} : palier {s.level + 1} proposé
                </ItemTitle>
                <ItemDescription>
                  Fourchette haute tenue 2 séances de suite. Prochain palier : {getStep(s.ladderId, s.level + 1).nameFr}
                  .
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void update((d) => decideStepUp(d, s.ladderId, true))
                    record(`${getLadder(s.ladderId).nameFr} : palier ${s.level + 1} accepté.`)
                  }}
                >
                  Accepter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void update((d) => decideStepUp(d, s.ladderId, false))
                    record(`${getLadder(s.ladderId).nameFr} : palier ${s.level + 1} refusé pour l’instant.`)
                  }}
                >
                  Refuser
                </Button>
              </ItemActions>
            </Item>
          ))}
          {facts.stale.map((s) => (
            <Item key={s.ladderId} variant="outline">
              <ItemContent>
                <ItemTitle>
                  {getLadder(s.ladderId).nameFr} : pas travaillé depuis {s.days} jours
                </ItemTitle>
                <ItemDescription>
                  Je te propose une semaine de reprise au palier précédent, en haut de sa fourchette.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void update((d) => reenterLadders(d, [s.ladderId]))
                    record(`${getLadder(s.ladderId).nameFr} : semaine de reprise acceptée.`)
                  }}
                >
                  Accepter
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
      )}

      {paused.map((family) => (
        <Alert key={family}>
          <PauseCircleIcon />
          <AlertTitle>Famille {FAMILIES[family]} en pause</AlertTitle>
          <AlertDescription>Réactive-la quand la douleur a disparu.</AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => reactivate(family)}>
              Réactiver
            </Button>
          </AlertAction>
        </Alert>
      ))}

      {frozen.map((family) => (
        <Alert key={family}>
          <FirstAidIcon />
          <AlertTitle>Progression gelée : {FAMILIES[family]}</AlertTitle>
          <AlertDescription>
            Une douleur a été signalée. Lève le gel quand l’exercice passe sans douleur.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" variant="outline" onClick={() => reactivate(family)}>
              Lever le gel
            </Button>
          </AlertAction>
        </Alert>
      ))}

      {nextTrips.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium">Déplacements de la semaine prochaine</span>
          {nextTrips.map((trip) => {
            const id = `trip-${trip.from}`
            const checked = choices.trips.some((t) => t.from === trip.from)
            return (
              <Field key={trip.from} orientation="horizontal">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(on) =>
                    onChoices({
                      ...choices,
                      trips: on === true ? [...choices.trips, trip] : choices.trips.filter((t) => t.from !== trip.from),
                    })
                  }
                />
                <FieldLabel htmlFor={id}>
                  Paris,{' '}
                  {trip.from === trip.to ? formatDay(trip.from) : `du ${formatDay(trip.from)} au ${formatDay(trip.to)}`}
                </FieldLabel>
                <Badge variant="secondary">Agenda</Badge>
              </Field>
            )
          })}
        </div>
      )}
    </div>
  )
}

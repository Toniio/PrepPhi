import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Heading } from '@/components/ui/heading'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import {
  detectTrips,
  nextWeek,
  previousWeek,
  reviewFacts,
  weekDates,
  weekday,
  weekId as weekOf,
  type Feeling,
  type Trip,
} from '@/engine'
import { FEELINGS, formatDay, formatValue } from '@/i18n/fr'
import { useAppData } from '@/model/context'
import { useRuntime } from '@/runtime/context'
import { Page } from '@/shell/Page'
import { CoachChat } from './review/CoachChat'
import { Decisions, type ReviewChoices } from './review/Decisions'
import { NextWeek } from './review/NextWeek'

const FEELING_LABEL = Object.fromEntries(FEELINGS.map((f) => [f.value, f.label])) as Record<Feeling, string>

export function ReviewScreen() {
  const { data, today } = useAppData()
  const { calendar } = useRuntime()
  const current = weekOf(today)
  const previous = previousWeek(current)
  // Sunday: this week. Later in the week, last week until its review planned the next one.
  const weekId = weekday(today) === 7 || !data.weeks[previous] || data.reviews[previous]?.planned ? current : previous
  const week = data.weeks[weekId]
  const [nextTrips, setNextTrips] = useState<Trip[]>([])
  const [choices, setChoices] = useState<ReviewChoices>({ deload: null, trips: [], decisions: [] })

  useEffect(() => {
    if (!calendar.available) return
    let alive = true
    const dates = weekDates(nextWeek(weekId))
    calendar
      .listEvents(dates[0], dates[6])
      .then((events) => {
        if (!alive) return
        const trips = detectTrips(events).filter((t) => t.to >= dates[0] && t.from <= dates[6])
        setNextTrips(trips)
        setChoices((c) => ({ ...c, trips }))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [calendar, weekId])

  if (!week) {
    return (
      <Page title="Revue">
        <p className="text-xs text-muted-foreground">La première revue aura lieu dimanche soir.</p>
      </Page>
    )
  }

  const events = week.events.map((e) => e.event)
  const facts = reviewFacts({
    plan: week.plan,
    logs: week.logs,
    events,
    states: data.ladderState,
    cardio: data.cardioLog,
  })
  const dates = weekDates(weekId)
  const { done, planned, ratio } = facts.regularity
  const trained = facts.ladders.filter((l) => l.results.length > 0)

  return (
    <Page title="Revue" description={`Semaine du ${formatDay(dates[0])} au ${formatDay(dates[6])}`}>
      <section className="flex flex-col gap-3">
        <Heading level={2}>La semaine en chiffres</Heading>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span id="review-regularity">Régularité</span>
            <span className="text-muted-foreground">
              {done} sur {planned} séances
            </span>
          </div>
          <Progress
            value={(ratio ?? 0) * 100}
            aria-labelledby="review-regularity"
            aria-valuetext={`${done} sur ${planned}`}
          />
        </div>
        {trained.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucun bilan enregistré cette semaine.</p>
        ) : (
          <ItemGroup>
            {trained.map((l) => (
              <Item key={l.ladderId} size="sm">
                <ItemContent>
                  <ItemTitle>
                    {l.nameFr} · palier {l.level}
                  </ItemTitle>
                  <ItemDescription>
                    {l.results
                      .map(
                        (r) =>
                          r.values.map((v) => formatValue(v, l.unit)).join(', ') +
                          ` (${FEELING_LABEL[r.feeling].toLowerCase()})`,
                      )
                      .join(' · ')}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {l.results.some((r) => r.pain) && <Badge variant="destructive">Douleur</Badge>}
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>À décider</Heading>
        <Decisions facts={facts} nextTrips={nextTrips} choices={choices} onChoices={setChoices} />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Semaine prochaine</Heading>
        <p className="text-xs text-muted-foreground">
          Les règles calculent le plan, le coach l’arbitre, tu le valides.
        </p>
        <NextWeek weekId={weekId} facts={facts} choices={choices} />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Questions au coach</Heading>
        <CoachChat weekId={weekId} facts={facts} />
      </section>
    </Page>
  )
}

import { CalendarDotsIcon, CheckCircleIcon, MoonIcon } from '@phosphor-icons/react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { isTravelDay, weekId as weekOf } from '@/engine'
import { formatDay, formatDayTitle } from '@/i18n/fr'
import { setTravelToday } from '@/model/actions'
import { useAppData } from '@/model/context'
import { Page } from '@/shell/Page'
import type { Section } from '@/shell/sections'
import { EllipticalSession } from './today/EllipticalSession'
import { StrengthSession } from './today/StrengthSession'
import { TripProposal } from './today/TripProposal'

export function TodayScreen({ onNavigate }: { onNavigate: (section: Section) => void }) {
  const { data, update, today } = useAppData()
  const weekId = weekOf(today)
  const plan = data.weeks[weekId]?.plan
  const sessions = plan?.sessions.filter((s) => s.date === today && s.status !== 'missed') ?? []
  const travelling = plan
    ? isTravelDay(
        today,
        plan.trips.filter((t) => t.confirmed),
      )
    : false
  const next = plan?.sessions.find((s) => s.date > today && s.status === 'planned')
  const done = sessions.filter((s) => s.status === 'done')
  const pending = sessions.filter((s) => s.status === 'planned')

  return (
    <Page title="Aujourd’hui" description={`${formatDayTitle(today)}${plan?.deload ? ' · semaine allégée' : ''}`}>
      <TripProposal weekId={weekId} />

      <Field orientation="horizontal">
        <Switch
          id="travel-today"
          checked={travelling}
          onCheckedChange={(on) => update((d) => setTravelToday(d, { weekId, date: today, on }))}
          aria-describedby="travel-today-help"
        />
        <FieldContent>
          <FieldLabel htmlFor="travel-today">Je suis en déplacement</FieldLabel>
          <FieldDescription id="travel-today-help">
            La séance du jour passe en version nomade : 20 à 30 minutes, sans tirage.
          </FieldDescription>
        </FieldContent>
      </Field>

      {done.map((s) => (
        <Alert key={s.id} variant="success">
          <CheckCircleIcon />
          <AlertTitle>{s.title} : bilan enregistré</AlertTitle>
          <AlertDescription>Les cibles de la prochaine séance sont à jour.</AlertDescription>
        </Alert>
      ))}

      {pending.map((s) =>
        s.kind === 'elliptical' ? (
          <EllipticalSession key={s.id} session={s} weekId={weekId} />
        ) : (
          <StrengthSession key={s.id} session={s} weekId={weekId} />
        ),
      )}

      {pending.length === 0 && done.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MoonIcon />
            </EmptyMedia>
            <EmptyTitle>Pas de séance aujourd’hui</EmptyTitle>
            <EmptyDescription>
              {next
                ? `Prochaine séance : ${next.title}, ${formatDay(next.date)}.`
                : 'La semaine prochaine se prépare à la revue de dimanche.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => onNavigate('week')}>
              <CalendarDotsIcon />
              Voir la semaine
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </Page>
  )
}

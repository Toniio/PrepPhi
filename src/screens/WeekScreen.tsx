import { AirplaneTiltIcon, BarbellIcon, PersonSimpleBikeIcon, TreeIcon } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { nextWeek, regularity, weekDates, weekId as weekOf, type PlannedSession, type WeekPlan } from '@/engine'
import { formatDay, formatDayTitle, formatMinutes } from '@/i18n/fr'
import { useAppData } from '@/model/context'
import { Page } from '@/shell/Page'
import { AddToCalendar } from './week/AddToCalendar'

const STATUS: Record<
  PlannedSession['status'],
  { label: string; variant: 'secondary' | 'success' | 'warning' | 'destructive' }
> = {
  planned: { label: 'Prévue', variant: 'secondary' },
  done: { label: 'Faite', variant: 'success' },
  missed: { label: 'Reportée', variant: 'warning' },
  abandoned: { label: 'Abandonnée', variant: 'destructive' },
}

const KIND_ICON = {
  calisthenics: BarbellIcon,
  nomad: AirplaneTiltIcon,
  park: TreeIcon,
  elliptical: PersonSimpleBikeIcon,
}

function sessionDetail(s: PlannedSession): string {
  const parts = [formatMinutes(s.durationMin)]
  if (s.exercises.length) parts.push(s.exercises.map((e) => e.nameFr).join(', '))
  if (s.kind === 'park') parts.push('facultative')
  if (s.movedFrom) parts.push(`reportée du ${formatDay(s.movedFrom)}`)
  return parts.join(' · ')
}

function WeekList({ plan, today }: { plan: WeekPlan; today: string }) {
  const { done, planned, ratio } = regularity(plan)
  const dates = weekDates(plan.weekId)
  const trips = plan.trips.filter((t) => t.confirmed)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span id={`regularity-${plan.weekId}`}>Régularité</span>
          <span className="text-muted-foreground">
            {done} sur {planned} séances
          </span>
        </div>
        <Progress
          value={(ratio ?? 0) * 100}
          aria-labelledby={`regularity-${plan.weekId}`}
          aria-valuetext={`${done} sur ${planned}`}
        />
      </div>
      {plan.deload && <Badge variant="info">Semaine allégée : 2 séries au lieu de 3, pas de progression</Badge>}
      {trips.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Déplacement :{' '}
          {trips
            .map((t) => (t.from === t.to ? formatDay(t.from) : `du ${formatDay(t.from)} au ${formatDay(t.to)}`))
            .join(', ')}
        </p>
      )}
      <ItemGroup>
        {plan.sessions.map((s) => {
          const KindIcon = KIND_ICON[s.kind]
          return (
            <Item key={s.id} variant={s.date === today ? 'muted' : 'default'}>
              <ItemMedia variant="icon">
                <KindIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>
                  {formatDayTitle(s.date)} · {s.title}
                </ItemTitle>
                <ItemDescription>{sessionDetail(s)}</ItemDescription>
                {s.coachNote && <ItemDescription>{s.coachNote}</ItemDescription>}
              </ItemContent>
              <ItemActions>
                <Badge variant={STATUS[s.status].variant}>{STATUS[s.status].label}</Badge>
              </ItemActions>
            </Item>
          )
        })}
      </ItemGroup>
      {plan.sessions.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle as="h2">Aucune séance</EmptyTitle>
            <EmptyDescription>Les jours restants de la semaine n’ont pas de séance prévue.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <p className="text-xs text-muted-foreground">
        Du {formatDay(dates[0])} au {formatDay(dates[6])}.
      </p>
    </div>
  )
}

export function WeekScreen() {
  const { data, today } = useAppData()
  const current = weekOf(today)
  const plan = data.weeks[current]?.plan
  const upcoming = data.weeks[nextWeek(current)]?.plan

  return (
    <Page title="Semaine" action={plan && <AddToCalendar weekId={current} sessions={plan.sessions} />}>
      {plan && !upcoming && <WeekList plan={plan} today={today} />}
      {plan && upcoming && (
        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Cette semaine</TabsTrigger>
            <TabsTrigger value="next">Semaine prochaine</TabsTrigger>
          </TabsList>
          <TabsContent value="current">
            <WeekList plan={plan} today={today} />
          </TabsContent>
          <TabsContent value="next">
            <WeekList plan={upcoming} today={today} />
          </TabsContent>
        </Tabs>
      )}
    </Page>
  )
}

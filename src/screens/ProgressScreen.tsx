import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { LadderProgress } from '@/components/candidates/ladder-progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { entryMet, getLadder, isElliptical, LADDERS, regularity, setsOf, weekId as weekOf } from '@/engine'
import { formatRange, formatTargets } from '@/i18n/fr'
import { useAppData } from '@/model/context'
import { Page } from '@/shell/Page'

const hrConfig = {
  avgHr: { label: 'FC moyenne (bpm)', color: 'var(--color-chart-1)' },
} satisfies ChartConfig

const regularityConfig = {
  percent: { label: 'Régularité (%)', color: 'var(--color-chart-2)' },
} satisfies ChartConfig

const shortDate = (date: string) => `${Number(date.slice(8, 10))}/${Number(date.slice(5, 7))}`

function Ladders() {
  const { data } = useAppData()
  return (
    <div className="flex flex-col gap-4">
      {LADDERS.map((ladder) => {
        const state = data.ladderState[ladder.id]
        if (!state) return null
        const step = ladder.steps.find((s) => s.level === state.level)!
        const steps = ladder.steps.map((s) => ({
          level: s.level,
          nameFr: s.nameFr,
          rangeLabel:
            s.format === 'cumulative'
              ? `${formatRange(s.range, s.unit)} cumulées`
              : `${setsOf(s)} × ${formatRange(s.range, s.unit, s.perSide)}`,
        }))
        const locked = !state.unlocked
        return (
          <Card key={ladder.id} size="sm">
            <CardHeader>
              <CardTitle>{ladder.nameFr}</CardTitle>
              <CardDescription>
                {locked
                  ? 'Verrouillée : elle s’ouvre quand ses conditions d’accès sont tenues.'
                  : `Palier ${state.level} sur ${ladder.steps.length}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LadderProgress
                ladderName={ladder.nameFr}
                steps={steps}
                current={state.level}
                unlocked={!locked}
                currentDetail={
                  <span className="flex flex-wrap gap-1 pt-1">
                    <Badge variant="secondary">
                      Cibles :{' '}
                      {step.format === 'cumulative'
                        ? formatRange([state.targets[0], step.range[1]], 's')
                        : formatTargets(state.targets, step.unit, step.perSide)}
                    </Badge>
                    {state.stepUpProposed && <Badge variant="info">Palier suivant proposé</Badge>}
                    {state.frozen && <Badge variant="warning">Progression gelée</Badge>}
                    {state.paused && <Badge variant="destructive">En pause</Badge>}
                  </span>
                }
              />
              {locked && ladder.entry && (
                <p className="pt-3 text-xs text-muted-foreground">
                  Accès :{' '}
                  {ladder.entry
                    .map(
                      (c) =>
                        `${getLadder(c.ladder).nameFr} au palier ${c.level}${c.atTopOfRange ? ' en haut de fourchette' : ''}${c.minValue ? ` avec ${c.minValue} au moins` : ''}`,
                    )
                    .join(', et ')}
                  {entryMet(ladder.id, data.ladderState) ? ' (tenu)' : ''}.
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function Elliptical() {
  const { data } = useAppData()
  const sessions = data.cardioLog.filter((e) => isElliptical(e) && e.avgHr !== null).slice(-20)
  if (sessions.length < 2) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle as="h2">Pas encore assez de séances</EmptyTitle>
          <EmptyDescription>
            Importe le CSV Garmin dans Données : la courbe apparaît à partir de 2 séances.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }
  const points = sessions.map((e) => ({
    date: shortDate(e.date),
    avgHr: e.avgHr,
    duration: e.durationMin,
    resistance: e.resistance,
  }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fréquence cardiaque moyenne</CardTitle>
        <CardDescription>
          À durée et résistance égales, une FC plus basse marque un progrès d’endurance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={hrConfig}
          className="h-56 w-full"
          aria-label="Fréquence cardiaque moyenne par séance d’elliptique"
        >
          <LineChart data={points} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line dataKey="avgHr" type="monotone" stroke="var(--color-avgHr)" strokeWidth={2} dot />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function Regularity() {
  const { data, today } = useAppData()
  const current = weekOf(today)
  const weeks = Object.values(data.weeks)
    .filter((w) => w.plan.weekId <= current)
    .sort((a, b) => a.plan.weekId.localeCompare(b.plan.weekId))
    .slice(-8)
    .map((w) => {
      const r = regularity(w.plan)
      return {
        week: `S${w.plan.weekId.split('-W')[1]}`,
        percent: Math.round((r.ratio ?? 0) * 100),
        label: `${r.done} sur ${r.planned}`,
      }
    })
  return (
    <Card>
      <CardHeader>
        <CardTitle>Régularité par semaine</CardTitle>
        <CardDescription>Séances faites sur séances prévues, séances nomades et au parc comprises.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={regularityConfig}
          className="h-56 w-full"
          aria-label="Régularité par semaine, en pourcentage"
        >
          <BarChart data={weeks} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="percent" fill="var(--color-percent)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ProgressScreen() {
  return (
    <Page title="Progression">
      <Tabs defaultValue="ladders">
        <TabsList>
          <TabsTrigger value="ladders">Échelles</TabsTrigger>
          <TabsTrigger value="elliptical">Elliptique</TabsTrigger>
          <TabsTrigger value="regularity">Régularité</TabsTrigger>
        </TabsList>
        <TabsContent value="ladders">
          <Ladders />
        </TabsContent>
        <TabsContent value="elliptical">
          <Elliptical />
        </TabsContent>
        <TabsContent value="regularity">
          <Regularity />
        </TabsContent>
      </Tabs>
    </Page>
  )
}

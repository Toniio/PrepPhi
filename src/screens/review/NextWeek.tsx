import { ArrowsClockwiseIcon, CheckIcon, SparkleIcon, StopIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'
import { Spinner } from '@/components/ui/spinner'
import { buildContext } from '@/coach/context'
import { applyCoachReply } from '@/coach/plan'
import { devWeeklyPlanReply, weeklyPlanPrompt, type WeeklyPlanReply } from '@/coach/prompts'
import { nextWeek, type EllipticalChange, type ReviewFacts, type WeekId, type WeekPlan } from '@/engine'
import { DS, formatDayTitle, formatMinutes } from '@/i18n/fr'
import { addProposals, applyNextWeek, pauseFamily, ruleNextWeek } from '@/model/actions'
import { useAppData } from '@/model/context'
import type { AppData } from '@/model/schema'
import { useRuntime } from '@/runtime/context'
import { CoachError } from '@/runtime'
import type { ReviewChoices } from './Decisions'
import { mergePlan } from './mergePlan'

type Draft = {
  plan: WeekPlan
  elliptical: NonNullable<AppData['elliptical']>
  changes: EllipticalChange[]
  reply: Partial<WeeklyPlanReply>
  dropped: number
  fromCoach: boolean
}

function ellipticalLine(changes: EllipticalChange[]): string | null {
  const parts = changes.flatMap((c) => {
    if (c.type === 'duration') return [`elliptique ${c.from} → ${c.to} min`]
    if (c.type === 'resistance') return [`résistance ${c.from} → ${c.to}`]
    if (c.type === 'intervals-start') return [`fractionné : ${c.reps} répétitions une séance sur deux`]
    if (c.type === 'intervals-rep') return [`fractionné ${c.from} → ${c.to} répétitions`]
    return []
  })
  return parts.length ? `Elliptique : ${parts.join(', ')}.` : null
}

export function NextWeek({ weekId, facts, choices }: { weekId: WeekId; facts: ReviewFacts; choices: ReviewChoices }) {
  const { coach } = useRuntime()
  const { data, update, today } = useAppData()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)
  const target = nextWeek(weekId)
  const alreadyPlanned = data.reviews[weekId]?.planned ?? false

  const prepare = async () => {
    setBusy(true)
    setNotice(null)
    const deload = choices.deload ?? false
    const rules = ruleNextWeek(data, { weekId, deload, trips: choices.trips })
    controller.current = new AbortController()
    const prompt = weeklyPlanPrompt({
      context: buildContext(data, weekId),
      facts,
      plan: rules.plan,
      decisions: choices.decisions,
    })
    let reply: Partial<WeeklyPlanReply> = {}
    let fromCoach = false
    try {
      reply = await coach.json<WeeklyPlanReply>({
        purpose: 'weekly-plan',
        modelTier: 'complex',
        input: prompt,
        signal: controller.current.signal,
        devReply: () => devWeeklyPlanReply(facts, data.reviewSummary?.text ?? null),
      })
      fromCoach = true
    } catch (e) {
      if (e instanceof CoachError && e.code === 'cancelled') {
        setBusy(false)
        return
      }
      setNotice('Le coach n’a pas répondu : voici le plan calculé par les règles, sans arbitrage.')
    }
    const applied = applyCoachReply(rules.plan, reply, data.profile!)
    setDraft({
      plan: applied.plan,
      elliptical: rules.elliptical,
      changes: rules.changes,
      reply,
      dropped: applied.dropped,
      fromCoach,
    })
    setBusy(false)
    controller.current = null
  }

  const validate = async () => {
    if (!draft) return
    const now = new Date().toISOString()
    const summary = typeof draft.reply.summary === 'string' ? draft.reply.summary : ''
    const cumulative = typeof draft.reply.cumulativeSummary === 'string' ? draft.reply.cumulativeSummary : null
    const proposals = Array.isArray(draft.reply.proposals)
      ? draft.reply.proposals.filter((p) => typeof p === 'string')
      : []
    await update((d) => {
      let next = d
      for (const family of facts.recurringPain) next = pauseFamily(next, family)
      next = applyNextWeek(next, {
        reviewWeek: weekId,
        plan: mergePlan(next.weeks[target]?.plan, draft.plan, today),
        elliptical: draft.elliptical,
        summary,
        cumulative,
        now,
      })
      return addProposals(next, proposals, now)
    })
    setDraft(null)
    toast.success('Plan de la semaine prochaine enregistré.')
  }

  if (alreadyPlanned && !draft) {
    return (
      <div className="flex flex-col gap-3">
        {data.reviews[weekId]?.summary && (
          <Message align="start">
            <MessageContent>
              <MessageHeader>Coach</MessageHeader>
              <Bubble variant="ghost">
                <BubbleContent>{data.reviews[weekId]!.summary}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        )}
        <p className="text-xs text-muted-foreground">La semaine prochaine est planifiée. Elle apparaît dans Semaine.</p>
        <Button variant="outline" onClick={prepare} disabled={busy} className="self-start">
          <ArrowsClockwiseIcon />
          Refaire le plan
        </Button>
      </div>
    )
  }

  if (busy) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground" role="status">
        <Spinner aria-label={DS.spinner} />
        Le coach prépare ta semaine… Compte jusqu’à une minute.
        <Button size="sm" variant="ghost" onClick={() => controller.current?.abort()}>
          <StopIcon />
          Arrêter
        </Button>
      </div>
    )
  }

  if (!draft) {
    return (
      <Button onClick={prepare} className="self-start">
        <SparkleIcon />
        Préparer la semaine prochaine
      </Button>
    )
  }

  const elliptical = ellipticalLine(draft.changes)
  const proposals = Array.isArray(draft.reply.proposals)
    ? draft.reply.proposals.filter((p) => typeof p === 'string')
    : []
  return (
    <div className="flex flex-col gap-4">
      {notice && (
        <Alert variant="warning">
          <AlertTitle>Plan sans arbitrage</AlertTitle>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}
      {typeof draft.reply.summary === 'string' && (
        <Message align="start">
          <MessageContent>
            <MessageHeader>Coach</MessageHeader>
            <Bubble variant="ghost">
              <BubbleContent>{draft.reply.summary}</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
      )}
      {elliptical && <p className="text-xs">{elliptical}</p>}
      {draft.plan.deload && <Badge variant="info">Semaine allégée</Badge>}
      <ItemGroup>
        {draft.plan.sessions.map((s) => (
          <Item key={s.id} size="sm" variant="outline">
            <ItemContent>
              <ItemTitle>
                {formatDayTitle(s.date)} · {s.title}
              </ItemTitle>
              <ItemDescription>
                {formatMinutes(s.durationMin)}
                {s.accessories?.length ? ` · accessoires : ${s.accessories.map((a) => a.nameFr).join(', ')}` : ''}
              </ItemDescription>
              {s.coachNote && <ItemDescription>{s.coachNote}</ItemDescription>}
            </ItemContent>
          </Item>
        ))}
      </ItemGroup>
      {proposals.length > 0 && (
        <Alert>
          <AlertTitle>Propositions du coach sur les échelles</AlertTitle>
          <AlertDescription>
            {proposals.join(' ')} Elles sont enregistrées dans Données, sans rien changer tant que tu ne les acceptes
            pas.
          </AlertDescription>
        </Alert>
      )}
      {draft.dropped > 0 && draft.fromCoach && (
        <p className="text-xs text-muted-foreground">
          {draft.dropped} modification{draft.dropped > 1 ? 's' : ''} du coach écartée{draft.dropped > 1 ? 's' : ''} :
          elle
          {draft.dropped > 1 ? 's' : ''} ne respectai{draft.dropped > 1 ? 'ent' : 't'} pas les règles.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={validate}>
          <CheckIcon />
          Valider le plan
        </Button>
        <Button variant="outline" onClick={prepare}>
          <ArrowsClockwiseIcon />
          Recommencer
        </Button>
      </div>
    </div>
  )
}

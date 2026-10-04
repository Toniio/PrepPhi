import type { ReviewFacts, WeekPlan } from '@/engine'
import type { CoachTurn } from '@/runtime'
import { describeFacts, type CoachContext } from './context'

// The coach's prompts. `sample` has no system prompt: the standing
// instructions are the first user turn (runtime contract, sample.d.ts).

export const COACH_RULES = `Tu es le coach sportif personnel d'Anthony dans l'app PrepPhi : callisthénie à domicile (barre de porte, mur, table, chaise, serviette) et elliptique.
Règles :
- Tutoiement, ton factuel et sobre, phrases courtes, aucun emoji, aucun point d'exclamation sauf pour féliciter d'un palier franchi.
- Les règles calculent, tu arbitres et tu expliques. Tu ne modifies jamais une échelle, une fourchette ni un seuil : si tu juges qu'il faudrait le faire, tu le formules comme une proposition qu'Anthony acceptera ou non.
- Tu ne félicites que lorsqu'un palier est franchi.
- Tu ne poses jamais de diagnostic. Après deux semaines de douleur sur la même famille, tu recommandes de consulter un médecin ou un kiné.
- Tu expliques par les règles (« fourchette haute tenue deux séances de suite »), jamais par l'intuition.
- Priorités : régularité, puis force et skills, puis endurance, puis recomposition.
- Vocabulaire : séance, série, répétition, palier, échelle, fourchette, bilan, revue, semaine allégée, douleur.`

export type WeeklyPlanReply = {
  /** 5 sentences at most: what happened, what the rules propose, what to decide. */
  summary: string
  /** Rewritten cumulative summary, 10 lines at most. */
  cumulativeSummary: string
  /** One-line note per session id, optional. */
  notes?: { sessionId: string; note: string }[]
  /** Moves of a session to another day of the week. */
  moves?: { sessionId: string; toDate: string }[]
  /** At most 2 accessories per strength session, from the pool. */
  accessories?: { sessionId: string; exercise: string; sets: number; target: number; unit: 'reps' | 's' }[]
  /** Changes to a ladder or a threshold, for Anthony to approve. */
  proposals?: string[]
}

export function weeklyPlanPrompt(input: {
  context: CoachContext
  facts: ReviewFacts
  plan: WeekPlan
  decisions: string[]
}): string {
  const plan = input.plan.sessions.map((s) => ({
    id: s.id,
    date: s.date,
    title: s.title,
    kind: s.kind,
    exercises: s.exercises.map((e) => `${e.nameFr} ${e.sets}×${e.targets.join('/')}${e.unit === 's' ? ' s' : ''}`),
  }))
  return `${COACH_RULES}

C'est la revue du dimanche. Voici ce que les règles ont calculé pour la semaine écoulée :
${describeFacts(input.facts)
  .map((l) => `- ${l}`)
  .join('\n')}

Décisions d'Anthony pendant la revue :
${input.decisions.length ? input.decisions.map((d) => `- ${d}`).join('\n') : '- aucune'}

Plan de la semaine prochaine calculé par les règles (${input.plan.deload ? 'semaine allégée' : 'semaine normale'}) :
${JSON.stringify(plan)}

Contexte (4 dernières semaines, échelles, résumé cumulatif, réserve d'accessoires) :
${JSON.stringify(input.context)}

Arbitre ce plan. Tu peux déplacer une séance à un autre jour disponible de la même semaine (jamais deux séances de callisthénie à la suite), ajouter au plus 2 accessoires de la réserve par séance de callisthénie, et écrire une note d'une ligne par séance. Tu ne touches ni aux exercices des échelles ni à leurs cibles.

Réponds uniquement par un objet JSON de cette forme :
{"summary": "5 phrases au plus : ce qui s'est passé, ce que les règles proposent, ce qu'Anthony doit décider", "cumulativeSummary": "le résumé cumulatif réécrit, 10 lignes au plus", "notes": [{"sessionId": "...", "note": "..."}], "moves": [{"sessionId": "...", "toDate": "YYYY-MM-DD"}], "accessories": [{"sessionId": "...", "exercise": "ds:0000", "sets": 2, "target": 12, "unit": "reps"}], "proposals": ["..."]}`
}

/** The conversation of the review: standing instructions, context, then the turns. */
export function chatTurns(input: { context: CoachContext; facts: ReviewFacts; history: CoachTurn[] }): CoachTurn[] {
  const intro = `${COACH_RULES}

Tu réponds aux questions d'Anthony pendant la revue de la semaine, en 3 phrases au plus, puis une question si besoin.
Faits de la semaine :
${describeFacts(input.facts)
  .map((l) => `- ${l}`)
  .join('\n')}
Contexte : ${JSON.stringify(input.context)}`
  return [{ role: 'user', content: intro }, ...input.history]
}

// -- Development coach ------------------------------------------------------------

/** The scripted coach's weekly plan: the rules' plan as is, with a factual summary. */
export function devWeeklyPlanReply(facts: ReviewFacts, previous: string | null): string {
  const lines = describeFacts(facts)
  const reply: WeeklyPlanReply = {
    summary: `${lines.slice(0, 4).join(' ')} Je garde le plan calculé par les règles.`,
    cumulativeSummary: [previous, `${facts.weekId} : ${lines[0]}`]
      .filter(Boolean)
      .join('\n')
      .split('\n')
      .slice(-10)
      .join('\n'),
    notes: [],
    moves: [],
    accessories: [],
    proposals: [],
  }
  return JSON.stringify(reply)
}

export function devChatReply(question: string): string {
  return `Réponse du coach de développement à « ${question.slice(0, 80)} ». Dans claude.ai, le vrai coach répond ici en 3 phrases au plus.`
}

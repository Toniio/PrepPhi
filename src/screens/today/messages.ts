import { getLadder, getStep, type ProgressionEvent } from '@/engine'
import type { MissedOutcome } from '@/engine'
import { formatDay } from '@/i18n/fr'

// What the check-in tells after saving (docs/redaction-fr.md: factual,
// congratulate only a step passed).

export function eventMessages(events: ProgressionEvent[], unlocked: string[]): string[] {
  const lines: string[] = []
  for (const event of events) {
    const name = getLadder(event.ladderId).nameFr
    switch (event.type) {
      case 'step-up-proposed':
        lines.push(`${name} : fourchette haute tenue 2 séances de suite. Palier ${event.to} proposé à la revue.`)
        break
      case 'regressed':
        lines.push(`${name} : retour au palier ${event.to}, ${getStep(event.ladderId, event.to).nameFr}.`)
        break
      case 'pain-drop':
        lines.push(`${name} : douleur notée. Progression gelée, palier ${event.to} à la prochaine séance.`)
        break
      case 'calibrated':
        lines.push(`${name} : premier essai trop facile, cibles calées en haut de fourchette.`)
        break
      case 'skill-mastered':
        lines.push(`${name} : skill acquis !`)
        break
      default:
        break
    }
  }
  for (const id of unlocked) lines.push(`Nouvelle échelle ouverte : ${getLadder(id).nameFr}.`)
  return lines
}

export function missedMessage(outcome: MissedOutcome): string {
  if (outcome.type === 'abandoned')
    return 'Plus de créneau libre avant dimanche : séance abandonnée. Elle sera notée à la revue.'
  return outcome.nomad
    ? `Séance reportée à ${formatDay(outcome.to)}, en version nomade.`
    : `Séance reportée à ${formatDay(outcome.to)}.`
}

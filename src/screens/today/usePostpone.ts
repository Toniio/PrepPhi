import { toast } from 'sonner'
import type { WeekId } from '@/engine'
import { missSession } from '@/model/actions'
import { useAppData } from '@/model/context'
import type { WeekDoc } from '@/model/schema'
import { missedMessage } from './messages'

/** "Reporter la séance": done at once, with an undo in the confirmation. */
export function usePostpone(weekId: WeekId, sessionId: string, onDone: () => void) {
  const { update, today } = useAppData()

  return async () => {
    let message = ''
    let before: WeekDoc | undefined
    await update((data) => {
      before = data.weeks[weekId]
      const { data: next, outcome } = missSession(data, { weekId, sessionId, today })
      message = missedMessage(outcome)
      return next
    })
    onDone()
    toast(message, {
      action: {
        label: 'Annuler',
        onClick: () => {
          if (before) void update((data) => ({ ...data, weeks: { ...data.weeks, [weekId]: before! } }))
        },
      },
    })
  }
}

import { AirplaneTiltIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { detectTrips, weekDates, type Trip, type WeekId } from '@/engine'
import { formatDay } from '@/i18n/fr'
import { confirmTrips } from '@/model/actions'
import { useAppData } from '@/model/context'
import { useRuntime } from '@/runtime/context'

/**
 * Trips to Paris found in the calendar this week: a proposal to confirm,
 * never a switch on its own (rules.json, travel.detection.autoSwitch).
 */
export function TripProposal({ weekId }: { weekId: WeekId }) {
  const { calendar } = useRuntime()
  const { data, update, today } = useAppData()
  const [found, setFound] = useState<Trip[]>([])
  const [dismissed, setDismissed] = useState(false)
  const known = data.weeks[weekId]?.plan.trips ?? []

  useEffect(() => {
    if (!calendar.available) return
    let alive = true
    const dates = weekDates(weekId)
    calendar
      .listEvents(dates[0], dates[6] > today ? dates[6] : today)
      .then((events) => {
        if (alive) setFound(detectTrips(events).filter((t) => t.to >= today))
      })
      .catch(() => {
        // The calendar stays silent: the toggle on this screen still works.
      })
    return () => {
      alive = false
    }
  }, [calendar, weekId, today])

  const fresh = found.filter((t) => !known.some((k) => k.from === t.from && k.to === t.to && k.confirmed))
  if (dismissed || fresh.length === 0) return null

  const confirm = async () => {
    await update((d) => confirmTrips(d, { weekId, trips: [...known.filter((k) => k.confirmed), ...fresh], today }))
    toast.success('Déplacement confirmé : les séances de ces jours passent en version nomade.')
  }

  const range = (t: Trip) => (t.from === t.to ? formatDay(t.from) : `du ${formatDay(t.from)} au ${formatDay(t.to)}`)

  return (
    <Alert variant="info">
      <AirplaneTiltIcon />
      <AlertTitle>Déplacement à Paris dans ton agenda</AlertTitle>
      <AlertDescription>
        {fresh.map(range).join(', ')}. Les séances de ces jours passeront en version nomade.
      </AlertDescription>
      <AlertAction className="flex gap-2">
        <Button size="sm" onClick={confirm}>
          Confirmer
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
          Pas maintenant
        </Button>
      </AlertAction>
    </Alert>
  )
}

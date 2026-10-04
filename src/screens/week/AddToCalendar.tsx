import { CalendarPlusIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { PlannedSession, WeekId } from '@/engine'
import { formatDayTitle } from '@/i18n/fr'
import { markInCalendar } from '@/model/actions'
import { useAppData } from '@/model/context'
import { useRuntime } from '@/runtime/context'
import type { NewCalendarEvent } from '@/runtime'

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function toCalendarEvent(session: PlannedSession, time: string): NewCalendarEvent {
  return {
    title: `PrepPhi · ${session.title}`,
    start: `${session.date}T${time}:00`,
    end: `${session.date}T${addMinutes(time, session.durationMin)}:00`,
    description: session.exercises.map((e) => e.nameFr).join(', ') || session.title,
  }
}

/**
 * "Ajouter à mon agenda": lists the sessions to create and creates them only
 * after the explicit validation (CLAUDE.md, "Rappels").
 */
export function AddToCalendar({ weekId, sessions }: { weekId: WeekId; sessions: PlannedSession[] }) {
  const { calendar } = useRuntime()
  const { data, update, today } = useAppData()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const time = data.profile?.preferredTime ?? '18:30'
  const pending = sessions.filter((s) => s.status === 'planned' && !s.inCalendar && s.date >= today)

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const { created } = await calendar.createEvents(pending.map((s) => toCalendarEvent(s, time)))
      await update((d) =>
        markInCalendar(
          d,
          weekId,
          pending.slice(0, created).map((s) => s.id),
        ),
      )
      toast.success(`${created} séance${created > 1 ? 's' : ''} ajoutée${created > 1 ? 's' : ''} à ton agenda.`)
      setOpen(false)
    } catch {
      setError('Les séances n’ont pas été ajoutées. Vérifie la connexion à Google Agenda, puis réessaie.')
    } finally {
      setBusy(false)
    }
  }

  const title = !calendar.available
    ? 'Agenda non relié'
    : pending.length === 0
      ? 'Rien à ajouter'
      : `Ajouter ${pending.length} séance${pending.length > 1 ? 's' : ''} à ton agenda ?`
  const description = !calendar.available
    ? 'Dans claude.ai, PrepPhi passe par ton connecteur Google Agenda. Il n’est pas encore relié dans cette vue.'
    : pending.length === 0
      ? 'Toutes les séances à venir de la semaine sont déjà dans ton agenda.'
      : `Chaque séance est créée à ${time.replace(':', ' h ')} dans Google Agenda.`
  const ready = calendar.available && pending.length > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setError(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarPlusIcon />
          Ajouter à mon agenda
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel="Fermer">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {ready && (
          <ul className="flex flex-col gap-1 text-xs">
            {pending.map((s) => (
              <li key={s.id}>
                {formatDayTitle(s.date)} · {s.title}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{ready ? 'Annuler' : 'Fermer'}</Button>
          </DialogClose>
          {ready && (
            <Button onClick={create} disabled={busy}>
              Ajouter les séances
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

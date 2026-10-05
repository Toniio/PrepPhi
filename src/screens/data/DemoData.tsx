import { PlayIcon, TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { buildDemoData } from '@/demo'
import { useAppData } from '@/model/context'
import { emptyData } from '@/model/schema'

type Action = 'load' | 'reload' | 'clear'

// The confirmation repeats its question's verb (docs/redaction-fr.md).
const COPY: Record<Action, { title: string; description: string; action: string }> = {
  load: {
    title: 'Remplacer toutes tes données par la démo ?',
    description: 'Tes données actuelles seront effacées : exporte-les d’abord si tu veux les garder.',
    action: 'Remplacer mes données',
  },
  reload: {
    title: 'Recréer la démo à partir d’aujourd’hui ?',
    description: 'Tout ce que tu as saisi dans la démo sera effacé.',
    action: 'Recréer la démo',
  },
  clear: {
    title: 'Supprimer les données de démo ?',
    description: 'Toutes les données de démo seront effacées et l’onboarding recommencera.',
    action: 'Supprimer la démo',
  },
}

/**
 * Fictional data to show the app: three weeks of use, only exercises with an
 * animation. Loading replaces the real data, so it asks first; leaving the
 * demo is offered only while the data is the demo's.
 */
export function DemoData() {
  const { data, today, replaceAll } = useAppData()
  const isDemo = data.profile?.demo === true
  const [asking, setAsking] = useState<Action | null>(null)
  // The last question asked: its text stays while the dialog fades out.
  const [dialog, setDialog] = useState<Action>('load')
  const [busy, setBusy] = useState(false)

  const ask = (action: Action) => {
    setDialog(action)
    setAsking(action)
  }

  const run = async () => {
    if (!asking) return
    setBusy(true)
    if (asking === 'clear') {
      await replaceAll(emptyData())
      toast.success('Données de démo supprimées.')
    } else {
      await replaceAll(buildDemoData(today))
      toast.success('Démo chargée : trois semaines de données fictives.')
    }
    setBusy(false)
    setAsking(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {isDemo
          ? 'Tu es sur des données de démo : un profil fictif, trois semaines de séances, de bilans, de cardio et de revues.'
          : 'Pour montrer l’outil : trois semaines de données fictives (historique, revues, cardio, plan de la semaine), avec uniquement des exercices animés.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => ask(isDemo ? 'reload' : 'load')}>
          <PlayIcon />
          {isDemo ? 'Recréer la démo' : 'Charger les données de démo'}
        </Button>
        {isDemo && (
          <Button variant="outline" onClick={() => ask('clear')}>
            <TrashIcon />
            Supprimer la démo
          </Button>
        )}
      </div>
      <AlertDialog open={asking !== null} onOpenChange={(open) => !open && setAsking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{COPY[dialog].title}</AlertDialogTitle>
            <AlertDialogDescription>{COPY[dialog].description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={run} disabled={busy}>
              {COPY[dialog].action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

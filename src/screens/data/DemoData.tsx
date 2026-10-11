import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
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
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useDemoMode } from '@/model/useDemoMode'

/**
 * Fictional data to show the app: three weeks of use, only exercises with an
 * animation. The switch takes effect at once: the real data waits aside while
 * the demo is on and comes back when it is turned off. Only starting the demo
 * over erases something, so only that asks first.
 */
export function DemoData() {
  const { isDemo, enter, leave, restart } = useDemoMode()
  const [busy, setBusy] = useState(false)
  const [asking, setAsking] = useState(false)

  const toggle = async (on: boolean) => {
    setBusy(true)
    try {
      if (on) {
        await enter()
        toast.success('Démo activée. Tes données sont mises de côté.')
      } else {
        await leave()
        toast.success('Démo désactivée. Tes données sont de retour.')
      }
    } catch {
      toast.error('Le changement n’a pas abouti. Réessaie.')
    } finally {
      setBusy(false)
    }
  }

  const runRestart = async () => {
    setBusy(true)
    await restart()
    toast.success('Démo recréée à partir d’aujourd’hui.')
    setBusy(false)
    setAsking(false)
  }

  return (
    <div className="flex flex-col gap-3">
      <Field orientation="horizontal">
        <Switch
          id="demo-mode"
          checked={isDemo}
          disabled={busy}
          onCheckedChange={toggle}
          aria-describedby="demo-mode-help"
        />
        <FieldContent>
          <FieldLabel htmlFor="demo-mode">Données de démo</FieldLabel>
          <FieldDescription id="demo-mode-help">
            {isDemo
              ? 'Un profil fictif, trois semaines de séances, de bilans, de cardio et de revues. Désactive-la pour retrouver tes données ; ce que tu saisis dans la démo sera effacé.'
              : 'Trois semaines de données fictives pour montrer l’outil, avec uniquement des exercices animés. Tes données sont mises de côté, puis restaurées quand tu la désactives.'}
          </FieldDescription>
        </FieldContent>
      </Field>
      {isDemo && (
        <div>
          <Button variant="outline" onClick={() => setAsking(true)} disabled={busy}>
            <ArrowCounterClockwiseIcon />
            Recréer la démo
          </Button>
        </div>
      )}
      <AlertDialog open={asking} onOpenChange={setAsking}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recréer la démo à partir d’aujourd’hui ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tout ce que tu as saisi dans la démo sera effacé. Tes propres données restent de côté.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={runRestart} disabled={busy}>
              Recréer la démo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { ArrowsClockwiseIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

/** Starts the onboarding again, with the current answers and placement in view. */
export function RedoOnboarding({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        Reprends le questionnaire et la séance test : tes réponses actuelles sont pré-remplies et rappelées à chaque
        étape. Ton historique (semaines, bilans, cardio, revues) reste en place ; seules les échelles que tu retestes
        changent de palier.
      </p>
      <Button variant="outline" onClick={onStart} className="self-start">
        <ArrowsClockwiseIcon />
        Refaire l’onboarding
      </Button>
    </div>
  )
}

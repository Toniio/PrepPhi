import { BookOpenIcon, PlayCircleIcon, WarningIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import type { ExerciseInfo } from '@/catalog'
import { cn } from '@/lib/utils'

// Candidate component (absent from DSAIReadable): spec in ExerciseCard.md.

export type ExerciseCardLabels = {
  openSheet: string
  sheetDescription: string
  steps: string
  cue: string
  mistake: string
  painReminder: string
  video: string
  videoSearch: string
  close: string
  media: (name: string) => string
}

export const EXERCISE_CARD_LABELS_FR: ExerciseCardLabels = {
  openSheet: 'Voir la fiche',
  sheetDescription: 'Consignes, point clé et erreur fréquente.',
  steps: 'Étapes',
  cue: 'Point clé',
  mistake: 'Erreur fréquente',
  painReminder: 'Arrête l’exercice si tu ressens une douleur vive pendant le mouvement.',
  video: 'Voir le tutoriel',
  videoSearch: 'Rechercher un tutoriel',
  close: 'Fermer',
  media: (name) => `Animation : ${name}`,
}

type Props = {
  exercise: ExerciseInfo
  /** `Palier 4`. */
  levelLabel?: string
  /** `3 × 8–12`. */
  targetsLabel: string
  /** A line from the coach or the plan. */
  note?: string
  children?: ReactNode
  labels?: ExerciseCardLabels
  className?: string
}

export function ExerciseCard({
  exercise,
  levelLabel,
  targetsLabel,
  note,
  children,
  labels = EXERCISE_CARD_LABELS_FR,
  className,
}: Props) {
  const video = exercise.videoUrl ?? exercise.videoSearchUrl
  return (
    <Card data-slot="exercise-card" className={cn(className)}>
      <CardHeader>
        <CardTitle>{exercise.nameFr}</CardTitle>
        <CardDescription>{targetsLabel}</CardDescription>
        {levelLabel && (
          <CardAction>
            <Badge variant="secondary">{levelLabel}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {exercise.mediaUrl && (
          <div data-slot="exercise-card-media" className="w-full max-w-60 self-center">
            <AspectRatio ratio={1}>
              <img
                src={exercise.mediaUrl}
                alt={labels.media(exercise.nameFr)}
                className="size-full object-contain"
                loading="lazy"
              />
            </AspectRatio>
          </div>
        )}
        {(note || exercise.noteFr) && (
          <p data-slot="exercise-card-note" className="text-xs text-muted-foreground">
            {note ?? exercise.noteFr}
          </p>
        )}
        {children}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="self-start">
              <BookOpenIcon />
              {labels.openSheet}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{exercise.nameFr}</DrawerTitle>
              <DrawerDescription>{labels.sheetDescription}</DrawerDescription>
            </DrawerHeader>
            <div data-slot="exercise-sheet" className="flex max-h-dvh flex-col gap-4 overflow-y-auto px-4">
              {exercise.noteFr && <p className="text-xs text-muted-foreground">{exercise.noteFr}</p>}
              <section className="flex flex-col gap-2">
                <span className="text-xs font-medium">{labels.steps}</span>
                <ol className="flex list-decimal flex-col gap-1 pl-4 text-xs">
                  {exercise.stepsFr.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </section>
              {exercise.cueFr && (
                <p className="text-xs">
                  <span className="font-medium">{labels.cue} : </span>
                  {exercise.cueFr}
                </p>
              )}
              {exercise.mistakeFr && (
                <p className="text-xs">
                  <span className="font-medium">{labels.mistake} : </span>
                  {exercise.mistakeFr}
                </p>
              )}
              <p className="flex items-start gap-2 text-xs text-warning">
                <WarningIcon className="size-4 shrink-0" />
                {labels.painReminder}
              </p>
              {exercise.attribution && <p className="text-xs text-muted-foreground">{exercise.attribution}</p>}
            </div>
            <DrawerFooter>
              {video && (
                <Button asChild variant="outline">
                  <a href={video} target="_blank" rel="noreferrer">
                    <PlayCircleIcon />
                    {exercise.videoUrl ? labels.video : labels.videoSearch}
                  </a>
                </Button>
              )}
              <DrawerClose asChild>
                <Button variant="ghost">{labels.close}</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardContent>
    </Card>
  )
}

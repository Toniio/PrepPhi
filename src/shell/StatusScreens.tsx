import { ArrowClockwiseIcon, DatabaseIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import { DS } from '@/i18n/fr'

// Full-screen states shown before the app can run (pattern "loading" and
// "empty-state").

export function LoadingScreen({ label = 'Chargement de PrepPhi…' }: { label?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center gap-2 bg-background px-page text-xs text-muted-foreground">
      <Spinner aria-label={DS.spinner} />
      <span>{label}</span>
    </div>
  )
}

export function StorageUnavailable() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-page">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <DatabaseIcon />
          </EmptyMedia>
          <EmptyTitle as="h1">Stockage indisponible</EmptyTitle>
          <EmptyDescription>
            PrepPhi enregistre tes données dans claude.ai. Ouvre l’app depuis claude.ai, connecté à ton compte, puis
            autorise l’accès au stockage.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

export function LoadFailed({ retry }: { retry: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-page">
      <Empty>
        <EmptyHeader>
          <EmptyTitle as="h1">Données non chargées</EmptyTitle>
          <EmptyDescription>PrepPhi n’a pas pu lire tes données. Vérifie ta connexion, puis réessaie.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={retry}>
            <ArrowClockwiseIcon />
            Réessayer
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

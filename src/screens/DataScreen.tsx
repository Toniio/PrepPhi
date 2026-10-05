import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item'
import { CATALOG_SIZE } from '@/catalog'
import { LADDERS_VERSION, RULES_VERSION } from '@/engine'
import { decideProposal } from '@/model/actions'
import { useAppData } from '@/model/context'
import { SCHEMA_VERSION } from '@/model/schema'
import { useRuntime } from '@/runtime/context'
import { Page } from '@/shell/Page'
import { Backup } from './data/Backup'
import { DemoData } from './data/DemoData'
import { EffortEntries } from './data/EffortEntries'
import { GarminImport } from './data/GarminImport'
import { ProfileForm } from './data/ProfileForm'
import { RedoOnboarding } from './data/RedoOnboarding'

const STATUS = {
  pending: { label: 'En attente', variant: 'secondary' },
  accepted: { label: 'Acceptée', variant: 'success' },
  declined: { label: 'Refusée', variant: 'outline' },
} as const

function Proposals() {
  const { data, update } = useAppData()
  if (data.proposals.length === 0) {
    return <p className="text-xs text-muted-foreground">Aucune proposition du coach pour l’instant.</p>
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Accepter une proposition ne change rien dans l’app : les échelles et les seuils se modifient dans le dépôt, avec
        Claude Code.
      </p>
      <ItemGroup>
        {[...data.proposals].reverse().map((p) => (
          <Item key={p.id} variant="outline" size="sm">
            <ItemContent>
              <ItemTitle>{p.textFr}</ItemTitle>
              <ItemDescription>Proposée le {p.createdAt.slice(0, 10)}</ItemDescription>
            </ItemContent>
            <ItemActions>
              {p.status === 'pending' ? (
                <>
                  <Button size="sm" variant="secondary" onClick={() => update((d) => decideProposal(d, p.id, true))}>
                    Accepter
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update((d) => decideProposal(d, p.id, false))}>
                    Refuser
                  </Button>
                </>
              ) : (
                <Badge variant={STATUS[p.status].variant}>{STATUS[p.status].label}</Badge>
              )}
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  )
}

export function DataScreen({ onRedoOnboarding }: { onRedoOnboarding: () => void }) {
  const { kind } = useRuntime()
  return (
    <Page title="Données">
      <section className="flex flex-col gap-3">
        <Heading level={2}>Import Garmin</Heading>
        <GarminImport />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Effort et résistance</Heading>
        <p className="text-xs text-muted-foreground">
          La montre ne connaît ni la résistance ni ton ressenti : note-les ici.
        </p>
        <EffortEntries />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Sauvegarde</Heading>
        <Backup />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Profil</Heading>
        <ProfileForm />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Onboarding</Heading>
        <RedoOnboarding onStart={onRedoOnboarding} />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Propositions du coach</Heading>
        <Proposals />
      </section>

      <section className="flex flex-col gap-3">
        <Heading level={2}>Démo</Heading>
        <DemoData />
      </section>

      <section className="flex flex-col gap-2 text-xs text-muted-foreground">
        <Heading level={2}>À propos</Heading>
        <p>
          Catalogue : {CATALOG_SIZE} exercices. Échelles v{LADDERS_VERSION}, règles v{RULES_VERSION}, données v
          {SCHEMA_VERSION}. Mode : {kind === 'claude' ? 'claude.ai' : 'développement'}.
        </p>
        <p>Données d’exercices : exercises-dataset (MIT). Animations © Gym visual, gymvisual.com.</p>
      </section>
    </Page>
  )
}

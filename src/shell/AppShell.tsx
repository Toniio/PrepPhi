import {
  CalendarCheckIcon,
  CalendarDotsIcon,
  ChartLineUpIcon,
  ChatCircleTextIcon,
  DatabaseIcon,
  type Icon,
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { DS, SECTIONS } from '@/i18n/fr'
import { useAppData } from '@/model/context'
import type { Section } from './sections'
import { ThemeSwitch } from './ThemeSwitch'

const ITEMS: { section: Section; icon: Icon }[] = [
  { section: 'today', icon: CalendarCheckIcon },
  { section: 'week', icon: CalendarDotsIcon },
  { section: 'review', icon: ChatCircleTextIcon },
  { section: 'progress', icon: ChartLineUpIcon },
  { section: 'data', icon: DatabaseIcon },
]

function Navigation({ section, onNavigate }: { section: Section; onNavigate: (section: Section) => void }) {
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarMenu>
      {ITEMS.map(({ section: item, icon: ItemIcon }) => (
        <SidebarMenuItem key={item}>
          <SidebarMenuButton
            isActive={item === section}
            aria-current={item === section ? 'page' : undefined}
            tooltip={SECTIONS[item]}
            onClick={() => {
              onNavigate(item)
              setOpenMobile(false)
            }}
          >
            <ItemIcon />
            {SECTIONS[item]}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

type Props = {
  section: Section
  onNavigate: (section: Section) => void
  children: ReactNode
}

/** The shell of every page (pattern "navigation"): sections in a Sidebar, a Sheet on mobile. */
export function AppShell({ section, onNavigate, children }: Props) {
  const { data } = useAppData()
  const demo = data.profile?.demo === true
  return (
    <SidebarProvider>
      <Sidebar mobileTitle={DS.sidebar.mobileTitle} mobileDescription={DS.sidebar.mobileDescription}>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 pt-2">
            <span className="font-heading text-sm font-semibold">PrepPhi</span>
            {demo && <Badge variant="secondary">Démo</Badge>}
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <nav aria-label="Sections">
                <Navigation section={section} onNavigate={onNavigate} />
              </nav>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <ThemeSwitch />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background text-foreground">
        <div className="flex items-center gap-2 px-page py-4 md:hidden">
          <SidebarTrigger toggleLabel={DS.sidebar.toggle} />
          <span className="font-heading text-sm font-semibold">PrepPhi</span>
          {demo && <Badge variant="secondary">Démo</Badge>}
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

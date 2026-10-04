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
import { DS, SECTIONS } from '@/i18n/fr'
import type { Section } from './sections'

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
  return (
    <SidebarProvider>
      <Sidebar mobileTitle={DS.sidebar.mobileTitle} mobileDescription={DS.sidebar.mobileDescription}>
        <SidebarHeader>
          <span className="px-2 pt-2 font-heading text-sm font-semibold">PrepPhi</span>
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
      </Sidebar>
      <SidebarInset className="bg-background text-foreground">
        <div className="flex items-center gap-2 px-page py-4 md:hidden">
          <SidebarTrigger toggleLabel={DS.sidebar.toggle} />
          <span className="font-heading text-sm font-semibold">PrepPhi</span>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

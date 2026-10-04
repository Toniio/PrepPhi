import { Toaster } from '@/components/ui/sonner'
import { AppDataProvider } from '@/model/AppDataProvider'
import { useAppData } from '@/model/context'
import { useRuntime } from '@/runtime/context'
import { RuntimeProvider } from '@/runtime/RuntimeProvider'
import { DataScreen } from '@/screens/DataScreen'
import { OnboardingScreen } from '@/screens/OnboardingScreen'
import { ProgressScreen } from '@/screens/ProgressScreen'
import { ReviewScreen } from '@/screens/ReviewScreen'
import { TodayScreen } from '@/screens/TodayScreen'
import { WeekScreen } from '@/screens/WeekScreen'
import { AppShell } from '@/shell/AppShell'
import { useSection } from '@/shell/sections'
import { LoadFailed, LoadingScreen, StorageUnavailable } from '@/shell/StatusScreens'

function Screens() {
  const { data } = useAppData()
  const [section, go] = useSection()
  if (!data.profile) return <OnboardingScreen />
  return (
    <AppShell section={section} onNavigate={go}>
      {section === 'today' && <TodayScreen onNavigate={go} />}
      {section === 'week' && <WeekScreen />}
      {section === 'review' && <ReviewScreen />}
      {section === 'progress' && <ProgressScreen />}
      {section === 'data' && <DataScreen />}
    </AppShell>
  )
}

function WithData() {
  const { store } = useRuntime()
  if (!store.available) return <StorageUnavailable />
  return (
    <AppDataProvider loading={<LoadingScreen />} failed={(retry) => <LoadFailed retry={retry} />}>
      <Screens />
    </AppDataProvider>
  )
}

export default function App() {
  return (
    <>
      <RuntimeProvider fallback={<LoadingScreen />}>
        <WithData />
      </RuntimeProvider>
      <Toaster position="top-center" />
    </>
  )
}

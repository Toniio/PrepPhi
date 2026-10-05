import { useState } from 'react'
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
import { useThemePreference } from '@/shell/useThemePreference'

function Screens() {
  const { data } = useAppData()
  const [section, go] = useSection()
  const [redoing, setRedoing] = useState(false)
  if (!data.profile) return <OnboardingScreen />
  if (redoing) {
    const { profile, ladderState } = data
    return <OnboardingScreen previous={{ profile, ladderState }} onExit={() => setRedoing(false)} />
  }
  return (
    <AppShell section={section} onNavigate={go}>
      {section === 'today' && <TodayScreen onNavigate={go} />}
      {section === 'week' && <WeekScreen />}
      {section === 'review' && <ReviewScreen />}
      {section === 'progress' && <ProgressScreen />}
      {section === 'data' && <DataScreen onRedoOnboarding={() => setRedoing(true)} />}
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
  const theme = useThemePreference()
  return (
    <>
      <RuntimeProvider fallback={<LoadingScreen />}>
        <WithData />
      </RuntimeProvider>
      <Toaster position="top-center" theme={theme} />
    </>
  )
}

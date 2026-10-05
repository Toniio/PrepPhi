import { MonitorIcon, MoonIcon, SunIcon, type Icon } from '@phosphor-icons/react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DS } from '@/i18n/fr'
import { setThemePreference, THEME_PREFERENCES, type ThemePreference } from '@/runtime/theme'
import { useThemePreference } from './useThemePreference'

const ICONS: Record<ThemePreference, Icon> = { system: MonitorIcon, light: SunIcon, dark: MoonIcon }

/** Système, clair ou sombre: the three modes of the theme (src/runtime/theme.ts). */
export function ThemeSwitch() {
  const preference = useThemePreference()
  return (
    <div className="flex flex-col gap-2 px-2 pb-2">
      <span id="theme-switch-label" className="text-xs text-sidebar-foreground/70">
        {DS.theme.label}
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-labelledby="theme-switch-label"
        value={preference}
        // A single group lets the active item be pressed off: keep the choice.
        onValueChange={(next) => next && setThemePreference(next as ThemePreference)}
        className="w-full"
      >
        {THEME_PREFERENCES.map((value) => {
          const ThemeIcon = ICONS[value]
          return (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={DS.theme[value]}
              title={DS.theme[value]}
              className="flex-1"
            >
              <ThemeIcon />
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}

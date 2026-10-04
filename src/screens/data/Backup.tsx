import { DownloadSimpleIcon, UploadSimpleIcon } from '@phosphor-icons/react'
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { today as localToday, weekStart } from '@/engine'
import { formatDay } from '@/i18n/fr'
import { useAppData } from '@/model/context'
import { exportJson, ImportError, parseImport } from '@/model/repository'
import type { AppData } from '@/model/schema'
import { useRuntime } from '@/runtime/context'

/** Full JSON export and import, versioned with schemaVersion (CLAUDE.md, "Données"). */
export function Backup() {
  const { downloader } = useRuntime()
  const { data, replaceAll } = useAppData()
  const [pending, setPending] = useState<AppData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const exportData = async () => {
    const outcome = await downloader.save(`prepphi-${localToday()}.json`, exportJson(data))
    if (outcome === 'saved') toast.success('Sauvegarde exportée.')
    if (outcome === 'unavailable') setError('Le téléchargement n’est pas disponible dans cette vue.')
  }

  const read = async (file: File | undefined) => {
    setError(null)
    if (!file) return
    try {
      setPending(parseImport(await file.text()))
    } catch (e) {
      setError(e instanceof ImportError ? e.message : 'Le fichier n’a pas pu être lu.')
    }
  }

  const confirm = async () => {
    if (!pending) return
    setBusy(true)
    await replaceAll(pending)
    setBusy(false)
    setPending(null)
    toast.success('Sauvegarde importée.')
  }

  const weeks = pending ? Object.keys(pending.weeks).sort() : []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          Un fichier JSON avec toutes tes données : profil, échelles, semaines, bilans, cardio, revues.
        </p>
        <Button variant="outline" onClick={exportData} className="self-start">
          <DownloadSimpleIcon />
          Exporter mes données
        </Button>
      </div>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="backup-file">Importer une sauvegarde</FieldLabel>
        <Input
          id="backup-file"
          type="file"
          accept=".json,application/json"
          aria-invalid={error ? true : undefined}
          aria-describedby="backup-file-help"
          onChange={(e) => {
            void read(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        <FieldDescription id="backup-file-help">Un fichier exporté par PrepPhi. Il remplace toutes tes données.</FieldDescription>
      </Field>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remplacer toutes tes données par la sauvegarde ?</AlertDialogTitle>
            <AlertDialogDescription>
              {weeks.length
                ? `La sauvegarde couvre ${weeks.length} semaine${weeks.length > 1 ? 's' : ''}, depuis la semaine du ${formatDay(weekStart(weeks[0]))}. `
                : ''}
              Tes données actuelles seront effacées : exporte-les d’abord si tu veux les garder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirm} disabled={busy}>
              <UploadSimpleIcon />
              Remplacer mes données
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

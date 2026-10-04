import { UploadSimpleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { GarminFormatError, mergeCardio, parseGarminCsv, type GarminImport as Parsed } from '@/import/garmin'
import { useAppData } from '@/model/context'

const TYPE_FR: Record<string, string> = {
  Elliptical: 'elliptique',
  'Strength Training': 'callisthénie',
  HIIT: 'HIIT',
}

/** The weekly import of the Garmin Connect "Activités" CSV. */
export function GarminImport() {
  const { data, update } = useAppData()
  const [parsed, setParsed] = useState<Parsed | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const read = async (file: File | undefined) => {
    setParsed(null)
    setError(null)
    if (!file) return
    try {
      setParsed(parseGarminCsv(await file.text()))
    } catch (e) {
      setError(e instanceof GarminFormatError ? e.message : 'Le fichier n’a pas pu être lu. Choisis un export CSV.')
    }
  }

  const preview = parsed ? mergeCardio(data.cardioLog, parsed.entries) : null
  const counts = parsed
    ? Object.entries(
        parsed.entries.reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }), {}),
      )
    : []
  const ignored = parsed ? Object.entries(parsed.ignored) : []

  const apply = async () => {
    if (!parsed) return
    setBusy(true)
    let added = 0
    await update((d) => {
      const merged = mergeCardio(d.cardioLog, parsed.entries)
      added = merged.added
      return { ...d, cardioLog: merged.log }
    })
    setBusy(false)
    setParsed(null)
    toast.success(`${added} activité${added > 1 ? 's' : ''} importée${added > 1 ? 's' : ''}.`)
  }

  return (
    <div className="flex flex-col gap-3">
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="garmin-csv">Export « Activités » de Garmin Connect</FieldLabel>
        <Input
          id="garmin-csv"
          type="file"
          accept=".csv,text/csv"
          aria-invalid={error ? true : undefined}
          aria-describedby="garmin-csv-help"
          onChange={(e) => void read(e.target.files?.[0])}
        />
        <FieldDescription id="garmin-csv-help">
          Garmin Connect, Activités, Toutes les activités, Exporter en CSV. Un export peut couvrir plusieurs semaines : les
          activités déjà importées sont ignorées.
        </FieldDescription>
      </Field>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      {parsed && preview && (
        <Alert>
          <UploadSimpleIcon />
          <AlertTitle>
            {preview.added} nouvelle{preview.added > 1 ? 's' : ''} activité{preview.added > 1 ? 's' : ''} à importer
          </AlertTitle>
          <AlertDescription>
            {counts.map(([type, n]) => `${n} ${TYPE_FR[type] ?? type}`).join(', ') || 'Aucune activité retenue'}.
            {preview.duplicates > 0 && ` ${preview.duplicates} déjà importée${preview.duplicates > 1 ? 's' : ''}.`}
            {ignored.length > 0 && ` Ignorées : ${ignored.map(([type, n]) => `${n} ${type}`).join(', ')}.`}
          </AlertDescription>
        </Alert>
      )}
      {parsed && preview && preview.added > 0 && (
        <Button onClick={apply} disabled={busy} className="self-start">
          <UploadSimpleIcon />
          Importer le CSV
        </Button>
      )}
    </div>
  )
}

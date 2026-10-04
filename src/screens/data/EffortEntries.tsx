import { FloppyDiskIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Item, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemTitle } from '@/components/ui/item'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { isElliptical, type CardioEntry } from '@/engine'
import { formatDayTitle, formatMinutes } from '@/i18n/fr'
import { updateCardio } from '@/model/actions'
import { useAppData } from '@/model/context'

function EffortRow({ entry }: { entry: CardioEntry }) {
  const { update } = useAppData()
  const [rpe, setRpe] = useState(entry.rpe != null ? String(entry.rpe) : '')
  const [resistance, setResistance] = useState(entry.resistance != null ? String(entry.resistance) : '')
  const id = entry.id.replace(/[^a-z0-9]/gi, '-')

  const save = async () => {
    await update((d) =>
      updateCardio(d, entry.id, {
        rpe: rpe === '' ? null : Number(rpe),
        resistance: resistance === '' ? null : Number(resistance),
      }),
    )
    toast.success('Séance complétée.')
  }

  return (
    <Item variant="outline" size="sm">
      <ItemContent>
        <ItemTitle>{formatDayTitle(entry.date)} · elliptique</ItemTitle>
        <ItemDescription>
          {formatMinutes(entry.durationMin)}
          {entry.avgHr != null && ` · FC moyenne ${entry.avgHr} bpm`}
        </ItemDescription>
      </ItemContent>
      <ItemFooter className="flex flex-wrap items-end gap-3">
        <Field className="w-32">
          <FieldLabel htmlFor={`${id}-rpe`}>Effort perçu</FieldLabel>
          <NativeSelect id={`${id}-rpe`} value={rpe} onChange={(e) => setRpe(e.target.value)}>
            <NativeSelectOption value="">Non noté</NativeSelectOption>
            {Array.from({ length: 10 }, (_, i) => (
              <NativeSelectOption key={i} value={String(i + 1)}>
                {i + 1} sur 10
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field className="w-32">
          <FieldLabel htmlFor={`${id}-resistance`}>Résistance</FieldLabel>
          <Input
            id={`${id}-resistance`}
            inputMode="numeric"
            value={resistance}
            onChange={(e) => setResistance(e.target.value)}
          />
        </Field>
        <Button variant="outline" onClick={save}>
          <FloppyDiskIcon />
          Enregistrer
        </Button>
      </ItemFooter>
    </Item>
  )
}

/** Imported elliptical sessions still missing the effort or the resistance. */
export function EffortEntries() {
  const { data } = useAppData()
  const missing = data.cardioLog
    .filter((e) => isElliptical(e) && (e.rpe === null || e.resistance === null))
    .slice(-8)
    .reverse()
  if (missing.length === 0) {
    return <p className="text-xs text-muted-foreground">Toutes les séances d’elliptique ont leur effort et leur résistance.</p>
  }
  return (
    <ItemGroup>
      {missing.map((entry) => (
        <EffortRow key={entry.id} entry={entry} />
      ))}
    </ItemGroup>
  )
}

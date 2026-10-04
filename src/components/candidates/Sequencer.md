# Sequencer

## Metadata

| Field         | Value                                       |
| ------------- | ------------------------------------------- |
| Name          | Sequencer                                   |
| Category      | Data                                        |
| Status        | candidate                                   |
| figma_node_id |                                             |
| code_path     | src/components/candidates/sequencer.tsx     |

## Role

A timer that runs a list of timed work and rest blocks over several rounds, with a beep, a spoken announcement and the screen kept on. `RestTimer` is its one-block form, the rest between two sets.

## Usage

- The rest timer between two sets, started when a set is marked done
- A circuit of several exercises repeated in rounds (the travel room circuit)
- Elliptical intervals: 6 × (1 min hard / 2 min easy)
- Any session where the hands are busy and the eyes are elsewhere: the voice says what comes next

## Constraints

- **MUST** — give every block a `label` in the interface language: the voice reads it
- **MUST** — start sound only after a user gesture (`Démarrer`, or the set marked done that opens `RestTimer`): browsers block audio before it
- **MUST NOT** — run more than one `Sequencer` at a time on a screen
- **MUST** — keep the remaining time readable at arm's length: the clock is `text-4xl`, the largest step of the type scale
- **MUST NOT** — rely on the beep alone: the label and the clock show the same state

## Dependencies

- `Button` (`@/components/ui/button`) — start, pause, skip, sound
- `Progress` (`@/components/ui/progress`) — progress through the whole sequence
- `@phosphor-icons/react` — `PlayIcon`, `PauseIcon`, `SkipForwardIcon`, `SpeakerHighIcon`, `SpeakerSlashIcon`
- `class-variance-authority` — the clock variant (`work`, `rest`)
- Browser APIs, used when present: Web Audio (beep), Web Speech `speechSynthesis` (voice, `fr-FR`), Screen Wake Lock (screen on)
- `sequencer-machine.ts` — the pure state machine (`tick`, `skip`), tested on its own

## Anatomy

| Slot                              | Role                                            |
| --------------------------------- | ----------------------------------------------- |
| `data-slot="sequencer"`           | Root; carries `data-state` (`running`, `paused`, `finished`) |
| `data-slot="sequencer-label"`     | The current block's label, `aria-live="polite"` |
| `data-slot="sequencer-round"`     | `Tour 2 sur 4`, shown with more than one round  |
| `data-slot="sequencer-clock"`     | The remaining time, `role="timer"`              |
| `data-slot="sequencer-actions"`   | Start or pause, skip, sound                     |

## Tokens

| Token                           | Classes                  | Where             |
| ------------------------------- | ------------------------ | ----------------- |
| `typography.size.4xl`           | `text-4xl`               | Clock             |
| `typography.font-family.mono`   | `font-heading`           | Clock             |
| `typography.font-weight.semibold` | `font-semibold`        | Clock             |
| `typography.letter-spacing.tight` | `tracking-tight`       | Clock             |
| `color.text.default`            | `text-foreground`        | Clock, `work`     |
| `color.text.subtle`             | `text-muted-foreground`  | Clock, `rest`; round |
| `typography.size.sm`, `.xs`     | `text-sm`, `text-xs`     | Label, round      |
| `space.scale.2`, `.3`           | `gap-2`, `gap-3`         | Layout            |

## Props / API

### `Sequencer`

| Prop         | Type                     | Default               | Description                                   |
| ------------ | ------------------------ | --------------------- | --------------------------------------------- |
| `sequence`   | `Sequence`               | —                     | `{ label, rounds, blocks: { label, seconds, kind }[] }` |
| `autoStart`  | `boolean`                | `false`               | Starts on mount                               |
| `onComplete` | `() => void`             | —                     | Called once, when the last block ends         |
| `labels`     | `SequencerLabels`        | `SEQUENCER_LABELS_FR` | Every string the component renders            |
| `className`  | `string`                 | —                     | Additional classes on the root                |

### `RestTimer`

| Prop         | Type         | Default | Description                     |
| ------------ | ------------ | ------- | ------------------------------- |
| `seconds`    | `number`     | —       | Rest length                     |
| `onComplete` | `() => void` | —       | Called when the rest is over    |

## Variants

The clock has one `cva` axis, `kind`, taken from the current block: `work` (`text-foreground`) or `rest` (`text-muted-foreground`). The component itself has no variant prop.

## States

| State      | Description                                                               |
| ---------- | ------------------------------------------------------------------------- |
| `paused`   | Before the start or after `Mettre en pause`; the button reads `Démarrer` or `Reprendre`, `secondary` so the screen's primary action stays the only primary |
| `running`  | The clock counts down; a short beep on each of the last 3 seconds, a long beep and the next block's label spoken at each change; the screen stays on |
| `finished` | `Terminé` is shown and spoken; start and skip disappear                   |
| `muted`    | The sound button is pressed (`aria-pressed`): no beep, no voice           |

## Accessibility

**Pattern**: A timer (`role="timer"`) with a live label.

**Keyboard**: every control is a `Button`: `Tab` to reach it, `Enter` or `Space` to activate it.

**Accessible name**: the sound button is icon-only and named by `soundOn` / `soundOff`; the progress bar by `labels.progress`.

**Pitfalls**:

- The clock is `aria-live="off"`: announcing every second would flood a screen reader. The block label is the live region.
- The voice is in French (`fr-FR`); a device without a French voice reads with its default voice.
- Wake Lock is refused in some framed pages: the timer still runs, only the screen may dim.

## Code example

```tsx
import { Sequencer } from "@/components/candidates/sequencer"

export default function Example() {
  return (
    <Sequencer
      sequence={{
        label: "Fractionné",
        rounds: 6,
        blocks: [
          { label: "Rapide", seconds: 60, kind: "work" },
          { label: "Récupération", seconds: 120, kind: "rest" },
        ],
      }}
    />
  )
}
```

## Cross-references

- `Progress` — the bar under the clock
- `Button` — the controls
- `SetCounter` — marking a set done opens a `RestTimer`

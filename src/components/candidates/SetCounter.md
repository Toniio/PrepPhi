# SetCounter

## Metadata

| Field         | Value                                     |
| ------------- | ----------------------------------------- |
| Name          | SetCounter                                |
| Category      | Forms                                     |
| Status        | candidate                                 |
| figma_node_id |                                           |
| code_path     | src/components/candidates/set-counter.tsx |

## Role

One row per set of an exercise: the value done (repetitions or seconds), pre-filled with the target, adjusted with two buttons, and a button that marks the set done.

## Usage

- The session in progress: adjust only what differs from the target, mark each set done
- The check-in after the session: the same values, read back as the result
- Holds counted in seconds (`unit="s"`, steps of 5 s)

## Constraints

- **MUST** — pre-fill `values` with the targets: Anthony changes only the deviations
- **MUST** — format the value with the interface's units (`8 rép.`, `30 s`) through `format`
- **MUST NOT** — accept free typing in the row: two buttons are faster with one hand and wet fingers
- **MUST NOT** — show more than 5 sets: a longer list is another exercise
- **MUST** — keep the decrease and increase buttons at `icon` (32px): they are pressed mid-set, with tired hands

## Dependencies

- `Button` (`@/components/ui/button`) — decrease, increase, done
- `@phosphor-icons/react` — `MinusIcon`, `PlusIcon`, `CheckIcon`
- `class-variance-authority` — the row variant (`done`)

## Anatomy

| Slot                            | Role                                        |
| ------------------------------- | ------------------------------------------- |
| `data-slot="set-counter"`       | Root, `role="group"`                        |
| `data-slot="set-counter-row"`   | One set; carries `data-done`                |
| `data-slot="set-counter-label"` | `Série 1`                                   |
| `data-slot="set-counter-value"` | The value, `aria-live="polite"`             |
| `data-slot="set-counter-target"`| `cible 8 rép.`, from `sm` up                |

## Tokens

| Token                       | Classes                   | Where              |
| --------------------------- | ------------------------- | ------------------ |
| `color.text.default`        | `text-foreground`         | Row done, value    |
| `color.text.subtle`         | `text-muted-foreground`   | Row not done, target |
| `typography.size.sm`, `.xs` | `text-sm`, `text-xs`      | Value, label       |
| `typography.font-weight.medium` | `font-medium`         | Value              |
| `space.scale.2`, `.1-5`     | `gap-2`, `py-1.5`         | Row                |
| `space.scale.16`            | `w-16`                    | Label, value       |

## Props / API

| Prop                | Type                            | Default                  | Description                           |
| ------------------- | ------------------------------- | ------------------------ | ------------------------------------- |
| `targets`           | `number[]`                      | —                        | Target per set                        |
| `values`            | `number[]`                      | —                        | Value per set (controlled)            |
| `onValuesChange`    | `(values: number[]) => void`    | —                        | New values                            |
| `completed`         | `boolean[]`                     | —                        | Set done (controlled)                 |
| `onCompletedChange` | `(completed: boolean[]) => void`| —                        | New done states                       |
| `onSetDone`         | `(index: number) => void`       | —                        | A set was just marked done (rest timer) |
| `unit`              | `"reps" \| "s"`                 | —                        | Repetitions or seconds                |
| `step`              | `number`                        | `1`, or `5` for seconds  | Increment of the buttons              |
| `format`            | `(value: number) => string`     | —                        | Value with its unit                   |
| `showDone`          | `boolean`                       | `true`                   | False for a plain counter (a total, a number of holds) |
| `labels`            | `SetCounterLabels`              | `SET_COUNTER_LABELS_FR`  | Every string the component renders    |
| `className`         | `string`                        | —                        | Additional classes                    |

## Variants

The row has one `cva` axis, `done`: a done set reads `text-foreground`, a pending one `text-muted-foreground`. The done button switches from `outline` to `secondary`.

## States

| State     | Description                                             |
| --------- | ------------------------------------------------------- |
| `pending` | Value at the target, done button `outline`              |
| `changed` | Value differs from the target; the target stays visible |
| `done`    | Done button pressed (`aria-pressed`), row in full color |

## Accessibility

**Pattern**: A group of buttons per row.

**Keyboard**: `Tab` through decrease, increase and done; `Enter` or `Space` activates.

**Accessible name**: the icon buttons are named per set (`Ajouter une unité à la série 2`); the value is announced when it changes.

**Pitfalls**:

- The value never goes below 0.
- Marking a set done twice unmarks it, and does not start a second rest.

## Code example

```tsx
const [values, setValues] = useState([8, 8, 8])
const [done, setDone] = useState([false, false, false])

<SetCounter
  targets={[8, 8, 8]}
  values={values}
  onValuesChange={setValues}
  completed={done}
  onCompletedChange={setDone}
  unit="reps"
  format={(v) => `${v} rép.`}
/>
```

## Cross-references

- `Sequencer` — `RestTimer` starts when a set is marked done
- `ExerciseCard` — the card that holds the counter
- `ToggleGroup` — the feeling, under the counter

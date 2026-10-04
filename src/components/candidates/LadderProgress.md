# LadderProgress

## Metadata

| Field         | Value                                         |
| ------------- | --------------------------------------------- |
| Name          | LadderProgress                                |
| Category      | Data                                          |
| Status        | candidate                                     |
| figma_node_id |                                               |
| code_path     | src/components/candidates/ladder-progress.tsx |

## Role

The steps of a progression ladder in order, with the steps passed, the current one and those to come, or the whole ladder locked until its entry conditions hold.

## Usage

- The Progression screen: one per ladder
- The review: where a proposed step sits in its ladder
- A skill not yet unlocked: every step shows as locked

## Constraints

- **MUST** — list the steps in level order, level 1 first
- **MUST** — keep at most one current step
- **MUST** — say each step's status in text for screen readers, not only through the marker
- **MUST NOT** — use it for a process that is not a ladder (a form, a checkout): that is `Progress`
- **MUST NOT** — put controls in `currentDetail`: the detail is text (targets, a proposal)

## Dependencies

- `@phosphor-icons/react` — `CheckIcon`, `LockIcon`
- `class-variance-authority` — the marker and text variants (`status`)
- `cn` (`@/lib/utils`)

## Anatomy

| Slot                              | Role                                       |
| --------------------------------- | ------------------------------------------ |
| `data-slot="ladder-progress"`     | Root, an ordered list                      |
| `data-slot="ladder-progress-step"`| One step; carries `data-status`, `aria-current="step"` on the current one |
| `data-slot="ladder-progress-rail"`| The line joining a step to the next        |

## Tokens

| Token                      | Classes                                  | Where            |
| -------------------------- | ---------------------------------------- | ---------------- |
| `color.action.background.default` | `bg-primary`, `border-primary`    | Marker, `done`   |
| `color.action.background.foreground` | `text-primary-foreground`      | Marker, `done`   |
| `color.text.default`       | `border-foreground`, `text-foreground`   | Marker and text, `current` |
| `color.border.default`     | `border-border`, `bg-border`             | Markers, rail    |
| `color.background.subtle`  | `bg-muted`                               | Marker, `locked` |
| `color.text.subtle`        | `text-muted-foreground`                  | Other steps      |
| `radius.full`              | `rounded-full`                           | Marker           |
| `space.scale.6`, `.3`      | `size-6`, `gap-3`, `pb-3`, `left-3`, `top-6` | Layout       |

## Props / API

| Prop            | Type                    | Default                       | Description                          |
| --------------- | ----------------------- | ----------------------------- | ------------------------------------ |
| `ladderName`    | `string`                | —                             | Names the list                       |
| `steps`         | `LadderProgressStep[]`  | —                             | `{ level, nameFr, rangeLabel }`      |
| `current`       | `number`                | —                             | Current level                        |
| `unlocked`      | `boolean`               | —                             | False: every step shows as locked    |
| `currentDetail` | `ReactNode`             | —                             | Text under the current step          |
| `labels`        | `LadderProgressLabels`  | `LADDER_PROGRESS_LABELS_FR`   | Every string the component renders   |
| `className`     | `string`                | —                             | Additional classes                   |

## Variants

One `cva` axis on the marker and the text, `status`: `done`, `current`, `upcoming`, `locked`. Set by the component from `current` and `unlocked`.

## States

| State      | Description                                         |
| ---------- | --------------------------------------------------- |
| `done`     | Filled marker with a check                          |
| `current`  | Outlined marker with the level, text in full color, `currentDetail` below |
| `upcoming` | Muted marker with the level                         |
| `locked`   | Muted marker with a lock, on every step             |

## Accessibility

**Pattern**: An ordered list (`ol`) with `aria-current="step"`.

**Keyboard**: no interaction.

**Accessible name**: `Paliers de l’échelle <name>`; each step ends with its status in hidden text (`, palier actuel`).

**Pitfalls**:

- The markers are hidden from screen readers (`aria-hidden`): the status text carries the meaning.

## Code example

```tsx
<LadderProgress
  ladderName="Tirage vertical"
  current={4}
  unlocked
  steps={[
    { level: 1, nameFr: "Suspension passive", rangeLabel: "3 × 20–45 s" },
    { level: 2, nameFr: "Tirage scapulaire", rangeLabel: "3 × 6–12" },
  ]}
/>
```

## Cross-references

- `Progress` — a single value in a process, not a ladder
- `Card` — the usual container on the Progression screen

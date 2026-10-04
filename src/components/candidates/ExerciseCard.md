# ExerciseCard

## Metadata

| Field         | Value                                       |
| ------------- | ------------------------------------------- |
| Name          | ExerciseCard                                |
| Category      | Media                                       |
| Status        | candidate                                   |
| figma_node_id |                                             |
| code_path     | src/components/candidates/exercise-card.tsx |

## Role

One exercise of a session: its name, its step and targets, its animation when there is one, a note, the controls of the session, and its full sheet in a `Drawer`.

## Usage

- Each exercise of today's session, with a `SetCounter` and the feeling as children
- An accessory added by the coach, without a step
- An exercise without animation (hors-dataset sheets): the card shows the text, the sheet links to a video

## Constraints

- **MUST** — show the animation's attribution in the sheet (`© Gym visual`) whenever the animation is shown
- **MUST** — show `noteFr` when the animation shows other equipment than Anthony's
- **MUST** — remind, in the sheet, to stop on sharp pain (`rules.json`, `pain.exerciseSheetReminder`)
- **MUST NOT** — put more than one exercise in a card
- **MUST** — open external videos in a new tab, through a `Button asChild` link

## Dependencies

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` (`@/components/ui/card`)
- `AspectRatio` (`@/components/ui/aspect-ratio`) — the square animation
- `Badge` (`@/components/ui/badge`) — the step
- `Drawer` and its parts (`@/components/ui/drawer`) — the sheet
- `Button` (`@/components/ui/button`)
- `@phosphor-icons/react` — `BookOpenIcon`, `PlayCircleIcon`, `WarningIcon`
- `ExerciseInfo` (`@/catalog`) — the exercise data

## Anatomy

| Slot                              | Role                                     |
| --------------------------------- | ---------------------------------------- |
| `data-slot="exercise-card"`       | Root, a `Card`                           |
| `data-slot="exercise-card-media"` | The animation, at most `max-w-60`, square |
| `data-slot="exercise-card-note"`  | The note under the animation             |
| `data-slot="exercise-sheet"`      | The scrolling body of the sheet          |

## Tokens

| Token                     | Classes                 | Where          |
| ------------------------- | ----------------------- | -------------- |
| `color.text.subtle`       | `text-muted-foreground` | Note, attribution |
| `color.text.warning`      | `text-warning`          | Pain reminder  |
| `typography.size.xs`      | `text-xs`               | Sheet body     |
| `typography.font-weight.medium` | `font-medium`     | Sheet headings |
| `space.scale.60`          | `max-w-60`              | Media          |
| `space.scale.2`, `.3`, `.4` | `gap-2`, `gap-3`, `gap-4`, `px-4`, `pl-4` | Layout |

## Props / API

| Prop           | Type                  | Default                   | Description                         |
| -------------- | --------------------- | ------------------------- | ----------------------------------- |
| `exercise`     | `ExerciseInfo`        | —                         | Name, steps, media, video, note     |
| `levelLabel`   | `string`              | —                         | `Palier 4`, as a badge              |
| `targetsLabel` | `string`              | —                         | `3 × 8–12`                          |
| `note`         | `string`              | —                         | Replaces `exercise.noteFr` on the card |
| `children`     | `ReactNode`           | —                         | Session controls                    |
| `labels`       | `ExerciseCardLabels`  | `EXERCISE_CARD_LABELS_FR` | Every string the component renders  |
| `className`    | `string`              | —                         | Additional classes                  |

## Variants

No variant axis. A card without `mediaUrl` simply has no media slot.

## States

| State        | Description                                  |
| ------------ | -------------------------------------------- |
| `default`    | Header, media, note, children, sheet button  |
| `no-media`   | Hors-dataset exercise: text only, video link in the sheet |
| `sheet-open` | The `Drawer` is open                         |

## Accessibility

**Pattern**: A card with a dialog (`Drawer`) for the details.

**Keyboard**: the sheet button opens the drawer; `Esc` closes it.

**Accessible name**: the drawer is titled by the exercise's name (`DrawerTitle`); the animation's `alt` reads `Animation : <name>`.

**Pitfalls**:

- `CardTitle` is not a heading: the screen that lists the cards gives them a heading level if they are sections.
- Animated WebP loops forever: the media stays small and lazy-loaded.

## Code example

```tsx
<ExerciseCard exercise={getExercise("ds:0652")} levelLabel="Palier 4" targetsLabel="3 × 3–8">
  <SetCounter {...counter} />
</ExerciseCard>
```

## Cross-references

- `SetCounter` — the usual child
- `Drawer` — the sheet
- `Card` — the surface

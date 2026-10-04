"use client"

import * as React from "react"
import { Questionnaire as QuestionnairePrimitive } from "@shadcn/react/questionnaire"

import { cn } from "@/lib/utils"
import { FOCUS_OUTLINE_RESET, FOCUS_RING } from "@/lib/focus"
import { UI_STRINGS } from "@/lib/ui-strings"
import { buttonVariants, type Button } from "@/components/ui/button"
import { CheckIcon } from "@phosphor-icons/react"

/**
 * A form that asks one question at a time; set `shortcuts` to label the choices with letters or numbers.
 *
 * @example
 * <Questionnaire onSubmit={handleSubmit}>
 *   <QuestionnaireProgress />
 *   <QuestionnaireItem name="audience">
 *     <QuestionnaireTitle>Who is this report for?</QuestionnaireTitle>
 *   </QuestionnaireItem>
 *   <QuestionnaireActions>
 *     <QuestionnaireNext />
 *   </QuestionnaireActions>
 * </Questionnaire>
 */
function Questionnaire({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Root>) {
  return (
    <QuestionnairePrimitive.Root
      data-slot="questionnaire"
      className={cn("flex w-full min-w-0 flex-col gap-4", className)}
      {...props}
    />
  )
}

// The primitive renders a progress bar whose text is "Question 2 of 5"; the
// minimum width keeps the line from shifting as the numbers grow.
/**
 * The line that tells the user where they are in a `Questionnaire`, such as "Question 2 of 5".
 *
 * @example
 * <Questionnaire>
 *   <QuestionnaireProgress />
 * </Questionnaire>
 */
function QuestionnaireProgress({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Progress>) {
  return (
    <QuestionnairePrimitive.Progress
      data-slot="questionnaire-progress"
      aria-label={UI_STRINGS.questionnaire.progress}
      className={cn(
        "min-h-lh w-fit min-w-28 text-xs font-medium text-muted-foreground tabular-nums",
        className
      )}
      {...props}
    />
  )
}

/**
 * One question of a `Questionnaire`; its unique `name` is the answer's field name, and `multiple` allows several choices.
 *
 * @example
 * <QuestionnaireItem name="trip-dates">
 *   <QuestionnaireTitle>When do you want to travel?</QuestionnaireTitle>
 * </QuestionnaireItem>
 */
function QuestionnaireItem({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Item>) {
  return (
    <QuestionnairePrimitive.Item
      data-slot="questionnaire-item"
      className={cn(
        // focus-managed: the item takes focus programmatically when it becomes current; its controls draw FOCUS_RING
        `flex min-w-0 flex-col gap-4 border-0 p-0 ${FOCUS_OUTLINE_RESET}`,
        className
      )}
      {...props}
    />
  )
}

/**
 * The question itself, shown at the top of a `QuestionnaireItem`.
 *
 * @example
 * <QuestionnaireItem name="audience">
 *   <QuestionnaireTitle>Who is this report for?</QuestionnaireTitle>
 * </QuestionnaireItem>
 */
function QuestionnaireTitle({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Title>) {
  return (
    <QuestionnairePrimitive.Title
      data-slot="questionnaire-title"
      className={cn(
        "font-heading text-sm font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * The supporting line under a `QuestionnaireTitle` that explains what kind of answer helps.
 *
 * @example
 * <QuestionnaireItem name="audience">
 *   <QuestionnaireTitle>Who is this report for?</QuestionnaireTitle>
 *   <QuestionnaireDescription>Pick the group that reads it most.</QuestionnaireDescription>
 * </QuestionnaireItem>
 */
function QuestionnaireDescription({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Description>) {
  return (
    <QuestionnairePrimitive.Description
      data-slot="questionnaire-description"
      className={cn(
        "text-xs/relaxed text-pretty text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/**
 * The group that lays out the `QuestionnaireChoice` options of one question.
 *
 * @example
 * <QuestionnaireChoices>
 *   <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
 *   <QuestionnaireChoice value="board">The board</QuestionnaireChoice>
 * </QuestionnaireChoices>
 */
function QuestionnaireChoices({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choices>) {
  return (
    <QuestionnairePrimitive.Choices
      data-slot="questionnaire-choices"
      className={cn(
        "group/questionnaire-choices grid min-w-0 gap-2",
        className
      )}
      {...props}
    />
  )
}

// The native input is stretched, transparent, over the whole choice: the
// choice draws its focus ring when the input has it.
/**
 * One selectable answer of a question: a radio for a single choice, a checkbox when the item is `multiple`.
 *
 * @example
 * <QuestionnaireChoices>
 *   <QuestionnaireChoice value="team">My team</QuestionnaireChoice>
 * </QuestionnaireChoices>
 */
function QuestionnaireChoice({
  children,
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice>) {
  return (
    <QuestionnairePrimitive.Choice
      data-slot="questionnaire-choice"
      className={cn(
        "group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-none border border-input bg-transparent px-3 py-2.5 text-start text-xs outline-hidden transition-colors select-none hover:bg-overlay-hover has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-(length:--space-focus-ring-width) has-[>input:focus-visible]:ring-ring/50 data-invalid:border-destructive data-checked:border-foreground data-checked:bg-muted",
        "data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-disabled",
        className
      )}
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        data-slot="questionnaire-choice-input"
        // allow-raw: local-stacking — z-10 lays the transparent input over the indicator and label it answers for
        className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
      />
      <span
        aria-hidden="true"
        data-slot="questionnaire-choice-indicator"
        className="pointer-events-none relative flex size-4 shrink-0 translate-y-0.5 items-center justify-center rounded-none border border-input group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground"
      >
        <span
          data-slot="questionnaire-choice-indicator-dot"
          className="hidden size-2 rounded-full bg-primary-foreground group-data-[type=checkbox]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
        />
        <CheckIcon
          data-slot="questionnaire-choice-indicator-check"
          className="hidden size-3.5 group-data-[type=radio]/questionnaire-choice:hidden group-data-checked/questionnaire-choice:block"
        />
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        data-slot="questionnaire-choice-label"
        className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug"
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        data-slot="questionnaire-choice-shortcut"
        className="pointer-events-none ms-auto hidden size-4 shrink-0 translate-y-0.5 items-center justify-center rounded-none border border-input bg-background font-mono text-xs leading-none font-medium text-muted-foreground group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[shortcut]/questionnaire-choice:inline-flex"
      />
    </QuestionnairePrimitive.Choice>
  )
}

/**
 * A muted second line inside a `QuestionnaireChoice` that adds detail to the answer.
 *
 * @example
 * <QuestionnaireChoice value="weekly">
 *   Weekly summary
 *   <QuestionnaireChoiceDescription>One email every Monday morning.</QuestionnaireChoiceDescription>
 * </QuestionnaireChoice>
 */
function QuestionnaireChoiceDescription({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="questionnaire-choice-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * A free-text answer field for a question, used alone or under the choices.
 *
 * @example
 * <QuestionnaireItem name="other">
 *   <QuestionnaireTitle>Anything else we should know?</QuestionnaireTitle>
 *   <QuestionnaireInput />
 * </QuestionnaireItem>
 */
function QuestionnaireInput({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Input>) {
  return (
    <div
      data-slot="questionnaire-input-wrapper"
      className="group/questionnaire-input relative w-full min-w-0"
    >
      <QuestionnairePrimitive.Input
        data-slot="questionnaire-input"
        className={cn(
          `h-8 min-h-11 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1 text-xs transition-colors ${FOCUS_OUTLINE_RESET} ${FOCUS_RING} disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input-fill/50 disabled:opacity-disabled aria-invalid:border-destructive aria-invalid:ring-destructive/20 sm:min-h-0 md:text-xs dark:bg-input-fill/30 dark:disabled:bg-input-fill/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40`,
          "selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * The message that explains why a question cannot move on, such as a required answer left empty.
 *
 * @example
 * <QuestionnaireItem name="audience" required>
 *   <QuestionnaireTitle>Who is this report for?</QuestionnaireTitle>
 *   <QuestionnaireError />
 * </QuestionnaireItem>
 */
function QuestionnaireError({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Error>) {
  return (
    <QuestionnairePrimitive.Error
      data-slot="questionnaire-error"
      className={cn("mt-2 text-xs text-destructive", className)}
      {...props}
    />
  )
}

/**
 * The row that holds the previous, skip, next and submit controls, placed after the questions.
 *
 * @example
 * <QuestionnaireActions>
 *   <QuestionnairePrevious />
 *   <QuestionnaireSkip />
 *   <QuestionnaireNext />
 * </QuestionnaireActions>
 */
function QuestionnaireActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="questionnaire-actions"
      className={cn(
        "grid min-h-11 w-full grid-cols-[1fr_auto_auto] items-center gap-1.5 sm:min-h-8",
        className
      )}
      {...props}
    />
  )
}

/**
 * The button that returns to the question before the current one.
 *
 * @example
 * <QuestionnaireActions>
 *   <QuestionnairePrevious />
 * </QuestionnaireActions>
 */
function QuestionnairePrevious({
  children,
  className,
  size = "default",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Previous> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Previous
      data-slot="questionnaire-previous"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0",
        className
      )}
      {...props}
    >
      {children ?? UI_STRINGS.questionnaire.previous}
    </QuestionnairePrimitive.Previous>
  )
}

/**
 * The button that moves past the current question without an answer; it stays hidden for a `required` question.
 *
 * @example
 * <QuestionnaireActions>
 *   <QuestionnaireSkip />
 * </QuestionnaireActions>
 */
function QuestionnaireSkip({
  children,
  className,
  size = "default",
  variant = "outline",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Skip> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Skip
      data-slot="questionnaire-skip"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0",
        className
      )}
      {...props}
    >
      {children ?? UI_STRINGS.questionnaire.skip}
    </QuestionnairePrimitive.Skip>
  )
}

/**
 * The button that validates the current answer and moves to the next question.
 *
 * @example
 * <QuestionnaireActions>
 *   <QuestionnaireNext>Continue</QuestionnaireNext>
 * </QuestionnaireActions>
 */
function QuestionnaireNext({
  children,
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Next> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Next
      data-slot="questionnaire-next"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
        className
      )}
      {...props}
    >
      {children ?? UI_STRINGS.questionnaire.next}
    </QuestionnairePrimitive.Next>
  )
}

/**
 * The button that sends every answer through the form's `onSubmit` on the last question.
 *
 * @example
 * <QuestionnaireActions>
 *   <QuestionnaireSubmit>Send answers</QuestionnaireSubmit>
 * </QuestionnaireActions>
 */
function QuestionnaireSubmit({
  children,
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Submit> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant">) {
  return (
    <QuestionnairePrimitive.Submit
      data-slot="questionnaire-submit"
      data-size={size}
      data-variant={variant}
      className={cn(
        buttonVariants({ size, variant }),
        "col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0",
        className
      )}
      {...props}
    >
      {children ?? UI_STRINGS.questionnaire.submit}
    </QuestionnairePrimitive.Submit>
  )
}

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
}

export type QuestionnaireProps = React.ComponentProps<typeof Questionnaire>
export type QuestionnaireActionsProps = React.ComponentProps<
  typeof QuestionnaireActions
>
export type QuestionnaireChoiceProps = React.ComponentProps<
  typeof QuestionnaireChoice
>
export type QuestionnaireChoiceDescriptionProps = React.ComponentProps<
  typeof QuestionnaireChoiceDescription
>
export type QuestionnaireChoicesProps = React.ComponentProps<
  typeof QuestionnaireChoices
>
export type QuestionnaireDescriptionProps = React.ComponentProps<
  typeof QuestionnaireDescription
>
export type QuestionnaireErrorProps = React.ComponentProps<
  typeof QuestionnaireError
>
export type QuestionnaireInputProps = React.ComponentProps<
  typeof QuestionnaireInput
>
export type QuestionnaireItemProps = React.ComponentProps<
  typeof QuestionnaireItem
>
export type QuestionnaireNextProps = React.ComponentProps<
  typeof QuestionnaireNext
>
export type QuestionnairePreviousProps = React.ComponentProps<
  typeof QuestionnairePrevious
>
export type QuestionnaireProgressProps = React.ComponentProps<
  typeof QuestionnaireProgress
>
export type QuestionnaireSkipProps = React.ComponentProps<
  typeof QuestionnaireSkip
>
export type QuestionnaireSubmitProps = React.ComponentProps<
  typeof QuestionnaireSubmit
>
export type QuestionnaireTitleProps = React.ComponentProps<
  typeof QuestionnaireTitle
>

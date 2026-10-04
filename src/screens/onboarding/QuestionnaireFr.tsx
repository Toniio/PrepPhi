import type { ReactNode } from 'react'
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
} from '@/components/ui/questionnaire'
import { DS } from '@/i18n/fr'

// A Questionnaire with every default string in French (docs/redaction-fr.md).

type Props = {
  onAnswers: (answers: FormData) => void
  submitLabel: string
  children: ReactNode
}

export function QuestionnaireFr({ onAnswers, submitLabel, children }: Props) {
  return (
    <Questionnaire
      noValidate={false}
      onSubmit={(event) => {
        event.preventDefault()
        onAnswers(new FormData(event.currentTarget))
      }}
    >
      <QuestionnaireProgress
        aria-label={DS.questionnaire.progress}
        render={(props, state) => (
          <div {...props} aria-valuetext={`Question ${state.current} sur ${state.total}`}>
            Question {state.current} sur {state.total}
          </div>
        )}
      />
      {children}
      <QuestionnaireActions>
        <QuestionnairePrevious>{DS.questionnaire.previous}</QuestionnairePrevious>
        <QuestionnaireSkip>{DS.questionnaire.skip}</QuestionnaireSkip>
        <QuestionnaireNext>{DS.questionnaire.next}</QuestionnaireNext>
        <QuestionnaireSubmit>{submitLabel}</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  )
}

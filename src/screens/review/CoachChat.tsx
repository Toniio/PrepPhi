import { ArrowDownIcon, PaperPlaneRightIcon, StopIcon } from '@phosphor-icons/react'
import { useRef, useState } from 'react'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Marker, MarkerContent } from '@/components/ui/marker'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { Textarea } from '@/components/ui/textarea'
import { buildContext } from '@/coach/context'
import { chatTurns, devChatReply } from '@/coach/prompts'
import type { ReviewFacts, WeekId } from '@/engine'
import { DS } from '@/i18n/fr'
import { addChatTurn } from '@/model/actions'
import { useAppData } from '@/model/context'
import { useRuntime } from '@/runtime/context'
import { CoachError } from '@/runtime'

const HISTORY_TURNS = 12

function errorCopy(error: unknown): string {
  const code = error instanceof CoachError ? error.code : 'failed'
  if (code === 'not_granted' || code === 'unavailable') return 'Le coach n’est pas disponible dans cette vue.'
  if (code === 'rate_limited') return 'Trop de questions d’affilée. Réessaie dans quelques minutes.'
  return 'Le coach n’a pas répondu. Vérifie ta connexion, puis renvoie ta question.'
}

/** The review conversation (rule-23): MessageScroller, Message, Bubble, Marker. */
export function CoachChat({ weekId, facts }: { weekId: WeekId; facts: ReviewFacts }) {
  const { coach } = useRuntime()
  const { data, update } = useAppData()
  const messages = data.reviews[weekId]?.messages ?? []
  const [draft, setDraft] = useState('')
  const [streaming, setStreaming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)

  const send = async () => {
    const question = draft.trim()
    if (streaming !== null) return
    if (!question) {
      document.getElementById('coach-question')?.focus()
      return
    }
    setDraft('')
    setError(null)
    const now = new Date().toISOString()
    await update((d) => addChatTurn(d, weekId, { role: 'user', content: question, at: now }))
    const history = [...messages, { role: 'user' as const, content: question }]
      .slice(-HISTORY_TURNS)
      .map(({ role, content }) => ({ role, content }))
    controller.current = new AbortController()
    setStreaming('')
    try {
      const answer = await coach.text({
        purpose: 'chat',
        modelTier: 'default',
        input: chatTurns({ context: buildContext(data, weekId), facts, history }),
        signal: controller.current.signal,
        onText: setStreaming,
        devReply: () => devChatReply(question),
      })
      await update((d) => addChatTurn(d, weekId, { role: 'assistant', content: answer, at: new Date().toISOString() }))
    } catch (e) {
      if (!(e instanceof CoachError && e.code === 'cancelled')) setError(errorCopy(e))
    } finally {
      setStreaming(null)
      controller.current = null
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-96">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport aria-label={DS.messageScroller.viewport}>
              <MessageScrollerContent>
                <MessageScrollerItem messageId="start">
                  <Marker variant="separator">
                    <MarkerContent>Revue de la semaine {weekId.split('-W')[1]}</MarkerContent>
                  </Marker>
                </MessageScrollerItem>
                {messages.length === 0 && streaming === null && (
                  <MessageScrollerItem messageId="hint">
                    <p className="text-xs text-muted-foreground">
                      Pose une question sur ta semaine, un exercice ou une proposition du coach.
                    </p>
                  </MessageScrollerItem>
                )}
                {messages.map((m, i) => (
                  <MessageScrollerItem key={`${m.at}-${i}`} messageId={`${m.at}-${i}`}>
                    <Message align={m.role === 'user' ? 'end' : 'start'}>
                      <MessageContent>
                        <MessageHeader>{m.role === 'user' ? 'Toi' : 'Coach'}</MessageHeader>
                        <Bubble variant={m.role === 'user' ? 'default' : 'ghost'}>
                          <BubbleContent>{m.content}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
                {streaming !== null && (
                  <MessageScrollerItem messageId="streaming">
                    <Message align="start">
                      <MessageContent>
                        <MessageHeader>Coach</MessageHeader>
                        <Bubble variant="ghost">
                          <BubbleContent>{streaming || 'Le coach réfléchit…'}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton direction="end">
              <ArrowDownIcon />
              <span className="sr-only">{DS.messageScroller.scrollToEnd}</span>
            </MessageScrollerButton>
          </MessageScroller>
        </MessageScrollerProvider>
      </div>
      {!coach.available && (
        <p className="text-xs text-muted-foreground">Le coach n’est pas disponible dans cette vue.</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <Field>
        <FieldLabel htmlFor="coach-question">Ta question au coach</FieldLabel>
        <Textarea
          id="coach-question"
          value={draft}
          rows={2}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void send()
          }}
        />
      </Field>
      <div className="flex gap-2">
        {streaming === null ? (
          <Button onClick={send} disabled={!coach.available}>
            <PaperPlaneRightIcon />
            Envoyer
          </Button>
        ) : (
          <Button variant="outline" onClick={() => controller.current?.abort()}>
            <StopIcon />
            Arrêter
          </Button>
        )}
      </div>
    </div>
  )
}

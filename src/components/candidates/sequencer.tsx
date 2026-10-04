import { PauseIcon, PlayIcon, SkipForwardIcon, SpeakerHighIcon, SpeakerSlashIcon } from '@phosphor-icons/react'
import { cva } from 'class-variance-authority'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { Sequence } from '@/engine'
import { cn } from '@/lib/utils'
import {
  formatClock,
  initialState,
  skip,
  tick,
  totalSeconds,
  type SequencerEvent,
  type SequencerState,
} from './sequencer-machine'

// Candidate component (absent from DSAIReadable): spec in Sequencer.md.

export type SequencerLabels = {
  start: string
  pause: string
  resume: string
  skip: string
  soundOn: string
  soundOff: string
  round: (round: number, rounds: number) => string
  progress: string
  finished: string
}

export const SEQUENCER_LABELS_FR: SequencerLabels = {
  start: 'Démarrer',
  pause: 'Mettre en pause',
  resume: 'Reprendre',
  skip: 'Passer le bloc',
  soundOn: 'Activer le son',
  soundOff: 'Couper le son',
  round: (round, rounds) => `Tour ${round} sur ${rounds}`,
  progress: 'Progression du circuit',
  finished: 'Terminé',
}

const blockVariants = cva('font-heading text-4xl font-semibold tabular-nums tracking-tight', {
  variants: {
    kind: {
      work: 'text-foreground',
      rest: 'text-muted-foreground',
    },
  },
  defaultVariants: { kind: 'work' },
})

// -- Sound, voice and screen ------------------------------------------------------

function beep(context: AudioContext | null, high: boolean) {
  if (!context) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.frequency.value = high ? 880 : 660
  gain.gain.value = 0.15
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + (high ? 0.35 : 0.15))
}

function say(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  window.speechSynthesis.speak(utterance)
}

/** Keeps the screen on while running, where the page allows it. */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let released = false
    navigator.wakeLock
      .request('screen')
      .then((sentinel) => {
        if (released) sentinel.release()
        else lock = sentinel
      })
      .catch(() => {})
    return () => {
      released = true
      lock?.release().catch(() => {})
    }
  }, [active])
}

const TICK_MS = 200

type Props = {
  sequence: Sequence
  /** Starts on mount, for the rest timer between sets. */
  autoStart?: boolean
  onComplete?: () => void
  labels?: SequencerLabels
  className?: string
}

export function Sequencer({ sequence, autoStart = false, onComplete, labels = SEQUENCER_LABELS_FR, className }: Props) {
  const [state, setState] = useState<SequencerState>(() => ({ ...initialState(sequence), running: autoStart }))
  const [sound, setSound] = useState(true)
  const stateRef = useRef(state)
  const audio = useRef<AudioContext | null>(null)
  const last = useRef(0)
  const soundRef = useRef(sound)
  const completeRef = useRef(onComplete)

  useEffect(() => {
    soundRef.current = sound
    completeRef.current = onComplete
  }, [sound, onComplete])

  /** Moves to `next`, then plays what it crossed: side effects stay out of the state updates. */
  const commit = useCallback(
    (next: SequencerState, events: SequencerEvent[]) => {
      stateRef.current = next
      setState(next)
      for (const event of events) {
        if (soundRef.current) {
          if (event.type === 'countdown') beep(audio.current, false)
          if (event.type === 'block-start') {
            beep(audio.current, true)
            const block = sequence.blocks[event.block]
            say(`${block.label}, ${block.seconds} secondes`)
          }
          if (event.type === 'finished') {
            beep(audio.current, true)
            say(labels.finished)
          }
        }
        if (event.type === 'finished') completeRef.current?.()
      }
    },
    [sequence, labels.finished],
  )

  useEffect(() => {
    if (!state.running) return
    last.current = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      const result = tick(sequence, stateRef.current, now - last.current)
      last.current = now
      if (result.state !== stateRef.current) commit(result.state, result.events)
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [state.running, sequence, commit])

  useWakeLock(state.running)

  const ensureAudio = () => {
    if (!audio.current && typeof AudioContext !== 'undefined') audio.current = new AudioContext()
    void audio.current?.resume()
  }

  const toggle = () => {
    ensureAudio()
    const current = stateRef.current
    const fresh = current.remainingMs === sequence.blocks[current.block].seconds * 1000
    if (!current.running && fresh && sound) {
      const block = sequence.blocks[current.block]
      say(`${block.label}, ${block.seconds} secondes`)
    }
    commit({ ...current, running: !current.running }, [])
  }

  const next = () => {
    ensureAudio()
    const result = skip(sequence, stateRef.current)
    commit(result.state, result.events)
  }

  const block = sequence.blocks[state.block]
  const total = totalSeconds(sequence)
  const elapsedBefore =
    (state.round - 1) * sequence.blocks.reduce((sum, b) => sum + b.seconds, 0) +
    sequence.blocks.slice(0, state.block).reduce((sum, b) => sum + b.seconds, 0)
  const done = state.finished ? total : elapsedBefore + block.seconds - state.remainingMs / 1000
  const startedOnce = state.running || done > 0

  return (
    <div
      data-slot="sequencer"
      data-state={state.finished ? 'finished' : state.running ? 'running' : 'paused'}
      className={cn('flex flex-col gap-3', className)}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span data-slot="sequencer-label" className="text-sm font-medium" aria-live="polite">
          {state.finished ? labels.finished : block.label}
        </span>
        {sequence.rounds > 1 && (
          <span data-slot="sequencer-round" className="text-xs text-muted-foreground">
            {labels.round(state.round, sequence.rounds)}
          </span>
        )}
      </div>
      <span
        data-slot="sequencer-clock"
        role="timer"
        aria-live="off"
        className={cn(blockVariants({ kind: block.kind }))}
      >
        {formatClock(state.remainingMs)}
      </span>
      <Progress value={Math.min(100, (done / total) * 100)} aria-label={labels.progress} />
      <div data-slot="sequencer-actions" className="flex flex-wrap items-center gap-2">
        {!state.finished && (
          <Button onClick={toggle} variant={state.running ? 'outline' : 'secondary'}>
            {state.running ? <PauseIcon /> : <PlayIcon />}
            {state.running ? labels.pause : startedOnce ? labels.resume : labels.start}
          </Button>
        )}
        {!state.finished && (
          <Button onClick={next} variant="ghost">
            <SkipForwardIcon />
            {labels.skip}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={sound ? labels.soundOff : labels.soundOn}
          aria-pressed={!sound}
          onClick={() => setSound((on) => !on)}
        >
          {sound ? <SpeakerHighIcon /> : <SpeakerSlashIcon />}
        </Button>
      </div>
    </div>
  )
}

/** The rest timer between two sets: one rest block, started at once. */
export function RestTimer({ seconds, onComplete }: { seconds: number; onComplete?: () => void }) {
  return (
    <Sequencer
      autoStart
      onComplete={onComplete}
      sequence={{ label: 'Repos', rounds: 1, blocks: [{ label: 'Repos', seconds, kind: 'rest' }] }}
    />
  )
}

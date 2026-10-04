import { useEffect, useState } from 'react'

// The session in progress is a per-viewer convenience: kept in browser
// storage so a reload in the middle of a session loses nothing. It can come
// back empty (private window, blocked storage): the session simply restarts
// from the targets.

const PREFIX = 'prepphi-draft:'

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function useDraft<T>(key: string, initial: () => T): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => read<T>(key) ?? initial())

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // Storage blocked: the draft lives in memory only.
    }
  }, [key, value])

  const clear = () => {
    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      // Nothing to clear.
    }
  }
  return [value, setValue, clear]
}

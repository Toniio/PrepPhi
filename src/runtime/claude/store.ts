import { assertKey } from '../keys'
import type { Store } from '../types'

type Wrapped = { v: unknown; updatedAt: string }

const UNAVAILABLE: Store = {
  available: false,
  get: () => Promise.reject(new Error('db capability unavailable')),
  set: () => Promise.reject(new Error('db capability unavailable')),
  delete: () => Promise.reject(new Error('db capability unavailable')),
  keys: () => Promise.reject(new Error('db capability unavailable')),
}

/**
 * The store on the `db` capability, under the viewer's private subtree
 * `data/users/<id>/<key>`: nobody else reads it, the artifact's owner
 * included. db documents must be objects, so each value is wrapped.
 */
export function createClaudeStore(db: DB | null, userId: string | null): Store {
  if (!db || !userId) return UNAVAILABLE
  const collection = db.collection(`data/users/${userId}`)

  // db allows one write at a time per document: chain the writes per key.
  const pending = new Map<string, Promise<void>>()
  const serialize = (key: string, write: () => Promise<void>) => {
    const next = (pending.get(key) ?? Promise.resolve()).catch(() => {}).then(write)
    pending.set(key, next)
    return next
  }

  return {
    available: true,

    async get<T>(key: string) {
      assertKey(key)
      const snap = await collection.doc(key).get()
      if (!snap.exists) return null
      return ((snap.data() as Wrapped | undefined)?.v ?? null) as T | null
    },

    set(key, value) {
      assertKey(key)
      const body: Wrapped = { v: structuredClone(value), updatedAt: new Date().toISOString() }
      return serialize(key, () => collection.doc(key).set(body))
    },

    delete(key) {
      assertKey(key)
      return serialize(key, () => collection.doc(key).delete())
    },

    async keys(prefix = '') {
      const snap = await collection.get()
      return snap.docs
        .map((doc) => doc.id)
        .filter((id) => id.startsWith(prefix))
        .sort()
    },
  }
}

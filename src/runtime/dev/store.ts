import { assertKey } from '../keys'
import type { Store } from '../types'

const PREFIX = 'prepphi:'

/** Browser storage, or memory when the browser blocks it (private window). */
function backend(): Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'> {
  try {
    const probe = `${PREFIX}probe`
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    const memory = new Map<string, string>()
    return {
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => void memory.set(k, v),
      removeItem: (k) => void memory.delete(k),
      key: (i) => [...memory.keys()][i] ?? null,
      get length() {
        return memory.size
      },
    }
  }
}

/** The development store on localStorage, keys prefixed with `prepphi:`. */
export function createDevStore(storage = backend()): Store {
  return {
    available: true,

    async get<T>(key: string) {
      assertKey(key)
      const raw = storage.getItem(PREFIX + key)
      return raw === null ? null : (JSON.parse(raw) as T)
    },

    async set(key, value) {
      assertKey(key)
      storage.setItem(PREFIX + key, JSON.stringify(value))
    },

    async delete(key) {
      assertKey(key)
      storage.removeItem(PREFIX + key)
    },

    async keys(prefix = '') {
      const found: string[] = []
      for (let i = 0; i < storage.length; i += 1) {
        const k = storage.key(i)
        if (k?.startsWith(PREFIX + prefix)) found.push(k.slice(PREFIX.length))
      }
      return found.sort()
    },
  }
}

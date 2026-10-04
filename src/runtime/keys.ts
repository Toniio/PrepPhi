// Store keys are single path segments of the claude.ai db grammar, so the
// same key works in both implementations.
const KEY = /^[A-Za-z0-9_\-.~:@+]{1,200}$/

export function assertKey(key: string): void {
  if (!KEY.test(key) || key === '.' || key === '..') {
    throw new TypeError(`Invalid store key "${key}": use letters, digits and _ - . ~ : @ +`)
  }
}

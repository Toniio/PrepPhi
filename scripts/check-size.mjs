// Fails the build when the single-file artifact gets close to the 16 MB
// limit of a published claude.ai page. The margin keeps room for a fix.
import { statSync } from 'node:fs'

const FILE = 'dist/index.html'
const LIMIT_MB = 15
const MB = 1024 * 1024

let size
try {
  size = statSync(FILE).size
} catch {
  console.error(`check-size: ${FILE} not found, run the build first`)
  process.exit(1)
}

const sizeMb = (size / MB).toFixed(2)
if (size > LIMIT_MB * MB) {
  console.error(`check-size: ${FILE} is ${sizeMb} MB, over the ${LIMIT_MB} MB limit`)
  process.exit(1)
}
console.log(`check-size: ${FILE} is ${sizeMb} MB (limit ${LIMIT_MB} MB)`)

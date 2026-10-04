// Runs the design system's own checks (dsaireadable_validate_code and
// dsaireadable_validate_screen) on every screen and candidate component,
// through the DSAIReadable MCP server pinned to the project's DS version.
//   node scripts/validate-screens.mjs [files…]
import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const DS_VERSION = '0.2.0'
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : globSync('src/{screens,shell,components/candidates}/**/*.tsx').sort()

const transport = new StdioClientTransport({ command: 'npx', args: ['-y', `@dsaireadable/mcp-server@${DS_VERSION}`] })
const client = new Client({ name: 'prepphi-validate', version: '1.0.0' })
await client.connect(transport)

let errors = 0
for (const file of files) {
  const code = readFileSync(file, 'utf8')
  for (const tool of ['dsaireadable_validate_code', 'dsaireadable_validate_screen']) {
    const result = await client.callTool({ name: tool, arguments: { code } })
    const text = result.content.map((c) => c.text ?? '').join('')
    let report
    try {
      report = JSON.parse(text)
    } catch {
      report = { raw: text }
    }
    const issues = (report.issues ?? report.messages ?? []).filter((i) => i.severity !== 'info')
    const count = report.errors ?? issues.filter((i) => i.severity === 'error').length
    errors += count
    if (issues.length) {
      console.log(`${file} — ${tool}`)
      for (const i of issues)
        console.log(`  ${i.severity} ${i.rule ?? i.ruleId ?? ''} ${i.line ? `:${i.line}` : ''} ${i.message}`)
    }
  }
}
await client.close()
console.log(`${files.length} files, ${errors} errors`)
process.exit(errors ? 1 : 0)

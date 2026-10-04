import type { CalendarClient, CalendarEvent, NewCalendarEvent } from '../types'

type Mcp = typeof Claude.mcp

/**
 * How PrepPhi talks to the Google Calendar connector through the `mcp`
 * capability. The connector's tool names, argument names and result shape
 * are NOT known yet: CLAUDE.md requires observing them on a real call from
 * claude.ai before the first publication, never guessing them. Until both
 * bindings are filled in, the claude.ai calendar reports itself unavailable
 * and the screens hide "Ajouter à mon agenda" and the travel detection.
 *
 * To fill a binding: in the claude.ai chat, call the connector once on a
 * read (list events of a known week), read the tool's input schema and the
 * result, then write `tool`, `input` and `parse` below. The same names go in
 * the `mcp` capability manifest at publish time.
 */
export type CalendarBindings = {
  /** Connector display name, as the viewer's claude.ai shows it. */
  server: string
  list: null | {
    tool: string
    input: (from: string, to: string) => unknown
    parse: (result: Claude.mcp.CallToolResult) => CalendarEvent[]
  }
  create: null | {
    tool: string
    input: (event: NewCalendarEvent) => unknown
  }
}

export const GOOGLE_CALENDAR: CalendarBindings = {
  server: 'Google Calendar',
  list: null,
  create: null,
}

export function createClaudeCalendar(mcp: Mcp | null, bindings: CalendarBindings = GOOGLE_CALENDAR): CalendarClient {
  const { list, create } = bindings
  const ready = mcp !== null && list !== null && create !== null

  return {
    available: ready,

    async listEvents(from, to) {
      if (!mcp || !list) throw new Error('calendar unavailable')
      const result = await mcp.callTool(bindings.server, list.tool, list.input(from, to), {
        cache: false,
      })
      return list.parse(result)
    },

    async createEvents(events) {
      if (!mcp || !create) throw new Error('calendar unavailable')
      // One call per event, in order: a failure stops the batch and says how
      // many were created, so a retry can skip them.
      let created = 0
      for (const event of events) {
        await mcp.callTool(bindings.server, create.tool, create.input(event))
        created += 1
      }
      return { created }
    },
  }
}

---
description: DSAIReadable design system rules — apply them to any UI that uses its components
alwaysApply: true
applyTo: "**"
---

# DSAIReadable design system

This project uses the components of the `Toniio/DSAIReadable` shadcn registry.
These rules apply to any interface written with them.

## Components

- **Install** a component with its full address and the release of this file:
  `npx shadcn add Toniio/DSAIReadable/<item>#v0.2.0`. A bare name (`npx shadcn add button`)
  installs shadcn/ui's component, not the design system's, and overwrites it.
  The release is the one these rules and the spec links below were written
  for: move all three to the same tag when you update.
- **Find** a component with the shadcn MCP server, registry
  `Toniio/DSAIReadable`, or with `npx shadcn search Toniio/DSAIReadable -q <word>`.
- **Read the spec before using it**:
  `https://github.com/Toniio/DSAIReadable/blob/v0.2.0/specs/components/<Component>.md`
  (props, variants, states, accessibility). Invent no prop: what is not in the
  spec does not exist.
- **Do not edit** the installed files to change how they look: go through their
  props (`variant`, `size`) and, as a last resort, through `className` with
  token classes. An update (`npx shadcn add … --overwrite`) overwrites local
  changes.

## Tokens

- **No raw values** in UI code: no hex, `rgb()`, `oklch()`, `px`, `rem`, `ms`,
  and no Tailwind arbitrary values (`p-[13px]`, `bg-[#fff]`).
- **No Tailwind palette colors** (`bg-red-500`, `text-slate-600`): only the
  design system's semantic colors — `background`, `foreground`, `card`,
  `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive` and their
  `-foreground`, `border`, `input`, `ring`, `chart-1` to `chart-5`, `sidebar-*`.
- **Radii, shadows, durations**: `rounded-sm` to `rounded-4xl`, `shadow-xs` to
  `shadow-2xl`, `duration-fast` / `normal` / `slow`, `ease-default`.
- **Never a `--ds-prim-*` variable**: these are the system's raw values, and
  private. They change without notice.

## Icons, theme, accessibility

- **Icons: `@phosphor-icons/react` only.** No Lucide, no Heroicons, no inline
  SVG.
- **Dark mode: the `.dark` class on `<html>`.** Do not use
  `prefers-color-scheme`.
- **A button with no visible text gets an `aria-label`.**
- **Never remove the focus ring** (`outline-none` alone, `focus:ring-0`): every
  component draws the same one, from `lib/focus`.
- **The default labels** (close button, carousel arrows…) are in English, in
  `lib/ui-strings`. Translate them through the prop each component provides,
  not by editing the component.

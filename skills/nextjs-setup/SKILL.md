# Skill: Next.js Setup
> @skillsforllms/nextjs-setup · v1.0.0 · Category: Web / Next.js

## Purpose
Guide an AI agent to build production Next.js applications with the App Router, Server Components, route handlers, metadata, and clear server/client boundaries.

## When to Use This Skill
- Creating a new Next.js application.
- Adding routes, layouts, metadata, or server actions.
- Migrating Pages Router code to the App Router.
- Building a Vercel-ready web application.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Router | App Router | Modern routing, layouts, and server-first data flow. |
| Language | TypeScript | Safer server/client contracts. |
| Styling | Tailwind CSS | Fast UI composition with shared tokens. |
| Forms | Server Actions or route handlers | Keeps mutation logic close to server data. |
| Images | next/image | Automatic optimization and sizing. |

## Project Structure
```text
app/
  (marketing)/
  dashboard/
  api/
components/
lib/
  data/
  auth/
  validation/
```

## Key Conventions
- Use Server Components by default and add `"use client"` only for browser-only interactivity.
- Keep database and secret access in server-only modules.
- Put route-level loading, error, and not-found states beside the route they support.
- Use `generateMetadata` for route-specific metadata.
- Validate external input before mutations or route handler responses.

## Step-by-Step Agent Instructions
1. Inspect existing route groups and layout boundaries.
2. Decide whether new UI should be server-rendered or client-rendered.
3. Place shared UI in `components/` and server data helpers in `lib/data/`.
4. Add loading and error states for data-heavy routes.
5. Run build and typecheck after changing routing, data, or metadata.

## File Templates
```tsx
// app/example/page.tsx
export const metadata = { title: "Example" };

export default async function ExamplePage() {
  return <main>Example</main>;
}
```

## Anti-Patterns
- Do not put `"use client"` at the top of layout files without a specific need.
- Do not import server-only modules into Client Components.
- Do not fetch the same data separately in nested route components when it can be shared.
- Do not skip loading and error states for slow or failure-prone data.

## Examples
See `examples/basic/` for a minimal App Router structure.

## Changelog
- v1.0.0 - Initial release.

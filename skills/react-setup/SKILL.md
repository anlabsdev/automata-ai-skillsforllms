# Skill: React Setup
> @skillsforllms/react-setup · v1.0.0 · Category: Web / React

## Purpose
Guide an AI agent to scaffold and maintain a production-ready React project using Vite, TypeScript, Tailwind CSS, TanStack Query, and focused component boundaries.

## When to Use This Skill
- Starting a new React application from scratch.
- Migrating a Create React App project to Vite.
- Building a SaaS frontend, dashboard, component library, or design system.
- Standardizing React conventions across a team project.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Build tool | Vite | Fast local feedback and simple configuration. |
| Language | TypeScript | Safer refactors and clearer agent output. |
| Styling | Tailwind CSS | Consistent utility-driven styling. |
| State | Zustand | Small client state stores without provider sprawl. |
| Data fetching | TanStack Query | Cache, loading, retry, and mutation behavior. |
| Testing | Vitest + Testing Library | Fast tests aligned with Vite. |

## Project Structure
```text
src/
  components/
    ui/
    features/
  hooks/
  lib/
    api/
  pages/
  stores/
  types/
  main.tsx
```

## Key Conventions
- Component files use PascalCase, for example `UserCard.tsx`.
- Hooks use camelCase and start with `use`, for example `useSession.ts`.
- Components use named exports. Route-level pages may use default exports if the router expects them.
- API calls live under `src/lib/api/`, never inside visual components.
- Use `@/` as the import alias for `src/`.
- Co-locate tests next to implementation files with `.test.tsx`.

## Step-by-Step Agent Instructions
1. Inspect the existing package manager and project structure before installing dependencies.
2. Scaffold new apps with `npm create vite@latest my-app -- --template react-ts`.
3. Install routing, query, forms, state, and styling dependencies only when the user needs them.
4. Configure the `@/` alias in both `vite.config.ts` and `tsconfig.json`.
5. Add `QueryClientProvider` near the application root when remote data is used.
6. Create reusable primitives in `src/components/ui/` before feature components.
7. Verify with build, typecheck, and at least one focused test when behavior changes.

## File Templates
```ts
// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
    mutations: { retry: 0 }
  }
});
```

## Anti-Patterns
- Do not use Create React App for new projects.
- Do not fetch remote data directly in `useEffect`; use TanStack Query.
- Do not put API clients, token handling, or persistence inside UI components.
- Do not create one giant `components/` folder without feature or primitive boundaries.
- Do not add global state for data that is server-owned or purely local to one component.

## Examples
See `examples/basic/` for a minimal React project layout.

## Changelog
- v1.0.0 - Initial release.

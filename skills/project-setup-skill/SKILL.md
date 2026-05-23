# Skill: Project Setup Skill
> @skillsforllms/project-setup-skill - v1.0.0 - Category: Web

## Purpose
Guide an AI agent to set up a modern Next.js or Vite project with sensible defaults, scripts, folders, aliases, and quality checks.

## When to Use This Skill
- A user wants to start a new frontend project.
- A messy project needs a clean structure and baseline tooling.
- A team wants consistent folders, scripts, and import aliases.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Framework | Next.js or Vite | Choose based on routing and rendering needs. |
| Language | TypeScript | Keeps generated code maintainable. |
| Quality | ESLint, formatter, tests | Creates a useful baseline. |

## Project Structure
```text
src/app/ or src/pages/
src/components/
src/lib/
src/hooks/
src/types/
tests/
```

## Key Conventions
- Ask or infer whether the app needs SSR, API routes, or static frontend only.
- Use Next.js for full-stack routing and Vite for client-heavy apps.
- Configure @/ aliases across TypeScript and bundler config.
- Add scripts for dev, build, lint, typecheck, and test.
- Keep starter folders purposeful; avoid empty architecture theater.

## Step-by-Step Agent Instructions
1. Inspect package manager, framework choice, and deployment target.
2. Create the project with the official framework scaffold command.
3. Add folders only when they support immediate development.
4. Configure aliases, linting, formatting, and environment examples.
5. Run build or typecheck and fix setup errors.

## File Templates
```ts
src/
  components/
    ui/
    features/
  lib/
    env.ts
    utils.ts
  hooks/
  types/
  tests/
```

## Anti-Patterns
- Do not force Next.js when a simple Vite app is enough.
- Do not create many empty domain folders before requirements exist.
- Do not skip package-manager detection.
- Do not leave scripts undocumented or broken.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.

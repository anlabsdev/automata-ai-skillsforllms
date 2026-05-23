# Skill: Dashboard Skill
> @skillsforllms/dashboard-skill - v1.0.0 - Category: Web

## Purpose
Guide an AI agent to build usable admin dashboards with summary cards, charts, data tables, filters, and empty/loading/error states.

## When to Use This Skill
- A user asks to add admin panels, charts, filters, and data tables.
- A project needs a production-ready implementation instead of a snippet.
- The user wants the agent to wire code, configuration, docs, and verification together.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Approach | Existing stack first | Avoids forcing a rewrite. |
| Validation | Typed schemas | Protects external and user-facing boundaries. |
| Verification | Focused tests and smoke checks | Keeps generated work trustworthy. |

## Project Structure
```text
src/lib/
src/server/
src/components/
tests/
docs/
```

## Key Conventions
- Inspect the existing framework, package manager, database, and deployment target first.
- Keep secrets in environment variables and document them in .env.example.
- Add typed boundaries for inputs, outputs, and provider responses.
- Implement server-side authorization for protected actions.
- Include verification commands and manual QA steps.

## Step-by-Step Agent Instructions
1. Identify the current stack, existing conventions, and production constraints.
2. Design the smallest end-to-end flow that proves the feature works.
3. Add server-side implementation, client UI, configuration, and docs together.
4. Add focused tests or smoke checks around the highest-risk behavior.
5. Return setup steps, env requirements, and known follow-up decisions.

## File Templates
```ts
type ImplementationPlan = {
  files: string[];
  env: string[];
  checks: string[];
};
```

## Anti-Patterns
- Do not paste provider sample code without adapting it to the project.
- Do not skip webhook, auth, env, or error handling for production flows.
- Do not hide breaking changes inside broad refactors.
- Do not claim a feature is complete without verification steps.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial pro roadmap release.

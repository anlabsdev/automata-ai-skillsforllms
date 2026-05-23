# Skill: README Generator Skill
> @skillsforllms/readme-generator-skill - v1.0.0 - Category: Docs

## Purpose
Guide an AI agent to inspect a repository and generate a practical README that helps developers install, configure, run, test, and deploy it.

## When to Use This Skill
- A project has no README or a stale README.
- A user wants onboarding documentation generated from files.
- A package or app needs install, scripts, env, architecture, and deployment notes.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Source | package files and config | Grounds docs in reality. |
| Format | Markdown | Works everywhere. |
| Tone | Direct developer docs | Useful over promotional. |

## Project Structure
```text
README.md
docs/
.env.example
package.json
```

## Key Conventions
- Inspect package scripts, dependencies, env examples, and source structure.
- Document only commands that exist.
- Include prerequisites, setup, local development, tests, build, and deployment.
- Add architecture notes when the folder structure is non-obvious.
- Mark unknowns as TODO instead of inventing facts.

## Step-by-Step Agent Instructions
1. Read package files, config files, and existing docs.
2. Summarize what the project does in one short paragraph.
3. List setup steps in the order a new contributor uses them.
4. Document scripts and environment variables.
5. Add contribution or troubleshooting notes when useful.

## File Templates
```ts
# Project Name

## Setup

```bash
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` - start local development.
- `pnpm test` - run tests.
```

## Anti-Patterns
- Do not invent deployment targets or scripts.
- Do not write marketing copy when developer setup is missing.
- Do not paste huge dependency lists.
- Do not hide required environment variables.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.

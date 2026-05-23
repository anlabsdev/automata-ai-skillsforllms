# Skill: ESLint Prettier Skill
> @skillsforllms/eslint-prettier-skill - v1.0.0 - Category: Devops

## Purpose
Guide an AI agent to configure ESLint and Prettier for TypeScript, React, Node, and Next.js projects without fighting the framework.

## When to Use This Skill
- A project lacks linting or formatting.
- A user wants consistent code style across a team.
- ESLint, Prettier, TypeScript, or framework config is broken.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Lint | ESLint flat config when possible | Current ecosystem default. |
| Format | Prettier | Automated formatting with low debate. |
| Scripts | lint and format commands | Keeps CI predictable. |

## Project Structure
```text
eslint.config.mjs
.prettierrc
.prettierignore
package.json scripts
```

## Key Conventions
- Respect framework-provided ESLint presets first.
- Keep formatting rules in Prettier and correctness rules in ESLint.
- Add ignores for generated output, dist, coverage, and lockfiles when appropriate.
- Use package-manager-specific commands.
- Run lint and format checks after changing config.

## Step-by-Step Agent Instructions
1. Detect framework, TypeScript version, and current ESLint style.
2. Install only missing dependencies.
3. Add or update ESLint and Prettier config.
4. Add scripts for lint, lint:fix, format, and format:check.
5. Run checks and fix config-level errors.

## File Templates
```ts
export default [
  {
    ignores: ["dist/**", "coverage/**"]
  }
];
```

## Anti-Patterns
- Do not mix deprecated .eslintrc advice into flat-config projects.
- Do not make stylistic ESLint rules conflict with Prettier.
- Do not overwrite custom team rules without calling it out.
- Do not add plugins that are unused by the stack.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.

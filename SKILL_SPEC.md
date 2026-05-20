# SkillsForLLMs SKILL.md Specification

Every skill package must include a root-level `SKILL.md` written for AI agents. The file should be dense, structured, imperative, and easy to parse.

## Required Shape

```markdown
# Skill: Skill Title
> @scope/package-name · v1.0.0 · Category: Category / Subcategory

## Purpose
State what the skill enables and when an agent should apply it.

## When to Use This Skill
- List clear trigger situations.

## Key Conventions
- List naming, structure, architecture, and style rules.

## Anti-Patterns
- List things the agent must avoid.
```

## Recommended Sections

- `## Tech Stack Decisions`
- `## Project Structure`
- `## Step-by-Step Agent Instructions`
- `## File Templates`
- `## Examples`
- `## Changelog`

## Package Contract

Skill packages are npm packages with documentation payloads only. They must include:

- `package.json`
- `SKILL.md`
- `README.md`

The package name must match one of these patterns:

- `@skills/<kebab-case-name>`
- `@<username>/skill-<kebab-case-name>`
- `@<org>/skill-<kebab-case-name>`

Skill packages should not declare `main`, `module`, or binary entry points.

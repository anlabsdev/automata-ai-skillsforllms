# Skill: Env Setup Skill
> @skillsforllms/env-setup-skill - v1.0.0 - Category: Devops

## Purpose
Guide an AI agent to create safe environment variable templates, validation, and documentation without leaking secrets.

## When to Use This Skill
- A project needs .env.example, runtime config, or typed env parsing.
- A user adds a third-party service requiring secrets.
- A deployment fails because required environment variables are unclear.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| Template | .env.example | Documents required variables without secrets. |
| Validation | Zod or framework env helpers | Fails early with clear errors. |
| Docs | Inline comments | Helps users configure deployments. |

## Project Structure
```text
.env.example
src/lib/env.ts
README.md
deployment docs
```

## Key Conventions
- Never write real secrets into committed files.
- Separate public browser variables from server-only secrets.
- Document required, optional, and generated values.
- Validate env at app startup when the framework allows it.
- Use provider-specific names only when the provider is known.

## Step-by-Step Agent Instructions
1. Scan code for process.env, import.meta.env, and provider SDK usage.
2. Create or update .env.example with clear comments.
3. Add typed validation and helpful failure messages.
4. Update README setup instructions.
5. Check gitignore protects local .env files.

## File Templates
```ts
# Required: database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/app"

# Public: safe to expose to the browser
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Anti-Patterns
- Do not commit real tokens, passwords, private keys, or webhooks secrets.
- Do not expose server-only secrets through NEXT_PUBLIC or VITE prefixes.
- Do not leave env names undocumented.
- Do not silently fall back to insecure defaults in production.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.

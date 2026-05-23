# Skill: Prisma Schema Skill
> @skillsforllms/prisma-schema-skill - v1.0.0 - Category: Backend

## Purpose
Guide an AI agent to convert product requirements into Prisma models, relations, indexes, enums, and migration-ready schema changes.

## When to Use This Skill
- A user describes entities and relationships in plain language.
- A project needs a new Prisma schema or model update.
- A database design needs safe relations, unique constraints, or indexes.

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
| ORM | Prisma | Readable schema and migration workflow. |
| Database | Postgres first | Strong defaults for production apps. |
| Validation | Zod or app schemas | Keeps API input aligned with models. |

## Project Structure
```text
prisma/schema.prisma
prisma/migrations/
src/lib/db.ts
src/server/repositories/
```

## Key Conventions
- Model names use PascalCase and fields use camelCase.
- Add createdAt and updatedAt for business records.
- Make ownership and tenancy relationships explicit.
- Use indexes for foreign keys and common lookup filters.
- Explain destructive migration risk before changing existing columns.

## Step-by-Step Agent Instructions
1. Extract entities, fields, relationships, uniqueness, and lifecycle rules.
2. Choose scalar types and nullability deliberately.
3. Add relations with explicit back-relations.
4. Add indexes and unique constraints for expected queries.
5. Provide the migration command and a seed-data suggestion.

## File Templates
```ts
model Workspace {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  members   Member[]
}
```

## Anti-Patterns
- Do not make every field optional to avoid decisions.
- Do not remove or rename production fields without a migration plan.
- Do not omit indexes for common relation filters.
- Do not mix database schema decisions with unrelated UI changes.

## Examples
See `examples/basic/` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial free roadmap release.

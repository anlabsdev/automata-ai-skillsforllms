# Contributing

## Add a Skill

```bash
pnpm install
pnpm --filter create-skill build
pnpm --filter create-skill exec create-skill
pnpm generate:registry
pnpm validate:skills
```

Official skills live under `skills/<short-name>`. Community skills can be published independently as `@username/skill-<name>` or `@org/skill-<name>` and submitted to the registry.

## Quality Bar

- `SKILL.md` follows `SKILL_SPEC.md`.
- Skill package metadata includes `skillsforllms.category`, `skillsforllms.tags`, and `skillsforllms.compatibleAgents`.
- CLI behavior is covered by focused tests when shared behavior changes.
- The website remains fast, searchable, and readable on mobile.

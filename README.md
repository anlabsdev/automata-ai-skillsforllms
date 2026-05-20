# SkillsForLLMs

Installable AI skill packages for LLM agents, workflows, and automation.

SkillsForLLMs treats agent instructions as versioned npm packages. A developer installs one or more `@skillsforllms/*` packages, runs `skillsforllms sync`, and the package `SKILL.md` files are copied into the project so coding agents can follow shared conventions.

GitHub: https://github.com/anlabsdev/automata-ai-skillsforllms

```bash
npm install -D skillsforllms @skillsforllms/react-setup
npx skillsforllms sync
```

## Workspaces

- `packages/core` - shared validation, package discovery, config, and registry helpers.
- `packages/cli` - the `skillsforllms` command-line tool.
- `packages/create-skill` - scaffolder for new skill packages.
- `skills/*` - official seed skill packages.
- `registry` - generated skill catalog JSON.
- `website` - public registry website.

## Local Development

```bash
pnpm install
pnpm build
pnpm test
pnpm generate:registry
pnpm --filter skillsforllms dev
pnpm --filter skillsforllms-website dev
```

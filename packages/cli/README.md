# skillsforllms

CLI for syncing installable AI skill packages into projects.

SkillsForLLMs treats agent instructions as versioned npm packages. A developer installs one or more `@skillsforllms/*` packages, runs `skillsforllms sync`, and the package `SKILL.md` files are copied into the project so coding agents can follow shared conventions.

## Quick Start

```bash
# Install the CLI and any skill packages
npm install -D skillsforllms @skillsforllms/react-setup

# Sync the installed skills to your local project directory (.skills/)
npx skillsforllms sync
```

## GitHub & Monorepo

This package is part of the unified **SkillsForLLMs monorepo**:
👉 [GitHub Repository](https://github.com/anlabsdev/automata-ai-skillsforllms)

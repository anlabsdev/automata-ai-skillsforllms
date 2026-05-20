# @skillsforllms/reactskills

Production-ready React.js skills for LLM agents. 8 comprehensive skill files that teach AI coding assistants how to write idiomatic, production-grade React code.

## Install

```bash
npm install @skillsforllms/reactskills
```

## Skills Included

| Skill | Description |
|-------|-------------|
| **component-patterns** | Compound components, polymorphic patterns, prop design |
| **hooks-mastery** | Built-in hooks, custom hooks, rules of hooks |
| **state-management** | useState → Context → Zustand → TanStack Query decision tree |
| **routing-navigation** | React Router v6, protected routes, lazy loading |
| **forms-validation** | React Hook Form + Zod, dynamic fields, accessibility |
| **testing-strategy** | Vitest + Testing Library, what to test vs what not to |
| **performance-optimization** | React.memo, code splitting, virtualization |
| **project-structure** | Folder conventions, naming rules, import aliases |

## Usage

```js
const reactSkills = require("@skillsforllms/reactskills");
console.log(reactSkills.list());
const content = reactSkills.getSkill("hooks-mastery");
```

## License
Apache-2.0

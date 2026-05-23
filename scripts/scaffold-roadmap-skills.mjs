import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const skillsRoot = path.join(root, "skills");

const freeSkills = [
  {
    name: "react-component-skill",
    title: "React Component Skill",
    category: "web",
    tags: ["react", "components", "typescript", "ui"],
    launchPhase: "Tier 1 - Month 1",
    coreFeature: "Generate React components from a plain-language description.",
    purpose: "Guide an AI agent to turn a user description into a clean, typed, accessible React component that fits the existing project.",
    triggers: [
      "A user asks for a reusable React component from a plain description.",
      "A feature needs a presentational component, form section, card, table row, or interactive widget.",
      "The project needs component props, states, and examples produced together."
    ],
    stack: [
      ["Language", "TypeScript", "Keeps props and states explicit."],
      ["Rendering", "React function components", "Matches modern React projects."],
      ["Styling", "Existing project style first", "Avoids forcing a new design system."]
    ],
    structure: ["src/components/ui/", "src/components/features/", "src/stories/", "src/tests/"],
    conventions: [
      "Start by inspecting nearby components and naming conventions.",
      "Define a small props interface before writing JSX.",
      "Include loading, empty, error, disabled, and focus states when relevant.",
      "Use semantic HTML and keyboard-friendly interactions.",
      "Export components by name unless the local project already uses defaults."
    ],
    steps: [
      "Restate the component purpose, data inputs, states, and actions.",
      "Find the closest existing component pattern before creating new structure.",
      "Write the component with typed props and minimal internal state.",
      "Add accessible labels, roles, and focus behavior for interactive controls.",
      "Add a compact usage example or focused test when the component has behavior."
    ],
    template: "export interface UserCardProps {\n  name: string;\n  role?: string;\n  onOpen?: () => void;\n}\n\nexport function UserCard({ name, role, onOpen }: UserCardProps) {\n  return (\n    <article className=\"rounded-md border p-4\">\n      <h3>{name}</h3>\n      {role ? <p>{role}</p> : null}\n      {onOpen ? <button type=\"button\" onClick={onOpen}>Open</button> : null}\n    </article>\n  );\n}",
    antiPatterns: [
      "Do not create a component before checking the existing styling system.",
      "Do not use any for props.",
      "Do not hide required behavior inside untyped object props.",
      "Do not ship click-only interactions without keyboard access."
    ]
  },
  {
    name: "tailwind-ui-skill",
    title: "Tailwind UI Skill",
    category: "web",
    tags: ["tailwind", "ui", "components", "design-system"],
    launchPhase: "Tier 1 - Month 1",
    coreFeature: "Create ready-to-paste navbars, cards, modals, buttons, forms, and layout sections.",
    purpose: "Guide an AI agent to build polished Tailwind UI blocks that respect an existing app theme and are ready to paste.",
    triggers: [
      "A user asks for a navbar, card grid, modal, button set, pricing panel, or app shell.",
      "A project needs Tailwind classes organized into reusable components.",
      "A UI needs responsive states without introducing a new component library."
    ],
    stack: [
      ["Styling", "Tailwind CSS", "Fast composition and predictable tokens."],
      ["Components", "React or HTML", "Use the host project's framework."],
      ["Icons", "Project icon library", "Keeps visual language consistent."]
    ],
    structure: ["src/components/ui/", "src/components/layout/", "src/components/marketing/"],
    conventions: [
      "Use existing theme tokens and utility patterns before inventing new colors.",
      "Keep component APIs small and practical.",
      "Add responsive variants for mobile, tablet, and desktop.",
      "Use accessible dialog, menu, and button semantics.",
      "Prefer composition over long one-off class strings repeated in many files."
    ],
    steps: [
      "Identify the UI block type and required states.",
      "Inspect project Tailwind config and existing component primitives.",
      "Write the smallest reusable component that covers the requested block.",
      "Add hover, focus-visible, disabled, and responsive behavior.",
      "Return paste-ready code plus a short usage snippet."
    ],
    template: "export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {\n  return (\n    <button\n      {...props}\n      className=\"inline-flex items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:opacity-50\"\n    />\n  );\n}",
    antiPatterns: [
      "Do not paste inaccessible modal or dropdown markup.",
      "Do not use random color palettes that ignore the app theme.",
      "Do not make every block a marketing hero.",
      "Do not duplicate the same long class recipe without extracting a primitive."
    ]
  },
  {
    name: "project-setup-skill",
    title: "Project Setup Skill",
    category: "web",
    tags: ["nextjs", "vite", "scaffold", "typescript"],
    launchPhase: "Tier 1 - Month 1",
    coreFeature: "Scaffold Next.js or Vite with a clean folder structure.",
    purpose: "Guide an AI agent to set up a modern Next.js or Vite project with sensible defaults, scripts, folders, aliases, and quality checks.",
    triggers: [
      "A user wants to start a new frontend project.",
      "A messy project needs a clean structure and baseline tooling.",
      "A team wants consistent folders, scripts, and import aliases."
    ],
    stack: [
      ["Framework", "Next.js or Vite", "Choose based on routing and rendering needs."],
      ["Language", "TypeScript", "Keeps generated code maintainable."],
      ["Quality", "ESLint, formatter, tests", "Creates a useful baseline."]
    ],
    structure: ["src/app/ or src/pages/", "src/components/", "src/lib/", "src/hooks/", "src/types/", "tests/"],
    conventions: [
      "Ask or infer whether the app needs SSR, API routes, or static frontend only.",
      "Use Next.js for full-stack routing and Vite for client-heavy apps.",
      "Configure @/ aliases across TypeScript and bundler config.",
      "Add scripts for dev, build, lint, typecheck, and test.",
      "Keep starter folders purposeful; avoid empty architecture theater."
    ],
    steps: [
      "Inspect package manager, framework choice, and deployment target.",
      "Create the project with the official framework scaffold command.",
      "Add folders only when they support immediate development.",
      "Configure aliases, linting, formatting, and environment examples.",
      "Run build or typecheck and fix setup errors."
    ],
    template: "src/\n  components/\n    ui/\n    features/\n  lib/\n    env.ts\n    utils.ts\n  hooks/\n  types/\n  tests/",
    antiPatterns: [
      "Do not force Next.js when a simple Vite app is enough.",
      "Do not create many empty domain folders before requirements exist.",
      "Do not skip package-manager detection.",
      "Do not leave scripts undocumented or broken."
    ]
  },
  {
    name: "prisma-schema-skill",
    title: "Prisma Schema Skill",
    category: "backend",
    tags: ["prisma", "database", "schema", "models"],
    launchPhase: "Tier 1 - Month 1",
    coreFeature: "Generate Prisma models from plain text.",
    purpose: "Guide an AI agent to convert product requirements into Prisma models, relations, indexes, enums, and migration-ready schema changes.",
    triggers: [
      "A user describes entities and relationships in plain language.",
      "A project needs a new Prisma schema or model update.",
      "A database design needs safe relations, unique constraints, or indexes."
    ],
    stack: [
      ["ORM", "Prisma", "Readable schema and migration workflow."],
      ["Database", "Postgres first", "Strong defaults for production apps."],
      ["Validation", "Zod or app schemas", "Keeps API input aligned with models."]
    ],
    structure: ["prisma/schema.prisma", "prisma/migrations/", "src/lib/db.ts", "src/server/repositories/"],
    conventions: [
      "Model names use PascalCase and fields use camelCase.",
      "Add createdAt and updatedAt for business records.",
      "Make ownership and tenancy relationships explicit.",
      "Use indexes for foreign keys and common lookup filters.",
      "Explain destructive migration risk before changing existing columns."
    ],
    steps: [
      "Extract entities, fields, relationships, uniqueness, and lifecycle rules.",
      "Choose scalar types and nullability deliberately.",
      "Add relations with explicit back-relations.",
      "Add indexes and unique constraints for expected queries.",
      "Provide the migration command and a seed-data suggestion."
    ],
    template: "model Workspace {\n  id        String   @id @default(cuid())\n  name      String\n  slug      String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  members   Member[]\n}",
    antiPatterns: [
      "Do not make every field optional to avoid decisions.",
      "Do not remove or rename production fields without a migration plan.",
      "Do not omit indexes for common relation filters.",
      "Do not mix database schema decisions with unrelated UI changes."
    ]
  },
  {
    name: "env-setup-skill",
    title: "Env Setup Skill",
    category: "devops",
    tags: ["env", "configuration", "secrets", "documentation"],
    launchPhase: "Tier 1 - Month 1",
    coreFeature: ".env templates plus inline documentation auto-generated.",
    purpose: "Guide an AI agent to create safe environment variable templates, validation, and documentation without leaking secrets.",
    triggers: [
      "A project needs .env.example, runtime config, or typed env parsing.",
      "A user adds a third-party service requiring secrets.",
      "A deployment fails because required environment variables are unclear."
    ],
    stack: [
      ["Template", ".env.example", "Documents required variables without secrets."],
      ["Validation", "Zod or framework env helpers", "Fails early with clear errors."],
      ["Docs", "Inline comments", "Helps users configure deployments."]
    ],
    structure: [".env.example", "src/lib/env.ts", "README.md", "deployment docs"],
    conventions: [
      "Never write real secrets into committed files.",
      "Separate public browser variables from server-only secrets.",
      "Document required, optional, and generated values.",
      "Validate env at app startup when the framework allows it.",
      "Use provider-specific names only when the provider is known."
    ],
    steps: [
      "Scan code for process.env, import.meta.env, and provider SDK usage.",
      "Create or update .env.example with clear comments.",
      "Add typed validation and helpful failure messages.",
      "Update README setup instructions.",
      "Check gitignore protects local .env files."
    ],
    template: "# Required: database connection string\nDATABASE_URL=\"postgresql://user:password@localhost:5432/app\"\n\n# Public: safe to expose to the browser\nNEXT_PUBLIC_APP_URL=\"http://localhost:3000\"",
    antiPatterns: [
      "Do not commit real tokens, passwords, private keys, or webhooks secrets.",
      "Do not expose server-only secrets through NEXT_PUBLIC or VITE prefixes.",
      "Do not leave env names undocumented.",
      "Do not silently fall back to insecure defaults in production."
    ]
  },
  {
    name: "sql-query-skill",
    title: "SQL Query Skill",
    category: "backend",
    tags: ["sql", "postgres", "mysql", "queries"],
    launchPhase: "Tier 2 - Month 2",
    coreFeature: "Write SQL from natural language.",
    purpose: "Guide an AI agent to turn plain-language data questions into safe, readable SQL queries with assumptions and verification notes.",
    triggers: [
      "A user asks for a query in natural language.",
      "A dashboard needs aggregate, filter, join, or reporting SQL.",
      "A query needs to be optimized or explained."
    ],
    stack: [
      ["SQL", "Postgres-compatible by default", "Strong baseline for modern apps."],
      ["Safety", "Parameterized queries", "Prevents injection in app code."],
      ["Performance", "EXPLAIN-aware design", "Encourages index-friendly queries."]
    ],
    structure: ["queries/", "src/server/db/", "migrations/", "analytics/"],
    conventions: [
      "Ask for or infer table names, columns, and SQL dialect before writing final SQL.",
      "Use explicit column lists instead of SELECT * for application queries.",
      "Use parameter placeholders for user input.",
      "Explain assumptions and expected result shape.",
      "Suggest indexes when filters or joins need them."
    ],
    steps: [
      "Identify entities, metrics, filters, grouping, sorting, and limits.",
      "Map the request to known schema names.",
      "Write readable SQL with aliases and clear joins.",
      "Add parameters for runtime values.",
      "Include a short validation query or EXPLAIN note for complex queries."
    ],
    template: "SELECT u.id, u.email, COUNT(o.id) AS order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE u.created_at >= $1\nGROUP BY u.id, u.email\nORDER BY order_count DESC\nLIMIT 20;",
    antiPatterns: [
      "Do not invent schema without labeling assumptions.",
      "Do not interpolate user input into raw SQL strings.",
      "Do not use SELECT * in production-facing examples.",
      "Do not ignore timezone boundaries in date filters."
    ]
  },
  {
    name: "eslint-prettier-skill",
    title: "ESLint Prettier Skill",
    category: "devops",
    tags: ["eslint", "prettier", "formatting", "linting"],
    launchPhase: "Tier 2 - Month 2",
    coreFeature: "Auto-configure linting and formatting.",
    purpose: "Guide an AI agent to configure ESLint and Prettier for TypeScript, React, Node, and Next.js projects without fighting the framework.",
    triggers: [
      "A project lacks linting or formatting.",
      "A user wants consistent code style across a team.",
      "ESLint, Prettier, TypeScript, or framework config is broken."
    ],
    stack: [
      ["Lint", "ESLint flat config when possible", "Current ecosystem default."],
      ["Format", "Prettier", "Automated formatting with low debate."],
      ["Scripts", "lint and format commands", "Keeps CI predictable."]
    ],
    structure: ["eslint.config.mjs", ".prettierrc", ".prettierignore", "package.json scripts"],
    conventions: [
      "Respect framework-provided ESLint presets first.",
      "Keep formatting rules in Prettier and correctness rules in ESLint.",
      "Add ignores for generated output, dist, coverage, and lockfiles when appropriate.",
      "Use package-manager-specific commands.",
      "Run lint and format checks after changing config."
    ],
    steps: [
      "Detect framework, TypeScript version, and current ESLint style.",
      "Install only missing dependencies.",
      "Add or update ESLint and Prettier config.",
      "Add scripts for lint, lint:fix, format, and format:check.",
      "Run checks and fix config-level errors."
    ],
    template: "export default [\n  {\n    ignores: [\"dist/**\", \"coverage/**\"]\n  }\n];",
    antiPatterns: [
      "Do not mix deprecated .eslintrc advice into flat-config projects.",
      "Do not make stylistic ESLint rules conflict with Prettier.",
      "Do not overwrite custom team rules without calling it out.",
      "Do not add plugins that are unused by the stack."
    ]
  },
  {
    name: "readme-generator-skill",
    title: "README Generator Skill",
    category: "docs",
    tags: ["readme", "documentation", "onboarding", "developer-experience"],
    launchPhase: "Tier 2 - Month 2",
    coreFeature: "Auto-write a clean README from project files.",
    purpose: "Guide an AI agent to inspect a repository and generate a practical README that helps developers install, configure, run, test, and deploy it.",
    triggers: [
      "A project has no README or a stale README.",
      "A user wants onboarding documentation generated from files.",
      "A package or app needs install, scripts, env, architecture, and deployment notes."
    ],
    stack: [
      ["Source", "package files and config", "Grounds docs in reality."],
      ["Format", "Markdown", "Works everywhere."],
      ["Tone", "Direct developer docs", "Useful over promotional."]
    ],
    structure: ["README.md", "docs/", ".env.example", "package.json"],
    conventions: [
      "Inspect package scripts, dependencies, env examples, and source structure.",
      "Document only commands that exist.",
      "Include prerequisites, setup, local development, tests, build, and deployment.",
      "Add architecture notes when the folder structure is non-obvious.",
      "Mark unknowns as TODO instead of inventing facts."
    ],
    steps: [
      "Read package files, config files, and existing docs.",
      "Summarize what the project does in one short paragraph.",
      "List setup steps in the order a new contributor uses them.",
      "Document scripts and environment variables.",
      "Add contribution or troubleshooting notes when useful."
    ],
    template: "# Project Name\n\n## Setup\n\n```bash\npnpm install\npnpm dev\n```\n\n## Scripts\n\n- `pnpm dev` - start local development.\n- `pnpm test` - run tests.",
    antiPatterns: [
      "Do not invent deployment targets or scripts.",
      "Do not write marketing copy when developer setup is missing.",
      "Do not paste huge dependency lists.",
      "Do not hide required environment variables."
    ]
  }
];

const proSkills = [
  ["auth-system-skill", "Auth System Skill", "security", ["auth", "oauth", "jwt", "rbac"], "Launch Pro - Month 1", "JWT, OAuth, sessions, and role-based access.", "Every app needs auth, and most teams dislike rebuilding it.", "Guide an AI agent to implement production-minded authentication with JWT, OAuth, session handling, and role-based access control."],
  ["fullstack-scaffold-skill", "Fullstack Scaffold Skill", "fullstack", ["fullstack", "database", "api", "ui"], "Launch Pro - Month 1", "Database, API, and UI wired together.", "Saves hours on every new project.", "Guide an AI agent to scaffold a full-stack app with database models, API routes, UI screens, env setup, and verification scripts."],
  ["api-builder-skill", "API Builder Skill", "backend", ["rest", "trpc", "openapi", "validation"], "Launch Pro - Month 1", "REST and tRPC endpoint generation.", "Every project needs APIs.", "Guide an AI agent to design and implement typed REST or tRPC APIs with validation, auth boundaries, docs, and tests."],
  ["dashboard-skill", "Dashboard Skill", "web", ["dashboard", "charts", "tables", "admin"], "Launch Pro - Month 1", "Admin panels, charts, filters, and data tables.", "Visually impressive and strong for demos.", "Guide an AI agent to build usable admin dashboards with summary cards, charts, data tables, filters, and empty/loading/error states."],
  ["testing-skill", "Testing Skill", "quality", ["jest", "vitest", "playwright", "testing"], "Growth Pro - Month 2", "Generate Jest, Vitest, and Playwright tests.", "Developers know they should test but often skip it.", "Guide an AI agent to add focused unit, integration, and browser tests for risky behavior."],
  ["db-migration-skill", "DB Migration Skill", "backend", ["postgres", "mysql", "migrations", "database"], "Growth Pro - Month 2", "Safe migration scripts for Postgres and MySQL.", "Migrations break things, and teams pay to avoid data loss.", "Guide an AI agent to plan, write, review, and verify database migrations with rollback and data-safety notes."],
  ["deploy-skill", "Deploy Skill", "devops", ["docker", "github-actions", "vercel", "railway"], "Growth Pro - Month 3", "Dockerfile, GitHub Actions, Vercel, and Railway config.", "Deployment is scary for juniors and costly for teams.", "Guide an AI agent to prepare applications for repeatable deployment with environment checks, CI, and platform config."],
  ["ai-integration-skill", "AI Integration Skill", "ai", ["openai", "claude", "rag", "agents"], "Growth Pro - Month 3", "Add Claude, OpenAI, RAG, and agent flows to existing apps.", "AI integration is a high-demand feature.", "Guide an AI agent to add model calls, streaming, structured output, embeddings, RAG, and provider-safe configuration."],
  ["stripe-payment-skill", "Stripe Payment Skill", "payments", ["stripe", "checkout", "webhooks", "subscriptions"], "Mature Pro - Month 4", "Checkout, webhooks, subscriptions, and billing state.", "Money flows are high priority and painful to debug.", "Guide an AI agent to implement Stripe checkout, subscriptions, webhook verification, customer records, and billing UI."],
  ["email-skill", "Email Skill", "communications", ["email", "resend", "nodemailer", "templates"], "Mature Pro - Month 5", "Transactional email with Resend or Nodemailer.", "Every app sends email.", "Guide an AI agent to add transactional email templates, providers, environment config, previews, and delivery-safe patterns."],
  ["seo-skill", "SEO Skill", "marketing", ["seo", "metadata", "sitemap", "structured-data"], "Mature Pro - Month 5", "Meta tags, sitemap, open graph images, and structured data.", "Freelancers and client-site builders need this constantly.", "Guide an AI agent to improve technical SEO, social previews, sitemap generation, robots config, and structured data."],
  ["file-upload-skill", "File Upload Skill", "storage", ["s3", "r2", "uploads", "cdn"], "Mature Pro - Month 6", "Image and file upload with storage and CDN config.", "S3 and R2 setup is painful.", "Guide an AI agent to implement secure file uploads, validation, storage adapters, public/private access, and CDN-ready URLs."]
].map(([name, title, category, tags, launchPhase, coreFeature, whyItSells, purpose]) => ({
  name,
  title,
  category,
  tags,
  launchPhase,
  coreFeature,
  whyItSells,
  purpose,
  triggers: [
    `A user asks to add ${String(coreFeature).toLowerCase()}`,
    "A project needs a production-ready implementation instead of a snippet.",
    "The user wants the agent to wire code, configuration, docs, and verification together."
  ],
  stack: [
    ["Approach", "Existing stack first", "Avoids forcing a rewrite."],
    ["Validation", "Typed schemas", "Protects external and user-facing boundaries."],
    ["Verification", "Focused tests and smoke checks", "Keeps generated work trustworthy."]
  ],
  structure: ["src/lib/", "src/server/", "src/components/", "tests/", "docs/"],
  conventions: [
    "Inspect the existing framework, package manager, database, and deployment target first.",
    "Keep secrets in environment variables and document them in .env.example.",
    "Add typed boundaries for inputs, outputs, and provider responses.",
    "Implement server-side authorization for protected actions.",
    "Include verification commands and manual QA steps."
  ],
  steps: [
    "Identify the current stack, existing conventions, and production constraints.",
    "Design the smallest end-to-end flow that proves the feature works.",
    "Add server-side implementation, client UI, configuration, and docs together.",
    "Add focused tests or smoke checks around the highest-risk behavior.",
    "Return setup steps, env requirements, and known follow-up decisions."
  ],
  template: "type ImplementationPlan = {\n  files: string[];\n  env: string[];\n  checks: string[];\n};",
  antiPatterns: [
    "Do not paste provider sample code without adapting it to the project.",
    "Do not skip webhook, auth, env, or error handling for production flows.",
    "Do not hide breaking changes inside broad refactors.",
    "Do not claim a feature is complete without verification steps."
  ]
}));

for (const skill of [...freeSkills.map((skill) => ({ ...skill, tier: "free", pro: false })), ...proSkills.map((skill) => ({ ...skill, tier: "pro", pro: true }))]) {
  await writeSkill(skill);
}

console.log(`Scaffolded ${freeSkills.length} free skills and ${proSkills.length} pro skills.`);

async function writeSkill(skill) {
  const dir = path.join(skillsRoot, skill.name);
  await fs.mkdir(path.join(dir, "examples", "basic"), { recursive: true });

  const packageJson = {
    name: `@skillsforllms/${skill.name}`,
    version: "1.0.0",
    description: `AI skill: ${skill.coreFeature}`,
    keywords: ["llm", "ai-agent", "skill", "skillsforllms", ...skill.tags],
    license: skill.pro ? "SEE LICENSE IN LICENSE.md" : "MIT",
    author: "Automata AI",
    ...(skill.pro ? { private: true } : { publishConfig: { access: "public" } }),
    repository: {
      type: "git",
      url: "git+https://github.com/anlabsdev/automata-ai-skillsforllms.git",
      directory: `skills/${skill.name}`
    },
    files: ["SKILL.md", "README.md", "examples/"],
    skillsforllms: {
      category: skill.category,
      tier: skill.tier,
      launchPhase: skill.launchPhase,
      coreFeature: skill.coreFeature,
      ...(skill.whyItSells ? { whyItSells: skill.whyItSells } : {}),
      status: skill.pro ? "pro-planned" : "available",
      tags: skill.tags,
      compatibleAgents: ["claude", "cursor", "copilot", "continue"]
    },
    scripts: {
      build: "node -e \"console.log('skill package: no build needed')\"",
      check: "node -e \"console.log('skill package: no typecheck needed')\"",
      lint: "node -e \"console.log('skill package: no lint needed')\"",
      test: "node -e \"console.log('skill package: no tests needed')\""
    }
  };

  await fs.writeFile(path.join(dir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  await fs.writeFile(path.join(dir, "SKILL.md"), renderSkill(skill));
  await fs.writeFile(path.join(dir, "README.md"), renderReadme(skill));
  await fs.writeFile(
    path.join(dir, "examples", "basic", "README.md"),
    `# ${skill.title} Basic Example\n\nUse this example folder to document a minimal project scenario for ${skill.name}.\n`
  );

  if (skill.pro) {
    await fs.writeFile(
      path.join(dir, "LICENSE.md"),
      "# Pro Skill License\n\nThis package is marked private until paid distribution, license delivery, and entitlement checks are implemented.\n"
    );
  }
}

function renderSkill(skill) {
  return `# Skill: ${skill.title}
> @skillsforllms/${skill.name} - v1.0.0 - Category: ${titleCase(skill.category)}

## Purpose
${skill.purpose}

## When to Use This Skill
${skill.triggers.map((item) => `- ${item}`).join("\n")}

## Tech Stack Decisions
| Concern | Choice | Reason |
| --- | --- | --- |
${skill.stack.map(([concern, choice, reason]) => `| ${concern} | ${choice} | ${reason} |`).join("\n")}

## Project Structure
\`\`\`text
${skill.structure.join("\n")}
\`\`\`

## Key Conventions
${skill.conventions.map((item) => `- ${item}`).join("\n")}

## Step-by-Step Agent Instructions
${skill.steps.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## File Templates
\`\`\`ts
${skill.template}
\`\`\`

## Anti-Patterns
${skill.antiPatterns.map((item) => `- ${item}`).join("\n")}

## Examples
See \`examples/basic/\` for a minimal usage scenario.

## Changelog
- v1.0.0 - Initial ${skill.tier === "pro" ? "pro" : "free"} roadmap release.
`;
}

function renderReadme(skill) {
  const install = skill.pro
    ? "This pro skill is private until checkout, entitlement, and delivery are enabled."
    : `\`\`\`bash\nnpm install -D @skillsforllms/${skill.name} skillsforllms\nnpx skillsforllms sync @skillsforllms/${skill.name}\n\`\`\``;

  return `# @skillsforllms/${skill.name}

${skill.coreFeature}

Tier: ${titleCase(skill.tier)}
Launch phase: ${skill.launchPhase}

## Install

${install}

## Usage

Ask your agent to read \`.skills/${skill.name}/SKILL.md\` and follow the conventions while implementing the feature.
`;
}

function titleCase(value) {
  return String(value)
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

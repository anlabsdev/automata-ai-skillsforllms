#!/usr/bin/env node
import fs from "fs-extra";
import path from "node:path";
import pc from "picocolors";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

interface Answers {
  name: string;
  scope: string;
  category: string;
  description: string;
  author: string;
}

async function main(): Promise<void> {
  const rl = createInterface({ input, output });

  try {
    const answers: Answers = {
      name: await askSkillName(rl),
      scope: normalizeScope(await ask(rl, "npm scope (@skillsforllms): ", "@skillsforllms")),
      category: await ask(rl, "category (web): ", "web"),
      description: await ask(rl, "description: ", "AI skill package for LLM agents"),
      author: await ask(rl, "author: ", "")
    };

    const dir = path.resolve(process.cwd(), `skill-${answers.name}`);
    if (await fs.pathExists(dir)) {
      throw new Error(`${path.basename(dir)} already exists.`);
    }

    await fs.ensureDir(path.join(dir, "examples", "basic"));
    await fs.writeJson(path.join(dir, "package.json"), createPackageJson(answers), { spaces: 2 });
    await fs.writeFile(path.join(dir, "SKILL.md"), createSkillMarkdown(answers));
    await fs.writeFile(path.join(dir, "README.md"), createReadme(answers));
    await fs.writeFile(path.join(dir, "examples", "basic", "README.md"), `# ${titleCase(answers.name)} Basic Example\n\nDescribe a minimal project using this skill.\n`);

    console.log(pc.green(`✓ created ${path.relative(process.cwd(), dir)}`));
    console.log(pc.dim(`Next: cd ${path.relative(process.cwd(), dir)} && npm publish --access public`));
  } finally {
    rl.close();
  }
}

async function askSkillName(rl: ReturnType<typeof createInterface>): Promise<string> {
  while (true) {
    const name = await ask(rl, "skill name: ", "");
    if (/^[a-z0-9][a-z0-9-]*$/.test(name)) {
      return name;
    }
    console.log(pc.yellow("Use kebab-case: lowercase letters, digits, and hyphens only."));
  }
}

async function ask(rl: ReturnType<typeof createInterface>, prompt: string, fallback: string): Promise<string> {
  const value = (await rl.question(prompt)).trim();
  return value || fallback;
}

function normalizeScope(scope: string): string {
  const trimmed = scope.trim() || "@skillsforllms";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function createPackageJson(answers: Answers) {
  const packageName = answers.scope === "@skillsforllms"
    ? `${answers.scope}/${answers.name}`
    : `${answers.scope}/skill-${answers.name}`;

  return {
    name: packageName,
    version: "1.0.0",
    description: answers.description,
    keywords: ["llm", "ai-agent", "skill", answers.name, "skillsforllms"],
    license: "MIT",
    author: answers.author,
    files: ["SKILL.md", "examples/", "README.md"],
    skillsforllms: {
      category: answers.category,
      tags: answers.name.split("-"),
      compatibleAgents: ["claude", "cursor", "copilot", "continue"]
    }
  };
}

function createSkillMarkdown(answers: Answers): string {
  const packageName = answers.scope === "@skillsforllms"
    ? `${answers.scope}/${answers.name}`
    : `${answers.scope}/skill-${answers.name}`;

  return `# Skill: ${titleCase(answers.name)}
> ${packageName} · v1.0.0 · Category: ${answers.category}

## Purpose
Describe what this skill enables an AI agent to do, and the outcome it should produce.

## When to Use This Skill
- Use when a project needs ${answers.description}.
- Use when the user asks for conventions covered by this skill.

## Key Conventions
- Define naming, folder structure, architecture, and testing conventions here.
- Prefer specific, imperative instructions over broad advice.

## Step-by-Step Agent Instructions
1. Inspect the existing project before making changes.
2. Apply the conventions in this skill.
3. Verify generated code or documents before finishing.

## Anti-Patterns
- Do not introduce unrelated frameworks or conventions.
- Do not ignore existing project structure.

## Examples
See examples/basic for a minimal reference.

## Changelog
- v1.0.0 - Initial release.
`;
}

function createReadme(answers: Answers): string {
  const packageName = answers.scope === "@skillsforllms"
    ? `${answers.scope}/${answers.name}`
    : `${answers.scope}/skill-${answers.name}`;

  return `# ${packageName}

${answers.description}

## Install

\`\`\`bash
npm install -D ${packageName} skillsforllms
npx skillsforllms sync ${packageName}
\`\`\`
`;
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

main().catch((error) => {
  console.error(pc.red(`✗ ${(error as Error).message}`));
  process.exit(1);
});

#!/usr/bin/env node
import { Command } from "commander";
import pc from "picocolors";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_CONFIG,
  type AdapterName,
  discoverSkillPackages,
  extractHeadings,
  findProjectRoot,
  loadConfig,
  packageShortName,
  readSkillPackageMetadata,
  resolvePackagePath,
  validateSkillMarkdown
} from "@skillsforllms/core";

interface GlobalOptions {
  verbose?: boolean;
  quiet?: boolean;
}

interface SyncOptions extends GlobalOptions {
  dir?: string;
  examples?: boolean;
  adapter?: AdapterName;
}

const program = new Command();
let quietOverride = false;

program
  .name("skillsforllms")
  .description("Sync installable AI skill packages into agent-readable project context.")
  .version("0.1.0")
  .option("--verbose", "show stack traces for unexpected errors")
  .option("--quiet", "suppress non-error output");

program
  .command("init")
  .description("create a skillsforllms.config.json file")
  .action(wrap(async () => {
    const root = await requireProjectRoot();
    const configPath = path.join(root, "skillsforllms.config.json");

    if (await fs.pathExists(configPath)) {
      log(pc.yellow("! skillsforllms.config.json already exists; leaving it unchanged."));
      return;
    }

    await fs.writeJson(configPath, DEFAULT_CONFIG, { spaces: 2 });
    log(pc.green(`✓ created ${path.relative(root, configPath)}`));
  }));

program
  .command("sync")
  .description("copy installed skill packages into .skills/")
  .argument("[packages...]", "specific skill packages to sync")
  .option("--dir <path>", "output directory")
  .option("--examples", "copy examples directories")
  .option("--adapter <name>", "agent adapter: cursor, copilot, claude, continue")
  .action(wrap(async (packages: string[], options: SyncOptions) => {
    await syncCommand(packages, options);
  }));

program
  .command("list")
  .description("list skills synced into the output directory")
  .option("--dir <path>", "output directory")
  .action(wrap(async (options: SyncOptions) => {
    const root = await requireProjectRoot();
    const { config, warning } = await loadConfig(root);
    if (warning) log(pc.yellow(`! ${warning}`));

    const outputDir = path.resolve(root, options.dir ?? config.outputDir);
    if (!(await fs.pathExists(outputDir))) {
      log(pc.yellow("No skills are synced yet."));
      return;
    }

    const entries = await fs.readdir(outputDir);
    const skills = [];

    for (const entry of entries) {
      const skillPath = path.join(outputDir, entry, "SKILL.md");
      if (await fs.pathExists(skillPath)) {
        skills.push(entry);
      }
    }

    if (skills.length === 0) {
      log(pc.yellow("No skills are synced yet."));
      return;
    }

    log(pc.cyan("Synced skills"));
    for (const skill of skills.sort()) {
      const metadata = await findInstalledMetadata(root, skill);
      const label = metadata
        ? `${metadata.packageName} v${metadata.version}`
        : skill;
      log(`  ${pc.green("✓")} ${skill} ${pc.dim(label)}`);
    }
  }));

program
  .command("info")
  .description("show metadata and headings for an installed skill")
  .argument("<package-name>", "skill package name")
  .action(wrap(async (packageName: string) => {
    const root = await requireProjectRoot();
    const packagePath = resolvePackagePath(root, packageName);

    if (!(await fs.pathExists(packagePath))) {
      throw new Error(`${packageName} is not installed in node_modules.`);
    }

    const metadata = await readSkillPackageMetadata(packagePath, packageName);
    const skillPath = path.join(packagePath, "SKILL.md");
    const headings = extractHeadings(await fs.readFile(skillPath, "utf8"));

    log(pc.cyan(metadata.packageName));
    log(`  version: ${metadata.version}`);
    log(`  description: ${metadata.description}`);
    log(`  category: ${metadata.category}`);
    log(`  tags: ${metadata.tags.join(", ") || "-"}`);
    log(`  agents: ${metadata.compatibleAgents.join(", ") || "-"}`);
    log("  sections:");
    for (const heading of headings) {
      log(`    - ${heading}`);
    }
  }));

program
  .command("check")
  .description("check npm for newer installed skill versions")
  .action(wrap(async () => {
    const root = await requireProjectRoot();
    const packages = await discoverSkillPackages(root);

    if (packages.length === 0) {
      log(pc.yellow("No installed skill packages found."));
      return;
    }

    for (const packageName of packages) {
      const packagePath = resolvePackagePath(root, packageName);
      const metadata = await readSkillPackageMetadata(packagePath, packageName);
      const latest = await fetchLatestVersion(packageName);
      const marker = latest && latest !== metadata.version ? pc.yellow("update available") : pc.green("current");
      log(`${metadata.packageName} ${pc.dim(metadata.version)} -> ${pc.bold(latest ?? "?")} ${marker}`);
    }
  }));

program
  .command("validate")
  .description("validate one or more SKILL.md files")
  .argument("<paths...>", "SKILL.md paths or globs like skills/*/SKILL.md")
  .action(wrap(async (patterns: string[]) => {
    const files = await expandPaths(patterns);
    if (files.length === 0) {
      throw new Error("No SKILL.md files matched.");
    }

    let failed = false;
    for (const filePath of files) {
      if (!(await fs.pathExists(filePath))) {
        failed = true;
        error(`✗ ${filePath} does not exist.`);
        continue;
      }

      const markdown = await fs.readFile(filePath, "utf8");
      const result = validateSkillMarkdown(markdown);
      log(pc.bold(filePath));
      log(`${result.titlePresent ? pc.green("✓") : pc.red("✗")} title heading`);
      log(`${result.metadataPresent ? pc.green("✓") : pc.red("✗")} metadata block`);

      for (const line of result.lines) {
        const symbol = line.present ? pc.green("✓") : line.required ? pc.red("✗") : pc.yellow("!");
        const suffix = line.required ? "required" : "recommended";
        log(`${symbol} ${line.name} ${pc.dim(`(${suffix})`)}`);
      }

      log(`Score: ${result.score}/${result.maxScore}`);
      if (!result.ok) failed = true;
      log("");
    }

    if (failed) {
      process.exitCode = 1;
    }
  }));

if (isCliEntry()) {
  program.parseAsync(process.argv).catch((error_) => {
    handleError(error_, program.opts<GlobalOptions>());
  });
}

export async function syncCommand(packages: string[], options: SyncOptions = {}): Promise<void> {
  quietOverride = Boolean(options.quiet);
  const root = await requireProjectRoot();
  const configData = await loadConfig(root);
  const config = configData.config;

  if (configData.warning) log(pc.yellow(`! ${configData.warning}`));

  const nodeModules = path.join(root, "node_modules");
  if (!(await fs.pathExists(nodeModules))) {
    throw new Error("node_modules not found. Run npm install first.");
  }

  const discovered = packages.length > 0 ? packages : await discoverSkillPackages(root);
  const outputDir = path.resolve(root, options.dir ?? config.outputDir);
  const includeExamples = options.examples ?? config.includeExamples;

  if (discovered.length === 0) {
    log(pc.yellow("No skill packages found."));
    log(pc.dim("Install a skill first: npm install -D @skills/react-setup"));
    return;
  }

  await fs.ensureDir(outputDir);
  let synced = 0;
  let skipped = 0;
  const syncedSkills: string[] = [];

  for (const packageName of discovered) {
    const packagePath = resolvePackagePath(root, packageName);
    const shortName = packageShortName(packageName);
    const destDir = path.join(outputDir, shortName);

    try {
      if (!(await fs.pathExists(packagePath))) {
        skipped++;
        log(pc.red(`✗ ${packageName} not found in node_modules.`));
        continue;
      }

      const skillSource = path.join(packagePath, "SKILL.md");
      if (!(await fs.pathExists(skillSource))) {
        skipped++;
        log(pc.yellow(`! ${packageName} has no SKILL.md; skipping.`));
        continue;
      }

      const metadata = await readSkillPackageMetadata(packagePath, packageName);
      await fs.ensureDir(destDir);
      await fs.copyFile(skillSource, path.join(destDir, "SKILL.md"));

      if (includeExamples) {
        const examplesSource = path.join(packagePath, "examples");
        if (await fs.pathExists(examplesSource)) {
          await fs.copy(examplesSource, path.join(destDir, "examples"), { overwrite: true });
        }
      }

      synced++;
      syncedSkills.push(shortName);
      log(`${pc.green("✓")} ${packageName} ${pc.dim(`v${metadata.version} -> ${path.relative(root, destDir)}/SKILL.md`)}`);
    } catch (error_) {
      skipped++;
      error(`✗ ${packageName} failed: ${(error_ as Error).message}`);
    }
  }

  await writeIndex(outputDir);

  const adapters = new Set<AdapterName>();
  if (options.adapter) adapters.add(options.adapter);
  for (const [adapter, enabled] of Object.entries(config.agents) as [AdapterName, boolean][]) {
    if (enabled) adapters.add(adapter);
  }

  for (const adapter of adapters) {
    await runAdapter(adapter, outputDir, root);
  }

  log("");
  log(pc.bold(`${synced} skill${synced === 1 ? "" : "s"} synced`));
  if (skipped > 0) log(pc.yellow(`${skipped} skipped`));
}

async function writeIndex(outputDir: string): Promise<void> {
  const entries = await fs.readdir(outputDir).catch(() => []);
  const skills = [];
  for (const entry of entries) {
    if (await fs.pathExists(path.join(outputDir, entry, "SKILL.md"))) {
      skills.push(entry);
    }
  }

  const lines = [
    "# Installed Skills Index",
    `> Generated by skillsforllms · ${new Date().toISOString().slice(0, 10)}`,
    "",
    "## Skills in this project",
    "",
    ...skills.sort().map((name) => `- [${name}](./${name}/SKILL.md)`),
    "",
    "## Usage",
    "Point your AI agent to the relevant files in this directory.",
    ""
  ];

  await fs.writeFile(path.join(outputDir, "INDEX.md"), lines.join("\n"));
}

async function runAdapter(adapter: AdapterName, outputDir: string, root: string): Promise<void> {
  const skills = (await fs.readdir(outputDir))
    .filter((name) => fs.pathExistsSync(path.join(outputDir, name, "SKILL.md")))
    .sort();

  if (adapter === "cursor") {
    const rulesPath = path.join(root, ".cursorrules");
    const start = "# === SkillsForLLMs generated start ===";
    const end = "# === SkillsForLLMs generated end ===";
    const existing = await fs.readFile(rulesPath, "utf8").catch(() => "");
    const preserved = existing.replace(new RegExp(`\\n?${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}\\n?`, "m"), "\n").trim();
    const generated = await renderConcatenatedSkills(outputDir, skills);
    const next = [preserved, start, generated, end].filter(Boolean).join("\n\n") + "\n";
    await fs.writeFile(rulesPath, next);
    log(pc.cyan("-> Adapter cursor wrote .cursorrules"));
  }

  if (adapter === "copilot") {
    const githubDir = path.join(root, ".github");
    await fs.ensureDir(githubDir);
    const generated = await renderConcatenatedSkills(outputDir, skills);
    await fs.writeFile(
      path.join(githubDir, "copilot-instructions.md"),
      `# Copilot Instructions\n> Auto-generated by skillsforllms.\n\n${generated}\n`
    );
    log(pc.cyan("-> Adapter copilot wrote .github/copilot-instructions.md"));
  }

  if (adapter === "claude") {
    const generated = await renderConcatenatedSkills(outputDir, skills, "\n\n---\n\n");
    await fs.writeFile(
      path.join(outputDir, "CLAUDE_PROJECT.md"),
      `# Claude Project Skills\n> Generated by skillsforllms on ${new Date().toISOString().slice(0, 10)}.\n\n${generated}\n`
    );
    log(pc.cyan("-> Adapter claude wrote CLAUDE_PROJECT.md"));
  }

  if (adapter === "continue") {
    const contextDir = path.join(root, ".continue", "context");
    await fs.ensureDir(contextDir);
    for (const skill of skills) {
      await fs.copyFile(path.join(outputDir, skill, "SKILL.md"), path.join(contextDir, `${skill}.md`));
    }
    log(pc.cyan("-> Adapter continue wrote .continue/context/"));
  }
}

async function renderConcatenatedSkills(outputDir: string, skills: string[], separator = "\n\n"): Promise<string> {
  const chunks = [];
  for (const skill of skills) {
    const content = await fs.readFile(path.join(outputDir, skill, "SKILL.md"), "utf8");
    chunks.push(`## Skill: ${skill}\n\n${content}`);
  }
  return chunks.join(separator);
}

async function findInstalledMetadata(root: string, shortName: string) {
  const packages = await discoverSkillPackages(root);
  const match = packages.find((packageName) => packageShortName(packageName) === shortName);
  if (!match) return null;

  return readSkillPackageMetadata(resolvePackagePath(root, match), match).catch(() => null);
}

async function fetchLatestVersion(packageName: string): Promise<string | null> {
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`);
  if (!response.ok) {
    throw new Error(`npm registry returned ${response.status} for ${packageName}.`);
  }

  const body = await response.json() as { "dist-tags"?: { latest?: string } };
  return body["dist-tags"]?.latest ?? null;
}

async function requireProjectRoot(): Promise<string> {
  const root = await findProjectRoot();
  if (!root) {
    throw new Error("This command must be run inside an npm project.");
  }
  return root;
}

async function expandPaths(patterns: string[]): Promise<string[]> {
  const results = new Set<string>();

  for (const pattern of patterns) {
    if (!pattern.includes("*")) {
      results.add(path.resolve(pattern));
      continue;
    }

    const normalized = pattern.replaceAll("\\", "/");
    const [beforeStar, afterStar = ""] = normalized.split("*", 2);
    const base = beforeStar.endsWith("/") ? beforeStar.slice(0, -1) : path.dirname(beforeStar);
    const prefix = beforeStar.endsWith("/") ? "" : path.basename(beforeStar);
    const resolvedBase = path.resolve(base || ".");

    if (!(await fs.pathExists(resolvedBase))) continue;

    const entries = await fs.readdir(resolvedBase);
    for (const entry of entries) {
      if (prefix && !entry.startsWith(prefix)) continue;
      const candidate = path.join(resolvedBase, entry, afterStar.replace(/^\//, ""));
      if (await fs.pathExists(candidate)) {
        results.add(candidate);
      }
    }
  }

  return [...results].sort();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wrap<T extends unknown[]>(fn: (...args: T) => Promise<void>) {
  return async (...args: T) => {
    try {
      await fn(...args);
    } catch (error_) {
      handleError(error_, program.opts<GlobalOptions>());
    }
  };
}

function handleError(error_: unknown, options: GlobalOptions): void {
  const message = error_ instanceof Error ? error_.message : String(error_);
  error(pc.red(`✗ ${message}`));
  if (options.verbose && error_ instanceof Error && error_.stack) {
    error(error_.stack);
  }
  process.exitCode = 1;
}

function log(message: string): void {
  if (!program.opts<GlobalOptions>().quiet && !quietOverride) {
    console.log(message);
  }
}

function error(message: string): void {
  console.error(message);
}

function isCliEntry(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && path.resolve(entry) === fileURLToPath(import.meta.url);
}

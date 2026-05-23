import fs from "fs-extra";
import path from "node:path";

export const REQUIRED_SECTIONS = [
  "Purpose",
  "When to Use This Skill",
  "Key Conventions",
  "Anti-Patterns"
] as const;

export const RECOMMENDED_SECTIONS = [
  "Tech Stack Decisions",
  "Project Structure",
  "Step-by-Step Agent Instructions",
  "File Templates",
  "Examples",
  "Changelog"
] as const;

export const DEFAULT_CONFIG: SkillsForLLMsConfig = {
  outputDir: ".skills",
  includeExamples: false,
  autoSync: true,
  agents: {
    cursor: false,
    copilot: false,
    claude: false,
    continue: false
  }
};

export type AdapterName = "cursor" | "copilot" | "claude" | "continue";

export interface SkillsForLLMsConfig {
  outputDir: string;
  includeExamples: boolean;
  autoSync: boolean;
  agents: Record<AdapterName, boolean>;
}

export interface ValidationLine {
  name: string;
  required: boolean;
  present: boolean;
}

export interface SkillValidationResult {
  titlePresent: boolean;
  metadataPresent: boolean;
  score: number;
  maxScore: number;
  lines: ValidationLine[];
  headings: string[];
  ok: boolean;
}

export interface SkillPackageMetadata {
  packageName: string;
  shortName: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  compatibleAgents: string[];
  author?: string;
  packagePath?: string;
}

export function normalizeHeading(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export function extractHeadings(markdown: string): string[] {
  return [...markdown.matchAll(/^##\s+(.+?)\s*#*\s*$/gm)].map((match) =>
    match[1].trim()
  );
}

export function validateSkillMarkdown(markdown: string): SkillValidationResult {
  const headings = extractHeadings(markdown);
  const normalized = new Set(headings.map(normalizeHeading));
  const titlePresent = /^#\s+Skill:\s+.+$/m.test(markdown);
  const metadataPresent = /^>\s+.+\s+(?:·|-)\s+v?\d+\.\d+\.\d+.*\s+(?:·|-)\s+Category:\s+.+$/m.test(markdown);

  const requiredLines = REQUIRED_SECTIONS.map((name) => ({
    name,
    required: true,
    present: normalized.has(normalizeHeading(name))
  }));

  const recommendedLines = RECOMMENDED_SECTIONS.map((name) => ({
    name,
    required: false,
    present: normalized.has(normalizeHeading(name))
  }));

  const score = requiredLines.filter((line) => line.present).length;

  return {
    titlePresent,
    metadataPresent,
    score,
    maxScore: REQUIRED_SECTIONS.length,
    lines: [...requiredLines, ...recommendedLines],
    headings,
    ok: titlePresent && metadataPresent && score === REQUIRED_SECTIONS.length
  };
}

export function isSkillPackageName(name: string): boolean {
  return /^@skillsforllms\/[a-z0-9][a-z0-9-]*$/.test(name) ||
    /^@[a-z0-9][a-z0-9-]*\/skill-[a-z0-9][a-z0-9-]*$/.test(name);
}

export function packageShortName(packageName: string): string {
  const unscoped = packageName.includes("/")
    ? packageName.slice(packageName.indexOf("/") + 1)
    : packageName;

  return unscoped.replace(/^skill-/, "");
}

export async function readJsonFile<T = unknown>(filePath: string): Promise<T> {
  return fs.readJson(filePath) as Promise<T>;
}

export async function findProjectRoot(startDir = process.cwd()): Promise<string | null> {
  let current = path.resolve(startDir);

  while (true) {
    if (await fs.pathExists(path.join(current, "package.json"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }

    current = parent;
  }
}

export async function loadConfig(projectRoot: string): Promise<{
  config: SkillsForLLMsConfig;
  source: string | null;
  warning?: string;
}> {
  const jsonPath = path.join(projectRoot, "skillsforllms.config.json");
  const rcPath = path.join(projectRoot, ".skillsrc");
  const hasJson = await fs.pathExists(jsonPath);
  const hasRc = await fs.pathExists(rcPath);

  const source = hasJson ? jsonPath : hasRc ? rcPath : null;
  const warning = hasJson && hasRc
    ? "Both skillsforllms.config.json and .skillsrc exist; using skillsforllms.config.json."
    : undefined;

  if (!source) {
    return { config: DEFAULT_CONFIG, source: null, warning };
  }

  let raw: unknown;
  try {
    raw = await fs.readJson(source);
  } catch (error) {
    throw new Error(`Failed to parse config file ${source}: ${(error as Error).message}`);
  }

  return {
    config: normalizeConfig(raw),
    source,
    warning
  };
}

export function normalizeConfig(value: unknown): SkillsForLLMsConfig {
  if (!isRecord(value)) {
    throw new Error("Config must be a JSON object.");
  }

  const config = structuredClone(DEFAULT_CONFIG);

  if ("outputDir" in value) {
    if (typeof value.outputDir !== "string") {
      throw new Error("Config field outputDir must be a string.");
    }
    config.outputDir = value.outputDir;
  }

  if ("includeExamples" in value) {
    if (typeof value.includeExamples !== "boolean") {
      throw new Error("Config field includeExamples must be a boolean.");
    }
    config.includeExamples = value.includeExamples;
  }

  if ("autoSync" in value) {
    if (typeof value.autoSync !== "boolean") {
      throw new Error("Config field autoSync must be a boolean.");
    }
    config.autoSync = value.autoSync;
  }

  if ("agents" in value) {
    if (!isRecord(value.agents)) {
      throw new Error("Config field agents must be an object.");
    }

    for (const adapter of Object.keys(config.agents) as AdapterName[]) {
      if (adapter in value.agents) {
        if (typeof value.agents[adapter] !== "boolean") {
          throw new Error(`Config field agents.${adapter} must be a boolean.`);
        }
        config.agents[adapter] = value.agents[adapter];
      }
    }
  }

  return config;
}

export async function discoverSkillPackages(projectRoot: string): Promise<string[]> {
  const packageJsonPath = path.join(projectRoot, "package.json");
  const projectPackage = await fs.readJson(packageJsonPath).catch(() => ({}));
  const declared = new Set<string>();
  const dependencies = {
    ...(projectPackage.dependencies ?? {}),
    ...(projectPackage.devDependencies ?? {})
  } as Record<string, string>;

  for (const name of Object.keys(dependencies)) {
    if (isSkillPackageName(name)) {
      declared.add(name);
    }
  }

  const skillsScopeDir = path.join(projectRoot, "node_modules", "@skillsforllms");
  if (await fs.pathExists(skillsScopeDir)) {
    const entries = await fs.readdir(skillsScopeDir);
    for (const entry of entries) {
      if (!entry.startsWith(".")) {
        declared.add(`@skillsforllms/${entry}`);
      }
    }
  }

  return [...declared].sort();
}

export function resolvePackagePath(projectRoot: string, packageName: string): string {
  return path.join(projectRoot, "node_modules", ...packageName.split("/"));
}

export async function readSkillPackageMetadata(
  packagePath: string,
  fallbackName?: string
): Promise<SkillPackageMetadata> {
  const pkg = await fs.readJson(path.join(packagePath, "package.json"));
  const packageName = pkg.name ?? fallbackName;

  if (!packageName || typeof packageName !== "string") {
    throw new Error(`Missing package name in ${packagePath}`);
  }

  return {
    packageName,
    shortName: packageShortName(packageName),
    version: String(pkg.version ?? "0.0.0"),
    description: String(pkg.description ?? ""),
    category: String(pkg.skillsforllms?.category ?? "uncategorized"),
    tags: Array.isArray(pkg.skillsforllms?.tags) ? pkg.skillsforllms.tags : [],
    compatibleAgents: Array.isArray(pkg.skillsforllms?.compatibleAgents)
      ? pkg.skillsforllms.compatibleAgents
      : [],
    author: typeof pkg.author === "string" ? pkg.author : undefined,
    packagePath
  };
}

export function validateSkillPackageJson(pkg: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(pkg)) {
    return ["package.json must contain an object."];
  }

  if (typeof pkg.name !== "string" || !isSkillPackageName(pkg.name)) {
    errors.push("name must be @skills/<name> or @scope/skill-<name>.");
  }

  if (typeof pkg.version !== "string" || !/^\d+\.\d+\.\d+/.test(pkg.version)) {
    errors.push("version must be a semver string.");
  }

  if (typeof pkg.description !== "string" || pkg.description.trim().length === 0) {
    errors.push("description must be a non-empty string.");
  }

  if (!Array.isArray(pkg.keywords) || !pkg.keywords.includes("skillsforllms")) {
    errors.push("keywords must include skillsforllms.");
  }

  if (typeof pkg.license !== "string" || pkg.license.trim().length === 0) {
    errors.push("license must be a non-empty string.");
  }

  if (!Array.isArray(pkg.files) || !pkg.files.includes("SKILL.md") || !pkg.files.includes("README.md")) {
    errors.push("files must include SKILL.md and README.md.");
  }

  if ("main" in pkg || "module" in pkg || "bin" in pkg) {
    errors.push("skill packages must not declare main, module, or bin.");
  }

  if (!isRecord(pkg.skillsforllms)) {
    errors.push("skillsforllms metadata object is required.");
  } else {
    if (typeof pkg.skillsforllms.category !== "string") {
      errors.push("skillsforllms.category must be a string.");
    }
    if (!Array.isArray(pkg.skillsforllms.tags)) {
      errors.push("skillsforllms.tags must be an array.");
    }
    if (!Array.isArray(pkg.skillsforllms.compatibleAgents)) {
      errors.push("skillsforllms.compatibleAgents must be an array.");
    }
  }

  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

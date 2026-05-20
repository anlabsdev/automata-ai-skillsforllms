import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  extractHeadings,
  isSkillPackageName,
  normalizeConfig,
  normalizeHeading,
  packageShortName,
  validateSkillMarkdown,
  validateSkillPackageJson
} from "./index.js";

/* ========================================================================
 * Package Naming
 * ====================================================================== */

describe("isSkillPackageName", () => {
  it("accepts official @skillsforllms scope", () => {
    expect(isSkillPackageName("@skillsforllms/react-setup")).toBe(true);
    expect(isSkillPackageName("@skillsforllms/node-rest-api")).toBe(true);
    expect(isSkillPackageName("@skillsforllms/a")).toBe(true);
    expect(isSkillPackageName("@skillsforllms/firebase-setup")).toBe(true);
  });

  it("accepts community scope with skill- prefix", () => {
    expect(isSkillPackageName("@aj/skill-my-stack")).toBe(true);
    expect(isSkillPackageName("@acme/skill-internal-api")).toBe(true);
    expect(isSkillPackageName("@org123/skill-test")).toBe(true);
  });

  it("rejects community scope without skill- prefix", () => {
    expect(isSkillPackageName("@aj/my-stack")).toBe(false);
    expect(isSkillPackageName("@acme/react-setup")).toBe(false);
  });

  it("rejects unscoped packages", () => {
    expect(isSkillPackageName("react-setup")).toBe(false);
    expect(isSkillPackageName("skillsforllms")).toBe(false);
    expect(isSkillPackageName("skill-react-setup")).toBe(false);
  });

  it("rejects names with uppercase or special chars", () => {
    expect(isSkillPackageName("@skillsforllms/React-Setup")).toBe(false);
    expect(isSkillPackageName("@skillsforllms/react_setup")).toBe(false);
    expect(isSkillPackageName("@skillsforllms/react.setup")).toBe(false);
    expect(isSkillPackageName("@skillsforllms/")).toBe(false);
    expect(isSkillPackageName("@skillsforllms/-react")).toBe(false);
  });

  it("rejects empty or malformed strings", () => {
    expect(isSkillPackageName("")).toBe(false);
    expect(isSkillPackageName("@/")).toBe(false);
    expect(isSkillPackageName("@skillsforllms")).toBe(false);
  });
});

describe("packageShortName", () => {
  it("extracts short name from @skillsforllms scope", () => {
    expect(packageShortName("@skillsforllms/react-setup")).toBe("react-setup");
    expect(packageShortName("@skillsforllms/auth-setup")).toBe("auth-setup");
    expect(packageShortName("@skillsforllms/a")).toBe("a");
  });

  it("strips skill- prefix for community scope", () => {
    expect(packageShortName("@aj/skill-my-stack")).toBe("my-stack");
    expect(packageShortName("@acme/skill-internal-api")).toBe("internal-api");
  });

  it("handles unscoped names", () => {
    expect(packageShortName("skill-react-setup")).toBe("react-setup");
    expect(packageShortName("plain-name")).toBe("plain-name");
  });
});

/* ========================================================================
 * Heading Extraction & Normalization
 * ====================================================================== */

describe("normalizeHeading", () => {
  it("trims whitespace and collapses spaces", () => {
    expect(normalizeHeading("  Purpose  ")).toBe("purpose");
    expect(normalizeHeading("When to   Use This   Skill")).toBe("when to use this skill");
  });

  it("lowercases headings", () => {
    expect(normalizeHeading("Key Conventions")).toBe("key conventions");
    expect(normalizeHeading("ANTI-PATTERNS")).toBe("anti-patterns");
  });
});

describe("extractHeadings", () => {
  it("finds all ## headings", () => {
    const md = `# Title\n## Purpose\nText\n## Key Conventions\nMore text\n## Anti-Patterns`;
    const headings = extractHeadings(md);
    expect(headings).toEqual(["Purpose", "Key Conventions", "Anti-Patterns"]);
  });

  it("ignores # and ### headings", () => {
    const md = `# Skill: Test\n## Purpose\n### Details\n## Examples`;
    const headings = extractHeadings(md);
    expect(headings).toEqual(["Purpose", "Examples"]);
  });

  it("returns empty for no headings", () => {
    expect(extractHeadings("just plain text")).toEqual([]);
    expect(extractHeadings("")).toEqual([]);
  });

  it("handles trailing hashes in ATX headings", () => {
    const md = `## Purpose ##\n## Key Conventions ##`;
    const headings = extractHeadings(md);
    expect(headings).toEqual(["Purpose", "Key Conventions"]);
  });
});

/* ========================================================================
 * Skill Markdown Validation
 * ====================================================================== */

describe("validateSkillMarkdown", () => {
  const VALID_SKILL = `# Skill: Test Skill
> @skills/test · v1.0.0 · Category: Test

## Purpose
Do the thing.

## When to Use This Skill
- When needed.

## Key Conventions
- Use care.

## Anti-Patterns
- Avoid chaos.
`;

  it("validates a complete, valid skill", () => {
    const result = validateSkillMarkdown(VALID_SKILL);
    expect(result.ok).toBe(true);
    expect(result.titlePresent).toBe(true);
    expect(result.metadataPresent).toBe(true);
    expect(result.score).toBe(4);
    expect(result.maxScore).toBe(4);
  });

  it("reports missing title", () => {
    const md = `## Purpose\nDo stuff.\n## When to Use This Skill\n- When\n## Key Conventions\n- Rule\n## Anti-Patterns\n- No`;
    const result = validateSkillMarkdown(md);
    expect(result.titlePresent).toBe(false);
    expect(result.ok).toBe(false);
  });

  it("reports missing metadata line", () => {
    const md = `# Skill: Test\n\n## Purpose\nDo stuff.\n## When to Use This Skill\n- When\n## Key Conventions\n- Rule\n## Anti-Patterns\n- No`;
    const result = validateSkillMarkdown(md);
    expect(result.metadataPresent).toBe(false);
    expect(result.ok).toBe(false);
  });

  it("reports missing required sections", () => {
    const md = `# Skill: Test\n> @skills/test · v1.0.0 · Category: Test\n\n## Purpose\nDo stuff.`;
    const result = validateSkillMarkdown(md);
    expect(result.ok).toBe(false);
    expect(result.score).toBe(1);

    const missing = result.lines.filter((line) => line.required && !line.present);
    expect(missing.length).toBe(3);
    const missingNames = missing.map((line) => line.name);
    expect(missingNames).toContain("When to Use This Skill");
    expect(missingNames).toContain("Key Conventions");
    expect(missingNames).toContain("Anti-Patterns");
  });

  it("scores recommended sections as non-required", () => {
    const result = validateSkillMarkdown(VALID_SKILL);
    const recommended = result.lines.filter((line) => !line.required);
    expect(recommended.length).toBe(6);
    // None of the recommended sections are in VALID_SKILL except maybe some
    for (const rec of recommended) {
      expect(rec.required).toBe(false);
    }
  });

  it("gives credit for recommended sections when present", () => {
    const md = `# Skill: Full
> @skills/full · v2.0.0 · Category: Web / React

## Purpose
Guide agents.

## When to Use This Skill
- Starting a new project.

## Key Conventions
- Use TypeScript.

## Anti-Patterns
- Do not use CRA.

## Tech Stack Decisions
| Tool | Choice |
| --- | --- |

## Project Structure
src/

## Step-by-Step Agent Instructions
1. Scaffold.

## File Templates
template code

## Examples
See examples/basic.

## Changelog
- v2.0.0 - Update.
`;
    const result = validateSkillMarkdown(md);
    expect(result.ok).toBe(true);
    expect(result.score).toBe(4);
    const recommended = result.lines.filter((line) => !line.required);
    const presentRecommended = recommended.filter((line) => line.present);
    expect(presentRecommended.length).toBe(6);
  });

  it("handles completely empty markdown", () => {
    const result = validateSkillMarkdown("");
    expect(result.ok).toBe(false);
    expect(result.titlePresent).toBe(false);
    expect(result.metadataPresent).toBe(false);
    expect(result.score).toBe(0);
    expect(result.headings).toEqual([]);
  });

  it("extracts headings in the result", () => {
    const result = validateSkillMarkdown(VALID_SKILL);
    expect(result.headings).toEqual([
      "Purpose",
      "When to Use This Skill",
      "Key Conventions",
      "Anti-Patterns"
    ]);
  });

  it("accepts metadata with v prefix", () => {
    const md = `# Skill: Test\n> @skills/test · v1.0.0 · Category: Test\n## Purpose\nX\n## When to Use This Skill\n- X\n## Key Conventions\n- X\n## Anti-Patterns\n- X`;
    expect(validateSkillMarkdown(md).metadataPresent).toBe(true);
  });

  it("accepts metadata without v prefix", () => {
    const md = `# Skill: Test\n> @skills/test · 1.0.0 · Category: Test\n## Purpose\nX\n## When to Use This Skill\n- X\n## Key Conventions\n- X\n## Anti-Patterns\n- X`;
    expect(validateSkillMarkdown(md).metadataPresent).toBe(true);
  });
});

/* ========================================================================
 * Config Normalization
 * ====================================================================== */

describe("normalizeConfig", () => {
  it("returns defaults for empty object", () => {
    const config = normalizeConfig({});
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it("overrides outputDir", () => {
    const config = normalizeConfig({ outputDir: ".ai-skills" });
    expect(config.outputDir).toBe(".ai-skills");
    expect(config.includeExamples).toBe(false); // default preserved
  });

  it("overrides includeExamples", () => {
    const config = normalizeConfig({ includeExamples: true });
    expect(config.includeExamples).toBe(true);
  });

  it("overrides autoSync", () => {
    const config = normalizeConfig({ autoSync: false });
    expect(config.autoSync).toBe(false);
  });

  it("overrides individual agent adapters", () => {
    const config = normalizeConfig({ agents: { cursor: true, claude: true } });
    expect(config.agents.cursor).toBe(true);
    expect(config.agents.claude).toBe(true);
    expect(config.agents.copilot).toBe(false); // default preserved
    expect(config.agents.continue).toBe(false); // default preserved
  });

  it("throws for non-object", () => {
    expect(() => normalizeConfig("bad")).toThrow("Config must be a JSON object.");
    expect(() => normalizeConfig(null)).toThrow();
    expect(() => normalizeConfig(42)).toThrow();
    expect(() => normalizeConfig([])).toThrow();
  });

  it("throws for wrong outputDir type", () => {
    expect(() => normalizeConfig({ outputDir: 123 })).toThrow("outputDir must be a string");
  });

  it("throws for wrong includeExamples type", () => {
    expect(() => normalizeConfig({ includeExamples: "yes" })).toThrow("includeExamples must be a boolean");
  });

  it("throws for wrong autoSync type", () => {
    expect(() => normalizeConfig({ autoSync: 1 })).toThrow("autoSync must be a boolean");
  });

  it("throws for non-object agents", () => {
    expect(() => normalizeConfig({ agents: "cursor" })).toThrow("agents must be an object");
  });

  it("throws for non-boolean agent value", () => {
    expect(() => normalizeConfig({ agents: { cursor: "true" } })).toThrow("agents.cursor must be a boolean");
  });

  it("does not mutate DEFAULT_CONFIG", () => {
    const before = JSON.stringify(DEFAULT_CONFIG);
    normalizeConfig({ outputDir: ".modified", agents: { cursor: true } });
    expect(JSON.stringify(DEFAULT_CONFIG)).toBe(before);
  });
});

/* ========================================================================
 * Package.json Validation
 * ====================================================================== */

describe("validateSkillPackageJson", () => {
  const validPkg = {
    name: "@skillsforllms/react-setup",
    version: "1.0.0",
    description: "AI skill: React setup conventions.",
    keywords: ["llm", "ai-agent", "skill", "react", "skillsforllms"],
    license: "MIT",
    files: ["SKILL.md", "examples/", "README.md"],
    skillsforllms: {
      category: "web",
      tags: ["react", "vite"],
      compatibleAgents: ["claude", "cursor"]
    }
  };

  it("returns no errors for a valid package", () => {
    expect(validateSkillPackageJson(validPkg)).toEqual([]);
  });

  it("flags invalid package name", () => {
    const errors = validateSkillPackageJson({ ...validPkg, name: "react-setup" });
    expect(errors.some((error) => error.includes("name"))).toBe(true);
  });

  it("flags missing version", () => {
    const { version, ...rest } = validPkg;
    const errors = validateSkillPackageJson(rest);
    expect(errors.some((error) => error.includes("version"))).toBe(true);
  });

  it("flags non-semver version", () => {
    const errors = validateSkillPackageJson({ ...validPkg, version: "abc" });
    expect(errors.some((error) => error.includes("version"))).toBe(true);
  });

  it("flags missing description", () => {
    const errors = validateSkillPackageJson({ ...validPkg, description: "" });
    expect(errors.some((error) => error.includes("description"))).toBe(true);
  });

  it("flags missing skillsforllms keyword", () => {
    const errors = validateSkillPackageJson({ ...validPkg, keywords: ["react"] });
    expect(errors.some((error) => error.includes("keywords"))).toBe(true);
  });

  it("flags missing license", () => {
    const errors = validateSkillPackageJson({ ...validPkg, license: "" });
    expect(errors.some((error) => error.includes("license"))).toBe(true);
  });

  it("flags files without SKILL.md", () => {
    const errors = validateSkillPackageJson({ ...validPkg, files: ["README.md"] });
    expect(errors.some((error) => error.includes("files"))).toBe(true);
  });

  it("flags files without README.md", () => {
    const errors = validateSkillPackageJson({ ...validPkg, files: ["SKILL.md"] });
    expect(errors.some((error) => error.includes("files"))).toBe(true);
  });

  it("flags package with main entry point", () => {
    const errors = validateSkillPackageJson({ ...validPkg, main: "index.js" });
    expect(errors.some((error) => error.includes("main"))).toBe(true);
  });

  it("flags package with module entry point", () => {
    const errors = validateSkillPackageJson({ ...validPkg, module: "index.mjs" });
    expect(errors.some((error) => error.includes("module"))).toBe(true);
  });

  it("flags package with bin entry point", () => {
    const errors = validateSkillPackageJson({ ...validPkg, bin: { test: "cli.js" } });
    expect(errors.some((error) => error.includes("bin"))).toBe(true);
  });

  it("flags missing skillsforllms object", () => {
    const { skillsforllms, ...rest } = validPkg;
    const errors = validateSkillPackageJson(rest);
    expect(errors.some((error) => error.includes("skillsforllms"))).toBe(true);
  });

  it("flags missing category in skillsforllms", () => {
    const errors = validateSkillPackageJson({
      ...validPkg,
      skillsforllms: { tags: ["react"], compatibleAgents: ["claude"] }
    });
    expect(errors.some((error) => error.includes("category"))).toBe(true);
  });

  it("flags missing tags in skillsforllms", () => {
    const errors = validateSkillPackageJson({
      ...validPkg,
      skillsforllms: { category: "web", compatibleAgents: ["claude"] }
    });
    expect(errors.some((error) => error.includes("tags"))).toBe(true);
  });

  it("flags missing compatibleAgents in skillsforllms", () => {
    const errors = validateSkillPackageJson({
      ...validPkg,
      skillsforllms: { category: "web", tags: ["react"] }
    });
    expect(errors.some((error) => error.includes("compatibleAgents"))).toBe(true);
  });

  it("rejects non-object input", () => {
    const errors = validateSkillPackageJson("not an object");
    expect(errors).toEqual(["package.json must contain an object."]);
  });

  it("returns multiple errors at once", () => {
    const errors = validateSkillPackageJson({
      name: "bad-name",
      version: "not-semver",
      description: "",
      keywords: [],
      license: "",
      files: [],
      main: "index.js"
    });
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});

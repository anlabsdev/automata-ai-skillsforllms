import { describe, expect, it, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
import { syncCommand } from "./index.js";

/* ========================================================================
 * CLI syncCommand Integration Tests
 *
 * These tests create a temporary project on disk with fake @skills/* packages
 * in node_modules, then run syncCommand and assert the expected outputs.
 * ====================================================================== */

let tmpDir: string;

function setupFakeProject(options: {
  skills?: Record<string, { version?: string; skillMd?: string; hasExamples?: boolean }>;
  config?: Record<string, unknown>;
}) {
  const projectDir = path.join(tmpDir, "project");
  const nodeModules = path.join(projectDir, "node_modules", "@skillsforllms");

  // Always create node_modules/ so syncCommand doesn't throw "not found"
  fs.ensureDirSync(path.join(projectDir, "node_modules"));

  const devDependencies: Record<string, string> = {};

  // Create node_modules/@skills/<name> with SKILL.md and package.json
  for (const [name, opts] of Object.entries(options.skills ?? {})) {
    const pkgDir = path.join(nodeModules, name);
    fs.ensureDirSync(pkgDir);

    const version = opts.version ?? "1.0.0";
    devDependencies[`@skillsforllms/${name}`] = `^${version}`;

    fs.writeJsonSync(path.join(pkgDir, "package.json"), {
      name: `@skillsforllms/${name}`,
      version,
      description: `AI skill: ${name}`,
      skillsforllms: {
        category: "test",
        tags: [name],
        compatibleAgents: ["claude"]
      }
    });

    if (opts.skillMd !== undefined) {
      fs.writeFileSync(path.join(pkgDir, "SKILL.md"), opts.skillMd);
    }

    if (opts.hasExamples) {
      const exDir = path.join(pkgDir, "examples", "basic");
      fs.ensureDirSync(exDir);
      fs.writeFileSync(path.join(exDir, "README.md"), `# ${name} example`);
    }
  }

  // Root package.json
  fs.writeJsonSync(path.join(projectDir, "package.json"), {
    name: "test-project",
    devDependencies
  });

  // Config file
  if (options.config) {
    fs.writeJsonSync(
      path.join(projectDir, "skillsforllms.config.json"),
      options.config
    );
  }

  return projectDir;
}

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "sfl-test-"));
});

afterEach(() => {
  fs.removeSync(tmpDir);
});

describe("syncCommand integration", () => {
  it("syncs a single skill into .skills/", async () => {
    const projectDir = setupFakeProject({
      skills: {
        "react-setup": {
          skillMd: `# Skill: React Setup\n> @skillsforllms/react-setup · v1.0.0 · Category: Web\n\n## Purpose\nGuide React setup.`
        }
      }
    });

    // Override cwd for findProjectRoot to work
    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      await syncCommand([], { quiet: true });

      // SKILL.md should be copied
      const skillPath = path.join(projectDir, ".skills", "react-setup", "SKILL.md");
      expect(await fs.pathExists(skillPath)).toBe(true);

      const content = await fs.readFile(skillPath, "utf8");
      expect(content).toContain("React Setup");

      // INDEX.md should be generated
      const indexPath = path.join(projectDir, ".skills", "INDEX.md");
      expect(await fs.pathExists(indexPath)).toBe(true);

      const indexContent = await fs.readFile(indexPath, "utf8");
      expect(indexContent).toContain("react-setup");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("syncs multiple skills and generates INDEX.md", async () => {
    const projectDir = setupFakeProject({
      skills: {
        "react-setup": {
          skillMd: "# Skill: React\n> @skillsforllms/react-setup · v1.0.0 · Category: Web\n## Purpose\nReact."
        },
        "auth-setup": {
          skillMd: "# Skill: Auth\n> @skillsforllms/auth-setup · v1.0.0 · Category: Security\n## Purpose\nAuth."
        }
      }
    });

    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      await syncCommand([], { quiet: true });

      expect(await fs.pathExists(path.join(projectDir, ".skills", "react-setup", "SKILL.md"))).toBe(true);
      expect(await fs.pathExists(path.join(projectDir, ".skills", "auth-setup", "SKILL.md"))).toBe(true);

      const indexContent = await fs.readFile(path.join(projectDir, ".skills", "INDEX.md"), "utf8");
      expect(indexContent).toContain("auth-setup");
      expect(indexContent).toContain("react-setup");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("skips skills without SKILL.md", async () => {
    const projectDir = setupFakeProject({
      skills: {
        "missing-skill": {} // no skillMd
      }
    });

    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      await syncCommand([], { quiet: true });

      const skillDir = path.join(projectDir, ".skills", "missing-skill");
      expect(await fs.pathExists(skillDir)).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("copies examples when --examples flag is set", async () => {
    const projectDir = setupFakeProject({
      skills: {
        "with-examples": {
          skillMd: "# Skill: Examples\n> @skillsforllms/with-examples · v1.0.0 · Category: Test\n## Purpose\nTest.",
          hasExamples: true
        }
      }
    });

    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      await syncCommand([], { quiet: true, examples: true });

      const exPath = path.join(projectDir, ".skills", "with-examples", "examples", "basic", "README.md");
      expect(await fs.pathExists(exPath)).toBe(true);

      const content = await fs.readFile(exPath, "utf8");
      expect(content).toContain("with-examples");
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("does not copy examples when flag is not set", async () => {
    const projectDir = setupFakeProject({
      skills: {
        "with-examples": {
          skillMd: "# Skill: Examples\n> @skillsforllms/with-examples · v1.0.0 · Category: Test\n## Purpose\nTest.",
          hasExamples: true
        }
      }
    });

    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      await syncCommand([], { quiet: true, examples: false });

      const exPath = path.join(projectDir, ".skills", "with-examples", "examples");
      expect(await fs.pathExists(exPath)).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("syncs a specific package when passed as argument", async () => {
    const projectDir = setupFakeProject({
      skills: {
        "react-setup": {
          skillMd: "# Skill: React\n> @skillsforllms/react-setup · v1.0.0 · Category: Web\n## Purpose\nReact."
        },
        "auth-setup": {
          skillMd: "# Skill: Auth\n> @skillsforllms/auth-setup · v1.0.0 · Category: Security\n## Purpose\nAuth."
        }
      }
    });

    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      await syncCommand(["@skillsforllms/react-setup"], { quiet: true });

      expect(await fs.pathExists(path.join(projectDir, ".skills", "react-setup", "SKILL.md"))).toBe(true);
      // auth-setup was not requested so should not be synced (unless discovered via node_modules scan)
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("uses custom outputDir from options", async () => {
    const projectDir = setupFakeProject({
      skills: {
        "react-setup": {
          skillMd: "# Skill: React\n> @skillsforllms/react-setup · v1.0.0 · Category: Web\n## Purpose\nReact."
        }
      }
    });

    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      await syncCommand([], { quiet: true, dir: ".ai-context" });

      const skillPath = path.join(projectDir, ".ai-context", "react-setup", "SKILL.md");
      expect(await fs.pathExists(skillPath)).toBe(true);

      // Default .skills/ should not exist
      expect(await fs.pathExists(path.join(projectDir, ".skills"))).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it("handles empty project with no skill packages", async () => {
    const projectDir = setupFakeProject({ skills: {} });

    const originalCwd = process.cwd();
    process.chdir(projectDir);

    try {
      // Should not throw
      await syncCommand([], { quiet: true });

      // .skills directory may or may not exist, but no errors
    } finally {
      process.chdir(originalCwd);
    }
  });
});

/* ========================================================================
 * CLI Export Verification
 * ====================================================================== */

describe("cli exports", () => {
  it("exports syncCommand as a function", () => {
    expect(typeof syncCommand).toBe("function");
  });
});

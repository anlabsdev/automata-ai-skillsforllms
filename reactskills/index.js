/**
 * @skillsforllms/reactskills
 *
 * Production-ready React.js skills for LLM agents.
 * Each skill is a Markdown instruction file that teaches AI agents
 * how to write idiomatic, production-grade React code.
 *
 * Usage:
 *   const reactSkills = require("@skillsforllms/reactskills");
 *
 *   // List all available skills
 *   console.log(reactSkills.list());
 *
 *   // Get a specific skill's content
 *   const content = reactSkills.getSkill("component-patterns");
 *
 *   // Get all skill contents as an object
 *   const all = reactSkills.getAllSkills();
 */

const fs = require("fs");
const path = require("path");

const SKILLS_DIR = path.join(__dirname, "skills");

/**
 * Available skill identifiers mapped to their file names.
 */
const SKILL_MAP = {
  "component-patterns": "component-patterns.md",
  "hooks-mastery": "hooks-mastery.md",
  "state-management": "state-management.md",
  "routing-navigation": "routing-navigation.md",
  "forms-validation": "forms-validation.md",
  "testing-strategy": "testing-strategy.md",
  "performance-optimization": "performance-optimization.md",
  "project-structure": "project-structure.md",
};

/**
 * List all available skill names.
 * @returns {string[]} Array of skill identifiers.
 */
function list() {
  return Object.keys(SKILL_MAP);
}

/**
 * Get the Markdown content of a specific skill.
 * @param {string} skillName - One of the identifiers from list().
 * @returns {string} The skill Markdown content.
 * @throws {Error} If the skill name is not recognized.
 */
function getSkill(skillName) {
  const fileName = SKILL_MAP[skillName];
  if (!fileName) {
    throw new Error(
      `Unknown skill "${skillName}". Available: ${list().join(", ")}`
    );
  }
  return fs.readFileSync(path.join(SKILLS_DIR, fileName), "utf-8");
}

/**
 * Get all skills as an object keyed by skill name.
 * @returns {Record<string, string>} All skill contents.
 */
function getAllSkills() {
  const result = {};
  for (const name of list()) {
    result[name] = getSkill(name);
  }
  return result;
}

/**
 * Get metadata about the package.
 * @returns {{ name: string, version: string, skillCount: number, skills: string[] }}
 */
function info() {
  const pkg = require("./package.json");
  return {
    name: pkg.name,
    version: pkg.version,
    skillCount: list().length,
    skills: list(),
  };
}

module.exports = { list, getSkill, getAllSkills, info };

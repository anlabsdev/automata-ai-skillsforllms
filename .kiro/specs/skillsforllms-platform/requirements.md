# Requirements Document

## Introduction

SkillsForLLMs is an npm-based ecosystem that lets developers install AI "skills" (structured `SKILL.md` files containing project conventions, best practices, and patterns) into any project so that AI coding agents (Claude, Cursor, GitHub Copilot, Continue.dev, and others) can read them and apply consistent guidance when generating code.

The platform consists of seven cooperating components: (1) a contract for skill packages published on npm under the `@skills/*` scope, (2) a `skillsforllms` CLI that syncs installed skill packages into a project's `.skills/` folder, (3) a canonical `SKILL.md` specification, (4) agent-specific output adapters (Cursor, Copilot, Claude, Continue), (5) a `create-skill` scaffolding tool, (6) a registry website at `skillsforllms.dev` with a browseable catalog and live npm download stats, and (7) a publishing pipeline plus community submission flow for third-party authors.

This document captures the functional and quality requirements for the platform's launch scope, including five seed skill packages: `@skills/react-setup`, `@skills/nextjs-setup`, `@skills/node-rest-api`, `@skills/firebase-setup`, and `@skills/auth-setup`.

## Glossary

- **SkillsForLLMs_Platform**: The complete ecosystem comprising the CLI, skill package contract, scaffolding tool, registry website, and publishing pipeline.
- **Skill_Package**: An npm package whose primary payload is a `SKILL.md` file, published under the `@skills/*` scope or a community scope (`@username/skill-*`, `@org/skill-*`).
- **SKILL.md**: A markdown file inside a Skill_Package, written for AI agents, that follows the canonical SkillsForLLMs SKILL.md specification.
- **CLI**: The `skillsforllms` npm package providing the command-line tool with subcommands `init`, `sync`, `list`, `info`, `check`, and `validate`.
- **Sync_Command**: The `skillsforllms sync` subcommand of the CLI that copies `SKILL.md` files from installed Skill_Packages into the project's output directory.
- **Validator**: The `skillsforllms validate` subcommand of the CLI that checks a `SKILL.md` file against the SKILL.md specification.
- **Adapter**: A CLI output mode (`cursor`, `copilot`, `claude`, `continue`) that writes synced skill content into agent-specific files.
- **Output_Directory**: The folder where the Sync_Command writes synced skills. Default is `.skills/` in the project root, configurable via the Config_File.
- **Config_File**: A project-level configuration file named `skillsforllms.config.json` (or `.skillsrc`) that controls Output_Directory, adapters, auto-sync, and example inclusion.
- **Scaffolder**: The `create-skill` npm package, invoked as `npx create-skill`, that bootstraps a new Skill_Package folder.
- **Registry_Website**: The public website at `skillsforllms.dev` providing a landing page, browseable catalog, search, skill detail pages, and documentation.
- **Registry_Index**: The JSON dataset (`registry/index.json` and per-skill JSON files) that powers the Registry_Website, generated from each Skill_Package's `package.json`.
- **Publishing_Pipeline**: The GitHub Actions workflows that lint, validate, test, version, publish to npm, regenerate the Registry_Index, and deploy the Registry_Website.
- **Monorepo**: The pnpm + Turborepo + Changesets repository housing the CLI, core utilities, Scaffolder, seed Skill_Packages, and Registry_Website source.
- **Community_Submission_Flow**: The PR-based process by which third-party Skill_Package authors add their package metadata to the official Registry_Index.
- **Seed_Skills**: The five Skill_Packages shipped at launch: `@skills/react-setup`, `@skills/nextjs-setup`, `@skills/node-rest-api`, `@skills/firebase-setup`, and `@skills/auth-setup`.
- **Required_Sections**: The four SKILL.md sections that MUST be present: Purpose, When to Use, Key Conventions, Anti-Patterns.
- **Recommended_Sections**: The six SKILL.md sections whose presence is recommended but not mandatory: Tech Stack, Project Structure, Step-by-Step, File Templates, Examples, Changelog.
- **Validation_Score**: An integer count produced by the Validator equal to the number of Required_Sections present in a SKILL.md file, with a maximum of 4.
- **Auto_Sync_Hook**: An optional `postinstall` script in a Skill_Package or in the user project that triggers the Sync_Command after `npm install`.

## Requirements

### Requirement 1: Skill Package Contract

**User Story:** As a skill author, I want a clear contract for what an `@skills/*` npm package must contain, so that my package works correctly with the CLI and the Registry_Website.

#### Acceptance Criteria

1. THE Skill_Package SHALL include a `package.json` file at the package root.
2. THE Skill_Package SHALL include a `SKILL.md` file at the package root.
3. THE Skill_Package SHALL include a `README.md` file at the package root.
4. THE `package.json` of a Skill_Package SHALL declare a `name` field that matches one of the patterns `@skills/<kebab-case-name>`, `@<username>/skill-<kebab-case-name>`, or `@<org>/skill-<kebab-case-name>`.
5. THE `package.json` of a Skill_Package SHALL declare a `version` field that conforms to Semantic Versioning 2.0.0.
6. THE `package.json` of a Skill_Package SHALL declare a `description` field with a non-empty string value.
7. THE `package.json` of a Skill_Package SHALL declare a `keywords` field that is a non-empty array of strings and includes the literal string `skillsforllms`.
8. THE `package.json` of a Skill_Package SHALL declare a `license` field with a non-empty string value.
9. THE `package.json` of a Skill_Package SHALL declare a `files` field that is an array including the entries `SKILL.md` and `README.md`.
10. THE `package.json` of a Skill_Package SHALL declare a top-level `skillsforllms` metadata object containing the fields `category` (string), `tags` (array of strings), and `compatibleAgents` (array of strings).
11. WHERE the Skill_Package ships example projects, THE Skill_Package SHALL place them under an `examples/` directory at the package root and include `examples/` in the `package.json` `files` array.
12. THE `package.json` of a Skill_Package SHALL NOT declare a `main` field, a `module` field, or any executable entry point, because Skill_Packages contain documentation only.
13. WHERE the Skill_Package author opts into Auto_Sync_Hook behavior, THE Skill_Package SHALL declare a `postinstall` script that invokes `skillsforllms` auto-sync logic and SHALL declare `skillsforllms` as an optional peer dependency.

### Requirement 2: SKILL.md Specification

**User Story:** As an AI agent or skill author, I want a canonical SKILL.md format, so that AI agents can reliably parse skills and skill authors know exactly what to write.

#### Acceptance Criteria

1. THE SKILL.md file SHALL begin with a level-1 markdown heading of the form `# Skill: <Skill Title>`.
2. THE SKILL.md file SHALL include a metadata blockquote line directly after the level-1 heading containing the package name, version, and category, separated by the middle-dot character (`·`).
3. THE SKILL.md file SHALL include a `## Purpose` section as a Required_Section.
4. THE SKILL.md file SHALL include a `## When to Use This Skill` section as a Required_Section.
5. THE SKILL.md file SHALL include a `## Key Conventions` section as a Required_Section.
6. THE SKILL.md file SHALL include a `## Anti-Patterns` section as a Required_Section.
7. WHERE the skill defines a recommended technology stack, THE SKILL.md file SHALL include a `## Tech Stack Decisions` section.
8. WHERE the skill defines a canonical folder layout, THE SKILL.md file SHALL include a `## Project Structure` section.
9. WHERE the skill defines an ordered procedure for the AI agent, THE SKILL.md file SHALL include a `## Step-by-Step Agent Instructions` section.
10. WHERE the skill provides starter file content, THE SKILL.md file SHALL include a `## File Templates` section.
11. WHERE the skill references example projects, THE SKILL.md file SHALL include an `## Examples` section.
12. WHERE the skill has been versioned, THE SKILL.md file SHALL include a `## Changelog` section listing each released version.
13. THE SKILL.md file SHALL be encoded as UTF-8.
14. THE SKILL.md file SHALL be valid CommonMark markdown.

### Requirement 3: SKILL.md Validator

**User Story:** As a skill author, I want to validate my SKILL.md before publishing, so that I catch missing sections and structural problems early.

#### Acceptance Criteria

1. THE Validator SHALL accept a path to a SKILL.md file as a positional command-line argument.
2. WHEN the Validator is invoked with a path that does not exist, THEN THE Validator SHALL print an error message identifying the missing path and SHALL exit with a non-zero exit code.
3. WHEN the Validator is invoked with a path to a file that is not valid UTF-8, THEN THE Validator SHALL print an error message identifying the encoding problem and SHALL exit with a non-zero exit code.
4. WHEN the Validator is invoked on a SKILL.md file, THE Validator SHALL check for the presence of each Required_Section and print one line per section indicating presence or absence.
5. WHEN the Validator is invoked on a SKILL.md file, THE Validator SHALL check for the presence of each Recommended_Section and print one line per section indicating presence or absence.
6. THE Validator SHALL print a final Validation_Score line of the form `Score: <n>/4` where `<n>` is the count of Required_Sections present.
7. IF any Required_Section is missing from the SKILL.md file, THEN THE Validator SHALL exit with a non-zero exit code.
8. IF all Required_Sections are present in the SKILL.md file, THEN THE Validator SHALL exit with exit code 0.
9. THE Validator SHALL detect Required_Sections by matching level-2 markdown headings against the canonical section titles defined in Requirement 2, treating heading text as case-insensitive after normalizing whitespace.

### Requirement 4: CLI Initialization Command

**User Story:** As a developer, I want to initialize SkillsForLLMs in my project, so that I have a Config_File and the recommended directory structure ready.

#### Acceptance Criteria

1. THE CLI SHALL provide an `init` subcommand invoked as `skillsforllms init`.
2. WHEN the `init` subcommand is invoked in a directory that contains a `package.json`, THE CLI SHALL create a `skillsforllms.config.json` file in that directory with default values for `outputDir`, `includeExamples`, `autoSync`, and `agents`.
3. WHEN the `init` subcommand is invoked in a directory that does not contain a `package.json`, THEN THE CLI SHALL print an error explaining that `init` must be run inside an npm project and SHALL exit with a non-zero exit code.
4. IF a `skillsforllms.config.json` file already exists in the target directory, THEN THE CLI SHALL print a warning, leave the existing file unchanged, and exit with exit code 0.
5. WHEN the `init` subcommand creates a Config_File, THE CLI SHALL set `outputDir` to the string `.skills` by default.
6. WHEN the `init` subcommand creates a Config_File, THE CLI SHALL set `includeExamples` to `false` by default.

### Requirement 5: CLI Sync Command

**User Story:** As a developer, I want to run `npx skillsforllms sync` and have all installed skill packages copied into my project's `.skills/` folder, so that my AI agent can read them.

#### Acceptance Criteria

1. THE CLI SHALL provide a `sync` subcommand invoked as `skillsforllms sync`.
2. WHEN the `sync` subcommand is invoked with no positional arguments, THE Sync_Command SHALL discover all packages under `node_modules/@skills/` and all packages declared in `package.json` `dependencies` or `devDependencies` whose name matches a Skill_Package name pattern from Requirement 1.4.
3. WHEN the `sync` subcommand is invoked with one or more positional package-name arguments, THE Sync_Command SHALL restrict syncing to those named packages only.
4. IF the `node_modules/` directory does not exist in the project, THEN THE Sync_Command SHALL print an error instructing the user to run `npm install` and SHALL exit with a non-zero exit code.
5. WHEN the Sync_Command processes a discovered Skill_Package, THE Sync_Command SHALL copy the package's `SKILL.md` to `<Output_Directory>/<skill-short-name>/SKILL.md`, where `<skill-short-name>` is the package name with the scope and any `skill-` prefix stripped.
6. IF a discovered Skill_Package does not contain a `SKILL.md` file, THEN THE Sync_Command SHALL print a warning identifying the package and SHALL continue processing remaining packages.
7. WHEN the Sync_Command is invoked with the `--examples` flag or when the Config_File `includeExamples` field is `true`, THE Sync_Command SHALL copy the Skill_Package's `examples/` directory to `<Output_Directory>/<skill-short-name>/examples/` if that directory exists in the package.
8. WHEN the Sync_Command finishes processing all packages, THE Sync_Command SHALL write an `INDEX.md` file in the Output_Directory containing a markdown list of every synced skill with relative links to each `SKILL.md`.
9. WHEN the Sync_Command is invoked with the `--dir <path>` flag, THE Sync_Command SHALL use `<path>` as the Output_Directory instead of the default.
10. WHEN the Sync_Command is invoked with the `--adapter <name>` flag where `<name>` is one of `cursor`, `copilot`, `claude`, or `continue`, THE Sync_Command SHALL invoke the corresponding Adapter after copying SKILL.md files.
11. THE Sync_Command SHALL print one summary line per processed package indicating success or failure status, package name, and resolved version.
12. THE Sync_Command SHALL print a final summary line with the count of successfully synced skills and the count of skipped packages.
13. IF the Sync_Command encounters an error reading or writing any individual Skill_Package, THEN THE Sync_Command SHALL log the error, mark that package as failed, and continue processing remaining packages.
14. WHEN the Sync_Command completes with at least one successfully synced skill, THE Sync_Command SHALL exit with exit code 0.
15. WHEN the Sync_Command is invoked twice in succession with the same inputs and unchanged Skill_Packages, THE Output_Directory contents SHALL be identical between invocations (idempotent sync).

### Requirement 6: CLI List Command

**User Story:** As a developer, I want to list all skills currently synced into my project, so that I know which conventions my AI agent has access to.

#### Acceptance Criteria

1. THE CLI SHALL provide a `list` subcommand invoked as `skillsforllms list`.
2. WHEN the `list` subcommand is invoked, THE CLI SHALL enumerate every immediate subdirectory of the Output_Directory that contains a `SKILL.md` file.
3. WHEN the `list` subcommand prints results, THE CLI SHALL display, for each enumerated skill, the skill short name, the resolved package name, and the version read from the corresponding installed package's `package.json`.
4. IF the Output_Directory does not exist, THEN THE `list` subcommand SHALL print a message indicating no skills are synced and SHALL exit with exit code 0.

### Requirement 7: CLI Info Command

**User Story:** As a developer, I want to inspect a specific skill's metadata and structure, so that I can decide whether to apply it.

#### Acceptance Criteria

1. THE CLI SHALL provide an `info` subcommand invoked as `skillsforllms info <package-name>`.
2. WHEN the `info` subcommand is invoked with a package name that resolves to an installed Skill_Package, THE CLI SHALL print the package name, version, description, category, tags, compatible agents, and the list of section headings detected in the SKILL.md.
3. IF the named package is not installed in `node_modules/`, THEN THE `info` subcommand SHALL print an error identifying the missing package and SHALL exit with a non-zero exit code.

### Requirement 8: CLI Check Command

**User Story:** As a developer, I want to check whether any installed skills have newer versions available, so that I can keep my project up to date.

#### Acceptance Criteria

1. THE CLI SHALL provide a `check` subcommand invoked as `skillsforllms check`.
2. WHEN the `check` subcommand is invoked, THE CLI SHALL query the npm registry for the latest published version of each installed Skill_Package.
3. WHEN the `check` subcommand has retrieved registry data, THE CLI SHALL print, for each installed Skill_Package, the package name, the installed version, the latest published version, and a marker indicating whether an update is available.
4. IF the npm registry is unreachable when the `check` subcommand runs, THEN THE CLI SHALL print an error describing the network failure and SHALL exit with a non-zero exit code.
5. WHEN the `check` subcommand finishes successfully, THE CLI SHALL exit with exit code 0 regardless of whether updates are available.

### Requirement 9: Cursor Adapter

**User Story:** As a Cursor user, I want synced skills to be automatically appended to my `.cursorrules` file, so that Cursor reads them as part of its rules.

#### Acceptance Criteria

1. WHEN the Sync_Command is invoked with `--adapter cursor`, THE Cursor Adapter SHALL produce a `.cursorrules` file at the project root.
2. WHEN the Cursor Adapter writes the `.cursorrules` file, THE Cursor Adapter SHALL include a delimiting marker section that identifies the auto-generated content.
3. WHEN the Cursor Adapter writes the `.cursorrules` file and a `.cursorrules` file already exists, THE Cursor Adapter SHALL preserve any content outside the delimiting marker section and replace only the auto-generated section.
4. WHEN the Cursor Adapter writes the `.cursorrules` file, THE Cursor Adapter SHALL concatenate the SKILL.md content of every successfully synced skill, preceded by a level-2 heading identifying the skill short name.

### Requirement 10: Copilot Adapter

**User Story:** As a GitHub Copilot user, I want synced skills written to `.github/copilot-instructions.md`, so that Copilot reads them automatically.

#### Acceptance Criteria

1. WHEN the Sync_Command is invoked with `--adapter copilot`, THE Copilot Adapter SHALL create the `.github/` directory if it does not exist.
2. WHEN the Copilot Adapter runs, THE Copilot Adapter SHALL write a `.github/copilot-instructions.md` file containing a header noting auto-generation followed by the concatenated SKILL.md content of every successfully synced skill.
3. WHEN the Copilot Adapter writes its output file, THE Copilot Adapter SHALL replace any prior content of `.github/copilot-instructions.md` produced by a previous Copilot Adapter run.

### Requirement 11: Claude Adapter

**User Story:** As a Claude user, I want a single consolidated markdown file I can upload to Claude Projects, so that Claude has all my skills as project knowledge.

#### Acceptance Criteria

1. WHEN the Sync_Command is invoked with `--adapter claude`, THE Claude Adapter SHALL write a single consolidated markdown file at `<Output_Directory>/CLAUDE_PROJECT.md`.
2. WHEN the Claude Adapter writes its consolidated file, THE Claude Adapter SHALL include a top-level heading, a generated-on date, and the full SKILL.md content of every successfully synced skill separated by horizontal rules.

### Requirement 12: Continue.dev Adapter

**User Story:** As a Continue.dev user, I want synced skills placed in `.continue/context/`, so that Continue picks them up as context files.

#### Acceptance Criteria

1. WHEN the Sync_Command is invoked with `--adapter continue`, THE Continue Adapter SHALL create the `.continue/context/` directory if it does not exist.
2. WHEN the Continue Adapter runs, THE Continue Adapter SHALL copy each successfully synced `SKILL.md` to `.continue/context/<skill-short-name>.md`.

### Requirement 13: Configuration File

**User Story:** As a developer, I want a project-level Config_File, so that my team shares the same SkillsForLLMs settings.

#### Acceptance Criteria

1. THE CLI SHALL recognize a Config_File named `skillsforllms.config.json` at the project root.
2. WHEN both `skillsforllms.config.json` and `.skillsrc` exist in the project root, THE CLI SHALL prefer `skillsforllms.config.json` and SHALL print a warning identifying the duplication.
3. THE Config_File SHALL accept an `outputDir` field of type string.
4. THE Config_File SHALL accept an `includeExamples` field of type boolean.
5. THE Config_File SHALL accept an `autoSync` field of type boolean.
6. THE Config_File SHALL accept an `agents` field of type object whose keys are adapter names from Requirement 5.10 and whose values are booleans indicating whether each adapter is enabled.
7. WHEN a CLI flag and a Config_File field disagree on the same setting, THE CLI flag SHALL take precedence.
8. IF the Config_File contains JSON that fails to parse, THEN THE CLI SHALL print an error identifying the parse failure and SHALL exit with a non-zero exit code.
9. IF the Config_File contains a field with a value of an unexpected type, THEN THE CLI SHALL print an error identifying the offending field and SHALL exit with a non-zero exit code.

### Requirement 14: Scaffolder (`create-skill`)

**User Story:** As a prospective skill author, I want to bootstrap a new Skill_Package with one command, so that I do not have to assemble the boilerplate by hand.

#### Acceptance Criteria

1. THE Scaffolder SHALL be invokable as `npx create-skill` and as `npm create skill`.
2. WHEN the Scaffolder runs, THE Scaffolder SHALL prompt the user for skill name, npm scope, category, description, and author.
3. WHEN the user provides a skill name, THE Scaffolder SHALL validate that the name is non-empty and matches kebab-case (lowercase letters, digits, and hyphens only).
4. IF the user provides a skill name that fails validation, THEN THE Scaffolder SHALL re-prompt with an explanation of the rule.
5. WHEN the Scaffolder has collected all answers, THE Scaffolder SHALL create a directory named `skill-<skill-name>` in the current working directory.
6. WHEN the Scaffolder creates the package directory, THE Scaffolder SHALL generate a `package.json` that satisfies all requirements in Requirement 1.
7. WHEN the Scaffolder creates the package directory, THE Scaffolder SHALL generate a `SKILL.md` template containing all Required_Sections from Requirement 2 with placeholder content.
8. WHEN the Scaffolder creates the package directory, THE Scaffolder SHALL generate a `README.md` and an `examples/basic/` placeholder directory.
9. IF the target directory `skill-<skill-name>` already exists in the current working directory, THEN THE Scaffolder SHALL print an error and SHALL exit with a non-zero exit code without overwriting any files.

### Requirement 15: Seed Skill Packages

**User Story:** As a launch user, I want a curated set of high-quality skills available on day one, so that I can install useful conventions immediately.

#### Acceptance Criteria

1. THE SkillsForLLMs_Platform SHALL ship the Skill_Package `@skills/react-setup` covering React + Vite + TypeScript + Tailwind conventions.
2. THE SkillsForLLMs_Platform SHALL ship the Skill_Package `@skills/nextjs-setup` covering Next.js project conventions.
3. THE SkillsForLLMs_Platform SHALL ship the Skill_Package `@skills/node-rest-api` covering Node.js REST API conventions.
4. THE SkillsForLLMs_Platform SHALL ship the Skill_Package `@skills/firebase-setup` covering Firebase project conventions.
5. THE SkillsForLLMs_Platform SHALL ship the Skill_Package `@skills/auth-setup` covering authentication and authorization conventions.
6. EACH Seed_Skill SHALL satisfy every requirement in Requirement 1.
7. EACH Seed_Skill SHALL include a `SKILL.md` that satisfies every requirement in Requirement 2.
8. EACH Seed_Skill SHALL pass the Validator with a Validation_Score of 4 of 4.
9. EACH Seed_Skill SHALL include at least one example project under `examples/`.

### Requirement 16: Monorepo Structure

**User Story:** As a contributor, I want a well-organized monorepo, so that I can locate and modify the CLI, core utilities, scaffolder, seed skills, and website without ambiguity.

#### Acceptance Criteria

1. THE Monorepo SHALL use pnpm workspaces declared in `pnpm-workspace.yaml`.
2. THE Monorepo SHALL use Turborepo for task orchestration declared in `turbo.json`.
3. THE Monorepo SHALL use Changesets for versioning, configured in `.changeset/`.
4. THE Monorepo SHALL contain a `packages/cli/` workspace producing the `skillsforllms` npm package.
5. THE Monorepo SHALL contain a `packages/core/` workspace producing shared utilities consumed by the CLI and the Scaffolder.
6. THE Monorepo SHALL contain a `packages/create-skill/` workspace producing the Scaffolder npm package.
7. THE Monorepo SHALL contain a `skills/` directory with one subdirectory per Seed_Skill.
8. THE Monorepo SHALL contain a `website/` workspace housing the Registry_Website source.
9. THE Monorepo SHALL contain a `registry/` directory housing the Registry_Index data files.

### Requirement 17: Registry Website

**User Story:** As a developer evaluating SkillsForLLMs, I want a public registry website where I can browse, search, and learn about available skills, so that I can choose what to install.

#### Acceptance Criteria

1. THE Registry_Website SHALL be hosted at the domain `skillsforllms.dev`.
2. THE Registry_Website SHALL serve a landing page at the root path `/` based on the existing `index_2.html` design.
3. THE Registry_Website SHALL serve a catalog page at `/skills` that lists every entry in the Registry_Index.
4. THE Registry_Website SHALL serve a skill detail page at `/skills/<package-short-name>` for every entry in the Registry_Index.
5. THE Registry_Website SHALL serve a documentation section at `/docs` containing at minimum a getting-started page, the SKILL.md specification, and an authoring guide at `/docs/authoring`.
6. THE Registry_Website SHALL provide a search input on the catalog page that filters entries by name, tag, category, and description.
7. WHEN a visitor enters a query into the catalog search input, THE Registry_Website SHALL update the displayed entries within 200 milliseconds for a Registry_Index of up to 1000 entries.
8. THE Registry_Website SHALL display, on each skill card and skill detail page, a live weekly download count fetched from the npm registry endpoint `https://api.npmjs.org/downloads/point/last-week/<package-name>`.
9. IF the npm download endpoint returns an error or no data for a Skill_Package, THEN THE Registry_Website SHALL display a placeholder value of `—` for that package's download count and SHALL NOT block rendering of the rest of the page.
10. THE Registry_Website SHALL be deployable to Vercel through the Publishing_Pipeline.

### Requirement 18: Registry Index Generation

**User Story:** As a maintainer, I want the Registry_Index to be auto-generated from each Skill_Package's `package.json`, so that registry data does not drift from package metadata.

#### Acceptance Criteria

1. THE Publishing_Pipeline SHALL include a step that regenerates `registry/index.json` and `registry/skills/<package-short-name>.json` from each Skill_Package's `package.json`.
2. WHEN the Registry_Index is regenerated, THE generated `registry/skills/<package-short-name>.json` SHALL include the fields `name`, `package`, `version`, `category`, `description`, `tags`, `author`, and `compatibleAgents`.
3. WHEN the Registry_Index is regenerated and a Skill_Package is missing a required field from Requirement 18.2, THEN THE generation step SHALL fail with a non-zero exit code identifying the offending package and field.
4. WHEN the Registry_Index has been regenerated, THE Publishing_Pipeline SHALL commit the updated files back to the `main` branch as part of the release workflow.

### Requirement 19: Continuous Integration Pipeline

**User Story:** As a maintainer, I want every pull request to be automatically linted, type-checked, validated, and tested, so that broken changes do not reach `main`.

#### Acceptance Criteria

1. THE Publishing_Pipeline SHALL include a `ci.yml` GitHub Actions workflow that runs on every pull request targeting `main`.
2. THE `ci.yml` workflow SHALL run ESLint over all workspaces and SHALL fail if ESLint reports any error.
3. THE `ci.yml` workflow SHALL run TypeScript type-checking over all TypeScript workspaces and SHALL fail if type-checking reports any error.
4. THE `ci.yml` workflow SHALL run the Validator against the SKILL.md of every Skill_Package in `skills/` and SHALL fail if any Skill_Package fails validation.
5. THE `ci.yml` workflow SHALL run the test suite for `packages/cli/`, `packages/core/`, and `packages/create-skill/` and SHALL fail if any test fails.

### Requirement 20: Release Pipeline

**User Story:** As a maintainer, I want merges to `main` to automatically publish updated packages and deploy the website, so that releases are reliable and reproducible.

#### Acceptance Criteria

1. THE Publishing_Pipeline SHALL include a `release.yml` GitHub Actions workflow that runs on every push to `main`.
2. THE `release.yml` workflow SHALL use Changesets to determine which packages have version bumps pending.
3. WHEN Changesets identifies one or more pending version bumps, THE `release.yml` workflow SHALL build the affected packages, publish them to the npm registry under the `@skills/` scope or the package's declared scope, and update package versions in the Monorepo.
4. WHEN one or more Skill_Packages are published, THE `release.yml` workflow SHALL regenerate the Registry_Index per Requirement 18.
5. WHEN the Registry_Index has been regenerated, THE `release.yml` workflow SHALL trigger a deployment of the Registry_Website to Vercel.
6. IF npm publication of any package fails, THEN THE `release.yml` workflow SHALL fail with a non-zero exit code, SHALL NOT proceed to website deployment, and SHALL leave the Monorepo in a consistent state.
7. THE `release.yml` workflow SHALL authenticate to npm using a repository secret named `NPM_TOKEN`.

### Requirement 21: Community Submission Flow

**User Story:** As a third-party skill author, I want a clear path to get my published skill listed on the official Registry_Website, so that other developers can discover my work.

#### Acceptance Criteria

1. THE Community_Submission_Flow SHALL be initiated by a pull request that adds an entry to `registry/index.json` describing a third-party Skill_Package.
2. THE Community_Submission_Flow SHALL require the third-party Skill_Package to be published to the public npm registry prior to the PR being merged.
3. THE Community_Submission_Flow SHALL include an automated CI check that resolves the submitted package from npm and runs the Validator against its `SKILL.md`.
4. IF the automated CI check fails for a community submission, THEN THE pull request SHALL be blocked from merging until the failure is resolved.
5. THE Community_Submission_Flow SHALL require manual approval from a designated repository maintainer team before the PR can be merged.
6. WHEN a Community_Submission PR is merged into `main`, THE Publishing_Pipeline SHALL include the new entry in the next Registry_Index regeneration and Registry_Website deployment.
7. THE Community_Submission_Flow SHALL document the supported community package name patterns `@<username>/skill-<name>` and `@<org>/skill-<name>` in the authoring guide at `/docs/authoring`.

### Requirement 22: Auto-Sync Behavior

**User Story:** As a developer, I want skills to sync automatically after `npm install`, so that I do not have to remember to run `npx skillsforllms sync`.

#### Acceptance Criteria

1. WHERE a Skill_Package declares an Auto_Sync_Hook in its `postinstall` script, THE Skill_Package SHALL invoke the auto-sync entry point of the `skillsforllms` CLI in a way that fails silently if the CLI is not installed.
2. WHERE the user project Config_File sets `autoSync` to `true` and the user project declares `skillsforllms` in `dependencies` or `devDependencies`, THE auto-sync entry point SHALL invoke the Sync_Command with the project's configured options after `npm install` completes.
3. WHEN the auto-sync entry point is invoked but the CLI cannot resolve the project root (no `package.json` found by walking up parent directories), THEN THE auto-sync entry point SHALL exit with code 0 without making any filesystem changes.
4. WHEN the auto-sync entry point runs the Sync_Command, THE auto-sync entry point SHALL respect the same Config_File and CLI defaults defined in Requirements 5 and 13.

### Requirement 23: CLI Cross-Platform Support

**User Story:** As a developer on macOS, Linux, or Windows, I want the CLI to work the same on every operating system, so that my team gets consistent results regardless of platform.

#### Acceptance Criteria

1. THE CLI SHALL run on Node.js version 18 or later.
2. THE CLI SHALL run on macOS, Linux, and Windows.
3. THE CLI SHALL construct file system paths using the platform-appropriate path separator on every supported operating system.
4. THE CLI SHALL produce identical Output_Directory contents (excluding line-ending differences in INDEX.md) when run on macOS, Linux, and Windows against the same set of installed Skill_Packages.

### Requirement 24: CLI Error Handling and Logging

**User Story:** As a developer running the CLI, I want clear, actionable error messages when something goes wrong, so that I can diagnose problems without reading the source.

#### Acceptance Criteria

1. WHEN any CLI subcommand encounters an unexpected exception, THE CLI SHALL print a single human-readable error message identifying the failed operation and SHALL exit with a non-zero exit code.
2. WHEN any CLI subcommand is invoked with a `--verbose` flag, THE CLI SHALL print the full stack trace for any unexpected exception in addition to the human-readable error message.
3. WHEN the CLI prints status output during normal operation, THE CLI SHALL prefix success lines with a check character, warning lines with a warning character, and error lines with a cross character.
4. WHEN the CLI is invoked with a `--quiet` flag, THE CLI SHALL suppress all non-error output and SHALL print only error messages.

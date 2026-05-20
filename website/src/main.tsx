import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Code2,
  Github,
  Layers,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
  Terminal,
  X
} from "lucide-react";
import registry from "../../registry/index.json";
import "./styles.css";

type Skill = {
  name: string;
  package: string;
  version: string;
  category: string;
  description: string;
  tags: string[];
  author: string;
  compatibleAgents: string[];
  shortName: string;
};

const skills = registry.skills as Skill[];
const githubRepo = "https://github.com/anlabsdev/automata-ai-skillsforllms";
const githubOwner = "https://github.com/anlabsdev";
const githubLabel = "anlabsdev / automata-ai-skillsforllms";

const categoryLabels: Record<string, string> = {
  all: "All",
  web: "Web",
  backend: "Backend",
  security: "DevOps / Auth"
};

function App() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [toast, setToast] = useState("");

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(skills.map((skill) => skill.category)))];
  }, []);

  const filteredSkills = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return skills.filter((skill) => {
      const matchesCategory = category === "all" || skill.category === category;
      const searchable = [
        skill.name,
        skill.package,
        skill.description,
        skill.category,
        ...skill.tags
      ].join(" ").toLowerCase();

      return matchesCategory && (!needle || searchable.includes(needle));
    });
  }, [category, query]);

  async function copy(value: string) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
    setToast(`Copied: ${value.split("\n")[0]}`);
    window.setTimeout(() => setToast(""), 2400);
  }

  return (
    <>
      <header className="header">
        <a className="brand" href="#hero">
          <span className="brand-mark">AAI</span>
          <span className="brand-name">Automata AI</span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          <a href="#skills">Skills</a>
          <a href="#workflow">Workflow</a>
          <a href="#npm">NPM</a>
          <a href="#install">Install</a>
          <a href="#docs">Docs</a>
          <a href="#build">Contribute</a>
        </nav>
        <div className="header-actions">
          <a className="btn btn-ghost" href={githubRepo} target="_blank" rel="noreferrer">
            <Github size={14} />
            GitHub
          </a>
          <a className="btn btn-primary" href="#install">Install</a>
        </div>
      </header>

      <main>
        <section className="hero" id="hero">
          <p className="eyebrow">LLM Skill Registry</p>
          <h1 className="hero-title-animate">Package AI work into<br /><em>installable skills.</em></h1>
          <p className="hero-sub">
            Reusable, versioned skill packages for LLM agents. Web, backend, auth, and project conventions that install through npm and sync into your agent context.
          </p>

          <div className="hero-actions">
            <a className="btn btn-primary btn-large btn-glow" href="#skills">Browse Skills</a>
            <div className="npm-badge">
              <span className="npm-badge-label">npm</span>
              <span className="npm-badge-cmd">npm install -D @skillsforllms/reactskills</span>
              <button
                className="npm-badge-copy"
                type="button"
                title="Copy command"
                onClick={() => copy("npm install -D @skillsforllms/reactskills")}
              >
                <Clipboard size={14} />
              </button>
            </div>
          </div>

          <div className="hero-stats">
            <Stat value={String(skills.length)} label="Seed Skills" />
            <Stat value={String(categories.length - 1)} label="Categories" />
            <Stat value="npm" label="Registry" />
            <Stat value="MIT" label="License" />
          </div>

          <div className="hero-agents">
            <span className="hero-agents-label">Works with</span>
            <div className="agent-pills">
              <span className="agent-pill">Claude</span>
              <span className="agent-pill">Cursor</span>
              <span className="agent-pill">Copilot</span>
              <span className="agent-pill">Continue</span>
            </div>
          </div>
        </section>

        <section className="registry-section" id="skills">
          <div className="section-label">01 / Registry</div>
          <h2>Browse skill packages</h2>
          <p className="section-desc">
            Each skill defines agent instructions, examples, guardrails, package metadata, and tool recipes ready to sync into a project-level AI capability.
          </p>

          <div className="registry-toolbar">
            <div className="category-tabs">
              {categories.map((item) => (
                <button
                  className={`tab-btn ${category === item ? "active" : ""}`}
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                >
                  {categoryLabels[item] ?? titleCase(item)}
                  {item === "all" ? ` (${skills.length})` : ""}
                </button>
              ))}
            </div>

            <label className="registry-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search packages..."
              />
            </label>
          </div>

          <div className="skills-grid" id="skills-grid">
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.package}
                skill={skill}
                onOpen={() => setSelectedSkill(skill)}
                onCopy={(value) => {
                  copy(value);
                }}
              />
            ))}
          </div>
        </section>

        <section className="section" id="workflow">
          <div className="section-label">02 / Workflow</div>
          <h2>Create, test, publish, reuse.</h2>
          <p className="section-desc">
            Skills are living packages. They get sharper, safer, and more capable with each version.
          </p>

          <div className="workflow-grid">
            <WorkflowStep
              number="01 - Write"
              title="Define the skill"
              text="Create a SKILL.md with purpose, triggers, constraints, examples, and quality checks."
              code={[
                "# SKILL.md",
                "# Skill: React Setup",
                "> @skillsforllms/react-setup · v1.0.0 · Category: Web",
                "## Purpose",
                "Guide an AI agent to scaffold React apps."
              ]}
            />
            <WorkflowStep
              number="02 - Publish"
              title="Push to npm registry"
              text="Version with Changesets, validate the skill, and publish the package as a public npm artifact."
              code={[
                "$ pnpm changeset",
                "$ pnpm validate:skills",
                "$ npm publish --access public",
                "OK Published @skillsforllms/react-setup"
              ]}
            />
            <WorkflowStep
              number="03 - Sync"
              title="Drop into any agent"
              text="Install the skill package in a project and copy its SKILL.md into the shared agent context."
              code={[
                "$ npm install -D @skillsforllms/react-setup skillsforllms",
                "$ npx skillsforllms sync",
                "OK .skills/react-setup/SKILL.md",
                "OK .skills/INDEX.md"
              ]}
            />
          </div>
        </section>

        <section className="package-section" id="npm">
          <div className="section-label">03 / NPM Package Model</div>
          <h2>How users install a skill in their project.</h2>
          <p className="section-desc">
            Ship each skill as a tiny npm package. The package contains instructions, examples, and metadata; the CLI copies it into the user's project.
          </p>

          <div className="package-flow">
            <div className="package-card">
              <h3>Package anatomy</h3>
              <p className="section-desc small">
                Every skill package keeps the same predictable contract so agents and tooling can read it without guessing.
              </p>
              <ul className="package-list">
                <li><span>1</span><div><strong>SKILL.md</strong> is the main instruction file: purpose, triggers, constraints, steps, examples, and quality checks.</div></li>
                <li><span>2</span><div><strong>package.json</strong> stores npm metadata plus `skillsforllms` category, tags, and compatible agents.</div></li>
                <li><span>3</span><div><strong>examples/</strong> includes prompts, expected outputs, project templates, and before/after references.</div></li>
                <li><span>4</span><div><strong>README.md</strong> explains the package for humans browsing npm or GitHub.</div></li>
              </ul>
            </div>

            <div className="package-card">
              <h3>Install flow</h3>
              <CodeBlock lines={[
                "# install the skill package",
                "$ npm install -D @skillsforllms/react-setup skillsforllms",
                "",
                "# copy SKILL.md into the app",
                "$ npx skillsforllms sync @skillsforllms/react-setup",
                "",
                "OK .skills/react-setup/SKILL.md",
                "OK .skills/INDEX.md"
              ]} />
              <CodeBlock lines={[
                "# agent prompt",
                "Read .skills/react-setup/SKILL.md",
                "and follow those conventions."
              ]} />
            </div>
          </div>
        </section>

        <section className="install-section" id="install">
          <div className="section-label">04 / Installation</div>
          <h2>Get started in 30 seconds.</h2>
          <p className="section-desc">
            Install the CLI and a skill package, then sync the skill instructions into the project.
          </p>

          <div className="install-grid">
            <div className="install-panel">
              <h3>Install and sync</h3>
              <TerminalWindow lines={[
                "npm install -D skillsforllms @skillsforllms/react-setup",
                "npx skillsforllms sync",
                "OK @skillsforllms/react-setup -> .skills/react-setup/SKILL.md",
                "OK 1 skill synced",
                "npx skillsforllms list",
                "OK react-setup @skillsforllms/react-setup v1.0.0"
              ]} />
            </div>

            <div className="install-panel github-panel">
              <h3>GitHub-linked skills</h3>
              <p className="panel-copy">
                Every official skill lives in this monorepo. Open a PR to improve instructions, examples, validators, or registry metadata.
              </p>

              {skills.map((skill) => (
                <div className="gh-row" key={skill.package}>
                  <div className="gh-info">
                    <span className="gh-icon"><Package size={17} /></span>
                    <div>
                      <div className="gh-title">{skill.shortName}</div>
                      <div className="gh-sub">{githubLabel}</div>
                    </div>
                  </div>
                  <span className="gh-badge gh-badge-fork">{skill.version}</span>
                </div>
              ))}

              <a className="btn btn-ghost full-width" href={githubRepo} target="_blank" rel="noreferrer">
                <Github size={14} />
                View all on GitHub
              </a>
            </div>
          </div>
        </section>

        <section className="docs-section" id="docs">
          <div className="section-label">05 / Documentation</div>
          <h2>Everything you need to know.</h2>
          <p className="section-desc">
            From first install to authoring your own skills — quick reference for the full SkillsForLLMs workflow.
          </p>

          <div className="docs-grid">
            <DocsCard
              icon={<Zap size={22} />}
              title="Getting Started"
              items={[
                "Install the CLI: npm install -D skillsforllms",
                "Add a skill: npm install -D @skillsforllms/react-setup",
                "Sync into project: npx skillsforllms sync",
                "Your AI agent reads .skills/react-setup/SKILL.md",
                "Commit .skills/ to git so the whole team benefits"
              ]}
            />
            <DocsCard
              icon={<Code2 size={22} />}
              title="CLI Reference"
              items={[
                "skillsforllms init — Create config file",
                "skillsforllms sync — Copy skills into .skills/",
                "skillsforllms list — Show synced skills",
                "skillsforllms info <pkg> — Skill metadata",
                "skillsforllms check — Check for updates",
                "skillsforllms validate — Validate SKILL.md"
              ]}
            />
            <DocsCard
              icon={<BookOpen size={22} />}
              title="SKILL.md Spec"
              items={[
                "Required: Purpose, When to Use, Key Conventions, Anti-Patterns",
                "Recommended: Tech Stack, Project Structure, Step-by-Step Instructions",
                "Optional: File Templates, Examples, Changelog",
                "Format: Dense, structured, imperative Markdown",
                "AI-first: Written for agents, not humans"
              ]}
            />
            <DocsCard
              icon={<Layers size={22} />}
              title="Agent Adapters"
              items={[
                "--adapter cursor → writes .cursorrules",
                "--adapter copilot → writes copilot-instructions.md",
                "--adapter claude → writes CLAUDE_PROJECT.md",
                "--adapter continue → writes .continue/context/",
                "Config: Set agents in skillsforllms.config.json"
              ]}
            />
          </div>

          <div className="docs-cta">
            <a className="btn btn-ghost btn-large" href={githubRepo} target="_blank" rel="noreferrer">
              <BookOpen size={14} />
              Full docs on GitHub
            </a>
          </div>
        </section>

        <section className="cta-section" id="build">
          <div className="cta-inner">
            <div>
              <p className="eyebrow">05 / Contribute</p>
              <h2 className="cta-title">Build a skill,<br />publish your work.</h2>
              <p className="cta-sub">
                Use `create-skill` to scaffold a compliant package, validate the SKILL.md, and submit it to the registry.
              </p>
              <div className="cta-actions">
                <button className="btn btn-primary btn-large" type="button" onClick={() => copy("npx create-skill")}>
                  Copy scaffold command
                </button>
                <a className="btn btn-ghost btn-large" href={githubRepo} target="_blank" rel="noreferrer">
                  Read Contribution Guide
                </a>
              </div>
              <p className="cta-badge">v0.1 - Open Beta</p>
            </div>
            <div className="cta-aside">npm<br />run<br />ship</div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="brand" href="#hero">
          <span className="brand-mark">AAI</span>
          <span className="brand-name">Automata AI</span>
        </a>
        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#skills">Registry</a>
          <a href="#workflow">Workflow</a>
          <a href="#install">Install</a>
          <a href={githubOwner} target="_blank" rel="noreferrer">GitHub</a>
          <a href="mailto:anlabs.dev@gmail.com">Contact</a>
        </nav>
        <p className="footer-copy">2026 Automata AI</p>
      </footer>

      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>

      {selectedSkill ? (
        <SkillDetailModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onCopy={(value) => copy(value)}
        />
      ) : null}
    </>
  );
}

function SkillCard({
  skill,
  onOpen,
  onCopy
}: {
  skill: Skill;
  onOpen: () => void;
  onCopy: (value: string) => void;
}) {
  return (
    <article
      className="skill-card"
      data-cat={visualCategory(skill.category)}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="skill-card-top">
        <div className="skill-icon"><SkillIcon category={skill.category} /></div>
        <div className="skill-meta">
          <div className="skill-name">{skill.name}</div>
          <div
            className="skill-pkg"
            title="Click to copy package name"
            style={{ cursor: "copy" }}
            onClick={(event) => {
              event.stopPropagation();
              onCopy(skill.package);
            }}
          >
            {skill.package}
          </div>
        </div>
        <span className="skill-version">v{skill.version}</span>
      </div>
      <p className="skill-desc">{skill.description}</p>
      <div className="skill-tags">
        {skill.tags.slice(0, 4).map((tag) => <span className="tag" key={tag}>{tag}</span>)}
      </div>
      <div className="skill-footer">
        <div className="skill-author">
          <div className="author-avatar">AN</div>
          <span className="author-name">{skill.author.toLowerCase().replace(/\s+/g, "-")}</span>
        </div>
        <div className="skill-actions">
          <a
            className="skill-btn"
            href={githubRepo}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            GitHub
          </a>
          <button
            className="skill-btn skill-btn-install"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCopy(installCommand(skill));
            }}
          >
            Install
          </button>
        </div>
      </div>
    </article>
  );
}

function SkillDetailModal({
  skill,
  onClose,
  onCopy
}: {
  skill: Skill;
  onClose: () => void;
  onCopy: (value: string) => void;
}) {
  return (
    <div className="skill-detail-modal show" role="dialog" aria-modal="true" aria-labelledby="skill-detail-title" onMouseDown={onClose}>
      <div className="skill-detail-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="skill-detail-head">
          <div>
            <div className="skill-detail-kicker">{categoryLabels[skill.category] ?? titleCase(skill.category)}</div>
            <h3 id="skill-detail-title">{skill.name}</h3>
            <div
              className="skill-detail-package"
              title="Click to copy package name"
              style={{ cursor: "copy" }}
              onClick={() => onCopy(skill.package)}
            >
              {skill.package}
            </div>
          </div>
          <button className="modal-close" type="button" aria-label="Close details" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="skill-detail-body">
          <div className="detail-block">
            <strong>What this skill does</strong>
            <p>{skill.description}</p>
          </div>
          <div className="skill-detail-grid">
            <div className="detail-block">
              <strong>Included guidance</strong>
              <ul>
                <li>Purpose and trigger situations</li>
                <li>Project conventions and anti-patterns</li>
                <li>Step-by-step agent instructions</li>
                <li>Examples and changelog</li>
              </ul>
            </div>
            <div className="detail-block">
              <strong>Best for</strong>
              <p>{skill.tags.join(", ")} projects that need reusable agent guidance.</p>
            </div>
          </div>
          <div className="detail-block">
            <strong>Example prompt</strong>
            <p>Read `.skills/{skill.shortName}/SKILL.md` and follow those conventions while implementing this feature.</p>
          </div>
          <div className="detail-code">{installCommand(skill)}{`\n\n# Result\n.skills/${skill.shortName}/SKILL.md\n.skills/INDEX.md`}</div>
          <div className="detail-actions">
            <button className="btn btn-primary" type="button" onClick={() => onCopy(installCommand(skill))}>Copy install command</button>
            <button className="btn btn-ghost" type="button" onClick={() => onCopy(`npm install -D ${skill.package}`)}>Copy npm package install</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({ number, title, text, code }: { number: string; title: string; text: string; code: string[] }) {
  return (
    <article className="workflow-step">
      <span className="step-num">{number}</span>
      <div className="step-title">{title}</div>
      <p className="step-desc">{text}</p>
      <CodeBlock lines={code} />
    </article>
  );
}

function CodeBlock({ lines }: { lines: string[] }) {
  return (
    <div className="code-block">
      {lines.map((line, index) => (
        <span className={codeClass(line)} key={`${line}-${index}`}>{line || "\u00a0"}</span>
      ))}
    </div>
  );
}

function TerminalWindow({ lines }: { lines: string[] }) {
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot dot-r" />
        <span className="dot dot-y" />
        <span className="dot dot-g" />
        <span className="terminal-title">bash</span>
      </div>
      <div className="terminal-body">
        {lines.map((line, index) => (
          <div key={`${line}-${index}`}>
            {line.startsWith("npm") || line.startsWith("npx") ? (
              <>
                <span className="t-prompt">~</span> <span className="t-cmd">{line}</span>
              </>
            ) : (
              <span className="t-success">{line}</span>
            )}
          </div>
        ))}
        <div><span className="t-prompt">~</span> <span className="t-cursor" /></div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-item">
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function SkillIcon({ category }: { category: string }) {
  if (category === "web") return <Sparkles size={20} />;
  if (category === "backend") return <Terminal size={20} />;
  if (category === "security") return <ShieldCheck size={20} />;
  return <Package size={20} />;
}

function DocsCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <article className="docs-card">
      <div className="docs-card-head">
        <span className="docs-card-icon">{icon}</span>
        <h3 className="docs-card-title">{title}</h3>
      </div>
      <ul className="docs-card-list">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            <ChevronRight size={12} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function installCommand(skill: Skill) {
  return `npm install -D ${skill.package} skillsforllms\nnpx skillsforllms sync ${skill.package}`;
}

function visualCategory(category: string) {
  return category === "security" ? "devops" : category;
}

function titleCase(value: string) {
  return value
    .split(/[-\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function codeClass(line: string) {
  if (line.startsWith("#")) return "code-line code-comment";
  if (line.startsWith("$")) return "code-line code-cmd";
  if (line.startsWith("OK")) return "code-line code-success";
  if (line.includes("@skills") || line.includes(".skills")) return "code-line code-str";
  return "code-line";
}

createRoot(document.getElementById("root")!).render(<App />);

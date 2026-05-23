import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const skillsDir = path.join(root, "skills");
const registryDir = path.join(root, "registry");
const registrySkillsDir = path.join(registryDir, "skills");

await fs.mkdir(registrySkillsDir, { recursive: true });

const entries = [];
const skillFolders = (await fs.readdir(skillsDir, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const packageRoots = [
  ...skillFolders.map((folder) => ({
    folder,
    packagePath: path.join(skillsDir, folder, "package.json"),
    source: `skills/${folder}`
  })),
  {
    folder: "reactskills",
    packagePath: path.join(root, "reactskills", "package.json"),
    source: "reactskills"
  }
];

for (const packageRoot of packageRoots) {
  const packagePath = packageRoot.packagePath;
  const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
  const metadata = packageJson.skillsforllms ?? {};

  const required = {
    name: humanName(packageJson.name),
    package: packageJson.name,
    version: packageJson.version,
    category: metadata.category,
    description: packageJson.description,
    tags: metadata.tags,
    author: packageJson.author,
    compatibleAgents: metadata.compatibleAgents
  };

  for (const [field, value] of Object.entries(required)) {
    if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
      throw new Error(`${packageJson.name} is missing registry field ${field}`);
    }
  }

  const record = {
    ...required,
    shortName: shortName(packageJson.name),
    tier: metadata.tier ?? (packageJson.private ? "pro" : "free"),
    status: metadata.status ?? (packageJson.private ? "pro-planned" : "available"),
    launchPhase: metadata.launchPhase ?? null,
    coreFeature: metadata.coreFeature ?? null,
    whyItSells: metadata.whyItSells ?? null,
    private: packageJson.private === true,
    weeklyDownloads: null,
    source: packageRoot.source
  };

  entries.push(record);
  await fs.writeFile(
    path.join(registrySkillsDir, `${record.shortName}.json`),
    `${JSON.stringify(record, null, 2)}\n`
  );
}

await fs.writeFile(
  path.join(registryDir, "index.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), skills: entries }, null, 2)}\n`
);

console.log(`Generated registry for ${entries.length} skills.`);

function shortName(packageName) {
  return packageName.slice(packageName.indexOf("/") + 1).replace(/^skill-/, "");
}

function humanName(packageName) {
  return shortName(packageName)
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

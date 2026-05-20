import { findProjectRoot, loadConfig } from "@skillsforllms/core";
import { syncCommand } from "./index.js";

async function main(): Promise<void> {
  const root = await findProjectRoot();
  if (!root) return;

  const { config } = await loadConfig(root);
  if (!config.autoSync) return;

  await syncCommand([], {
    dir: config.outputDir,
    examples: config.includeExamples,
    quiet: true
  });
}

main().catch(() => {
  process.exitCode = 0;
});

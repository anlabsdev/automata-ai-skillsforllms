const reactSkills = require("./index");
let passed = 0, failed = 0;
function assert(c, m) { if (c) { console.log(`  ✅ ${m}`); passed++; } else { console.error(`  ❌ ${m}`); failed++; } }
console.log("\n🧪 reactskills tests\n");
const skills = reactSkills.list();
assert(skills.length === 8, `has 8 skills (got ${skills.length})`);
for (const name of skills) {
  const content = reactSkills.getSkill(name);
  assert(content.length > 100, `${name} loads (${content.length} chars)`);
}
try { reactSkills.getSkill("fake"); assert(false, "should throw"); } catch(e) { assert(true, "throws for unknown"); }
const info = reactSkills.info();
assert(info.skillCount === 8, "info().skillCount === 8");
console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);

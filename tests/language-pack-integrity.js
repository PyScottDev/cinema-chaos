/**
 * Smoke test for the Elementary content extraction.
 * Run: node tests/language-pack-integrity.js
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const name of ['js/language/elementary.js', 'js/campaigns/the-first-week.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), ctx, { filename: name });
}
const { pack, campaign } = vm.runInContext('({ pack: FIRST_WEEK_ELEMENTARY, campaign: THE_FIRST_WEEK_CAMPAIGN })', ctx);

function readPath(object, path) {
  let result = object;
  for (const segment of path.split('/')) {
    result = segment.startsWith('@')
      ? result.find(entry => entry.id === segment.slice(1))
      : result[segment];
    assert.notEqual(result, undefined, `Unresolved path: ${path}`);
  }
  return result;
}
for (const [textPath, value] of Object.entries(pack.text)) {
  assert.equal(readPath(campaign, textPath), value, textPath);
}
for (const day of Object.values(campaign.days)) {
  assert.ok(day.title && day.briefingMemo, 'Daily briefing must be complete');
  for (const encounter of day.scriptedEncounters || []) {
    for (const text of Object.values(encounter.qaOverrides || {})) {
      assert.equal(typeof text, 'string', `Missing answer in ${encounter.id}`);
    }
  }
}
assert.equal(campaign.languagePacks.elementary, campaign.languagePack);
assert.equal(campaign.languagePack.procedural, pack.procedural);
assert.equal(campaign.playerQuestions, pack.playerQuestions);
assert.equal(campaign.endings.length, 6);
assert.equal(campaign.totalDays, 7);
console.log(`Elementary pack OK: ${Object.keys(pack.text).length} authored text fields, 7 campaign days and full procedural dialogue.`);

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
for (const name of ['js/language/elementary.js', 'js/language/intermediate.js', 'js/campaigns/the-first-week.js']) {
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
const inter = vm.runInContext('FIRST_WEEK_INTERMEDIATE', ctx);
assert.equal(campaign.languageModes.intermediate.available, true);
assert.deepEqual(Object.keys(inter.textOverrides).filter(k => !(k in pack.text)), [],
  'Intermediate uses only recognised text paths');
for (const [path, value] of Object.entries(inter.textOverrides)) {
  assert.equal(typeof value, 'string', `Intermediate text must be a string at ${path}`);
  const variables = text => [...new Set([...text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(x => x[1]))].sort();
  assert.deepEqual(variables(value), variables(pack.text[path]), `Lost placeholder at ${path}`);
}
const facts = list => list.map(f => [f.id, f.title, f.genre, f.screen, f.time,
  f.timeMins, f.capacity, f.ageRating, f.minAge]);
assert.deepEqual(facts(campaign.languagePacks.intermediate.films), facts(campaign.languagePacks.elementary.films));
assert.ok(Object.keys(inter.textOverrides).filter(k => k.includes('scriptedEncounters')).length > 100);
vm.runInContext('applyFirstWeekLanguage(THE_FIRST_WEEK_CAMPAIGN, \"intermediate\")', ctx);
for (const [textPath, value] of Object.entries(pack.text)) {
  assert.equal(readPath(campaign, textPath), inter.textOverrides[textPath] ?? value, textPath);
}
assert.equal(campaign.languagePack, campaign.languagePacks.intermediate);
vm.runInContext('applyFirstWeekLanguage(THE_FIRST_WEEK_CAMPAIGN, \"elementary\")', ctx);
for (const [textPath, value] of Object.entries(pack.text)) {
  assert.equal(readPath(campaign, textPath), value, `Elementary restoration: ${textPath}`);
}
assert.equal(campaign.languagePack.procedural, pack.procedural);
assert.equal(campaign.playerQuestions, pack.playerQuestions);
assert.equal(campaign.endings.length, 6);
assert.equal(campaign.totalDays, 7);
console.log(`Elementary pack OK: ${Object.keys(pack.text).length} authored text fields, 7 campaign days and full procedural dialogue.`);

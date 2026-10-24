const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

function makeEl() {
  return {
    textContent: "",
    innerHTML: "",
    value: "",
    checked: false,
    disabled: false,
    className: "",
    tabIndex: 0,
    style: {},
    children: [],
    classList: {
      _set: new Set(),
      add(...c) { c.forEach(x => this._set.add(x)); },
      remove(...c) { c.forEach(x => this._set.delete(x)); },
      toggle(c, f) {
        if (f === undefined) {
          this._set.has(c) ? this._set.delete(c) : this._set.add(c);
        } else if (f) {
          this._set.add(c);
        } else {
          this._set.delete(c);
        }
      },
      contains(c) { return this._set.has(c); }
    },
    replaceChildren(...n) { this.children = n; },
    append(...n) { this.children.push(...n); },
    before() {},
    replaceWith() {},
    setAttribute() {},
    querySelector() { return makeEl(); },
    matches() { return false; },
    click() {}
  };
}

function createHarness(seed = 12345, customScripts = null) {
  const elements = new Map();
  const sandbox = {
    window: {},
    location: { search: `?seed=${seed}` },
    innerWidth: 1280,
    localStorage: {
      _s: {},
      getItem(k) { return this._s[k] ?? null; },
      setItem(k, v) { this._s[k] = String(v); },
      removeItem(k) { delete this._s[k]; }
    },
    URLSearchParams,
    structuredClone,
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: () => 1,
    document: {
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, makeEl());
        return elements.get(id);
      },
      createElement() { return makeEl(); },
      createComment() { return makeEl(); },
      querySelectorAll() { return []; },
      addEventListener() {}
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);

  const scripts = customScripts || [
    "js/campaigns/registry.js",
    "js/campaigns/the-first-week.js",
    "js/sound.js",
    "js/characters.js",
    "js/engine.js",
    "js/ui.js"
  ].map(f => fs.readFileSync(path.join(ROOT, f), "utf8"));

  for (const code of scripts) {
    vm.runInContext(code, sandbox);
  }
  sandbox.window.onload();
  return {
    sandbox,
    elements,
    Game: sandbox.CinemaDebug.game,
    UI: sandbox.CinemaDebug.ui
  };
}

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✕ ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log("=== Cinema Chaos Regression Test Suite ===");

test("1. Consolidated monkey-patches match original HEAD simulation trace across Days 1-6 (60 encounters)", () => {
  function captureTrace(h) {
    const { Game, sandbox } = h;
    const trace = [];
    for (let day = 1; day <= 6; day++) {
      sandbox.CinemaDebug.setSeed(12345 + day * 100);
      sandbox.document.getElementById("teacherDaySelect").value = String(day);
      Game.teacherJumpToDay();
      const rules = h.UI.getActiveRules ? h.UI.getActiveRules() : [];
      const briefingHtml = sandbox.document.getElementById("briefingRulesChecklist").innerHTML;
      const memoText = sandbox.document.getElementById("briefingMemoText").textContent;
      Game.startShift();
      for (let step = 0; step < 10; step++) {
        const c = Game.state.currentCustomer;
        const ev = Game.evaluateCustomerCase(c);
        trace.push({
          day,
          step,
          memoText,
          briefingHtml,
          rulesCount: rules.length,
          name: c.person.name,
          caseType: c.caseType,
          statement: c.statement,
          ticket: c.ticket,
          validActions: ev.validActions,
          reason: ev.reason
        });
        if (ev.needsQuestion) {
          if (c.requiredTicketQuestion) Game.askCustomerQuestion("other_ticket", "Do you have another ticket?");
          else Game.askCustomerQuestion("which_film", "Which film are you going to see?");
        }
        const ev2 = Game.evaluateCustomerCase(c);
        const action = ev2.validActions[0];
        const target = action === "CORRECT" ? ev2.options[0] : null;
        Game.makeDecision(action, target);
        Game.nextCustomerFromQueue();
      }
      Game.stopShiftLoop();
    }
    return trace;
  }

  const origHtml = execSync("git show 0a1a9eb:index.html", { cwd: ROOT, encoding: "utf8" });
  const origScript = origHtml.slice(origHtml.lastIndexOf("<script>") + 8, origHtml.lastIndexOf("</script>"));
  const hOrig = createHarness(12345, [origScript]);
  const hCurrent = createHarness(12345);

  const tOrig = captureTrace(hOrig);
  const tCurrent = captureTrace(hCurrent);
  for (let i = 0; i < tOrig.length; i++) {
    const { rulesCount: _a, ...origItem } = tOrig[i];
    const { rulesCount: _b, ...currItem } = tCurrent[i];
    assert.strictEqual(JSON.stringify(currItem), JSON.stringify(origItem), `Mismatch at step ${i}`);
  }
});

test("2. Day 1 rules: valid tickets admitted, errors refused because printer is closed", () => {
  const { Game } = createHarness(101);
  Game.prepareDaySchedule(1);
  Game.startShift();

  const validCust = Game.generateCustomerScenario("valid");
  Game.finalizeCustomerAtWindow(validCust);
  const evValid = Game.evaluateCustomerCase(validCust);
  assert.deepEqual(evValid.validActions, ["ADMIT"]);

  const wrongScreenCust = Game.generateCustomerScenario("screen");
  Game.finalizeCustomerAtWindow(wrongScreenCust);
  const evWrongScreen = Game.evaluateCustomerCase(wrongScreenCust);
  assert.deepEqual(evWrongScreen.validActions, ["REFUSE"], "Day 1 must refuse screen errors because printer is closed");
  assert.ok(evWrongScreen.issues.some(i => i.code === "screen"));
});

test("3. Day 2 rules: printer unlocked for corrections, 10-minute late limit enforced, Mr Morris dilemma", () => {
  const { Game } = createHarness(202);
  Game.state.day = 2;
  Game.startShift();

  // Fixable wrong-screen ticket on Day 2 should require CORRECT
  const screenCust = Game.generateCustomerScenario("screen");
  Game.finalizeCustomerAtWindow(screenCust);
  const evScreen = Game.evaluateCustomerCase(screenCust);
  assert.deepEqual(evScreen.validActions, ["CORRECT"]);
  assert.ok(evScreen.options.length >= 1);

  // Advance clock past 18:25 so 18:15 Happy Penguins is >10 mins late (18:26 = 1106 mins)
  Game.state.clockMins = 1108;
  const morris = Game.generateCustomerScenario("morris");
  Game.finalizeCustomerAtWindow(morris);
  assert.strictEqual(morris.person.id, "mr_morris");
  const evBeforeQ = Game.evaluateCustomerCase(morris);
  assert.deepEqual(evBeforeQ.validActions, ["QUESTION"]);

  Game.state.currentCustomer = morris;
  Game.askCustomerQuestion("which_film", "Which film are you going to see?");
  const evAfterQ = Game.evaluateCustomerCase(morris);
  assert.deepEqual(evAfterQ.validActions, ["REFUSE"]);
  assert.strictEqual(evAfterQ.discretionary, true, "Mr Morris late dilemma allows discretionary admission with warning");
  const admitRes = Game.applyDecision(morris, "ADMIT");
  assert.strictEqual(admitRes.accepted, true);
  assert.strictEqual(admitRes.exception, true);
  assert.strictEqual(admitRes.compliant, false);
});

test("4. Day 3 rules: Planet X moved to Screen 1, duplicate serials refused, Promo tickets cannot be corrected", () => {
  const { Game } = createHarness(303);
  Game.state.day = 3;
  Game.startShift();

  const planetX = Game.screening("planet_x");
  assert.strictEqual(planetX.screen, 1);
  assert.strictEqual(planetX.status, "MOVED TO SCR 1");

  const moveCust = Game.generateCustomerScenario("move");
  Game.finalizeCustomerAtWindow(moveCust);
  const evMove = Game.evaluateCustomerCase(moveCust);
  assert.deepEqual(evMove.validActions, ["CORRECT"]);
  assert.ok(evMove.issues.some(i => i.code === "screen"));

  const dupCust = Game.generateCustomerScenario("duplicate");
  Game.finalizeCustomerAtWindow(dupCust);
  const evDup = Game.evaluateCustomerCase(dupCust);
  assert.deepEqual(evDup.validActions, ["REFUSE"]);
  assert.ok(evDup.issues.some(i => i.code === "duplicate"));

  const promoCust = Game.generateCustomerScenario("promo");
  Game.finalizeCustomerAtWindow(promoCust);
  const evPromo = Game.evaluateCustomerCase(promoCust);
  assert.deepEqual(evPromo.validActions, ["REFUSE"], "Promo tickets with wrong film cannot be corrected");
});

test("5. Day 4 rules: TV Lounge schedule active and TV room mismatches correctable", () => {
  const { Game } = createHarness(404);
  Game.state.day = 4;
  Game.startShift();

  assert.strictEqual(Game.state.tvSchedule.length, 7);

  const tvValid = Game.generateCustomerScenario("tv");
  Game.finalizeCustomerAtWindow(tvValid);
  assert.deepEqual(Game.evaluateCustomerCase(tvValid).validActions, ["ADMIT"]);

  const tvWrong = Game.generateCustomerScenario("tv_wrong");
  Game.finalizeCustomerAtWindow(tvWrong);
  const evTvWrong = Game.evaluateCustomerCase(tvWrong);
  assert.deepEqual(evTvWrong.validActions, ["CORRECT"]);
  assert.ok(evTvWrong.issues.some(i => i.code === "screen"));
});

test("6. Day 5 rules: Love in Paris cancelled, Happy Penguins extra show, Screen 2 Red rule after 19:10, VIP pass", () => {
  const { Game } = createHarness(505);
  Game.state.day = 5;
  Game.startShift();

  assert.strictEqual(Game.screening("love_in_paris").status, "CANCELLED");
  assert.ok(Game.screening("happy_penguins_late"), "Extra show happy_penguins_late should exist on Day 5");

  // Cancelled film requires questioning customer then correcting
  const cancCust = Game.generateCustomerScenario("cancelled");
  Game.finalizeCustomerAtWindow(cancCust);
  assert.deepEqual(Game.evaluateCustomerCase(cancCust).validActions, ["QUESTION"]);
  Game.state.currentCustomer = cancCust;
  Game.askCustomerQuestion("which_film", "Which film are you going to see?");
  assert.deepEqual(Game.evaluateCustomerCase(cancCust).validActions, ["CORRECT"]);

  // VIP pass valid
  const vipCust = Game.generateCustomerScenario("vip");
  Game.finalizeCustomerAtWindow(vipCust);
  assert.deepEqual(Game.evaluateCustomerCase(vipCust).validActions, ["ADMIT"]);

  // Screen 2 Red rule after 19:10 (1151 mins)
  Game.state.clockMins = 1152;
  const redCust = Game.generateCustomerScenario("red");
  Game.finalizeCustomerAtWindow(redCust);
  assert.strictEqual(redCust.person.wearingRed, true);
  assert.deepEqual(Game.evaluateCustomerCase(redCust).validActions, ["ADMIT"]);

  const noRedCust = Game.generateCustomerScenario("no_red");
  Game.finalizeCustomerAtWindow(noRedCust);
  assert.strictEqual(noRedCust.person.wearingRed, false);
  const evNoRed = Game.evaluateCustomerCase(noRedCust);
  assert.ok(evNoRed.issues.some(i => i.code === "red"));
  assert.deepEqual(evNoRed.validActions, ["REFUSE"]);
});

test("7. CampaignRegistry registers 'the-first-week' with 7-day structure and validates schema", () => {
  const { sandbox } = createHarness(707);
  const reg = sandbox.window.CinemaChaos.CampaignRegistry;
  assert.ok(reg, "CampaignRegistry should be defined on window.CinemaChaos");

  const list = reg.list();
  assert.strictEqual(list.length, 1);
  const firstWeek = reg.get("the-first-week");
  assert.ok(firstWeek);
  assert.strictEqual(firstWeek.title, "The First Week");
  assert.strictEqual(firstWeek.subtitle, "7 Days · Learn the Job");
  assert.strictEqual(firstWeek.totalDays, 7);
  assert.strictEqual(Object.keys(firstWeek.days).length, 7);
  assert.ok(firstWeek.endlessDay, "Endless mode should be defined separately from the 7 campaign days");

  // Verify Wednesday relocation, Friday cancellation + extra show, and scripted encounters are represented in data
  assert.strictEqual(firstWeek.days[3].scheduleChanges[0].type, "relocate");
  assert.strictEqual(firstWeek.days[3].scheduleChanges[0].screeningId, "planet_x");
  assert.strictEqual(firstWeek.days[5].scheduleChanges[0].type, "cancel");
  assert.strictEqual(firstWeek.days[5].scheduleChanges[0].screeningId, "love_in_paris");
  assert.strictEqual(firstWeek.days[5].scheduleChanges[1].type, "add_extra");
  assert.strictEqual(firstWeek.days[5].scheduleChanges[1].newId, "happy_penguins_late");
  assert.strictEqual(firstWeek.days[5].policies.allowVipPasses, true);

  // Verify schema validator rejects invalid campaign definitions with descriptive errors
  assert.throws(() => reg.validate(null), /Campaign definition must be an object/);
  assert.throws(() => reg.validate({ id: "INVALID ID" }), /must be lowercase alphanumeric/);
  assert.throws(() => reg.validate({
    id: "bad-campaign",
    title: "Bad",
    subtitle: "Sub",
    description: "Desc",
    languageModes: { elementary: {}, intermediate: {}, advanced: {} },
    languagePack: { films: [] }
  }), /languagePack\.films must be a non-empty array/);

  // Verify validation catches invalid references to screenings, characters, and unsupported rule types
  const makeDraft = () => structuredClone(firstWeek);

  const badScreeningRef = makeDraft();
  badScreeningRef.days[3].scheduleChanges[0].screeningId = "nonexistent_film";
  assert.throws(() => reg.validate(badScreeningRef), /Unknown screeningId 'nonexistent_film'/);

  const badEncounterScreening = makeDraft();
  badEncounterScreening.days[1].scriptedEncounters[0].targetScreeningId = "ghost_film";
  assert.throws(() => reg.validate(badEncounterScreening), /Unknown targetScreeningId 'ghost_film'/);

  const badTriggerScreening = makeDraft();
  badTriggerScreening.days[2].scriptedEncounters[0].trigger.requireLateScreeningId = "unknown_late_film";
  assert.throws(() => reg.validate(badTriggerScreening), /Unknown requireLateScreeningId 'unknown_late_film'/);

  const badCharacterRef = makeDraft();
  badCharacterRef.days[1].scriptedEncounters[0].characterId = "unknown_person";
  assert.throws(() => reg.validate(badCharacterRef), /Unknown characterId 'unknown_person'/);

  const badInspectorRef = makeDraft();
  badInspectorRef.inspectorCharacterId = "not_a_character";
  assert.throws(() => reg.validate(badInspectorRef), /inspectorCharacterId 'not_a_character' does not reference a defined character/);

  const badPolicyType = makeDraft();
  badPolicyType.days[1].policies.unsupportedRule = true;
  assert.throws(() => reg.validate(badPolicyType), /Unsupported policy or rule type 'unsupportedRule'/);

  const badCondRule = makeDraft();
  badCondRule.days[5].policies.conditionalScreenRules[0].type = "unsupported_cond_type";
  assert.throws(() => reg.validate(badCondRule), /Unsupported conditional rule type 'unsupported_cond_type'/);

  const badCasePoolType = makeDraft();
  badCasePoolType.days[1].casePool.push("nonexistent_case_type");
  assert.throws(() => reg.validate(badCasePoolType), /Unsupported caseType 'nonexistent_case_type'/);
});

test("8. Save and Load compatibility preserves V2 and V1 legacy progress", () => {
  const { Game, sandbox } = createHarness(808);
  Game.state.day = 4;
  Game.state.difficulty = "chaos";
  Game.state.money = 125;
  Game.state.reputation = 92;
  Game.state.ownedUpgrades = ["scanner", "printer"];
  Game.state.completedDays = [1, 2, 3];
  Game.state.highScore = 125;
  Game.state.story = { morris: "kind", leo: "helped", sofia: "helped" };
  Game.saveProgress();

  // Reset in-memory state and reload from localStorage
  Game.state.day = 1;
  Game.state.difficulty = "normal";
  Game.state.money = 0;
  Game.state.ownedUpgrades = [];
  Game.loadProgress();

  assert.strictEqual(Game.state.day, 4);
  assert.strictEqual(Game.state.difficulty, "chaos");
  assert.strictEqual(Game.state.money, 125);
  assert.strictEqual(Game.state.reputation, 92);
  assert.deepEqual(Game.state.ownedUpgrades, ["scanner", "printer"]);
  assert.deepEqual(Game.state.completedDays, [1, 2, 3]);
  assert.strictEqual(Game.state.story.morris, "kind");

  // Also test V1 legacy migration when V2 key is absent
  sandbox.localStorage.removeItem("cinema_chaos_save_v2");
  sandbox.localStorage.setItem("cinema_chaos_save_v1", JSON.stringify({
    day: 3,
    difficulty: "relaxed",
    money: 60,
    reputation: 85,
    ownedUpgrades: ["seating"],
    completedDays: [1, 2],
    story: { sofia: "helped" }
  }));
  Game.loadProgress();
  assert.strictEqual(Game.state.day, 3);
  assert.strictEqual(Game.state.difficulty, "relaxed");
  assert.strictEqual(Game.state.money, 60);
  assert.deepEqual(Game.state.ownedUpgrades, ["seating"]);
  assert.strictEqual(Game.state.story.sofia, "helped");
});

test("9. Engine, UI, and Characters contain zero hard-coded First Week film or character identifiers", () => {
  const engineCode = fs.readFileSync(path.join(ROOT, "js/engine.js"), "utf8");
  const uiCode = fs.readFileSync(path.join(ROOT, "js/ui.js"), "utf8");
  const charCode = fs.readFileSync(path.join(ROOT, "js/characters.js"), "utf8");

  const forbiddenTokens = [
    "laughing_bananas",
    "happy_penguins",
    "happy_penguins_late",
    "the_dark_house",
    "planet_x",
    "wild_world",
    "love_in_paris",
    "the_last_train",
    "mr_morris",
    "Mr Morris",
    "VIP-770-MORRIS",
    "VIP-900-INSPECTOR",
    "Screen 2 requires red after 19:10",
    "Wearing RED Jacket",
    "Red clothes.",
    "Relaxed (A1)"
  ];

  for (const token of forbiddenTokens) {
    assert.ok(!engineCode.includes(token), `js/engine.js must not contain hard-coded token "${token}"`);
    assert.ok(!uiCode.includes(token), `js/ui.js must not contain hard-coded token "${token}"`);
    assert.ok(!charCode.includes(token), `js/characters.js must not contain hard-coded token "${token}"`);
  }
});

test("10. Minimal disposable test campaign loads and runs without modifying engine.js or ui.js", () => {
  const { Game, UI, sandbox } = createHarness(909);
  const minimalCampaignCode = fs.readFileSync(path.join(ROOT, "tests/minimal-test-campaign.js"), "utf8");
  vm.runInContext(minimalCampaignCode, sandbox);

  const reg = sandbox.window.CinemaChaos.CampaignRegistry;
  assert.strictEqual(reg.list().length, 2);
  assert.ok(reg.get("festival-showcase"));

  // Switch active campaign to festival-showcase
  Game.selectCampaign("festival-showcase");
  assert.strictEqual(Game.state.campaignId, "festival-showcase");
  assert.strictEqual(Game.today(), "FESTIVAL DAY");
  assert.strictEqual(Game.state.schedule.length, 2);

  // Verify Day 1 relocation of cosmic_voyage from Screen 1 to Screen 2
  const cosmic = Game.screening("cosmic_voyage");
  assert.ok(cosmic);
  assert.strictEqual(cosmic.screen, 2);
  assert.strictEqual(cosmic.originalScreen, 1);
  assert.strictEqual(cosmic.status, "MOVED TO SCR 2");

  // Start shift in minimal campaign
  Game.startShift();
  assert.strictEqual(Game.state.shiftActive, true);
  assert.ok(Game.state.currentCustomer, "First customer should be at the window");

  // Case index 1 should trigger scripted encounter with Dr Vega for ocean_mysteries
  const vegaCust = Game.generateCustomerScenario(null);
  Game.finalizeCustomerAtWindow(vegaCust);
  assert.strictEqual(vegaCust.person.id, "dr_vega");
  assert.strictEqual(vegaCust.person.name, "Dr Vega");
  assert.strictEqual(vegaCust.ticket.filmId, "ocean_mysteries");
  assert.ok(vegaCust.ticket.serial.startsWith("FS-1-"), "Serial prefix should use campaign's FS prefix");
  const evVega = Game.evaluateCustomerCase(vegaCust);
  assert.deepEqual(evVega.validActions, ["ADMIT"]);

  // Verify relocate case ('move') in minimal campaign requires CORRECT to Screen 2
  const moveCust = Game.generateCustomerScenario("move");
  Game.finalizeCustomerAtWindow(moveCust);
  assert.strictEqual(moveCust.ticket.filmId, "cosmic_voyage");
  assert.strictEqual(moveCust.ticket.screen, 1, "Relocated ticket should have old Screen 1 printed");
  const evMove = Game.evaluateCustomerCase(moveCust);
  assert.deepEqual(evMove.validActions, ["CORRECT"]);
  assert.ok(evMove.issues.some(i => i.code === "screen"));
  const correctRes = Game.applyDecision(moveCust, "CORRECT", "cosmic_voyage");
  assert.strictEqual(correctRes.accepted, true);
  assert.strictEqual(moveCust.ticket.screen, 2);

  // Verify 5-minute late tolerance (18:00 cosmic_voyage closes after 18:05 = 1085 mins)
  Game.state.clockMins = 1086; // 6 minutes after 18:00
  const lateCust = Game.generateCustomerScenario("late");
  Game.finalizeCustomerAtWindow(lateCust);
  const evLate = Game.evaluateCustomerCase(lateCust);
  assert.ok(evLate.issues.some(i => i.code === "late" && i.text.includes("5 minutes late")));
  assert.strictEqual(UI.getActiveRules().some(r => r.id === "move" && r.text.includes("Cosmic Voyage")), true);
});

test("11. Per-campaign save isolation and Campaign Selection Screen rendering", () => {
  const { Game, UI, sandbox } = createHarness(1010);
  const minimalCampaignCode = fs.readFileSync(path.join(ROOT, "tests/minimal-test-campaign.js"), "utf8");
  vm.runInContext(minimalCampaignCode, sandbox);

  // Progress in 'the-first-week'
  Game.selectCampaign("the-first-week");
  Game.state.day = 4;
  Game.state.money = 140;
  Game.state.reputation = 95;
  Game.state.ownedUpgrades = ["scanner", "handbook"];
  Game.state.completedDays = [1, 2, 3];
  Game.state.highScore = 140;
  Game.state.story = { morris: "kind" };
  Game.saveProgress();

  // Switch to 'festival-showcase' and verify it starts fresh at Day 1
  Game.selectCampaign("festival-showcase");
  assert.strictEqual(Game.state.day, 1);
  assert.strictEqual(Game.state.money, 0);
  assert.strictEqual(Game.state.reputation, 80);
  assert.deepEqual(Game.state.ownedUpgrades, []);
  assert.deepEqual(Game.state.completedDays, []);

  // Earn progress in 'festival-showcase'
  Game.state.money = 35;
  Game.state.reputation = 88;
  Game.state.ownedUpgrades = ["scanner"];
  Game.state.completedDays = [1];
  Game.state.highScore = 35;
  Game.saveProgress();

  // Render Campaign Selection Screen and verify both campaign cards + Coming Soon card appear
  UI.openCampaignSelectModal();
  const cardsHtml = sandbox.document.getElementById("campaignCardsGrid").innerHTML;
  assert.ok(cardsHtml.includes("The First Week"));
  assert.ok(cardsHtml.includes("7 Days · Learn the Job"));
  assert.ok(cardsHtml.includes("Festival Showcase"));
  assert.ok(cardsHtml.includes("Coming Soon"));

  // Switch back to 'the-first-week' and verify its saved progress is completely intact
  Game.startOrContinueCampaign("the-first-week");
  assert.strictEqual(Game.state.campaignId, "the-first-week");
  assert.strictEqual(Game.state.day, 4);
  assert.strictEqual(Game.state.money, 140);
  assert.strictEqual(Game.state.reputation, 95);
  assert.deepEqual(Game.state.ownedUpgrades, ["scanner", "handbook"]);
  assert.deepEqual(Game.state.completedDays, [1, 2, 3]);
  assert.strictEqual(Game.state.story.morris, "kind");

  // Replay 'festival-showcase' and ensure 'the-first-week' is still untouched
  Game.replayCampaign("festival-showcase");
  assert.strictEqual(Game.state.day, 1);
  assert.strictEqual(Game.state.money, 0);
  const firstWeekSaved = Game.getCampaignSavedState("the-first-week");
  assert.strictEqual(firstWeekSaved.day, 4);
  assert.strictEqual(firstWeekSaved.money, 140);
});

test("12. Independent Language Mode and Gameplay Difficulty + encounter boundary rule", () => {
  const { Game, sandbox } = createHarness(1111);
  const minimalCampaignCode = fs.readFileSync(path.join(ROOT, "tests/minimal-test-campaign.js"), "utf8");
  vm.runInContext(minimalCampaignCode, sandbox);

  Game.selectCampaign("festival-showcase");
  Game.setDifficulty("chaos");
  Game.setLanguageMode("elementary");
  assert.strictEqual(Game.state.difficulty, "chaos");
  assert.strictEqual(Game.state.maxWarnings, 2);
  assert.strictEqual(Game.state.languageMode, "elementary");
  assert.strictEqual(Game.languagePack().unitTitle, "Festival Showcase — Elementary Pack");

  // Start shift in Elementary mode
  Game.startShift();
  const activeCustomer = Game.state.currentCustomer;
  const statementBefore = activeCustomer.statement;
  const evBefore = Game.evaluateCustomerCase(activeCustomer);

  // Change language mode mid-encounter to 'intermediate'
  Game.setLanguageMode("intermediate");
  assert.strictEqual(Game.state.selectedLanguageMode, "intermediate");
  assert.strictEqual(Game.state.languageMode, "elementary", "Active languageMode must not change mid-encounter");
  assert.strictEqual(Game.state.pendingLanguageMode, "intermediate", "Language change must be queued for next encounter/shift boundary");
  assert.strictEqual(activeCustomer.statement, statementBefore, "Active customer's dialogue must not be rewritten mid-encounter");

  const evAfterLangClick = Game.evaluateCustomerCase(activeCustomer);
  assert.deepEqual(evAfterLangClick.validActions, evBefore.validActions, "Language selection must never alter gameplay decisions");

  // Complete current customer and advance to next customer -> boundary applies pendingLanguageMode
  if (evAfterLangClick.needsQuestion) {
    Game.askCustomerQuestion("which_film", "Which film are you going to see?");
  }
  const evReady = Game.evaluateCustomerCase(activeCustomer);
  Game.makeDecision(evReady.validActions[0], evReady.options[0] || null);
  Game.nextCustomerFromQueue();

  assert.strictEqual(Game.state.languageMode, "intermediate", "Next customer boundary must activate pending language mode");
  assert.strictEqual(Game.state.pendingLanguageMode, null);
  assert.strictEqual(Game.languagePack().unitTitle, "Festival Showcase — Intermediate Pack");
});

test("13. Main Menu navigation mid-shift pauses safely and resumes without duplicating state", () => {
  const { Game, UI } = createHarness(1212);
  Game.startShift();

  const custBefore = Game.state.currentCustomer;
  const serialBefore = custBefore.ticket.serial;
  const queueLenBefore = Game.state.queue.length;
  const clockBefore = Game.state.clockMins;
  const casesCountBefore = Game.state.casesGeneratedCount;

  // Open Campaign Selection Screen mid-shift
  UI.openCampaignSelectModal();
  assert.strictEqual(UI.modalStack.has("campaignSelectModal"), true);
  assert.ok(Game.state.modalDepth > 0, "Opening Campaign Menu mid-shift must pause via modalDepth");

  // Tick while menu is open must be a no-op
  Game.tick();
  assert.strictEqual(Game.state.clockMins, clockBefore, "Clock must not advance while Campaign Menu is open");

  // Resume active shift
  UI.resumeActiveShiftFromMenu();
  assert.strictEqual(UI.modalStack.has("campaignSelectModal"), false);
  assert.strictEqual(Game.state.modalDepth, 0);
  assert.strictEqual(Game.state.currentCustomer, custBefore, "Active customer reference must be preserved");
  assert.strictEqual(Game.state.currentCustomer.ticket.serial, serialBefore, "Active ticket must not be regenerated");
  assert.strictEqual(Game.state.queue.length, queueLenBefore, "Queue must not duplicate customers on resume");
  assert.strictEqual(Game.state.casesGeneratedCount, casesCountBefore, "No extra cases should be generated on resume");
});

test("14. Campaign-specific inspection text, active-shift switch protection, and independent Relaxed label", () => {
  const { Game, UI, sandbox } = createHarness(1414);
  const minimalCampaignCode = fs.readFileSync(path.join(ROOT, "tests/minimal-test-campaign.js"), "utf8");
  vm.runInContext(minimalCampaignCode, sandbox);

  // 1. Verify Relaxed difficulty label does not include legacy '(A1)'
  Game.setDifficulty("relaxed");
  const diffBadge = sandbox.document.getElementById("headerDifficultyBadge").textContent;
  assert.strictEqual(diffBadge, "Relaxed Mode");
  assert.ok(!diffBadge.includes("A1"), "Difficulty badge must not conflate difficulty with CEFR A1 label");

  // 2. Verify inspection text on Day 1 (no conditional appearance rule active)
  Game.selectCampaign("the-first-week");
  Game.state.day = 1;
  Game.startShift();
  const day1Compare = Game.compareTwoInspectedItems(
    { category: "portrait", value: "p1", label: "Customer" },
    { category: "rule", value: "ticket", label: "Tickets and bookings" }
  );
  assert.ok(day1Compare.message.includes("No conditional appearance rule is active"), "Day 1 should report no conditional appearance rule active");

  // 3. Verify inspection text on Day 5 of The First Week preserves Friday red-clothing rule
  Game.state.day = 5;
  Game.startShift();
  Game.state.currentCustomer.person.wearingRed = true;
  const day5RedCompare = Game.compareTwoInspectedItems(
    { category: "portrait", value: "WEARING RED", label: "Customer" },
    { category: "rule", value: "red", label: "Screen 2: red clothes" }
  );
  assert.strictEqual(day5RedCompare.message, "Red clothes. Screen 2 requires red after 19:10. All other rules apply.");

  Game.state.currentCustomer.person.wearingRed = false;
  const day5NoRedCompare = Game.compareTwoInspectedItems(
    { category: "portrait", value: "NOT RED", label: "Customer" },
    { category: "rule", value: "red", label: "Screen 2: red clothes" }
  );
  assert.strictEqual(day5NoRedCompare.message, "No red clothes. Screen 2 requires red after 19:10. All other rules apply.");

  // 4. Verify active-shift protection when selecting campaigns from the menu
  const activeCust = Game.state.currentCustomer;
  const activeSerial = activeCust.ticket.serial;
  UI.openCampaignSelectModal();

  // Selecting the currently active campaign from the menu resumes the shift instead of discarding it
  const sameCampRes = Game.startOrContinueCampaign("the-first-week");
  assert.strictEqual(sameCampRes.status, "resumed");
  assert.strictEqual(Game.state.shiftActive, true);
  assert.strictEqual(Game.state.currentCustomer, activeCust);
  assert.strictEqual(Game.state.currentCustomer.ticket.serial, activeSerial);

  // Selecting a DIFFERENT campaign while a shift is active warns first and does NOT discard the shift
  UI.openCampaignSelectModal();
  const switchRes = Game.startOrContinueCampaign("festival-showcase");
  assert.strictEqual(switchRes.status, "warned");
  assert.strictEqual(Game.state.campaignId, "the-first-week", "Campaign must not switch before confirmation");
  assert.strictEqual(Game.state.shiftActive, true, "Shift must remain active until abandonment is confirmed");
  assert.strictEqual(Game.state.currentCustomer, activeCust, "Active customer must not be discarded without confirmation");
  const bannerHtml = sandbox.document.getElementById("campaignMenuActiveShiftBanner").innerHTML;
  assert.ok(bannerHtml.includes("Abandon Active Shift?"), "Warning banner must prompt before abandoning shift");

  // Confirming the pending switch abandons the old shift and loads the new campaign
  const confirmRes = Game.confirmPendingCampaignAction();
  assert.strictEqual(confirmRes.status, "switched");
  assert.strictEqual(Game.state.campaignId, "festival-showcase");
  assert.strictEqual(Game.state.shiftActive, false);

  // 5. Verify inspection text in 'festival-showcase' describes its custom festival glasses rule
  Game.startShift();
  Game.state.currentCustomer.person.glasses = true;
  const festCompare = Game.compareTwoInspectedItems(
    { category: "portrait", value: "WEARING GLASSES", label: "Customer" },
    { category: "rule", value: "gala_glasses", label: "Screen 1: festival glasses" }
  );
  assert.strictEqual(festCompare.message, "Glasses worn. Screen 1 requires festival glasses after 20:00. All other rules apply.");
});

console.log(`\nAll ${passed} test suites passed!`);

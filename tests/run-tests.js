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
    _attrs: {},
    setAttribute(k, v) { this._attrs[k] = String(v); },
    getAttribute(k) { return this._attrs[k] ?? null; },
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
      removeItem(k) { delete this._s[k]; },
      clear() { this._s = {}; }
    },
    URLSearchParams,
    structuredClone,
    setInterval: () => 1,
    clearInterval: () => {},
    setTimeout: () => 1,
    clearTimeout: () => {},
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
    storage: sandbox.localStorage,
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

test("1. Deterministic simulation trace across Days 1-7 and Endless Mode Day 8 (80 encounters)", () => {
  function captureTrace(h) {
    const { Game, sandbox } = h;
    const trace = [];
    for (let day = 1; day <= 8; day++) {
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

  const hA = createHarness(12345);
  const hB = createHarness(12345);
  const tA = captureTrace(hA);
  const tB = captureTrace(hB);
  assert.strictEqual(tA.length, 80);
  for (let i = 0; i < tA.length; i++) {
    assert.strictEqual(JSON.stringify(tA[i]), JSON.stringify(tB[i]), `Mismatch at step ${i}`);
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

test("3. Day 2 rules: film age classifications (G, 12, 16) enforced, Leo underage without ID refused, valid adult horror admitted", () => {
  const { Game } = createHarness(202);
  Game.state.day = 2;
  Game.startShift();

  // First scripted encounter on Day 2 is 14-year-old Leo claiming to be 16 without ID for The Dark House [16]
  const leo = Game.state.currentCustomer;
  assert.strictEqual(leo.person.id, "leo");
  assert.strictEqual(leo.ticket.filmId, "the_dark_house");
  const evLeo = Game.evaluateCustomerCase(leo);
  assert.deepEqual(evLeo.validActions, ["REFUSE"]);
  assert.ok(evLeo.issues.some(i => i.code === "missing_id"));

  // Ordinary adult horror customer with valid ID card must be admitted
  const adultHorror = Game.generateCustomerScenario("adult_horror_day2");
  Game.finalizeCustomerAtWindow(adultHorror);
  assert.strictEqual(adultHorror.ticket.filmId, "the_dark_house");
  const evAdult = Game.evaluateCustomerCase(adultHorror);
  assert.deepEqual(evAdult.validActions, ["ADMIT"]);

  // Procedural underage customer for a [12] or [16] film must be refused
  const underageCust = Game.generateCustomerScenario("underage");
  Game.finalizeCustomerAtWindow(underageCust);
  const evUnderage = Game.evaluateCustomerCase(underageCust);
  assert.deepEqual(evUnderage.validActions, ["REFUSE"]);
  assert.ok(evUnderage.issues.some(i => i.code === "underage"));
});

test("4. Day 3 & Day 4 rules: Day 3 unlocks printer and relocates Planet X to Screen 1; Day 4 enforces duplicates, Promo, and 10-minute late limit", () => {
  const { Game } = createHarness(303);
  Game.state.day = 3;
  Game.startShift();

  const planetX = Game.screening("planet_x");
  assert.strictEqual(planetX.screen, 1);
  assert.strictEqual(planetX.status, "MOVED TO SCR 1");

  // Mr Morris arrives on Day 3 affected by the broken projector -> CORRECT to Screen 1 is compliant service
  const morrisDay3 = Game.state.currentCustomer;
  assert.strictEqual(morrisDay3.person.id, "mr_morris");
  assert.strictEqual(morrisDay3.ticket.filmId, "planet_x");
  const evMorris3 = Game.evaluateCustomerCase(morrisDay3);
  assert.deepEqual(evMorris3.validActions, ["CORRECT"]);
  assert.ok(evMorris3.issues.some(i => i.code === "screen"));

  // Day 4: Someone Is Cheating (duplicates, promo tickets, 10-minute late limit, and late dilemma)
  Game.state.day = 4;
  Game.startShift();

  const dupCust = Game.generateCustomerScenario("duplicate");
  Game.finalizeCustomerAtWindow(dupCust);
  const evDup = Game.evaluateCustomerCase(dupCust);
  assert.deepEqual(evDup.validActions, ["REFUSE"]);
  assert.ok(evDup.issues.some(i => i.code === "duplicate"));

  const promoCust = Game.generateCustomerScenario("promo");
  Game.finalizeCustomerAtWindow(promoCust);
  const evPromo = Game.evaluateCustomerCase(promoCust);
  assert.deepEqual(evPromo.validActions, ["REFUSE"], "Promo tickets with wrong film cannot be corrected");

  const lateDilemma = Game.generateCustomerScenario("dilemma_late_day4");
  Game.finalizeCustomerAtWindow(lateDilemma);
  assert.strictEqual(lateDilemma.person.id, "mr_morris");
  assert.deepEqual(Game.evaluateCustomerCase(lateDilemma).validActions, ["QUESTION"]);
  Game.state.currentCustomer = lateDilemma;
  Game.askCustomerQuestion("which_film", "Which film are you going to see?");
  const evAfterQ = Game.evaluateCustomerCase(lateDilemma);
  assert.deepEqual(evAfterQ.validActions, ["REFUSE"]);
  assert.strictEqual(evAfterQ.discretionary, true);
  const admitRes = Game.applyDecision(lateDilemma, "ADMIT");
  assert.strictEqual(admitRes.accepted, true);
  assert.strictEqual(admitRes.exception, true);
  assert.strictEqual(admitRes.compliant, false);
});

test("5. TV Lounge completely removed from Campaign 1 while generic engine support remains intact for other campaigns", () => {
  const { Game, sandbox } = createHarness(404);
  const firstWeek = sandbox.window.CinemaChaos.CampaignRegistry.get("the-first-week");
  const firstWeekSource = fs.readFileSync(path.join(ROOT, "js/campaigns/the-first-week.js"), "utf8");

  assert.ok(!firstWeekSource.includes("TV Lounge"), "the-first-week.js must contain zero references to TV Lounge");
  assert.strictEqual(firstWeek.languagePack.tvLoungeSchedule.length, 0);

  for (let day = 1; day <= 8; day++) {
    Game.prepareDaySchedule(day);
    assert.strictEqual(Game.state.tvSchedule.length, 0, `Day ${day} of Campaign 1 must have 0 TV Lounge screenings`);
    const dayCfg = Game.dayConfig(day);
    assert.strictEqual(Boolean(dayCfg.policies.tvLoungeOpen), false, `Day ${day} must have tvLoungeOpen: false`);
    assert.ok(!dayCfg.casePool.some(t => t.startsWith("tv")), `Day ${day} casePool must not contain tv cases`);
  }
});

test("6. Day 5 rules: Love in Paris cancelled, Happy Penguins extra show, VIP pass, and Mr Blackwood's conflicting VIP pressure", () => {
  const { Game } = createHarness(505);
  Game.state.day = 5;
  Game.startShift();

  assert.strictEqual(Game.screening("love_in_paris").status, "CANCELLED");
  assert.ok(Game.screening("happy_penguins_late"), "Extra show happy_penguins_late should exist on Day 5");

  // First scripted encounter on Day 5 is Mr Blackwood demanding you admit unlisted VIP-000-CASH
  const blackwood = Game.state.currentCustomer;
  assert.strictEqual(blackwood.person.id, "mr_blackwood");
  assert.strictEqual(blackwood.ticket.serial, "VIP-000-CASH");
  assert.strictEqual(blackwood.managerDirective, true);
  const evBlackwood = Game.evaluateCustomerCase(blackwood);
  assert.deepEqual(evBlackwood.validActions, ["REFUSE"]);
  assert.ok(evBlackwood.issues.some(i => i.code === "vip"));

  // Cancelled film requires questioning customer then correcting
  const cancCust = Game.generateCustomerScenario("cancelled");
  Game.finalizeCustomerAtWindow(cancCust);
  assert.deepEqual(Game.evaluateCustomerCase(cancCust).validActions, ["QUESTION"]);
  Game.state.currentCustomer = cancCust;
  Game.askCustomerQuestion("which_film", "Which film are you going to see?");
  assert.deepEqual(Game.evaluateCustomerCase(cancCust).validActions, ["CORRECT"]);

  // Authorized VIP pass (Mystery Customer VIP-900-INSPECTOR) is valid
  const vipCust = Game.generateCustomerScenario("mystery_day5");
  Game.finalizeCustomerAtWindow(vipCust);
  assert.strictEqual(vipCust.ticket.serial, "VIP-900-INSPECTOR");
  assert.deepEqual(Game.evaluateCustomerCase(vipCust).validActions, ["ADMIT"]);
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
  assert.strictEqual(firstWeek.playableDaysCount, 7);
  assert.strictEqual(Object.keys(firstWeek.days).length, 7);
  assert.ok(firstWeek.endlessDay, "Endless mode should be defined separately from the 7 campaign days");
  assert.strictEqual(firstWeek.endlessDay.dayNum, 8);

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
  badTriggerScreening.days[4].scriptedEncounters[5].trigger.requireLateScreeningId = "unknown_late_film";
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
  badCondRule.days[5].policies.conditionalScreenRules = [{ type: "unsupported_cond_type" }];
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

  // 3. Verify inspection text on Day 3 of The First Week detects obvious disguises vs normal appearance
  Game.state.day = 3;
  Game.startShift();
  Game.state.currentCustomer.person.obviousDisguise = true;
  Game.state.currentCustomer.person.disguiseIssueText = "Customer is wearing a glued-on fake beard.";
  const day3DisguiseCompare = Game.compareTwoInspectedItems(
    { category: "portrait", value: "p_leo", label: "Customer" },
    { category: "rule", value: "age", label: "Age ratings & ID" }
  );
  assert.strictEqual(day3DisguiseCompare.isMatch, false);
  assert.ok(day3DisguiseCompare.message.includes("glued-on fake beard"));

  Game.state.currentCustomer.person.obviousDisguise = false;
  const day3NormalCompare = Game.compareTwoInspectedItems(
    { category: "portrait", value: "p_normal", label: "Customer" },
    { category: "rule", value: "age", label: "Age ratings & ID" }
  );
  assert.ok(day3NormalCompare.message.includes("No conditional appearance rule is active"));

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

test("15. Customer patience, low-patience visual states, departures, statistics separation, and save compatibility", () => {
  const { Game, UI, sandbox, storage } = createHarness(1515);

  // 1 & 2. Patience remains unchanged before shift start, while paused, or when a modal is open
  Game.setDifficulty("normal");
  Game.state.shiftActive = false;
  Game.state.queue = [{ person: { name: "PreShift Guest", coatColor: "#123456" }, patience: 100 }];
  Game.updateQueuePatience();
  assert.strictEqual(Game.state.queue[0].patience, 100, "Patience must not decrease before shift has started");

  Game.startShift();
  assert.ok(Game.state.queue.length >= 1, "Shift starts with waiting customer(s) in queue");
  const w0 = Game.state.queue[0];
  w0.patience = 100;

  // Pause guard
  Game.state.paused = true;
  Game.updateQueuePatience();
  assert.strictEqual(w0.patience, 100, "Patience must not decrease while game is paused");
  Game.state.paused = false;

  // Modal guard (e.g., Guide modal or Campaign Selection Menu open)
  UI.openGuideModal();
  assert.ok(Game.state.modalDepth > 0);
  Game.updateQueuePatience();
  assert.strictEqual(w0.patience, 100, "Patience must not decrease while a modal is open");
  UI.closeGuideModal();

  UI.openCampaignSelectModal();
  assert.ok(Game.state.modalDepth > 0);
  Game.updateQueuePatience();
  assert.strictEqual(w0.patience, 100, "Patience must not decrease while Campaign Selection Menu is open");
  UI.resumeActiveShiftFromMenu();

  // 3. Relaxed mode prevents patience loss and abandonment
  Game.setDifficulty("relaxed");
  w0.patience = 5;
  Game.updateQueuePatience();
  assert.strictEqual(w0.patience, 5, "Relaxed mode must not reduce customer patience");
  assert.strictEqual(Game.state.queue.includes(w0), true, "Customers must not abandon the queue in Relaxed mode");

  // 4. Normal and Chaos modes apply their intended patience rates
  Game.setDifficulty("normal");
  w0.patience = 100;
  Game.updateQueuePatience();
  assert.strictEqual(w0.patience, 99.25, "Normal mode must decrease patience by 0.75 per tick");

  Game.setDifficulty("chaos");
  w0.patience = 100;
  Game.updateQueuePatience();
  assert.strictEqual(w0.patience, 98.5, "Chaos mode must decrease patience by 1.5 per tick");

  // 5. The seating upgrade reduces patience loss by / 1.4
  Game.state.ownedUpgrades = ["seating"];
  Game.setDifficulty("normal");
  w0.patience = 100;
  Game.updateQueuePatience();
  assert.ok(Math.abs(w0.patience - (100 - 0.75 / 1.4)) < 1e-9, "Seating upgrade must slow Normal patience decay by / 1.4");

  Game.setDifficulty("chaos");
  w0.patience = 100;
  Game.updateQueuePatience();
  assert.ok(Math.abs(w0.patience - (100 - 1.5 / 1.4)) < 1e-9, "Seating upgrade must slow Chaos patience decay by / 1.4");
  Game.state.ownedUpgrades = [];

  // Visual states & accessible cues (Normal > 40, Impatient <= 40, Critical <= 20)
  assert.strictEqual(Game.getPatienceState(75), "normal");
  assert.strictEqual(Game.getPatienceState(40), "impatient");
  assert.strictEqual(Game.getPatienceState(25), "impatient");
  assert.strictEqual(Game.getPatienceState(20), "critical");
  assert.strictEqual(Game.getPatienceState(5), "critical");

  w0.patience = 35;
  UI.renderQueue();
  let queueHtml = sandbox.document.getElementById("queueVisualContainer").innerHTML;
  assert.ok(queueHtml.includes('data-patience-state="impatient"'), "Queue item at 35% must have impatient state attribute");
  assert.ok(queueHtml.includes("Impatient"), "Impatient state must include accessible non-color label");

  w0.patience = 15;
  UI.renderQueue();
  queueHtml = sandbox.document.getElementById("queueVisualContainer").innerHTML;
  assert.ok(queueHtml.includes('data-patience-state="critical"'), "Queue item at 15% must have critical state attribute");
  assert.ok(queueHtml.includes("Critical"), "Critical state must include accessible non-color label");

  // 6, 7 & 8. Customer leaves queue at 0 patience, applies -3 reputation, increments customersLost, and does NOT increment mistakes
  Game.setDifficulty("normal");
  UI.clearDepartureBanner();
  const repBefore = Game.state.reputation;
  const mistakesBefore = Game.state.shiftStats.mistakes;
  const lostBefore = Game.state.shiftStats.customersLost;
  const totalLostBefore = Game.state.totalCustomersLost;

  w0.patience = 0.5; // Will hit 0 on next Normal tick (0.75 decay)
  const departed = Game.updateQueuePatience();
  assert.strictEqual(departed.length, 1, "One customer should depart when patience reaches 0");
  assert.strictEqual(Game.state.queue.includes(w0), false, "Departed customer must be removed from queue");
  assert.strictEqual(Game.state.reputation, repBefore - 3, "Abandonment must apply -3 reputation penalty");
  assert.strictEqual(Game.state.shiftStats.customersLost, lostBefore + 1, "Abandonment must increment shiftStats.customersLost");
  assert.strictEqual(Game.state.totalCustomersLost, totalLostBefore + 1, "Abandonment must increment state.totalCustomersLost");
  assert.strictEqual(Game.state.shiftStats.mistakes, mistakesBefore, "Abandonment must NOT increment shiftStats.mistakes");

  const bannerEl = sandbox.document.getElementById("queueDepartureBanner");
  assert.strictEqual(bannerEl.classList.contains("hidden"), false, "Departure notification banner must be visible");
  assert.ok(bannerEl.innerHTML.includes("CUSTOMER LEFT THE QUEUE"), "Banner must announce customer departure");
  assert.ok(bannerEl.innerHTML.includes("Reputation −3"), "Banner must show Reputation −3 penalty");

  // 9. Multiple departures do not break the queue and group cleanly
  UI.clearDepartureBanner();
  const c1 = { person: { name: "Guest One", coatColor: "#111" }, patience: 0.4 };
  const c2 = { person: { name: "Guest Two", coatColor: "#222" }, patience: 80 };
  const c3 = { person: { name: "Guest Three", coatColor: "#333" }, patience: 0.2 };
  Game.state.queue = [c1, c2, c3];
  const repBeforeMulti = Game.state.reputation;
  const multiDeparted = Game.updateQueuePatience();
  assert.strictEqual(multiDeparted.length, 2, "Both expiring customers must depart on the same tick");
  assert.strictEqual(Game.state.queue.length, 1, "Surviving customer must remain in queue");
  assert.strictEqual(Game.state.queue[0], c2, "First-come, first-served order of remaining queue must be preserved");
  assert.strictEqual(Game.state.reputation, repBeforeMulti - 6, "Two simultaneous departures must apply -6 reputation");
  assert.strictEqual(Game.state.shiftStats.customersLost, 3, "shiftStats.customersLost must reflect all 3 departed customers");
  assert.strictEqual(Game.state.shiftStats.mistakes, mistakesBefore, "shiftStats.mistakes must still remain 0");
  assert.ok(bannerEl.innerHTML.includes("2 CUSTOMERS LEFT THE QUEUE"), "Banner must group multiple departures");
  assert.ok(bannerEl.innerHTML.includes("Reputation −6"), "Banner must show grouped Reputation −6");

  // Verify End-of-Shift report displays Customers Lost separately from Inspection Mistakes
  Game.endShift("SHIFT COMPLETE");
  assert.strictEqual(String(sandbox.document.getElementById("reportCustomersLost").textContent), "3");
  assert.strictEqual(String(sandbox.document.getElementById("reportMistakes").textContent), "0");

  // 10. Older saved games without totalCustomersLost load without errors and default to 0
  storage.clear();
  storage.setItem("cinema_chaos_save_v2", JSON.stringify({
    version: 2,
    day: 3,
    difficulty: "normal",
    money: 95,
    reputation: 82,
    ownedUpgrades: ["seating"],
    completedDays: [1, 2],
    highScore: 95,
    story: {}
  }));
  Game.loadProgress("the-first-week");
  assert.strictEqual(Game.state.day, 3);
  assert.strictEqual(Game.state.money, 95);
  assert.strictEqual(Game.state.totalCustomersLost, 0, "Older V2 save without totalCustomersLost must default to 0");

  // 11. Menu pause/resume and campaign switching preserve patience and per-campaign totalCustomersLost
  const minimalCampaignCode = fs.readFileSync(path.join(ROOT, "tests/minimal-test-campaign.js"), "utf8");
  vm.runInContext(minimalCampaignCode, sandbox);

  Game.state.totalCustomersLost = 4;
  Game.saveProgress();
  Game.selectCampaign("festival-showcase");
  assert.strictEqual(Game.state.totalCustomersLost, 0, "New campaign starts with 0 totalCustomersLost");
  Game.selectCampaign("the-first-week");
  assert.strictEqual(Game.state.totalCustomersLost, 4, "Switching back restores campaign's saved totalCustomersLost");
});

test("16. Shift objectives, authoritative warning thresholds, mistakes vs warnings vs discretionary admissions, and pass/fail progression", () => {
  const { Game, UI, sandbox } = createHarness(1616);
  const doc = sandbox.document;

  // 1 & 4. Authoritative warning thresholds in Relaxed, Normal, and Chaos reflected in Briefing & HUD
  for (const [diff, expectedLimit, expectedOrd] of [
    ["relaxed", Game.getMaxWarnings("relaxed"), Game.getWarningOrdinal(Game.getMaxWarnings("relaxed"))],
    ["normal", Game.getMaxWarnings("normal"), Game.getWarningOrdinal(Game.getWarningThresholds ? Game.getMaxWarnings("normal") : 3)],
    ["chaos", Game.getMaxWarnings("chaos"), Game.getWarningOrdinal(Game.getMaxWarnings("chaos"))]
  ]) {
    Game.setDifficulty(diff);
    assert.strictEqual(Game.state.maxWarnings, expectedLimit, `maxWarnings must match authoritative limit for ${diff}`);
    assert.strictEqual(doc.getElementById("warningsDisplay").textContent, `0 / ${expectedLimit}`);
    assert.strictEqual(doc.getElementById("briefingWarningThresholdBadge").textContent, `Management warnings: 0 / ${expectedLimit}`);
    assert.ok(
      doc.getElementById("briefingObjectiveLead").textContent.includes("Serve customers correctly and finish your shift without receiving too many management warnings."),
      "Briefing must display clear shift objective"
    );
    assert.ok(
      doc.getElementById("briefingObjectiveRuleNote").textContent.includes(`Receiving your ${expectedOrd} warning`),
      `Briefing must state the ${expectedOrd} warning dismissal rule for ${diff}`
    );
  }

  // 5. Distinction between inspection mistakes and management warnings (including Handbook forgiveness)
  Game.setDifficulty("normal"); // limit = 3
  Game.state.day = 1;
  Game.state.ownedUpgrades = ["handbook"];
  Game.startShift();

  // Force a valid customer and deliberately REFUSE them (an inspection mistake)
  const validCust = Game.generateCustomerScenario("valid");
  Game.finalizeCustomerAtWindow(validCust);
  Game.state.currentCustomer = validCust;
  Game.makeDecision("REFUSE");

  // Because of the Handbook upgrade, this first mistake is recorded as an inspection mistake (1), but 0 warnings!
  assert.strictEqual(Game.state.shiftStats.mistakes, 1, "Incorrect decision must increment inspection mistakes");
  assert.strictEqual(Game.state.warnings, 0, "Handbook upgrade forgives the first management warning, keeping warnings distinct from mistakes");
  assert.ok(doc.getElementById("deskFeedbackBanner").textContent.includes("Inspection mistake"), "Feedback must identify inspection mistake");
  assert.ok(doc.getElementById("deskFeedbackBanner").textContent.includes("Ticket refused incorrectly"), "Feedback must explain why warning was triggered/forgiven");

  // Remove handbook and make another mistake -> now both mistakes (2) and warnings (1 / 3) increment
  Game.state.ownedUpgrades = [];
  Game.nextCustomerFromQueue();
  const validCust2 = Game.generateCustomerScenario("valid");
  Game.finalizeCustomerAtWindow(validCust2);
  Game.state.currentCustomer = validCust2;
  Game.makeDecision("REFUSE");

  assert.strictEqual(Game.state.shiftStats.mistakes, 2);
  assert.strictEqual(Game.state.warnings, 1);
  assert.strictEqual(doc.getElementById("warningsDisplay").textContent, `1 / ${Game.getMaxWarnings("normal")}`);
  assert.strictEqual(doc.getElementById("warningsBox").getAttribute("data-warning-state"), "caution");
  assert.ok(
    doc.getElementById("deskFeedbackBanner").textContent.includes(`Ticket refused incorrectly — Management warning 1 / ${Game.getMaxWarnings("normal")}`),
    "Feedback must state specific warning reason and count"
  );

  // 6. Deliberate discretionary admission (Day 4 late dilemma) issues a warning WITHOUT counting as an inspection mistake
  Game.state.day = 4;
  Game.startShift();
  Game.state.clockMins = 1108; // Past 18:25 so 18:15 screening is >10 mins late
  const dilemmaCust = Game.generateCustomerScenario("dilemma_late_day4");
  Game.finalizeCustomerAtWindow(dilemmaCust);
  Game.state.currentCustomer = dilemmaCust;
  UI.renderCustomer(dilemmaCust);
  UI.renderTicketOnDesk(dilemmaCust);

  // Verify pre-decision trade-off notice is rendered on the desk
  const deskCard = doc.getElementById("deskDocumentArea").children[0];
  const hasDilemmaWarning = deskCard && deskCard.children.some(ch => String(ch.textContent).includes("Management may issue a warning if you make an exception"));
  assert.ok(hasDilemmaWarning, "Ticket desk must warn player before making a discretionary exception");

  Game.askCustomerQuestion("which_film", "Which film are you going to see?");
  const cashBeforeExc = Game.state.money;
  const repBeforeExc = Game.state.reputation;
  Game.makeDecision("ADMIT"); // Deliberate compassionate exception

  assert.strictEqual(Game.state.shiftStats.mistakes, 0, "Deliberate discretionary admission must NOT count as an inspection mistake");
  assert.strictEqual(Game.state.shiftStats.exceptions, 1, "Discretionary admission must be tracked in shiftStats.exceptions");
  assert.strictEqual(Game.state.warnings, 1, "Discretionary admission must issue 1 management warning");
  assert.strictEqual(Game.state.money, cashBeforeExc + 6, "Discretionary admission awards +€6");
  assert.strictEqual(Game.state.reputation, repBeforeExc + 4, "Discretionary admission awards +4 reputation");
  assert.ok(
    doc.getElementById("deskFeedbackBanner").textContent.includes("Discretionary admission — Management warning issued"),
    "Feedback must clearly label discretionary admission and warning"
  );

  // 7. Customer abandonment does NOT count as an inspection mistake or a management warning
  Game.state.queue = [{ person: { name: "Impatient Guest", coatColor: "#444" }, patience: 0.2 }];
  Game.updateQueuePatience();
  assert.strictEqual(Game.state.shiftStats.customersLost, 1);
  assert.strictEqual(Game.state.shiftStats.mistakes, 0, "Customer abandonment must not increment mistakes");
  assert.strictEqual(Game.state.warnings, 1, "Customer abandonment must not issue a management warning");

  // 2 & 8. Passing a shift below the warning threshold unlocks the next day and updates Staff Report
  Game.state.clockMins = Game.state.clockEndMins;
  Game.nextCustomerFromQueue(); // Ends shift at closing time with 1 / 3 warnings
  assert.strictEqual(Game.state.shiftActive, false);
  assert.strictEqual(Game.state.lastShiftDismissed, false);
  assert.strictEqual(doc.getElementById("reportModalTitle").textContent, "SHIFT COMPLETE — WELL DONE");
  assert.strictEqual(
    doc.getElementById("reportOutcomeSummary").textContent,
    "You completed your shift without reaching the management warning limit."
  );
  assert.strictEqual(doc.getElementById("reportWarnings").textContent, `1 / ${Game.getMaxWarnings("normal")}`);
  assert.strictEqual(String(doc.getElementById("reportMistakes").textContent), "0");
  assert.strictEqual(String(doc.getElementById("reportCustomersLost").textContent), "1");
  assert.ok(Game.state.completedDays.includes(4), "Passing Day 4 must record Day 4 in completedDays");
  assert.strictEqual(doc.getElementById("nextDayContinueBtn").classList.contains("hidden"), false);

  const advancedOk = Game.advanceToNextDay();
  assert.strictEqual(advancedOk, true);
  assert.strictEqual(Game.state.day, 5, "Advancing after passing Day 4 must unlock Day 5");
  assert.strictEqual(Game.state.warnings, 0, "Advancing to next day must reset warnings to 0");

  // 3, 9 & 10. Failing immediately when warning threshold is reached, blocking progression, and requiring replay
  Game.setDifficulty("normal"); // limit = 3
  Game.startShift();
  const limit = Game.getMaxWarnings("normal");

  for (let i = 1; i <= limit; i++) {
    const cust = Game.generateCustomerScenario("valid");
    Game.finalizeCustomerAtWindow(cust);
    Game.state.currentCustomer = cust;
    Game.state.decisionLocked = false;
    Game.makeDecision("REFUSE"); // Wrong decision -> issues warning i
    if (i < limit) {
      assert.strictEqual(Game.state.shiftActive, true, `Shift should remain active at ${i} / ${limit} warnings`);
      if (i === limit - 1) {
        assert.strictEqual(doc.getElementById("warningsBox").getAttribute("data-warning-state"), "danger", "HUD must show danger state on final warning");
        assert.strictEqual(doc.getElementById("warningsUrgencyBadge").textContent, "Final Warning");
      }
      Game.nextCustomerFromQueue();
    }
  }

  // On the 3rd warning, the shift must fail immediately without waiting for Next Customer
  assert.strictEqual(Game.state.warnings, limit);
  assert.strictEqual(Game.state.shiftActive, false, "Reaching the warning threshold must immediately end the shift");
  assert.strictEqual(Game.state.lastShiftDismissed, true);
  assert.strictEqual(doc.getElementById("warningsBox").getAttribute("data-warning-state"), "dismissed");
  assert.strictEqual(doc.getElementById("reportModalTitle").textContent, "SHIFT FAILED — MANAGEMENT DISMISSED YOU");
  assert.strictEqual(
    doc.getElementById("reportOutcomeSummary").textContent,
    `You received ${limit} management warnings. The limit for this shift was ${limit}.`
  );
  assert.strictEqual(doc.getElementById("reportWarnings").textContent, `${limit} / ${limit}`);
  assert.strictEqual(Game.state.completedDays.includes(5), false, "Failing Day 5 must NOT add Day 5 to completedDays");
  assert.strictEqual(doc.getElementById("nextDayContinueBtn").classList.contains("hidden"), true, "Continue button must be hidden after failure");
  assert.ok(doc.getElementById("replayShiftBtn").textContent.includes("Replay Day 5"), "Replay button must indicate Day 5 must be replayed");

  // Attempting to advance after failure (or bypass via menu) must not unlock Day 6
  assert.strictEqual(Game.advanceToNextDay(), false, "advanceToNextDay() must refuse to advance after a failed shift");
  assert.strictEqual(Game.state.day, 5, "Day must remain 5 after failed shift");

  UI.openCampaignSelectModal();
  Game.startOrContinueCampaign("the-first-week");
  assert.strictEqual(Game.state.day, 5, "Continuing from Campaign Selection Screen must stay on Day 5");

  // Replaying current day resets shift counters and prepares Day 5 briefing cleanly
  Game.replayCurrentDay();
  assert.strictEqual(Game.state.day, 5);
  assert.strictEqual(Game.state.warnings, 0);
  assert.strictEqual(Game.state.lastShiftDismissed, false);
  assert.strictEqual(Game.state.shiftStats.mistakes, 0);
  assert.strictEqual(doc.getElementById("warningsDisplay").textContent, `0 / ${limit}`);

  // 11 & 12. Warning feedback and thresholds remain consistent when switching campaigns
  const minimalCampaignCode = fs.readFileSync(path.join(ROOT, "tests/minimal-test-campaign.js"), "utf8");
  vm.runInContext(minimalCampaignCode, sandbox);

  Game.selectCampaign("festival-showcase");
  Game.setDifficulty("chaos"); // limit = 2
  const chaosLimit = Game.getMaxWarnings("chaos");
  assert.strictEqual(doc.getElementById("briefingWarningThresholdBadge").textContent, `Management warnings: 0 / ${chaosLimit}`);
  Game.startShift();

  const festValid = Game.generateCustomerScenario("valid");
  Game.finalizeCustomerAtWindow(festValid);
  Game.state.currentCustomer = festValid;
  Game.makeDecision("REFUSE");
  assert.strictEqual(Game.state.warnings, 1);
  assert.ok(
    doc.getElementById("deskFeedbackBanner").textContent.includes(`Ticket refused incorrectly — Management warning 1 / ${chaosLimit}`),
    "Warning feedback must be consistent across campaigns"
  );
});

test("17. Seven-day campaign progression (Monday Day 1 through Sunday Day 7) and Endless Mode Day 8", () => {
  const { Game, sandbox } = createHarness(1717);
  const doc = sandbox.document;
  const expectedDays = [
    [1, "MONDAY", "Day 1 — The New Employee"],
    [2, "TUESDAY", "Day 2 — Not Old Enough"],
    [3, "WEDNESDAY", "Day 3 — The Broken Projector"],
    [4, "THURSDAY", "Day 4 — Someone Is Cheating"],
    [5, "FRIDAY", "Day 5 — Special Treatment"],
    [6, "SATURDAY", "Day 6 — The Big Premiere"],
    [7, "SUNDAY", "Day 7 — The Final Inspection"]
  ];

  for (const [dayNum, dayName, title] of expectedDays) {
    assert.strictEqual(Game.state.day, dayNum);
    const cfg = Game.dayConfig(dayNum);
    assert.strictEqual(cfg.dayName, dayName);
    assert.strictEqual(cfg.title, title);

    Game.startShift();
    // Complete shift cleanly at closing time
    Game.state.clockMins = Game.state.clockEndMins;
    Game.nextCustomerFromQueue();
    assert.strictEqual(Game.state.shiftActive, false);
    assert.strictEqual(Game.state.lastShiftDismissed, false);
    assert.ok(Game.state.completedDays.includes(dayNum));

    if (dayNum < 7) {
      assert.ok(doc.getElementById("nextDayContinueBtn").textContent.includes(`CONTINUE TO DAY ${dayNum + 1}`));
      assert.strictEqual(Game.advanceToNextDay(), true);
    } else {
      assert.ok(doc.getElementById("nextDayContinueBtn").textContent.includes("ENTER ENDLESS MODE"));
      assert.ok(Game.state.lastCampaignEnding, "Completing Day 7 must evaluate a campaign ending");
      assert.strictEqual(Game.advanceToNextDay(), true);
    }
  }

  // Day 8 is Endless Mode
  assert.strictEqual(Game.state.day, 8);
  assert.strictEqual(Game.dayConfig(8).dayName, "ENDLESS SHIFT");
});

test("18. Age restriction rules, exact date-of-birth calculation (on/before/after birthday, leap years), and ID inspection", () => {
  const { Game } = createHarness(1818);
  Game.state.day = 2; // Tuesday, 2026-10-13
  Game.startShift();

  // Exact birthday boundary tests on 2026-10-13
  assert.strictEqual(Game.calculateAge("2010-10-13", "2026-10-13"), 16, "Birthday today (13 Oct 2010) must be exactly 16");
  assert.strictEqual(Game.calculateAge("2010-10-12", "2026-10-13"), 16, "Birthday yesterday (12 Oct 2010) must be 16");
  assert.strictEqual(Game.calculateAge("2010-10-14", "2026-10-13"), 15, "Birthday tomorrow (14 Oct 2010) must still be 15");

  // Leap year and invalid calendar date validation
  assert.strictEqual(Game.isValidCalendarDate("2008-02-29"), true, "2008 is a leap year");
  assert.strictEqual(Game.isValidCalendarDate("2009-02-29"), false, "2009 is not a leap year");
  assert.strictEqual(Game.isValidCalendarDate("2010-02-30"), false, "Feb 30 is never valid");

  // 15-year-old turning 16 tomorrow must be refused for [16] The Dark House
  const almost16 = Game.generateCustomerScenario("valid");
  Game.finalizeCustomerAtWindow(almost16);
  almost16.ticket.filmId = "the_dark_house";
  almost16.ticket.filmTitle = "The Dark House";
  almost16.ticket.genreLabel = "Horror";
  almost16.ticket.screen = 3;
  almost16.ticket.time = "21:00";
  almost16.known.preference = { ids: ["the_dark_house"] };
  almost16.intent = { ids: ["the_dark_house"] };
  Game.state.bookings[almost16.ticket.serial].screeningId = "the_dark_house";
  almost16.claimedAge = 15;
  almost16.trueAge = 15;
  almost16.idCard = { exists: true, presented: true, holderName: almost16.person.name, dob: "2010-10-14" };
  const evAlmost16 = Game.evaluateCustomerCase(almost16);
  assert.deepEqual(evAlmost16.validActions, ["REFUSE"]);
  assert.ok(evAlmost16.issues.some(i => i.code === "underage"));

  // Turning 16 today (2010-10-13) must be admitted for [16] The Dark House
  almost16.claimedAge = 16;
  almost16.trueAge = 16;
  almost16.idCard.dob = "2010-10-13";
  const evExact16 = Game.evaluateCustomerCase(almost16);
  assert.deepEqual(evExact16.validActions, ["ADMIT"]);

  // Inspect Mode comparisons for ID DOB, age, name, and photo
  Game.state.currentCustomer = almost16;
  const dobScheduleCmp = Game.compareTwoInspectedItems(
    { category: "id_dob", value: "2010-10-13", label: "ID DOB" },
    { category: "schedule_row", value: "the_dark_house", label: "The Dark House" }
  );
  assert.strictEqual(dobScheduleCmp.isMatch, true);
  assert.ok(dobScheduleCmp.message.includes("Age 16"));
});

test("19. Leo's six-day narrative arc (Days 2-6 disguises/forgeries refused, Day 7 honest visit for G comedy admitted)", () => {
  const { Game } = createHarness(1919);

  // Day 2: The Simple Lie (claims 16, no ID, wants The Dark House [16]) -> REFUSE
  Game.state.day = 2;
  Game.startShift();
  const leo2 = Game.state.currentCustomer;
  assert.strictEqual(leo2.person.id, "leo");
  assert.strictEqual(leo2.ticket.filmId, "the_dark_house");
  assert.deepEqual(Game.evaluateCustomerCase(leo2).validActions, ["REFUSE"]);
  Game.makeDecision("REFUSE");
  assert.strictEqual(Game.state.story.leo_day2_outcome, "refused");
  assert.strictEqual(Game.state.story.leo_caught_count, 1);

  // Day 3: The Fake Beard -> REFUSE
  Game.state.day = 3;
  Game.startShift();
  const leo3 = Game.generateCustomerScenario("leo_day3");
  Game.finalizeCustomerAtWindow(leo3);
  Game.state.currentCustomer = leo3;
  assert.strictEqual(leo3.person.id, "leo");
  assert.strictEqual(leo3.person.fakeBeard, true);
  assert.strictEqual(leo3.person.obviousDisguise, true);
  assert.ok(leo3.statement.includes("not Leo from yesterday"), "Day 3 dialogue reflects Day 2 refusal");
  assert.deepEqual(Game.evaluateCustomerCase(leo3).validActions, ["REFUSE"]);
  Game.makeDecision("REFUSE");
  assert.strictEqual(Game.state.story.leo_beard_detected, "yes");
  assert.strictEqual(Game.state.story.leo_caught_count, 2);

  // Day 4: The False Identity ("Mr Leonardo Smith" in oversized suit & sunglasses, father's ID) -> REFUSE
  Game.state.day = 4;
  Game.startShift();
  const leo4 = Game.generateCustomerScenario("leo_day4");
  Game.finalizeCustomerAtWindow(leo4);
  Game.state.currentCustomer = leo4;
  assert.strictEqual(leo4.person.oversizedSuit, true);
  assert.strictEqual(leo4.person.sunglasses, true);
  assert.strictEqual(leo4.ticket.holderName, "Leo");
  assert.strictEqual(leo4.idCard.holderName, "Leonardo Senior");
  assert.ok(leo4.statement.includes("bearded imposter"), "Day 4 dialogue references Day 3 beard detection");
  const evLeo4 = Game.evaluateCustomerCase(leo4);
  assert.deepEqual(evLeo4.validActions, ["REFUSE"]);
  assert.ok(evLeo4.issues.some(i => i.code === "id_name"));
  Game.makeDecision("REFUSE");
  assert.strictEqual(Game.state.story.leo_caught_count, 3);

  // Day 5: The Fake ID (marker moustache, statedAge 17 vs DOB 2012-09-10 = age 14) -> REFUSE
  Game.state.day = 5;
  Game.startShift();
  const leo5 = Game.generateCustomerScenario("leo_day5");
  Game.finalizeCustomerAtWindow(leo5);
  Game.state.currentCustomer = leo5;
  assert.strictEqual(leo5.person.editedMoustache, true);
  assert.strictEqual(leo5.idCard.statedAge, 17);
  assert.strictEqual(leo5.idCard.dob, "2012-09-10");
  const evLeo5 = Game.evaluateCustomerCase(leo5);
  assert.deepEqual(evLeo5.validActions, ["REFUSE"]);
  assert.ok(evLeo5.issues.some(i => i.code === "id_forged"));
  Game.makeDecision("REFUSE");
  assert.strictEqual(Game.state.story.leo_caught_count, 4);

  // Day 6: The Cinema Employee (staff hat, homemade badge, STAFF-99-LEO pass) -> REFUSE
  Game.state.day = 6;
  Game.startShift();
  const leo6 = Game.generateCustomerScenario("leo_day6");
  Game.finalizeCustomerAtWindow(leo6);
  Game.state.currentCustomer = leo6;
  assert.strictEqual(leo6.person.staffHat, true);
  assert.strictEqual(leo6.person.staffBadge, true);
  assert.strictEqual(leo6.ticket.ticketType, "STAFF PASS");
  const evLeo6 = Game.evaluateCustomerCase(leo6);
  assert.deepEqual(evLeo6.validActions, ["REFUSE"]);
  assert.ok(evLeo6.issues.some(i => i.code === "staff"));
  Game.makeDecision("REFUSE");
  assert.strictEqual(Game.state.story.leo_caught_count, 5);

  // Day 7: The Honest Customer (no disguise, valid ticket for G-rated Laughing Bananas, real ID) -> MUST ADMIT
  Game.state.day = 7;
  Game.startShift();
  const leo7 = Game.state.currentCustomer;
  assert.strictEqual(leo7.person.id, "leo");
  assert.strictEqual(leo7.person.obviousDisguise, false);
  assert.strictEqual(leo7.ticket.filmId, "laughing_bananas");
  assert.ok(leo7.statement.includes("No fake beard"), "Day 7 dialogue references his previous disguises");
  const evLeo7 = Game.evaluateCustomerCase(leo7);
  assert.deepEqual(evLeo7.validActions, ["ADMIT"], "Honest Leo on Day 7 with G-rated comedy ticket must be admitted");

  // Verify that refusing Leo on Day 7 is penalized as an inspection mistake
  const draft = Game.applyDecision(structuredClone(leo7), "REFUSE");
  assert.strictEqual(draft.accepted, false, "Refusing honest Leo on Day 7 must be rejected as an inspection mistake");

  // Admitting Leo on Day 7 succeeds compliantly
  Game.makeDecision("ADMIT");
  assert.strictEqual(Game.state.story.leo_day7_outcome, "helped");
});

test("20. Story consequences affecting gameplay: Maya's balcony boost, Mr Morris's family booking, Sofia's clue, and Blackwood's directive", () => {
  // Branch A: Help Mr Morris, Maya, and Sofia on Days 1, 3, 4 -> verify gameplay benefits on Day 6
  const { Game: GameHelped } = createHarness(2020);
  GameHelped.state.day = 3;
  GameHelped.startShift();

  // Help Mr Morris on Day 3 (relocated Planet X -> Screen 1)
  const morris3 = GameHelped.state.currentCustomer;
  assert.strictEqual(morris3.person.id, "mr_morris");
  GameHelped.makeDecision("CORRECT", GameHelped.screening("planet_x"));
  assert.strictEqual(GameHelped.state.story.morris_relationship, "loyal");

  // Help Maya on Day 3 (misprinted Wild World ticket -> Screen 2)
  GameHelped.nextCustomerFromQueue();
  const maya3 = GameHelped.state.currentCustomer;
  assert.strictEqual(maya3.person.id, "maya");
  GameHelped.makeDecision("CORRECT", GameHelped.screening("wild_world"));
  assert.strictEqual(GameHelped.state.story.maya_relationship, "helped");

  // Help Sofia on Day 4
  GameHelped.state.day = 4;
  GameHelped.startShift();
  const sofia4 = GameHelped.state.currentCustomer;
  assert.strictEqual(sofia4.person.id, "sofia");
  GameHelped.makeDecision("CORRECT", GameHelped.screening("love_in_paris"));
  assert.strictEqual(GameHelped.state.story.sofia_trust, "ally");

  // Advance to Day 6 (Premiere Night): Maya's storyScheduleBoost unlocks +4 seats in planet_x (2 -> 6 seats)
  GameHelped.state.day = 6;
  GameHelped.startShift();
  assert.strictEqual(GameHelped.screening("planet_x").capacity, 6, "Helping Maya on Day 3 must boost Planet X capacity from 2 to 6 on Day 6");
  assert.strictEqual(GameHelped.screening("planet_x").status, "EXTRA ROW OPEN");

  // Mr Morris's 3-person family booking on Day 6 is ready to ADMIT immediately when loyal
  const morris6 = GameHelped.state.currentCustomer;
  assert.strictEqual(morris6.person.id, "mr_morris");
  assert.strictEqual(morris6.groupSize, 3);
  assert.deepEqual(GameHelped.evaluateCustomerCase(morris6).validActions, ["ADMIT"]);
  GameHelped.makeDecision("ADMIT");
  assert.strictEqual(GameHelped.state.story.morris_commendation, "yes");

  // Maya's 3-person premiere group for Planet X on Day 6 can be CORRECTed because the extra balcony seats are open
  GameHelped.nextCustomerFromQueue();
  const maya6 = GameHelped.state.currentCustomer;
  assert.strictEqual(maya6.person.id, "maya");
  assert.strictEqual(maya6.groupSize, 3);
  assert.deepEqual(GameHelped.evaluateCustomerCase(maya6).validActions, ["CORRECT"]);

  // Branch B: Do NOT help Mr Morris or Maya -> on Day 6, Planet X has only 2 seats so the 3-person group must be REFUSEd
  const { Game: GameBlamed } = createHarness(2020);
  GameBlamed.state.story = { morris_relationship: "cold", maya_relationship: "blamed", sofia_trust: "distant" };
  GameBlamed.state.day = 6;
  GameBlamed.startShift();
  assert.strictEqual(GameBlamed.screening("planet_x").capacity, 2, "Without Maya's help, Planet X capacity remains 2 on Day 6");

  // Mr Morris's family booking on Day 6 requires QUESTION + CORRECT when not loyal
  const morris6Cold = GameBlamed.state.currentCustomer;
  assert.strictEqual(morris6Cold.person.id, "mr_morris");
  assert.deepEqual(GameBlamed.evaluateCustomerCase(morris6Cold).validActions, ["QUESTION"]);
  GameBlamed.askCustomerQuestion("which_film", "Which film are you going to see?");
  assert.deepEqual(GameBlamed.evaluateCustomerCase(morris6Cold).validActions, ["CORRECT"]);
  GameBlamed.makeDecision("CORRECT", GameBlamed.screening("wild_world"));

  // Maya's 3-person group for Planet X must be REFUSEd because only 2 seats exist in Screen 1
  GameBlamed.nextCustomerFromQueue();
  const maya6Blamed = GameBlamed.state.currentCustomer;
  assert.strictEqual(maya6Blamed.person.id, "maya");
  assert.deepEqual(GameBlamed.evaluateCustomerCase(maya6Blamed).validActions, ["REFUSE"]);
});

test("21. Guaranteed recurring character encounters appear reliably across multiple random seeds", () => {
  const seeds = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1010];
  const expectedByDay = {
    1: ["mr_morris", "sofia", "mr_blackwood"],
    2: ["leo"],
    3: ["mr_morris", "maya", "leo"],
    4: ["sofia", "leo", "mystery", "maya", "mr_morris"],
    5: ["mr_blackwood", "leo", "mystery"],
    6: ["mr_morris", "maya", "leo", "sofia", "mr_blackwood"],
    7: ["leo", "mr_morris", "mr_blackwood", "mystery"]
  };

  for (const seed of seeds) {
    const { Game } = createHarness(seed);
    for (let day = 1; day <= 7; day++) {
      Game.state.day = day;
      Game.startShift();
      const seenCharacterIds = [];
      for (let step = 0; step < 6; step++) {
        const c = Game.state.currentCustomer;
        if (c.person.id) seenCharacterIds.push(c.person.id);
        const ev = Game.evaluateCustomerCase(c);
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
      for (const reqChar of expectedByDay[day]) {
        assert.ok(
          seenCharacterIds.includes(reqChar),
          `Seed ${seed}, Day ${day}: expected character '${reqChar}' in [${seenCharacterIds.join(", ")}]`
        );
      }
    }
  }
});

test("22. All five campaign endings are deterministically achievable and rendered in Sunday's report with character callbacks", () => {
  const { Game, sandbox } = createHarness(2222);
  const doc = sandbox.document;

  // 1. Employee of the Week (clean compliance, high reputation, zero corrupt passes)
  Game.state.day = 7;
  Game.state.reputation = 92;
  Game.state.story = {
    morris_relationship: "loyal",
    leo_day7_outcome: "helped",
    maya_relationship: "helped",
    manager_compliance: 0,
    manager_conflict: 1,
    inspection_violations: 0,
    total_mistakes: 0
  };
  Game.endShift();
  assert.strictEqual(Game.state.lastCampaignEnding.id, "employee_of_the_week");
  assert.ok(doc.getElementById("reportStoryNotes").innerHTML.includes("Employee of the Week"));
  assert.ok(doc.getElementById("reportStoryNotes").innerHTML.includes("Mr Morris"));

  // 2. The People's Champion (helped Morris, Maya, Leo on Day 7, and made compassionate exception)
  Game.state.reputation = 85;
  Game.state.story = {
    morris_day3_outcome: "helped",
    morris_relationship: "loyal",
    maya_relationship: "helped",
    leo_day7_outcome: "helped",
    total_exceptions: 1,
    people_champion_path: "yes",
    manager_compliance: 0,
    manager_conflict: 1
  };
  Game.endShift();
  assert.strictEqual(Game.state.lastCampaignEnding.id, "peoples_champion");
  assert.ok(doc.getElementById("reportStoryNotes").innerHTML.includes("The People&#39;s Champion"));

  // 3. Management Material (obeyed Mr Blackwood's VIP-000 directives)
  Game.state.reputation = 76;
  Game.state.story = {
    manager_compliance: 2,
    inspection_violations: 2
  };
  Game.endShift();
  assert.strictEqual(Game.state.lastCampaignEnding.id, "management_material");
  assert.ok(doc.getElementById("reportStoryNotes").innerHTML.includes("Management Material"));

  // 4. The Whistleblower (refused Mr Blackwood's unlisted passes and exposed fraud with Sofia's evidence)
  Game.state.reputation = 88;
  Game.state.story = {
    manager_conflict: 2,
    manager_compliance: 0,
    sofia_evidence: "yes",
    whistleblower_identified: "yes",
    inspector_day7_outcome: "helped"
  };
  Game.endShift();
  assert.strictEqual(Game.state.lastCampaignEnding.id, "the_whistleblower");
  assert.ok(doc.getElementById("reportStoryNotes").innerHTML.includes("The Whistleblower"));
  assert.ok(doc.getElementById("reportStoryNotes").innerHTML.includes("Sofia"));

  // 5. You're Fired! (dismissed or severe compliance failures)
  Game.state.warnings = Game.getMaxWarnings("normal");
  Game.endShift();
  assert.strictEqual(Game.state.lastCampaignEnding.id, "youre_fired");
  assert.ok(doc.getElementById("reportStoryNotes").innerHTML.includes("You&#39;re Fired!"));
});

test("23. Extended multi-day story state and numeric counters persist across saveProgress and loadProgress", () => {
  const { Game } = createHarness(2323);
  Game.state.day = 6;
  Game.state.story = {
    morris_relationship: "loyal",
    morris_day3_outcome: "helped",
    sofia_trust: "ally",
    sofia_evidence: "yes",
    maya_relationship: "helped",
    leo_day2_outcome: "refused",
    leo_beard_detected: "yes",
    leo_caught_count: 4,
    manager_conflict: 2,
    manager_compliance: 0,
    inspection_violations: 0,
    whistleblower_identified: "yes"
  };
  Game.saveProgress();

  Game.state.day = 1;
  Game.state.story = {};
  Game.loadProgress("the-first-week");

  assert.strictEqual(Game.state.day, 6);
  assert.strictEqual(Game.state.story.morris_relationship, "loyal");
  assert.strictEqual(Game.state.story.sofia_trust, "ally");
  assert.strictEqual(Game.state.story.maya_relationship, "helped");
  assert.strictEqual(Game.state.story.leo_beard_detected, "yes");
  assert.strictEqual(Game.state.story.leo_caught_count, 4);
  assert.strictEqual(Game.state.story.manager_conflict, 2);
  assert.strictEqual(Game.state.story.whistleblower_identified, "yes");
});

console.log(`\nAll ${passed} test suites passed!`);

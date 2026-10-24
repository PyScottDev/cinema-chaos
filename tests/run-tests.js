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

console.log(`\nAll ${passed} test suites passed!`);

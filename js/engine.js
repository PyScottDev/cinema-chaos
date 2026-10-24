    /***************************************************************************
     * 5. CENTRAL VALIDATION ENGINE & SCENARIO GENERATOR
     ***************************************************************************/
    const Game = {
      state: {
        campaignId: "the-first-week",
        languageMode: "elementary", // 'elementary' | 'intermediate' | 'advanced'
        selectedLanguageMode: "elementary",
        pendingLanguageMode: null,
        customLanguagePack: null,
        day: 1,
        story: {}, bookings: {}, outcomes: [], modalDepth: 0, serialCounter: 400,
        difficulty: "normal", // 'relaxed' | 'normal' | 'chaos'
        money: 0,
        reputation: 80,
        warnings: 0,
        maxWarnings: 3,
        ownedUpgrades: [],
        completedDays: [],
        highScore: 0,

        // Teacher Settings
        showLanguageHints: false,
        enableTVContent: true,
        disableQueueWalkouts: false,

        // Live Shift State
        shiftActive: false,
        paused: false,
        clockMins: 17 * 60 + 45, // 17:45
        clockEndMins: 21 * 60 + 15, // 21:15
        clockFormatted: "17:45",

        schedule: [],
        tvSchedule: [],
        usedSerials: [],
        authorizedVips: [],

        currentCustomer: null,
        queue: [],
        casesGeneratedCount: 0,
        shiftStats: {
          served: 0,
          correct: 0,
          mistakes: 0,
          cashEarned: 0,
          dilemmaNotes: []
        },

        // Inspection Tool State
        inspectMode: true,
        inspectFirst: null,
        decisionLocked: false
      },

      timerInterval: null,
      rngSeed: Date.now() % 2147483647,

      // Seeded pseudo-random generator for reproducible & balanced case distribution
      rng() {
        this.rngSeed = (this.rngSeed * 16807) % 2147483647;
        return (this.rngSeed - 1) / 2147483646;
      },

      campaign() {
        const reg = window.CinemaChaos && window.CinemaChaos.CampaignRegistry;
        if (!reg) throw new Error("CampaignRegistry is not loaded.");
        return reg.get(this.state.campaignId) || reg.list()[0];
      },

      dayConfig(day = this.state.day) {
        const camp = this.campaign();
        const playableMax = camp.playableDaysCount || camp.totalDays || 5;
        if (day > playableMax || (camp.days[day] && camp.days[day].playable === false)) {
          return camp.endlessDay || camp.days[day] || camp.days[playableMax];
        }
        return camp.days[day] || camp.endlessDay || camp.days[1];
      },

      policies(day = this.state.day) {
        return this.dayConfig(day).policies || {};
      },

      languagePack() {
        if (this.state.customLanguagePack) return this.state.customLanguagePack;
        const camp = this.campaign();
        const mode = this.state.languageMode || "elementary";
        if (camp.languageModes?.[mode]?.available && camp.languagePacks?.[mode]) {
          return camp.languagePacks[mode];
        }
        return camp.languagePack;
      },

      upgradesCatalog() {
        return this.campaign()?.upgradesCatalog || [];
      },

      init() {
        this.loadProgress();
        const seed = Number(new URLSearchParams(location.search).get("seed"));
        if(Number.isInteger(seed)&&seed>0) this.rngSeed=seed%2147483647||1;
        this.prepareDaySchedule(this.state.day);
        UI.renderHeader();
        UI.renderScheduleBinder();
        UI.renderRulesBinder();
        UI.renderSerialsBinder();
        UI.renderUpgradesStrip();
        UI.openBriefingModal(this.state.day);
        UI.openCampaignSelectModal({ isInitialLaunch: true });
        document.getElementById('languagePackJsonArea').value = JSON.stringify(this.languagePack(), null, 2);
        document.getElementById('saveNotice').textContent=this.startupMessage||'Progress saves between customers. Reloading starts this shift again.';
        const day=document.getElementById('scheduleDayTag');day.tabIndex=0;day.setAttribute('role','button');day.classList.add('inspectable');day.onclick=()=>Game.handleInspectClick('today',Game.today(),'Today: '+Game.today(),day);
        document.getElementById('customerStatementBox').tabIndex=0;document.getElementById('clockInspectBox').tabIndex=0;
        UI.setDecisionButtons(true);
        if(innerWidth<1024)UI.switchMobileTab('window');
      },

      formatMins(totalMins) {
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      },

      setDifficulty(diff) {
        if (!["relaxed","normal","chaos"].includes(diff)) return;
        this.state.difficulty = diff;
        this.state.maxWarnings = diff === 'relaxed' ? 4 : diff === 'normal' ? 3 : 2;
        if(this.state.shiftActive) this.startShiftLoop();
        UI.updateDifficultyButtons();
        UI.renderHeader();
        this.saveProgress();
      },

      setLanguageMode(mode) {
        if (!["elementary", "intermediate", "advanced"].includes(mode)) return;
        this.state.selectedLanguageMode = mode;
        const inActiveEncounter = Boolean(this.state.shiftActive && this.state.currentCustomer && !this.state.decisionLocked);
        if (inActiveEncounter) {
          this.state.pendingLanguageMode = mode;
        } else {
          this.state.languageMode = mode;
          this.state.pendingLanguageMode = null;
        }
        UI.updateLanguageButtons();
        UI.renderHeader();
        this.saveProgress();
      },

      applyPendingLanguageMode() {
        if (this.state.pendingLanguageMode) {
          this.state.languageMode = this.state.pendingLanguageMode;
          this.state.pendingLanguageMode = null;
          UI.updateLanguageButtons();
          UI.renderHeader();
        }
      },

      selectCampaign(campaignId) {
        const reg = window.CinemaChaos && window.CinemaChaos.CampaignRegistry;
        const target = reg && reg.get(campaignId);
        if (!target) throw new Error(`Unknown campaign: "${campaignId}"`);
        if (this.state.campaignId && this.state.campaignId !== campaignId) {
          this.saveProgress();
        }
        this.stopShiftLoop();
        this.state.shiftActive = false;
        this.state.paused = false;
        this.state.currentCustomer = null;
        this.state.decisionLocked = false;
        this.state.queue = [];
        this.state.customLanguagePack = null;
        this.state.campaignId = campaignId;
        this.loadProgress(campaignId);
        this.applyPendingLanguageMode();
        this.prepareDaySchedule(this.state.day);
        UI.renderHeader();
        UI.renderScheduleBinder();
        UI.renderRulesBinder();
        UI.renderSerialsBinder();
        UI.renderUpgradesStrip();
        this.saveProgress();
      },

      startOrContinueCampaign(campaignId) {
        this.selectCampaign(campaignId);
        UI.closeCampaignSelectModal();
        UI.closeShiftReportModal();
        UI.openBriefingModal(this.state.day);
      },

      replayCampaign(campaignId) {
        this.selectCampaign(campaignId);
        Object.assign(this.state, {
          day: 1,
          money: 0,
          reputation: 80,
          warnings: 0,
          ownedUpgrades: [],
          completedDays: [],
          story: {},
          outcomes: []
        });
        this.prepareDaySchedule(1);
        this.saveProgress();
        UI.closeCampaignSelectModal();
        UI.closeShiftReportModal();
        UI.renderHeader();
        UI.renderScheduleBinder();
        UI.renderRulesBinder();
        UI.renderSerialsBinder();
        UI.renderUpgradesStrip();
        UI.openBriefingModal(1);
      },

      updateTeacherSettings() {
        this.state.showLanguageHints=document.getElementById('teacherToggleHints').checked;
        this.state.enableTVContent=document.getElementById('teacherToggleTV').checked;
        this.state.disableQueueWalkouts=document.getElementById('teacherToggleTimer').checked;
        if(this.state.currentCustomer) UI.renderCustomer(this.state.currentCustomer);
        this.saveProgress();
      },

      teacherJumpToDay() {
        this.stopShiftLoop();this.state.shiftActive=false;this.state.currentCustomer=null;this.state.decisionLocked=false;
        this.state.day=Number(document.getElementById('teacherDaySelect').value)||1;
        this.applyPendingLanguageMode();
        UI.closeTeacherModal();UI.closeShiftReportModal();UI.closeCampaignSelectModal();this.prepareDaySchedule(this.state.day);
        UI.renderHeader();UI.renderScheduleBinder();UI.renderRulesBinder();UI.renderSerialsBinder();UI.openBriefingModal(this.state.day);this.saveProgress();
      },

      exportLanguagePack() {
        const text=JSON.stringify(this.languagePack(),null,2),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
        a.href=url;a.download='cinema-language-pack.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        document.getElementById('languagePackJsonArea').value=text;
      },

      applyCustomLanguagePack() {
        const msg=document.getElementById('jsonStatusMsg');
        try {
          const parsed=this.validateLanguagePack(JSON.parse(document.getElementById('languagePackJsonArea').value));
          localStorage.setItem('cinema_chaos_pack_v2',JSON.stringify(parsed));
          this.state.customLanguagePack=parsed;
          this.stopShiftLoop();this.state.shiftActive=false;this.state.currentCustomer=null;
          this.prepareDaySchedule(this.state.day);UI.renderScheduleBinder();UI.renderRulesBinder();UI.openBriefingModal(this.state.day);
          msg.textContent='✓ Pack saved. Close settings and start a new shift.';msg.className='text-xs text-emerald-400';
        } catch(e){msg.textContent='Pack not changed: '+e.message;msg.className='text-xs text-rose-400';}
      },

      startShift() {
        this.stopShiftLoop();this.state.modalDepth=0;UI.modalStack.clear();UI.closeBriefingModal();UI.closeCampaignSelectModal();
        this.applyPendingLanguageMode();
        this.prepareDaySchedule(this.state.day);
        Object.assign(this.state,{shiftActive:true,paused:false,clockMins:1065,clockFormatted:'17:45',warnings:0,queue:[],casesGeneratedCount:0,
          forgivenWarningUsed:false,currentCustomer:null,decisionLocked:false,closing:false,outcomes:[],
          shiftStats:{served:0,correct:0,mistakes:0,cashEarned:0,dilemmaNotes:[]}});
        this.setDifficulty(this.state.difficulty);SoundFX.bell();
        UI.renderHeader();UI.renderScheduleBinder();UI.renderRulesBinder();UI.renderSerialsBinder();UI.renderUpgradesStrip();UI.renderPause();
        this.spawnCustomerToQueue();this.spawnCustomerToQueue();this.nextCustomerFromQueue();this.startShiftLoop();
      },

      startShiftLoop() {
        this.stopShiftLoop();
        this.timerInterval=setInterval(()=>this.tick(),this.state.difficulty==='relaxed'?2400:this.state.difficulty==='chaos'?1150:1600);
      },

      stopShiftLoop() {
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      },

      togglePause() { if(this.state.shiftActive&&!this.state.modalDepth){this.state.paused=!this.state.paused;UI.renderPause();} },

      updateQueuePatience() {
        if(!this.state.disableQueueWalkouts && this.state.difficulty!=='relaxed') {
          const decay=(this.state.difficulty==='chaos'?1.5:0.75)/(this.state.ownedUpgrades.includes('seating')?1.4:1);
          this.state.queue=this.state.queue.filter(c=>{
            c.patience=Math.max(0,c.patience-decay);
            if(c.patience>0)return true;
            this.state.shiftStats.mistakes++;this.adjustReputation(-3);UI.renderHeader();return false;
          });
        }
        UI.renderQueue();
      },

      /*************************************************************************
       * SCENARIO GENERATOR: Creates and checks cases against live state
       * ~40% valid straightforward cases, ~60% varied inspection challenges
       *************************************************************************/
      // All screenings are fixed for a shift. Only announced setup events change them.
      allScreenings() { return [...this.state.schedule, ...this.state.tvSchedule]; },
      screening(id) { return this.allScreenings().find(f => f.id === id); },
      today() { return this.dayConfig().dayName; },
      arrival(c) { return c.arrivalTime ?? this.state.clockMins; },
      booking(c) { return this.state.bookings[c.ticket?.serial]; },
      freeSeats(f) {
        return f.capacity - Object.values(this.state.bookings).filter(b => b.screeningId === f.id && b.status !== 'cancelled').reduce((n,b) => n+b.seats,0);
      },
      syncSeats() { this.allScreenings().forEach(f => { f.unallocatedSeats = this.freeSeats(f); }); },
      canEnter(f, c) {
        if (!f || f.status === 'CANCELLED') return false;
        const pol = this.policies();
        if (pol.lateToleranceMins !== null && pol.lateToleranceMins !== undefined && this.arrival(c) > f.timeMins + pol.lateToleranceMins) {
          return false;
        }
        if (Array.isArray(pol.conditionalScreenRules)) {
          for (const rule of pol.conditionalScreenRules) {
            if (String(f.screen) === String(rule.screen) && this.arrival(c) > rule.afterMins && !c.person?.[rule.requiredPersonProp]) {
              return false;
            }
          }
        }
        return true;
      },
      accepts(c, f, requirements = c.known.preference) {
        if (!requirements) return false;
        return (!requirements.ids || requirements.ids.includes(f.id)) && (!requirements.genres || requirements.genres.includes(f.genre))
          && (!requirements.notGenres || !requirements.notGenres.includes(f.genre)) && (!requirements.latest || f.timeMins <= requirements.latest);
      },
      correctionOptions(c) {
        const t = c.ticket, b = this.booking(c), pol = this.policies();
        if (!pol.allowCorrections || !t?.exists || t.date !== this.today() || this.state.usedSerials.includes(t.serial)
          || !b || b.status !== 'reserved' || (!pol.allowPromoChanges && t.ticketType.includes('PROMO')) || t.ticketType.includes('VIP') || !c.known.preference) return [];
        return this.allScreenings().filter(f => this.canEnter(f,c) && this.accepts(c,f)
          && this.freeSeats(f)+(b.screeningId===f.id ? b.seats:0) >= c.groupSize);
      },
      evaluateCustomerCase(c) {
        const t = c.ticket, f = this.screening(t?.filmId), b = this.booking(c), pol = this.policies(), issues = [];
        const add=(code,text,hard=false)=>issues.push({code,text,hard});
        if(!t?.exists) add('missing','No ticket.',true);
        else {
          if(t.date!==this.today()) add('date',`Ticket: ${t.date}. Today: ${this.today()}.`,true);
          if(this.state.usedSerials.includes(t.serial)) add('duplicate','This ticket number is already used.',true);
          if(t.ticketType.includes('VIP') && (!pol.allowVipPasses || !this.state.authorizedVips.includes(t.serial))) add('vip','This VIP number is not on the list.',true);
          if(!['STANDARD','PROMO (NO CHANGE)','MANAGER VIP PASS','TV LOUNGE PASS','REPLACEMENT PRINTED'].includes(t.ticketType)) add('authenticity','This ticket type is not valid.',true);
          if(!b || b.status!=='reserved') add('booking','There is no unused booking for this ticket.',true);
          if(!f) add('film','This film is not on the programme.',true);
          if(f) {
            if((f.screen==='TV Lounge'&&!t.ticketType.includes('LOUNGE')&&!t.ticketType.includes('VIP')) || (f.screen!=='TV Lounge'&&t.ticketType.includes('LOUNGE'))) add('pass','The ticket type does not match this room.');
            if(f.status==='CANCELLED') add('cancelled','This film is cancelled.');
            if(t.filmTitle!==f.title) add('title','The film name does not match the booking.');
            if(String(t.screen)!==String(f.screen)) add('screen',`Ticket room: ${t.screen}. Programme room: ${f.screen}.`);
            if(this.parseTime(t.time)!==f.timeMins) add('time',`Ticket time: ${t.time}. Programme time: ${f.time}.`);
            if(pol.lateToleranceMins !== null && pol.lateToleranceMins !== undefined && this.arrival(c) > f.timeMins + pol.lateToleranceMins) {
              add('late',`Arrival ${this.formatMins(this.arrival(c))}: more than ${pol.lateToleranceMins} minutes late.`);
            }
            for (const rule of (pol.conditionalScreenRules || [])) {
              if (String(f.screen) === String(rule.screen) && this.arrival(c) > rule.afterMins && !c.person?.[rule.requiredPersonProp]) {
                add(rule.id || 'conditional', rule.issueText || `Screen ${rule.screen} conditional rule not met.`);
              }
            }
            if(b && (b.screeningId!==f.id || b.seats!==t.seats || t.seats<c.groupSize)) add('seats',`Booking: ${b.seats} seat(s). People: ${c.groupSize}.`);
            if(b && this.freeSeats(f)<0) add('capacity','There are not enough seats.',true);
            if(c.known.preference && !this.accepts(c,f)) add('preference','The ticket does not match the customer’s plan.');
          }
        }
        const hard=issues.some(i=>i.hard), needsQuestion=!!(c.requiredTicketQuestion&&!t?.exists)||(!hard && !!c.requiredQuestion && !c.known.preference);
        const options=hard ? [] : this.correctionOptions(c);
        let validActions=[];
        if(needsQuestion) validActions=['QUESTION'];
        else if(!issues.length) validActions=['ADMIT'];
        else validActions=options.length ? ['CORRECT'] : ['REFUSE'];
        // Discretionary dilemma customers may decline an alternative. A compassionate admission is recorded separately, not scored as compliant.
        if(c.dilemma && !needsQuestion && issues.length && !hard && !validActions.includes('REFUSE')) validActions.push('REFUSE');
        const discretionary=!!c.dilemma && issues.length===1 && issues[0].code==='late';
        return {validActions,issues,options,needsQuestion,discretionary,reason:issues.map(i=>i.text).join(' ') || 'The booking and ticket match.'};
      },
      parseTime(t) { if(!/^\d{2}:\d{2}$/.test(t||'')) return NaN; const [h,m]=t.split(':').map(Number); return h<24 && m<60 ? h*60+m:NaN; },
      pick(list) { return list.length ? list[Math.floor(this.rng()*list.length)] : null; },
      makeUniqueSerial() { const prefix = this.campaign()?.serialPrefix || 'GC'; return prefix+'-'+this.state.day+'-'+(++this.state.serialCounter); },
      prepareDaySchedule(day) {
        const camp = this.campaign();
        const dayCfg = this.dayConfig(day);
        const pol = dayCfg.policies || {};
        const pack = this.languagePack();
        this.state.bookings={}; this.state.serialCounter=400;
        this.state.authorizedVips = [...(camp.authorizedVips || [])];
        this.state.schedule=(pack.films||[]).map(f=>({...f, status:'ON TIME',originalScreen:f.screen,unallocatedSeats:f.capacity}));
        this.state.tvSchedule=pol.tvLoungeOpen && this.state.enableTVContent ? (pack.tvLoungeSchedule||[]).map(f=>({...f,status:'ON TIME',unallocatedSeats:f.capacity})):[];
        for (const ch of (dayCfg.scheduleChanges || [])) {
          if (ch.type === 'relocate') {
            const moved = this.screening(ch.screeningId);
            if (moved) {
              moved.screen = ch.toScreen;
              moved.status = ch.statusLabel || `MOVED TO SCR ${ch.toScreen}`;
            }
          } else if (ch.type === 'cancel') {
            const cancelled = this.screening(ch.screeningId);
            if (cancelled) {
              cancelled.status = ch.statusLabel || 'CANCELLED';
            }
          } else if (ch.type === 'add_extra') {
            const base = this.screening(ch.sourceScreeningId);
            if (base) {
              this.state.schedule.push({
                ...base,
                id: ch.newId,
                screen: ch.screen,
                time: ch.time,
                timeMins: ch.timeMins ?? this.parseTime(ch.time),
                status: ch.statusLabel || 'EXTRA SHOW'
              });
            }
          }
        }
        this.state.schedule.sort((a,b)=>a.timeMins-b.timeMins);this.state.tvSchedule.sort((a,b)=>a.timeMins-b.timeMins);
        this.state.usedSerials=[...(pol.initialUsedSerials || [])];
        this.state.scriptedDone={}; this.state.noticesSeen={};
        this.state.clockEndMins=Math.max(...this.allScreenings().map(f=>f.timeMins))+10;
        this.state.scheduleSnapshot=this.allScreenings().map(f=>[f.id,f.time,f.timeMins,f.screen,f.status]);
      },
      // Queue visitors have no invented tickets yet: cases are constructed from the live state at the window.
      spawnCustomerToQueue() {
        this.state.queue.push({person:CHARACTERS.createRandomPerson(()=>this.rng()),patience:100}); UI.renderQueue();
      },
      generateCustomerScenario(forcedType=null, person=null) {
        const s=this.state, now=s.clockMins, camp=this.campaign(), dayCfg=this.dayConfig(), pol=this.policies();
        const shell={person:person||CHARACTERS.createRandomPerson(()=>this.rng()),arrivalTime:now};
        const open=this.allScreenings().filter(f=>this.canEnter(f,shell) && this.freeSeats(f)>=1);
        const lateTol = pol.lateToleranceMins ?? 10;
        const late=this.allScreenings().filter(f=>f.status!=='CANCELLED' && now>f.timeMins+lateTol && this.freeSeats(f)>=1);
        const pickId=(id)=>open.find(f=>f.id===id);

        const findScriptedEncounter = () => {
          for (const enc of (dayCfg.scriptedEncounters || [])) {
            if (enc.oncePerShift && s.scriptedDone[enc.id]) continue;
            const tr = enc.trigger || {};
            if (tr.minClockMins !== undefined && now < tr.minClockMins) continue;
            if (tr.maxClockMins !== undefined && now > tr.maxClockMins) continue;
            if (tr.caseIndex !== undefined && s.casesGeneratedCount !== tr.caseIndex) continue;
            if (tr.requireOpenScreeningId && !pickId(tr.requireOpenScreeningId)) continue;
            if (tr.requireLateScreeningId && !late.find(f => f.id === tr.requireLateScreeningId)) continue;
            if (tr.requireOpenRoom && !open.some(f => f.screen === tr.requireOpenRoom)) continue;
            if (tr.requireStoryFlag && !s.story[tr.requireStoryFlag]) continue;
            if (tr.requireUnusedSerial && s.usedSerials.includes(tr.requireUnusedSerial)) continue;
            return enc;
          }
          return null;
        };

        let type = forcedType;
        let scripted = null;
        if (!type) {
          scripted = findScriptedEncounter();
          if (scripted) {
            type = scripted.caseType;
          } else if (this.rng() < 0.40) {
            type = this.pick(['valid', 'valid', 'subjective']);
          } else {
            const basePool = dayCfg.casePool || ['wrong_film', 'screen', 'time', 'date', 'missing'];
            const types = [];
            for (const candidate of basePool) {
              if (candidate === 'late' && (!late.length || pol.lateToleranceMins === null)) continue;
              if (candidate === 'tv_wrong' && !open.some(f => f.screen === 'TV Lounge')) continue;
              if (candidate === 'cancelled' && !this.state.schedule.some(f => f.status === 'CANCELLED')) continue;
              if ((candidate === 'red' || candidate === 'no_red') && !(pol.conditionalScreenRules || []).some(r => now > r.afterMins && now <= r.afterMins + 15)) continue;
              types.push(candidate);
            }
            type = this.pick(types);
          }
        } else {
          scripted = (dayCfg.scriptedEncounters || []).find(e => e.caseType === type || e.id === type)
            || Object.values(camp.days || {}).flatMap(d => d.scriptedEncounters || []).find(e => e.caseType === type || e.id === type)
            || null;
        }

        const isLateScripted = Boolean(scripted?.trigger?.requireLateScreeningId || scripted?.dilemma);
        if (!open.length && type !== 'late' && !isLateScripted) {
          type = (late.length && pol.lateToleranceMins !== null) ? 'late' : 'missing';
          scripted = null;
        }

        let f = this.pick(open) || this.allScreenings()[0], desired = f;
        if (scripted && scripted.targetScreeningId && !scripted.wrongFilmTicket && !isLateScripted && type !== 'move' && type !== 'red' && type !== 'no_red') {
          f = desired = pickId(scripted.targetScreeningId) || f;
        }
        if (type === 'move') {
          const relocId = scripted?.targetScreeningId || (dayCfg.scheduleChanges || []).find(ch => ch.type === 'relocate')?.screeningId;
          f = desired = (relocId ? pickId(relocId) : null) || open.find(x => x.originalScreen !== undefined && x.originalScreen !== x.screen);
          if (!f) return this.generateCustomerScenario('screen', person);
        }
        if (type.startsWith('tv')) {
          f = desired = this.pick(open.filter(x => x.screen === 'TV Lounge'));
          if (!f) return this.generateCustomerScenario('valid', person);
        }
        if (type === 'late' || isLateScripted) {
          const targetLateId = scripted?.targetScreeningId || scripted?.trigger?.requireLateScreeningId;
          f = desired = targetLateId ? late.find(x => x.id === targetLateId) : this.pick(late);
          if (!f) return this.generateCustomerScenario('screen', person);
        }
        if (type === 'red' || type === 'no_red') {
          const condRule = (pol.conditionalScreenRules || [])[0];
          const extraShow = (dayCfg.scheduleChanges || []).find(ch => ch.type === 'add_extra');
          const redTargetId = scripted?.targetScreeningId || extraShow?.newId;
          f = desired = redTargetId ? this.screening(redTargetId) : this.state.schedule.find(x => String(x.screen) === String(condRule?.screen) && x.timeMins > (condRule?.afterMins ?? 0));
          const afterMins = condRule?.afterMins ?? 1150;
          if (!f || now <= afterMins || now > f.timeMins + lateTol || this.freeSeats(f) < 1) return this.generateCustomerScenario('screen', person);
          shell.person = CHARACTERS.createRandomPerson(() => this.rng(), type === 'red');
        }
        if (type === 'cancelled') {
          f = this.state.schedule.find(x => x.status === 'CANCELLED');
          desired = this.pick(open.filter(x => x.screen !== f?.screen));
          if (!f || f.status !== 'CANCELLED' || !desired || this.freeSeats(f) < 1) return this.generateCustomerScenario('screen', person);
        }
        if (['wrong_film', 'promo', 'incomplete', 'change'].includes(type) || scripted?.wrongFilmTicket) {
          desired = scripted?.targetScreeningId ? pickId(scripted.targetScreeningId) : this.pick(open);
          const other = this.pick(open.filter(x => x.genre !== desired?.genre));
          if (!desired || !other) return this.generateCustomerScenario('screen', person);
          f = other;
        }
        if (type === 'group' && this.freeSeats(f) < 3) return this.generateCustomerScenario('screen', person);

        const group = type === 'group' ? 3 : 1;
        const singleDescriptions = (f.descriptions || [f.statement]).filter(text => !/^We|^We're/.test(text) && !/\bfamily|partner\b/.test(text));
        const purposeText = `I'm here ${f.purposePhrases?.[0] || 'to have fun'}.`;
        const statementChoices = [
          { text: `I'm going to see ${f.title}.`, namesPlan: true },
          ...singleDescriptions.map(text => ({ text, namesPlan: true })),
          { text: purposeText, namesPlan: false }
        ];
        const chosenStatement = this.pick(statementChoices);

        const c = {
          ...shell,
          groupSize: group,
          caseType: type,
          patience: 100,
          known: { preference: { ids: [desired.id] }, publicPlan: Boolean(chosenStatement?.namesPlan) },
          intent: { ids: [desired.id] },
          dialogue: [],
          asked: [],
          questionedYet: false,
          requiredQuestion: false,
          statement: chosenStatement ? chosenStatement.text : `I'm going to see ${f.title}.`,
          ticket: {
            exists: true,
            serial: this.makeUniqueSerial(),
            filmId: f.id,
            filmTitle: f.title,
            genreLabel: f.genreLabel,
            screen: f.screen,
            time: f.time,
            date: this.today(),
            seats: 1,
            ticketType: f.screen === 'TV Lounge' ? 'TV LOUNGE PASS' : 'STANDARD'
          }
        };

        const vocabulary = camp.vocabularyHints || {};
        c.languageHint = vocabulary[f.adjective] || vocabulary.default || '“To learn” tells us why someone does something.';

        if (['wrong_film', 'promo', 'change'].includes(type) || scripted?.wrongFilmTicket) {
          c.intent = c.known.preference = { genres: scripted?.intentGenres ? [...scripted.intentGenres] : [desired.genre] };
          c.statement = `I'm not going to watch this film. I want ${desired.genre === 'comedy' ? 'something funny' : `a ${desired.genreLabel.toLowerCase()}`}.`;
          c.known.publicPlan = true;
        }
        if (type === 'screen' || type === 'combined' || type === 'tv_wrong') c.ticket.screen = f.screen === 1 ? 2 : 1;
        if (type === 'time' || type === 'combined') c.ticket.time = '17:00';
        if (type === 'move') c.ticket.screen = f.originalScreen;
        if (type === 'date') c.ticket.date = 'LAST SUNDAY';
        if (type === 'missing' || type === 'hidden_ticket') {
          if (type === 'hidden_ticket') {
            c.backupTicket = { ...c.ticket };
            c.requiredTicketQuestion = true;
            c.statement = "My ticket? It isn't in my bag. One moment...";
          } else {
            c.statement = "I haven't got a ticket. I'm not going to buy one.";
          }
          c.ticket = { exists: false, reason: 'No ticket on the desk.' };
          c.known.publicPlan = false;
        }
        if (type === 'incomplete') {
          c.known.preference = null;
          c.known.publicPlan = false;
          c.requiredQuestion = true;
          c.statement = "I'm going to meet my friends. Which film are we going to see? Let me check.";
        }
        if (type === 'cancelled') {
          c.intent = { genres: [desired.genre] };
          c.known.preference = null;
          c.known.publicPlan = false;
          c.requiredQuestion = true;
          c.statement = `I'm going to see ${f.title}. Can I watch another film?`;
        }
        if (type === 'group') { c.statement = `We're going to see ${f.title}. There are three of us.`; c.known.publicPlan = true; }
        if (type === 'duplicate') c.ticket.serial = this.pick(s.usedSerials);
        if (type === 'promo') c.ticket.ticketType = 'PROMO (NO CHANGE)';
        if (type === 'late') { c.statement = `I'm late. I only want to see ${f.title}.`; c.known.publicPlan = true; }
        if (type === 'subjective') { c.statement = `I'm going to watch ${f.title} to relax.`; c.known.publicPlan = true; }
        if (type === 'red' || type === 'no_red') {
          c.statement = `I'm going to see ${f.title} at ${f.time}.`;
          c.intent = c.known.preference = { ids: [f.id] };
          c.known.publicPlan = true;
        }

        if (scripted) {
          if (scripted.characterId && camp.characters?.[scripted.characterId]) {
            c.person = { ...camp.characters[scripted.characterId] };
            if (scripted.personTagOverride) c.person.tag = scripted.personTagOverride;
          }
          if (scripted.storyKey) c.storyKey = scripted.storyKey;
          if (scripted.dilemma) c.dilemma = true;
          if (scripted.requiredQuestion) {
            c.known.preference = null;
            c.known.publicPlan = false;
            c.requiredQuestion = true;
          }
          if (scripted.intentGenres) {
            c.intent = { genres: [...scripted.intentGenres] };
            if (!scripted.requiredQuestion) c.known.preference = { genres: [...scripted.intentGenres] };
          }
          if (scripted.vipSerial) {
            c.ticket.serial = scripted.vipSerial;
            c.ticket.ticketType = 'MANAGER VIP PASS';
          }
          const formatTpl = (tpl) => tpl
            .replace(/\{title\}/g, f.title)
            .replace(/\{time\}/g, f.time)
            .replace(/\{lateMins\}/g, String(now - f.timeMins));
          if (scripted.statementTemplate) {
            c.statement = formatTpl(scripted.statementTemplate);
            if (!scripted.requiredQuestion) c.known.publicPlan = true;
          } else if (scripted.statementByStory) {
            const storyState = s.story[scripted.storyKey];
            const tpl = scripted.statementByStory[storyState] || scripted.statementByStory.default || `Today I'm going to see {title}.`;
            c.statement = formatTpl(tpl);
            c.known.publicPlan = true;
          }
          c.isScriptedAdmit = Boolean(!scripted.dilemma && !scripted.wrongFilmTicket && type !== 'move');
        }

        c.statementSummary = c.statement;
        const requiresPlanConfirmation = ['incomplete', 'wrong_film', 'promo', 'change'].includes(type) || Boolean(scripted?.wrongFilmTicket);
        c.qaResponses = {
          which_film: c.intent.genres ? `I want a ${c.intent.genres.join(' or ')}. Any one is fine.` : `I'm going to see ${desired.title}.`,
          why_see: `I'm here ${desired.purposePhrases?.[0] || 'to have fun'}.`,
          are_you_sure: requiresPlanConfirmation ? `No. ${c.intent.genres ? `I want a ${c.intent.genres[0]}.` : `I want ${desired.title}.`}` : `Yes. I'm going to see ${f.title}.`,
          how_many: `There ${group === 1 ? 'is one person' : 'are ' + group + ' people'}.`,
          friends_coming: group > 1 ? "Yes, they are. We're going to watch together." : "No. He isn't going to come today.",
          other_ticket: type === 'hidden_ticket' ? "Here it is! It was in my coat." : "No. I don't have another ticket.",
          alternative: c.intent.genres ? `A ${c.intent.genres.join(' or ')} is OK.` : `Only ${desired.title}, please.`
        };
        if (scripted?.qaOverrides) {
          Object.assign(c.qaResponses, scripted.qaOverrides);
        }
        if (type === 'cancelled') c.qaResponses.are_you_sure = c.qaResponses.alternative;

        const ticket = c.backupTicket || c.ticket;
        c.proposedBooking = ticket.exists && !['date', 'duplicate', 'missing'].includes(type)
          ? { serial: ticket.serial, screeningId: f.id, seats: ticket.seats, status: 'reserved' }
          : null;
        if (!this.validateGeneratedCase(c)) return this.generateCustomerScenario('missing', person);
        s.casesGeneratedCount++;
        if (scripted?.oncePerShift) s.scriptedDone[scripted.id] = true;
        return c;
      },
      validateGeneratedCase(c) {
        const t=c.backupTicket||c.ticket;
        if(t.exists && (!this.screening(t.filmId) || !Number.isInteger(t.seats) || t.seats<1)) return false;
        if(c.proposedBooking && !this.state.bookings[c.proposedBooking.serial] && this.freeSeats(this.screening(c.proposedBooking.screeningId))<c.proposedBooking.seats) return false;
        if(c.requiredQuestion && !c.qaResponses.which_film) return false;
        if(c.intent.ids && c.intent.ids.some(id=>!this.screening(id))) return false;
        if(!(c.groupSize>0 && c.statement && c.person))return false;
        const draft=Object.create(this);draft.state={...this.state,bookings:{...this.state.bookings}};
        if(c.proposedBooking)draft.state.bookings[c.proposedBooking.serial]={...c.proposedBooking};
        const test=structuredClone(c);
        if(test.backupTicket){test.ticket=test.backupTicket;test.requiredTicketQuestion=false;}
        if(test.requiredQuestion)test.known.preference=structuredClone(test.intent);
        const ev=draft.evaluateCustomerCase(test);
        if(!ev.validActions.length||ev.needsQuestion)return false;
        if((['valid','subjective','red','vip','tv'].includes(c.caseType) || c.isScriptedAdmit)&&!ev.validActions.includes('ADMIT'))return false;
        const expected={screen:'screen',time:'time',date:'date',duplicate:'duplicate',late:'late',no_red:'red',group:'seats',promo:'preference',wrong_film:'preference',incomplete:'preference',cancelled:'cancelled',combined:'screen',move:'screen',tv_wrong:'screen'}[c.caseType];
        if(expected&&!ev.issues.some(i=>i.code===expected))return false;
        return true;
      },
      finalizeCustomerAtWindow(c) {
        if(c.proposedBooking) {
          if(this.state.bookings[c.proposedBooking.serial]) throw new Error('Booking serial collision');
          this.state.bookings[c.proposedBooking.serial]={...c.proposedBooking};
        }
        this.syncSeats();
      },
      nextCustomerFromQueue() {
        if(!this.state.shiftActive || this.state.paused || this.state.modalDepth) return;
        if(this.state.warnings>=this.state.maxWarnings) return this.endShift('SHIFT ENDED — PLEASE TRY AGAIN');
        if(this.state.clockMins>=this.state.clockEndMins) return this.endShift('SHIFT COMPLETE');
        this.applyPendingLanguageMode();
        this.state.decisionLocked=false; this.closeCorrectionDrawer();this.clearInspectSelection();
        document.getElementById('nextCustomerBtn').classList.add('hidden');
        document.getElementById('deskFeedbackBanner').classList.add('hidden');
        document.getElementById('stampAnimationOverlay').classList.add('hidden');
        if(!this.state.queue.length) this.spawnCustomerToQueue();
        const visitor=this.state.queue.shift(), c=this.generateCustomerScenario(null,visitor.person);
        this.finalizeCustomerAtWindow(c);this.state.currentCustomer=c;
        UI.renderQueue();UI.renderCustomer(c);UI.renderTicketOnDesk(c);UI.renderScheduleBinder();UI.setDecisionButtons(false);
      },

      askCustomerQuestion(key, label) {
        const c=this.state.currentCustomer;
        if(!c || this.state.decisionLocked || this.state.paused || this.state.modalDepth) return;
        SoundFX.click();c.questionedYet=true;
        if(['which_film','are_you_sure','alternative'].includes(key)) {c.known.preference=structuredClone(c.intent);c.known.publicPlan=true;}
        if(key==='other_ticket' && c.backupTicket) {c.ticket=c.backupTicket;delete c.backupTicket;c.requiredTicketQuestion=false;UI.renderTicketOnDesk(c);}
        if(!c.asked.includes(key)) c.asked.push(key);
        const reply=c.qaResponses[key]||"I'm here to watch a film.";
        c.dialogue.push({question:label,reply});
        const box=document.getElementById('customerFollowUpBox');
        box.replaceChildren();
        c.dialogue.slice(-3).forEach(turn=>{const p=document.createElement('p');p.textContent=`${turn.question} — ${turn.reply}`;box.append(p);});
        box.classList.remove('hidden'); UI.updateCustomerSummary();
      },

      openCorrectionDrawer() {
        if(!this.state.currentCustomer || this.state.decisionLocked || this.state.paused || this.state.modalDepth) return;
        const c=this.state.currentCustomer, pol=this.policies();
        if(!pol.allowCorrections) return UI.showDeskFeedback('warn','The printer opens on Tuesday.');
        if(!c.ticket.exists) return UI.showDeskFeedback('warn','You need a ticket to use the printer.');
        if((!pol.allowPromoChanges && c.ticket.ticketType.includes('PROMO')) || c.ticket.ticketType.includes('VIP')) return UI.showDeskFeedback('warn','This pass cannot be changed.');
        if(!c.known.preference) return UI.showDeskFeedback('warn','Ask which film the customer wants first.');
        const select=document.getElementById('correctionScreeningSelect');select.replaceChildren();
        const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose a screening…';select.append(placeholder);
        this.allScreenings().forEach(f=>{
          const opt=document.createElement('option');opt.value=f.id;
          const b=this.booking(c), available=this.freeSeats(f)+(b?.screeningId===f.id?b.seats:0);
          opt.textContent=`${f.title} · ${f.genreLabel} · ${f.screen==='TV Lounge'?'TV Lounge':'Screen '+f.screen} · ${f.time} · ${available} seats${f.status==='CANCELLED'?' · CANCELLED':''}`;
          const isLate = pol.lateToleranceMins !== null && pol.lateToleranceMins !== undefined && this.arrival(c) > f.timeMins + pol.lateToleranceMins;
          opt.disabled=f.status==='CANCELLED'||available<c.groupSize||isLate;
          select.append(opt);
        });
        // Printer only uses information already spoken, never hidden intent.
        if(this.state.ownedUpgrades.includes('printer')) select.value=this.correctionOptions(c)[0]?.id||'';
        document.getElementById('correctionPrinterDrawer').classList.remove('hidden');this.updateCorrectionPreview();
      },

      closeCorrectionDrawer() {
        document.getElementById('correctionPrinterDrawer').classList.add('hidden');
      },

      updateCorrectionPreview() {
        const f=this.screening(document.getElementById('correctionScreeningSelect').value),c=this.state.currentCustomer;
        document.getElementById('printCorrectedTicketBtn').disabled=!f;
        document.getElementById('correctionPreviewScreen').textContent=f?(f.screen==='TV Lounge'?'TV Lounge':'Screen '+f.screen):'—';
        document.getElementById('correctionPreviewTimeSeats').textContent=f?`${f.time} · ${c.groupSize} people`:'—';
        document.getElementById('correctionPolicyNote').textContent='Check the customer’s plan and the rules before printing.';
      },

      confirmPrintAndCorrect() {
        const f=this.screening(document.getElementById('correctionScreeningSelect').value);if(f) this.makeDecision('CORRECT',f);
      },

      makeDecision(action, target=null) {
        const s=this.state,c=s.currentCustomer,camp=this.campaign(),dm=camp.dilemmaMessage||{};
        if(!c || !s.shiftActive || s.paused || s.modalDepth || s.decisionLocked) return;
        const before=structuredClone(c.ticket),result=this.applyDecision(c,action,target?.id),ev=result.evaluation;
        if(result.blocked) {UI.showDeskFeedback('warn',c.requiredTicketQuestion?'Ask if there is another ticket.':'Ask the customer about their plan first.');return;}
        s.decisionLocked=true;this.closeCorrectionDrawer();s.shiftStats.served++;
        let message;
        if(result.accepted && result.compliant) {
          s.shiftStats.correct++;
          const earn=(action==='ADMIT'?10:action==='CORRECT'?12:8)+(action==='CORRECT'&&s.ownedUpgrades.includes('printer')?3:0);
          s.money+=earn;s.shiftStats.cashEarned+=earn;this.adjustReputation(s.ownedUpgrades.includes('handbook')?4:3);
          message=`✓ ${action}. +€${earn}. ${ev.reason}`;SoundFX.cash();
        } else if(result.exception) {
          s.shiftStats.mistakes++;s.money+=6;s.shiftStats.cashEarned+=6;this.adjustReputation(4);
          message=(dm.exceptionFeedback||`${c.person.name} is admitted as an exception. +€6. Management gives a warning.`)+this.giveWarning();
          s.shiftStats.dilemmaNotes.push(dm.exceptionNote||`${c.person.name} was admitted as a discretionary exception.`);
        } else {
          s.shiftStats.mistakes++;const penalty=s.difficulty==='chaos'?8:5;s.money=Math.max(0,s.money-penalty);this.adjustReputation(-7);
          message=`✕ ${action==='CORRECT'?'That replacement does not meet all the rules or the customer’s plan.':ev.reason} Use ${ev.validActions.join(' or ')}. −€${penalty}.`+this.giveWarning();SoundFX.buzzer();
        }
        const outcome=result.exception?'kind':result.accepted&&action!=='REFUSE'?'helped':result.accepted?'refused':'mistake';
        if(c.storyKey) {
          s.story[c.storyKey]=outcome;
        }
        if(c.dilemma) {
          if(action==='REFUSE'&&result.accepted) {this.adjustReputation(-2);s.shiftStats.dilemmaNotes.push(dm.refusedNote||`${c.person.name} could not enter. The manager accepted your decision.`);}
          if(action==='CORRECT'&&result.accepted) s.shiftStats.dilemmaNotes.push(dm.correctedNote||`${c.person.name} accepted another film.`);
        }
        if(camp.inspectorCharacterId && c.person.id===camp.inspectorCharacterId) {
          const notes=camp.inspectorNotes||{};
          s.shiftStats.dilemmaNotes.push(s.reputation>=80?(notes.highRep||'The inspector liked the service.'):(notes.lowRep||'The inspector asked the manager to improve the service.'));
        }
        s.outcomes.push({customer:c.person.name,caseType:c.caseType,action,accepted:result.accepted,compliant:!!result.compliant,ticketBefore:before,ticketAfter:structuredClone(c.ticket),time:s.clockMins});
        UI.renderTicketOnDesk(c);UI.animateStamp(action,null,c);SoundFX.stamp();
        UI.showDeskFeedback(result.accepted?(result.exception?'warn':'ok'):'err',message);
        UI.renderScheduleBinder();UI.renderSerialsBinder();UI.renderHeader();UI.setDecisionButtons(true);
        const next=document.getElementById('nextCustomerBtn');next.textContent=s.warnings>=s.maxWarnings?'View shift report →':'Next customer →';next.classList.remove('hidden');
        this.saveProgress();
      },

      applyDecision(c, action, targetId=null) {
        const ev=this.evaluateCustomerCase(c);
        if(ev.needsQuestion || (c.requiredTicketQuestion && !c.ticket.exists)) return {accepted:false,blocked:true,evaluation:ev};
        const exception=action==='ADMIT'&&ev.discretionary;
        const valid=ev.validActions.includes(action) && (action!=='CORRECT'||ev.options.some(f=>f.id===targetId));
        if(!valid && !exception) return {accepted:false,evaluation:ev};
        const bookings=structuredClone(this.state.bookings),used=[...this.state.usedSerials];
        const t=c.ticket, b=bookings[t?.serial]; let replacement=null;
        if(action==='ADMIT' || action==='CORRECT') {
          if(!b || b.status!=='reserved') return {accepted:false,evaluation:ev};
          if(action==='CORRECT') {
            const f=this.screening(targetId);
            b.status='cancelled';
            const serial=this.makeUniqueSerial();
            bookings[serial]={serial,screeningId:f.id,seats:c.groupSize,status:'admitted'};
            replacement={exists:true,serial,filmId:f.id,filmTitle:f.title,genreLabel:f.genreLabel,screen:f.screen,time:f.time,date:this.today(),seats:c.groupSize,ticketType:f.screen==='TV Lounge'?'TV LOUNGE PASS':'REPLACEMENT PRINTED'};
            used.push(t.serial,serial);
          } else {b.status='admitted';used.push(t.serial);}
        } else if(action==='REFUSE' && b?.status==='reserved') b.status='cancelled';
        this.state.bookings=bookings;this.state.usedSerials=[...new Set(used)];
        if(replacement) c.ticket=replacement;
        this.syncSeats();
        return {accepted:true,compliant:!exception,exception,evaluation:ev};
      },

      giveWarning() {
        if(this.state.ownedUpgrades.includes('handbook')&&!this.state.forgivenWarningUsed) {this.state.forgivenWarningUsed=true;return ' Your handbook saved this warning.';}
        this.state.warnings++;return '';
      },

      tick() {
        const s=this.state;if(!s.shiftActive||s.paused||s.modalDepth||s.decisionLocked) return;
        s.clockMins++;s.clockFormatted=this.formatMins(s.clockMins);UI.updateClockDisplay();
        this.updateQueuePatience();
        if(s.queue.length<4&&this.rng()<(s.difficulty==='chaos'?0.15:0.08))this.spawnCustomerToQueue();
        for (const notice of (this.dayConfig().midShiftNotices || [])) {
          if (s.clockMins >= notice.atMins && !s.noticesSeen[notice.id]) {
            s.noticesSeen[notice.id] = true;
            UI.openNotice(notice.text);
          }
        }
        if(s.clockMins>=s.clockEndMins) {UI.showDeskFeedback('warn','Closing time. Finish this customer, then read your report.');s.closing=true;}
        if(s.closing) this.stopShiftLoop();
      },

      validateLanguagePack(input) {
        if(!input || typeof input!=='object'||Array.isArray(input))throw new Error('The pack must be a JSON object.');
        const p=structuredClone(input);if(p.version!==undefined && p.version!==2)throw new Error('This pack needs version 2.');p.version=2;
        const str=(x,path)=>{if(typeof x!=='string'||!x.trim()||x.length>300)throw new Error(path+' must be text (1–300 characters).');};
        const list=(x,path)=>{if(!Array.isArray(x)||!x.length||x.length>100)throw new Error(path+' must be a non-empty array (up to 100 items).');x.forEach((v,i)=>str(v,path+'['+i+']'));};
        str(p.unitTitle,'unitTitle');['filmGenres','tvProgrammes','adjectives'].forEach(k=>list(p[k],k));
        const reservedIds = new Set();
        const camp = this.campaign();
        if (camp) {
          [...Object.values(camp.days || {}), camp.endlessDay].filter(Boolean).forEach(d => {
            (d.scheduleChanges || []).forEach(ch => { if (ch.newId) reservedIds.add(ch.newId); });
          });
        }
        const ids=new Set();
        ['films','tvLoungeSchedule'].forEach(key=>{
          if(!Array.isArray(p[key])||!p[key].length||p[key].length>50)throw new Error(key+' needs 1–50 entries.');
          p[key].forEach((f,i)=>{
            const where=key+'['+i+']';if(!f||typeof f!=='object')throw new Error(where+' must be an object.');
            if(!/^[a-z][a-z0-9_]{0,49}$/.test(f.id)||ids.has(f.id)||reservedIds.has(f.id))throw new Error(where+'.id must be unique: lowercase letters, digits and underscores.');ids.add(f.id);
            ['title','genre','genreLabel'].forEach(k=>str(f[k],where+'.'+k));
            if(!(key==='films'?p.filmGenres:p.tvProgrammes).includes(f.genre))throw new Error(where+'.genre is not in the vocabulary list.');
            if(key==='films') {if(![1,2,3].includes(f.screen))throw new Error(where+'.screen must be 1, 2 or 3.');list(f.descriptions,where+'.descriptions');list(f.purposePhrases,where+'.purposePhrases');f.purposePhrases.forEach(v=>{if(!/^to \S/.test(v))throw new Error(where+'.purposePhrases must start with “to ”.');});str(f.adjective,where+'.adjective');}
            else {if(f.screen!=='TV Lounge')throw new Error(where+'.screen must be TV Lounge.');str(f.statement,where+'.statement');}
            const mins=this.parseTime(f.time);
            if(!Number.isFinite(mins)||mins<1065||mins>1335)throw new Error(where+'.time must be HH:MM from 17:45 to 22:15.');
            if(f.timeMins!==undefined&&f.timeMins!==mins)throw new Error(where+'.timeMins does not match time.');f.timeMins=mins;
            if(!Number.isInteger(f.capacity)||f.capacity<1||f.capacity>200)throw new Error(where+'.capacity must be a whole number from 1 to 200.');
          });
        });
        if(p.scenarios!==undefined) throw new Error('Custom scenarios are not supported. Edit films, TV programmes and dialogue instead.');
        return p;
      },

      restoreDefaultPack() {
        this.state.customLanguagePack = null;
        localStorage.removeItem('cinema_chaos_pack_v2');
        document.getElementById('languagePackJsonArea').value=JSON.stringify(this.campaign().languagePack,null,2);
        this.applyCustomLanguagePack();
      },

      adjustReputation(delta) {
        this.state.reputation = Math.max(0, Math.min(100, this.state.reputation + delta));
      },

      /*************************************************************************
       * INTERACTIVE INSPECTION MODE (Compare two items visually)
       *************************************************************************/
      toggleInspectMode() {
        this.state.inspectMode = !this.state.inspectMode;
        const btn = document.getElementById('inspectModeBtn');
        const txt = document.getElementById('inspectModeBtnText');
        if (this.state.inspectMode) {
          btn.className = "bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition";
          txt.textContent = "INSPECT MODE: ON";
        } else {
          btn.className = "bg-slate-700 hover:bg-slate-600 text-amber-200 font-bold text-xs px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition";
          txt.textContent = "INSPECT MODE: OFF";
          this.clearInspectSelection();
        }
      },

      clearInspectSelection() {
        this.state.inspectFirst = null;
        document.querySelectorAll('.inspect-selected, .inspect-match, .inspect-mismatch').forEach(el => {
          el.classList.remove('inspect-selected', 'inspect-match', 'inspect-mismatch');
        });
        const status = document.getElementById('inspectStatusText');
        if (status) {
          status.innerHTML = "🔍 Click any two fields (Ticket, Statement, Schedule, Clock, Rules) to compare them!";
        }
      },

      handleCustomerPortraitInspect(el) {
        if (!this.state.currentCustomer) return;
        const p = this.state.currentCustomer.person;
        this.handleInspectClick(
          'portrait',
          p.wearingRed ? 'WEARING RED' : 'NOT RED',
          `${p.name} (${p.wearingRed ? 'Wearing RED Jacket' : 'Not wearing red'})`,
          el
        );
      },

      handleInspectClick(category,value,label,domEl) {
        if(!this.state.inspectMode || !this.state.currentCustomer)return;
        const first=this.state.inspectFirst,status=document.getElementById('inspectStatusText');
        if(!first) {this.clearInspectSelection();this.state.inspectFirst={category,value,label,domEl};domEl?.classList.add('inspect-selected');status.textContent='Selected: '+label+'. Choose a second item.';}
        else if(first.domEl===domEl)this.clearInspectSelection();
        else {
          const result=this.compareTwoInspectedItems(first,{category,value,label,domEl});
          [first.domEl,domEl].forEach(el=>{el?.classList.remove('inspect-selected');if(result.isMatch!==null)el?.classList.add(result.isMatch?'inspect-match':'inspect-mismatch');});
          status.textContent=(result.isMatch===null?'ℹ ':result.isMatch?'✓ ':'✕ ')+result.message;this.state.inspectFirst=null;
        }
        document.getElementById('compareStatus').textContent=status.textContent;
      },

      compareTwoInspectedItems(a,b) {
        const c=this.state.currentCustomer,neutral=message=>({isMatch:null,message}),match=(ok,message)=>({isMatch:ok,message});
        const pair=(x,y)=>a.category===x&&b.category===y||b.category===x&&a.category===y;
        const field=cat=>a.category===cat?a:b;
        if(pair('serial','serial_log')) {const serial=field('serial').value;return match(!this.state.usedSerials.includes(serial),this.state.usedSerials.includes(serial)?`${serial} is in the used-ticket log.`:`${serial} is not in the used-ticket log.`);}
        if(pair('serial','vip_log')) {const serial=field('serial').value;return match(this.state.authorizedVips.includes(serial),this.state.authorizedVips.includes(serial)?'This number is on the VIP list. Other rules still apply.':'This number is not on the VIP list.');}
        if(pair('ticket_date','today'))return match(a.value===b.value,`Ticket: ${c.ticket.date}. Today: ${this.today()}.`);
        if(pair('ticket_seats','booking_seats'))return match(Number(a.value)===Number(b.value),`Ticket: ${c.ticket.seats}. Booking record: ${this.booking(c)?.seats??0}.`);
        if(pair('ticket_time','clock')) {
          const time=this.parseTime(field('ticket_time').value),diff=this.arrival(c)-time,tol=this.policies().lateToleranceMins;
          return match(tol===null||tol===undefined||diff<=tol,`Arrival: ${this.formatMins(this.arrival(c))}. Printed start: ${field('ticket_time').value}. ${diff>0?diff+' minutes after start.':'Before the start.'}`);
        }
        if(pair('portrait','rule'))return neutral(`${c.person.wearingRed?'Red clothes.':'No red clothes.'} Screen 2 requires red after 19:10. All other rules apply.`);
        if(pair('statement','ticket_film')) {
          if(!c.known.preference || !c.known.publicPlan)return neutral('The customer has not named a specific film or genre.');
          const f=this.screening(field('ticket_film').value);if(!f)return neutral('No programme entry for this film.');
          return match(this.accepts(c,f),`Ticket: ${f.title}. Customer: ${c.dialogue.at(-1)?.reply||c.statement}`);
        }
        if(a.category==='schedule_row'||b.category==='schedule_row') {
          const f=this.screening(field('schedule_row').value),other=a.category==='schedule_row'?b:a;
          if(!f)return neutral('No programme entry.');
          const map={ticket_film:f.id,ticket_screen:f.screen,ticket_time:f.timeMins};
          if(!(other.category in map))return neutral('Compare this row with a ticket film, room or time.');
          if(other.category!=='ticket_film' && c.ticket.filmId!==f.id)return neutral('These are different films. Choose the row for this ticket.');
          const v=other.category==='ticket_time'?this.parseTime(other.value):String(other.value);
          const expected=other.category==='ticket_time'?map[other.category]:String(map[other.category]);
          return match(v===expected,`${other.label}. Programme: ${f.title}, ${f.screen==='TV Lounge'?'TV Lounge':'Screen '+f.screen}, ${f.time}.`);
        }
        return neutral('These fields are not related. Try a ticket field and its programme row.');
      },

      /*************************************************************************
       * END OF SHIFT, UPGRADES & LOCALSTORAGE SAVE SYSTEM
       *************************************************************************/
      endShift(headline) {
        this.state.shiftActive = false;
        UI.setDecisionButtons(true);
        this.stopShiftLoop();

        const dismissed = this.state.warnings >= this.state.maxWarnings;
        if (!dismissed && !this.state.completedDays.includes(this.state.day)) {
          this.state.completedDays.push(this.state.day);
        }
        if (this.state.money > this.state.highScore) {
          this.state.highScore = this.state.money;
        }
        this.saveProgress();
        UI.openShiftReportModal(headline, dismissed);
      },

      buyUpgrade(upgId) {
        const upg = this.upgradesCatalog().find(u => u.id === upgId);
        if (!upg || this.state.ownedUpgrades.includes(upgId)) return;
        if (this.state.money < upg.cost) {
          SoundFX.buzzer();
          return;
        }
        SoundFX.cash();
        this.state.money -= upg.cost;
        this.state.ownedUpgrades.push(upgId);
        this.saveProgress();
        UI.renderHeader();
        UI.renderUpgradesStrip();
        UI.renderUpgradeShop();
      },

      replayCurrentDay() {
        UI.closeShiftReportModal();
        this.applyPendingLanguageMode();
        this.prepareDaySchedule(this.state.day);
        UI.openBriefingModal(this.state.day);
      },

      advanceToNextDay() {
        UI.closeShiftReportModal();
        this.applyPendingLanguageMode();
        const playableMax = this.campaign().playableDaysCount || 5;
        if (this.state.day <= playableMax) {
          this.state.day += 1;
        }
        this.prepareDaySchedule(this.state.day);
        UI.renderHeader();
        UI.renderScheduleBinder();
        UI.renderRulesBinder();
        UI.renderSerialsBinder();
        this.saveProgress();
        UI.openBriefingModal(this.state.day);
      },

      getCampaignSavedState(campaignId) {
        if (campaignId === this.state.campaignId) {
          return {
            day: this.state.day,
            money: this.state.money,
            reputation: this.state.reputation,
            ownedUpgrades: [...this.state.ownedUpgrades],
            completedDays: [...this.state.completedDays],
            highScore: this.state.highScore,
            story: { ...this.state.story }
          };
        }
        try {
          const v3Raw = localStorage.getItem('cinema_chaos_campaigns_v3');
          if (v3Raw) {
            const v3 = JSON.parse(v3Raw);
            if (v3?.campaigns?.[campaignId]) return v3.campaigns[campaignId];
          }
          if (campaignId === 'the-first-week') {
            const v2Raw = localStorage.getItem('cinema_chaos_save_v2') || localStorage.getItem('cinema_chaos_save_v1');
            if (v2Raw) return JSON.parse(v2Raw);
          }
        } catch (e) {}
        return { day: 1, money: 0, reputation: 80, ownedUpgrades: [], completedDays: [], highScore: 0, story: {} };
      },

      saveProgress() {
        const s = this.state;
        const campId = s.campaignId || 'the-first-week';
        const campData = {
          day: s.day,
          money: s.money,
          reputation: s.reputation,
          ownedUpgrades: [...s.ownedUpgrades],
          completedDays: [...s.completedDays],
          highScore: s.highScore,
          story: { ...s.story }
        };
        try {
          let v3 = { version: 3, campaigns: {} };
          const existingV3 = localStorage.getItem('cinema_chaos_campaigns_v3');
          if (existingV3) {
            try {
              const parsed = JSON.parse(existingV3);
              if (parsed && typeof parsed === 'object' && parsed.campaigns) v3 = parsed;
            } catch (e) {}
          }
          v3.version = 3;
          v3.activeCampaignId = campId;
          v3.difficulty = s.difficulty;
          v3.languageMode = s.selectedLanguageMode || s.languageMode || 'elementary';
          v3.showLanguageHints = s.showLanguageHints;
          v3.enableTVContent = s.enableTVContent;
          v3.disableQueueWalkouts = s.disableQueueWalkouts;
          v3.muted = SoundFX.muted;
          v3.campaigns[campId] = campData;
          localStorage.setItem('cinema_chaos_campaigns_v3', JSON.stringify(v3));

          if (campId === 'the-first-week') {
            const payload = { version: 2 };
            ['day','difficulty','money','reputation','ownedUpgrades','completedDays','highScore','showLanguageHints','enableTVContent','disableQueueWalkouts','story'].forEach(k => payload[k] = s[k]);
            payload.languageMode = v3.languageMode;
            payload.muted = SoundFX.muted;
            localStorage.setItem('cinema_chaos_save_v2', JSON.stringify(payload));
          }
        } catch(e) {
          document.getElementById('saveNotice').textContent='Progress cannot be saved in this browser session.';
        }
      },

      loadProgress(requestedCampaignId = null) {
        try {
          const pack=localStorage.getItem('cinema_chaos_pack_v2');
          if(pack) this.state.customLanguagePack=this.validateLanguagePack(JSON.parse(pack));
        }catch(e){this.startupMessage='The saved language pack could not be loaded. The Unit 9 pack is ready.';}

        const s = this.state;
        try {
          const v3Raw = localStorage.getItem('cinema_chaos_campaigns_v3');
          const current = localStorage.getItem('cinema_chaos_save_v2');
          const legacy = localStorage.getItem('cinema_chaos_save_v1');

          let v3 = null;
          if (v3Raw) {
            try { v3 = JSON.parse(v3Raw); } catch (e) {}
          }

          const reg = window.CinemaChaos && window.CinemaChaos.CampaignRegistry;
          const targetId = requestedCampaignId
            || (v3?.activeCampaignId && reg?.get(v3.activeCampaignId) ? v3.activeCampaignId : null)
            || s.campaignId
            || 'the-first-week';
          s.campaignId = targetId;

          let d = null;
          if (targetId === 'the-first-week') {
            const raw = current || legacy;
            if (raw) {
              d = JSON.parse(raw);
              if (d.version && d.version !== 2) throw new Error('version');
              if (!current && legacy) {
                this.startupMessage = 'Your campaign has been kept. This shift starts again with the new booking rules.';
              }
            } else if (v3?.campaigns?.['the-first-week']) {
              d = v3.campaigns['the-first-week'];
            }
          } else if (v3?.campaigns?.[targetId]) {
            d = v3.campaigns[targetId];
          }

          // Reset per-campaign fields before applying loaded data
          Object.assign(s, {
            day: 1,
            money: 0,
            reputation: 80,
            ownedUpgrades: [],
            completedDays: [],
            highScore: 0,
            story: {}
          });

          const globalSource = d || v3;
          if (globalSource) {
            if (['relaxed','normal','chaos'].includes(globalSource.difficulty)) s.difficulty = globalSource.difficulty;
            const savedLang = globalSource.languageMode || v3?.languageMode;
            if (['elementary','intermediate','advanced'].includes(savedLang)) {
              s.languageMode = savedLang;
              s.selectedLanguageMode = savedLang;
            }
            for (const k of ['showLanguageHints','enableTVContent','disableQueueWalkouts']) {
              if (typeof globalSource[k] === 'boolean') s[k] = globalSource[k];
              else if (v3 && typeof v3[k] === 'boolean') s[k] = v3[k];
            }
            const mutedVal = globalSource.muted !== undefined ? globalSource.muted : v3?.muted;
            if (mutedVal !== undefined) {
              SoundFX.muted = !!mutedVal;
              document.getElementById('muteBtnIcon').textContent = SoundFX.muted ? '🔇' : '🔊';
            }
          }

          if (d) {
            const maxDay = (this.campaign()?.totalDays || 7) + 1;
            if (Number.isInteger(d.day) && d.day >= 1 && d.day <= maxDay) s.day = d.day;
            for (const k of ['money','highScore','reputation']) {
              if (Number.isFinite(d[k]) && d[k] >= 0) s[k] = k === 'reputation' ? Math.min(100, d[k]) : Math.floor(d[k]);
            }
            const catalog = this.upgradesCatalog();
            s.ownedUpgrades = Array.isArray(d.ownedUpgrades)
              ? [...new Set(d.ownedUpgrades.filter(id => catalog.some(u => u.id === id)))]
              : [];
            s.completedDays = Array.isArray(d.completedDays)
              ? d.completedDays.filter(n => Number.isInteger(n) && n >= 1 && n <= maxDay)
              : [];
            s.story = {};
            if (d.story && typeof d.story === 'object') {
              for (const [k, v] of Object.entries(d.story)) {
                if (['kind','helped','refused','mistake'].includes(v)) s.story[k] = v;
              }
            }
          }
        } catch(e) {
          this.startupMessage = 'Saved progress could not be loaded. A new campaign is ready.';
        }
        this.state.maxWarnings = {relaxed:4,normal:3,chaos:2}[this.state.difficulty];
      },

      resetCampaignConfirm() {
        this.stopShiftLoop();this.state.shiftActive=false;this.state.currentCustomer=null;
        Object.assign(this.state,{day:1,money:0,reputation:80,warnings:0,ownedUpgrades:[],completedDays:[],story:{},outcomes:[]});
        this.prepareDaySchedule(1);this.saveProgress();UI.renderHeader();UI.renderScheduleBinder();UI.renderRulesBinder();UI.renderSerialsBinder();UI.renderUpgradesStrip();UI.openBriefingModal(1);
      },
    };

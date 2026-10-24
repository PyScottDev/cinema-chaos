    /***************************************************************************
     * 5. CENTRAL VALIDATION ENGINE & SCENARIO GENERATOR
     ***************************************************************************/
    const Game = {
      state: {
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
        authorizedVips: ["VIP-770-MORRIS", "VIP-900-INSPECTOR"],

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

      init() {
        this.loadProgress();
        const seed = Number(new URLSearchParams(location.search).get("seed"));
        if(Number.isInteger(seed)&&seed>0) this.rngSeed=seed%2147483647||1;
        this.prepareDaySchedule(this.state.day);
        UI.renderHeader();
        UI.renderScheduleBinder();
        UI.renderRulesBinder();
        UI.renderSerialsBinder();
        UI.openBriefingModal(this.state.day);
        document.getElementById('languagePackJsonArea').value = JSON.stringify(LANGUAGE_PACK, null, 2);
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
        UI.closeTeacherModal();UI.closeShiftReportModal();this.prepareDaySchedule(this.state.day);
        UI.renderHeader();UI.renderScheduleBinder();UI.renderRulesBinder();UI.renderSerialsBinder();UI.openBriefingModal(this.state.day);this.saveProgress();
      },

      exportLanguagePack() {
        const text=JSON.stringify(LANGUAGE_PACK,null,2),blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
        a.href=url;a.download='cinema-language-pack.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
        document.getElementById('languagePackJsonArea').value=text;
      },

      applyCustomLanguagePack() {
        const msg=document.getElementById('jsonStatusMsg');
        try {
          const parsed=this.validateLanguagePack(JSON.parse(document.getElementById('languagePackJsonArea').value));
          localStorage.setItem('cinema_chaos_pack_v2',JSON.stringify(parsed));
          LANGUAGE_PACK=parsed;
          this.stopShiftLoop();this.state.shiftActive=false;this.state.currentCustomer=null;
          this.prepareDaySchedule(this.state.day);UI.renderScheduleBinder();UI.renderRulesBinder();UI.openBriefingModal(this.state.day);
          msg.textContent='✓ Pack saved. Close settings and start a new shift.';msg.className='text-xs text-emerald-400';
        } catch(e){msg.textContent='Pack not changed: '+e.message;msg.className='text-xs text-rose-400';}
      },



      startShift() {
        this.stopShiftLoop();this.state.modalDepth=0;UI.modalStack.clear();UI.closeBriefingModal();
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
      today() { return CAMPAIGN_DAYS[this.state.day].dayName; },
      arrival(c) { return c.arrivalTime ?? this.state.clockMins; },
      booking(c) { return this.state.bookings[c.ticket?.serial]; },
      freeSeats(f) {
        return f.capacity - Object.values(this.state.bookings).filter(b => b.screeningId === f.id && b.status !== 'cancelled').reduce((n,b) => n+b.seats,0);
      },
      syncSeats() { this.allScreenings().forEach(f => { f.unallocatedSeats = this.freeSeats(f); }); },
      canEnter(f, c) {
        return f && f.status !== 'CANCELLED' && (this.state.day < 2 || this.arrival(c) <= f.timeMins+10)
          && !(this.state.day >= 5 && f.screen === 2 && this.arrival(c)>1150 && !c.person.wearingRed);
      },
      accepts(c, f, requirements = c.known.preference) {
        if (!requirements) return false;
        return (!requirements.ids || requirements.ids.includes(f.id)) && (!requirements.genres || requirements.genres.includes(f.genre))
          && (!requirements.notGenres || !requirements.notGenres.includes(f.genre)) && (!requirements.latest || f.timeMins <= requirements.latest);
      },
      correctionOptions(c) {
        const t=c.ticket, b=this.booking(c);
        if (this.state.day<2 || !t?.exists || t.date!==this.today() || this.state.usedSerials.includes(t.serial)
          || !b || b.status!=='reserved' || t.ticketType.includes('PROMO') || t.ticketType.includes('VIP') || !c.known.preference) return [];
        return this.allScreenings().filter(f => this.canEnter(f,c) && this.accepts(c,f)
          && this.freeSeats(f)+(b.screeningId===f.id ? b.seats:0) >= c.groupSize);
      },
      evaluateCustomerCase(c) {
        const t=c.ticket, f=this.screening(t?.filmId), b=this.booking(c), issues=[];
        const add=(code,text,hard=false)=>issues.push({code,text,hard});
        if(!t?.exists) add('missing','No ticket.',true);
        else {
          if(t.date!==this.today()) add('date',`Ticket: ${t.date}. Today: ${this.today()}.`,true);
          if(this.state.usedSerials.includes(t.serial)) add('duplicate','This ticket number is already used.',true);
          if(t.ticketType.includes('VIP') && (this.state.day<5 || !this.state.authorizedVips.includes(t.serial))) add('vip','This VIP number is not on the list.',true);
          if(!['STANDARD','PROMO (NO CHANGE)','MANAGER VIP PASS','TV LOUNGE PASS','REPLACEMENT PRINTED'].includes(t.ticketType)) add('authenticity','This ticket type is not valid.',true);
          if(!b || b.status!=='reserved') add('booking','There is no unused booking for this ticket.',true);
          if(!f) add('film','This film is not on the programme.',true);
          if(f) {
            if((f.screen==='TV Lounge'&&!t.ticketType.includes('LOUNGE')&&!t.ticketType.includes('VIP')) || (f.screen!=='TV Lounge'&&t.ticketType.includes('LOUNGE'))) add('pass','The ticket type does not match this room.');
            if(f.status==='CANCELLED') add('cancelled','This film is cancelled.');
            if(t.filmTitle!==f.title) add('title','The film name does not match the booking.');
            if(String(t.screen)!==String(f.screen)) add('screen',`Ticket room: ${t.screen}. Programme room: ${f.screen}.`);
            if(this.parseTime(t.time)!==f.timeMins) add('time',`Ticket time: ${t.time}. Programme time: ${f.time}.`);
            if(this.state.day>=2 && this.arrival(c)>f.timeMins+10) add('late',`Arrival ${this.formatMins(this.arrival(c))}: more than 10 minutes late.`);
            if(this.state.day>=5 && f.screen===2 && this.arrival(c)>1150 && !c.person.wearingRed) add('red','Screen 2: after 19:10, you need red clothes.');
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
        // Morris may decline an alternative. A compassionate admission is recorded separately, not scored as compliant.
        if(c.dilemma && !needsQuestion && issues.length && !hard && !validActions.includes('REFUSE')) validActions.push('REFUSE');
        const discretionary=!!c.dilemma && issues.length===1 && issues[0].code==='late';
        return {validActions,issues,options,needsQuestion,discretionary,reason:issues.map(i=>i.text).join(' ') || 'The booking and ticket match.'};
      },
      parseTime(t) { if(!/^\d{2}:\d{2}$/.test(t||'')) return NaN; const [h,m]=t.split(':').map(Number); return h<24 && m<60 ? h*60+m:NaN; },
      pick(list) { return list.length ? list[Math.floor(this.rng()*list.length)] : null; },
      makeUniqueSerial() { return 'GC-'+this.state.day+'-'+(++this.state.serialCounter); },
      prepareDaySchedule(day) {
        this.state.bookings={}; this.state.serialCounter=400;
        this.state.schedule=LANGUAGE_PACK.films.map(f=>({...f, status:'ON TIME',originalScreen:f.screen,unallocatedSeats:f.capacity}));
        this.state.tvSchedule=day>=4 && this.state.enableTVContent ? LANGUAGE_PACK.tvLoungeSchedule.map(f=>({...f,status:'ON TIME',unallocatedSeats:f.capacity})):[];
        const moved=this.screening('planet_x');
        if(day===3 && moved) { moved.screen=1; moved.status='MOVED TO SCR 1'; }
        const cancelled=this.screening('love_in_paris');
        if(day>=5 && cancelled) cancelled.status='CANCELLED';
        // A real second screening: announced on the Friday briefing and printed in the programme.
        const penguins=this.screening('happy_penguins');
        if(day>=5 && penguins) this.state.schedule.push({...penguins,id:'happy_penguins_late',screen:2,time:'19:15',timeMins:1155,status:'EXTRA SHOW'});
        this.state.schedule.sort((a,b)=>a.timeMins-b.timeMins);this.state.tvSchedule.sort((a,b)=>a.timeMins-b.timeMins);
        this.state.usedSerials=day>=3 ? ['GC-104','GC-209','GC-318']:[];
        this.state.scriptedDone={}; this.state.noticesSeen={};
        this.state.clockEndMins=Math.max(...this.allScreenings().map(f=>f.timeMins))+10;
        this.state.scheduleSnapshot=this.allScreenings().map(f=>[f.id,f.time,f.timeMins,f.screen,f.status]);
      },
      // Queue visitors have no invented tickets yet: cases are constructed from the live state at the window.
      spawnCustomerToQueue() {
        this.state.queue.push({person:CHARACTERS.createRandomPerson(()=>this.rng()),patience:100}); UI.renderQueue();
      },
      generateCustomerScenario(forcedType=null, person=null) {
        const s=this.state, now=s.clockMins, day=s.day;
        const shell={person:person||CHARACTERS.createRandomPerson(()=>this.rng()),arrivalTime:now};
        const open=this.allScreenings().filter(f=>this.canEnter(f,shell) && this.freeSeats(f)>=1);
        const late=this.allScreenings().filter(f=>f.status!=='CANCELLED' && now>f.timeMins+10 && this.freeSeats(f)>=1);
        const pickId=(id)=>open.find(f=>f.id===id);
        let type=forcedType;
        if(!type) {
          if(day===2 && now>=1106 && now<=1115 && !s.scriptedDone.morris && late.find(f=>f.id==='happy_penguins')) type='morris';
          else if(day>=5 && now>1150 && now<=1163 && !s.scriptedDone.red && pickId('happy_penguins_late')) type='red';
          else if(day===1 && s.casesGeneratedCount===2 && pickId('wild_world')) type='sofia';
          else if(day===2 && s.casesGeneratedCount===2 && pickId('laughing_bananas')) type='leo';
          else if(day===3 && s.casesGeneratedCount===1 && pickId('planet_x')) type='move';
          else if(day===4 && s.casesGeneratedCount===1 && open.some(f=>f.screen==='TV Lounge')) type='tv';
          else if(day===4 && s.casesGeneratedCount===3 && s.story.morris) type='morris_return';
          else if(day>=5 && s.casesGeneratedCount===4 && !s.usedSerials.includes('VIP-900-INSPECTOR')) type='vip';
          else if(day>=3 && s.casesGeneratedCount===6 && s.story.leo) type='leo_return';
          else if(this.rng()<0.40) type=this.pick(['valid','valid','subjective']);
          else {
            const types=['wrong_film','screen','time','date','missing'];
            if(day>=2) types.push('group','incomplete','change','hidden_ticket',...(late.length?['late']:[]));
            if(day>=3) types.push('duplicate','promo','combined');
            if(day>=4 && open.some(f=>f.screen==='TV Lounge')) types.push('tv_wrong');
            if(day>=5 && this.screening('love_in_paris')) types.push('cancelled');
            if(day>=5 && now>1150 && now<=1165) types.push('red','no_red');
            type=this.pick(types);
          }
        }
        if(!open.length && !['late','morris'].includes(type)) type=late.length && day>=2 ? 'late':'missing';
        let f=this.pick(open)||this.allScreenings()[0], desired=f;
        if(type==='sofia') f=desired=pickId('wild_world')||f;
        if(type==='move') {f=desired=pickId('planet_x'); if(!f) return this.generateCustomerScenario('screen',person);}
        if(type.startsWith('tv')) {f=desired=this.pick(open.filter(x=>x.screen==='TV Lounge')); if(!f) return this.generateCustomerScenario('valid',person);}
        if(type==='late' || type==='morris') {
          f=desired=type==='morris'?late.find(x=>x.id==='happy_penguins'):this.pick(late);
          if(!f) return this.generateCustomerScenario('screen',person);
        }
        if(type==='red' || type==='no_red') {
          f=desired=this.screening('happy_penguins_late');
          if(!f || now<=1150 || now>f.timeMins+10 || this.freeSeats(f)<1) return this.generateCustomerScenario('screen',person);
          shell.person=CHARACTERS.createRandomPerson(()=>this.rng(),type==='red');
        }
        if(type==='cancelled') {
          f=this.screening('love_in_paris'); desired=this.pick(open.filter(x=>x.screen!==2));
          if(!f || f.status!=='CANCELLED' || !desired || this.freeSeats(f)<1) return this.generateCustomerScenario('screen',person);
        }
        if(['wrong_film','promo','incomplete','leo','change'].includes(type)) {
          desired=type==='leo' ? pickId('laughing_bananas'):this.pick(open);
          const other=this.pick(open.filter(x=>x.genre!==desired?.genre));
          if(!desired || !other) return this.generateCustomerScenario('screen',person);
          f=other;
        }
        if(type==='group' && this.freeSeats(f)<3) return this.generateCustomerScenario('screen',person);
        const group=type==='group'?3:1;
        const c={...shell,groupSize:group,caseType:type,patience:100,known:{preference:{ids:[desired.id]}},
          intent:{ids:[desired.id]},dialogue:[],asked:[],questionedYet:false,requiredQuestion:false,
          statement:this.pick([`I'm going to see ${f.title}.`,...(f.descriptions||[f.statement]).filter(text=>!/^We|^We're/.test(text)&&! /\bfamily|partner\b/.test(text)),`I'm here ${f.purposePhrases?.[0]||'to have fun'}.`]),
          ticket:{exists:true,serial:this.makeUniqueSerial(),filmId:f.id,filmTitle:f.title,genreLabel:f.genreLabel,screen:f.screen,time:f.time,date:this.today(),seats:1,ticketType:f.screen==='TV Lounge'?'TV LOUNGE PASS':'STANDARD'}};
        const vocabulary={scary:'Scary = makes you feel afraid.',funny:'Funny = makes you laugh.',interesting:'Interesting = you want to know more.',fun:'Fun = you enjoy it.'};
        c.languageHint=vocabulary[f.adjective]||'“To learn” tells us why someone does something.';
        if(['wrong_film','promo','leo','change'].includes(type)) {
          c.intent=c.known.preference={genres:[desired.genre]};
          c.statement=`I'm not going to watch this film. I want ${desired.genre==='comedy'?'something funny':`a ${desired.genreLabel.toLowerCase()}`}.`;
        }
        if(type==='screen' || type==='combined' || type==='tv_wrong') c.ticket.screen=f.screen===1?2:1;
        if(type==='time' || type==='combined') c.ticket.time='17:00';
        if(type==='move') c.ticket.screen=f.originalScreen;
        if(type==='date') c.ticket.date='LAST SUNDAY';
        if(type==='missing' || type==='hidden_ticket') {
          if(type==='hidden_ticket') { c.backupTicket={...c.ticket}; c.requiredTicketQuestion=true; c.statement="My ticket? It isn't in my bag. One moment..."; }
          else c.statement="I haven't got a ticket. I'm not going to buy one.";
          c.ticket={exists:false,reason:'No ticket on the desk.'};
        }
        if(type==='incomplete') {c.known.preference=null;c.requiredQuestion=true;c.statement="I'm going to meet my friends. Which film are we going to see? Let me check.";}
        if(type==='cancelled') {c.intent={genres:[desired.genre]};c.known.preference=null;c.requiredQuestion=true;c.statement=`I'm going to see ${f.title}. Can I watch another film?`;}
        if(type==='group') c.statement=`We're going to see ${f.title}. There are three of us.`;
        if(type==='duplicate') c.ticket.serial=this.pick(s.usedSerials);
        if(type==='promo') c.ticket.ticketType='PROMO (NO CHANGE)';
        if(type==='late') c.statement=`I'm late. I only want to see ${f.title}.`;
        if(type==='subjective') c.statement=`I'm going to watch ${f.title} to relax.`;
        if(type==='sofia') {c.person={...CHARACTERS.recurring.sofia};c.statement=`I'm here to learn about animals. I'm going to see ${f.title}.`;}
        if(type==='leo') {c.person={...CHARACTERS.recurring.leo,tag:'Regular customer'};c.statement="I'm not going to see a horror film. I want something funny.";}
        if(type==='leo_return') {c.person={...CHARACTERS.recurring.leo,tag:'Regular customer'};c.statement=s.story.leo==='helped'?`Thanks for your help! Today I'm going to try ${f.title}.`:`Last time was difficult. Today I'm going to see ${f.title}.`;}
        if(type==='morris') {
          c.person={...CHARACTERS.recurring.mr_morris};c.dilemma=true;c.known.preference=null;c.requiredQuestion=true;
          c.intent={genres:['animation','comedy']};c.statement=`I'm ${now-f.timeMins} minutes late. My daughter is inside. Can you help me?`;
        }
        if(type==='morris_return') {
          c.person={...CHARACTERS.recurring.mr_morris};
          c.statement=s.story.morris==='kind'?`Thank you for Tuesday! Today I'm going to see ${f.title}.`:s.story.morris==='helped'?`We liked the other film! Today I'm going to see ${f.title}.`:`I was sad on Tuesday. Today I'm on time for ${f.title}.`;
        }
        if(type==='vip') {c.person={...CHARACTERS.recurring.mystery};c.ticket.serial='VIP-900-INSPECTOR';c.ticket.ticketType='MANAGER VIP PASS';c.statement=`I'm going to watch ${f.title} to check the cinema.`;}
        if(type==='red' || type==='no_red') {c.statement=`I'm going to see ${f.title} at ${f.time}.`;c.intent=c.known.preference={ids:[f.id]};}
        c.known.publicPlan=c.statement.includes(desired.title)||c.statement.toLowerCase().includes(desired.genre)||/something funny|real animals|space|cartoon|love story|scary/.test(c.statement);
        c.statementSummary=c.statement;
        c.qaResponses={
          which_film:c.intent.genres ? `I want a ${c.intent.genres.join(' or ')}. Any one is fine.`:`I'm going to see ${desired.title}.`,
          why_see:`I'm here ${desired.purposePhrases?.[0]||'to have fun'}.`,
          are_you_sure:['incomplete','wrong_film','promo','leo','change'].includes(type)?`No. ${c.intent.genres?`I want a ${c.intent.genres[0]}.`:`I want ${desired.title}.`}`:`Yes. I'm going to see ${f.title}.`,
          how_many:`There ${group===1?'is one person':'are '+group+' people'}.`,
          friends_coming:group>1?"Yes, they are. We're going to watch together.":"No. He isn't going to come today.",
          other_ticket:type==='hidden_ticket'?"Here it is! It was in my coat.":"No. I don't have another ticket.",
          alternative:c.intent.genres?`A ${c.intent.genres.join(' or ')} is OK.`:`Only ${desired.title}, please.`
        };
        if(type==='morris') {c.qaResponses.which_film=c.qaResponses.alternative="A comedy or an animation is OK. My daughter can come out.";c.qaResponses.are_you_sure="I can watch a comedy or an animation instead.";}
        if(type==='cancelled') c.qaResponses.are_you_sure=c.qaResponses.alternative;
        const ticket=c.backupTicket||c.ticket;
        c.proposedBooking=ticket.exists && !['date','duplicate','missing'].includes(type) ? {serial:ticket.serial,screeningId:f.id,seats:ticket.seats,status:'reserved'}:null;
        if(!this.validateGeneratedCase(c)) return this.generateCustomerScenario('missing',person);
        s.casesGeneratedCount++;
        if(['morris','red'].includes(type)) s.scriptedDone[type]=true;
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
        if(['valid','subjective','red','sofia','morris_return','leo_return','vip','tv'].includes(c.caseType)&&!ev.validActions.includes('ADMIT'))return false;
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
        const c=this.state.currentCustomer;
        if(this.state.day<2) return UI.showDeskFeedback('warn','The printer opens on Tuesday.');
        if(!c.ticket.exists) return UI.showDeskFeedback('warn','You need a ticket to use the printer.');
        if(c.ticket.ticketType.includes('PROMO') || c.ticket.ticketType.includes('VIP')) return UI.showDeskFeedback('warn','This pass cannot be changed.');
        if(!c.known.preference) return UI.showDeskFeedback('warn','Ask which film the customer wants first.');
        const select=document.getElementById('correctionScreeningSelect');select.replaceChildren();
        const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Choose a screening…';select.append(placeholder);
        this.allScreenings().forEach(f=>{
          const opt=document.createElement('option');opt.value=f.id;
          const b=this.booking(c), available=this.freeSeats(f)+(b?.screeningId===f.id?b.seats:0);
          opt.textContent=`${f.title} · ${f.genreLabel} · ${f.screen==='TV Lounge'?'TV Lounge':'Screen '+f.screen} · ${f.time} · ${available} seats${f.status==='CANCELLED'?' · CANCELLED':''}`;
          opt.disabled=f.status==='CANCELLED'||available<c.groupSize||(this.state.day>=2&&this.arrival(c)>f.timeMins+10);
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
      // Validate first; make a complete booking copy; commit only a legitimate transaction.,

      makeDecision(action, target=null) {
        const s=this.state,c=s.currentCustomer;
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
          message='Mr Morris joins his daughter. +€6. They are happy, but the manager gives a late-entry warning.'+this.giveWarning();
          s.shiftStats.dilemmaNotes.push('Mr Morris joined his daughter. Management recorded the late entry.');
        } else {
          s.shiftStats.mistakes++;const penalty=s.difficulty==='chaos'?8:5;s.money=Math.max(0,s.money-penalty);this.adjustReputation(-7);
          message=`✕ ${action==='CORRECT'?'That replacement does not meet all the rules or the customer’s plan.':ev.reason} Use ${ev.validActions.join(' or ')}. −€${penalty}.`+this.giveWarning();SoundFX.buzzer();
        }
        const outcome=result.exception?'kind':result.accepted&&action!=='REFUSE'?'helped':result.accepted?'refused':'mistake';
        if(c.person.id==='mr_morris') {
          s.story.morris=outcome;
          if(action==='REFUSE'&&result.accepted) {this.adjustReputation(-2);s.shiftStats.dilemmaNotes.push('Mr Morris could not enter. The manager accepted your decision.');}
          if(action==='CORRECT'&&result.accepted) s.shiftStats.dilemmaNotes.push('Mr Morris and his daughter accepted another film.');
        }
        if(c.person.id==='leo') s.story.leo=outcome;
        if(c.person.id==='sofia') s.story.sofia=outcome;
        if(c.person.id==='mystery') s.shiftStats.dilemmaNotes.push(s.reputation>=80?'The inspector liked the service.':'The inspector asked the manager to improve the service.');
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
        if(s.day>=5 && s.clockMins>=1151 && !s.noticesSeen.red) {
          s.noticesSeen.red=true;UI.openNotice('It is after 19:10. Screen 2 now needs red clothes. All other rules still apply.');
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
        const ids=new Set();
        ['films','tvLoungeSchedule'].forEach(key=>{
          if(!Array.isArray(p[key])||!p[key].length||p[key].length>50)throw new Error(key+' needs 1–50 entries.');
          p[key].forEach((f,i)=>{
            const where=key+'['+i+']';if(!f||typeof f!=='object')throw new Error(where+' must be an object.');
            if(!/^[a-z][a-z0-9_]{0,49}$/.test(f.id)||ids.has(f.id)||f.id==='happy_penguins_late')throw new Error(where+'.id must be unique: lowercase letters, digits and underscores.');ids.add(f.id);
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

      restoreDefaultPack() {document.getElementById('languagePackJsonArea').value=JSON.stringify(DEFAULT_LANGUAGE_PACK,null,2);this.applyCustomLanguagePack();},

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
        if(pair('ticket_time','clock')) {const time=this.parseTime(field('ticket_time').value),diff=this.arrival(c)-time;return match(this.state.day<2||diff<=10,`Arrival: ${this.formatMins(this.arrival(c))}. Printed start: ${field('ticket_time').value}. ${diff>0?diff+' minutes after start.':'Before the start.'}`);}
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
        const upg = UPGRADES_CATALOG.find(u => u.id === upgId);
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
        this.prepareDaySchedule(this.state.day);
        UI.openBriefingModal(this.state.day);
      },

      advanceToNextDay() {
        UI.closeShiftReportModal();
        if (this.state.day < 6) {
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

      saveProgress() {
        const s=this.state, payload={version:2};
        ['day','difficulty','money','reputation','ownedUpgrades','completedDays','highScore','showLanguageHints','enableTVContent','disableQueueWalkouts','story'].forEach(k=>payload[k]=s[k]);
        payload.muted=SoundFX.muted;
        try{localStorage.setItem('cinema_chaos_save_v2',JSON.stringify(payload));}catch(e){document.getElementById('saveNotice').textContent='Progress cannot be saved in this browser session.';}
      },

      loadProgress() {
        try {
          const pack=localStorage.getItem('cinema_chaos_pack_v2');if(pack)LANGUAGE_PACK=this.validateLanguagePack(JSON.parse(pack));
        }catch(e){this.startupMessage='The saved language pack could not be loaded. The Unit 9 pack is ready.';}
        try {
          const current=localStorage.getItem('cinema_chaos_save_v2'),legacy=localStorage.getItem('cinema_chaos_save_v1'),raw=current||legacy;
          if(!raw)return;
          const d=JSON.parse(raw),s=this.state;
          if(d.version && d.version!==2)throw new Error('version');
          if(Number.isInteger(d.day)&&d.day>=1&&d.day<=6)s.day=d.day;
          if(['relaxed','normal','chaos'].includes(d.difficulty))s.difficulty=d.difficulty;
          for(const k of ['money','highScore','reputation'])if(Number.isFinite(d[k])&&d[k]>=0)s[k]=k==='reputation'?Math.min(100,d[k]):Math.floor(d[k]);
          s.ownedUpgrades=Array.isArray(d.ownedUpgrades)?[...new Set(d.ownedUpgrades.filter(id=>UPGRADES_CATALOG.some(u=>u.id===id)))]:[];
          s.completedDays=Array.isArray(d.completedDays)?d.completedDays.filter(n=>Number.isInteger(n)&&n>=1&&n<=6):[];
          for(const k of ['showLanguageHints','enableTVContent','disableQueueWalkouts'])if(typeof d[k]==='boolean')s[k]=d[k];
          s.story={};for(const k of ['morris','leo','sofia'])if(['kind','helped','refused','mistake'].includes(d.story?.[k]))s.story[k]=d.story[k];
          SoundFX.muted=!!d.muted;document.getElementById('muteBtnIcon').textContent=SoundFX.muted?'🔇':'🔊';
          if(!current&&legacy)this.startupMessage='Your campaign has been kept. This shift starts again with the new booking rules.';
        }catch(e){this.startupMessage='Saved progress could not be loaded. A new campaign is ready.';}
        this.state.maxWarnings={relaxed:4,normal:3,chaos:2}[this.state.difficulty];
      },

      resetCampaignConfirm() {
        this.stopShiftLoop();this.state.shiftActive=false;this.state.currentCustomer=null;
        Object.assign(this.state,{day:1,money:0,reputation:80,warnings:0,ownedUpgrades:[],completedDays:[],story:{},outcomes:[]});
        this.prepareDaySchedule(1);this.saveProgress();UI.renderHeader();UI.renderScheduleBinder();UI.renderRulesBinder();UI.renderSerialsBinder();UI.renderUpgradesStrip();UI.openBriefingModal(1);
      },
    };

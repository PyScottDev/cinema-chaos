    /***************************************************************************
     * 6. USER INTERFACE & RENDERING SYSTEM
     ***************************************************************************/
    const UI = {
      setDecisionButtons(disabled) { ['btnAdmit','btnCorrect','btnRefuse'].forEach(id=>document.getElementById(id).disabled=disabled); },
      updateCustomerSummary() {
        const c=Game.state.currentCustomer;
        document.getElementById('mobileCustomerSummary').textContent=c?`${c.person.name}: ${c.dialogue.at(-1)?.reply||c.statement}`:'';
      },
      renderCustomer(c) {
        document.getElementById('customerPortraitBox').innerHTML=CHARACTERS.renderPortraitSVG(c.person,'neutral');
        document.getElementById('customerIdentityBar').textContent=`${c.person.name} · ${c.groupSize} ${c.groupSize===1?'person':'people'}`;
        const traits=document.getElementById('customerTraitRow');traits.replaceChildren();
        [c.person.wearingRed?'🧥 Red clothes':'',c.person.tag==='Cinema Visitor'?'':c.person.tag].filter(Boolean).forEach(text=>{
          const badge=document.createElement('span');badge.className='bg-amber-900 text-amber-100 text-xs px-2 py-1 rounded-full';badge.textContent=text;traits.append(badge);
        });
        document.getElementById('customerStatementBox').textContent=c.statement;
        const follow=document.getElementById('customerFollowUpBox');follow.replaceChildren();
        c.dialogue.slice(-3).forEach(t=>{const p=document.createElement('p');p.textContent=`${t.question} — ${t.reply}`;follow.append(p);});
        follow.classList.toggle('hidden',!c.dialogue.length);
        const hint=document.getElementById('languageHintBar');hint.textContent=c.languageHint;hint.classList.toggle('hidden',!Game.state.showLanguageHints);
        const questions=[['which_film','Which film are you going to see?'],['are_you_sure','Are you going to watch this film?'],['why_see','Why are you going to see it?'],['how_many','How many people are there?'],['alternative','Is another film OK?'],['other_ticket','Do you have another ticket?']];
        const grid=document.getElementById('questionButtonsGrid');grid.replaceChildren();
        questions.forEach(([key,label])=>{const button=document.createElement('button');button.className='bg-[#3d0d13] hover:bg-[#5c1620] text-amber-100 border border-amber-600/60 rounded-lg px-2.5 py-2 text-left text-xs font-medium';button.textContent=(c.asked.includes(key)?'✓ ':'▸ ')+label;button.onclick=()=>{Game.askCustomerQuestion(key,label);button.textContent='✓ '+label;};grid.append(button);});
        this.updateCustomerSummary();
      },
      renderTicketOnDesk(c) {
        const area=document.getElementById('deskDocumentArea'),t=c.ticket;area.replaceChildren();
        if(!t.exists) {const card=document.createElement('div');card.className='ticket-slide bg-rose-950 border-2 border-dashed border-rose-400 rounded-xl p-5 text-center';card.textContent='🎟 No ticket on the desk.';area.append(card);return;}
        const card=document.createElement('div');
        card.className='cinema-ticket '+(t.ticketType.includes('VIP')?'ticket-vip':t.ticketType.includes('LOUNGE')?'ticket-lounge':t.ticketType==='REPLACEMENT PRINTED'?'ticket-corrected':'')+' ticket-slide p-4 font-ticket';
        card.innerHTML='<div class="border-b-2 border-slate-800 pb-2 mb-3"><div class="font-marquee text-base text-red-950">THE GRAND CINEMA</div><div class="text-xs text-slate-600">Ticket · Check all fields</div></div><div class="ticket-fields grid grid-cols-2 gap-2.5"></div>';
        const fields=[['serial',t.serial,'Ticket number',t.serial],['ticket_film',t.filmId,`Film / Programme · ${t.genreLabel}`,t.filmTitle],['ticket_screen',t.screen,'Screen / Room',t.screen==='TV Lounge'?'TV Lounge':'Screen '+t.screen],['ticket_time',t.time,'Start time',t.time],['ticket_date',t.date,'Day',t.date],['ticket_seats',t.seats,'Booked seats',t.seats],['ticket_type',t.ticketType,'Ticket type',t.ticketType]];
        fields.forEach(([kind,value,label,display])=>{
          const node=document.createElement('button');node.type='button';node.className='inspectable text-left bg-white/70 border border-slate-400/80 p-2 rounded '+(['serial','ticket_film','ticket_type'].includes(kind)?'col-span-2':'');
          const name=document.createElement('span');name.className='text-[10px] uppercase text-slate-600 block font-sans font-bold';name.textContent=label;
          const text=document.createElement('span');text.className='font-bold text-sm text-slate-950';text.textContent=display;
          node.append(name,text);node.onclick=()=>Game.handleInspectClick(kind,value,label+': '+display,node);
          card.querySelector('.ticket-fields').append(node);
        });
        const b=Game.booking(c), booking=document.createElement('button');booking.className='inspectable w-full mt-3 text-xs text-left border-t border-dashed border-slate-500 pt-2';
        booking.textContent=`Booking record: ${b?b.seats+' seat(s) · '+b.status:'not found'} · Arrival ${Game.formatMins(c.arrivalTime)}`;
        booking.onclick=()=>Game.handleInspectClick('booking_seats',b?.seats??0,'Booking record: '+(b?.seats??0)+' seats',booking);card.append(booking);
        if(Game.state.ownedUpgrades.includes('computer')) {const note=document.createElement('div');note.className='text-xs mt-2 font-bold';note.textContent=Game.state.usedSerials.includes(t.serial)?'💻 USED ticket number':'💻 Ticket number not used';card.append(note);}
        if(Game.state.ownedUpgrades.includes('scanner')) {const f=Game.screening(t.filmId);const scan=document.createElement('button');scan.className='mt-2 text-xs font-bold border border-amber-700 rounded p-2';scan.textContent='🔍 Scan printed fields';scan.onclick=()=>{
          const fields=f?['filmTitle','screen','time'].filter(k=>String(t[k])!==String(f[k==='filmTitle'?'title':k])):[];
          document.getElementById('inspectStatusText').textContent=!f?'No programme entry.':fields.length?'Printed fields differ: '+fields.join(', '):'Printed film, room and time match the programme.';
        };card.append(scan);}
        area.append(card);
      },
      renderScheduleBinder() {
        const s=Game.state;document.getElementById('scheduleDayTag').textContent=Game.today();
        const render=(id,items)=>{const list=document.getElementById(id);list.replaceChildren();items.forEach(f=>{
          const node=document.createElement('button');node.type='button';node.className='inspectable w-full text-left p-2 rounded-lg border '+(f.status==='CANCELLED'?'bg-red-100 border-red-400':'bg-amber-50 border-amber-300');
          node.innerHTML='<div class="flex justify-between gap-2"><strong class="text-xs text-slate-900"></strong><span class="room text-[10px] bg-red-900 text-amber-100 rounded px-1"></span></div><div class="details font-ticket text-[11px] text-slate-700"></div>';
          node.querySelector('strong').textContent=f.title+' · '+f.genreLabel;
          node.querySelector('.room').textContent=f.screen==='TV Lounge'?'TV Lounge':'Screen '+f.screen;
          node.querySelector('.details').textContent=`${f.time} · ${Game.freeSeats(f)} free / ${f.capacity} total${f.status!=='ON TIME'?' · '+f.status:''}`;
          node.onclick=()=>Game.handleInspectClick('schedule_row',f.id,`${f.title} · ${f.time}`,node);list.append(node);
        });};
        render('filmScheduleList',s.schedule);render('tvScheduleList',s.tvSchedule);
        document.getElementById('tvLoungeScheduleSection').classList.toggle('hidden',!s.tvSchedule.length);
      },
      animateStamp(action) {
        const overlay=document.getElementById('stampAnimationOverlay'),box=document.getElementById('stampMarkBox');overlay.classList.remove('hidden');
        box.textContent={ADMIT:'ADMITTED',CORRECT:'CORRECTED',REFUSE:'REFUSED'}[action];box.style.color={ADMIT:'#15803d',CORRECT:'#b45309',REFUSE:'#b91c1c'}[action];
        box.style.animation='none';void box.offsetWidth;box.style.animation='';
      },
      renderPause() {
        const stopped=Game.state.paused||Game.state.modalDepth>0;
        document.getElementById('pauseBtnIcon').textContent=stopped?'▶️':'⏸️';document.getElementById('pauseBtnText').textContent=stopped?'Resume':'Pause';
        document.getElementById('manualPauseNote').classList.toggle('hidden',!Game.state.paused);
      },
      modalStack: new Set(),
      showModal(id) {this.modalStack.add(id);Game.state.modalDepth=this.modalStack.size;document.getElementById(id).classList.remove('hidden');this.renderPause();},
      hideModal(id) {this.modalStack.delete(id);Game.state.modalDepth=this.modalStack.size;document.getElementById(id).classList.add('hidden');this.renderPause();},
      openTeacherModal() {
        document.getElementById('teacherDiffSelect').value=Game.state.difficulty;
        document.getElementById('teacherDaySelect').value=Game.state.day;
        document.getElementById('teacherToggleHints').checked=Game.state.showLanguageHints;
        document.getElementById('teacherToggleTV').checked=Game.state.enableTVContent;
        document.getElementById('teacherToggleTimer').checked=Game.state.disableQueueWalkouts;
        document.getElementById('languagePackJsonArea').value=JSON.stringify(LANGUAGE_PACK,null,2);this.showModal('teacherModal');
      },
      closeTeacherModal() {this.hideModal('teacherModal');},
      openGuideModal() {this.showModal('guideModal');},
      closeGuideModal() {this.hideModal('guideModal');},
      openNotice(text) {document.getElementById('noticeText').textContent=text;this.showModal('noticeModal');},
      openCompare() {
        if(!Game.state.currentCustomer)return;
        this.compareOrigins=[];
        ['deskDocumentArea','filmScheduleList','tvLoungeScheduleSection'].forEach(id=>{
          const el=document.getElementById(id),marker=document.createComment('document position');el.before(marker);this.compareOrigins.push([el,marker]);
          document.getElementById(id==='deskDocumentArea'?'compareTicket':'compareSchedule').append(el);
        });
        document.getElementById('compareRequest').textContent=Game.state.currentCustomer.statement;
        this.showModal('compareModal');
      },
      closeCompare() { (this.compareOrigins||[]).forEach(([el,marker])=>marker.replaceWith(el));this.compareOrigins=[];this.hideModal('compareModal'); },

      renderHeader() {
        const s = Game.state;
        const dayCfg = CAMPAIGN_DAYS[s.day] || CAMPAIGN_DAYS[6];
        document.getElementById('headerDayBadge').textContent = `DAY ${s.day}: ${dayCfg.dayName}`;
        document.getElementById('headerDifficultyBadge').textContent =
          s.difficulty === 'relaxed' ? 'Relaxed (A1)' : s.difficulty === 'normal' ? 'Normal Mode' : 'Chaos Mode';
        document.getElementById('moneyDisplay').textContent = `€${s.money}`;
        document.getElementById('reputationBar').style.width = `${s.reputation}%`;
        document.getElementById('reputationText').textContent = `${s.reputation}%`;
        document.getElementById('warningsDisplay').textContent = `${s.warnings} / ${s.maxWarnings}`;
        document.getElementById('scannerUpgradeBadge').classList.toggle('hidden', !s.ownedUpgrades.includes('scanner'));
        this.updateClockDisplay();
      },

      updateClockDisplay() {
        document.getElementById('clockDisplay').textContent = Game.state.clockFormatted;
      },

      updateDifficultyButtons() {
        const d = Game.state.difficulty;
        const map = {
          relaxed: document.getElementById('diffBtnRelaxed'),
          normal: document.getElementById('diffBtnNormal'),
          chaos: document.getElementById('diffBtnChaos')
        };
        Object.keys(map).forEach(k => {
          const btn = map[k];
          if (!btn) return;
          if (k === d) {
            btn.className = "px-3 py-1.5 rounded-lg text-xs font-extrabold border-2 border-amber-900 bg-amber-400 text-slate-950 shadow";
          } else {
            btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-400 bg-white text-slate-700 hover:bg-slate-100";
          }
        });
      },

      renderQueue() {
        const q = Game.state.queue;
        document.getElementById('queueCountBadge').textContent = `Waiting: ${q.length}`;
        const container = document.getElementById('queueVisualContainer');
        if (q.length === 0) {
          container.innerHTML = `<span class="text-xs text-amber-200/50 italic">No customers waiting outside...</span>`;
          return;
        }
        container.innerHTML = q.map(c => {
          const barColor = c.patience > 60 ? 'bg-emerald-400' : c.patience > 30 ? 'bg-amber-400' : 'bg-rose-500';
          return `
            <div class="bg-slate-900/90 border border-amber-700/60 rounded-lg px-2 py-1 flex items-center gap-1.5 shrink-0">
              <span class="w-3 h-3 rounded-full inline-block border border-white/50" style="background:${c.person.coatColor}"></span>
              <div>
                <div class="text-[10px] font-bold text-amber-100 leading-none">${c.person.name}</div>
                <div class="w-12 h-1.5 bg-black rounded-full overflow-hidden mt-1">
                  <div class="h-full ${barColor}" style="width:${Math.round(c.patience)}%"></div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      },







      showDeskFeedback(type, htmlMsg) {
        const banner = document.getElementById('deskFeedbackBanner');
        banner.classList.remove('hidden');
        if (type === "ok") {
          banner.className = "w-full max-w-md mx-auto mt-2 rounded-xl p-3 border-2 shadow-xl text-xs sm:text-sm bg-emerald-950/95 border-emerald-400 text-emerald-100 font-medium";
        } else if (type === "warn") {
          banner.className = "w-full max-w-md mx-auto mt-2 rounded-xl p-3 border-2 shadow-xl text-xs sm:text-sm bg-amber-950/95 border-amber-400 text-amber-100 font-medium";
        } else {
          banner.className = "w-full max-w-md mx-auto mt-2 rounded-xl p-3 border-2 shadow-xl text-xs sm:text-sm bg-rose-950/95 border-rose-400 text-rose-100 font-medium";
        }
        banner.textContent = htmlMsg;
      },



      renderRulesBinder() {
        const dayCfg = CAMPAIGN_DAYS[Game.state.day] || CAMPAIGN_DAYS[6];
        const list = document.getElementById('activeRulesList');
        list.innerHTML = dayCfg.rulesSummary.map(r => `
          <div onclick="Game.handleInspectClick('rule', '${r.title.replace(/'/g, "\\'")}', '${r.title}', this)"
               class="inspectable bg-white p-2.5 rounded-lg border border-amber-400 shadow-sm">
            <div class="font-bold text-red-900 uppercase text-xs">${r.title}</div>
            <p class="font-ticket text-slate-700 text-xs mt-0.5">${r.text}</p>
          </div>
        `).join('');
      },

      renderSerialsBinder() {
        const sContainer = document.getElementById('usedSerialsContainer');
        sContainer.innerHTML = Game.state.usedSerials.map(ser => `
          <span onclick="Game.handleInspectClick('serial_log', '${ser}', 'Used Serial: ${ser}', this)"
                class="inspectable font-ticket text-xs font-bold bg-indigo-100 text-indigo-950 border border-indigo-400 px-2 py-1 rounded">
            ${ser}
          </span>
        `).join('');

        const vContainer = document.getElementById('vipListContainer');
        vContainer.innerHTML = Game.state.authorizedVips.map(vip => `
          <div onclick="Game.handleInspectClick('vip_log', '${vip}', 'Authorized VIP: ${vip}', this)"
               class="inspectable p-1.5 rounded bg-purple-50 border border-purple-300 text-purple-950 font-bold">
            ✅ ${vip} — Signed by The Manager
          </div>
        `).join('');
      },

      renderUpgradesStrip() {
        const strip = document.getElementById('ownedUpgradesStrip');
        if (Game.state.ownedUpgrades.length === 0) {
          strip.innerHTML = `<span class="text-[11px] text-amber-200/50 italic">Standard Equipment</span>`;
          return;
        }
        strip.innerHTML = Game.state.ownedUpgrades.map(id => {
          const u = UPGRADES_CATALOG.find(item => item.id === id);
          return u ? `<span class="bg-amber-900/90 border border-amber-400 text-amber-100 px-2 py-0.5 rounded text-[11px] font-bold" title="${u.desc}">${u.icon} ${u.name}</span>` : '';
        }).join('');
      },

      switchBinderTab(tab) {
        SoundFX.click();
        const tabs = ['schedule', 'rules', 'serials'];
        tabs.forEach(t => {
          const panel = document.getElementById('binderTab' + t.charAt(0).toUpperCase() + t.slice(1));
          const btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1));
          if (t === tab) {
            panel.classList.remove('hidden');
            btn.className = "py-1.5 px-2 rounded-lg text-xs font-bold bg-[#e2b857] text-slate-950 shadow transition flex items-center justify-center gap-1";
          } else {
            panel.classList.add('hidden');
            btn.className = "py-1.5 px-2 rounded-lg text-xs font-bold bg-transparent text-amber-200 hover:bg-white/10 transition flex items-center justify-center gap-1 relative";
          }
        });
      },

      switchMobileTab(col) {
        SoundFX.click();
        const map = {
          window: { sec: 'colWindow', btn: 'mobTabWindow' },
          desk: { sec: 'colDesk', btn: 'mobTabDesk' },
          info: { sec: 'colInfo', btn: 'mobTabInfo' }
        };
        Object.keys(map).forEach(k => {
          const secEl = document.getElementById(map[k].sec);
          const btnEl = document.getElementById(map[k].btn);
          if (k === col) {
            secEl.classList.remove('hidden');
            btnEl.className = "flex-1 py-1.5 rounded-md text-xs font-bold bg-[#e2b857] text-slate-950";
          } else {
            secEl.classList.add('hidden', 'lg:flex');
            btnEl.className = "flex-1 py-1.5 rounded-md text-xs font-bold bg-[#3d0d13] text-amber-200 border border-amber-700/50";
          }
        });
      },

      openBriefingModal(dayNum) {
        const cfg = CAMPAIGN_DAYS[dayNum] || CAMPAIGN_DAYS[6];
        document.getElementById('briefingDaySubtitle').textContent = `THE GRAND CINEMA — ${cfg.dayName} SHIFT`;
        document.getElementById('briefingDayTitle').textContent = cfg.title;
        document.getElementById('briefingMemoText').textContent = cfg.memo;
        document.getElementById('briefingLanguageFocus').textContent = cfg.languageFocus;

        const ul = document.getElementById('briefingRulesChecklist');
        ul.innerHTML = cfg.checklist.map(item => `
          <li class="flex items-start gap-2">
            <span class="text-emerald-700 font-bold">✔</span>
            <span>${item}</span>
          </li>
        `).join('');

        this.updateDifficultyButtons();
        document.getElementById('briefingModal').classList.remove('hidden');
      },

      closeBriefingModal() {
        document.getElementById('briefingModal').classList.add('hidden');
      },

      openShiftReportModal(headline, dismissed) {
        const st = Game.state.shiftStats;
        document.getElementById('reportModalTitle').textContent = headline;
        document.getElementById('reportServed').textContent = st.served;
        document.getElementById('reportCorrect').textContent = st.correct;
        document.getElementById('reportMistakes').textContent = st.mistakes;
        document.getElementById('reportTotalCash').textContent = `€${Game.state.money}`;

        let comment = `"Acceptable work. Please work faster tomorrow, and remember the rules."`;
        if (dismissed) {
          comment = `"Too many mistakes! The Grand Cinema cannot survive this chaos. Please replay this shift and check the rules carefully."`;
        } else if (st.mistakes === 0 && st.correct >= 4) {
          comment = `"Magnificent! Zero mistakes! Even the Corporate Inspector is impressed. Have a cup of tea before tomorrow's shift."`;
        } else if (Game.state.day === 5) {
          comment = `"You survived all five days at The Grand Cinema! Thanks to your ticket inspections, the cinema is saved from bankruptcy!"`;
        }
        document.getElementById('reportManagerComment').textContent = comment;

        const storyBox = document.getElementById('reportStoryNotes');
        if (st.dilemmaNotes.length > 0) {
          storyBox.innerHTML = `<strong>📖 Shift Story Notes:</strong><br/>` + st.dilemmaNotes.join('<br/>');
          storyBox.classList.remove('hidden');
        } else {
          storyBox.innerHTML = `<strong>📖 Cinema Status:</strong> Reputation stands at <strong>${Game.state.reputation}%</strong>. High Score: <strong>€${Game.state.highScore}</strong>.`;
          storyBox.classList.remove('hidden');
        }

        const nextBtn = document.getElementById('nextDayContinueBtn');
        if (dismissed) {
          nextBtn.classList.add('hidden');
        } else {
          nextBtn.classList.remove('hidden');
          nextBtn.textContent = Game.state.day === 5
            ? "🎉 ENTER ENDLESS MODE ➡️"
            : Game.state.day >= 6
            ? "PLAY ANOTHER ENDLESS SHIFT ➡️"
            : `CONTINUE TO DAY ${Game.state.day + 1} ➡️`;
        }

        this.renderUpgradeShop();
        document.getElementById('shiftReportModal').classList.remove('hidden');
      },

      closeShiftReportModal() {
        document.getElementById('shiftReportModal').classList.add('hidden');
      },

      renderUpgradeShop() {
        document.getElementById('shopAvailableCash').textContent = `Available Cash: €${Game.state.money}`;
        const grid = document.getElementById('upgradeShopGrid');
        grid.innerHTML = UPGRADES_CATALOG.map(u => {
          const owned = Game.state.ownedUpgrades.includes(u.id);
          const canAfford = Game.state.money >= u.cost;
          return `
            <div class="bg-white p-3 rounded-xl border ${owned ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-300'} flex items-center justify-between gap-2">
              <div>
                <div class="font-bold text-xs text-slate-900 flex items-center gap-1">
                  <span>${u.icon}</span>
                  <span>${u.name}</span>
                </div>
                <p class="text-[11px] text-slate-600 mt-0.5">${u.desc}</p>
              </div>
              <button onclick="Game.buyUpgrade('${u.id}')"
                      ${owned || !canAfford ? 'disabled' : ''}
                      class="shrink-0 px-3 py-1.5 rounded-lg font-ticket text-xs font-bold transition ${
                        owned
                          ? 'bg-emerald-700 text-white cursor-default'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }">
                ${owned ? 'OWNED' : '€' + u.cost}
              </button>
            </div>
          `;
        }).join('');
      },








    };

    const baseRules = () => {
      const day=Game.state.day;
      const rules=[{id:'ticket',title:'Tickets and bookings',text:'You need a ticket for today. Check the film, room, time and seats. A booking keeps your seats, even when there are no free seats.'},
        {id:'plan',title:'The customer’s plan',text:'Ask when the plan is not clear. Personal likes and dislikes do not cancel a booking.'}];
      rules.push(day===1?{id:'printer',title:'Printer closed',text:'Today: admit correct tickets. Refuse tickets with errors.'}:{id:'printer',title:'Changes',text:'Standard tickets for today can be changed to a film the customer accepts. It must have enough seats. A changed ticket lets them enter.'});
      if(day>=2)rules.push({id:'late',title:'Ten minutes',text:'No entry more than 10 minutes after the start. Use the arrival time on the booking record. You may help Mr Morris, but late entry still gets a warning.'});
      if(day>=3)rules.push({id:'serial',title:'Used numbers and passes',text:'A ticket number can only be used once. PROMO and VIP passes cannot be changed. Tickets for another day cannot be changed.'});
      if(day===3){const f=Game.screening('planet_x');if(f)rules.push({id:'move',title:'Room change',text:`${f.title} (${f.time}) is now in Screen 1. Change tickets with the old room.`});}
      if(day>=4&&Game.state.tvSchedule.length)rules.push({id:'tv',title:'TV Lounge',text:'TV programmes need a TV Lounge pass. You can change a Standard ticket to a TV Lounge pass.'});
      if(day>=5){
        rules.push({id:'red',title:'Screen 2: red clothes',text:'After 19:10, only customers in red clothes can enter Screen 2. Their ticket must still meet every other rule.'});
        const f=Game.screening('happy_penguins_late');if(f)rules.push({id:'extra',title:'Extra show',text:`${f.title}: extra show at 19:15 in Screen 2. The earlier show stays at ${Game.screening('happy_penguins').time}.`});
        const cancelled=Game.screening('love_in_paris');if(cancelled)rules.push({id:'cancel',title:'Cancelled',text:`${cancelled.title} (${cancelled.time}) is cancelled. Ask about another film.`});
        rules.push({id:'vip',title:'VIP list',text:'VIP numbers must be on the list. A VIP still needs the right day, film, room, time and booking. Red clothes and the late rule still apply.'});
      }
      return rules;
    };
    UI.renderRulesBinder=function(){
      const list=document.getElementById('activeRulesList');list.replaceChildren();
      baseRules().forEach(r=>{
        const node=document.createElement('button');node.className='inspectable w-full text-left bg-white p-2.5 rounded-lg border border-amber-400 shadow-sm';
        const title=document.createElement('strong');title.className='text-red-900 block';title.textContent=r.title;
        const text=document.createElement('p');text.className='font-ticket text-slate-700 text-xs mt-1';text.textContent=r.text;node.append(title,text);
        node.onclick=()=>Game.handleInspectClick('rule',r.id,r.title,node);list.append(node);
      });
    };
    const originalBriefing=UI.openBriefingModal;
    UI.openBriefingModal=function(day){
      const cfg=CAMPAIGN_DAYS[day], rules=baseRules();
      cfg.memo=['Welcome to the Grand Cinema.','Read the programme. Check the ticket. Ask the customer.','After each decision, press Next customer.'].join('\n');
      if(day===2)cfg.memo+='\nThe ticket printer is ready today. The new late limit is ten minutes.';
      cfg.checklist=rules.map(r=>r.title+': '+r.text);
      // Original template escapes checklist data here because titles can come from teacher imports.
      const saved=cfg.checklist;cfg.checklist=saved.map(escapeHTML);originalBriefing.call(this,day);cfg.checklist=saved;
    };
    function escapeHTML(text){return String(text).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
    const oldInit=Game.init;
    Game.init=function(){
      oldInit.call(this);
      const day=document.getElementById('scheduleDayTag');day.tabIndex=0;day.setAttribute('role','button');day.classList.add('inspectable');day.onclick=()=>Game.handleInspectClick('today',Game.today(),'Today: '+Game.today(),day);
      document.getElementById('customerStatementBox').tabIndex=0;document.getElementById('clockInspectBox').tabIndex=0;
      UI.setDecisionButtons(true);
      if(innerWidth<1024)UI.switchMobileTab('window');
    };
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape') {if(UI.modalStack.has('compareModal'))UI.closeCompare();else if(UI.modalStack.has('guideModal'))UI.closeGuideModal();else if(UI.modalStack.has('teacherModal'))UI.closeTeacherModal();return;}
      if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey||e.repeat)return;
      if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"]')){e.preventDefault();e.target.click();return;}
      if(!Game.state.shiftActive||Game.state.modalDepth)return;
      const actions={a:()=>Game.makeDecision('ADMIT'),c:()=>Game.openCorrectionDrawer(),r:()=>Game.makeDecision('REFUSE'),q:()=>Game.askCustomerQuestion('which_film','Which film are you going to see?'),i:()=>Game.toggleInspectMode(),p:()=>Game.togglePause(),n:()=>{if(Game.state.decisionLocked)Game.nextCustomerFromQueue();}};
      const fn=actions[e.key.toLowerCase()];if(fn){e.preventDefault();fn();}
    });
    // IDs supplied through a URL seed reproduce scenario choices for development.
    window.CinemaDebug={setSeed(seed){Game.rngSeed=Math.max(1,Math.floor(seed)%2147483647);},get game(){return Game;},get ui(){return UI;}};

    // Start game on window load
    window.onload = function () {
      Game.init();
    };

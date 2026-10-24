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
        const defaultQuestions=[['which_film','Which film are you going to see?'],['are_you_sure','Are you going to watch this film?'],['why_see','Why are you going to see it?'],['how_many','How many people are there?'],['alternative','Is another film OK?'],['other_ticket','Do you have another ticket?']];
        const questions=Game.campaign()?.playerQuestions||defaultQuestions;
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
        const langSelect = document.getElementById('teacherLangSelect');
        if (langSelect) langSelect.value = Game.state.selectedLanguageMode || Game.state.languageMode || 'elementary';
        document.getElementById('teacherDiffSelect').value=Game.state.difficulty;
        document.getElementById('teacherDaySelect').value=Game.state.day;
        document.getElementById('teacherToggleHints').checked=Game.state.showLanguageHints;
        document.getElementById('teacherToggleTV').checked=Game.state.enableTVContent;
        document.getElementById('teacherToggleTimer').checked=Game.state.disableQueueWalkouts;
        document.getElementById('languagePackJsonArea').value=JSON.stringify(Game.languagePack(),null,2);this.showModal('teacherModal');
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

      openCampaignSelectModal(options = {}) {
        Game.state.pendingCampaignAction = null;
        this.renderCampaignMenuShiftBanner();
        this.renderCampaignMenuSettings();
        this.renderCampaignCards();
        if (options.isInitialLaunch && !Game.state.shiftActive) {
          document.getElementById('campaignSelectModal').classList.remove('hidden');
        } else {
          this.showModal('campaignSelectModal');
        }
      },

      renderCampaignMenuShiftBanner() {
        const banner = document.getElementById('campaignMenuActiveShiftBanner');
        if (!banner) return;
        if (!Game.state.shiftActive) {
          banner.classList.add('hidden');
          return;
        }
        banner.classList.remove('hidden');
        const pending = Game.state.pendingCampaignAction;
        if (pending) {
          const reg = window.CinemaChaos && window.CinemaChaos.CampaignRegistry;
          const targetCamp = reg?.get(pending.campaignId);
          const targetTitle = targetCamp ? this.escapeHTML(targetCamp.title) : this.escapeHTML(pending.campaignId);
          const desc = pending.type === 'replay'
            ? `Restarting "${targetTitle}" from Day 1 will abandon your current active shift.`
            : `Switching to "${targetTitle}" will abandon your current active shift.`;
          banner.className = "bg-rose-950/95 border-2 border-rose-400 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3";
          banner.innerHTML = `
            <div class="text-xs sm:text-sm text-rose-100">
              <strong class="text-amber-300 uppercase font-ticket block">⚠️ Abandon Active Shift?</strong>
              <span id="campaignMenuActiveShiftInfo">${desc}</span>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" onclick="Game.confirmPendingCampaignAction()" class="bg-rose-700 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow transition">
                Abandon Shift &amp; Continue
              </button>
              <button type="button" onclick="UI.resumeActiveShiftFromMenu()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-3.5 py-2 rounded-lg shadow transition">
                ▶️ Keep Playing Shift
              </button>
            </div>
          `;
        } else {
          banner.className = "bg-amber-950/90 border-2 border-[#e2b857] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3";
          banner.innerHTML = `
            <div class="text-xs sm:text-sm text-amber-100">
              <strong class="text-[#f7d983] uppercase font-ticket block">⏸️ Shift Paused in Progress</strong>
              <span id="campaignMenuActiveShiftInfo">Your current box-office shift is safely paused.</span>
            </div>
            <button type="button" onclick="UI.resumeActiveShiftFromMenu()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm px-4 py-2 rounded-lg shadow transition">
              ▶️ Resume Active Shift
            </button>
          `;
        }
      },

      closeCampaignSelectModal() {
        Game.state.pendingCampaignAction = null;
        this.hideModal('campaignSelectModal');
      },

      resumeActiveShiftFromMenu() {
        Game.state.pendingCampaignAction = null;
        this.closeCampaignSelectModal();
      },

      renderCampaignMenuSettings() {
        const langContainer = document.getElementById('campaignMenuLanguageButtons');
        const diffContainer = document.getElementById('campaignMenuDifficultyButtons');
        const langNote = document.getElementById('campaignMenuLanguageNotice') || document.getElementById('campaignMenuLanguageNote');
        const camp = Game.campaign();
        const activeLang = Game.state.selectedLanguageMode || Game.state.languageMode || 'elementary';
        const activeDiff = Game.state.difficulty || 'normal';

        if (langContainer) {
          const modes = [
            { id: 'elementary', label: 'Elementary' },
            { id: 'intermediate', label: 'Intermediate' },
            { id: 'advanced', label: 'Advanced' }
          ];
          langContainer.innerHTML = modes.map(m => {
            const modeMeta = camp?.languageModes?.[m.id];
            const isAvailable = modeMeta ? modeMeta.available !== false : m.id === 'elementary';
            const isSelected = activeLang === m.id;
            const badge = !isAvailable ? ' <span class="text-[10px] opacity-75">(Soon)</span>' : '';
            const cls = isSelected
              ? 'px-3 py-1.5 rounded-lg text-xs font-extrabold border-2 border-amber-300 bg-[#e2b857] text-slate-950 shadow'
              : 'px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-700/60 bg-slate-900/80 text-amber-200 hover:bg-slate-800';
            return `<button type="button" onclick="Game.setLanguageMode('${m.id}')" class="${cls}">${m.label}${badge}</button>`;
          }).join('');
        }

        if (langNote) {
          const modeMeta = camp?.languageModes?.[activeLang];
          if (Game.state.pendingLanguageMode) {
            langNote.textContent = `Language change to ${Game.state.pendingLanguageMode.toUpperCase()} will take effect on the next customer or shift.`;
          } else if (modeMeta && modeMeta.available === false) {
            langNote.textContent = `${modeMeta.label || activeLang} language pack is Coming Soon — currently playing with Elementary dialogue. Gameplay decisions are unaffected.`;
          } else {
            langNote.textContent = 'Controls customer dialogue complexity. Takes effect on the next encounter or shift.';
          }
        }

        if (diffContainer) {
          const diffs = [
            { id: 'relaxed', label: 'Relaxed' },
            { id: 'normal', label: 'Normal' },
            { id: 'chaos', label: 'Chaos' }
          ];
          diffContainer.innerHTML = diffs.map(d => {
            const isSelected = activeDiff === d.id;
            const cls = isSelected
              ? 'px-3 py-1.5 rounded-lg text-xs font-extrabold border-2 border-amber-300 bg-[#e2b857] text-slate-950 shadow'
              : 'px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-700/60 bg-slate-900/80 text-amber-200 hover:bg-slate-800';
            return `<button type="button" onclick="Game.setDifficulty('${d.id}')" class="${cls}">${d.label}</button>`;
          }).join('');
        }
      },

      renderCampaignCards() {
        const grid = document.getElementById('campaignCardsGrid');
        if (!grid) return;
        const reg = window.CinemaChaos && window.CinemaChaos.CampaignRegistry;
        const campaigns = reg ? reg.list() : [];

        const cardsHtml = campaigns.map(camp => {
          const saved = Game.getCampaignSavedState(camp.id);
          const playableDays = camp.playableDaysCount || camp.totalDays || 7;
          const completedCount = (saved.completedDays || []).filter(d => d <= playableDays).length;
          const hasProgress = completedCount > 0 || saved.day > 1 || saved.money > 0;
          const isCurrent = Game.state.campaignId === camp.id;
          const isShiftActiveHere = isCurrent && Game.state.shiftActive;
          const dayLabel = saved.day > playableDays ? 'Endless Mode' : `Day ${saved.day} of ${camp.totalDays || 7}`;
          const primaryBtnLabel = isShiftActiveHere
            ? 'Resume Active Shift →'
            : hasProgress
            ? (saved.day > playableDays ? 'Continue (Endless Mode) →' : `Continue (Day ${saved.day}) →`)
            : 'Start Campaign →';

          return `
            <div class="bg-[#2a080c]/95 border-2 ${isCurrent ? 'border-[#e2b857]' : 'border-amber-700/70'} rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-widest bg-amber-900/80 text-amber-200 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                      ${this.escapeHTML(camp.subtitle || '7 Days')}
                    </span>
                    <h3 class="font-marquee text-xl sm:text-2xl text-[#f5d77f] mt-2 tracking-wide">${this.escapeHTML(camp.title)}</h3>
                  </div>
                  <span class="text-2xl" aria-hidden="true">🎟️</span>
                </div>
                <p class="text-xs sm:text-sm text-amber-100/90 mt-2.5 leading-relaxed">
                  ${this.escapeHTML(camp.description)}
                </p>

                <div class="mt-4 bg-black/40 border border-amber-800/50 rounded-xl p-3 font-ticket text-xs text-amber-200 space-y-1.5">
                  <div class="flex justify-between">
                    <span class="text-amber-300/70">Progress:</span>
                    <span class="font-bold text-amber-100">${dayLabel} (${completedCount}/${playableDays} days cleared)</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-amber-300/70">Cash &amp; Reputation:</span>
                    <span class="font-bold text-emerald-300">€${saved.money || 0} · ${saved.reputation ?? 80}% Rep</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-amber-300/70">High Score:</span>
                    <span class="font-bold text-amber-300">€${saved.highScore || 0}${(saved.totalCustomersLost || 0) > 0 ? ` · <span class="text-rose-300">${saved.totalCustomersLost} lost</span>` : ''}</span>
                  </div>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap items-center gap-2">
                <button type="button"
                        onclick="Game.startOrContinueCampaign('${camp.id}')"
                        class="flex-1 bg-gradient-to-b from-[#f5d77f] to-[#c8962e] hover:from-[#ffe494] hover:to-[#d9a63a] text-slate-950 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl border-2 border-amber-950 shadow-lg transition cursor-pointer">
                  ${primaryBtnLabel}
                </button>
                ${hasProgress ? `
                  <button type="button"
                          onclick="Game.replayCampaign('${camp.id}')"
                          class="bg-slate-900 hover:bg-slate-800 text-amber-200 font-bold text-xs px-3 py-2.5 rounded-xl border border-amber-600/50 transition cursor-pointer"
                          title="Reset this campaign back to Day 1">
                    Replay Day 1
                  </button>
                ` : ''}
              </div>
            </div>
          `;
        }).join('');

        const comingSoonCard = `
          <div class="bg-slate-950/75 border-2 border-dashed border-amber-900/50 rounded-2xl p-5 flex flex-col justify-between opacity-75 select-none">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-amber-300/60 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                    7 Days · Future Reels
                  </span>
                  <h3 class="font-marquee text-xl sm:text-2xl text-amber-200/60 mt-2 tracking-wide">Coming Soon</h3>
                </div>
                <span class="text-2xl opacity-50" aria-hidden="true">🔒</span>
              </div>
              <p class="text-xs sm:text-sm text-amber-100/60 mt-2.5 leading-relaxed">
                Additional seven-day campaigns with new cinema schedules, special festival events, and returning guests will appear here automatically when registered.
              </p>
              <div class="mt-4 bg-black/30 border border-amber-950/50 rounded-xl p-3 font-ticket text-xs text-amber-200/50">
                Status: Locked · Reel in Preparation
              </div>
            </div>
            <div class="mt-5">
              <button type="button" disabled
                      class="w-full bg-slate-900/80 text-amber-200/40 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-amber-900/40 cursor-not-allowed">
                🔒 Coming Soon
              </button>
            </div>
          </div>
        `;

        grid.innerHTML = cardsHtml + comingSoonCard;
      },

      renderHeader() {
        const s = Game.state;
        const dayCfg = Game.dayConfig(s.day);
        document.getElementById('headerDayBadge').textContent = `DAY ${s.day}: ${dayCfg.dayName}`;
        document.getElementById('headerDifficultyBadge').textContent =
          s.difficulty === 'relaxed' ? 'Relaxed Mode' : s.difficulty === 'normal' ? 'Normal Mode' : 'Chaos Mode';
        const langBadge = document.getElementById('headerLanguageBadge');
        if (langBadge) {
          const lang = s.selectedLanguageMode || s.languageMode || 'elementary';
          const modeMeta = Game.campaign()?.languageModes?.[lang];
          const label = modeMeta?.label || (lang.charAt(0).toUpperCase() + lang.slice(1));
          const suffix = modeMeta && modeMeta.available === false ? ' (Soon)' : '';
          langBadge.textContent = `Lang: ${label}${suffix}`;
        }
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
        this.renderCampaignMenuSettings();
      },

      updateLanguageButtons() {
        const l = Game.state.selectedLanguageMode || Game.state.languageMode || 'elementary';
        const camp = Game.campaign();
        const map = {
          elementary: document.getElementById('langBtnElementary'),
          intermediate: document.getElementById('langBtnIntermediate'),
          advanced: document.getElementById('langBtnAdvanced')
        };
        Object.keys(map).forEach(k => {
          const btn = map[k];
          if (!btn) return;
          const modeMeta = camp?.languageModes?.[k];
          const label = modeMeta?.label || (k.charAt(0).toUpperCase() + k.slice(1));
          btn.textContent = modeMeta && modeMeta.available === false ? `${label} (Soon)` : label;
          if (k === l) {
            btn.className = "px-2.5 py-1 rounded-lg text-xs font-extrabold border-2 border-amber-900 bg-amber-400 text-slate-950 shadow";
          } else {
            btn.className = "px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-400 bg-white text-slate-700 hover:bg-slate-100";
          }
        });
        const statusMsg = document.getElementById('briefingLanguageStatusNote');
        if (statusMsg) {
          const modeMeta = camp?.languageModes?.[l];
          if (modeMeta && modeMeta.available === false) {
            statusMsg.textContent = `${modeMeta.label} pack is Coming Soon — using Elementary dialogue.`;
            statusMsg.classList.remove('hidden');
          } else {
            statusMsg.textContent = '';
            statusMsg.classList.add('hidden');
          }
        }
        this.renderCampaignMenuSettings();
      },

      departureNotice: {
        count: 0,
        repLost: 0,
        names: [],
        timer: null
      },

      clearDepartureBanner() {
        if (this.departureNotice.timer) {
          if (typeof clearTimeout === 'function') clearTimeout(this.departureNotice.timer);
          this.departureNotice.timer = null;
        }
        this.departureNotice.count = 0;
        this.departureNotice.repLost = 0;
        this.departureNotice.names = [];
        const banner = document.getElementById('queueDepartureBanner');
        if (banner) {
          banner.classList.add('hidden');
          banner.innerHTML = '';
        }
      },

      notifyCustomerDepartures(departedCustomers = [], repPenalty = 3) {
        if (!Array.isArray(departedCustomers) || departedCustomers.length === 0) return;
        const banner = document.getElementById('queueDepartureBanner');
        const isAlreadyVisible = banner && !banner.classList.contains('hidden');
        if (!isAlreadyVisible) {
          this.departureNotice.count = 0;
          this.departureNotice.repLost = 0;
          this.departureNotice.names = [];
        }
        this.departureNotice.count += departedCustomers.length;
        this.departureNotice.repLost += repPenalty;
        for (const c of departedCustomers) {
          if (c?.person?.name) this.departureNotice.names.push(c.person.name);
        }

        if (banner) {
          const count = this.departureNotice.count;
          const repLost = this.departureNotice.repLost;
          const headline = count === 1
            ? 'CUSTOMER LEFT THE QUEUE'
            : `${count} CUSTOMERS LEFT THE QUEUE`;
          const detail = count === 1
            ? 'A customer got tired of waiting.'
            : `${count} waiting customers got tired of waiting.`;
          banner.className = 'mb-2 rounded-lg border-2 border-rose-400 bg-rose-950/95 px-2.5 py-1.5 text-xs text-rose-100 shadow-lg departure-banner-enter';
          banner.innerHTML = `
            <div class="flex items-center justify-between gap-2">
              <strong class="font-ticket uppercase tracking-wider text-amber-300">🚪 ${headline}</strong>
              <span class="font-ticket font-bold bg-rose-900/90 border border-rose-400/60 text-rose-200 px-1.5 py-0.5 rounded text-[11px]">Reputation −${repLost}</span>
            </div>
            <div class="text-[11px] text-rose-100/95 mt-0.5">${this.escapeHTML(detail)}</div>
          `;
          banner.classList.remove('hidden');
        }

        if (this.departureNotice.timer && typeof clearTimeout === 'function') {
          clearTimeout(this.departureNotice.timer);
        }
        if (typeof setTimeout === 'function') {
          this.departureNotice.timer = setTimeout(() => {
            this.clearDepartureBanner();
          }, 4500);
        }
      },

      renderQueue(departedCustomers = []) {
        const q = Game.state.queue;
        document.getElementById('queueCountBadge').textContent = `Waiting: ${q.length}`;
        const container = document.getElementById('queueVisualContainer');
        if (!container) return;

        const activeItemsHtml = q.map(c => {
          const state = Game.getPatienceState ? Game.getPatienceState(c.patience) : (c.patience <= 20 ? 'critical' : c.patience <= 40 ? 'impatient' : 'normal');
          const pct = Math.max(0, Math.min(100, Math.round(c.patience)));
          const cardClass = state === 'critical'
            ? 'bg-rose-950/95 border-2 border-rose-400 queue-state-critical'
            : state === 'impatient'
            ? 'bg-amber-950/90 border-2 border-amber-400 queue-state-impatient'
            : 'bg-slate-900/90 border border-amber-700/60';
          const barColor = state === 'critical'
            ? 'bg-rose-500'
            : state === 'impatient'
            ? 'bg-amber-400'
            : 'bg-emerald-400';
          const cueHtml = state === 'critical'
            ? `<span class="queue-patience-cue text-[9px] font-extrabold uppercase tracking-tight text-rose-200 bg-rose-900/90 border border-rose-400/70 px-1 rounded leading-tight">⚠️ Critical</span>`
            : state === 'impatient'
            ? `<span class="queue-patience-cue text-[9px] font-bold uppercase tracking-tight text-amber-200 bg-amber-900/90 border border-amber-400/70 px-1 rounded leading-tight">⏳ Impatient</span>`
            : '';
          return `
            <div data-patience-state="${state}" class="${cardClass} rounded-lg px-2 py-1 flex items-center gap-1.5 shrink-0 transition-colors">
              <span class="w-3 h-3 rounded-full inline-block border border-white/50 shrink-0" style="background:${c.person.coatColor}"></span>
              <div>
                <div class="flex items-center gap-1">
                  <span class="text-[10px] font-bold text-amber-100 leading-none">${this.escapeHTML(c.person.name)}</span>
                  ${cueHtml}
                </div>
                <div class="w-14 h-1.5 bg-black rounded-full overflow-hidden mt-1" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${this.escapeHTML(c.person.name)} patience ${pct}% (${state})">
                  <div class="h-full ${barColor}" style="width:${pct}%"></div>
                </div>
              </div>
            </div>
          `;
        }).join('');

        const departingHtml = Array.isArray(departedCustomers) && departedCustomers.length > 0
          ? departedCustomers.map(c => `
            <div data-patience-state="departed" class="bg-rose-950/90 border-2 border-rose-400 rounded-lg px-2 py-1 flex items-center gap-1.5 shrink-0 queue-item-departing">
              <span class="w-3 h-3 rounded-full inline-block border border-white/50 shrink-0" style="background:${c.person?.coatColor || '#ef4444'}"></span>
              <div>
                <div class="text-[10px] font-bold text-rose-200 leading-none">${this.escapeHTML(c.person?.name || 'Customer')}</div>
                <div class="text-[9px] font-extrabold uppercase text-amber-300 mt-0.5">🚪 Left queue</div>
              </div>
            </div>
          `).join('')
          : '';

        if (q.length === 0 && !departingHtml) {
          container.innerHTML = `<span class="text-xs text-amber-200/50 italic">No customers waiting outside...</span>`;
          return;
        }
        container.innerHTML = activeItemsHtml + departingHtml;
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

      getActiveRules() {
        const dayCfg = Game.dayConfig();
        const pol = dayCfg.policies || {};
        const camp = Game.campaign();
        const rules = [
          {id:'ticket',title:'Tickets and bookings',text:'You need a ticket for today. Check the film, room, time and seats. A booking keeps your seats, even when there are no free seats.'},
          {id:'plan',title:'The customer’s plan',text:'Ask when the plan is not clear. Personal likes and dislikes do not cancel a booking.'}
        ];
        rules.push(!pol.allowCorrections
          ? {id:'printer',title:'Printer closed',text:'Today: admit correct tickets. Refuse tickets with errors.'}
          : {id:'printer',title:'Changes',text:'Standard tickets for today can be changed to a film the customer accepts. It must have enough seats. A changed ticket lets them enter.'});
        if (pol.lateToleranceMins !== null && pol.lateToleranceMins !== undefined) {
          rules.push({
            id:'late',
            title: pol.lateRuleTitle || 'Ten minutes',
            text: pol.lateRuleText || camp.lateRuleText || `No entry more than ${pol.lateToleranceMins} minutes after the start. Use the arrival time on the booking record.`
          });
        }
        if (pol.checkDuplicates) {
          rules.push({
            id:'serial',
            title:'Used numbers and passes',
            text:'A ticket number can only be used once. PROMO and VIP passes cannot be changed. Tickets for another day cannot be changed.'
          });
        }
        for (const ch of (dayCfg.scheduleChanges || [])) {
          if (ch.type === 'relocate') {
            const f = Game.screening(ch.screeningId);
            if (f) {
              rules.push({
                id:'move',
                title:'Room change',
                text:`${f.title} (${f.time}) is now in Screen ${ch.toScreen}. Change tickets with the old room.`
              });
            }
          }
        }
        if (pol.tvLoungeOpen && Game.state.tvSchedule.length) {
          rules.push({
            id:'tv',
            title:'TV Lounge',
            text:'TV programmes need a TV Lounge pass. You can change a Standard ticket to a TV Lounge pass.'
          });
        }
        for (const r of (pol.conditionalScreenRules || [])) {
          rules.push({
            id: r.id || 'conditional',
            title: r.ruleTitle || `Screen ${r.screen} rule`,
            text: r.ruleText || r.issueText
          });
        }
        for (const ch of (dayCfg.scheduleChanges || [])) {
          if (ch.type === 'add_extra') {
            const f = Game.screening(ch.newId);
            const orig = Game.screening(ch.sourceScreeningId);
            if (f && orig) {
              rules.push({
                id:'extra',
                title:'Extra show',
                text:`${f.title}: extra show at ${f.time} in Screen ${f.screen}. The earlier show stays at ${orig.time}.`
              });
            }
          }
        }
        for (const ch of (dayCfg.scheduleChanges || [])) {
          if (ch.type === 'cancel') {
            const cancelled = Game.screening(ch.screeningId);
            if (cancelled) {
              rules.push({
                id:'cancel',
                title:'Cancelled',
                text:`${cancelled.title} (${cancelled.time}) is cancelled. Ask about another film.`
              });
            }
          }
        }
        if (pol.allowVipPasses) {
          rules.push({
            id:'vip',
            title:'VIP list',
            text: camp.vipRuleText || 'VIP numbers must be on the list. A VIP still needs the right day, film, room, time and booking.'
          });
        }
        return rules;
      },

      renderRulesBinder() {
        const list=document.getElementById('activeRulesList');list.replaceChildren();
        this.getActiveRules().forEach(r=>{
          const node=document.createElement('button');node.className='inspectable w-full text-left bg-white p-2.5 rounded-lg border border-amber-400 shadow-sm';
          const title=document.createElement('strong');title.className='text-red-900 block';title.textContent=r.title;
          const text=document.createElement('p');text.className='font-ticket text-slate-700 text-xs mt-1';text.textContent=r.text;node.append(title,text);
          node.onclick=()=>Game.handleInspectClick('rule',r.id,r.title,node);list.append(node);
        });
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
        const catalog = Game.upgradesCatalog();
        strip.innerHTML = Game.state.ownedUpgrades.map(id => {
          const u = catalog.find(item => item.id === id);
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

      escapeHTML(text) {
        return String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
      },

      openBriefingModal(dayNum) {
        const cfg = Game.dayConfig(dayNum);
        const rules = this.getActiveRules();
        const defaultMemo = ['Welcome to the Grand Cinema.', 'Read the programme. Check the ticket. Ask the customer.', 'After each decision, press Next customer.'].join('\n');
        const memo = cfg.briefingMemo || defaultMemo;
        const checklist = rules.map(r => r.title + ': ' + r.text);

        document.getElementById('briefingDaySubtitle').textContent = `THE GRAND CINEMA — ${cfg.dayName} SHIFT`;
        document.getElementById('briefingDayTitle').textContent = cfg.title;
        document.getElementById('briefingMemoText').textContent = memo;
        document.getElementById('briefingLanguageFocus').textContent = cfg.languageFocus;

        const ul = document.getElementById('briefingRulesChecklist');
        ul.innerHTML = checklist.map(item => `
          <li class="flex items-start gap-2">
            <span class="text-emerald-700 font-bold">✔</span>
            <span>${this.escapeHTML(item)}</span>
          </li>
        `).join('');

        this.updateDifficultyButtons();
        this.updateLanguageButtons();
        document.getElementById('briefingModal').classList.remove('hidden');
      },

      closeBriefingModal() {
        document.getElementById('briefingModal').classList.add('hidden');
      },

      openShiftReportModal(headline, dismissed) {
        const st = Game.state.shiftStats;
        const lost = st.customersLost || 0;
        const playableMax = Game.campaign()?.playableDaysCount || 5;
        document.getElementById('reportModalTitle').textContent = headline;
        document.getElementById('reportServed').textContent = st.served;
        document.getElementById('reportCorrect').textContent = st.correct;
        document.getElementById('reportMistakes').textContent = st.mistakes;
        const reportLostEl = document.getElementById('reportCustomersLost');
        if (reportLostEl) reportLostEl.textContent = String(lost);
        document.getElementById('reportTotalCash').textContent = `€${Game.state.money}`;

        let comment = `"Acceptable work. Please work faster tomorrow, and remember the rules."`;
        if (dismissed) {
          comment = `"Too many mistakes! The Grand Cinema cannot survive this chaos. Please replay this shift and check the rules carefully."`;
        } else if (st.mistakes === 0 && lost === 0 && st.correct >= 4) {
          comment = `"Magnificent! Zero mistakes! Even the Corporate Inspector is impressed. Have a cup of tea before tomorrow's shift."`;
        } else if (st.mistakes === 0 && lost > 0) {
          comment = `"Zero inspection mistakes, well done — though ${lost} waiting ${lost === 1 ? 'customer' : 'customers'} lost patience and left the queue. Try to keep the line moving tomorrow!"`;
        } else if (Game.state.day === playableMax) {
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
          nextBtn.textContent = Game.state.day === playableMax
            ? "🎉 ENTER ENDLESS MODE ➡️"
            : Game.state.day > playableMax
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
        grid.innerHTML = Game.upgradesCatalog().map(u => {
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

    document.addEventListener('keydown',e=>{
      if(e.key==='Escape') {
        if(UI.modalStack.has('compareModal'))UI.closeCompare();
        else if(UI.modalStack.has('guideModal'))UI.closeGuideModal();
        else if(UI.modalStack.has('teacherModal'))UI.closeTeacherModal();
        else if(UI.modalStack.has('campaignSelectModal') && Game.state.shiftActive)UI.closeCampaignSelectModal();
        return;
      }
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

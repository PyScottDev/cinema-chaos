    /***************************************************************************
     * CAMPAIGN REGISTRY & SCHEMA VALIDATOR
     * Discovers, validates, and manages campaign definitions without requiring
     * any campaign-specific logic in engine.js or ui.js.
     ***************************************************************************/
    const CampaignRegistry = {
      _campaigns: new Map(),
      _order: [],

      parseTime(t) {
        if (!/^\d{2}:\d{2}$/.test(t || "")) return NaN;
        const [h, m] = t.split(":").map(Number);
        return h < 24 && m < 60 ? h * 60 + m : NaN;
      },

      validate(campaign) {
        if (!campaign || typeof campaign !== "object" || Array.isArray(campaign)) {
          throw new Error("Campaign definition must be an object.");
        }
        const c = structuredClone(campaign);
        const reqStr = (val, path) => {
          if (typeof val !== "string" || !val.trim()) {
            throw new Error(`Invalid or missing string at '${path}'.`);
          }
        };

        reqStr(c.id, "id");
        if (!/^[a-z][a-z0-9_-]{1,60}$/.test(c.id)) {
          throw new Error(`Campaign id '${c.id}' must be lowercase alphanumeric/underscores/hyphens.`);
        }
        reqStr(c.title, "title");
        reqStr(c.subtitle, "subtitle");
        reqStr(c.description, "description");

        if (!c.languageModes || typeof c.languageModes !== "object") {
          throw new Error(`Campaign '${c.id}' must define 'languageModes'.`);
        }
        for (const mode of ["elementary", "intermediate", "advanced"]) {
          if (!c.languageModes[mode] || typeof c.languageModes[mode] !== "object") {
            throw new Error(`Campaign '${c.id}' languageModes must include '${mode}'.`);
          }
        }

        if (!c.languagePack || typeof c.languagePack !== "object") {
          throw new Error(`Campaign '${c.id}' must define 'languagePack'.`);
        }
        if (!Array.isArray(c.languagePack.films) || c.languagePack.films.length === 0) {
          throw new Error(`Campaign '${c.id}' languagePack.films must be a non-empty array.`);
        }

        const screeningIds = new Set();
        for (const [idx, f] of c.languagePack.films.entries()) {
          reqStr(f.id, `languagePack.films[${idx}].id`);
          reqStr(f.title, `languagePack.films[${idx}].title`);
          reqStr(f.genre, `languagePack.films[${idx}].genre`);
          reqStr(f.genreLabel, `languagePack.films[${idx}].genreLabel`);
          const mins = this.parseTime(f.time);
          if (!Number.isFinite(mins)) {
            throw new Error(`Invalid time '${f.time}' at languagePack.films[${idx}].time.`);
          }
          f.timeMins = mins;
          if (!Number.isInteger(f.capacity) || f.capacity < 1) {
            throw new Error(`Invalid capacity at languagePack.films[${idx}].capacity.`);
          }
          screeningIds.add(f.id);
        }

        if (c.languagePack.tvLoungeSchedule) {
          if (!Array.isArray(c.languagePack.tvLoungeSchedule)) {
            throw new Error(`Campaign '${c.id}' languagePack.tvLoungeSchedule must be an array.`);
          }
          for (const [idx, tv] of c.languagePack.tvLoungeSchedule.entries()) {
            reqStr(tv.id, `languagePack.tvLoungeSchedule[${idx}].id`);
            reqStr(tv.title, `languagePack.tvLoungeSchedule[${idx}].title`);
            reqStr(tv.genre, `languagePack.tvLoungeSchedule[${idx}].genre`);
            const mins = this.parseTime(tv.time);
            if (!Number.isFinite(mins)) {
              throw new Error(`Invalid time '${tv.time}' at languagePack.tvLoungeSchedule[${idx}].time.`);
            }
            tv.timeMins = mins;
            screeningIds.add(tv.id);
          }
        }

        if (!c.days || typeof c.days !== "object" || Array.isArray(c.days)) {
          throw new Error(`Campaign '${c.id}' must define a 'days' object.`);
        }
        const dayKeys = Object.keys(c.days).map(Number).filter(n => Number.isInteger(n) && n >= 1);
        if (dayKeys.length === 0) {
          throw new Error(`Campaign '${c.id}' must define at least Day 1 in 'days'.`);
        }

        const checkDay = (dayCfg, label) => {
          if (!dayCfg || typeof dayCfg !== "object") {
            throw new Error(`Invalid day configuration at '${label}'.`);
          }
          reqStr(dayCfg.dayName, `${label}.dayName`);
          reqStr(dayCfg.title, `${label}.title`);
          if (!dayCfg.policies || typeof dayCfg.policies !== "object") {
            throw new Error(`Missing 'policies' object at '${label}'.`);
          }
          if (Array.isArray(dayCfg.scheduleChanges)) {
            for (const [i, sc] of dayCfg.scheduleChanges.entries()) {
              if (!["relocate", "cancel", "add_extra"].includes(sc.type)) {
                throw new Error(`Unknown scheduleChange type '${sc.type}' at ${label}.scheduleChanges[${i}].`);
              }
              if (sc.type === "add_extra") {
                reqStr(sc.sourceScreeningId, `${label}.scheduleChanges[${i}].sourceScreeningId`);
                reqStr(sc.newId, `${label}.scheduleChanges[${i}].newId`);
                if (!Number.isFinite(this.parseTime(sc.time))) {
                  throw new Error(`Invalid time in ${label}.scheduleChanges[${i}].`);
                }
              } else {
                reqStr(sc.screeningId, `${label}.scheduleChanges[${i}].screeningId`);
              }
            }
          }
        };

        for (const k of dayKeys) {
          checkDay(c.days[k], `days[${k}]`);
        }
        if (c.endlessDay) {
          checkDay(c.endlessDay, "endlessDay");
        }

        return c;
      },

      register(campaign) {
        const validated = this.validate(campaign);
        if (!this._campaigns.has(validated.id)) {
          this._order.push(validated.id);
        }
        this._campaigns.set(validated.id, validated);
        return validated;
      },

      get(id) {
        return this._campaigns.get(id) || null;
      },

      list() {
        return this._order.map(id => this._campaigns.get(id));
      },

      unregister(id) {
        this._campaigns.delete(id);
        this._order = this._order.filter(item => item !== id);
      }
    };

    window.CinemaChaos = window.CinemaChaos || {};
    window.CinemaChaos.CampaignRegistry = CampaignRegistry;

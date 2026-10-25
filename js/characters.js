    /***************************************************************************
     * 3. EXPRESSIVE SVG PORTRAIT & RANDOM VISITOR GENERATOR
     * Campaign-independent character rendering and random visitor creation.
     ***************************************************************************/
    const CHARACTERS = {
      firstNames: [
        "Anna", "David", "Elena", "Marcus", "Clara", "Samir", "Nora", "Tom",
        "Lucia", "Ben", "Hannah", "Omar", "Eva", "Daniel", "Mei", "Victor"
      ],

      createRandomPerson(rng, forceRed = null) {
        const name = this.firstNames[Math.floor(rng() * this.firstNames.length)];
        const wearingRed = forceRed !== null ? forceRed : (rng() < 0.28);
        const redCoats = ["#dc2626", "#b91c1c", "#e11d48"];
        const otherCoats = ["#1d4ed8", "#15803d", "#6d28d9", "#0f766e", "#b45309", "#334155"];
        const coatColor = wearingRed
          ? redCoats[Math.floor(rng() * redCoats.length)]
          : otherCoats[Math.floor(rng() * otherCoats.length)];

        const skins = ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524"];
        const hairs = ["#1f2937", "#451a03", "#92400e", "#d97706", "#cbd5e1"];

        return {
          id: "cust_" + Math.floor(rng() * 100000),
          name,
          tag: wearingRed ? "Wearing Red Jacket" : "Cinema Visitor",
          isElderly: rng() < 0.15,
          coatColor,
          shirtColor: "#f8fafc",
          hairColor: hairs[Math.floor(rng() * hairs.length)],
          skinColor: skins[Math.floor(rng() * skins.length)],
          glasses: rng() < 0.35,
          hat: rng() < 0.25,
          wearingRed
        };
      },


      // Portrait casting uses the already-generated person ID, not game RNG.
      // This preserves seeded scenario logic, retry behaviour and save files.
      stablePortraitHash(value) {
        let hash = 2166136261;
        for (const char of String(value)) {
          hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
        }
        return hash >>> 0;
      },

      // Assign once to the finished customer. Do not infer legal age from artwork.
      assignPortrait(person, ageHint = null) {
        if (!person || person.characterId || Object.prototype.hasOwnProperty.call(PORTRAIT_REGISTRY.recurring, person.id)) return person;
        if (person.portraitId && PORTRAIT_REGISTRY.visitors.some(p => p.id === person.portraitId)) return person;
        const group = typeof ageHint !== 'number' || !Number.isFinite(ageHint) ? null
          : ageHint < 18 ? 'under18' : ageHint < 27 ? 'youngAdult'
          : ageHint < 60 ? 'adult' : 'olderAdult';
        const red = Boolean(person.wearingRed);
        // Curated procedural name pool: don't pair e.g. "Anna" with a male portrait.
        // Unknown and gender-neutral names can use the full visual roster.
        const first = String(person.name || '').trim().split(/\s+/)[0].toLowerCase();
        const feminine = new Set(['anna','elena','clara','nora','lucia','hannah','eva','mei']);
        const masculine = new Set(['david','marcus','samir','tom','ben','omar','daniel','victor']);
        const gender = feminine.has(first) ? 'female' : masculine.has(first) ? 'male' : null;
        let candidates = PORTRAIT_REGISTRY.visitors.filter(p => p.wearingRed === red && (!group || p.ageGroup === group) && (!gender || p.genderPresentation === gender));
        if (!candidates.length) candidates = PORTRAIT_REGISTRY.visitors.filter(p => p.wearingRed === red && (!gender || p.genderPresentation === gender));
        // Prefer consistent accessories if possible without compromising red clothing or casting age.
        const withGlasses = candidates.filter(p => p.glasses === Boolean(person.glasses));
        if (withGlasses.length) candidates = withGlasses;
        const hasHat = Boolean(person.hat) && person.hat !== 'none';
        const withHat = candidates.filter(p => p.hat === hasHat);
        if (withHat.length) candidates = withHat;
        const chosen = candidates[this.stablePortraitHash(`${person.id}|${person.name}`) % candidates.length];
        if (chosen) person.portraitId = chosen.id;
        return person;
      },

      portraitAsset(person) {
        if (!person || person.forceSvg || person.disablePortraitAsset) return null;
        // Stage 2C will map individual Leo encounters. Until then, preserve all
        // scripted costume cues using the existing SVG renderer instead of hiding them.
        if (['fakeBeard','oversizedSuit','sunglasses','editedMoustache','staffHat','staffBadge'].some(k => person[k])) return null;
        const knownId = person.characterId || person.id;
        if (Object.prototype.hasOwnProperty.call(PORTRAIT_REGISTRY.recurring, knownId)) {
          return { id: knownId, src: PORTRAIT_REGISTRY.recurring[knownId] };
        }
        return PORTRAIT_REGISTRY.visitors.find(p => p.id === person.portraitId) || null;
      },

      // A single renderer is used by the booth and by genuine identity cards.
      renderPortrait(person, mood = 'neutral') {
        const asset = this.portraitAsset(person);
        if (!asset) return this.renderPortraitSVG(person, mood);
        const fallbackData = encodeURIComponent(JSON.stringify(person));
        return `<img class="portrait-image w-full h-full object-cover rounded-lg customer-enter"`
          + ` src="${asset.src}" data-portrait-id="${asset.id}" alt=""`
          + ` data-fallback-person="${fallbackData}" data-fallback-mood="${mood}"`
          + ` draggable="false" decoding="async" onerror="CHARACTERS.handlePortraitImageError(this)">`;
      },

      handlePortraitImageError(img) {
        // Broken/missing assets degrade to the original SVG, without broken-image icons.
        if (!img) return;
        try {
          const person = JSON.parse(decodeURIComponent(img.getAttribute('data-fallback-person')));
          const mood = img.getAttribute('data-fallback-mood') || 'neutral';
          img.outerHTML = this.renderPortraitSVG(person, mood);
        } catch (_) {
          img.style.display = 'none';
        }
      },

      renderPortraitSVG(person, mood = "neutral") {
        const mouthPath = mood === "happy"
          ? "M 42 66 Q 50 74 58 66"
          : mood === "sad"
          ? "M 42 71 Q 50 64 58 71"
          : "M 43 68 Q 50 70 57 68";

        const glassesSVG = person.glasses ? `
          <g stroke="#fbbf24" stroke-width="2" fill="rgba(255,255,255,0.2)">
            <circle cx="41" cy="50" r="6.5" />
            <circle cx="59" cy="50" r="6.5" />
            <line x1="47.5" y1="50" x2="52.5" y2="50" />
          </g>
        ` : "";

        const hatSVG = person.hat ? `
          <g>
            <ellipse cx="50" cy="28" rx="26" ry="5" fill="#1e293b" stroke="#d4af37" stroke-width="1.5"/>
            <rect x="33" y="14" width="34" height="15" rx="4" fill="#334155" stroke="#d4af37" stroke-width="1.5"/>
          </g>
        ` : "";

        const wrinklesSVG = person.isElderly ? `
          <path d="M 38 41 Q 50 39 62 41" stroke="#8d5524" stroke-width="1" fill="none" opacity="0.6"/>
        ` : "";

        const oversizedSuitSVG = person.oversizedSuit ? `
          <g class="accessory-oversized-suit">
            <path d="M 8 103 L 12 71 L 34 73 L 50 94 L 66 73 L 88 71 L 92 103 Z"
                  fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
            <polygon points="34,73 43,75 48,93 38,91" fill="#334155" stroke="#0f172a" stroke-width="1"/>
            <polygon points="66,73 57,75 52,93 62,91" fill="#334155" stroke="#0f172a" stroke-width="1"/>
            <polygon points="48,76 53,76 55,98 46,96" fill="#dc2626" />
          </g>
        ` : "";

        const staffBadgeSVG = person.staffBadge ? `
          <g class="accessory-staff-badge">
            <rect x="57" y="82" width="16" height="10" rx="2" fill="#facc15" stroke="#78350f" stroke-width="1.2"/>
            <line x1="60" y1="86" x2="70" y2="86" stroke="#7f1d1d" stroke-width="1.5"/>
            <line x1="60" y1="89" x2="68" y2="89" stroke="#1e293b" stroke-width="1"/>
          </g>
        ` : "";

        const sunglassesSVG = person.sunglasses ? `
          <g class="accessory-sunglasses">
            <rect x="32" y="44" width="16" height="11" rx="2.5" fill="#090d16" stroke="#e2b857" stroke-width="1.6"/>
            <rect x="52" y="44" width="16" height="11" rx="2.5" fill="#090d16" stroke="#e2b857" stroke-width="1.6"/>
            <line x1="48" y1="48" x2="52" y2="48" stroke="#e2b857" stroke-width="2"/>
            <line x1="31" y1="47" x2="32" y2="47" stroke="#e2b857" stroke-width="2"/>
            <line x1="68" y1="47" x2="69" y2="47" stroke="#e2b857" stroke-width="2"/>
            <line x1="35" y1="46" x2="39" y2="52" stroke="#ffffff" stroke-width="1.2" opacity="0.55"/>
            <line x1="55" y1="46" x2="59" y2="52" stroke="#ffffff" stroke-width="1.2" opacity="0.55"/>
          </g>
        ` : "";

        const editedMoustacheSVG = person.editedMoustache ? `
          <g class="accessory-edited-moustache">
            <path d="M 35 63 Q 43 57 50 62 Q 57 57 65 64 Q 68 65 67 61"
                  stroke="#090d16" stroke-width="3.6" fill="none" stroke-linecap="round"/>
          </g>
        ` : "";

        const fakeBeardSVG = person.fakeBeard ? `
          <g class="accessory-fake-beard" transform="rotate(-5 50 68)">
            <line x1="31" y1="51" x2="35" y2="62" stroke="#d6d3d1" stroke-width="1.3" stroke-dasharray="2,1"/>
            <line x1="69" y1="51" x2="65" y2="62" stroke="#d6d3d1" stroke-width="1.3" stroke-dasharray="2,1"/>
            <path d="M 32 60 Q 50 56 68 60 C 73 74, 65 92, 50 94 C 35 92, 27 74, 32 60 Z"
                  fill="#5c2d0c" stroke="#271203" stroke-width="2"/>
            <ellipse cx="50" cy="67" rx="6" ry="2.8" fill="#3b1b06"/>
            <path d="M 38 72 Q 50 80 62 72" stroke="#3b1b06" stroke-width="1.5" fill="none"/>
          </g>
        ` : "";

        const staffHatSVG = person.staffHat ? `
          <g class="accessory-staff-hat">
            <path d="M 27 31 L 31 15 L 69 15 L 73 31 Z" fill="#7f1d1d" stroke="#facc15" stroke-width="1.8"/>
            <ellipse cx="50" cy="31" rx="25" ry="4.5" fill="#1e293b" stroke="#facc15" stroke-width="1.5"/>
            <circle cx="50" cy="23" r="3.5" fill="#facc15"/>
          </g>
        ` : "";

        return `
          <svg viewBox="0 0 100 105" class="w-full h-full drop-shadow-lg customer-enter">
            <!-- Shoulders / Coat -->
            <path d="M 16 102 C 16 78, 32 74, 50 74 C 68 74, 84 78, 84 102 Z"
                  fill="${person.coatColor}" stroke="#111827" stroke-width="2.5" />
            <!-- Shirt Collar -->
            <polygon points="41,75 59,75 50,92" fill="${person.shirtColor}" />
            ${oversizedSuitSVG}
            ${staffBadgeSVG}
            <!-- Neck -->
            <rect x="44" y="66" width="12" height="12" rx="3" fill="${person.skinColor}" />
            <!-- Hair Back -->
            <circle cx="50" cy="48" r="23" fill="${person.hairColor}" />
            <!-- Head -->
            <ellipse cx="50" cy="51" rx="19" ry="21" fill="${person.skinColor}" stroke="#111827" stroke-width="2" />
            <!-- Hair Top -->
            <path d="M 31 46 C 32 28, 68 28, 69 46 C 62 37, 38 37, 31 46 Z" fill="${person.hairColor}" />
            ${wrinklesSVG}
            <!-- Eyes -->
            <circle cx="41" cy="50" r="2.4" fill="#111827" />
            <circle cx="59" cy="50" r="2.4" fill="#111827" />
            ${glassesSVG}
            ${sunglassesSVG}
            <!-- Nose -->
            <path d="M 50 52 L 48 59 L 52 59" stroke="#78350f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
            <!-- Mouth -->
            <path d="${mouthPath}" stroke="#7f1d1d" stroke-width="2.2" fill="none" stroke-linecap="round" />
            ${editedMoustacheSVG}
            ${fakeBeardSVG}
            ${hatSVG}
            ${staffHatSVG}
          </svg>
        `;
      }
    };

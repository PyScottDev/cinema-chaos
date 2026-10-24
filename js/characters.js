    /***************************************************************************
     * 3. RECURRING CHARACTERS & EXPRESSIVE SVG PORTRAIT GENERATOR
     ***************************************************************************/
    const CHARACTERS = {
      recurring: {
        mr_morris: {
          id: "mr_morris",
          name: "Mr Morris",
          tag: "Regular Customer",
          isElderly: true,
          coatColor: "#475569",
          shirtColor: "#f8fafc",
          hairColor: "#cbd5e1",
          skinColor: "#f1c27d",
          glasses: true,
          hat: true,
          wearingRed: false
        },
        sofia: {
          id: "sofia",
          name: "Sofia",
          tag: "Documentary Fan",
          isElderly: false,
          coatColor: "#0f766e",
          shirtColor: "#fef08a",
          hairColor: "#3b1e08",
          skinColor: "#e0ac69",
          glasses: true,
          hat: false,
          wearingRed: false
        },
        leo: {
          id: "leo",
          name: "Leo",
          tag: "Hates Scary Films",
          isElderly: false,
          coatColor: "#dc2626", // Wearing red!
          shirtColor: "#ffffff",
          hairColor: "#eab308",
          skinColor: "#ffdbac",
          glasses: false,
          hat: false,
          wearingRed: true
        },
        mystery: {
          id: "mystery",
          name: "The Mystery Customer",
          tag: "VIP / Inspector?",
          isElderly: false,
          coatColor: "#311042",
          shirtColor: "#fde047",
          hairColor: "#111827",
          skinColor: "#d2996c",
          glasses: true,
          hat: true,
          wearingRed: false
        }
      },

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

        return `
          <svg viewBox="0 0 100 105" class="w-full h-full drop-shadow-lg customer-enter">
            <!-- Shoulders / Coat -->
            <path d="M 16 102 C 16 78, 32 74, 50 74 C 68 74, 84 78, 84 102 Z"
                  fill="${person.coatColor}" stroke="#111827" stroke-width="2.5" />
            <!-- Shirt Collar -->
            <polygon points="41,75 59,75 50,92" fill="${person.shirtColor}" />
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
            <!-- Nose -->
            <path d="M 50 52 L 48 59 L 52 59" stroke="#78350f" stroke-width="1.6" fill="none" stroke-linecap="round"/>
            <!-- Mouth -->
            <path d="${mouthPath}" stroke="#7f1d1d" stroke-width="2.2" fill="none" stroke-linecap="round" />
            ${hatSVG}
          </svg>
        `;
      }
    };

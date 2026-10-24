    /***************************************************************************
     * CAMPAIGN DEFINITION: "The First Week"
     * Structured according to the reusable Cinema Chaos Campaign Schema.
     * Contains zero executable logic — only declarative rules, schedules,
     * characters, scripted encounters, and language strings.
     ***************************************************************************/
    const THE_FIRST_WEEK_CAMPAIGN = {
      schemaVersion: 1,
      id: "the-first-week",
      title: "The First Week",
      subtitle: "7 Days · Learn the Job",
      description: "Welcome to your new job at the Grand Cinema. Learn the rules, survive your first week, and try to keep the manager happy.",
      totalDays: 7,
      playableDaysCount: 5,
      unlockRequirements: { type: "always" },
      serialPrefix: "GC",
      authorizedVips: ["VIP-770-MORRIS", "VIP-900-INSPECTOR"],

      languageModes: {
        elementary: { label: "Elementary", available: true },
        intermediate: { label: "Intermediate", available: false, notice: "Coming Soon" },
        advanced: { label: "Advanced", available: false, notice: "Coming Soon" }
      },

      characters: {
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
          coatColor: "#dc2626",
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

      upgradesCatalog: [
        {
          id: "scanner",
          name: "Better Ticket Scanner",
          cost: 35,
          icon: "🔍",
          desc: "Compare the printed film, room and time with one scan."
        },
        {
          id: "printer",
          name: "Faster Ticket Printer",
          cost: 40,
          icon: "🖨️",
          desc: "Pre-selects a screening from the customer’s stated plan. +€3 per correct replacement."
        },
        {
          id: "seating",
          name: "Velvet Queue Rope & Chairs",
          cost: 45,
          icon: "🪑",
          desc: "Waiting customers in the queue have +40% more patience before leaving."
        },
        {
          id: "computer",
          name: "Cinema Computer v2",
          cost: 50,
          icon: "💻",
          desc: "Automatically cross-checks Ticket Serial # against the Duplicate Log and shows a badge."
        },
        {
          id: "handbook",
          name: "Manager's Golden Handbook",
          cost: 55,
          icon: "📘",
          desc: "Forgives your first management warning each shift and boosts reputation gains."
        }
      ],

      languagePack: {
        version: 2,
        unitTitle: "Life Elementary — Unit 9 (9a & 9b): Entertainment, Film & TV",
        filmGenres: [
          "animation",
          "comedy",
          "documentary",
          "horror",
          "romantic",
          "science fiction",
          "thriller"
        ],
        tvProgrammes: [
          "sports programme",
          "comedy show",
          "quiz show",
          "horror film",
          "drama series",
          "wildlife documentary",
          "the news"
        ],
        adjectives: [
          "funny",
          "interesting",
          "violent",
          "scary",
          "exciting",
          "fun",
          "boring"
        ],
        films: [
          {
            id: "laughing_bananas",
            title: "Laughing Bananas",
            genre: "comedy",
            genreLabel: "Comedy",
            screen: 1,
            time: "18:00",
            timeMins: 18 * 60,
            capacity: 12,
            adjective: "funny",
            descriptions: [
              "I want something funny.",
              "I'm going to see a comedy to laugh.",
              "We're going to watch a funny film tonight."
            ],
            purposePhrases: ["to laugh", "to have fun with my friends"]
          },
          {
            id: "happy_penguins",
            title: "Happy Penguins",
            genre: "animation",
            genreLabel: "Animation",
            screen: 2,
            time: "18:15",
            timeMins: 18 * 60 + 15,
            capacity: 10,
            adjective: "fun",
            descriptions: [
              "We're going to see the animation.",
              "I'm going to watch a cartoon film with my family to have fun.",
              "I want something fun for children and adults."
            ],
            purposePhrases: ["to have fun", "to watch a fun cartoon"]
          },
          {
            id: "the_dark_house",
            title: "The Dark House",
            genre: "horror",
            genreLabel: "Horror",
            screen: 3,
            time: "18:30",
            timeMins: 18 * 60 + 30,
            capacity: 10,
            adjective: "scary",
            descriptions: [
              "I'm going to watch a horror film.",
              "I love scary films about ghosts.",
              "We're going to see a scary film tonight."
            ],
            purposePhrases: ["to be scared", "to see something scary"]
          },
          {
            id: "planet_x",
            title: "Planet X",
            genre: "science fiction",
            genreLabel: "Sci-fi",
            screen: 3,
            time: "19:00",
            timeMins: 19 * 60,
            capacity: 14,
            adjective: "exciting",
            descriptions: [
              "I love films about space.",
              "We're going to see the new science-fiction film.",
              "I'm going to watch a sci-fi film about astronauts."
            ],
            purposePhrases: ["to see space rockets", "to have an exciting evening"]
          },
          {
            id: "wild_world",
            title: "Wild World",
            genre: "documentary",
            genreLabel: "Documentary",
            screen: 1,
            time: "19:30",
            timeMins: 19 * 60 + 30,
            capacity: 12,
            adjective: "interesting",
            descriptions: [
              "I'm going to see a film about real animals.",
              "I'm going to watch a documentary to learn about animals.",
              "I want something interesting about nature."
            ],
            purposePhrases: ["to learn about animals", "to see something interesting"]
          },
          {
            id: "love_in_paris",
            title: "Love in Paris",
            genre: "romantic",
            genreLabel: "Romantic film",
            screen: 2,
            time: "20:00",
            timeMins: 20 * 60,
            capacity: 10,
            adjective: "romantic",
            descriptions: [
              "We want to watch a film about two people in love.",
              "I'm going to see a romantic film with my partner.",
              "We're going to watch a love story tonight."
            ],
            purposePhrases: ["to have a romantic evening", "to see a story about love"]
          },
          {
            id: "the_last_train",
            title: "The Last Train",
            genre: "thriller",
            genreLabel: "Thriller",
            screen: 3,
            time: "20:30",
            timeMins: 20 * 60 + 30,
            capacity: 14,
            adjective: "exciting",
            descriptions: [
              "I'm going to see something exciting.",
              "I'm going to watch a thriller tonight.",
              "We want an exciting mystery film, not a boring film."
            ],
            purposePhrases: ["to see an exciting story", "to have an exciting night"]
          }
        ],
        tvLoungeSchedule: [
          {
            id: "tv_horror",
            title: "Midnight Visitors",
            genre: "horror film",
            genreLabel: "Horror film",
            screen: "TV Lounge",
            time: "21:00",
            timeMins: 1260,
            capacity: 8,
            statement: "I’m going to watch a horror film. I like scary stories."
          },
          {
            id: "tv_sports",
            title: "Champions Football Live",
            genre: "sports programme",
            genreLabel: "Sports programme",
            screen: "TV Lounge",
            time: "18:15",
            timeMins: 18 * 60 + 15,
            capacity: 8,
            statement: "I'm going to watch the sports programme to see the football match."
          },
          {
            id: "tv_quiz",
            title: "Big Money Questions",
            genre: "quiz show",
            genreLabel: "Quiz show",
            screen: "TV Lounge",
            time: "18:45",
            timeMins: 18 * 60 + 45,
            capacity: 8,
            statement: "We're going to watch the quiz show to answer the questions!"
          },
          {
            id: "tv_wildlife",
            title: "Secrets of the Ocean",
            genre: "wildlife documentary",
            genreLabel: "Wildlife documentary",
            screen: "TV Lounge",
            time: "19:15",
            timeMins: 19 * 60 + 15,
            capacity: 8,
            statement: "I'm going to watch the wildlife documentary to learn about sea animals."
          },
          {
            id: "tv_news",
            title: "World Report at Eight",
            genre: "the news",
            genreLabel: "The news",
            screen: "TV Lounge",
            time: "20:00",
            timeMins: 20 * 60,
            capacity: 8,
            statement: "I want to watch the news to learn about the world."
          },
          {
            id: "tv_drama",
            title: "City Hospital",
            genre: "drama series",
            genreLabel: "Drama series",
            screen: "TV Lounge",
            time: "20:15",
            timeMins: 20 * 60 + 15,
            capacity: 8,
            statement: "I'm going to watch the drama series to see the new episode."
          },
          {
            id: "tv_comedy",
            title: "The Friday Laugh Show",
            genre: "comedy show",
            genreLabel: "Comedy show",
            screen: "TV Lounge",
            time: "20:45",
            timeMins: 20 * 60 + 45,
            capacity: 8,
            statement: "I'm going to watch the comedy show to laugh."
          }
        ]
      },

      days: {
        1: {
          dayNum: 1,
          dayName: "MONDAY",
          title: "Day 1 — First Day on the Job",
          memo: "MONDAY: NEW CINEMA RULE\n\"All customers need a ticket.\nNo ticket? No film.\nThe film, screen and time on the ticket must match today's schedule.\nPlease smile.\"",
          briefingMemo: "Welcome to the Grand Cinema.\nRead the programme. Check the ticket. Ask the customer.\nAfter each decision, press Next customer.",
          checklist: [
            "Every customer must have a valid ticket for MONDAY.",
            "Check that the Film, Screen, and Time match the Cinema Schedule.",
            "Listen to what the customer wants to see (e.g. 'something funny' = Comedy).",
            "On Day 1, ticket corrections are not open yet: ADMIT valid bookings or REFUSE invalid ones."
          ],
          languageFocus: "7 Film genres (Animation, Comedy, Documentary, Horror, Romantic, Sci-fi, Thriller) + descriptions ('something funny', 'films about space', 'real animals').",
          rulesSummary: [
            { id: "r_ticket", title: "Rule 1: Valid Ticket Required", text: "Every customer must present a ticket for TODAY (MONDAY). No ticket = REFUSE." },
            { id: "r_schedule", title: "Rule 2: Schedule Match", text: "Ticket Film, Screen number, and Time must match the Official Programme." },
            { id: "r_genre", title: "Rule 3: Customer Request", text: "If a customer bought the wrong film for what they want, REFUSE (Printer repairs finish tomorrow)." }
          ],
          policies: {
            allowCorrections: false,
            lateToleranceMins: null,
            checkDuplicates: false,
            allowPromoChanges: false,
            tvLoungeOpen: false,
            allowVipPasses: false,
            initialUsedSerials: [],
            conditionalScreenRules: []
          },
          scheduleChanges: [],
          midShiftNotices: [],
          casePool: ["wrong_film", "screen", "time", "date", "missing"],
          scriptedEncounters: [
            {
              id: "sofia",
              trigger: { caseIndex: 2, requireOpenScreeningId: "wild_world" },
              characterId: "sofia",
              caseType: "sofia",
              targetScreeningId: "wild_world"
            }
          ]
        },
        2: {
          dayNum: 2,
          dayName: "TUESDAY",
          title: "Day 2 — The Tuesday Rush",
          memo: "TUESDAY: NEW COMPANY RULES\n\"1. The Ticket Correction Printer is now working! If a customer has the wrong film, screen or time, use CORRECT.\n2. Customers cannot enter more than 10 minutes after the film starts.\n3. Group bookings need enough seats!\"",
          briefingMemo: "Welcome to the Grand Cinema.\nRead the programme. Check the ticket. Ask the customer.\nAfter each decision, press Next customer.\nThe ticket printer is ready today. The new late limit is ten minutes.",
          checklist: [
            "LATE RULE: Customers cannot enter more than 10 minutes after start time (e.g. 18:00 film closes at 18:10).",
            "CORRECTIONS ENABLED: Use CORRECT to print a replacement ticket if a customer has the wrong film, wrong screen, or wrong time (and seats are available).",
            "GROUP SEATS: Check that the ticket seats match the group size and the screening has enough seats."
          ],
          languageFocus: "Future plans with 'be going to' (affirmative, negative, questions) + checking screening start times and seat capacity.",
          rulesSummary: [
            { id: "r_late", title: "Rule 1: 10-Minute Late Limit", text: "Customers CANNOT enter more than 10 minutes after a film starts. (Check Booth Clock vs Film Time)." },
            { id: "r_correct", title: "Rule 2: Ticket Corrections", text: "Standard tickets with wrong film, screen, or time can be CORRECTED if another suitable screening has seats." },
            { id: "r_group", title: "Rule 3: Group Bookings", text: "Ticket seat count must cover the customer's group size." }
          ],
          policies: {
            allowCorrections: true,
            lateToleranceMins: 10,
            checkDuplicates: false,
            allowPromoChanges: false,
            tvLoungeOpen: false,
            allowVipPasses: false,
            initialUsedSerials: [],
            conditionalScreenRules: []
          },
          scheduleChanges: [],
          midShiftNotices: [],
          casePool: ["wrong_film", "screen", "time", "date", "missing", "group", "incomplete", "change", "hidden_ticket", "late"],
          scriptedEncounters: [
            {
              id: "morris",
              oncePerShift: true,
              trigger: { minClockMins: 1106, maxClockMins: 1115, requireLateScreeningId: "happy_penguins" },
              characterId: "morris",
              caseType: "morris",
              targetScreeningId: "happy_penguins",
              dilemma: true,
              requiredQuestion: true,
              intentGenres: ["animation", "comedy"]
            },
            {
              id: "leo",
              trigger: { caseIndex: 2, requireOpenScreeningId: "laughing_bananas" },
              characterId: "leo",
              caseType: "leo",
              targetScreeningId: "laughing_bananas",
              intentGenres: ["comedy"]
            }
          ]
        },
        3: {
          dayNum: 3,
          dayName: "WEDNESDAY",
          title: "Day 3 — Management Knows Best",
          memo: "WEDNESDAY: IMPORTANT NOTICE\n\"1. Projector problem in Screen 3! 'Planet X' (19:00) is MOVED to Screen 1.\n2. Watch out for DUPLICATE ticket serial numbers! Check the Security Log.\n3. PROMO tickets are cheap: PROMO tickets CANNOT be corrected!\"",
          briefingMemo: "Welcome to the Grand Cinema.\nRead the programme. Check the ticket. Ask the customer.\nAfter each decision, press Next customer.",
          checklist: [
            "SCREEN CHANGE: 'Planet X' (19:00) has moved from Screen 3 to Screen 1. Correct tickets that still say Screen 3!",
            "DUPLICATE SERIALS: Check the Ticket Serial # against the Used Serial Log. Refuse duplicates!",
            "PROMO TICKETS: Tickets marked 'PROMO (NO CHANGE)' cannot be corrected. If a Promo ticket has an error, you must REFUSE."
          ],
          languageFocus: "Infinitive of purpose ('to laugh', 'to learn about animals', 'to relax') + negative plans ('I'm not going to watch anything scary').",
          rulesSummary: [
            { id: "r_move", title: "Rule 1: Screen Move Notice", text: "'Planet X' (19:00) moved to Screen 1. Tickets saying Screen 3 must be CORRECTED to Screen 1." },
            { id: "r_dup", title: "Rule 2: No Duplicate Serials", text: "Check the Serial Log tab. If a Serial # was already used today, REFUSE entry." },
            { id: "r_promo", title: "Rule 3: Promo Tickets Final", text: "Ticket Type 'PROMO' cannot be corrected. Any error on a Promo ticket = REFUSE." },
            { id: "r_late", title: "Rule 4: 10-Minute Late Limit", text: "No entry more than 10 minutes after start time." }
          ],
          policies: {
            allowCorrections: true,
            lateToleranceMins: 10,
            checkDuplicates: true,
            allowPromoChanges: false,
            tvLoungeOpen: false,
            allowVipPasses: false,
            initialUsedSerials: ["GC-104", "GC-209", "GC-318"],
            conditionalScreenRules: []
          },
          scheduleChanges: [
            {
              type: "relocate",
              screeningId: "planet_x",
              toScreen: 1,
              statusLabel: "MOVED TO SCR 1"
            }
          ],
          midShiftNotices: [],
          casePool: ["wrong_film", "screen", "time", "date", "missing", "group", "incomplete", "change", "hidden_ticket", "late", "duplicate", "promo", "combined"],
          scriptedEncounters: [
            {
              id: "move",
              trigger: { caseIndex: 1, requireOpenScreeningId: "planet_x" },
              caseType: "move",
              targetScreeningId: "planet_x"
            },
            {
              id: "leo_return",
              trigger: { caseIndex: 6, requireStoryFlag: "leo" },
              characterId: "leo",
              caseType: "leo_return"
            }
          ]
        },
        4: {
          dayNum: 4,
          dayName: "THURSDAY",
          title: "Day 4 — Customer Happiness Week & TV Lounge",
          memo: "THURSDAY: THE TELEVISION LOUNGE IS OPEN!\n\"We now have a luxury TV Lounge showing Sports programmes, Quiz shows, Wildlife documentaries, Drama series, Comedy shows, and The News!\nCustomers for TV programmes need a TV LOUNGE ticket.\"",
          briefingMemo: "Welcome to the Grand Cinema.\nRead the programme. Check the ticket. Ask the customer.\nAfter each decision, press Next customer.",
          checklist: [
            "TV LOUNGE OPEN: Check the TV Lounge Schedule at the bottom of the Schedule tab.",
            "TV customers need a ticket for 'TV Lounge' matching their programme and time (or use CORRECT to fix a Standard ticket to the TV Lounge).",
            "Continue checking the 10-minute late limit, duplicate serial numbers, and Promo restrictions."
          ],
          languageFocus: "Television vocabulary (sports programme, comedy show, quiz show, wildlife documentary, drama series, the news) + purpose ('to learn about the world').",
          rulesSummary: [
            { id: "r_tv", title: "Rule 1: TV Lounge Access", text: "TV programmes take place in the 'TV Lounge'. If a customer has the wrong room or programme on a Standard ticket, use CORRECT." },
            { id: "r_dup", title: "Rule 2: Duplicate Serials & Promo Rules", text: "Duplicate serials = REFUSE. Promo tickets cannot be corrected." },
            { id: "r_late", title: "Rule 3: 10-Minute Late Limit", text: "No entry more than 10 minutes after start time." }
          ],
          policies: {
            allowCorrections: true,
            lateToleranceMins: 10,
            checkDuplicates: true,
            allowPromoChanges: false,
            tvLoungeOpen: true,
            allowVipPasses: false,
            initialUsedSerials: ["GC-104", "GC-209", "GC-318"],
            conditionalScreenRules: []
          },
          scheduleChanges: [],
          midShiftNotices: [],
          casePool: ["wrong_film", "screen", "time", "date", "missing", "group", "incomplete", "change", "hidden_ticket", "late", "duplicate", "promo", "combined", "tv_wrong"],
          scriptedEncounters: [
            {
              id: "tv",
              trigger: { caseIndex: 1, requireOpenRoom: "TV Lounge" },
              caseType: "tv"
            },
            {
              id: "morris_return",
              trigger: { caseIndex: 3, requireStoryFlag: "morris" },
              characterId: "mr_morris",
              caseType: "morris_return"
            },
            {
              id: "leo_return",
              trigger: { caseIndex: 6, requireStoryFlag: "leo" },
              characterId: "leo",
              caseType: "leo_return"
            }
          ]
        },
        5: {
          dayNum: 5,
          dayName: "FRIDAY",
          title: "Day 5 — Everything Is Fine (Cinema Chaos!)",
          memo: "FRIDAY: IMPORTANT FINAL RULES\n\"1. Customers CANNOT enter Screen 2 after 19:10. EXCEPTION: Customers wearing RED! The manager likes red.\n2. 'Love in Paris' (20:00) is CANCELLED! Correct those customers to another film they accept.\n3. Official VIP Passes signed by the Manager are valid.\"",
          briefingMemo: "Welcome to the Grand Cinema.\nRead the programme. Check the ticket. Ask the customer.\nAfter each decision, press Next customer.",
          checklist: [
            "THE RED RULE: No entry to Screen 2 after 19:10 UNLESS the customer is wearing RED!",
            "CANCELLED FILM: 'Love in Paris' (20:00) is cancelled. Question the customer and CORRECT their ticket to another film they want!",
            "VIP GUEST PASS: Check VIP passes against the Security & VIP Log."
          ],
          languageFocus: "Full Unit 9a & 9b synthesis: combining future plans ('be going to'), purpose ('to + infinitive'), film & TV vocabulary, and resolving contradictions.",
          rulesSummary: [
            { id: "r_red", title: "Rule 1: Screen 2 Red Policy", text: "Customers cannot enter Screen 2 after 19:10 — EXCEPT customers wearing RED clothing! (The Manager likes red)." },
            { id: "r_cancel", title: "Rule 2: Cancelled Screening", text: "'Love in Paris' (20:00) is CANCELLED. Question the customer and CORRECT their ticket to an available screening they like." },
            { id: "r_vip", title: "Rule 3: Manager's VIP Passes", text: "Customers with a signed VIP Authorization Pass (listed in Log tab) may enter." },
            { id: "r_all", title: "Rule 4: Standard Policies Apply", text: "Max 10 mins late, no duplicate serials, Promo tickets cannot be changed." }
          ],
          policies: {
            allowCorrections: true,
            lateToleranceMins: 10,
            checkDuplicates: true,
            allowPromoChanges: false,
            tvLoungeOpen: true,
            allowVipPasses: true,
            initialUsedSerials: ["GC-104", "GC-209", "GC-318"],
            conditionalScreenRules: [
              {
                id: "red",
                screen: 2,
                afterMins: 1150,
                requiredPersonProp: "wearingRed",
                issueText: "Screen 2: after 19:10, you need red clothes."
              }
            ]
          },
          scheduleChanges: [
            {
              type: "cancel",
              screeningId: "love_in_paris",
              statusLabel: "CANCELLED"
            },
            {
              type: "add_extra",
              sourceScreeningId: "happy_penguins",
              newId: "happy_penguins_late",
              screen: 2,
              time: "19:15",
              timeMins: 1155,
              statusLabel: "EXTRA SHOW"
            }
          ],
          midShiftNotices: [
            {
              id: "red",
              atMins: 1151,
              text: "It is after 19:10. Screen 2 now needs red clothes. All other rules still apply."
            }
          ],
          casePool: ["wrong_film", "screen", "time", "date", "missing", "group", "incomplete", "change", "hidden_ticket", "late", "duplicate", "promo", "combined", "tv_wrong", "cancelled", "red", "no_red"],
          scriptedEncounters: [
            {
              id: "red",
              oncePerShift: true,
              trigger: { minClockMins: 1151, maxClockMins: 1163, requireOpenScreeningId: "happy_penguins_late" },
              caseType: "red",
              targetScreeningId: "happy_penguins_late"
            },
            {
              id: "vip",
              trigger: { caseIndex: 4, requireUnusedSerial: "VIP-900-INSPECTOR" },
              characterId: "mystery",
              caseType: "vip",
              vipSerial: "VIP-900-INSPECTOR"
            },
            {
              id: "leo_return",
              trigger: { caseIndex: 6, requireStoryFlag: "leo" },
              characterId: "leo",
              caseType: "leo_return"
            }
          ]
        },
        6: {
          dayNum: 6,
          dayName: "SATURDAY",
          playable: false,
          title: "Day 6 — Saturday Matinee (Reserved)",
          memo: "Saturday campaign shift slot reserved for 7-day progression.",
          briefingMemo: "Welcome to the Grand Cinema.",
          checklist: ["Standard inspection rules apply."],
          languageFocus: "Unit 9 consolidation.",
          rulesSummary: [
            { id: "r_sat", title: "Saturday Shift", text: "All standard cinema policies apply." }
          ],
          policies: {
            allowCorrections: true,
            lateToleranceMins: 10,
            checkDuplicates: true,
            allowPromoChanges: false,
            tvLoungeOpen: true,
            allowVipPasses: true,
            initialUsedSerials: ["GC-104", "GC-209", "GC-318"],
            conditionalScreenRules: []
          },
          scheduleChanges: [],
          midShiftNotices: [],
          casePool: ["wrong_film", "screen", "time", "date", "missing"],
          scriptedEncounters: []
        },
        7: {
          dayNum: 7,
          dayName: "SUNDAY",
          playable: false,
          title: "Day 7 — Sunday Finale (Reserved)",
          memo: "Sunday campaign shift slot reserved for 7-day progression.",
          briefingMemo: "Welcome to the Grand Cinema.",
          checklist: ["Standard inspection rules apply."],
          languageFocus: "Unit 9 consolidation.",
          rulesSummary: [
            { id: "r_sun", title: "Sunday Shift", text: "All standard cinema policies apply." }
          ],
          policies: {
            allowCorrections: true,
            lateToleranceMins: 10,
            checkDuplicates: true,
            allowPromoChanges: false,
            tvLoungeOpen: true,
            allowVipPasses: true,
            initialUsedSerials: ["GC-104", "GC-209", "GC-318"],
            conditionalScreenRules: []
          },
          scheduleChanges: [],
          midShiftNotices: [],
          casePool: ["wrong_film", "screen", "time", "date", "missing"],
          scriptedEncounters: []
        }
      },

      endlessDay: {
        dayNum: 6,
        dayName: "SATURDAY",
        isEndless: true,
        title: "Endless Mode — Saturday Night Fever",
        memo: "SATURDAY: ENDLESS SHIFT\n\"You survived all five days! Now see how long you can run the box office on Saturday night.\nAll rules, TV Lounge programmes, and special policies are active!\"",
        briefingMemo: "Welcome to the Grand Cinema.\nRead the programme. Check the ticket. Ask the customer.\nAfter each decision, press Next customer.",
        checklist: [
          "All cinema & TV Lounge screenings are active.",
          "Watch out for Screen 2 after 19:10 (unless wearing red), duplicate serials, and late arrivals.",
          "Set your highest score!"
        ],
        languageFocus: "Complete Unit 9 review in endless replayable scenarios.",
        rulesSummary: [
          { id: "r_endless", title: "All Campaign Rules Active", text: "10-min late limit, Screen 2 Red rule after 19:10, Duplicate serial check, Promo no-change rule, and TV Lounge access." }
        ],
        policies: {
          allowCorrections: true,
          lateToleranceMins: 10,
          checkDuplicates: true,
          allowPromoChanges: false,
          tvLoungeOpen: true,
          allowVipPasses: true,
          initialUsedSerials: ["GC-104", "GC-209", "GC-318"],
          conditionalScreenRules: [
            {
              id: "red",
              screen: 2,
              afterMins: 1150,
              requiredPersonProp: "wearingRed",
              issueText: "Screen 2: after 19:10, you need red clothes."
            }
          ]
        },
        scheduleChanges: [
          {
            type: "cancel",
            screeningId: "love_in_paris",
            statusLabel: "CANCELLED"
          },
          {
            type: "add_extra",
            sourceScreeningId: "happy_penguins",
            newId: "happy_penguins_late",
            screen: 2,
            time: "19:15",
            timeMins: 1155,
            statusLabel: "EXTRA SHOW"
          }
        ],
        midShiftNotices: [
          {
            id: "red",
            atMins: 1151,
            text: "It is after 19:10. Screen 2 now needs red clothes. All other rules still apply."
          }
        ],
        casePool: ["wrong_film", "screen", "time", "date", "missing", "group", "incomplete", "change", "hidden_ticket", "late", "duplicate", "promo", "combined", "tv_wrong", "cancelled", "red", "no_red"],
        scriptedEncounters: [
          {
            id: "red",
            oncePerShift: true,
            trigger: { minClockMins: 1151, maxClockMins: 1163, requireOpenScreeningId: "happy_penguins_late" },
            caseType: "red",
            targetScreeningId: "happy_penguins_late"
          },
          {
            id: "vip",
            trigger: { caseIndex: 4, requireUnusedSerial: "VIP-900-INSPECTOR" },
            characterId: "mystery",
            caseType: "vip",
            vipSerial: "VIP-900-INSPECTOR"
          },
          {
            id: "leo_return",
            trigger: { caseIndex: 6, requireStoryFlag: "leo" },
            characterId: "leo",
            caseType: "leo_return"
          }
        ]
      }
    };

    if (window.CinemaChaos && window.CinemaChaos.CampaignRegistry) {
      window.CinemaChaos.CampaignRegistry.register(THE_FIRST_WEEK_CAMPAIGN);
    }

    // Legacy aliases preserved for Stage B compatibility prior to Stage C engine decoupling
    let LANGUAGE_PACK = structuredClone(THE_FIRST_WEEK_CAMPAIGN.languagePack);
    const DEFAULT_LANGUAGE_PACK = structuredClone(THE_FIRST_WEEK_CAMPAIGN.languagePack);
    const CAMPAIGN_DAYS = {
      1: THE_FIRST_WEEK_CAMPAIGN.days[1],
      2: THE_FIRST_WEEK_CAMPAIGN.days[2],
      3: THE_FIRST_WEEK_CAMPAIGN.days[3],
      4: THE_FIRST_WEEK_CAMPAIGN.days[4],
      5: THE_FIRST_WEEK_CAMPAIGN.days[5],
      6: THE_FIRST_WEEK_CAMPAIGN.endlessDay
    };
    const UPGRADES_CATALOG = THE_FIRST_WEEK_CAMPAIGN.upgradesCatalog;

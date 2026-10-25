/***************************************************************************
 * CAMPAIGN 1: THE FIRST WEEK (Seven-Day Narrative Campaign Configuration)
 ***************************************************************************/
const THE_FIRST_WEEK_CAMPAIGN = {
    schemaVersion: 1,
    id: 'the-first-week',
    title: 'The First Week',
    subtitle: '7 Days · Learn the Job',
    description: 'Step into the box office of The Grand Cinema for a full seven-day week (Monday to Sunday). Inspect tickets, verify age classifications and ID cards, handle a broken projector, catch a persistent teen in absurd disguises, navigate your manager’s shady VIP demands, and face the Sunday Corporate Inspection.',
    totalDays: 7,
    playableDaysCount: 7,
    unlockRequirements: { type: 'always' },
    serialPrefix: 'GC',

    languageModes: {
      elementary: {
        id: 'elementary',
        label: 'Elementary',
        available: true,
        description: 'Clear, accessible cinema dialogue practising plans ("be going to"), purpose ("to + verb"), age checks, and ticket queries.'
      },
      intermediate: {
        id: 'intermediate',
        label: 'Intermediate',
        available: false,
        comingSoon: true,
        description: 'Coming Soon — Richer conversational nuances and idiomatic excuses.'
      },
      advanced: {
        id: 'advanced',
        label: 'Advanced',
        available: false,
        comingSoon: true,
        description: 'Coming Soon — Fast-paced natural speech and subtle persuasion.'
      }
    },

    authorizedVips: ['VIP-770-MORRIS', 'VIP-880-PREMIERE', 'VIP-900-INSPECTOR'],
    authorizedStaff: ['STAFF-01-MAYA', 'STAFF-02-BOOTH'],
    inspectorCharacterId: 'mystery',

    printerClosedMessage: 'The ticket printer is closed until Wednesday. Today, refuse tickets with errors.',
    lateRuleText: 'No entry more than 10 minutes after the start. Use the arrival time on the booking record.',
    vipRuleText: 'VIP numbers must be on the official VIP list. A VIP still needs the right day, film, room, time, age rating and booking.',
    ageRuleText: 'Check film age ratings in the schedule: [G] all ages, [12] minimum age 12, [16] minimum age 16. Use the portraits to decide whether to ask for ID. Admit those old enough; refuse those underage. If you request ID, check the name, photo and birth date.',

    dilemmaMessage: {
      exceptionFeedback: 'Mr Morris is admitted late as a compassionate exception. +€6.',
      exceptionNote: 'You made a compassionate exception for Mr Morris when he arrived late.',
      refusedNote: 'Mr Morris arrived more than 10 minutes late and was refused in accordance with the rules.',
      correctedNote: 'Mr Morris accepted an alternative screening.'
    },

    inspectorNotes: {
      highRep: 'The Corporate Inspector praised your thoroughness and professional conduct at the window.',
      lowRep: 'The Corporate Inspector noted several irregularities in box-office procedure this week.'
    },

    playerQuestions: [
      ['which_film', 'Which film are you going to see?'],
      ['are_you_sure', 'Are you going to watch this film?'],
      ['why_see', 'Why are you going to see it?'],
      ['how_many', 'How many people are there?'],
      ['ask_age', 'How old are you?'],
      ['ask_id', 'Can I see your ID, please?'],
      ['alternative', 'Is another film OK?'],
      ['other_ticket', 'Do you have another ticket?']
    ],

    vocabularyHints: {
      funny: '“Funny” means it makes you laugh. “To laugh” tells us why.',
      scary: '“Scary” means it makes you afraid. Check the [16] age rating!',
      exciting: '“Exciting” means full of action and interest.',
      romantic: '“Romantic” is about love.',
      interesting: '“Interesting” means you want to know more about it.',
      default: '“To learn” tells us why someone does something.'
    },

    upgradesCatalog: [
      { id: 'scanner', name: 'Rule Highlight Scanner', cost: 40, icon: '🔍', desc: 'Adds a button on the ticket to check printed film, room and time.' },
      { id: 'printer', name: 'Fast Thermal Printer', cost: 45, icon: '🖨️', desc: 'Pre-selects a valid replacement when the customer’s plan is known, and pays +€3 on corrections.' },
      { id: 'seating', name: 'Velvet Queue Rope', cost: 35, icon: '🛋️', desc: 'Waiting customers lose patience more slowly.' },
      { id: 'computer', name: 'Serial Check Computer', cost: 50, icon: '💻', desc: 'Shows on the ticket whether its number is in the used-ticket log.' },
      { id: 'handbook', name: "Manager's Handbook", cost: 55, icon: '📘', desc: 'Forgives your first warning each day and adds +1 reputation on correct decisions.' }
    ],

    characters: {
      mr_morris: {
        id: 'mr_morris',
        name: 'Mr Morris',
        tag: 'Regular Visitor',
        isElderly: true,
        skin: '#f1c27d',
        skinColor: '#f1c27d',
        hairColor: '#cbd5e1',
        coatColor: '#475569',
        shirtColor: '#f8fafc',
        glasses: true,
        hat: true,
        moustache: true,
        wearingRed: false
      },
      sofia: {
        id: 'sofia',
        name: 'Sofia',
        tag: 'Film Student',
        isElderly: false,
        skin: '#e0ac69',
        skinColor: '#e0ac69',
        hairColor: '#3b1e08',
        coatColor: '#0f766e',
        shirtColor: '#fef08a',
        glasses: true,
        hat: false,
        moustache: false,
        wearingRed: false
      },
      leo: {
        id: 'leo',
        name: 'Leo',
        tag: 'Horror Fan',
        isElderly: false,
        skin: '#ffdbac',
        skinColor: '#ffdbac',
        hairColor: '#eab308',
        coatColor: '#dc2626',
        shirtColor: '#ffffff',
        glasses: false,
        hat: false,
        moustache: false,
        wearingRed: true
      },
      mystery: {
        id: 'mystery',
        name: 'Mystery Customer',
        tag: 'Quiet Visitor',
        isElderly: false,
        skin: '#d2996c',
        skinColor: '#d2996c',
        hairColor: '#111827',
        coatColor: '#311042',
        shirtColor: '#fde047',
        glasses: true,
        hat: true,
        moustache: false,
        wearingRed: false
      },
      maya: {
        id: 'maya',
        name: 'Maya',
        tag: 'Junior Staff',
        isElderly: false,
        skin: '#b9724d',
        skinColor: '#b9724d',
        hairColor: '#2d1b12',
        coatColor: '#556b2f',
        shirtColor: '#f5efe1',
        glasses: false,
        hat: false,
        moustache: false,
        wearingRed: false,
        staffBadge: false,
        shoulderBag: true
      },
      mr_blackwood: {
        id: 'mr_blackwood',
        name: 'Mrs Blackwood',
        tag: 'Cinema Manager',
        isElderly: false,
        skin: '#f1c27d',
        skinColor: '#f1c27d',
        hairColor: '#374151',
        coatColor: '#111827',
        shirtColor: '#fca5a5',
        glasses: true,
        hat: false,
        moustache: false,
        wearingRed: false
      }
    },

    days: {
      1: {
        dayNum: 1,
        dayName: 'MONDAY',
        title: 'Day 1 — The New Employee',
        briefingMemo: [
          'Welcome to The Grand Cinema. I am Mrs Blackwood, your manager.',
          'Your job is simple: read the programme, check every ticket field (film, screen, time, day and seats), and listen to the customer’s plan.',
          'The correction printer is closed until Wednesday. Today, ADMIT valid tickets and REFUSE any ticket with an error.'
        ].join('\n'),
        languageFocus: "Plans with 'be going to' + infinitive of purpose ('to laugh', 'to relax').",
        policies: {
          currentDate: '2026-10-12',
          dateDisplay: '12/10/2026',
          allowCorrections: false,
          checkAgeRestrictions: false,
          lateToleranceMins: null,
          checkDuplicates: false,
          allowPromoChanges: false,
          tvLoungeOpen: false,
          allowVipPasses: false,
          allowStaffPasses: false,
          conditionalScreenRules: []
        },
        scheduleChanges: [],
        casePool: ['wrong_film', 'screen', 'time', 'date', 'missing', 'hidden_ticket', 'incomplete', 'subjective'],
        midShiftNotices: [
          {
            id: 'day1_blackwood_memo',
            atMins: 1090,
            text: 'Manager’s Memo (Mrs Blackwood): Keep the queue moving! Tomorrow we introduce official Film Age Classifications ([G], [12], [16]). Do not embarrass my cinema.'
          }
        ],
        scriptedEncounters: [
          {
            id: 'morris_day1',
            characterId: 'mr_morris',
            caseType: 'valid',
            targetScreeningId: 'happy_penguins',
            expectedAction: 'ADMIT',
            storyKey: 'morris_day1_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 0 },
            statementTemplate: "One for {title}, please.",
            qaOverrides: {
              which_film: "I'm going to see Happy Penguins in Screen 2.",
              why_see: "I'm here to learn about animals. Penguins are marvellous creatures."
            },
            storyEffects: {
              onAction: {
                ADMIT: { morris_relationship: 'warm', morris_day1_outcome: 'helped' }
              },
              onMistake: { morris_relationship: 'upset', morris_day1_outcome: 'mistake' },
              dilemmaNoteByAction: {
                ADMIT: 'Mr Morris appreciated your polite welcome on your first day.'
              }
            }
          },
          {
            id: 'sofia_day1',
            characterId: 'sofia',
            caseType: 'valid',
            targetScreeningId: 'the_last_train',
            expectedAction: 'ADMIT',
            revealsNameInOpening: true,
            introducedName: 'Sofia',
            storyKey: 'sofia_day1_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "I'm Sofia. One for {title}, please.",
            qaOverrides: {
              which_film: "I'm going to see The Last Train at 20:30.",
              why_see: "I'm here to see an exciting thriller for my film class."
            },
            storyEffects: {
              onAction: {
                ADMIT: { sofia_trust: 'trusted', sofia_day1_outcome: 'helped' }
              },
              onMistake: { sofia_trust: 'wary', sofia_day1_outcome: 'mistake' },
              dilemmaNoteByAction: {
                ADMIT: 'You welcomed Sofia with her valid ticket.'
              }
            }
          },
          {
            id: 'blackwood_day1',
            characterId: 'mr_blackwood',
            caseType: 'screen',
            targetScreeningId: 'laughing_bananas',
            expectedAction: 'REFUSE',
            revealsNameInOpening: true,
            introducedName: 'Mrs Blackwood',
            storyKey: 'blackwood_day1_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Mrs Blackwood, your manager. Check this ticket for me.",
            qaOverrides: {
              which_film: "This test ticket is for Laughing Bananas in Screen 1.",
              are_you_sure: "I am testing whether you check the Screen field when the printer is closed."
            },
            storyEffects: {
              onAction: {
                REFUSE: { blackwood_day1_outcome: 'passed_test' }
              },
              onMistake: { blackwood_day1_outcome: 'failed_test' },
              dilemmaNoteByAction: {
                REFUSE: 'You passed Mrs Blackwood’s surprise Monday spot-check.'
              }
            }
          }
        ]
      },

      2: {
        dayNum: 2,
        dayName: 'TUESDAY',
        title: 'Day 2 — Not Old Enough',
        briefingMemo: [
          'Today is Tuesday, 13/10/2026. The town council is enforcing Film Age Classifications.',
          'Check the age rating next to every film in the schedule: [G] Suitable for all ages, [12] Minimum age 12, [16] Minimum age 16.',
          'You decide who looks young enough to check. Ask for ID if you are unsure, and examine its birth date and photo. The printer is still closed—refuse underage customers.'
        ].join('\n'),
        languageFocus: "Age verification ('How old are you?', 'Can I see your ID?') and date-of-birth checks.",
        policies: {
          currentDate: '2026-10-13',
          dateDisplay: '13/10/2026',
          allowCorrections: false,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age ratings & ID (13/10/2026)',
          ageRuleText: 'Ratings: [G] all ages, [12] min age 12 (born on or before 13/10/2014), [16] min age 16 (born on or before 13/10/2010). You decide whether to request ID based on appearance. Refuse customers who are below the minimum age.',
          lateToleranceMins: null,
          checkDuplicates: false,
          allowPromoChanges: false,
          tvLoungeOpen: false,
          allowVipPasses: false,
          allowStaffPasses: false,
          conditionalScreenRules: []
        },
        scheduleChanges: [],
        casePool: ['underage', 'missing_id', 'refused_id', 'age_valid', 'wrong_film', 'screen', 'time', 'date', 'missing'],
        midShiftNotices: [
          {
            id: 'day2_age_notice',
            atMins: 1092,
            text: 'Box Office Reminder: Look at each customer. Request ID when you think age may be an issue; check the photo and birth date. Refuse underage customers.'
          }
        ],
        scriptedEncounters: [
          {
            id: 'leo_day2',
            characterId: 'leo',
            caseType: 'missing_id',
            targetScreeningId: 'the_dark_house',
            expectedAction: 'REFUSE',
            claimedAge: 16,
            trueAge: 14,
            allowAgeCorrection: false,
            requiresAgeCheck: true,
            idCard: {
              exists: false,
              presented: false,
              reason: 'Customer claims he left his ID card in his school locker.'
            },
            questionEffects: {
              ask_age: { evidence: ['age_claimed'] },
              ask_id: { evidence: ['id_missing'], setStory: { leo_missing_id_spotted: 'yes' } }
            },
            storyKey: 'leo_day2_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 0 },
            statementTemplate: "Hi! One for {title}, please.",
            qaOverrides: {
              ask_age: "I'm sixteen! Definitely sixteen.",
              ask_id: "Er... my ID card? I left it in my school locker! Just trust me!",
              which_film: "I'm going to watch The Dark House in Screen 3.",
              why_see: "I'm here to see the scariest horror film of the year!"
            },
            storyEffects: {
              onAction: {
                REFUSE: { leo_day2_outcome: 'refused' }
              },
              onMistake: { leo_day2_outcome: 'mistake' },
              onMistakeByAction: { ADMIT: { leo_day2_outcome: 'admitted' } },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistakeByAction: { ADMIT: { leo_admitted_underage: 1 } },
              dilemmaNoteByAction: {
                REFUSE: 'You refused the customer entry to The Dark House [16] because no ID was provided.'
              },
              dilemmaNoteOnMistake: 'You admitted a customer to The Dark House [16] without ID.'
            }
          },
          {
            id: 'adult_horror_day2',
            caseType: 'age_valid',
            targetScreeningId: 'the_dark_house',
            expectedAction: 'ADMIT',
            claimedAge: 32,
            trueAge: 32,
            idCard: {
              exists: true,
              presented: false,
              holderName: 'Elena',
              dob: '13/10/1994',
              issueDate: '10/04/2023',
              expiryDate: '10/04/2028',
              docNumber: 'CID-941013',
              issuingAuthority: 'City Civil Registry'
            },
            personOverrides: {
              name: 'Elena',
              tag: 'Horror Critic',
              glasses: true,
              hat: 'none'
            },
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "Evening. One for {title}, please.",
            qaOverrides: {
              ask_age: "I'm thirty-two today—born on 13/10/1994.",
              ask_id: "Here is my ID card. My date of birth is 13/10/1994."
            }
          },
          {
            id: 'birthday_teen_day2',
            caseType: 'age_valid',
            targetScreeningId: 'planet_x',
            expectedAction: 'ADMIT',
            claimedAge: 12,
            trueAge: 12,
            idCard: {
              exists: true,
              presented: false,
              holderName: 'Sam',
              dob: '13/10/2014',
              issueDate: '15/09/2025',
              expiryDate: '15/09/2028',
              docNumber: 'STU-141013',
              issuingAuthority: 'Grandview Schools'
            },
            personOverrides: {
              name: 'Sam',
              tag: 'Birthday Visitor',
              hat: 'cap'
            },
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "One for {title}, please. It's my birthday!",
            qaOverrides: {
              ask_age: "I turn twelve today, 13/10/2026!",
              ask_id: "Here is my ID card—born 13/10/2014, twelve years ago today."
            }
          }
        ]
      },

      3: {
        dayNum: 3,
        dayName: 'WEDNESDAY',
        title: 'Day 3 — The Broken Projector',
        briefingMemo: [
          'Disaster in the projection booth! The Screen 3 projector broke down for the 19:00 show.',
          'Planet X (19:00) has been relocated from Screen 3 to Screen 1. The Ticket Correction Printer is now OPEN.',
          'When a customer has a fixable mistake—like an old Screen 3 ticket for Planet X—use CORRECT to print a replacement. Keep checking age ratings and IDs!'
        ].join('\n'),
        languageFocus: "Ticket corrections, room relocations, and spotting suspicious disguises.",
        policies: {
          currentDate: '2026-10-14',
          dateDisplay: '14/10/2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age ratings & ID (14/10/2026)',
          ageRuleText: 'Check [G], [12] and [16] ratings. Judge appearance before deciding whether to ask for ID. An ID you inspect must have real calendar dates and a matching photograph.',
          lateToleranceMins: null,
          checkDuplicates: false,
          allowPromoChanges: true,
          tvLoungeOpen: false,
          allowVipPasses: false,
          allowStaffPasses: false,
          conditionalScreenRules: []
        },
        scheduleChanges: [
          {
            type: 'relocate',
            screeningId: 'planet_x',
            toScreen: 1,
            statusLabel: 'MOVED TO SCR 1'
          }
        ],
        casePool: ['move', 'screen', 'wrong_film', 'incomplete', 'underage', 'missing_id', 'age_valid', 'time', 'date'],
        midShiftNotices: [
          {
            id: 'day3_projector_notice',
            atMins: 1090,
            text: 'Projection Booth Update: Planet X (19:00) is showing in Screen 1 today. Use the Correction Printer (CORRECT) for customers holding old Screen 3 tickets!'
          }
        ],
        scriptedEncounters: [
          {
            id: 'morris_day3',
            characterId: 'mr_morris',
            caseType: 'move',
            targetScreeningId: 'planet_x',
            expectedAction: 'CORRECT',
            revealsNameInOpening: true,
            introducedName: 'Mr Morris',
            storyKey: 'morris_day3_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 0 },
            statementByStory: [
              {
                condition: { key: 'morris_day1_outcome', value: 'helped' },
                text: "Mr Morris again. Is this still the right screen?"
              },
              {
                condition: { key: 'morris_day1_outcome', value: 'mistake' },
                text: "Mr Morris. Could you check this one carefully, please?"
              },
              {
                text: "I'm Mr Morris. Is this the right screen?"
              }
            ],
            qaOverrides: {
              which_film: "I'm going to see Planet X at 19:00.",
              alternative: "Screen 1 for Planet X is fine, thank you."
            },
            storyEffects: {
              onAction: {
                CORRECT: { morris_relationship: 'loyal', morris_day3_outcome: 'helped', known_char_mr_morris: 'yes' }
              },
              onMistake: { morris_relationship: 'cold', morris_day3_outcome: 'mistake' },
              dilemmaNoteByAction: {
                CORRECT: 'You reprinted Mr Morris’s Planet X ticket for Screen 1. He promised to bring his grandchildren on Saturday.'
              },
              dilemmaNoteOnMistake: 'Mr Morris was upset when his relocated Planet X ticket was not corrected.'
            },
            customFeedback: {
              CORRECT: 'Mr Morris’s ticket was reprinted for Screen 1. He thanked you warmly!'
            }
          },
          {
            id: 'maya_day3',
            characterId: 'maya',
            caseType: 'screen',
            targetScreeningId: 'wild_world',
            expectedAction: 'CORRECT',
            revealsNameInOpening: true,
            introducedName: 'Maya',
            storyKey: 'maya_day3_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 1 },
            ticketOverrides: {
              screen: 3
            },
            statementTemplate: "I'm Maya from the morning counter. Could you check this ticket?",
            qaOverrides: {
              which_film: "The ticket is for Wild World at 19:30 in Screen 2.",
              are_you_sure: "Yes, it just needs to be moved to Screen 2."
            },
            storyEffects: {
              onAction: {
                CORRECT: { maya_relationship: 'helped', maya_day3_outcome: 'helped', known_char_maya: 'yes' }
              },
              onMistake: { maya_relationship: 'blamed', maya_day3_outcome: 'mistake' },
              dilemmaNoteByAction: {
                CORRECT: 'You fixed Maya’s misprinted Screen 2 ticket. She promised to return the favour on Saturday.'
              },
              dilemmaNoteOnMistake: 'Maya was reprimanded by Mrs Blackwood after the misprinted ticket was not corrected.'
            },
            customFeedback: {
              CORRECT: 'You corrected Maya’s misprinted ticket to Screen 2. Maya breathed a huge sigh of relief!'
            }
          },
          {
            id: 'leo_day3',
            characterId: 'leo',
            caseType: 'disguise',
            targetScreeningId: 'the_dark_house',
            expectedAction: 'REFUSE',
            claimedAge: 24,
            trueAge: 14,
            allowAgeCorrection: false,
            concealIdentity: true,
            requiresAgeCheck: true,
            personTagOverride: '“Adult Gentleman”',
            personOverrides: {
              fakeBeard: true,
              obviousDisguise: true,
              disguiseIssueText: 'Customer is wearing a lopsided fake beard glued to his chin.'
            },
            idCard: {
              exists: true,
              presented: false,
              holderName: 'Leo',
              dob: '30/02/2012',
              issueDate: '01/04/2025',
              expiryDate: '01/04/2030',
              docNumber: 'TH-3002',
              issuingAuthority: 'Town Hall'
            },
            questionEffects: {
              ask_age: { evidence: ['age_claimed'] },
              ask_id: { evidence: ['id_presented'] }
            },
            storyKey: 'leo_day3_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 2 },
            statementByStory: [
              {
                condition: { key: 'leo_day2_outcome', value: 'refused' },
                text: "Me again? No, no. One adult ticket, please."
              },
              {
                text: "Good evening, fellow adult. One for {title}."
              }
            ],
            qaOverrides: {
              ask_age: "I am twenty-four years old!",
              ask_id: "Here you go.",
              which_film: "I am going to see The Dark House [16] in Screen 3."
            },
            storyEffects: {
              onEvidence: {
                age_id_contradiction: { leo_contradiction_spotted: 'yes' }
              },
              onAction: {
                REFUSE: { leo_day3_outcome: 'refused', leo_beard_detected: 'yes' }
              },
              onMistake: { leo_day3_outcome: 'mistake', leo_beard_detected: 'no' },
              onMistakeByAction: { ADMIT: { leo_day3_outcome: 'admitted' } },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistakeByAction: { ADMIT: { leo_admitted_underage: 1 } },
              dilemmaNoteByAction: {
                REFUSE: 'You refused the visitor wearing a visibly attached fake beard.'
              }
            }
          }
        ]
      },

      4: {
        dayNum: 4,
        dayName: 'THURSDAY',
        title: 'Day 4 — Someone Is Cheating',
        briefingMemo: [
          'Someone is cheating our box office! Scalpers outside are reselling duplicate ticket serials.',
          'Check every ticket number against the Used Serials log in the binder. Also enforce the 10-minute late arrival limit, and remember that PROMO (NO CHANGE) tickets cannot be reprinted if they have an error.',
          'Watch ID cards carefully: the name, dates, and photo on the ID must match the customer and ticket.'
        ].join('\n'),
        languageFocus: "Checking duplicate serial numbers, 10-minute late arrivals, and matching ID names.",
        policies: {
          currentDate: '2026-10-15',
          dateDisplay: '15/10/2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age & identity check (15/10/2026)',
          ageRuleText: 'Check [G], [12] and [16] ratings. The ID card name, dates and photo must match the customer and ticket holder.',
          lateToleranceMins: 10,
          lateRuleTitle: 'Ten-minute late rule',
          lateRuleText: 'No entry more than 10 minutes after the film starts. Check the arrival time on the booking record.',
          checkDuplicates: true,
          initialUsedSerials: ['GC-4-102', 'GC-4-109', 'GC-4-115'],
          allowPromoChanges: false,
          tvLoungeOpen: false,
          allowVipPasses: false,
          allowStaffPasses: false,
          conditionalScreenRules: []
        },
        scheduleChanges: [],
        casePool: ['duplicate', 'promo', 'late', 'false_identity', 'underage', 'screen', 'wrong_film', 'age_valid', 'incomplete'],
        midShiftNotices: [
          {
            id: 'day4_fraud_notice',
            atMins: 1092,
            text: 'Security Alert: Used serials GC-4-102, GC-4-109 and GC-4-115 are circulating outside. Also note: a quiet visitor from head office may be observing the booth today.'
          }
        ],
        scriptedEncounters: [
          {
            id: 'sofia_day4',
            characterId: 'sofia',
            caseType: 'screen',
            targetScreeningId: 'love_in_paris',
            expectedAction: 'CORRECT',
            revealsNameInOpening: true,
            introducedName: 'Sofia',
            extraQuestions: [
              ['what_did_you_see', 'What did you see outside?']
            ],
            questionEffects: {
              ask_receipts: { revealStatement: "I'll check the student society receipts before Saturday.", evidence: ['receipts_requested'], setStory: { sofia_receipts_requested: 'yes' } },
              what_did_you_see: {
                setStory: { sofia_whistleblower_clue: 'yes' },
                evidence: ['sofia_clue'],
                unlockQuestions: [['ask_receipts', 'Can you check the receipts?']]
              }
            },
            storyKey: 'sofia_day4_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 0 },
            statementByStory: [
              {
                condition: { key: 'sofia_day1_outcome', value: 'helped' },
                text: "Sofia again. I saw something strange outside."
              },
              {
                text: "I'm Sofia. One for {title}. I saw something strange outside."
              }
            ],
            qaOverrides: {
              which_film: "I'm going to see Love in Paris at 20:00 in Screen 2.",
              why_see: "I'm here to see a romantic film.",
              what_did_you_see: "Scalpers are reselling serial GC-4-109, and I saw Mrs Blackwood taking cash for unlisted VIP passes!"
            },
            storyEffects: {
              onAction: {
                CORRECT: { sofia_trust: 'ally', sofia_day4_outcome: 'helped' }
              },
              onEvidence: {
                sofia_clue: { sofia_whistleblower_clue: 'yes' }
              },
              onMistake: { sofia_trust: 'distant', sofia_day4_outcome: 'mistake' },
              dilemmaNoteByAction: {
                CORRECT: 'You corrected Sofia’s ticket for Love in Paris.'
              }
            }
          },
          {
            id: 'leo_day4',
            characterId: 'leo',
            caseType: 'false_identity',
            targetScreeningId: 'the_dark_house',
            expectedAction: 'REFUSE',
            claimedAge: 40,
            trueAge: 14,
            allowAgeCorrection: false,
            concealIdentity: true,
            requiresAgeCheck: true,
            introducedName: 'Mr Leonardo Smith',
            personTagOverride: '“Mr Leonardo Smith”',
            personOverrides: {
              oversizedSuit: true,
              sunglasses: true
            },
            ticketOverrides: {
              holderName: 'Leo'
            },
            idCard: {
              exists: true,
              presented: false,
              holderName: 'Leonardo Senior',
              dob: '20/11/1985',
              issueDate: '12/03/2022',
              expiryDate: '12/03/2027',
              docNumber: 'CID-851120',
              issuingAuthority: 'City Civil Registry',
              photoMismatch: true,
              portraitPerson: { skinColor: '#f1c27d', hairColor: '#cbd5e1', coatColor: '#334155', shirtColor: '#ffffff', isElderly: true, glasses: true, genderPresentation: 'male' },
              photoMismatchText: 'The ID card belongs to Leonardo Senior (born 20/11/1985) and does not match the teenager or the ticket holder name Leo.'
            },
            questionEffects: {
              ask_age: { evidence: ['age_claimed'] },
              ask_id: { evidence: ['id_presented'] }
            },
            storyKey: 'leo_day4_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 1 },
            statementByStory: [
              {
                condition: { key: 'leo_beard_detected', value: 'yes' },
                text: "Forget that beard. I'm Mr Leonardo Smith. One ticket, please."
              },
              {
                text: "Mr Leonardo Smith. One for {title}, please."
              }
            ],
            qaOverrides: {
              ask_age: "I am forty years old. Born in 1985!",
              ask_id: "Here is my ID card: Leonardo Senior, DOB 20/11/1985.",
              which_film: "I'm going to see The Dark House [16]."
            },
            storyEffects: {
              onEvidence: {
                age_id_contradiction: { leo_contradiction_spotted: 'yes' }
              },
              onAction: {
                REFUSE: { leo_day4_outcome: 'refused' }
              },
              onMistake: { leo_day4_outcome: 'mistake' },
              onMistakeByAction: { ADMIT: { leo_day4_outcome: 'admitted' } },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistakeByAction: { ADMIT: { leo_admitted_underage: 1 } },
              dilemmaNoteByAction: {
                REFUSE: 'You caught Leo wearing an oversized suit and using his father’s ID card (“Leonardo Senior”).'
              }
            }
          },
          {
            id: 'mystery_day4',
            characterId: 'mystery',
            caseType: 'valid',
            targetScreeningId: 'the_last_train',
            expectedAction: 'ADMIT',
            claimedAge: 44,
            trueAge: 44,
            idCard: {
              exists: true,
              presented: false,
              holderName: 'V. Vance',
              dob: '14/05/1982',
              issueDate: '01/02/2023',
              expiryDate: '01/02/2028',
              docNumber: 'CID-820514',
              issuingAuthority: 'City Civil Registry'
            },
            personOverrides: {
              name: 'V. Vance'
            },
            storyKey: 'inspector_day4_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Evening. One for {title}, please.",
            qaOverrides: {
              ask_age: "I am forty-four years old.",
              ask_id: "Certainly. Here is my ID card—born 14/05/1982."
            },
            storyEffects: {
              onAction: {
                ADMIT: { inspector_day4_outcome: 'helped' }
              },
              onMistake: { inspector_day4_outcome: 'mistake' }
            }
          },
          {
            id: 'maya_day4_helped',
            encounterGroup: 'maya_day4_group',
            characterId: 'maya',
            caseType: 'valid',
            targetScreeningId: 'happy_penguins',
            expectedAction: 'ADMIT',
            revealsNameInOpening: true,
            introducedName: 'Maya',
            storyKey: 'maya_day4_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: {
              minCaseIndex: 3,
              requireStoryValue: { key: 'maya_relationship', value: 'helped' }
            },
            statementTemplate: "Maya again. Thanks for your help on Wednesday!",
            extraQuestions: [['ask_observer', 'Who is that quiet visitor?']],
            questionEffects: {
              ask_observer: { revealStatement: "I think the visitor in the fedora is from Head Office.", evidence: ['observer_tip'], setStory: { maya_inspector_tip: 'yes' } }
            },
            qaOverrides: {
              which_film: "It's for Happy Penguins at 18:15 in Screen 2."
            },
            storyEffects: {
              onAction: {
                ADMIT: { maya_day4_outcome: 'helped' }
              }
            }
          },
          {
            id: 'maya_day4_blamed',
            encounterGroup: 'maya_day4_group',
            characterId: 'maya',
            caseType: 'incomplete',
            targetScreeningId: 'happy_penguins',
            expectedAction: 'CORRECT',
            requiredQuestion: true,
            revealsNameInOpening: true,
            introducedName: 'Maya',
            storyKey: 'maya_day4_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 3 },
            statementByStory: [
              {
                condition: { key: 'maya_relationship', value: 'blamed' },
                text: "I'm Maya. It's been a rough day. Could you check this?"
              },
              {
                text: "I'm Maya from the morning counter. Could you check this?"
              }
            ],
            qaOverrides: {
              which_film: "I need Happy Penguins in Screen 2, please.",
              alternative: "Happy Penguins is the one we need."
            },
            storyEffects: {
              onAction: {
                CORRECT: { maya_relationship: 'helped', maya_day4_outcome: 'helped' }
              }
            }
          },
          {
            id: 'dilemma_late_day4',
            characterId: 'mr_morris',
            caseType: 'dilemma_late',
            targetScreeningId: 'happy_penguins',
            advanceClockToMins: 1108,
            dilemma: true,
            requiredQuestion: true,
            discretionaryIssueCode: 'late',
            storyKey: 'morris_day4_late',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: {
              minCaseIndex: 4,
              requireLateScreeningId: 'happy_penguins'
            },
            statementTemplate: "Sorry I'm late. I stopped to help someone. Can I still go in?",
            qaOverrides: {
              which_film: "I only want to see Happy Penguins. I've been looking forward to it.",
              alternative: "No thank you, dear—only Happy Penguins tonight."
            },
            storyEffects: {
              onAction: {
                ADMIT: { morris_late_exception: 'kind', morris_relationship: 'loyal', people_champion_path: 'yes' },
                REFUSE: { morris_late_exception: 'refused' }
              },
              dilemmaNoteByAction: {
                ADMIT: 'You made a compassionate late-entry exception for Mr Morris (+Reputation, 1 Management Warning).',
                REFUSE: 'You enforced the strict 10-minute late rule on Mr Morris.'
              }
            }
          }
        ]
      },

      5: {
        dayNum: 5,
        dayName: 'FRIDAY',
        title: 'Day 5 — Special Treatment',
        briefingMemo: [
          'Friday night brings VIP guests and schedule changes—and pressure from Mrs Blackwood.',
          'Love in Paris (20:00) is CANCELLED; ask affected customers about another film and use CORRECT. An extra show of Happy Penguins runs at 19:15 in Screen 2.',
          'Official VIP passes must appear on the Authorised VIP List in the binder. Check ID dates and compare them with what the customer tells you.'
        ].join('\n'),
        languageFocus: "Handling cancelled screenings, verifying VIP pass numbers, and spotting forged IDs.",
        policies: {
          currentDate: '2026-10-16',
          dateDisplay: '16/10/2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age & forged ID check (16/10/2026)',
          ageRuleText: 'Verify that the birth date, issue date and expiry date on every ID card are valid and consistent with the customer’s age.',
          lateToleranceMins: 10,
          checkDuplicates: true,
          initialUsedSerials: ['GC-5-204', 'GC-5-211', 'GC-5-219'],
          allowPromoChanges: false,
          tvLoungeOpen: false,
          allowVipPasses: true,
          allowStaffPasses: false,
          conditionalScreenRules: []
        },
        scheduleChanges: [
          {
            type: 'cancel',
            screeningId: 'love_in_paris',
            statusLabel: 'CANCELLED'
          },
          {
            type: 'add_extra',
            sourceScreeningId: 'happy_penguins',
            newId: 'happy_penguins_late',
            screen: 2,
            time: '19:15',
            timeMins: 1155,
            statusLabel: 'EXTRA SHOW'
          }
        ],
        casePool: ['cancelled', 'duplicate', 'promo', 'fake_id', 'underage', 'screen', 'wrong_film', 'age_valid', 'late'],
        midShiftNotices: [
          {
            id: 'day5_vip_notice',
            atMins: 1090,
            text: 'Audit Notice: Only VIP passes listed in the binder (VIP-770-MORRIS, VIP-880-PREMIERE, VIP-900-INSPECTOR) are authorised by Head Office.'
          }
        ],
        scriptedEncounters: [
          {
            id: 'blackwood_day5',
            characterId: 'mr_blackwood',
            caseType: 'manager_pressure',
            targetScreeningId: 'the_dark_house',
            vipSerial: 'VIP-000-CASH',
            managerDirective: true,
            managerBonusCash: 5,
            managerComplyRepDelta: -3,
            managerRefuseRepDelta: 4,
            expectedAction: 'REFUSE',
            revealsNameInOpening: true,
            introducedName: 'Mrs Blackwood',
            extraQuestions: [
              ['challenge_vip', "Why isn't this VIP pass on the authorised list?"]
            ],
            questionEffects: {
              challenge_vip: {
                setStory: { blackwood_questioned: 'yes', whistleblower_identified: 'yes' },
                evidence: ['vip_challenged']
              }
            },
            storyKey: 'blackwood_day5_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 0 },
            statementTemplate: "Blackwood here. This guest is with me. Admit them.",
            qaOverrides: {
              which_film: "It's for The Dark House at 21:00.",
              are_you_sure: "Obey your manager, not the Head Office binder!",
              challenge_vip: "Because they paid me cash in my office! Never mind the Head Office list—stamp ADMIT!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { blackwood_day5_outcome: 'complied' },
                REFUSE: { blackwood_day5_outcome: 'refused' }
              },
              dilemmaNoteByAction: {
                ADMIT: 'You obeyed Mrs Blackwood and admitted unlisted pass VIP-000-CASH.',
                REFUSE: 'You refused Mrs Blackwood’s unlisted VIP-000-CASH pass and upheld the official VIP list.'
              }
            },
            customFeedback: {
              ADMIT: 'You obeyed Mrs Blackwood and waved through unlisted pass VIP-000-CASH (+€15). The Corporate Inspector will not like this.',
              REFUSE: 'You stood up to Mrs Blackwood and refused unlisted pass VIP-000-CASH in accordance with Head Office rules!'
            }
          },
          {
            id: 'leo_day5',
            characterId: 'leo',
            caseType: 'fake_id',
            targetScreeningId: 'the_dark_house',
            expectedAction: 'REFUSE',
            claimedAge: 17,
            trueAge: 14,
            allowAgeCorrection: false,
            concealIdentity: true,
            requiresAgeCheck: true,
            personTagOverride: '“Seventeen-Year-Old Leo”',
            personOverrides: {
              editedMoustache: true
            },
            idCard: {
              exists: true,
              presented: false,
              holderName: 'Leo',
              dob: '10/09/2012',
              issueDate: '20/10/2026',
              expiryDate: '10/10/2025',
              docNumber: 'SCH-2012-99',
              issuingAuthority: 'School Print Club',
              photoAltered: true,
              photoMismatchText: 'Tape covers the photograph border and the printed stamp is interrupted.'
            },
            questionEffects: {
              ask_age: { evidence: ['age_claimed'] },
              ask_id: { evidence: ['id_presented'] }
            },
            storyKey: 'leo_day5_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "Evening. One for {title}, please.",
            qaOverrides: {
              ask_age: "I'm seventeen!",
              ask_id: "Here is my ID card.",
              which_film: "I'm going to see The Dark House [16]."
            },
            storyEffects: {
              onEvidence: {
                age_id_contradiction: { leo_contradiction_spotted: 'yes' }
              },
              onAction: {
                REFUSE: { leo_day5_outcome: 'refused' }
              },
              onMistake: { leo_day5_outcome: 'mistake' },
              onMistakeByAction: { ADMIT: { leo_day5_outcome: 'admitted' } },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistakeByAction: { ADMIT: { leo_admitted_underage: 1 } },
              dilemmaNoteByAction: {
                REFUSE: 'You refused the altered ID with inconsistent validity dates.'
              }
            }
          },
          {
            id: 'mystery_day5',
            characterId: 'mystery',
            caseType: 'vip',
            targetScreeningId: 'planet_x',
            vipSerial: 'VIP-900-INSPECTOR',
            expectedAction: 'ADMIT',
            claimedAge: 44,
            trueAge: 44,
            idCard: {
              exists: true,
              presented: false,
              holderName: 'V. Vance',
              dob: '14/05/1982',
              issueDate: '01/02/2023',
              expiryDate: '01/02/2028',
              docNumber: 'CID-820514',
              issuingAuthority: 'City Civil Registry'
            },
            personOverrides: {
              name: 'V. Vance'
            },
            storyKey: 'inspector_day5_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Evening. Here's my pass for {title}.",
            qaOverrides: {
              ask_id: "Here is my ID card (DOB 14/05/1982). My VIP pass is VIP-900-INSPECTOR."
            },
            storyEffects: {
              onAction: {
                ADMIT: { inspector_day5_outcome: 'helped' }
              },
              onMistake: { inspector_day5_outcome: 'mistake' }
            }
          }
        ]
      },

      6: {
        dayNum: 6,
        dayName: 'SATURDAY',
        title: 'Day 6 — The Big Premiere',
        briefingMemo: [
          'It is Saturday night—our biggest premiere shift of the week! Group bookings, VIPs, age checks and late rules all combine tonight.',
          'Screen 1 is nearly sold out for Planet X (only 2 seats left unless extra balcony seating was unlocked by staff).',
          'Watch out for fake staff passes: only authorised staff passes are valid, and cinema staff may not enter [16] screenings underage!'
        ].join('\n'),
        languageFocus: "Group bookings ('There are three of us'), seat capacity, and combined rule verification.",
        policies: {
          currentDate: '2026-10-17',
          dateDisplay: '17/10/2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age, ID & Staff Pass check (17/10/2026)',
          ageRuleText: 'All [12] and [16] age rules, ID checks, and authorised staff pass rules apply on Premiere Night.',
          lateToleranceMins: 10,
          checkDuplicates: true,
          initialUsedSerials: ['GC-6-301', 'GC-6-308', 'GC-6-315'],
          allowPromoChanges: false,
          tvLoungeOpen: false,
          allowVipPasses: true,
          allowStaffPasses: true,
          conditionalScreenRules: []
        },
        capacityOverrides: {
          planet_x: 2
        },
        storyScheduleBoosts: [
          {
            screeningId: 'planet_x',
            capacityDelta: 4,
            requireStoryKey: 'maya_relationship',
            requireStoryValue: 'helped',
            statusLabel: 'EXTRA ROW OPEN'
          }
        ],
        scheduleChanges: [],
        casePool: ['group', 'duplicate', 'promo', 'fake_id', 'false_identity', 'underage', 'combined', 'screen', 'wrong_film', 'age_valid'],
        midShiftNotices: [
          {
            id: 'day6_premiere_notice',
            atMins: 1090,
            text: 'Premiere Night Notice: Check group sizes against booked seats carefully! Tomorrow (Sunday) is the Final Corporate Inspection.'
          }
        ],
        scriptedEncounters: [
          {
            id: 'morris_day6_loyal',
            encounterGroup: 'morris_day6_group',
            characterId: 'mr_morris',
            caseType: 'valid',
            targetScreeningId: 'wild_world',
            groupSize: 3,
            ticketSeats: 3,
            expectedAction: 'ADMIT',
            revealsNameInOpening: true,
            introducedName: 'Mr Morris',
            storyKey: 'morris_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: {
              minCaseIndex: 0,
              requireStoryValue: { key: 'morris_relationship', value: 'loyal' }
            },
            statementTemplate: "Mr Morris again. Three for {title}, please.",
            qaOverrides: {
              how_many: "There are three of us—me and my two grandchildren.",
              which_film: "We're going to see Wild World at 19:30 in Screen 2."
            },
            storyEffects: {
              onAction: {
                ADMIT: { morris_day6_outcome: 'helped', morris_commendation: 'yes' }
              },
              dilemmaNoteByAction: {
                ADMIT: 'Mr Morris and his grandchildren had a wonderful evening. He wrote a glowing letter to Head Office for you.'
              }
            }
          },
          {
            id: 'morris_day6_standard',
            encounterGroup: 'morris_day6_group',
            characterId: 'mr_morris',
            caseType: 'screen',
            targetScreeningId: 'wild_world',
            groupSize: 3,
            ticketSeats: 3,
            requiredQuestion: true,
            expectedAction: 'CORRECT',
            storyKey: 'morris_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 0 },
            statementTemplate: "Three tickets, please. I'm here with my grandchildren.",
            qaOverrides: {
              which_film: "We're going to see Wild World at 19:30 in Screen 2.",
              how_many: "There are three of us."
            },
            storyEffects: {
              onAction: {
                CORRECT: { morris_day6_outcome: 'helped', morris_relationship: 'loyal' }
              }
            }
          },
          {
            id: 'maya_day6_helped',
            encounterGroup: 'maya_day6_group',
            characterId: 'maya',
            caseType: 'overbooked_group',
            targetScreeningId: 'planet_x',
            groupSize: 3,
            ticketSeats: 1,
            expectedAction: 'CORRECT',
            revealsNameInOpening: true,
            introducedName: 'Maya',
            storyKey: 'maya_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: {
              minCaseIndex: 1,
              requireStoryValue: { key: 'maya_relationship', value: 'helped' }
            },
            statementTemplate: "Maya again. Three of us for {title}, please.",
            extraQuestions: [['ask_balcony', 'Is the balcony open?']],
            questionEffects: {
              ask_balcony: { revealStatement: "Yes. I opened the extra row for tonight. Thanks for helping me on Wednesday.", evidence: ['balcony_open'] }
            },
            qaOverrides: {
              how_many: "There are three people in this premiere group.",
              which_film: "We're going to see Planet X at 19:00!"
            },
            storyEffects: {
              onAction: {
                CORRECT: { maya_day6_outcome: 'helped', maya_balcony_saved: 'yes' }
              },
              dilemmaNoteByAction: {
                CORRECT: 'Because you helped Maya earlier, she opened the extra balcony row so the 3-person Planet X premiere group could be seated!'
              }
            }
          },
          {
            id: 'maya_day6_unhelped',
            encounterGroup: 'maya_day6_group',
            characterId: 'maya',
            caseType: 'overbooked_group',
            targetScreeningId: 'planet_x',
            groupSize: 3,
            ticketSeats: 1,
            expectedAction: 'REFUSE',
            revealsNameInOpening: true,
            introducedName: 'Maya',
            storyKey: 'maya_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "I'm Maya. Three for {title}, please.",
            qaOverrides: {
              how_many: "There are three of us, and we only want Planet X.",
              alternative: "Only Planet X tonight—we came for the sci-fi premiere."
            },
            storyEffects: {
              onAction: {
                REFUSE: { maya_day6_outcome: 'refused_group' }
              },
              dilemmaNoteByAction: {
                REFUSE: 'With the balcony row still locked, Screen 1 lacked seats for the 3-person Planet X group.'
              }
            }
          },
          {
            id: 'leo_day6',
            characterId: 'leo',
            caseType: 'staff_impostor',
            targetScreeningId: 'the_dark_house',
            expectedAction: 'REFUSE',
            claimedAge: 19,
            trueAge: 14,
            allowAgeCorrection: false,
            concealIdentity: true,
            requiresAgeCheck: true,
            personTagOverride: '“Assistant Projectionist”',
            personOverrides: {
              staffHat: true,
              staffBadge: true,
              obviousDisguise: true,
              disguiseIssueText: 'Customer is wearing a homemade cardboard staff badge and presenting an unlisted staff pass.'
            },
            ticketOverrides: {
              ticketType: 'STAFF PASS',
              serial: 'STAFF-99-LEO'
            },
            idCard: {
              exists: false,
              presented: false,
              reason: 'Claims cinema employees do not need ID cards.'
            },
            questionEffects: {
              ask_age: { evidence: ['age_claimed'] },
              ask_id: { evidence: ['id_missing'] }
            },
            storyKey: 'leo_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "New projection assistant. Here's my staff pass.",
            qaOverrides: {
              ask_age: "I'm nineteen!",
              ask_id: "I don't carry an ID card—just my pass STAFF-99-LEO!",
              which_film: "I'm inspecting The Dark House [16] in Screen 3."
            },
            storyEffects: {
              onEvidence: {
                age_id_contradiction: { leo_contradiction_spotted: 'yes' }
              },
              onAction: {
                REFUSE: { leo_day6_outcome: 'refused' }
              },
              onMistake: { leo_day6_outcome: 'mistake' },
              onMistakeByAction: { ADMIT: { leo_day6_outcome: 'admitted' } },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistakeByAction: { ADMIT: { leo_admitted_underage: 1 } },
              dilemmaNoteByAction: {
                REFUSE: 'You thwarted Leo’s attempt to sneak into The Dark House [16] with unlisted pass STAFF-99-LEO.'
              }
            }
          },
          {
            id: 'sofia_day6_ally',
            encounterGroup: 'sofia_day6_group',
            characterId: 'sofia',
            caseType: 'valid',
            targetScreeningId: 'the_last_train',
            expectedAction: 'ADMIT',
            revealsNameInOpening: true,
            introducedName: 'Sofia',
            extraQuestions: [
              ['what_did_you_see', 'What did you find in the receipts?']
            ],
            questionEffects: {
              what_did_you_see: {
                setStory: { sofia_evidence: 'yes', whistleblower_identified: 'yes' },
                evidence: ['sofia_vip_evidence']
              }
            },
            storyKey: 'sofia_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: {
              minCaseIndex: 3,
              requireStoryValue: { key: 'sofia_trust', value: 'ally' }
            },
            statementTemplate: "Sofia here. I've found some unusual receipts.",
            qaOverrides: {
              which_film: "I'm going to see The Last Train at 20:30.",
              why_see: "I'm here to watch the thriller.",
              what_did_you_see: "Mrs Blackwood has been pocketing cash for unlisted 'VIP-000' passes! Refuse them and tell the Inspector tomorrow."
            },
            storyEffects: {
              onAction: {
                ADMIT: { sofia_day6_outcome: 'helped' }
              },
              onEvidence: {
                sofia_vip_evidence: { sofia_evidence: 'yes', whistleblower_identified: 'yes' }
              },
              noteByEvidence: { sofia_vip_evidence: 'Sofia shared her receipt evidence about the unlisted VIP passes.' },
              dilemmaNoteByAction: {
                ADMIT: 'You admitted Sofia with her valid ticket.'
              }
            }
          },
          {
            id: 'sofia_day6_standard',
            encounterGroup: 'sofia_day6_group',
            characterId: 'sofia',
            caseType: 'wrong_film',
            targetScreeningId: 'the_last_train',
            wrongFilmTicket: true,
            requiredQuestion: true,
            intentGenres: ['thriller'],
            expectedAction: 'CORRECT',
            revealsNameInOpening: true,
            introducedName: 'Sofia',
            extraQuestions: [
              ['what_did_you_see', 'What did you find about the VIP passes?']
            ],
            questionEffects: {
              what_did_you_see: {
                setStory: { sofia_evidence: 'yes', whistleblower_identified: 'yes' },
                evidence: ['sofia_vip_evidence']
              }
            },
            storyKey: 'sofia_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 3 },
            statementTemplate: "I'm Sofia. I wanted a thriller. Also, I found something odd.",
            qaOverrides: {
              which_film: "I want a thriller—The Last Train at 20:30.",
              alternative: "The Last Train in Screen 3, please.",
              what_did_you_see: "Mrs Blackwood has been selling unlisted 'VIP-000' passes for cash!"
            },
            storyEffects: {
              onAction: {
                CORRECT: { sofia_day6_outcome: 'helped' }
              },
              onEvidence: {
                sofia_vip_evidence: { sofia_evidence: 'yes', whistleblower_identified: 'yes' }
              }
            }
          },
          {
            id: 'blackwood_day6',
            characterId: 'mr_blackwood',
            caseType: 'manager_pressure',
            targetScreeningId: 'the_last_train',
            vipSerial: 'VIP-000-PREMIERE',
            managerDirective: true,
            managerBonusCash: 5,
            managerComplyRepDelta: -3,
            managerRefuseRepDelta: 4,
            expectedAction: 'REFUSE',
            revealsNameInOpening: true,
            introducedName: 'Mrs Blackwood',
            extraQuestions: [
              ['challenge_vip', "Why isn't this VIP pass on the authorised list?"]
            ],
            questionEffects: {
              challenge_vip: {
                setStory: { blackwood_questioned: 'yes', whistleblower_identified: 'yes' },
                evidence: ['vip_challenged']
              }
            },
            storyKey: 'blackwood_day6_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 4 },
            statementTemplate: "Blackwood. Another guest of mine. Let them through.",
            qaOverrides: {
              which_film: "The Last Train at 20:30.",
              are_you_sure: "I am the manager of this cinema—do as I say!",
              challenge_vip: "Because it's my private premiere guest! Don't lecture me about the authorised list!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { blackwood_day6_outcome: 'complied' },
                REFUSE: { blackwood_day6_outcome: 'refused' }
              },
              dilemmaNoteByAction: {
                ADMIT: 'You obeyed Mrs Blackwood and admitted unlisted premiere pass VIP-000-PREMIERE.',
                REFUSE: 'You refused Mrs Blackwood’s unlisted VIP-000-PREMIERE pass.'
              }
            }
          }
        ]
      },

      7: {
        dayNum: 7,
        dayName: 'SUNDAY',
        title: 'Day 7 — The Final Inspection',
        briefingMemo: [
          'Today is Sunday, 18/10/2026—your seventh day and the Final Corporate Inspection.',
          'All cinema rules are active today: age classifications ([G], [12], [16]) and ID checks, Planet X moved to Screen 1, Love in Paris cancelled, Happy Penguins 19:15 extra show, 10-minute late limit, used serials, and official VIP/Staff lists.',
          'Every choice you have made this week—with Leo, Mr Morris, Sofia, Maya, Mrs Blackwood, and the Inspector—comes to a head tonight!'
        ].join('\n'),
        languageFocus: "Complete cinema inspection mastery—evaluating every rule, character, and clue.",
        policies: {
          currentDate: '2026-10-18',
          dateDisplay: '18/10/2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Final Inspection: Age & ID (18/10/2026)',
          ageRuleText: 'Enforce [G], [12] and [16] ratings strictly. Admit honest customers whose age and ID satisfy the film’s rating.',
          lateToleranceMins: 10,
          checkDuplicates: true,
          initialUsedSerials: ['GC-7-104', 'GC-7-112', 'GC-7-118'],
          allowPromoChanges: false,
          tvLoungeOpen: false,
          allowVipPasses: true,
          allowStaffPasses: true,
          conditionalScreenRules: []
        },
        scheduleChanges: [
          {
            type: 'relocate',
            screeningId: 'planet_x',
            toScreen: 1,
            statusLabel: 'MOVED TO SCR 1'
          },
          {
            type: 'cancel',
            screeningId: 'love_in_paris',
            statusLabel: 'CANCELLED'
          },
          {
            type: 'add_extra',
            sourceScreeningId: 'happy_penguins',
            newId: 'happy_penguins_late',
            screen: 2,
            time: '19:15',
            timeMins: 1155,
            statusLabel: 'EXTRA SHOW'
          }
        ],
        casePool: ['move', 'cancelled', 'duplicate', 'promo', 'fake_id', 'false_identity', 'underage', 'group', 'combined', 'screen', 'wrong_film', 'age_valid'],
        midShiftNotices: [
          {
            id: 'day7_audit_notice',
            atMins: 1090,
            text: 'Final Audit in Progress: The Corporate Inspector is completing her seven-day evaluation at the end of tonight’s shift.'
          }
        ],
        scriptedEncounters: [
          {
            id: 'leo_day7',
            characterId: 'leo',
            caseType: 'valid',
            targetScreeningId: 'laughing_bananas',
            expectedAction: 'ADMIT',
            claimedAge: 14,
            trueAge: 14,
            revealsNameInOpening: true,
            introducedName: 'Leo',
            personTagOverride: 'Honest Filmgoer',
            personOverrides: {
              fakeBeard: false,
              oversizedSuit: false,
              sunglasses: false,
              editedMoustache: false,
              staffHat: false,
              staffBadge: false,
              obviousDisguise: false,
              portraitVariant: 'innocent'
            },
            idCard: {
              exists: true,
              presented: false,
              holderName: 'Leo',
              dob: '10/09/2012',
              issueDate: '01/09/2025',
              expiryDate: '01/09/2028',
              docNumber: 'STU-120910',
              issuingAuthority: 'Grandview High School'
            },
            storyKey: 'leo_day7_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 0 },
            statementByStory: [
              {
                condition: { key: 'leo_day2_outcome', value: 'refused' },
                text: "I'm Leo. No fake beard today. One for {title}, please."
              },
              {
                text: "I'm Leo. One for {title}, please."
              }
            ],
            qaOverrides: {
              ask_age: "I'm fourteen years old—born 10/09/2012.",
              ask_id: "Here is my real student ID card: Leo, DOB 10/09/2012.",
              which_film: "I'm going to see Laughing Bananas at 18:00 in Screen 1.",
              why_see: "I'm here to laugh! Disguises are exhausting."
            },
            storyEffects: {
              onAction: {
                ADMIT: { leo_day7_outcome: 'helped' }
              },
              onMistake: { leo_day7_outcome: 'refused_honest' },
              dilemmaNoteByAction: {
                ADMIT: 'Leo finally came honestly with a valid ticket for G-rated Laughing Bananas, and you admitted him with a smile.'
              },
              dilemmaNoteOnMistake: 'You refused Leo even when he had a completely valid ticket for a G-rated comedy!'
            },
            customFeedback: {
              ADMIT: 'Leo headed happily into Screen 1 with his valid comedy ticket.'
            }
          },
          {
            id: 'morris_day7',
            characterId: 'mr_morris',
            caseType: 'valid',
            targetScreeningId: 'happy_penguins',
            expectedAction: 'ADMIT',
            revealsNameInOpening: true,
            introducedName: 'Mr Morris',
            storyKey: 'morris_day7_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 1 },
            statementByStory: [
              {
                condition: { key: 'morris_relationship', value: 'loyal' },
                text: "Mr Morris again. Thank you for your help. One ticket, please."
              },
              {
                text: "I'm Mr Morris. One for {title}, please."
              }
            ],
            qaOverrides: {
              which_film: "I'm going to see Happy Penguins at 18:15 in Screen 2.",
              why_see: "I'm here to relax and support my favourite cinema."
            },
            storyEffects: {
              onAction: {
                ADMIT: { morris_day7_outcome: 'helped' }
              },
              dilemmaNoteByAction: {
                ADMIT: 'You admitted Mr Morris with his valid ticket.'
              }
            }
          },
          {
            id: 'blackwood_day7',
            characterId: 'mr_blackwood',
            caseType: 'manager_pressure',
            targetScreeningId: 'the_dark_house',
            vipSerial: 'VIP-000-AUDIT',
            managerDirective: true,
            managerBonusCash: 5,
            managerComplyRepDelta: -4,
            managerRefuseRepDelta: 5,
            expectedAction: 'REFUSE',
            revealsNameInOpening: true,
            introducedName: 'Mrs Blackwood',
            extraQuestions: [
              ['challenge_vip', "Why isn't this VIP pass on the authorised list?"]
            ],
            questionEffects: {
              challenge_vip: {
                setStory: { blackwood_questioned: 'yes', whistleblower_identified: 'yes' },
                evidence: ['vip_challenged']
              }
            },
            storyKey: 'blackwood_day7_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Blackwood. One last guest. Quickly, let them in.",
            qaOverrides: {
              which_film: "The Dark House at 21:00.",
              are_you_sure: "If you refuse VIP-000-AUDIT, the Inspector will uncover my side business!",
              challenge_vip: "Keep your voice down! The Corporate Inspector is right behind me—stamp ADMIT so my ledger balances!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { blackwood_day7_outcome: 'complied' },
                REFUSE: { blackwood_day7_outcome: 'refused' }
              },
              dilemmaNoteByAction: {
                ADMIT: 'You stamped Mrs Blackwood’s final unlisted pass (VIP-000-AUDIT) to cover her tracks.',
                REFUSE: 'You refused Mrs Blackwood’s VIP-000-AUDIT cover-up pass right in front of the audit!'
              }
            }
          },
          {
            id: 'mystery_day7',
            characterId: 'mystery',
            caseType: 'vip',
            targetScreeningId: 'the_dark_house',
            vipSerial: 'VIP-900-INSPECTOR',
            expectedAction: 'ADMIT',
            claimedAge: 44,
            trueAge: 44,
            revealsNameInOpening: true,
            introducedName: 'Corporate Inspector',
            identityTitle: true,
            extraQuestions: [{ key: 'report_vip', label: 'Can I report the unlisted VIP passes?', condition: { anyOf: [{ key: 'sofia_evidence', value: 'yes' }, { key: 'blackwood_questioned', value: 'yes' }] } }],
            questionEffects: {
              report_vip: {
                condition: { anyOf: [{ key: 'sofia_evidence', value: 'yes' }, { key: 'blackwood_questioned', value: 'yes' }] },
                revealStatement: "Thank you. I'll record your evidence and check Mrs Blackwood's ledger.",
                evidence: ['vip_reported'], setStory: { vip_reported: 'yes' }
              }
            },
            personTagOverride: 'Corporate Inspector',
            idCard: {
              exists: true,
              presented: false,
              holderName: 'V. Vance',
              dob: '14/05/1982',
              issueDate: '01/02/2023',
              expiryDate: '01/02/2028',
              docNumber: 'AUD-9001',
              issuingAuthority: 'Head Office Audit Board'
            },
            personOverrides: {
              name: 'V. Vance'
            },
            storyKey: 'inspector_day7_outcome',
            oncePerShift: true,
            guaranteed: true,
            preventQueueWalkout: true,
            trigger: { minCaseIndex: 3 },
            statementByStory: [
              {
                condition: { key: 'sofia_evidence', value: 'yes' },
                text: "Corporate Inspector. I hear you have something to report."
              },
              {
                condition: { key: 'morris_commendation', value: 'yes' },
                text: "Corporate Inspector. Mr Morris spoke well of you. Here's my pass."
              },
              {
                text: "Corporate Inspector. Here's my pass for tonight."
              }
            ],
            qaOverrides: {
              ask_age: "I am forty-four years old (born 14/05/1982).",
              ask_id: "Here is my official Inspector ID (DOB 14/05/1982) and pass VIP-900-INSPECTOR.",
              which_film: "I am inspecting The Dark House [16] at 21:00 in Screen 3."
            },
            storyEffects: {
              onAction: {
                ADMIT: { inspector_day7_outcome: 'helped' }
              },
              onMistake: { inspector_day7_outcome: 'mistake' },
              dilemmaNoteByAction: {
                ADMIT: 'You completed the Corporate Inspector’s final verification check.'
              }
            }
          }
        ]
      }
    },

    endlessDay: {
      dayNum: 8,
      dayName: 'ENDLESS SHIFT',
      title: 'Endless Mode — Box Office Master',
      briefingMemo: [
        'Welcome to Endless Mode! You have completed your first seven-day week at The Grand Cinema.',
        'All cinema rules are active: age classifications ([G], [12], [16]) and ID checks, Planet X moved to Screen 1, Love in Paris cancelled, Happy Penguins 19:15 extra show, 10-minute late limit, used serials, and VIP/Staff lists.',
        'See how much cash and reputation you can build!'
      ].join('\n'),
      languageFocus: "Full mastery of plans ('be going to'), purpose ('to + verb'), age checks, and ticket corrections.",
      policies: {
        currentDate: '2026-10-19',
        dateDisplay: '19/10/2026',
        allowCorrections: true,
        checkAgeRestrictions: true,
        lateToleranceMins: 10,
        checkDuplicates: true,
        initialUsedSerials: ['GC-8-104', 'GC-8-112', 'GC-8-118'],
        allowPromoChanges: false,
        tvLoungeOpen: false,
        allowVipPasses: true,
        allowStaffPasses: true,
        conditionalScreenRules: []
      },
      scheduleChanges: [
        {
          type: 'relocate',
          screeningId: 'planet_x',
          toScreen: 1,
          statusLabel: 'MOVED TO SCR 1'
        },
        {
          type: 'cancel',
          screeningId: 'love_in_paris',
          statusLabel: 'CANCELLED'
        },
        {
          type: 'add_extra',
          sourceScreeningId: 'happy_penguins',
          newId: 'happy_penguins_late',
          screen: 2,
          time: '19:15',
          timeMins: 1155,
          statusLabel: 'EXTRA SHOW'
        }
      ],
      casePool: [
        'wrong_film', 'screen', 'time', 'date', 'missing', 'hidden_ticket',
        'incomplete', 'late', 'move', 'duplicate', 'promo', 'group',
        'cancelled', 'combined', 'underage', 'missing_id', 'refused_id', 'fake_id',
        'expired_id', 'false_identity', 'disguise', 'staff_impostor', 'age_valid'
      ],
      midShiftNotices: [],
      scriptedEncounters: []
    },

    endings: [
      {
        id: 'youre_fired',
        title: "You're Fired!",
        badge: 'ENDING 5 OF 5 · DISMISSED',
        summary: 'Your warnings, inspection record or loss of public trust fell below the cinema’s minimum standard. Head Office ended your probation.',
        managerQuote: '"Pack up your stamps. Head Office has ended your probation."',
        inspectorQuote: '"Your record did not meet the standard required to continue in this role."',
        conditions: {
          anyOf: [
            { requireDismissed: true },
            { maxReputation: 44 },
            { storyMin: { total_mistakes: 6 } },
            { storyMin: { inspection_violations: 3 }, storyMax: { manager_compliance: 1 } }
          ]
        }
      },
      {
        id: 'the_whistleblower',
        title: 'The Whistleblower',
        badge: 'ENDING 4 OF 5 · CORRUPTION EXPOSED',
        summary: 'You refused Mrs Blackwood’s unlisted VIP passes, investigated the scheme and reported your evidence directly to the Corporate Inspector. Head Office removed her from her post and appointed you Senior Box Office Supervisor.',
        managerQuote: '"You—you reported my VIP-000 passes to Head Office?! Wait until my lawyers hear about this!"',
        inspectorQuote: '"Your integrity in refusing unauthorised manager passes and documenting the fraud saved The Grand Cinema from a major scandal. Exemplary work."',
        conditions: {
          forbidDismissed: true,
          storyMin: { manager_conflict: 2 },
          storyMax: { manager_compliance: 0 },
          storyEquals: { vip_reported: 'yes', inspector_day7_outcome: 'helped' },
          anyOf: [
            { storyEquals: { blackwood_questioned: 'yes' } },
            { storyEquals: { sofia_evidence: 'yes' } }
          ]
        }
      },
      {
        id: 'management_material',
        title: 'Management Material',
        badge: 'ENDING 3 OF 5 · THE MANAGER’S PROTEGE',
        summary: 'Repeatedly, when Mrs Blackwood demanded "special treatment" for her off-the-books VIP-000 guests, you stamped ADMIT without flinching. While the Corporate Inspector raised an eyebrow at the ledger, Mrs Blackwood took full credit for the week’s profits and promoted you to her right-hand Assistant Manager.',
        managerQuote: '"Splendid loyalty! You understand how business really works at The Grand Cinema. Welcome to management!"',
        inspectorQuote: '"Your booth stayed profitable, though several unlisted VIP admissions remain under Head Office review."',
        conditions: {
          forbidDismissed: true,
          storyMin: { manager_compliance: 2 }
        }
      },
      {
        id: 'peoples_champion',
        title: "The People's Champion",
        badge: 'ENDING 2 OF 5 · BELOVED BY REGULARS',
        summary: 'You helped Mr Morris and his grandchildren, supported Maya and seated her premiere group, and welcomed Leo with his honest Sunday ticket. The regulars celebrated your patient, helpful service.',
        managerQuote: '"The regulars keep asking for you. I suppose good service counts for something!"',
        inspectorQuote: '"Customer satisfaction scores are the highest in the district. Guests specifically commended your empathy and fairness."',
        conditions: {
          forbidDismissed: true,
          storyEquals: {
            morris_day3_outcome: 'helped',
            morris_day6_outcome: 'helped',
            maya_day3_outcome: 'helped',
            maya_day6_outcome: 'helped',
            maya_relationship: 'helped',
            leo_day7_outcome: 'helped'
          },
          anyOf: [
            { storyMin: { total_exceptions: 1 } },
            { storyEquals: { people_champion_path: 'yes' } }
          ]
        }
      },
      {
        id: 'employee_of_the_week',
        title: 'Employee of the Week',
        badge: 'ENDING 1 OF 5 · GOLD STANDARD',
        summary: 'Across seven demanding shifts, you balanced strict age-restriction enforcement, accurate ticket corrections, and fair customer service without succumbing to corruption or carelessness. Your framed portrait now hangs in the foyer of The Grand Cinema!',
        managerQuote: '"Accurate decisions and clean books. Even I have nothing to complain about!"',
        inspectorQuote: '"Precision, fairness, and complete mastery of every regulation from Monday to Sunday. You are officially named Employee of the Week."',
        conditions: {
          forbidDismissed: true,
          minReputation: 75,
          storyMax: {
            manager_compliance: 0,
            total_mistakes: 0,
            total_exceptions: 0,
            leo_admitted_underage: 0,
            inspection_violations: 0
          }
        }
      },
      {
        id: 'probation_passed',
        title: 'Probation Completed',
        badge: 'CAMPAIGN COMPLETE · STANDARD PASS',
        summary: 'You survived all seven shifts behind the box-office window. While your week had a few rough edges and missed details along the way, you kept the cinema running and passed your first-week probation.',
        managerQuote: '"You made it through Sunday without getting us shut down. Report back on Monday—and try to be sharper next week."',
        inspectorQuote: '"Box-office operations met minimum corporate standards, though several procedures require closer attention."',
        conditions: {
          forbidDismissed: true
        }
      }
    ],

    endingCallbacks: [
      {
        characterName: 'Mr Morris',
        role: 'Regular Visitor',
        conditions: {
          storyEquals: {
            morris_day3_outcome: 'helped',
            morris_day6_outcome: 'helped'
          }
        },
        text: 'Appreciated your Wednesday ticket correction and Saturday welcome for his grandchildren.'
      },
      {
        characterName: 'Mr Morris',
        role: 'Regular Visitor',
        conditions: {
          storyEquals: {
            morris_day3_outcome: 'helped',
            morris_day6_outcome: 'mistake'
          }
        },
        text: 'Thanked you warmly for helping him when the Screen 3 projector broke down.'
      },
      {
        characterName: 'Mr Morris',
        role: 'Regular Visitor',
        conditions: { storyEquals: { morris_relationship: ['upset', 'cold'] } },
        text: 'Was disappointed by an earlier mistake with his ticket.'
      },
      {
        characterName: 'Leo',
        role: 'Former Master of Disguise',
        conditions: {
          storyEquals: { leo_day7_outcome: 'helped' },
          storyMin: { leo_caught_count: 1 }
        },
        text: 'Returned without a disguise on Sunday after an earlier refusal, and you admitted his valid comedy ticket.'
      },
      {
        characterName: 'Leo',
        role: 'Horror Fan',
        conditions: {
          storyMin: { leo_admitted_underage: 1 }
        },
        text: 'Bragged to his school friends that he managed to sneak past the box office into The Dark House [16] underage.'
      },
      {
        characterName: 'Leo',
        role: 'Horror Fan',
        conditions: { storyEquals: { leo_day7_outcome: 'refused_honest' } },
        text: 'Complained that even when he finally told the truth and bought a [G] comedy ticket on Sunday, you still refused him!'
      },
      {
        characterName: 'Maya',
        role: 'Junior Employee',
        conditions: {
          storyEquals: {
            maya_day3_outcome: 'helped',
            maya_day6_outcome: 'helped'
          }
        },
        text: 'Kept her job thanks to your Wednesday ticket correction and unlocked the Screen 1 balcony row for Saturday’s premiere.'
      },
      {
        characterName: 'Maya',
        role: 'Junior Employee',
        conditions: { storyEquals: { maya_relationship: 'blamed' } },
        text: 'Was placed on probation by Mrs Blackwood after Wednesday’s misprinted ticket was not corrected.'
      },
      {
        characterName: 'Sofia',
        role: 'Film Student',
        conditions: { storyEquals: { sofia_evidence: 'yes' } },
        text: 'Shared her findings about unlisted VIP-000 passes when you asked about the receipts.'
      }
    ],

    languagePack: {
      version: 2,
      unitTitle: "Unit 9: Entertainment — Future Plans ('be going to') & Infinitive of Purpose",
      filmGenres: ['comedy', 'horror', 'scifi', 'documentary', 'romance', 'thriller'],
      tvProgrammes: [],
      adjectives: ['funny', 'scary', 'exciting', 'romantic', 'interesting'],
      films: [
        {
          id: 'laughing_bananas',
          title: 'Laughing Bananas',
          genre: 'comedy',
          genreLabel: 'Comedy',
          ageRating: 'G',
          minAge: 0,
          screen: 1,
          time: '18:00',
          timeMins: 1080,
          capacity: 5,
          adjective: 'funny',
          descriptions: [
            "I'm going to see a funny comedy.",
            "We're going to watch Laughing Bananas to laugh.",
            "I'm going to see the comedy in Screen 1."
          ],
          purposePhrases: ['to laugh', 'to have fun', 'to feel happy']
        },
        {
          id: 'happy_penguins',
          title: 'Happy Penguins',
          genre: 'documentary',
          genreLabel: 'Documentary',
          ageRating: 'G',
          minAge: 0,
          screen: 2,
          time: '18:15',
          timeMins: 1095,
          capacity: 5,
          adjective: 'interesting',
          descriptions: [
            "I'm going to watch a documentary about animals.",
            "I'm going to see Happy Penguins to learn about penguins.",
            "We're going to watch the nature documentary."
          ],
          purposePhrases: ['to learn about animals', 'to see penguins', 'to relax']
        },
        {
          id: 'planet_x',
          title: 'Planet X',
          genre: 'scifi',
          genreLabel: 'Sci-fi',
          ageRating: '12',
          minAge: 12,
          screen: 3,
          time: '19:00',
          timeMins: 1140,
          capacity: 5,
          adjective: 'exciting',
          descriptions: [
            "I'm going to see a sci-fi film about space.",
            "We're going to watch Planet X to see spaceships.",
            "I'm going to watch an exciting space adventure."
          ],
          purposePhrases: ['to see space', 'to have an exciting evening', 'to watch an adventure']
        },
        {
          id: 'wild_world',
          title: 'Wild World',
          genre: 'documentary',
          genreLabel: 'Documentary',
          ageRating: 'G',
          minAge: 0,
          screen: 2,
          time: '19:30',
          timeMins: 1170,
          capacity: 5,
          adjective: 'interesting',
          descriptions: [
            "I'm going to watch Wild World to learn about nature.",
            "I'm going to see the documentary at half past seven.",
            "We're going to watch an interesting nature film."
          ],
          purposePhrases: ['to learn about nature', 'to see wild animals']
        },
        {
          id: 'love_in_paris',
          title: 'Love in Paris',
          genre: 'romance',
          genreLabel: 'Romance',
          ageRating: '12',
          minAge: 12,
          screen: 2,
          time: '20:00',
          timeMins: 1200,
          capacity: 5,
          adjective: 'romantic',
          descriptions: [
            "I'm going to see a romantic film with my partner.",
            "We're going to watch Love in Paris to have a romantic evening.",
            "I'm going to see the romance at eight o'clock."
          ],
          purposePhrases: ['to have a romantic evening', 'to see a love story']
        },
        {
          id: 'the_last_train',
          title: 'The Last Train',
          genre: 'thriller',
          genreLabel: 'Thriller',
          ageRating: '12',
          minAge: 12,
          screen: 3,
          time: '20:30',
          timeMins: 1230,
          capacity: 5,
          adjective: 'exciting',
          descriptions: [
            "I'm going to watch an exciting thriller.",
            "I'm going to see The Last Train at 20:30.",
            "We're going to watch a fast mystery film."
          ],
          purposePhrases: ['to feel excited', 'to see an exciting story']
        },
        {
          id: 'the_dark_house',
          title: 'The Dark House',
          genre: 'horror',
          genreLabel: 'Horror',
          ageRating: '16',
          minAge: 16,
          screen: 3,
          time: '21:00',
          timeMins: 1260,
          capacity: 5,
          adjective: 'scary',
          descriptions: [
            "I'm going to watch a scary horror film.",
            "We're going to see The Dark House to get scared.",
            "I'm going to watch the horror movie at nine o'clock."
          ],
          purposePhrases: ['to get scared', 'to have a scary night']
        }
      ],
      tvLoungeSchedule: []
    }
  };

  if (window.CinemaChaos && window.CinemaChaos.CampaignRegistry) {
    window.CinemaChaos.CampaignRegistry.register(THE_FIRST_WEEK_CAMPAIGN);
  }


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
    ageRuleText: 'Check film age ratings in the schedule: [G] all ages, [12] minimum age 12, [16] minimum age 16. Customers for 12 or 16 films must present a valid ID card matching their name, photo and birth date.',

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
        skin: '#e0ac69',
        skinColor: '#e0ac69',
        hairColor: '#3b0764',
        coatColor: '#065f46',
        shirtColor: '#d1fae5',
        glasses: true,
        hat: false,
        moustache: false,
        wearingRed: false,
        staffBadge: true
      },
      mr_blackwood: {
        id: 'mr_blackwood',
        name: 'Mr Blackwood',
        tag: 'Cinema Manager',
        isElderly: false,
        skin: '#f1c27d',
        skinColor: '#f1c27d',
        hairColor: '#374151',
        coatColor: '#111827',
        shirtColor: '#fca5a5',
        glasses: true,
        hat: true,
        moustache: true,
        wearingRed: false
      }
    },

    days: {
      1: {
        dayNum: 1,
        dayName: 'MONDAY',
        title: 'Day 1 — The New Employee',
        briefingMemo: [
          'Welcome to The Grand Cinema. I am Mr Blackwood, your manager.',
          'Your job is simple: read the programme, check every ticket field (film, screen, time, day and seats), and listen to the customer’s plan.',
          'The correction printer is closed until Wednesday. Today, ADMIT valid tickets and REFUSE any ticket with an error.'
        ].join('\n'),
        languageFocus: "Plans with 'be going to' + infinitive of purpose ('to laugh', 'to relax').",
        policies: {
          currentDate: '2026-10-12',
          dateDisplay: '12 Oct 2026',
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
            text: 'Manager’s Memo (Mr Blackwood): Keep the queue moving! Tomorrow we introduce official Film Age Classifications ([G], [12], [16]). Do not embarrass my cinema.'
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
            trigger: { minCaseIndex: 0 },
            statementTemplate: "Good evening! You must be the new ticket clerk. Today I'm going to see {title} to learn about penguins. Is everything in order on my ticket?",
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
            storyKey: 'sofia_day1_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "Hi! I'm Sofia—I study film at the college. I'm going to watch {title} tonight to study the suspense scenes.",
            qaOverrides: {
              which_film: "I'm going to see The Last Train at 20:30.",
              why_see: "I'm here to see an exciting thriller for my cinema class."
            },
            storyEffects: {
              onAction: {
                ADMIT: { sofia_trust: 'trusted', sofia_day1_outcome: 'helped' }
              },
              onMistake: { sofia_trust: 'wary', sofia_day1_outcome: 'mistake' },
              dilemmaNoteByAction: {
                ADMIT: 'Sofia promised to share helpful cinema tips with you later in the week.'
              }
            }
          },
          {
            id: 'blackwood_day1',
            characterId: 'mr_blackwood',
            caseType: 'screen',
            targetScreeningId: 'laughing_bananas',
            expectedAction: 'REFUSE',
            storyKey: 'blackwood_day1_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Ahem! I am Mr Blackwood, your manager. This is a spot check! Look closely at the screen number on this ticket for {title}. The printer is closed today—what is your decision?",
            qaOverrides: {
              which_film: "This test ticket is for Laughing Bananas, which is in Screen 1—not Screen 2!",
              are_you_sure: "I am testing whether you inspect the Screen field before stamping!"
            },
            storyEffects: {
              onAction: {
                REFUSE: { blackwood_day1_outcome: 'passed_test' }
              },
              onMistake: { blackwood_day1_outcome: 'failed_test' },
              dilemmaNoteByAction: {
                REFUSE: 'You passed Mr Blackwood’s surprise Monday spot-check.'
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
          'Today is Tuesday, 13 October 2026. The town council is enforcing Film Age Classifications.',
          'Check the age rating next to every film in the schedule: [G] Suitable for all ages, [12] Minimum age 12, [16] Minimum age 16.',
          'Customers for [12] or [16] films must present a valid ID card. Check their date of birth against today’s date (13 Oct 2026). The printer is still closed—refuse underage customers or anyone without valid ID.'
        ].join('\n'),
        languageFocus: "Age verification ('How old are you?', 'Can I see your ID?') and date-of-birth checks.",
        policies: {
          currentDate: '2026-10-13',
          dateDisplay: '13 Oct 2026',
          allowCorrections: false,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age ratings & ID (13 Oct 2026)',
          ageRuleText: 'Ratings: [G] all ages, [12] min age 12 (born on or before 13 Oct 2014), [16] min age 16 (born on or before 13 Oct 2010). Refuse [12] or [16] tickets if the customer is underage or has no valid ID.',
          lateToleranceMins: null,
          checkDuplicates: false,
          allowPromoChanges: false,
          tvLoungeOpen: false,
          allowVipPasses: false,
          allowStaffPasses: false,
          conditionalScreenRules: []
        },
        scheduleChanges: [],
        casePool: ['underage', 'missing_id', 'age_valid', 'wrong_film', 'screen', 'time', 'date', 'missing'],
        midShiftNotices: [
          {
            id: 'day2_age_notice',
            atMins: 1092,
            text: 'Box Office Reminder: Not every horror fan is underage! Admit adults whose ID card and ticket are valid, but watch out for teenagers claiming to be 16 without ID.'
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
            idCard: {
              exists: false,
              presented: false,
              reason: 'Customer claims he left his ID card in his school locker.'
            },
            storyKey: 'leo_day2_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 0 },
            statementTemplate: "Hey! I'm going to see {title} tonight to get scared! I'm sixteen years old—totally old enough for a [16] horror film. You don't need to see my ID, right?",
            qaOverrides: {
              ask_age: "I'm sixteen! Definitely sixteen. Maybe even sixteen and a half.",
              ask_id: "Er... my ID card? A dog ate my wallet on the way from school! Just trust me!",
              which_film: "I'm going to watch The Dark House in Screen 3!",
              why_see: "I'm here to see the scariest horror film of the year!"
            },
            storyEffects: {
              onAction: {
                REFUSE: { leo_day2_outcome: 'refused' }
              },
              onMistake: { leo_day2_outcome: 'admitted' },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistake: {
                leo_admitted_underage: 1
              },
              dilemmaNoteByAction: {
                REFUSE: 'You refused 14-year-old Leo entry to The Dark House [16] when he had no ID.'
              },
              dilemmaNoteOnMistake: 'You let underage Leo into The Dark House [16] without an ID card!'
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
              presented: true,
              holderName: 'Elena',
              dob: '1994-10-13'
            },
            personOverrides: {
              name: 'Elena',
              tag: 'Horror Critic',
              glasses: true,
              hat: 'none'
            },
            oncePerShift: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "Good evening. I'm going to see {title} at {time}. Today is actually my thirty-second birthday—here are my ticket and ID card.",
            qaOverrides: {
              ask_age: "I'm thirty-two today—born on 13 October 1994.",
              ask_id: "Here is my ID card. My date of birth is 1994-10-13."
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
              presented: true,
              holderName: 'Sam',
              dob: '2014-10-13'
            },
            personOverrides: {
              name: 'Sam',
              tag: 'Birthday Visitor',
              hat: 'cap'
            },
            oncePerShift: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Hi! I'm going to see {title}. It's rated [12], and today—13 October—is my twelfth birthday! Look at my ID card!",
            qaOverrides: {
              ask_age: "I turn twelve today, 13 October 2026!",
              ask_id: "Here is my ID card—born 2014-10-13, exactly twelve years ago today!"
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
          dateDisplay: '14 Oct 2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age ratings & ID (14 Oct 2026)',
          ageRuleText: 'Check [G], [12] and [16] ratings. Customers for [12] or [16] films need valid ID and must not wear disguises.',
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
            storyKey: 'morris_day3_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 0 },
            statementByStory: [
              {
                condition: { key: 'morris_relationship', value: 'warm' },
                text: "Hello again, my friend! You were so helpful on Monday. I booked {title} at {time}, but my ticket says Screen 3 and the lobby sign says the projector broke! Can you print me a new ticket for Screen 1?"
              },
              {
                condition: { key: 'morris_relationship', value: 'upset' },
                text: "Oh, it's you again. After you turned me away on Monday, now the Screen 3 projector is broken! My ticket is for {title} at {time}. Are you going to fix it with your printer today?"
              },
              {
                text: "Excuse me, dear. My ticket for {title} at {time} says Screen 3, but I heard the projector moved to Screen 1. Can you correct my ticket?"
              }
            ],
            qaOverrides: {
              which_film: "I'm going to see Planet X at 19:00. It moved to Screen 1.",
              alternative: "I want to watch Planet X in Screen 1, please."
            },
            storyEffects: {
              onAction: {
                CORRECT: { morris_relationship: 'loyal', morris_day3_outcome: 'helped' }
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
            storyKey: 'maya_day3_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 1 },
            ticketOverrides: {
              screen: 3
            },
            statementTemplate: "Psst! It's me, Maya from the morning counter! I accidentally printed this guest's {title} ticket for Screen 3 instead of Screen 2. Please use CORRECT to reprint it for Screen 2 so Mr Blackwood doesn't dock my pay!",
            qaOverrides: {
              which_film: "The ticket is for Wild World at 19:30 in Screen 2.",
              are_you_sure: "Yes! Please use the Correction Printer to move it to Screen 2!"
            },
            storyEffects: {
              onAction: {
                CORRECT: { maya_relationship: 'helped', maya_day3_outcome: 'helped' }
              },
              onMistake: { maya_relationship: 'blamed', maya_day3_outcome: 'mistake' },
              dilemmaNoteByAction: {
                CORRECT: 'You fixed Maya’s misprinted Screen 2 ticket. She promised to return the favour on Saturday.'
              },
              dilemmaNoteOnMistake: 'Maya was reprimanded by Mr Blackwood after the misprinted ticket was not corrected.'
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
            personTagOverride: '“Adult Gentleman”',
            personOverrides: {
              fakeBeard: true,
              obviousDisguise: true,
              disguiseIssueText: 'Customer is wearing a lopsided fake beard glued to his chin.'
            },
            idCard: {
              exists: false,
              presented: false,
              reason: 'Claims he left his wallet in his “other adult briefcase”.'
            },
            storyKey: 'leo_day3_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 2 },
            statementByStory: [
              {
                condition: { key: 'leo_day2_outcome', value: 'admitted' },
                text: "Good evening, fellow adult! That kid Leo told me {title} was awesome yesterday, so I—a completely different twenty-four-year-old man with a magnificent beard—am going to watch it tonight!"
              },
              {
                text: "Good evening, fellow taxpayer! I am definitely not Leo from yesterday. I am a twenty-four-year-old man with a real beard, and I'm going to see {title}!"
              }
            ],
            qaOverrides: {
              ask_age: "I am twenty-four years old! Behold my luxurious adult beard!",
              ask_id: "My ID? I left it in my... adult tax office! At the business factory!",
              which_film: "I am going to see The Dark House [16] in Screen 3!"
            },
            storyEffects: {
              onAction: {
                REFUSE: { leo_day3_outcome: 'refused', leo_beard_detected: 'yes' }
              },
              onMistake: { leo_day3_outcome: 'admitted', leo_beard_detected: 'no' },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistake: {
                leo_admitted_underage: 1
              },
              dilemmaNoteByAction: {
                REFUSE: 'You spotted Leo’s glued-on fake beard and refused him entry to The Dark House [16].'
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
          'Watch ID cards carefully: the name and photo on the ID must match the customer and ticket.'
        ].join('\n'),
        languageFocus: "Checking duplicate serial numbers, 10-minute late arrivals, and matching ID names.",
        policies: {
          currentDate: '2026-10-15',
          dateDisplay: '15 Oct 2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age & identity check (15 Oct 2026)',
          ageRuleText: 'Check [G], [12] and [16] ratings. The ID card name and photo must match the customer and ticket holder.',
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
            storyKey: 'sofia_day4_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 0 },
            statementByStory: [
              {
                condition: { key: 'sofia_trust', value: 'trusted' },
                text: "Hi again! My ticket for {title} has the wrong screen printed—could you correct it? Also, heads up: I saw Leo outside in a huge suit calling himself 'Mr Leonardo Smith', and scalpers peddling serial GC-4-109!"
              },
              {
                text: "Hello. I'm going to watch {title} at {time}, but the screen number on my ticket is wrong. Can you print a corrected ticket?"
              }
            ],
            qaOverrides: {
              which_film: "I'm going to see Love in Paris at 20:00 in Screen 2.",
              why_see: "I'm here to see a romantic film—and warn you about the ticket cheats outside!"
            },
            storyEffects: {
              onAction: {
                CORRECT: { sofia_trust: 'ally', sofia_day4_outcome: 'helped', sofia_whistleblower_clue: 'yes' }
              },
              onMistake: { sofia_trust: 'distant', sofia_day4_outcome: 'mistake' },
              dilemmaNoteByAction: {
                CORRECT: 'Sofia tipped you off about duplicate tickets and promised to investigate suspicious VIP passes for Saturday.'
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
              presented: true,
              holderName: 'Leonardo Senior',
              dob: '1985-11-20',
              photoMismatch: true,
              photoMismatchText: 'The ID card belongs to Leo’s father (“Leonardo Senior”) and does not match the teenager in the oversized suit.'
            },
            storyKey: 'leo_day4_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 1 },
            statementByStory: [
              {
                condition: { key: 'leo_beard_detected', value: 'yes' },
                text: "Good evening. Forget that bearded imposter from Wednesday! My name is Mr Leonardo Smith, a forty-year-old businessman in a normal suit. I'm going to see {title}!"
              },
              {
                text: "Greetings! I am Mr Leonardo Smith, an important forty-year-old executive. I'm going to watch {title} in Screen 3. Here is my totally real adult ID!"
              }
            ],
            qaOverrides: {
              ask_age: "I am forty years old. Born in 1985, just like my dad's—I mean MY—ID card says!",
              ask_id: "Look at the card: 'Leonardo Senior, DOB 1985-11-20'. Don't look at the 'Leo' name on the ticket!",
              which_film: "I'm going to see The Dark House [16]!"
            },
            storyEffects: {
              onAction: {
                REFUSE: { leo_day4_outcome: 'refused' }
              },
              onMistake: { leo_day4_outcome: 'admitted' },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistake: {
                leo_admitted_underage: 1
              },
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
              presented: true,
              holderName: 'Mystery Customer',
              dob: '1982-05-14'
            },
            storyKey: 'inspector_day4_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Good evening. I'm going to see {title} at {time}. Please inspect my ticket and identification just as you would for any other guest.",
            qaOverrides: {
              ask_age: "I am forty-four years old.",
              ask_id: "Certainly. My date of birth is 1982-05-14."
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
            storyKey: 'maya_day4_outcome',
            oncePerShift: true,
            trigger: {
              minCaseIndex: 3,
              requireStoryValue: { key: 'maya_relationship', value: 'helped' }
            },
            statementTemplate: "Thanks again for saving me on Wednesday! I checked this guest's {title} ticket twice so it's 100% valid. By the way, that woman in the fedora is an undercover Corporate Inspector!",
            qaOverrides: {
              which_film: "It's for Happy Penguins at 18:15 in Screen 2—all checked and ready!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { maya_day4_outcome: 'helped', maya_inspector_tip: 'yes' }
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
            storyKey: 'maya_day4_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 3 },
            statementTemplate: "Um, hello... Mr Blackwood yelled at me yesterday, and my hands are shaking so badly I printed the wrong film on this ticket. Can you ask which film is needed and correct it?",
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
            trigger: {
              minCaseIndex: 4,
              requireLateScreeningId: 'happy_penguins'
            },
            statementTemplate: "Oh dear, I'm {lateMins} minutes late for {title}! I stopped to help a lost family find the bus stop. I know the rule is 10 minutes, and I only want to see {title}... could you possibly let me in?",
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
          'Friday night brings VIP guests and schedule changes—and pressure from Mr Blackwood.',
          'Love in Paris (20:00) is CANCELLED; ask affected customers about another film and use CORRECT. An extra show of Happy Penguins runs at 19:15 in Screen 2.',
          'Official VIP passes must appear on the Authorised VIP List in the binder. Watch out for forged IDs where the printed age contradicts the birth date!'
        ].join('\n'),
        languageFocus: "Handling cancelled screenings, verifying VIP pass numbers, and spotting forged IDs.",
        policies: {
          currentDate: '2026-10-16',
          dateDisplay: '16 Oct 2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age & forged ID check (16 Oct 2026)',
          ageRuleText: 'Verify that the birth date on every ID card matches the customer’s claimed age and printed age, and that the photo has not been altered.',
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
            storyKey: 'blackwood_day5_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 0 },
            statementTemplate: "Listen closely. This VIP pass—VIP-000-CASH for {title}—belongs to a personal friend who paid me cash in my office. It isn't on the Head Office VIP list, but I am your manager and I order you to stamp ADMIT!",
            qaOverrides: {
              which_film: "It's for The Dark House at 21:00. Stop asking questions and stamp ADMIT!",
              are_you_sure: "Of course I'm sure! Obey your manager, not the Head Office binder!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { blackwood_day5_outcome: 'complied' },
                REFUSE: { blackwood_day5_outcome: 'refused' }
              },
              onQuestioned: { blackwood_questioned: 'yes' },
              dilemmaNoteByAction: {
                ADMIT: 'You obeyed Mr Blackwood and admitted unlisted pass VIP-000-CASH.',
                REFUSE: 'You refused Mr Blackwood’s unlisted VIP-000-CASH pass and upheld the official VIP list.'
              }
            },
            customFeedback: {
              ADMIT: 'You obeyed Mr Blackwood and waved through unlisted pass VIP-000-CASH (+€15). The Corporate Inspector will not like this.',
              REFUSE: 'You stood up to Mr Blackwood and refused unlisted pass VIP-000-CASH in accordance with Head Office rules!'
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
            personTagOverride: '“Seventeen-Year-Old Leo”',
            personOverrides: {
              editedMoustache: true
            },
            idCard: {
              exists: true,
              presented: true,
              holderName: 'Leo',
              dob: '2012-09-10',
              statedAge: 17,
              photoAltered: true,
              photoMismatchText: 'Someone drew a black marker moustache onto the ID card photograph, and DOB 2012-09-10 is age 14, not 17.'
            },
            storyKey: 'leo_day5_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "Aha! Today I have my own official ID card for {title}! See? It says 'Printed Age: 17' right there on the plastic, and the moustache in the photo matches my face!",
            qaOverrides: {
              ask_age: "I'm seventeen! Look at the 'Printed Age: 17' box—don't do the maths on 2012-09-10!",
              ask_id: "Here is my card! Totally laminated! Definitely not drawn on with a permanent marker!",
              which_film: "I'm going to see The Dark House [16]!"
            },
            storyEffects: {
              onAction: {
                REFUSE: { leo_day5_outcome: 'refused' }
              },
              onMistake: { leo_day5_outcome: 'admitted' },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistake: {
                leo_admitted_underage: 1
              },
              dilemmaNoteByAction: {
                REFUSE: 'You caught Leo’s forged ID card (DOB 2012-09-10 = age 14, with a marker moustache on the photo).'
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
              presented: true,
              holderName: 'Mystery Customer',
              dob: '1982-05-14'
            },
            storyKey: 'inspector_day5_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Good evening. I am attending {title} at {time} with VIP pass VIP-900-INSPECTOR. Please verify my pass against your authorised VIP list.",
            qaOverrides: {
              ask_id: "Here is my ID card (DOB 1982-05-14). My VIP pass is VIP-900-INSPECTOR."
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
          dateDisplay: '17 Oct 2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Age, ID & Staff Pass check (17 Oct 2026)',
          ageRuleText: 'All [12] and [16] age rules, ID photo/name checks, and staff pass rules apply on Premiere Night.',
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
            storyKey: 'morris_day6_outcome',
            oncePerShift: true,
            trigger: {
              minCaseIndex: 0,
              requireStoryValue: { key: 'morris_relationship', value: 'loyal' }
            },
            statementTemplate: "Happy Saturday, my friend! Because you helped me so kindly earlier this week, I brought my two grandchildren to see {title}. There are three of us, and I booked all 3 seats properly!",
            qaOverrides: {
              how_many: "There are three of us—me and my two grandchildren, all booked for 3 seats!",
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
            trigger: { minCaseIndex: 0 },
            statementTemplate: "Good evening. I brought my grandchildren to see an animal documentary—there are three of us—but I got confused at the machine and printed the wrong screen. Can you check our plan and reprint our 3-seat ticket?",
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
            storyKey: 'maya_day6_outcome',
            oncePerShift: true,
            trigger: {
              minCaseIndex: 1,
              requireStoryValue: { key: 'maya_relationship', value: 'helped' }
            },
            statementTemplate: "Hey! Because you had my back earlier this week, I unlocked the extra balcony row in Screen 1 (+4 seats for {title})! This group of 3 only has 1 seat on their ticket—use CORRECT to upgrade them to 3 seats!",
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
            storyKey: 'maya_day6_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 1 },
            statementTemplate: "This group of 3 wants to see {title}, and their ticket only has 1 seat. I didn't have time to open the balcony row after getting in trouble on Wednesday, so Screen 1 only has 2 seats total—you'll have to refuse them.",
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
            personTagOverride: '“Assistant Projectionist”',
            personOverrides: {
              staffHat: true,
              staffBadge: true,
              obviousDisguise: true,
              disguiseIssueText: 'Leo is wearing a homemade cardboard staff badge that says “CHIEF HORROR TESTER”.'
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
            storyKey: 'leo_day6_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Hello, fellow colleague! I work here now! I'm the new Assistant Projectionist, and I need to enter Screen 3 immediately to inspect {title} from the front row with popcorn!",
            qaOverrides: {
              ask_age: "I'm nineteen! Old enough to operate a projector AND watch a [16] horror movie!",
              ask_id: "Look at my badge—it says STAFF-99-LEO in genuine red crayon!",
              which_film: "I'm inspecting The Dark House [16], obviously!"
            },
            storyEffects: {
              onAction: {
                REFUSE: { leo_day6_outcome: 'refused' }
              },
              onMistake: { leo_day6_outcome: 'admitted' },
              incrementOnAction: {
                REFUSE: { leo_caught_count: 1 }
              },
              incrementOnMistake: {
                leo_admitted_underage: 1
              },
              dilemmaNoteByAction: {
                REFUSE: 'You thwarted Leo’s attempt to sneak into The Dark House [16] disguised as a cinema employee.'
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
            storyKey: 'sofia_day6_outcome',
            oncePerShift: true,
            trigger: {
              minCaseIndex: 3,
              requireStoryValue: { key: 'sofia_trust', value: 'ally' }
            },
            statementTemplate: "Hi! My ticket and ID for {title} are all in order. Listen: I checked the student society receipts—Mr Blackwood has been pocketing cash for fake 'VIP-000' passes! Refuse his passes and tell the Inspector tomorrow!",
            qaOverrides: {
              which_film: "I'm going to see The Last Train at 20:30.",
              why_see: "I'm here to watch the thriller—and give you the evidence on Mr Blackwood's VIP-000 passes!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { sofia_day6_outcome: 'helped', sofia_evidence: 'yes', whistleblower_identified: 'yes' }
              },
              dilemmaNoteByAction: {
                ADMIT: 'Sofia handed you evidence of Mr Blackwood’s off-the-books VIP-000 pass scheme.'
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
            storyKey: 'sofia_day6_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 3 },
            statementTemplate: "Hi. The machine printed the wrong film on my ticket—I want a thriller tonight. Ask me about my plan and reprint it, and I'll tell you what I discovered about Mr Blackwood's VIP passes.",
            qaOverrides: {
              which_film: "I want a thriller—The Last Train at 20:30. Also, watch out for Mr Blackwood's 'VIP-000' passes!",
              alternative: "The Last Train in Screen 3, please."
            },
            storyEffects: {
              onAction: {
                CORRECT: { sofia_day6_outcome: 'helped', sofia_evidence: 'yes' }
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
            storyKey: 'blackwood_day6_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 4 },
            statementTemplate: "Another special premiere guest of mine! Pass number VIP-000-PREMIERE for {title}. Never mind that it isn't on the Head Office list—stamp ADMIT if you want to be Management Material!",
            qaOverrides: {
              which_film: "The Last Train at 20:30! Don't lecture me about the VIP list—stamp ADMIT!",
              are_you_sure: "I am the manager of this cinema! Do as I say!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { blackwood_day6_outcome: 'complied' },
                REFUSE: { blackwood_day6_outcome: 'refused' }
              },
              onQuestioned: { blackwood_questioned: 'yes' },
              dilemmaNoteByAction: {
                ADMIT: 'You obeyed Mr Blackwood and admitted unlisted premiere pass VIP-000-PREMIERE.',
                REFUSE: 'You refused Mr Blackwood’s unlisted VIP-000-PREMIERE pass.'
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
          'Today is Sunday, 18 October 2026—your seventh day and the Final Corporate Inspection.',
          'All cinema rules are active today: age classifications ([G], [12], [16]) and ID checks, Planet X moved to Screen 1, Love in Paris cancelled, Happy Penguins 19:15 extra show, 10-minute late limit, used serials, and official VIP/Staff lists.',
          'Every choice you have made this week—with Leo, Mr Morris, Sofia, Maya, Mr Blackwood, and the Inspector—comes to a head tonight!'
        ].join('\n'),
        languageFocus: "Complete cinema inspection mastery—evaluating every rule, character, and clue.",
        policies: {
          currentDate: '2026-10-18',
          dateDisplay: '18 Oct 2026',
          allowCorrections: true,
          checkAgeRestrictions: true,
          ageRuleTitle: 'Final Inspection: Age & ID (18 Oct 2026)',
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
            personTagOverride: 'Honest Filmgoer',
            personOverrides: {
              fakeBeard: false,
              oversizedSuit: false,
              sunglasses: false,
              editedMoustache: false,
              staffHat: false,
              staffBadge: false,
              obviousDisguise: false
            },
            idCard: {
              exists: true,
              presented: true,
              holderName: 'Leo',
              dob: '2012-09-10'
            },
            storyKey: 'leo_day7_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 0 },
            statementByStory: [
              {
                condition: { key: 'leo_day2_outcome', value: 'refused' },
                text: "Okay, you win! No fake beard, no giant suit, no marker moustache, no crayon badge. I'm really fourteen, here is my real school ID, and I bought a real ticket for {title}. It's rated [G] for all ages! Can I go in?"
              },
              {
                text: "Hey! No disguises today, I promise! I'm fourteen, here is my real ID card (DOB 2012-09-10), and I bought a valid ticket for {title} in Screen 1. It's rated [G]! Can I watch the comedy?"
              }
            ],
            qaOverrides: {
              ask_age: "I'm fourteen years old—born 10 September 2012. Tell the truth, right?",
              ask_id: "Here is my real student ID card: Leo, DOB 2012-09-10. And Laughing Bananas is rated [G]!",
              which_film: "I'm going to see Laughing Bananas at 18:00 in Screen 1!",
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
              ADMIT: 'Leo beamed! With a valid ticket for G-rated Laughing Bananas and his real ID, he headed happily into Screen 1.'
            }
          },
          {
            id: 'morris_day7',
            characterId: 'mr_morris',
            caseType: 'valid',
            targetScreeningId: 'happy_penguins',
            expectedAction: 'ADMIT',
            storyKey: 'morris_day7_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 1 },
            statementByStory: [
              {
                condition: { key: 'morris_relationship', value: 'loyal' },
                text: "Good evening, my dear friend! I'm going to see {title} once more. I just spoke with the Corporate Inspector in the foyer and told her you are the kindest, finest employee The Grand Cinema has ever had!"
              },
              {
                text: "Good evening. I'm going to see {title} at {time} in Screen 2. Everything on my ticket and ID is in order today."
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
                ADMIT: 'Mr Morris praised your service to the Corporate Inspector.'
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
            storyKey: 'blackwood_day7_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 2 },
            statementTemplate: "Quick—before the Corporate Inspector reaches the window! Stamp ADMIT on VIP-000-AUDIT for {title} so my private cash ledger balances! If you refuse this pass, I'll know you're siding with the auditors!",
            qaOverrides: {
              which_film: "The Dark House at 21:00! Stamp ADMIT now and I'll recommend you for Assistant Manager!",
              are_you_sure: "If you refuse VIP-000-AUDIT, the Inspector will uncover my side business!"
            },
            storyEffects: {
              onAction: {
                ADMIT: { blackwood_day7_outcome: 'complied' },
                REFUSE: { blackwood_day7_outcome: 'refused', whistleblower_identified: 'yes' }
              },
              onQuestioned: { whistleblower_identified: 'yes' },
              dilemmaNoteByAction: {
                ADMIT: 'You stamped Mr Blackwood’s final unlisted pass (VIP-000-AUDIT) to cover his tracks.',
                REFUSE: 'You refused Mr Blackwood’s VIP-000-AUDIT cover-up pass right in front of the audit!'
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
            personTagOverride: 'Corporate Inspector',
            idCard: {
              exists: true,
              presented: true,
              holderName: 'Mystery Customer',
              dob: '1982-05-14'
            },
            storyKey: 'inspector_day7_outcome',
            oncePerShift: true,
            trigger: { minCaseIndex: 3 },
            statementByStory: [
              {
                condition: { key: 'whistleblower_identified', value: 'yes' },
                text: "I am the Corporate Cinema Inspector. Thank you for flagging Mr Blackwood's unauthorised VIP-000 passes! Please verify my official pass VIP-900-INSPECTOR for {title} to conclude the audit."
              },
              {
                condition: { key: 'morris_commendation', value: 'yes' },
                text: "I am the Corporate Cinema Inspector. Regular guests like Mr Morris have spoken very highly of you this week. Please verify my official pass VIP-900-INSPECTOR for {title}."
              },
              {
                text: "Good evening. I am the Corporate Cinema Inspector conducting the Sunday audit. Here is my authorised pass VIP-900-INSPECTOR and ID for {title}."
              }
            ],
            qaOverrides: {
              ask_age: "I am forty-four years old (DOB 1982-05-14).",
              ask_id: "Here is my official Inspector ID and pass VIP-900-INSPECTOR.",
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
        dateDisplay: '19 Oct 2026',
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
        'cancelled', 'combined', 'underage', 'missing_id', 'fake_id',
        'false_identity', 'disguise', 'staff_impostor', 'age_valid'
      ],
      midShiftNotices: [],
      scriptedEncounters: []
    },

    endings: [
      {
        id: 'youre_fired',
        title: "You're Fired!",
        badge: 'ENDING 5 OF 5 · DISMISSED',
        summary: 'Between mountaintops of management warnings, unverified age restrictions, and box-office blunders, both Mr Blackwood and the Corporate Inspector agreed that your chaotic week behind the glass must come to an immediate end.',
        managerQuote: '"Pack up your stamps! With this many warnings and inspection errors, even I cannot save your job!"',
        inspectorQuote: '"The audit uncovered serious compliance failures in age verification and ticket control. Immediate termination is required."',
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
        summary: 'You refused to rubber-stamp Mr Blackwood’s off-the-books VIP-000 cash passes, pieced together Sofia’s audit evidence, and handed the truth directly to the Corporate Inspector. Mr Blackwood was escorted out of his office, and Head Office appointed a new reform team with you as Senior Box Office Supervisor!',
        managerQuote: '"You—you reported my VIP-000 passes to Head Office?! Wait until my lawyers hear about this!"',
        inspectorQuote: '"Your integrity in refusing unauthorised manager passes and documenting the fraud saved The Grand Cinema from a major scandal. Exemplary work."',
        conditions: {
          forbidDismissed: true,
          storyMin: { manager_conflict: 2 },
          storyMax: { manager_compliance: 0 },
          anyOf: [
            { storyEquals: { whistleblower_identified: 'yes' } },
            { storyEquals: { sofia_evidence: 'yes' } },
            { storyMin: { manager_conflict: 3 } }
          ]
        }
      },
      {
        id: 'management_material',
        title: 'Management Material',
        badge: 'ENDING 3 OF 5 · THE MANAGER’S PROTEGE',
        summary: 'Whenever Mr Blackwood demanded "special treatment" for his off-the-books VIP-000 guests, you stamped ADMIT without flinching. While the Corporate Inspector raised an eyebrow at the ledger, Mr Blackwood took full credit for the week’s profits and promoted you to his right-hand Assistant Manager.',
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
        summary: 'You put human kindness and loyal cinema-goers first all week: helping Mr Morris and his grandchildren, saving Maya’s job so she could open the balcony on Premiere Night, earning Sofia’s trust, and welcoming Leo when he finally bought an honest ticket. The local community rallied behind you as the heart and soul of The Grand Cinema!',
        managerQuote: '"You bent my rules more than I liked, but half the town wrote letters praising your kindness—I suppose we have to keep you!"',
        inspectorQuote: '"Customer satisfaction scores are the highest in the district. Guests specifically commended your empathy and fairness."',
        conditions: {
          forbidDismissed: true,
          storyEquals: {
            morris_day3_outcome: 'helped',
            maya_relationship: 'helped',
            leo_day7_outcome: 'helped'
          },
          anyOf: [
            { storyMin: { total_exceptions: 1 } },
            { storyEquals: { people_champion_path: 'yes' } },
            { storyEquals: { morris_commendation: 'yes' } }
          ]
        }
      },
      {
        id: 'employee_of_the_week',
        title: 'Employee of the Week',
        badge: 'ENDING 1 OF 5 · GOLD STANDARD',
        summary: 'Across seven demanding shifts, you balanced strict age-restriction enforcement, accurate ticket corrections, and fair customer service without succumbing to corruption or carelessness. Your framed portrait now hangs in the foyer of The Grand Cinema!',
        managerQuote: '"Flawless numbers, clean books, and a full cinema. Even I have nothing to complain about!"',
        inspectorQuote: '"Precision, fairness, and complete mastery of every regulation from Monday to Sunday. You are officially named Employee of the Week."',
        conditions: {
          forbidDismissed: true
        }
      }
    ],

    endingCallbacks: [
      {
        characterName: 'Mr Morris',
        role: 'Regular Visitor',
        conditions: { storyEquals: { morris_relationship: 'loyal' } },
        text: 'Wrote a glowing letter to Head Office thanking you for reprinting his Wednesday ticket and welcoming his grandchildren on Saturday.'
      },
      {
        characterName: 'Mr Morris',
        role: 'Regular Visitor',
        conditions: { storyEquals: { morris_relationship: ['upset', 'cold'] } },
        text: 'Left the cinema disappointed after his tickets were turned away earlier in the week.'
      },
      {
        characterName: 'Leo',
        role: 'Former Master of Disguise',
        conditions: { storyEquals: { leo_day7_outcome: 'helped' } },
        text: 'Retired his fake beard, oversized suit, and crayon staff badge after you admitted him honestly to Laughing Bananas [G] on Sunday.'
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
        conditions: { storyEquals: { maya_relationship: 'helped' } },
        text: 'Kept her job thanks to your Wednesday ticket correction and unlocked the Screen 1 balcony row for Saturday’s premiere.'
      },
      {
        characterName: 'Maya',
        role: 'Junior Employee',
        conditions: { storyEquals: { maya_relationship: 'blamed' } },
        text: 'Was placed on probation by Mr Blackwood after Wednesday’s misprinted ticket was not corrected.'
      },
      {
        characterName: 'Sofia',
        role: 'Film Student',
        conditions: { storyEquals: { sofia_evidence: 'yes' } },
        text: 'Shared the crucial audit clues that exposed the unauthorized VIP-000 pass scheme.'
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


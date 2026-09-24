// ============================================================
//  SETTINGS
//  Every number and every word in the game lives here.
//  Change a value, save the file, press F5 in the browser.
//  Keep the quote marks '...' and the commas at the ends of lines!
// ============================================================

var CONFIG = {

  // ---------- COLOURS ----------
  // Colours are written as "hex codes". #0047BB is ADCO Blue.
  colours: {
    wall:       '#1b2a4a',   // restaurant back wall
    counter:    '#8b5a2b',   // wooden sushi counter
    counterTop: '#a8703a',   // lighter strip along the top of the counter
    sign:       '#0047BB',   // the "Ask ADCO" sign
    signText:   '#ffffff',
    text:       '#ffffff',
    coinText:   '#ffd54a',   // gold colour for the coin counter
    faded:      '#b2b2b2',   // grey, for small print
    teamText:   '#99ade4',   // light blue, for the team name under each hero
    rowCanAfford: '#0047BB', // hero you have enough coins for
    rowTooDear:   '#2b3a5c', // hero you can't afford yet
    rowHired:     '#1f5a3a', // hero already hired (green)
    popupBg:      '#111a2e', // background of pop-up boxes
    button:       '#0047BB', // pop-up buttons
    buttonText:   '#ffffff',
    hrisTint:     'rgba(200, 0, 0, 0.35)', // red wash over the screen when HRIS is down
    hrisText:     '#ff5252',
    jobpacBg:     '#eceff1', // JobPac's grey "enterprise software" window
    jobpacBar:    '#546e7a',
    jobpacText:   '#263238',
    jobpacError:  '#c62828',
    progressFill: '#43a047'
  },

  // ---------- THE SIGN AT THE TOP ----------
  sign: {
    before:   'Ask ADCO',        // shown at the start
    after:    'Ask Andy',        // shown once Agent Andy is hired
    subtitle: 'Sushi Bar  ·  staffed by retired superheroes'
  },

  // ---------- THE BIG SUSHI BUTTON ----------
  sushi: {
    emoji:         '🍣',
    x:             250,    // position across the screen (0 = left edge, 900 = right edge)
    y:             330,    // position down the screen (0 = top, 600 = bottom)
    size:          170,    // how big the sushi is drawn
    coinsPerClick: 1,      // coins you earn for each click
    squashTime:    0.08    // seconds the sushi "squashes" when clicked
  },

  // ---------- THE HEROES YOU CAN HIRE ----------
  // price           : coins it costs to hire them
  // coinsPerSecond  : coins they earn for you every second, without clicking
  // autoClicksPerSecond : how many times a second they click the sushi for you
  // flipsSign       : true = hiring them changes the sign to "Ask Andy"
  // Tip: use "double quotes" around a line that contains an apostrophe.
  heroes: [
    {
      emoji: '🦸‍♂️',
      name:  'Captain Wasabi',
      team:  'System Engineers',
      line:  'Fixes laptops. Mostly by turning them off and on.',
      price: 15,
      coinsPerSecond: 2,
      autoClicksPerSecond: 0,
      flipsSign: false
    },
    {
      emoji: '🦸‍♀️',
      name:  'Wonder Maki',
      team:  'Product Development',
      line:  'Ships features. Eventually.',
      price: 50,
      coinsPerSecond: 5,
      autoClicksPerSecond: 0,
      flipsSign: false
    },
    {
      emoji: '🦹',
      name:  'The Gantt Lantern',
      team:  'Project Management & BA',
      line:  "Has a timeline for your sushi. It's already late.",
      price: 110,
      coinsPerSecond: 12,
      autoClicksPerSecond: 0,
      flipsSign: false
    },
    {
      emoji: '🤖',
      name:  'Agent Andy',
      team:  'AI & Innovation',
      line:  'Automates everything. Now answers to "Ask Andy".',
      price: 250,
      coinsPerSecond: 0,
      autoClicksPerSecond: 12,
      flipsSign: true
    }
  ],

  // ---------- THE HERO SHOP (layout on the right of the screen) ----------
  shop: {
    title:     'Hire a hero',
    x:         480,    // left edge of the shop
    y:         150,    // top of the first hero
    width:     400,
    rowHeight: 70,
    gap:       8,      // space between heroes
    hiredText: 'HIRED ✓'
  },

  // ---------- THE SCRIPT ----------
  // The jokes, in order. "at" = seconds after you press Start.
  // If a pop-up is still open when the next joke is due, the joke waits.
  // (JobPac isn't here - it happens on your first hire.)
  script: [
    { at: 18, event: 'gareth', visit: 0 },
    { at: 30, event: 'hris',   crash: 0 },
    { at: 40, event: 'gareth', visit: 1 },
    { at: 48, event: 'hris',   crash: 1 },
    { at: 63, event: 'hris',   crash: 2 },
    { at: 72, event: 'outage' }
  ],

  // ---------- POP-UP BOX (size and position) ----------
  popup: {
    x:            170,
    y:            130,
    width:        560,
    height:       330,
    buttonWidth:  280,
    buttonHeight: 50
  },

  // ---------- JOBPAC (happens on your first hire) ----------
  jobpac: {
    windowTitle: 'JobPac Enterprise  -  Sign In',
    logoText:    '🏗️ JobPac',   // the big name at the top of the pop-up
    logoSize:    52,
    signingIn:   'Signing you in...',
    loadingTime: 1.0,   // seconds of "Signing you in..." before each result
    // One error per failed attempt. Add or remove lines to change how many times it fails.
    errors: [
      'Session expired. Please sign in again.',
      "Invalid password. (You didn't type one.)"
    ],
    retryText:    'Retry',
    progressText: 'Onboarding your hero...',
    // The progress bar: [seconds, percent]. It stalls at 4% on purpose.
    progress: [ [0, 0], [0.6, 3], [1.4, 4], [2.4, 4], [2.8, 97], [3.4, 100] ],
    doneText:     'Success! (This time.)',
    doneHold:     0.8   // seconds "Success!" stays on screen
  },

  // ---------- GARETH ----------
  gareth: {
    emoji:      '🧑‍💼',
    name:       'Gareth',
    role:       'CFO',
    hint:       'Click Gareth to deliver it!',
    resultHold: 3.0,   // seconds his reply stays on screen
    visits: [
      {
        says:        "I need the iPhone 19. Apple hasn't announced it yet. I need it NOW.",
        patience:    2.5,   // seconds you have to click him
        bonus:       25,    // coins for delivering in time
        successLine: 'Delivered before release. Gareth: "Why so slow?"',
        leftLine:    "Gareth has left. He's emailing your manager."
      },
      {
        says:        "Where's my iPhone 20? I asked for it tomorrow.",
        patience:    0,     // zero on purpose - he arrives already out of patience
        bonus:       0,
        successLine: '',
        leftLine:    'Gareth left before he arrived. Patience: 0 seconds.'
      }
    ]
  },

  // ---------- HRIS CRASHES ----------
  hris: {
    title:      '⚠  HRIS IS DOWN  ⚠',
    subtitle:   'Payroll, finance and everything else went down with it.',
    lynnEmoji:  '👩‍💼',
    lynnName:   'Lynn',
    lynnRole:   'Finance Controller',
    buttonText: 'Promise to rebuild HRIS',
    // {n} is replaced by the promise number, {eta} by the crash's ETA.
    resultText: 'Promise #{n} made to Lynn.  Rebuild ETA: {eta}',
    resultHold: 2.0,   // seconds the result stays before the game carries on
    crashes: [
      { lynnSays: 'HRIS is down. Payroll is down. My spreadsheet is down. When are you rebuilding it?', eta: 'Q3',        extra: '' },
      { lynnSays: 'Down AGAIN? You promised me a rebuild!',                                         eta: 'next year', extra: '' },
      { lynnSays: "I'm not even surprised any more.",                                               eta: '2031',      extra: 'Even Agent Andy has stopped working.' }
    ]
  },

  // ---------- THE GREAT OUTAGE (the ending) ----------
  outage: {
    // Each line appears "at" this many seconds into the outage.
    lines: [
      { at: 0.0, text: '⚠  HRIS: DOWN' },
      { at: 1.2, text: '⚠  JobPac: DOWN' },
      { at: 2.4, text: '🤖  Agent Andy: "Error: I also depend on HRIS."' },
      { at: 3.6, text: '💡  Lights: OUT' }
    ],
    darkAt:          3.6,   // when the screen goes dark
    buttonAppearsAt: 4.8,   // when the last "Promise" button appears
    buttonText:      'Promise to rebuild HRIS',
    lynnSays:        "I've heard that before.",
    buttonFallTime:  1.2,   // seconds for the button to fall away
    endDelay:        3.5    // seconds after the promise before the end screen (lets the trombone finish)
  },

  // ---------- SAD TROMBONE ----------
  // Plays whenever something fails. Notes are pitches: bigger number = higher note.
  //   full  : HRIS crashes and the ending
  //   quick : smaller failures - JobPac errors, Gareth storming off
  sadTrombone: {
    full: {
      notes:          [294, 277, 262, 247],   // D, C#, C, B - wah, wah, wah, wahhh
      noteLength:     0.5,                    // seconds per "wah"
      lastNoteLength: 1.6,                    // the long, wobbly final "wahhh"
      volume:         0.2
    },
    quick: {
      notes:          [294, 277, 262, 247],
      noteLength:     0.18,
      lastNoteLength: 0.7,
      volume:         0.15
    }
  },

  // ---------- END SCREEN ----------
  endScreen: {
    title:         '💥  THE GREAT OUTAGE  💥',
    scoreLabel:    'Final score',
    promisesLabel: 'Promises made to Lynn',
    etaLine:       'HRIS rebuild ETA: TBC',
    replayHint:    'Press SPACE to play again',
    replayDelay:   1.5   // seconds before SPACE works (stops accidental restarts)
  },

  // ---------- EFFECTS ----------
  effects: {
    shakeTime:     0.4,   // seconds the screen shakes when something crashes
    shakeStrength: 10,    // how far it shakes
    floatTime:     0.8,   // seconds the "+1" coins float after a click
    floatSpeed:    90,    // how fast they float upwards
    buttonSpin:    2.5    // how much the last promise button spins as it falls
  },

  // ---------- HIGH SCORE ----------
  highScore: {
    storageKey:  'askAdcoSushiBarBest',   // name it's saved under in the browser
    label:       'Best score',
    newBestText: '🏆 New best score!'
  },

  // ---------- DEMO SAFETY NET ----------
  // Press this key during the game for free coins if you fall behind.
  demo: {
    secretKey:   'KeyM',
    secretCoins: 100
  },

  // ---------- WORDS ON THE MENU SCREEN ----------
  text: {
    title:      'Ask ADCO Sushi Bar',
    tagline:    'Retired superheroes. Fresh sushi. Unreliable systems.',
    startHint:  'Click or press SPACE to open for business',
    coinsLabel: 'coins',
    perSecondLabel: 'per second'
  }
};

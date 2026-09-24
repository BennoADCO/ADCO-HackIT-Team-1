// ================================================================
//  WIPE OUT - SETTINGS FILE
// ================================================================
//  This file holds every number and every word the game uses.
//  It is the safest file to change. Want the aliens faster? The
//  worker slower? A different joke on the menu? Change it here.
//
//  HOW TO EDIT SAFELY
//   - Change the value after the colon:   speed: 220,  ->  speed: 300,
//   - Keep the comma at the end of the line.
//   - Words go inside quote marks: 'like this'. Keep both quote marks.
//   - Lines starting with // are notes for humans. The game ignores them.
//   - After a change: save the file, then press F5 in the browser.
//
//  If the game shows an error box or a black screen after an edit,
//  press F12, click Console, copy the red line and paste it to Claude.
//  It is almost always a missing comma or a missing quote mark.
//
//  ABOUT CLOCK TIMES IN THIS FILE
//   Times of day are written as hours on the 24-hour clock, and .5
//   means half past. So 6.5 is 6:30 am, 9 is 9:00 am, 12 is midday,
//   13.5 is 1:30 pm, 15.5 is 3:30 pm and 24 is midnight.
//
//  ABOUT MONEY IN THIS FILE
//   The game only counts ciggies. Every 10 ciggies are SHOWN as one
//   energy drink. So 20 ciggies shows as 🥤 2, and 15 shows as 🥤 1 🚬 5.
// ================================================================

var CONFIG = {

  // ==============================================================
  //  THE WORKER (that's you)
  // ==============================================================
  worker: {
    emoji: '👷',
    size: 44,              // how big the worker is drawn, in pixels
    speed: 220,            // walking speed, in pixels per second
    startX: 450,           // where you start, across (0 = left edge, 900 = right edge)
    startY: 330,           // where you start, down (0 = top edge, 600 = bottom edge)
    hats: 3,               // hard hats you start with. They are your lives.
    invincibleTime: 1.5,   // seconds of flashing safety after losing a hat
    flashesPerSecond: 8    // how fast you blink while you're safe
  },

  // ==============================================================
  //  TOILET PAPER (your ammo)
  // ==============================================================
  tp: {
    emoji: '🧻',
    stash: 20,                  // rolls you start with, and the most you can carry
    ply: 1,                     // wraps each hit adds to an alien (1-ply = 1 wrap)
    throwInterval: 0.5,         // seconds between throws when you hold Space
    fastestThrowInterval: 0.15, // upgrades can never make throwing quicker than this
    rollSpeed: 900,             // how fast a thrown roll flies, pixels per second
    rollSize: 26,               // how big a flying roll is drawn, in pixels
    spinSpeed: 14,              // how fast a flying roll spins (bigger = faster)
    offScreenMargin: 40         // a missed roll is gone once it's this many pixels past the edge
  },

  // ==============================================================
  //  WRAPPING (the white TP bands that appear on a hit alien)
  // ==============================================================
  wrapping: {
    bands: 5,                   // how many white bands a fully wrapped alien shows.
                                //   Keep this at least as big as the Chonker's wraps (5),
                                //   so every hit on a Chonker adds a band you can see.
    bandWidth: 0.95,            // band width, as a share of the alien's size (1 = full width)
    bandThickness: 0.13,        // band thickness, as a share of the alien's size
    bandSpread: 0.6,            // how much of the alien's height the bands cover (1 = all of it)
    bandTilt: 0.15,             // how wonky the bands sit (0 = perfectly straight)
    caughtFlashTime: 0.35,      // seconds a fully wrapped alien flashes before it vanishes
    caughtFlashesPerSecond: 12  // how fast it flashes
  },

  // ==============================================================
  //  ALIENS
  // ==============================================================
  //  One row per kind of alien. What each setting means:
  //    emoji      - what it looks like
  //    size       - how big it's drawn, in pixels
  //    wraps      - wraps of TP needed to catch it
  //    speed      - walking speed at 6:30 am, in pixels per second
  //    ciggies    - 🚬 you earn for catching it (traps pay double)
  //    dropChance - chance it drops TP when caught (0.08 = 8%, 1 = always)
  //    dropMin    - fewest rolls a drop can hold
  //    dropMax    - most rolls a drop can hold
  //    arrivesAt  - clock time it starts turning up (see the note at the top)
  //    weight     - how often it turns up compared with the others (bigger = more common).
  //                 Decimals are fine: 1.5 turns up half as often again as 1.
  //
  //  Optional extras (leave them out and the alien acts normally):
  //    maxAtOnce  - never more than this many of this kind walking about at once
  //    hurts      - false means touching it does NOT knock your hard hat off
  //    steals     - true means it ignores you and runs for TP on the ground
  //                 instead (see THE TP THIEF settings just below)
  //
  //  To take an alien out of the game, put // at the start of its line.
  aliens: {
    grunt:   { emoji: '👽', size: 40, wraps: 1, speed: 85,  ciggies: 1, dropChance: 0.20, dropMin: 1, dropMax: 1, arrivesAt: 6.5,  weight: 10 },
    zoomer:  { emoji: '👾', size: 38, wraps: 1, speed: 150, ciggies: 2, dropChance: 0.20, dropMin: 1, dropMax: 1, arrivesAt: 9,    weight: 3 },
    chonker: { emoji: '🐙', size: 60, wraps: 5, speed: 40,  ciggies: 5, dropChance: 0.75, dropMin: 1, dropMax: 3, arrivesAt: 12,   weight: 1.5 },
    thief:   { emoji: '🦑', size: 44, wraps: 2, speed: 110, ciggies: 3, dropChance: 0.35, dropMin: 1, dropMax: 1, arrivesAt: 15.5, weight: 1,
               maxAtOnce: 2, hurts: false, steals: true }
  },

  // ==============================================================
  //  THE TP THIEF 🦑 (the alien with steals: true, above)
  // ==============================================================
  //  It ignores you and runs for the nearest pickup on the ground (TP
  //  or a supply crate) and eats it. Wrap it up, or trap it, and it
  //  coughs everything it ate back up around where it was caught.
  thief: {
    wanderRadius: 140,        // with nothing to steal, it loiters within this many pixels of the middle of the site
    wanderSpeedShare: 0.5,    // loitering speed, as a share of its normal speed (0.5 = half speed)
    wanderArriveDistance: 12, // how close to its loitering spot counts as "got there" before it picks a new one, in pixels
    coughUpSpread: 55,        // coughed-up pickups land this many pixels from where it was caught
    coughUpLifetime: 10,      // seconds a coughed-up pickup stays on the ground
    labelSize: 15,            // size of the "🧻 3" it shows over its head while carrying loot
    labelGap: 6               // gap between the top of the thief and that label, in pixels
  },

  // How the aliens behave as a crowd
  alienCrowd: {
    personalSpace: 0.7,    // aliens push apart when closer than this share of their size (0 = never push)
    pushSpeed: 60,         // how hard they push apart, pixels per second (0 = switch pushing off)
    bobHeight: 2,          // how far they bob up and down as they walk, in pixels
    bobSpeed: 8            // how fast they bob
  },

  // ==============================================================
  //  HOW HARD IT GETS
  //  Aliens arrive more often, and walk faster, as the clock runs.
  // ==============================================================
  difficulty: {
    spawnIntervalStart: 1.2,    // seconds between new aliens at 6:30 am
    spawnIntervalEnd: 0.15,     // seconds between new aliens at midnight
    speedMultiplierStart: 1.0,  // alien speed is multiplied by this at 6:30 am
    speedMultiplierEnd: 1.5,    // ... and by this at midnight (1.5 = 50% faster)
    curve: 1.0,                 // shape of the ramp: 1 = steady climb,
                                //   2 = stays easy for longer then gets brutal at the end,
                                //   0.5 = gets hard early
    firstAlienAfter: 0.5,       // seconds before the very first alien arrives
    maxAliens: 150,             // never more than this many aliens at once (keeps the laptop happy)
    safeSpawnDistance: 200,     // new aliens try not to appear closer to you than this, in pixels
    spawnOutside: 6             // how far past the screen edge new aliens appear, in pixels
  },

  // ==============================================================
  //  THE SHIFT (the clock, and the bonuses along the way)
  // ==============================================================
  shift: {
    runLength: 420,        // real seconds from 6:30 am to midnight (420 = 7 minutes).
                           // The clock speed is worked out from this: 17.5 hours
                           // squeezed into 420 seconds = 2.5 clock-minutes a second.
    startAt: 6.5,          // clock time a shift starts (6:30 am)
    endAt: 24,             // clock time you win (midnight)
    midnightBonus: 200,    // 🚬 for making it to midnight (200 = 🥤 20)

    // Clock bonuses. Each shows a banner and pays out, then the aliens keep coming.
    //   at       - clock time it happens (see the note at the top)
    //   title    - the big banner words
    //   subtitle - smaller words under it ('' for none)
    //   ciggies  - how many 🚬 it pays (20 = 🥤 2)
    // (The knock-off line uses "double quotes" because its words contain an apostrophe.)
    events: [
      { at: 10.5, title: 'SMOKO!',     subtitle: '',                                          ciggies: 20 },
      { at: 13.5, title: 'SMOKO!',     subtitle: '',                                          ciggies: 20 },
      { at: 15.5, title: 'KNOCK-OFF…', subtitle: "nobody's coming to relieve you. OVERTIME!", ciggies: 50 }
    ]
  },

  // ==============================================================
  //  PICKUPS (TP lying on the ground after an alien drops it)
  // ==============================================================
  pickups: {
    size: 30,              // how big a pickup is drawn, in pixels
    lifetime: 10,          // seconds before it vanishes
    blinkTime: 3,          // it blinks for this many seconds before it vanishes
    blinksPerSecond: 5,    // how fast it blinks
    labelSize: 16          // size of the "x3" number on a pickup holding more than one roll
  },

  // ==============================================================
  //  TRAPS (wet concrete, open trenches, spare portaloos)
  // ==============================================================
  //  Every so often a trap appears somewhere on the site. Any alien
  //  that touches one is caught and pays double. Traps never hurt you.
  //  One countdown runs for ALL traps. When it runs out, the game picks
  //  a kind at random from the kinds that have turned up by now and
  //  aren't already at their limit. Bigger weight = picked more often.
  //  To switch a kind of trap off, set its weight to 0.
  traps: {
    catchMultiplier: 2,    // trap catches pay this many times the normal ciggies
    safeDistance: 150,     // traps never appear closer to you than this, in pixels
    firstAfter: 20,        // seconds into the shift before the first trap appears
    everyMin: 15,          // shortest wait between new traps, in seconds
    everyMax: 25,          // longest wait between new traps, in seconds
    outOfTpWait: 0.5,      // while you're out of TP, the wait for the next trap is multiplied by this (0.5 = half)
    retryAfter: 1,         // no room for a trap right now? try again after this many seconds
    spotTries: 30,         // how many random spots to try when placing a trap
    edgeGap: 12,           // traps stay at least this far from the screen edges and from each other, in pixels
    sinkTime: 0.8,         // seconds a trapped alien takes to sink out of sight
    sinkSlide: 6,          // how quickly a trapped alien slides into its trap (bigger = snappier)
    appearTime: 0.4,       // seconds a new trap takes to fade in
    blinkTime: 3,          // a trap blinks for this many seconds before it goes
    blinksPerSecond: 3,    // how fast it blinks
    blinkFaintness: 0.35,  // how see-through it gets on each blink (0 = vanishes, 1 = no blink)
    labelSize: 13,         // size of the words painted on a trap
    countSize: 18,         // size of the "2/4" count under a trench or portaloo

    //  Every kind of trap has these settings:
    //    weight        - how often this kind is picked compared with the others
    //    arrivesAt     - clock time it starts turning up (6.5 = 6:30 am, 12 = midday)
    //    lifetime      - seconds it stays before it goes
    //    maxOnScreen   - never more than this many of this kind at once
    //    width, height - its size, in pixels

    // Wet concrete: a grey slab. Every alien that walks in sinks.
    concrete: {
      weight: 3, arrivesAt: 6.5, lifetime: 12, maxOnScreen: 2,
      width: 140, height: 90,
      label: 'WET CONCRETE',     // words on the slab ('' for none)
      footprints: 6,             // boot prints left by some clown who walked through it
      footprintSize: 9,          // in pixels
      sheenSpeed: 0.35,          // how fast the wet shine slides across (passes per second)
      formworkSize: 5,           // thickness of the timber edge round the slab, in pixels
      color: '#a3a19b',
      formworkColor: '#b9874a',
      sheenColor: 'rgba(255, 255, 255, 0.22)',
      footprintColor: 'rgba(70, 70, 66, 0.45)',
      rippleColor: 'rgba(60, 60, 58, 0.7)',
      labelColor: 'rgba(55, 55, 52, 0.6)'
    },

    // Open trench: a dark hole. Swallows a few aliens, then gets backfilled.
    trench: {
      weight: 2, arrivesAt: 8.5, lifetime: 12, maxOnScreen: 1,
      width: 150, height: 56,
      holds: 3,                  // aliens it swallows before it's full
      closeTime: 0.8,            // seconds it takes to fill back in with dirt once it's full
      lipSize: 6,                // loose dirt round the edge, in pixels
      lipColor: '#5e452c',
      holeColor: '#2b1f14',
      deepColor: '#140e08',
      backfillColor: '#7a5c3c'
    },

    // Spare portaloo: drags nearby aliens in and slams the door on them.
    portaloo: {
      weight: 1, arrivesAt: 10, lifetime: 15, maxOnScreen: 1,
      width: 64, height: 96,
      holds: 4,                  // aliens it holds before it's full
      closeTime: 0.8,            // seconds it takes to fade away once it's full
      catchRadius: 30,           // aliens this close to its middle get sucked in, in pixels
      pullRadius: 150,           // aliens inside this circle get dragged towards it, in pixels
      pullSpeed: 70,             // how hard it drags them, in pixels per second
      slamTime: 0.4,             // seconds the door stays shut after a SLAM
      shakeSize: 2,              // how far it rattles when the door slams, in pixels
      shakeSpeed: 60,            // how fast it rattles
      ringSpeed: 0.6,            // how fast the "suck" rings close in (rings per second)
      emoji: '🚽',
      slamText: 'SLAM!',
      slamTextSize: 22,
      bodyColor: '#2f7fd1',
      roofColor: '#1d5a9c',
      doorColor: '#4b98e6',
      insideColor: '#0f1b27',
      vacantColor: '#5fe36a',    // the little light over the door while it's open...
      engagedColor: '#ff4a3d',   // ... and while it's shut
      pullColor: 'rgba(160, 220, 255, 0.28)'
    }
  },

  // ==============================================================
  //  SUPPLY CRATE 📦 (walk over it: TP refilled to your full stash)
  // ==============================================================
  crate: {
    emoji: '📦',
    size: 36,              // how big it's drawn, in pixels
    everyMin: 45,          // shortest wait between crates, in seconds
    everyMax: 75,          // longest wait between crates, in seconds
    lifetime: 10,          // seconds a crate stays on the ground (it blinks at the end, like dropped TP)
    awayFromYou: 200,      // crates try to land at least this far from you, so you have to go and get one
    edgeGap: 30,           // crates land at least this far from the screen edges, in pixels
    pulseSize: 0.1,        // how much it swells and shrinks to catch your eye (0.1 = 10%)
    pulseSpeed: 5,         // how fast it swells
    glowColor: 'rgba(255, 214, 90, 0.38)'
  },

  // ==============================================================
  //  MONEY
  // ==============================================================
  currency: {
    ciggiesPerDrink: 10,   // this many 🚬 show as one 🥤
    ciggieEmoji: '🚬',
    drinkEmoji: '🥤'
  },

  // ==============================================================
  //  UPGRADES (bought in the site shed between shifts)
  // ==============================================================
  //  Don't change the id words - the game looks upgrades up by them.
  //    id       - the upgrade's name inside the game
  //    emoji    - its picture in the shop
  //    name     - what the shop calls it
  //    about    - what it does, in words
  //    perLevel - how much each level adds
  //    maxLevel - how many levels you can buy
  //    baseCost - ciggies for level 1. Level 2 costs twice that, level 3 three times, and so on.
  upgrades: [
    { id: 'stash',      emoji: '🧻', name: 'Bigger TP stash',  about: '+5 rolls to start with and to carry', perLevel: 5,     maxLevel: 10, baseCost: 25 },
    { id: 'hats',       emoji: '⛑️', name: 'Extra hard hat',   about: '+1 hard hat',                          perLevel: 1,     maxLevel: 3,  baseCost: 60 },
    { id: 'speed',      emoji: '🥾', name: 'Steel-cap sprint', about: '+10% move speed',                      perLevel: 0.10,  maxLevel: 5,  baseCost: 30 },
    { id: 'ply',        emoji: '🧻', name: 'Ply',              about: '+1 wrap per hit',                      perLevel: 1,     maxLevel: 4,  baseCost: 40 },   // capped at 5-ply: the toughest alien (Chonker) only needs 5 wraps
    // Throw speed takes time OFF between throws, so its perLevel has a minus sign.
    { id: 'throwSpeed', emoji: '💪', name: 'Throw speed',      about: '0.05 s less between throws',           perLevel: -0.05, maxLevel: 7,  baseCost: 30 }
  ],

  // ==============================================================
  //  SITE SHED (the shop screen between shifts)
  //  Sizes and positions are in pixels. The words are further down,
  //  in WORDS ON SCREEN.
  // ==============================================================
  shop: {
    saveKey: 'wipeout-save',  // the name your progress is saved under in the browser.
                              // Change it and everyone starts fresh.
    titleY: 48,               // how far down the "SITE SHED" title sits
    titleSize: 54,
    titleEmoji: '🧰',         // drawn either side of the title
    walletY: 104,             // the "In your pocket" line
    walletSize: 26,
    walletWidth: 420,         // size of the box behind it
    walletHeight: 42,
    listX: 60,                // gap between the screen edges and the upgrade rows
    listY: 140,               // where the top row starts, down
    rowHeight: 62,
    rowGap: 8,                // space between one row and the next
    rowCorner: 10,            // how rounded the box corners are
    emojiSize: 38,
    nameSize: 23,
    aboutSize: 17,
    levelX: 430,              // where the level squares start, across from the row's left edge
    levelSize: 14,
    pipSize: 12,              // size of each little level square
    pipGap: 4,                // gap between level squares
    costMargin: 20,           // gap between the price and the row's right edge
    costLabelSize: 14,
    costSize: 24,
    messageY: 512,            // the "Bought!" / "Not enough!" line
    messageSize: 22,
    messageTime: 2.0,         // seconds that line stays up
    messageFadeTime: 0.4,     // seconds it takes to fade away at the end
    shakeTime: 0.3,           // seconds a row shakes when you can't buy it
    shakeSize: 6,             // how far it shakes
    shakeSpeed: 60,           // how fast it shakes
    stripeGap: 36,            // width of the stripes on the shed wall behind everything
    controlsY: 548,
    controlsSize: 20,
    hintY: 580,               // the "saves automatically" line in the shed
    hintSize: 16,
    menuHintY: 576,           // the same line on the menu screen
    wipeEmoji: '🚽',          // shown on the "wipe everything?" box
    confirmWidth: 720,        // size of the "wipe everything?" box
    confirmHeight: 260,
    confirmEmojiSize: 56,
    confirmTitleSize: 40,
    confirmTextSize: 20,
    colors: {
      backdrop: 'rgba(28, 22, 16, 0.88)',       // darkens the site behind the shed
      wallStripe: 'rgba(255, 255, 255, 0.035)', // faint tin-shed stripes
      walletBox: 'rgba(0, 0, 0, 0.35)',
      row: 'rgba(255, 255, 255, 0.07)',
      rowSelected: 'rgba(255, 210, 63, 0.22)',
      rowEdge: '#ffd23f',                       // the edge and arrow on the chosen row
      canAfford: '#8cff66',                     // price colour when you have enough
      cantAfford: '#ff8a80',                    // price colour when you don't
      max: '#ffd23f',
      pipOn: '#ffd23f',
      pipOff: 'rgba(255, 255, 255, 0.18)',
      confirmDim: 'rgba(0, 0, 0, 0.6)',
      confirmPanel: '#2b1b15'
    }
  },

  // ==============================================================
  //  COLLISIONS
  // ==============================================================
  hitboxScale: 0.75,       // things "touch" when they overlap this share of their drawn size.
                           // Under 1 makes near-misses count as misses, which feels fair.

  // ==============================================================
  //  THE SITE (the ground and the decoration on it)
  // ==============================================================
  site: {
    groundColor: '#8a6a47',   // dirt
    patchColor: '#7a5c3c',    // darker dirt patches
    patchCount: 26,
    patchMinSize: 30,         // in pixels
    patchMaxSize: 110,
    pebbleColor: '#a88c69',   // little stones
    pebbleCount: 150,
    pebbleMinSize: 2,         // in pixels
    pebbleMaxSize: 5,

    // Decoration only - nothing here blocks you or the aliens.
    // x = pixels from the left edge, y = pixels down from the top edge.
    scenery: [
      { emoji: '🏗️', x: 110, y: 150, size: 110 },
      { emoji: '🚧', x: 690, y: 105, size: 40 },
      { emoji: '🚧', x: 735, y: 105, size: 40 },
      { emoji: '🚧', x: 780, y: 105, size: 40 },
      { emoji: '🧱', x: 180, y: 500, size: 40 },
      { emoji: '🧱', x: 215, y: 512, size: 40 },
      { emoji: '🧱', x: 197, y: 478, size: 40 },
      { emoji: '🚽', x: 505, y: 318, size: 46 },
      { emoji: '🚧', x: 790, y: 480, size: 40 },
      { emoji: '🧱', x: 640, y: 540, size: 36 }
    ]
  },

  // ==============================================================
  //  THE TOP BAR (hard hats, TP, money, clock)
  // ==============================================================
  hud: {
    height: 44,                   // height of the bar, in pixels
    textSize: 22,
    hatsX: 24,                    // where the first hard hat sits, across
    hatSize: 26,
    hatSpacing: 30,               // gap from one hat to the next
    tpX: 215,                     // where the TP count starts, across
    moneyX: 330,                  // where the 🥤/🚬 count starts, across
    clockMargin: 18,              // gap between the clock and the right edge
    warningFlashesPerSecond: 3,   // how fast the TP count flashes red when you're out
    warningSize: 22               // size of the "OUT OF TP" message
  },

  // ==============================================================
  //  BANNERS (big messages like "SMOKO!")
  // ==============================================================
  banner: {
    duration: 3,           // seconds a banner stays up
    fadeTime: 0.4,         // seconds it takes to fade in and out
    y: 120,                // how far down the screen the banner starts, in pixels
    padding: 18,           // empty space above and below the words, in pixels
    titleSize: 54,
    subtitleSize: 24,
    extraSize: 28          // size of the payout line, e.g. "+ 🥤 2"
  },

  // ==============================================================
  //  SCREENS (menu, shift over, shop)
  // ==============================================================
  screens: {
    overInputDelay: 1.0,        // seconds the shift-over screen ignores Space, so you can't skip it by accident
    shopInputDelay: 0.5,        // seconds the site shed ignores keys, so mashing Space doesn't buy something by accident
    promptBlinksPerSecond: 1.5  // how fast "Press Space..." blinks
  },

  // Text sizes, in pixels
  textSizes: {
    title: 88,
    heading: 60,
    big: 30,
    normal: 22
  },

  // ==============================================================
  //  COLOURS
  //  Written as web colour codes (#rrggbb), or rgba(red, green, blue, see-through)
  //  where the last number runs from 0 (invisible) to 1 (solid).
  // ==============================================================
  colors: {
    text: '#ffffff',
    dimText: '#e2d8c8',
    outline: '#1b1410',
    title: '#ffd23f',
    win: '#8cff66',
    lose: '#ff5a4f',
    overlay: 'rgba(15, 10, 5, 0.72)',
    hudBar: 'rgba(20, 16, 12, 0.78)',
    warning: '#ff4a3d',
    hat: '#ffc61a',
    hatRidge: '#e0a200',
    hatLost: 'rgba(255, 255, 255, 0.16)',
    tpBand: '#ffffff',
    tpBandEdge: '#c8c8c8',
    pickupGlow: 'rgba(255, 255, 255, 0.28)',
    bannerPanel: 'rgba(0, 0, 0, 0.55)',
    bannerTitle: '#ffd23f',
    bannerText: '#ffffff'
  },

  // ==============================================================
  //  FONTS
  //  These are fonts already on the computer - nothing is downloaded.
  // ==============================================================
  fonts: {
    title: '"Arial Black", Impact, Arial, sans-serif',
    text: 'Arial, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
    emoji: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
  },

  // ==============================================================
  //  PIXEL-ART PICTURES
  // ==============================================================
  //  The worker, the aliens, the TP and the rest are drawn as little
  //  pixel-art pictures, typed out as letters in js/sprites.js (that
  //  file explains how to edit them). Anything without a picture in
  //  there is still drawn as its normal emoji.
  art: {
    useSprites: true       // false = ignore the pixel art and draw the plain emoji everywhere
  },

  // ==============================================================
  //  WORDS ON SCREEN
  // ==============================================================
  text: {
    title: 'WIPE OUT',
    tagline: 'One worker. One portaloo. Not nearly enough toilet paper.',
    story: 'Survive until midnight',
    menuCast: ['👷', '🧻', '👽'],   // the little line-up of emoji on the menu
    // (The third line uses "double quotes" because its words contain an apostrophe.)
    controls: [
      'Arrow keys: move',
      'Space: throw toilet paper at the nearest alien (tap, or hold)',
      "Wrap them up. Don't let them knock your hard hat off.",
      'Walk over 🧻 and 📦 to reload. Out of TP? Lure them into traps!'
    ],
    pressStart: 'Press Space to start',
    outOfTp: 'OUT OF TP: use the traps!',
    loseHeading: 'OVERWHELMED',
    winHeading: 'MIDNIGHT! YOU MADE IT',
    reachedLabel: 'Clock reached: ',
    caughtLabel: 'Aliens caught: ',
    earnedLabel: 'Earned this shift: ',
    toShop: 'Press Space to go to the site shed',
    shopTitle: 'SITE SHED',
    walletLabel: 'In your pocket: ',
    // Site shed words. Some are joined together, e.g. shopBought + the
    // upgrade's name + shopNowLevel + the level gives "Bought: Ply, now level 3".
    shopControls: '↑ ↓  choose        Space  buy        Enter  start next shift',
    shopLevelLabel: 'LEVEL ',
    shopCostLabel: 'NEXT LEVEL',
    shopMax: 'MAX',
    shopBought: 'Bought: ',
    shopNowLevel: ', now level ',
    shopCantAfford: 'Not enough! You need ',
    shopCantAffordEnd: ' more',
    shopMaxed: "That one's fully upgraded!",
    saveHint: 'Your 🥤 🚬 and upgrades save automatically on this computer',
    saveBlocked: "This browser won't save: progress lasts until you close the tab",
    wipeHint: 'R: wipe all progress',
    wipeTitle: 'WIPE ALL PROGRESS?',
    wipeWarning: 'Every upgrade and every 🥤 🚬 goes down the dunny.',
    wipePrompt: 'Press Y to wipe ALL progress, any other key to cancel',
    wiped: 'All progress wiped. Fresh start for the next worker!',
    wipeCancelled: 'Wipe cancelled. Nothing was lost.',
    am: 'am',
    pm: 'pm'
  },

  // ==============================================================
  //  JUICE (little extras that make hits feel good - just for show)
  // ==============================================================
  juice: {
    // Screen shake when an alien knocks your hard hat off
    shakeTime: 0.35,          // seconds the site shakes
    shakeStrength: 10,        // how far it jolts, in pixels (0 = no shake)

    // TP streamer flying out behind each thrown roll
    trailLife: 0.25,          // seconds each bit of streamer lasts (bigger = longer streamer)
    trailWidth: 7,            // how thick the streamer is right behind the roll, in pixels
    trailWiggle: 5,           // how far the tail flutters side to side, in pixels
    trailWiggleSpeed: 30,     // how fast it flutters
    trailColor: '#ffffff',

    // Hit flash: an alien glows white for a moment when a roll lands on it
    hitFlashTime: 0.12,       // seconds it glows
    hitFlashStrength: 0.85,   // how white it goes (0 = not at all, 1 = pure white)
    hitFlashColor: '#ffffff',

    // Burst of little TP squares when an alien is caught
    burstCount: 14,           // squares per catch
    burstSpeedMin: 80,        // slowest a square flies, pixels per second
    burstSpeedMax: 240,       // fastest a square flies
    burstSizeMin: 4,          // smallest square, in pixels
    burstSizeMax: 9,          // biggest square, in pixels
    burstLife: 0.6,           // seconds a square lasts before it has faded away
    burstSlowDown: 3,         // how quickly the squares slow down (0 = they never slow)
    burstSpin: 10,            // how fast the squares tumble
    burstColors: ['#ffffff', '#f3efe4', '#d9d9d9'],   // the squares pick one of these at random
    maxParticles: 300,        // never more than this many squares at once (keeps the laptop happy)

    emptyClickGap: 0.35       // seconds between "click" sounds while you press Space with no TP
  },

  // ==============================================================
  //  NIGHT (the site gets dark after 6 pm)
  // ==============================================================
  night: {
    startsAt: 18,             // clock time it starts getting dark (18 = 6 pm)
    fullDarkAt: 21,           // clock time it's as dark as it gets (21 = 9 pm). It stays that dark till midnight.
    color: '#07103a',         // the colour of the dark (deep night blue)
    darkness: 0.6,            // how dark it gets: 0 = not at all, 1 = pitch black. Keep it under 0.75 so you can still see.
    workerLight: 170,         // how far your head-torch reaches, in pixels (the soft light circle round you)
    workerLightStrength: 1,   // how bright your light is (1 = no darkness at all right next to you, 0 = no light)
    lightColor: '#ffe7a8',    // the warm colour of the lights
    lightGlow: 0.12,          // how strong the warm tint is inside the lights (0 = none)

    // Site floodlights: patches that stay a bit lit up. Add or remove rows as you like.
    //   x, y     - where the light is (pixels from the left, pixels down from the top)
    //   radius   - how far it reaches, in pixels
    //   strength - how bright it is (0 = off, 1 = as bright as your head-torch)
    floodlights: [
      { x: 130, y: 175, radius: 190, strength: 0.55 },   // by the crane
      { x: 770, y: 470, radius: 160, strength: 0.45 }    // by the barriers, bottom right
    ]
  },

  // ================================================================
  //  SOUND
  // ================================================================
  sound: {
    volume: 0.4,             // 0 = silent, 1 = full blast
    muted: false,            // true = turn every sound off (the ambience too)
    minGapMs: 40,            // the same sound will not replay faster than this (in thousandths of a second)

    // Variety: each time a sound plays it comes out a tiny bit higher or
    // lower, so it never sounds like a stuck record. 0.07 = up to 7% either way.
    pitchShift: 0.07,                        // most sound effects
    pitchShiftSteady: 0.025,                 // the tunes below - kept small so they stay recognisable
    steadySounds: ['siren', 'bell', 'over'],

    // Sounds that fire over and over also change a touch in length and
    // loudness. 0.1 = up to 10% longer or shorter, louder or quieter.
    lengthShift: 0.1,
    loudShift: 0.15,
    rapidSounds: ['throw', 'splat', 'catch', 'pickup', 'move', 'empty'],

    // Background ambience: quiet building-site noise that plays under
    // everything - wind, distant traffic, the odd truck beep, machine hum
    // and alien warble. It gets eerier after dark.
    // Loudness settings: 0 = none, 1 = normal, 2 = double.
    ambience: {
      on: true,              // false = no background noise at all
      volume: 0.15,          // 0 = silent, 1 = loud. Keep it low so it sits under the sound effects
      wind: 1,               // the wind
      traffic: 1,            // the low rumble of distant traffic
      gustSeconds: 11,       // roughly how many seconds between wind gusts
      beeps: 1,              // a far-off truck reversing (beep... beep...)
      beepGapMin: 15,        // it happens every 15 to 40 seconds
      beepGapMax: 40,
      hum: 1,                // a distant machine humming into life
      humGapMin: 20,         // every 20 to 50 seconds
      humGapMax: 50,
      alien: 1,              // a faint alien warble
      alienGapMin: 25,       // every 25 to 60 seconds (up to twice as often after dark)
      alienGapMax: 60,
      nightSpooky: 1         // how much eerier it gets after dark (0 = not at all, 1 = fully)
    }
  }
};

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
    startWith: 0,          // rolls in your pockets when a run starts (the tutorial gives you one)
    stash: 20,             // the most you can carry at once
    ply: 1,                // wraps each hit adds to an alien (1-ply = 1 wrap)
    throwInterval: 0.5,    // seconds between throws when you hold Space
    rollSpeed: 900,        // how fast a thrown roll flies, pixels per second
    rollSize: 26,          // how big a flying roll is drawn, in pixels
    spinSpeed: 14,         // how fast a flying roll spins (bigger = faster)
    offScreenMargin: 40    // a missed roll is gone once it's this many pixels past the edge
  },

  // ==============================================================
  //  WRAPPING (the white TP bands that appear on a hit alien)
  // ==============================================================
  wrapping: {
    bands: 5,                   // how many white bands a fully wrapped alien shows
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
  //    speed      - walking speed, in pixels per second
  //    dropChance - chance it drops TP when caught (0.2 = 20%, 1 = always)
  //    dropMin    - fewest rolls a drop can hold
  //    dropMax    - most rolls a drop can hold
  //    weight     - how often it turns up compared with the others (bigger = more common).
  //                 Decimals are fine: 1.5 turns up half as often again as 1.
  //
  //  To add another kind, copy the grunt line, give it a new name at the
  //  front, and change its numbers. To take one out, put // at the start
  //  of its line.
  aliens: {
    grunt: { emoji: '👽', size: 40, wraps: 1, speed: 85, dropChance: 0.20, dropMin: 1, dropMax: 1, weight: 10 }
  },

  // How the aliens behave as a crowd
  alienCrowd: {
    personalSpace: 0.7,    // aliens push apart when closer than this share of their size (0 = never push)
    pushSpeed: 60,         // how hard they push apart, pixels per second (0 = switch pushing off)
    bobHeight: 2,          // how far they bob up and down as they walk, in pixels
    bobSpeed: 8            // how fast they bob
  },

  // ==============================================================
  //  ALIENS ARRIVING
  // ==============================================================
  spawning: {
    firstAlienAfter: 1.5,  // seconds before the very first alien arrives
    every: 2.0,            // seconds between new aliens after that
    maxAliens: 40,         // never more than this many aliens at once (keeps the laptop happy)
    safeSpawnDistance: 200, // new aliens try not to appear closer to you than this, in pixels
    spawnOutside: 6        // how far past the screen edge new aliens appear, in pixels
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
    // The crane has an "id" so the crane-collapse scene can find it and
    // take over the drawing of it. Don't rename that one.
    scenery: [
      { emoji: '🏗️', x: 110, y: 150, size: 110, id: 'crane' },
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
  //  THE TOP BAR (hard hats and TP)
  // ==============================================================
  hud: {
    height: 44,                   // height of the bar, in pixels
    textSize: 22,
    hatsX: 24,                    // where the first hard hat sits, across
    hatSize: 26,
    hatSpacing: 30,               // gap from one hat to the next
    tpX: 215,                     // where the TP count starts, across
    warningFlashesPerSecond: 3,   // how fast the TP count flashes red when you're out
    warningSize: 22               // size of the "OUT OF TP" message
  },

  // ==============================================================
  //  SCREENS (menu, game over)
  // ==============================================================
  screens: {
    overInputDelay: 1.0,        // seconds the game-over screen ignores Space, so you can't skip it by accident
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
    lose: '#ff5a4f',
    overlay: 'rgba(15, 10, 5, 0.72)',
    hudBar: 'rgba(20, 16, 12, 0.78)',
    warning: '#ff4a3d',
    hat: '#ffc61a',
    hatRidge: '#e0a200',
    hatLost: 'rgba(255, 255, 255, 0.16)',
    tpBand: '#ffffff',
    tpBandEdge: '#c8c8c8',
    pickupGlow: 'rgba(255, 255, 255, 0.28)'
  },

  // ==============================================================
  //  FONTS
  //  These are fonts already on the computer - nothing is downloaded.
  // ==============================================================
  fonts: {
    title: '"Arial Black", Impact, Arial, sans-serif',
    text: 'Arial, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
    emoji: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
    // The talking-box font. It gets drawn small and then blown up, which
    // is what makes it look chunky and pixelated.
    pixel: 'Consolas, "Courier New", monospace'
  },

  // ==============================================================
  //  PIXEL-ART PICTURES
  // ==============================================================
  //  The worker, the aliens and the TP are drawn as little pixel-art
  //  pictures, typed out as letters in js/sprites.js (that file explains
  //  how to edit them). Anything without a picture in there is still
  //  drawn as its normal emoji.
  art: {
    useSprites: true       // false = ignore the pixel art and draw the plain emoji everywhere
  },

  // ==============================================================
  //  WORDS ON SCREEN
  // ==============================================================
  text: {
    title: 'WIPE OUT',
    tagline: 'One worker. One portaloo. Not nearly enough toilet paper.',
    story: 'Wrap the aliens before they get you',
    menuCast: ['👷', '🧻', '👽'],   // the little line-up of emoji on the menu
    // (The third line uses "double quotes" because its words contain an apostrophe.)
    controls: [
      'Arrow keys: move',
      'Space: throw toilet paper at the nearest alien (tap, or hold)',
      "Wrap them up. Don't let them knock your hard hat off.",
      'Walk over 🧻 on the ground to pick it up.'
    ],
    pressStart: 'Press Space to start',
    outOfTp: 'OUT OF TP!',
    loseHeading: 'OVERWHELMED',
    caughtLabel: 'Aliens caught: ',
    playAgain: 'Press Space to try again',
    // Only shown if the browser refuses to open the second half of the
    // game by itself, which some locked-down ones do.
    cannotOpenNextPage: 'Open dating.html to carry on.'
  },

  // ==============================================================
  //  THE TALKING BOX (the chunky pixel dialog box at the bottom)
  // ==============================================================
  //  The words appear one letter at a time. Space skips to the end of
  //  the message, and Space again closes it.
  dialog: {
    width: 820,             // how wide the box is, in pixels
    height: 160,            // how tall it is
    bottomGap: 26,          // gap between the box and the bottom of the screen
    padX: 34,               // empty space inside the box, left and right
    padY: 30,               // empty space inside the box, top
    lineGap: 38,            // gap from one line of words to the next, in pixels.
                            // Keep it bigger than textSize, or lines touch.

    textSize: 26,           // how big the words end up on screen
    pixelScale: 3,          // words are drawn this many times smaller, then blown
                            // up again. Bigger = chunkier, blockier letters.
                            // 1 = smooth normal text, 3 = nice and pixelly.

    charsPerSecond: 45,     // how fast the words type themselves out
    typeSoundEvery: 3,      // play a tick every this many letters (0 = silent typing)
    typeSound: 'move',      // which sound the typing uses

    nameTag: 'THE FOREMAN', // the little name box above the words ('' for none)
    nameTagSize: 18,        // how big the name is on screen
    nameTagPadX: 14,        // empty space either side of the name
    nameTagHeight: 34,      // how tall the name box is
    nameTagX: 30,           // how far along the top of the box the name box sits

    borderSize: 5,          // thickness of the chunky pixel border, in pixels
    cornerNotch: 5,         // size of the little cut-off corners (0 = square corners)
    promptSize: 7,          // size of the blinking "press Space" arrow, in pixels
    promptMargin: 22,       // gap between that arrow and the box corner
    promptBlinksPerSecond: 2,

    colors: {
      outline: '#12100e',   // the near-black outer edge
      border: '#e8dcc0',    // the cream frame
      fill: '#231e18',      // the dark inside of the box
      text: '#f6efdf',      // the words
      nameText: '#231e18',  // the name, written on the cream name box
      prompt: '#ffd23f'     // the blinking arrow
    }
  },

  // ==============================================================
  //  CUT SCENES (the bits that play themselves)
  // ==============================================================
  //  During a cut scene the player cannot move or throw. It runs
  //  through its stages one after another, and every stage's length is
  //  in seconds, so you can make any part longer or shorter here.
  cutscene: {

    // ---- The crane coming down on your head ----
    crane: {
      // Stage 1: it shudders and groans, but stays up.
      creakTime: 1.8,
      shudderSize: 3,          // how far it rattles side to side, in pixels
      shudderSpeed: 26,        // how fast it rattles

      // Stage 2: it topples over onto you.
      fallTime: 1.0,
      fallAngle: 86,           // how far it swings over, in degrees (90 = flat on the ground)
      fallCurve: 2.2,          // 1 = falls at a steady rate, 2 or more = slow tip, then it goes

      // Stage 3: the impact.
      impactShake: 26,         // how hard the screen jolts, in pixels
      impactShakeTime: 0.9,    // how long it jolts for
      holdTime: 1.4,           // seconds looking at the wreckage before your eyes go

      // Stage 4: your eyes close.
      eyeTime: 3.4,            // seconds they take to shut
      eyeFlutter: 0.13,        // how much they fight to stay open on the way down
                               // (0 = a smooth close, 0.2 = a real struggle)
      eyeCurve: 110,           // how much the eyelids bow in the middle, in pixels
      eyeColor: '#000000',
      heartbeatAt: [0.15, 0.55, 0.85],   // how far through the close each heartbeat thumps

      // Stage 5: black.
      blackHold: 1.0,          // seconds of nothing before the next message

      // Dust thrown up by the impact
      dustCount: 26,
      dustColors: ['#c9b391', '#a88c69', '#8a6a47', '#ded0b6'],
      dustSpeedMin: 60,
      dustSpeedMax: 300,
      dustSizeMin: 5,
      dustSizeMax: 14,
      dustLife: 1.4,
      dustGravity: 120,        // how fast it falls back down, in pixels per second per second

      // Blood. Kept light on purpose - this is meant to be daft, not grim.
      bloodCount: 14,
      bloodColors: ['#b4202a', '#8e1720', '#d8353c'],
      bloodSpeedMin: 50,
      bloodSpeedMax: 190,
      bloodSizeMin: 3,
      bloodSizeMax: 7,
      bloodLife: 1.6,
      bloodGravity: 260,
      bloodPoolSize: 54,       // the little puddle left under the wreckage, in pixels (0 = none)
      bloodPoolColor: 'rgba(120, 22, 30, 0.75)',
      bloodPoolGrowTime: 1.2   // seconds it takes to spread to full size
    }
  },

  // ==============================================================
  //  THE TUTORIAL (the scripted opening)
  // ==============================================================
  //  The game runs down this list from top to bottom. Each line is one
  //  instruction. While the tutorial is running, NO aliens turn up on
  //  their own - the only ones that appear are the ones asked for here.
  //
  //  The five kinds of instruction:
  //
  //    { talk: ['line one', 'line two'] }
  //        Show a message in the talking box. The game waits until the
  //        player presses Space to close it, then carries on.
  //        Keep each line short enough to fit - they are NOT wrapped
  //        for you. Up to about 44 letters is safe, and three lines is
  //        the most that fits in the box.
  //
  //    { dropTP: { x: 620, y: 420, rolls: 1 } }
  //        Put a roll of toilet paper on the ground at that spot.
  //        x = pixels from the left, y = pixels down from the top.
  //        A roll dropped this way never times out - it waits for you.
  //
  //    { spawnAlien: { kind: 'grunt', from: 'right' } }
  //        Send one alien in. "from" can be 'left', 'right', 'top',
  //        'bottom', or leave it out for a random edge.
  //
  //    { waitFor: 'gotTP' }
  //        Hold here until something happens. The things it can wait for:
  //          'moved'     - the player has pressed an arrow key
  //          'gotTP'     - the player has picked up the last dropped roll
  //          'noAliens'  - every alien on the site has been dealt with
  //
  //    { goToPage: 'dating.html', after: 1.2 }
  //        Leave this page and open another one. This is how the crane
  //        scene hands over to the second half of the game.
  //          goToPage - the file to open. It must sit in the same
  //                     folder as index.html.
  //          after    - seconds to wait before it does. Leave it out
  //                     and it waits one second.
  //        Nothing after this instruction ever runs, because by then
  //        the other page has taken over.
  //
  //  When the list runs out, the tutorial is over and the game starts
  //  spawning aliens on its own.
  tutorial: [
    { talk: ["G'day. First day on site, is it?",
             'Grab a hard hat. You will need all three.'] },

    { talk: ['Arrow keys to walk about.',
             'Go on, have a wander.'] },
    { waitFor: 'moved' },

    { talk: ['Good. Now, the aliens.',
             'They are here for one thing: the dunny paper.',
             'And they will go through you to get it.'] },

    { talk: ['Lucky for us, they cannot stand the stuff.',
             'A roll to the head wraps one up for good.'] },

    { talk: ['Only problem is, you are carrying none.',
             'Check your pockets. Nothing.'] },

    { dropTP: { x: 640, y: 430, rolls: 1 } },
    { talk: ['There is a roll on the ground over there.',
             'Walk over it to pick it up.'] },
    { waitFor: 'gotTP' },

    { talk: ['That is the one. One roll, one alien.',
             'Make it count.'] },

    { spawnAlien: { kind: 'grunt', from: 'right' } },
    { talk: ['Speak of the devil. Here it comes.',
             'Press SPACE to chuck the roll at it.'] },
    { waitFor: 'noAliens' },

    { talk: ['Beautiful. Wrapped like a Chrissie present.',
             'That is the whole job, really.'] },

    // Right in the path of the crane boom, which is the whole idea.
    // The crane stands at 110,150 and tips over to the RIGHT, so its
    // top lands at roughly 220,197. Move this and you move where the
    // poor bloke is standing when it comes down.
    { dropTP: { x: 185, y: 210, rolls: 1 } },
    { talk: ['There is another roll under the crane.',
             'Go and grab it before the next one turns up.'] },
    { waitFor: 'gotTP' },

    { talk: ['Good lad. Right, that is smoko sorted.',
             'Hang on. What is that creaking noise?'] },

    // The crane comes down. The player cannot move or throw during
    // this - it plays itself, and the screen is left black afterwards.
    { cutscene: 'crane' },

    // These play over the black screen, after the eyes have shut.
    { talk: ['...'] },
    { talk: ['So that is it, then.',
             'Forty-one years, and a crane gets me.'] },
    { talk: ['Hang on. Why is it so warm?',
             'And who is that?'] },

    // -------- THE DATING SIM PICKS UP FROM HERE --------
    // The screen is already black at this point, so opening the other
    // page looks like one continuous scene rather than a jump.
    // Rename dating.html and you must change the name here too.
    { goToPage: 'dating.html', after: 1.2 }
  ],

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
    steadySounds: ['siren', 'bell', 'over', 'creak', 'crash', 'heartbeat'],

    // Sounds that fire over and over also change a touch in length and
    // loudness. 0.1 = up to 10% longer or shorter, louder or quieter.
    lengthShift: 0.1,
    loudShift: 0.15,
    rapidSounds: ['throw', 'splat', 'catch', 'pickup', 'move', 'empty'],

    // Background ambience: quiet building-site noise that plays under
    // everything - wind, distant traffic, the odd truck beep, machine hum
    // and alien warble.
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
      alienGapMin: 25,       // every 25 to 60 seconds
      alienGapMax: 60,
      nightSpooky: 1         // how much eerier it gets after dark (0 = not at all, 1 = fully)
    }
  }
};

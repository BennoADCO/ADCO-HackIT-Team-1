// ================================================================
//  WIPE OUT - ENGINE
// ================================================================
//  The machinery under the bonnet. This file:
//   - finds the game window on the page (called the "canvas")
//   - runs the GAME LOOP: a routine that repeats about 60 times a
//     second. Each time round it calls update(dt) to move everything
//     along a little, then draw() to paint the new picture. Both of
//     those live in game.js.
//   - keeps track of which keys are held down
//   - has small helper tools: random numbers, distances, drawing
//     emoji (or their pixel-art pictures) and text, and saving to the browser
//   - makes the sound effects
//
//  You should rarely need to change anything in here. The rules of
//  the game are in game.js, and the numbers are in config.js.
//
//  A "function" is a named set of steps. It runs when something
//  "calls" it by name, e.g. clamp(5, 0, 3). A "var" (short for
//  variable) is a labelled box that holds a value.
// ================================================================


// ================================================================
//  THE CANVAS (the game window we draw on)
// ================================================================
//  ctx is the "paintbrush": every bit of drawing goes through it.
//  WIDTH and HEIGHT are the size of the game window: 900 x 600.
//  Positions count in pixels: x from the left edge, y DOWN from the top.

var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var WIDTH = canvas.width;
var HEIGHT = canvas.height;


// ================================================================
//  KEYBOARD
// ================================================================
//  keys        - which keys are held down right now
//  keysPressed - which keys were pressed down during THIS frame only
//                (a "frame" is one picture; there are about 60 a second)
//
//  Use these from game.js:
//    isDown('ArrowLeft')  - true for as long as the key is held
//    wasPressed('Space')  - true only on the one frame the key went down
//
//  Key names: 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
//  'Space', 'Enter', 'Escape', and letters in lower case: 'r', 'y'.

var keys = {};
var keysPressed = {};

// Keys that would normally scroll the web page. We stop the page
// scrolling so the game window stays put while you play.
var KEYS_THAT_SCROLL = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

// Turns the browser's name for a key into the tidy names listed above.
function keyName(event) {
  var name = event.key;
  if (!name) {
    return '';
  }
  if (name === ' ' || name === 'Spacebar') {
    return 'Space';
  }
  // Very old browsers call the arrow keys 'Up', 'Down' and so on.
  if (name === 'Up' || name === 'Down' || name === 'Left' || name === 'Right') {
    return 'Arrow' + name;
  }
  // Letters: 'R' and 'r' both become 'r', so Caps Lock doesn't matter.
  if (name.length === 1) {
    return name.toLowerCase();
  }
  return name;
}

window.addEventListener('keydown', function (event) {
  var name = keyName(event);
  // Holding a key down makes the computer repeat it. Only the first
  // press counts as "pressed"; the repeats just mean "still held".
  if (!keys[name]) {
    keysPressed[name] = true;
  }
  keys[name] = true;
  if (KEYS_THAT_SCROLL.indexOf(name) !== -1) {
    event.preventDefault();
  }
});

window.addEventListener('keyup', function (event) {
  keys[keyName(event)] = false;
});

// If the window loses focus (you click another program), forget every
// held key. Otherwise the worker could keep walking on their own.
window.addEventListener('blur', function () {
  keys = {};
  keysPressed = {};
});

function isDown(name) {
  return keys[name] === true;
}

function wasPressed(name) {
  return keysPressed[name] === true;
}

// Called at the end of every frame, so "pressed" only lasts one frame.
function clearPressedKeys() {
  keysPressed = {};
}


// ================================================================
//  THE GAME LOOP
// ================================================================
//  Every frame:  work out dt  ->  update(dt)  ->  draw()  ->  repeat.
//
//  dt is the number of seconds since the last frame, usually about
//  0.016. Everything that moves is multiplied by dt, so the game runs
//  at the same speed on a fast computer and a slow one.
//
//  If the computer stalls (or you switch tabs and come back), dt is
//  capped at MAX_DT, so nothing teleports across the screen.

var MAX_DT = 0.05;
var lastFrameTime = null;
var loopStarted = false;

function gameLoop(now) {
  if (lastFrameTime === null) {
    lastFrameTime = now;
  }
  var dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  if (dt > MAX_DT) {
    dt = MAX_DT;
  }
  if (dt < 0) {
    dt = 0;
  }

  update(dt);   // in game.js: move everything along
  draw();       // in game.js: paint the picture
  clearPressedKeys();

  // Ask the browser to run gameLoop again when it's ready for the next frame.
  requestAnimationFrame(gameLoop);
}

// game.js calls this once, at the very end, to set the game running.
function startGameLoop() {
  if (loopStarted) {
    return;
  }
  loopStarted = true;
  requestAnimationFrame(gameLoop);
}


// ================================================================
//  MATHS HELPERS
// ================================================================

// A random number (with decimals) between min and max.
function randRange(min, max) {
  return min + Math.random() * (max - min);
}

// A random whole number from min to max, including both ends.
// randInt(1, 3) gives 1, 2 or 3.
function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Keeps a value between a lowest and a highest allowed value.
// clamp(950, 0, 900) gives 900.
function clamp(value, min, max) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

// Blends from a to b. t = 0 gives a, t = 1 gives b, t = 0.5 is halfway.
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Straight-line distance between two points, in pixels.
function distance(x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

// Do two circles overlap? Used for "is this touching that?"
function circlesTouch(x1, y1, radius1, x2, y2, radius2) {
  return distance(x1, y1, x2, y2) < radius1 + radius2;
}

// For blinking and flashing. Gives true, false, true, false... as the
// timer runs, switching "timesPerSecond" times a second each way.
function blinkOn(timer, timesPerSecond) {
  return Math.floor(timer * timesPerSecond * 2) % 2 === 0;
}


// ================================================================
//  DRAWING HELPERS
// ================================================================

// Drawing emoji is slow for the computer, so the first time an emoji
// is drawn at a given size we paint it once onto a hidden "sticker",
// then just copy that sticker every frame after. Same picture, far faster.
var emojiStickers = {};

function getEmojiSticker(emoji, size) {
  var label = emoji + '@' + size;
  if (emojiStickers[label]) {
    return emojiStickers[label];
  }
  var sticker = document.createElement('canvas');
  var box = Math.ceil(size * 1.5);   // a bit of spare room so no edge gets cut off
  sticker.width = box;
  sticker.height = box;
  var stickerCtx = sticker.getContext('2d');
  stickerCtx.font = size + 'px ' + CONFIG.fonts.emoji;
  stickerCtx.textAlign = 'center';
  stickerCtx.textBaseline = 'middle';
  stickerCtx.fillText(emoji, box / 2, box / 2);
  emojiStickers[label] = sticker;
  return sticker;
}

// Is a pixel-art picture from js/sprites.js drawn in place of this emoji?
// Only when CONFIG.art.useSprites is true and there's a picture for it.
function usingSprite(emoji) {
  if (!CONFIG.art || !CONFIG.art.useSprites) {
    return false;
  }
  if (typeof findSprite !== 'function') {
    return false;   // js/sprites.js didn't load (usually a typo in it), so stick to emoji
  }
  return findSprite(emoji) !== null;
}

// The sticker to draw for an emoji: its pixel-art picture if it has
// one (see usingSprite, above), otherwise the emoji itself.
function getPictureSticker(emoji, size) {
  if (usingSprite(emoji)) {
    return getSpriteSticker(emoji, size);
  }
  return getEmojiSticker(emoji, size);
}

// How much taller than wide the picture for an emoji is: 1 for an
// emoji or a square picture, 1.5 for one 16 across and 24 down.
function pictureTallness(emoji) {
  if (!usingSprite(emoji)) {
    return 1;
  }
  var sprite = findSprite(emoji);
  return sprite.rows.length / spriteWidth(sprite);
}

// Draws an emoji centred on (x, y), "size" pixels tall. If it has a
// pixel-art picture (see js/sprites.js), that's drawn instead, "size"
// pixels across; a tall picture stands on the same ground line.
function drawEmoji(emoji, x, y, size) {
  size = Math.round(size);
  if (!(size >= 1)) {
    return;   // too small to see (this also skips broken sizes)
  }
  var sticker = getPictureSticker(emoji, size);
  if (usingSprite(emoji)) {
    // Keep pixel art crisp: no blurring when it lands between screen pixels.
    var wasSmooth = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sticker, x - sticker.width / 2, y - sticker.height / 2);
    ctx.imageSmoothingEnabled = wasSmooth;
    return;
  }
  ctx.drawImage(sticker, x - sticker.width / 2, y - sticker.height / 2);
}

// Draws words centred up-and-down on y. The last part is a bundle of
// options, and you can leave any of them out:
//   size    - text height in pixels (default 20)
//   color   - text colour
//   align   - 'left', 'center' or 'right' (which end of the text sits on x)
//   bold    - true for bold
//   outline - a colour to draw a thick outline in, so it reads over anything
//   font    - which font (default: the text font in config.js)
// Example:
//   drawText('SMOKO!', 450, 200, { size: 50, color: '#ffd23f', align: 'center', bold: true });
function drawText(text, x, y, options) {
  var o = options || {};
  var size = o.size || 20;
  var font = o.font || CONFIG.fonts.text;
  var weight = '';
  if (o.bold) {
    weight = 'bold ';
  }
  ctx.font = weight + size + 'px ' + font;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = 'middle';
  if (o.outline) {
    ctx.lineWidth = Math.max(3, size / 7);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = o.outline;
    ctx.strokeText(text, x, y);
  }
  ctx.fillStyle = o.color || CONFIG.colors.text;
  ctx.fillText(text, x, y);
}

// Covers the whole screen in a see-through colour (used behind menus).
function drawOverlay(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}


// ================================================================
//  SAVING (in the browser's own storage)
// ================================================================
//  Some locked-down browsers refuse to save. Every save and load is
//  wrapped in "try ... catch", which means: try it, and if the browser
//  says no, carry on quietly instead of crashing. The game still plays.
//
//  saveData('wipeout', { bank: 50 })  - returns true if it saved
//  loadData('wipeout')                - returns what was saved, or null
//  removeData('wipeout')              - forgets it

function saveData(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    return false;
  }
}

function loadData(key) {
  try {
    var saved = window.localStorage.getItem(key);
    if (saved === null) {
      return null;
    }
    return JSON.parse(saved);
  } catch (err) {
    return null;
  }
}

function removeData(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    return false;
  }
}


// =====================================================================
//  SOUND
// ---------------------------------------------------------------------
//  Every sound in this game is made up on the spot by the browser's
//  built-in synthesiser (called "Web Audio"). There are no sound files.
//
//  To play a sound from anywhere in the game, write:
//
//      playSound('splat');
//
//  The names you can use are listed under SOUND RECIPES further down.
//  A name that is not on the list simply does nothing - no error.
//
//  If the laptop has no sound, or the browser blocks it, everything in
//  this section fails quietly and the game keeps running in silence.
//
//  SETTINGS - the volume, the mute switch, how much each sound's pitch
//  changes from play to play, and the background ambience are all in
//  the SOUND block at the very bottom of config.js. If any go missing,
//  the game uses sensible defaults anyway.
//
//  The BACKGROUND AMBIENCE (wind, distant traffic, the odd truck beep,
//  machine hum or alien warble) is at the very end of this section.
// =====================================================================


// ---------------------------------------------------------------------
//  Behind-the-scenes storage for the sound system.
//  (A "variable" is just a named box that holds a value.)
// ---------------------------------------------------------------------
var sndContext = null;      // the browser's synthesiser - made the first time we need it
var sndMaster = null;       // the master volume knob every sound passes through
var sndNoiseBuffer = null;  // one second of hiss (like radio static) for whooshes and splats
var sndBroken = false;      // becomes true if this browser can't do sound at all
var sndLastPlayed = {};     // when each sound last played, so they can't pile up

// Each time a sound plays, playSound() picks these at random, and every
// note and hiss in that sound is nudged by them. 1 = unchanged.
var sndPitch = 1;           // 1.05 = 5% higher, 0.95 = 5% lower
var sndStretch = 1;         // 1.1 = 10% longer
var sndLoudness = 1;        // 0.9 = 10% quieter


// ---------------------------------------------------------------------
//  Keep a number between a lowest and highest value. Anything that
//  isn't a proper number becomes the lowest value.
// ---------------------------------------------------------------------
function sndClamp(value, low, high) {
    if (typeof value !== 'number' || isNaN(value)) { return low; }
    if (value < low) { return low; }
    if (value > high) { return high; }
    return value;
}


// ---------------------------------------------------------------------
//  Read the sound settings from config.js, or use sensible defaults.
// ---------------------------------------------------------------------
function sndSettings() {
    var s = {
        volume: 0.4,
        muted: false,
        minGapMs: 40,
        pitchShift: 0.07,
        pitchShiftSteady: 0.025,
        steadySounds: ['siren', 'bell', 'over'],
        lengthShift: 0.1,
        loudShift: 0.15,
        rapidSounds: ['throw', 'splat', 'catch', 'pickup', 'move', 'empty']
    };

    try {
        if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.sound) {
            var c = CONFIG.sound;
            if (typeof c.volume === 'number') { s.volume = c.volume; }
            if (typeof c.muted === 'boolean') { s.muted = c.muted; }
            if (typeof c.minGapMs === 'number') { s.minGapMs = c.minGapMs; }
            if (typeof c.pitchShift === 'number') { s.pitchShift = c.pitchShift; }
            if (typeof c.pitchShiftSteady === 'number') { s.pitchShiftSteady = c.pitchShiftSteady; }
            if (typeof c.lengthShift === 'number') { s.lengthShift = c.lengthShift; }
            if (typeof c.loudShift === 'number') { s.loudShift = c.loudShift; }
            if (c.steadySounds instanceof Array) { s.steadySounds = c.steadySounds; }
            if (c.rapidSounds instanceof Array) { s.rapidSounds = c.rapidSounds; }
        }
    } catch (e) {
        // Settings unreadable - just use the defaults above.
    }

    s.volume = sndClamp(s.volume, 0, 1);
    s.pitchShift = sndClamp(s.pitchShift, 0, 0.5);
    s.pitchShiftSteady = sndClamp(s.pitchShiftSteady, 0, 0.5);
    s.lengthShift = sndClamp(s.lengthShift, 0, 0.5);
    s.loudShift = sndClamp(s.loudShift, 0, 0.5);

    return s;
}


// ---------------------------------------------------------------------
//  Switch the synthesiser on (the first time), or wake it up.
//  Browsers keep sound asleep until the player presses a key or
//  clicks, so we try to wake it every time.
// ---------------------------------------------------------------------
function sndGetContext() {
    if (sndBroken) {
        return null;
    }

    if (!sndContext) {
        var AudioMaker = window.AudioContext || window.webkitAudioContext;
        if (!AudioMaker) {
            sndBroken = true;
            return null;
        }

        try {
            sndContext = new AudioMaker();

            // A "limiter" - if lots of sounds happen at once it turns them
            // down together instead of letting them crackle and distort.
            var limiter = sndContext.createDynamicsCompressor();
            limiter.threshold.value = -12;
            limiter.knee.value = 6;
            limiter.ratio.value = 12;
            limiter.attack.value = 0.003;
            limiter.release.value = 0.15;

            sndMaster = sndContext.createGain();
            sndMaster.gain.value = sndSettings().volume;
            sndMaster.connect(limiter);
            limiter.connect(sndContext.destination);
        } catch (e) {
            sndContext = null;
            sndBroken = true;
            return null;
        }
    }

    if (sndContext.state === 'suspended') {
        var waking = sndContext.resume();
        if (waking && waking.catch) {
            waking.catch(function () {});
        }
    }

    return sndContext;
}


// ---------------------------------------------------------------------
//  Wake the synthesiser on the player's first key press or click, so
//  the very first sound of the game isn't swallowed by the browser.
//  This is also what switches the background ambience on.
//  Once sound is awake, this stops listening.
// ---------------------------------------------------------------------
function sndUnlock() {
    try {
        sndGetContext();
        if (sndAmbAutoStart) {
            startAmbience();
        }
        if (sndBroken || (sndContext && sndContext.state === 'running')) {
            window.removeEventListener('keydown', sndUnlock);
            window.removeEventListener('mousedown', sndUnlock);
            window.removeEventListener('touchstart', sndUnlock);
        }
    } catch (e) {
        // No sound available - the game carries on silently.
    }
}

try {
    window.addEventListener('keydown', sndUnlock);
    window.addEventListener('mousedown', sndUnlock);
    window.addEventListener('touchstart', sndUnlock);
} catch (e) {
    // Nothing to do - just no sound.
}


// ---------------------------------------------------------------------
//  A random number close to 1. amount 0.07 gives anything from 0.93
//  to 1.07 - i.e. up to 7% either way.
// ---------------------------------------------------------------------
function sndSpread(amount) {
    return 1 + (Math.random() * 2 - 1) * amount;
}

// Is this name in the list? (A "list", or "array", is several values
// in square brackets, like ['siren', 'bell'].)
function sndListHas(list, name) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === name) {
            return true;
        }
    }
    return false;
}

// ---------------------------------------------------------------------
//  Pick this play's random nudges, so a sound never plays exactly the
//  same way twice. The big tunes (siren, bell, game over) only move a
//  little so they stay recognisable. Sounds that fire over and over
//  (throws, splats) also change a touch in length and loudness.
// ---------------------------------------------------------------------
function sndChooseVariety(name, settings) {
    var shift = settings.pitchShift;
    if (sndListHas(settings.steadySounds, name)) {
        shift = settings.pitchShiftSteady;
    }
    sndPitch = sndSpread(shift);

    sndStretch = 1;
    sndLoudness = 1;
    if (sndListHas(settings.rapidSounds, name)) {
        sndStretch = sndSpread(settings.lengthShift);
        sndLoudness = sndSpread(settings.loudShift);
    }
}


// ---------------------------------------------------------------------
//  BUILDING BLOCK 1: play one note.
//
//  Give it a list of settings in curly brackets. Anything left out
//  uses the default shown here:
//
//    wave:   'sine' (smooth), 'triangle' (soft), 'square' (beepy)
//            or 'sawtooth' (buzzy).                    Default 'sine'.
//    pitch:  how high the note is, in Hz (bigger = squeakier).
//            One number = a steady note.
//            A list like [600, 100] = slides from 600 down to 100.
//            A longer list slides through each pitch in turn.
//    at:     seconds from now to start.                Default 0.
//    length: how long it lasts, in seconds.            Default 0.1.
//    loud:   0 to 1, before the master volume.         Default 0.3.
//    hold:   true  = stays loud, then fades at the very end (sirens,
//                    trombones).
//            false = fades away straight after it starts (dings,
//                    bonks). Default false.
//    muffle: optional - cuts the harsh top off the sound, in Hz.
//            Lower = more muffled.
//    wobbleSpeed / wobbleDepth: optional - makes the pitch warble,
//            like a singer's vibrato. Speed is wobbles per second,
//            depth is how far it wanders in Hz.
//    fadeIn / fadeOut: optional, for 'hold' notes - seconds to fade
//            in and out. Long fades sound far away.
//    out:    optional - where the note goes. Normally the master volume;
//            the background ambience sends its notes to its own knob.
// ---------------------------------------------------------------------
function sndNote(settings) {
    var ctx = sndContext;
    var wave = settings.wave || 'sine';
    var pitch = settings.pitch;
    var at = (settings.at || 0) * sndStretch;
    var length = (settings.length || 0.1) * sndStretch;
    var loud = (settings.loud || 0.3) * sndLoudness;
    var t = ctx.currentTime + at;

    var osc = ctx.createOscillator();
    osc.type = wave;

    // The pitch, and any slide between pitches (nudged by this play's
    // random pitch shift - see sndChooseVariety).
    if (typeof pitch === 'number') {
        osc.frequency.setValueAtTime(pitch * sndPitch, t);
    } else {
        osc.frequency.setValueAtTime(pitch[0] * sndPitch, t);
        for (var i = 1; i < pitch.length; i++) {
            var when = t + length * (i / (pitch.length - 1));
            osc.frequency.exponentialRampToValueAtTime(pitch[i] * sndPitch, when);
        }
    }

    // The loudness over time (called the "envelope").
    var amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    if (settings.hold) {
        var fadeIn = settings.fadeIn || 0.02;
        var fadeTime = settings.fadeOut || Math.min(0.1, length * 0.3);
        amp.gain.linearRampToValueAtTime(loud, t + fadeIn);
        amp.gain.setValueAtTime(loud, t + length - fadeTime);
        amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    } else {
        amp.gain.exponentialRampToValueAtTime(loud, t + Math.min(0.008, length / 4));
        amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    }

    // Wire it up: note -> (optional muffler) -> loudness -> master volume.
    if (settings.muffle) {
        var muffler = ctx.createBiquadFilter();
        muffler.type = 'lowpass';
        muffler.frequency.value = settings.muffle;
        osc.connect(muffler);
        muffler.connect(amp);
    } else {
        osc.connect(amp);
    }
    amp.connect(settings.out || sndMaster);

    // Optional warble.
    if (settings.wobbleSpeed && settings.wobbleDepth) {
        var wobbler = ctx.createOscillator();
        var wobbleAmount = ctx.createGain();
        wobbler.frequency.value = settings.wobbleSpeed;
        wobbleAmount.gain.value = settings.wobbleDepth;
        wobbler.connect(wobbleAmount);
        wobbleAmount.connect(osc.frequency);
        wobbler.start(t);
        wobbler.stop(t + length + 0.05);
    }

    osc.start(t);
    osc.stop(t + length + 0.05);
}


// ---------------------------------------------------------------------
//  BUILDING BLOCK 2: play a burst of hiss (like radio static), shaped
//  by a filter. Good for whooshes, splats and clicks.
//
//    filter: 'lowpass'  (muffled, thuddy)
//            'highpass' (thin, crisp)
//            'bandpass' (whooshy).                     Default 'lowpass'.
//    from / to: the filter slides between these, in Hz.
//    at, length, loud: same as for notes above.
// ---------------------------------------------------------------------
function sndHiss(settings) {
    var ctx = sndContext;
    var at = (settings.at || 0) * sndStretch;
    var length = (settings.length || 0.1) * sndStretch;
    var loud = (settings.loud || 0.3) * sndLoudness;
    var from = settings.from || 1000;
    var to = settings.to || from;
    from = from * sndPitch;
    to = to * sndPitch;
    var t = ctx.currentTime + at;

    // Make the one second of hiss the first time it's needed, then reuse it.
    if (!sndNoiseBuffer) {
        sndNoiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        var samples = sndNoiseBuffer.getChannelData(0);
        for (var i = 0; i < samples.length; i++) {
            samples[i] = Math.random() * 2 - 1;
        }
    }

    var source = ctx.createBufferSource();
    source.buffer = sndNoiseBuffer;
    source.loop = true;

    var shaper = ctx.createBiquadFilter();
    shaper.type = settings.filter || 'lowpass';
    shaper.frequency.setValueAtTime(from, t);
    shaper.frequency.exponentialRampToValueAtTime(to, t + length);

    var amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(loud, t + Math.min(0.005, length / 4));
    amp.gain.exponentialRampToValueAtTime(0.0001, t + length);

    source.connect(shaper);
    shaper.connect(amp);
    amp.connect(sndMaster);

    source.start(t, Math.random() * 0.5);
    source.stop(t + length + 0.05);
}


// ---------------------------------------------------------------------
//  BUILDING BLOCK 3: one strike of a big bell. A real bell rings at
//  several pitches at once, so we play several notes together.
// ---------------------------------------------------------------------
function sndBell(baseHz, at, length, loud) {
    var ratios = [1, 2, 2.4, 3, 4.5, 5.2];
    var levels = [1, 0.6, 0.45, 0.3, 0.2, 0.15];
    for (var i = 0; i < ratios.length; i++) {
        sndNote({
            wave: 'sine',
            pitch: baseHz * ratios[i],
            at: at,
            length: length * (1 - i * 0.12),
            loud: loud * levels[i]
        });
    }
}


// ---------------------------------------------------------------------
//  SOUND RECIPES
//  Each 'case' below is one sound. To tweak a sound, change its numbers.
//  To add a new one, copy a whole case (down to its 'return true;'),
//  give it a new name, and call playSound('your-new-name').
// ---------------------------------------------------------------------
function sndRecipe(name) {
    switch (name) {

        case 'throw':
            // Whoosh of a toilet roll flying. Kept short and quiet on purpose.
            sndHiss({ filter: 'bandpass', from: 500, to: 2500, length: 0.09, loud: 0.18 });
            return true;

        case 'splat':
            // A roll hitting an alien: soft squishy thud.
            sndHiss({ filter: 'lowpass', from: 2000, to: 300, length: 0.1, loud: 0.25 });
            sndNote({ wave: 'sine', pitch: [220, 70], length: 0.08, loud: 0.18 });
            return true;

        case 'catch':
            // Alien fully wrapped: cheerful pop, then two happy dings.
            sndNote({ wave: 'sine', pitch: [300, 900], length: 0.06, loud: 0.3 });
            sndNote({ wave: 'triangle', pitch: 880, at: 0.06, length: 0.12, loud: 0.2 });
            sndNote({ wave: 'triangle', pitch: 1320, at: 0.12, length: 0.18, loud: 0.2 });
            return true;

        case 'bonk':
            // Hard hat knocked off: hollow plastic bonk.
            sndHiss({ filter: 'lowpass', from: 3000, to: 800, length: 0.03, loud: 0.3 });
            sndNote({ wave: 'triangle', pitch: [700, 250], length: 0.15, loud: 0.4 });
            sndNote({ wave: 'sine', pitch: [350, 120], length: 0.2, loud: 0.3 });
            return true;

        case 'pickup':
            // Picked something up: classic two-note ding.
            sndNote({ wave: 'sine', pitch: 988, length: 0.08, loud: 0.2 });
            sndNote({ wave: 'sine', pitch: 1319, at: 0.07, length: 0.3, loud: 0.22 });
            return true;

        case 'crate':
            // Supply crate refill: a thunk, then a bigger climbing ding.
            sndNote({ wave: 'sine', pitch: [180, 80], length: 0.1, loud: 0.25 });
            sndNote({ wave: 'triangle', pitch: 784, at: 0.0, length: 0.12, loud: 0.2 });
            sndNote({ wave: 'triangle', pitch: 988, at: 0.07, length: 0.12, loud: 0.2 });
            sndNote({ wave: 'triangle', pitch: 1175, at: 0.14, length: 0.12, loud: 0.2 });
            sndNote({ wave: 'triangle', pitch: 1568, at: 0.21, length: 0.5, loud: 0.22 });
            sndNote({ wave: 'sine', pitch: 3136, at: 0.21, length: 0.4, loud: 0.06 });
            return true;

        case 'siren':
            // Smoko / knock-off siren: wails up, holds, winds down (about 1.5 seconds).
            sndNote({ wave: 'sawtooth', pitch: [450, 900, 900, 450], length: 1.5, loud: 0.18,
                      hold: true, muffle: 1800, wobbleSpeed: 5, wobbleDepth: 8 });
            return true;

        case 'bell':
            // Midnight - you win! Quick fanfare, then two big bell dongs.
            sndNote({ wave: 'triangle', pitch: 523, at: 0.0, length: 0.12, loud: 0.22 });
            sndNote({ wave: 'triangle', pitch: 659, at: 0.1, length: 0.12, loud: 0.22 });
            sndNote({ wave: 'triangle', pitch: 784, at: 0.2, length: 0.12, loud: 0.22 });
            sndNote({ wave: 'triangle', pitch: 1047, at: 0.3, length: 0.5, loud: 0.22, hold: true });
            sndBell(330, 0.6, 2.0, 0.3);
            sndBell(330, 1.3, 2.0, 0.3);
            return true;

        case 'sink':
            // Alien caught in a trap: a warbly glooop sinking down, then bubbles.
            sndNote({ wave: 'sine', pitch: [600, 70], length: 0.55, loud: 0.35,
                      wobbleSpeed: 16, wobbleDepth: 40 });
            sndNote({ wave: 'sine', pitch: [250, 700], at: 0.5, length: 0.06, loud: 0.15 });
            sndNote({ wave: 'sine', pitch: [300, 800], at: 0.62, length: 0.05, loud: 0.1 });
            return true;

        case 'over':
            // Game over: sad trombone. Wah... wah... wah... waaaah.
            sndNote({ wave: 'sawtooth', pitch: [294, 285], at: 0.0, length: 0.35, loud: 0.22, hold: true, muffle: 1100 });
            sndNote({ wave: 'sawtooth', pitch: [277, 269], at: 0.4, length: 0.35, loud: 0.22, hold: true, muffle: 1100 });
            sndNote({ wave: 'sawtooth', pitch: [262, 254], at: 0.8, length: 0.35, loud: 0.22, hold: true, muffle: 1100 });
            sndNote({ wave: 'sawtooth', pitch: [247, 235], at: 1.2, length: 1.1, loud: 0.22, hold: true, muffle: 1100,
                      wobbleSpeed: 6, wobbleDepth: 6 });
            return true;

        case 'buy':
            // Shop purchase: ka-ching!
            sndNote({ wave: 'square', pitch: 1319, length: 0.05, loud: 0.1 });
            sndNote({ wave: 'sine', pitch: 1760, at: 0.05, length: 0.25, loud: 0.2 });
            sndNote({ wave: 'sine', pitch: 2637, at: 0.05, length: 0.2, loud: 0.08 });
            sndHiss({ filter: 'highpass', from: 5000, to: 8000, at: 0.05, length: 0.08, loud: 0.1 });
            return true;

        case 'deny':
            // Can't afford it: low "nuh-uh" buzz.
            sndNote({ wave: 'square', pitch: 160, length: 0.1, loud: 0.12, hold: true, muffle: 1200 });
            sndNote({ wave: 'square', pitch: 120, at: 0.13, length: 0.18, loud: 0.12, hold: true, muffle: 1200 });
            return true;

        case 'move':
            // Shop cursor moved: tiny tick.
            sndNote({ wave: 'triangle', pitch: 1400, length: 0.03, loud: 0.12 });
            return true;

        case 'empty':
            // Out of toilet paper: dry little click.
            sndHiss({ filter: 'highpass', from: 2500, to: 2500, length: 0.02, loud: 0.25 });
            sndNote({ wave: 'square', pitch: [200, 100], length: 0.04, loud: 0.08 });
            return true;

        default:
            // Not a sound we know - do nothing.
            return false;
    }
}


// ---------------------------------------------------------------------
//  playSound(name) - the one the rest of the game uses.
//  Example: playSound('pickup');
// ---------------------------------------------------------------------
function playSound(name) {
    try {
        var settings = sndSettings();
        if (settings.muted || settings.volume <= 0) {
            return;
        }

        // Stop the same sound piling up (e.g. holding Space to throw).
        var now = Date.now();
        var last = sndLastPlayed[name];
        if (last !== undefined && now - last < settings.minGapMs) {
            return;
        }

        var ctx = sndGetContext();
        if (!ctx) {
            return;
        }

        sndLastPlayed[name] = now;
        sndMaster.gain.value = settings.volume;
        sndChooseVariety(name, settings);
        sndRecipe(name);
    } catch (e) {
        // Something went wrong with sound - ignore it and keep the game running.
    }

    // Put the random nudges back to "unchanged" for whatever plays next.
    sndPitch = 1;
    sndStretch = 1;
    sndLoudness = 1;
}


// =====================================================================
//  BACKGROUND AMBIENCE
// ---------------------------------------------------------------------
//  A quiet, never-ending building-site soundscape, made in code:
//    - wind, and the low rumble of distant traffic (shaped hiss)
//    - now and then: a far-off truck reversing (beep... beep...),
//      a machine humming into life, or a faint alien warble
//    - after dark it gets eerie: an uneasy low drone creeps in, the
//      traffic dies down and the aliens get chattier.
//
//  It starts by itself on the player's first key press or click
//  (browsers don't allow sound before that) and keeps going on every
//  screen. It obeys the same mute and volume as the sound effects.
//
//      startAmbience();   // switch it on (safe to call more than once)
//      stopAmbience();    // fade it out and switch it off
//
//  Its settings are in the 'ambience' part of the SOUND block in
//  config.js.
// =====================================================================

var sndAmb = null;           // all the running ambience parts (null = ambience is off)
var sndAmbTimer = null;      // a timer that looks after the ambience 4 times a second
var sndAmbAutoStart = true;  // false after stopAmbience(), so a key press won't restart it
var sndAmbNoise = null;      // four seconds of hiss for the wind and traffic, made once

// How loud each part is when its setting in config.js is 1. These are
// balanced against each other by ear - change config.js, not these.
var sndAmbMix = { wind: 2.0, traffic: 3.0, drone: 0.12, beep: 0.15, hum: 0.4, alien: 0.12 };


// ---------------------------------------------------------------------
//  Read the ambience settings from config.js, or use these defaults.
// ---------------------------------------------------------------------
function sndAmbSettings() {
    var a = {
        on: true,
        volume: 0.15,
        wind: 1,
        traffic: 1,
        gustSeconds: 11,
        beeps: 1,
        beepGapMin: 15,
        beepGapMax: 40,
        hum: 1,
        humGapMin: 20,
        humGapMax: 50,
        alien: 1,
        alienGapMin: 25,
        alienGapMax: 60,
        nightSpooky: 1
    };

    try {
        if (typeof CONFIG !== 'undefined' && CONFIG && CONFIG.sound && CONFIG.sound.ambience) {
            var c = CONFIG.sound.ambience;
            // Go through each setting above. If config.js has the same one,
            // of the same kind (a number, or true/false), use that instead.
            for (var key in a) {
                if (typeof c[key] === typeof a[key]) {
                    a[key] = c[key];
                }
            }
        }
    } catch (e) {
        // Settings unreadable - just use the defaults above.
    }

    a.volume = sndClamp(a.volume, 0, 1);
    a.wind = sndClamp(a.wind, 0, 3);
    a.traffic = sndClamp(a.traffic, 0, 3);
    a.beeps = sndClamp(a.beeps, 0, 3);
    a.hum = sndClamp(a.hum, 0, 3);
    a.alien = sndClamp(a.alien, 0, 3);
    a.nightSpooky = sndClamp(a.nightSpooky, 0, 1);
    a.gustSeconds = sndClamp(a.gustSeconds, 2, 120);
    return a;
}


// ---------------------------------------------------------------------
//  How dark it is in the game right now: 0 = daytime (or not playing a
//  shift), 1 = full dark. Uses the game's own night-time helpers if they
//  exist, and never causes an error if they don't.
// ---------------------------------------------------------------------
function sndAmbNight() {
    try {
        if (typeof game === 'undefined' || !game || game.state !== 'playing') {
            return 0;
        }
        if (typeof getNightAmount === 'function') {
            return sndClamp(getNightAmount(), 0, 1);
        }
        if (typeof getClockHours === 'function' && typeof CONFIG !== 'undefined' && CONFIG.night) {
            var span = CONFIG.night.fullDarkAt - CONFIG.night.startsAt;
            if (span > 0) {
                return sndClamp((getClockHours() - CONFIG.night.startsAt) / span, 0, 1);
            }
        }
    } catch (e) {
        // Couldn't tell - treat it as daytime.
    }
    return 0;
}


// A random wait, in seconds, between min and max (never under 3 seconds).
function sndAmbGap(min, max) {
    if (max < min) {
        max = min;
    }
    var gap = min + Math.random() * (max - min);
    if (gap < 3) {
        gap = 3;
    }
    return gap;
}


// A very slow wave that pushes a setting up and down, over and over -
// e.g. the wind getting louder and quieter. Returns its "how far" knob.
function sndAmbSwayer(ctx, parts, wavesPerSecond, target, howFar) {
    var wave = ctx.createOscillator();
    wave.frequency.value = wavesPerSecond;
    var amount = ctx.createGain();
    amount.gain.value = howFar;
    wave.connect(amount);
    amount.connect(target);
    parts.sources.push(wave);
    return amount;
}


// Change one of the ambience's loudness knobs smoothly (no clicks), but
// only if it's actually changed - so the browser isn't sent the same
// instruction over and over.
function sndAmbSet(parts, name, knob, value, smoothSeconds) {
    if (parts.last[name] !== undefined && Math.abs(parts.last[name] - value) < 0.0005) {
        return;
    }
    parts.last[name] = value;
    knob.setTargetAtTime(value, parts.ctx.currentTime, smoothSeconds);
}


// ---------------------------------------------------------------------
//  The occasional far-off sounds.
// ---------------------------------------------------------------------

// A truck reversing somewhere on site: 3 to 5 muffled beeps.
function sndAmbTruckBeeps(parts, loudness) {
    var pitch = 1040 * sndSpread(0.03);
    var count = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < count; i++) {
        sndNote({ wave: 'square', pitch: pitch, at: i * 0.9, length: 0.42, loud: sndAmbMix.beep * loudness,
                  hold: true, muffle: 1400, out: parts.bus });
    }
}

// A distant machine (generator, excavator) chugging into life, revving
// a little, then dying away again.
function sndAmbMachineHum(parts, loudness) {
    var base = 44 + Math.random() * 12;
    var rev = 1.06 + Math.random() * 0.08;
    var length = 6 + Math.random() * 4;
    sndNote({ wave: 'sawtooth', pitch: [base, base * rev, base], length: length, loud: sndAmbMix.hum * loudness,
              hold: true, fadeIn: 2, fadeOut: 2.5, muffle: 260, wobbleSpeed: 3, wobbleDepth: 0.6, out: parts.bus });
    sndNote({ wave: 'triangle', pitch: [base * 2, base * 2 * rev, base * 2], length: length, loud: sndAmbMix.hum * loudness * 0.3,
              hold: true, fadeIn: 2, fadeOut: 2.5, muffle: 400, out: parts.bus });
}

// A faint alien warble. After dark, a second one often answers it.
function sndAmbAlienWarble(parts, loudness, night) {
    var start = 500 + Math.random() * 400;
    var calls = 1;
    if (Math.random() < 0.3 + night * 0.5) {
        calls = 2;
    }
    for (var i = 0; i < calls; i++) {
        var p = start * (1 + i * 0.25);
        var pitches = [p, p * 1.6, p * 1.2];
        if (Math.random() < 0.5) {
            pitches = [p * 1.4, p * 0.8, p];
        }
        sndNote({ wave: 'sine', pitch: pitches, at: i * 1.3, length: 1.1 + Math.random() * 0.6,
                  loud: sndAmbMix.alien * loudness, hold: true, fadeIn: 0.25, fadeOut: 0.5,
                  wobbleSpeed: 7 + Math.random() * 5, wobbleDepth: 25 + Math.random() * 30, out: parts.bus });
    }
}


// ---------------------------------------------------------------------
//  startAmbience() - switch the background ambience on.
// ---------------------------------------------------------------------
function startAmbience() {
    try {
        sndAmbAutoStart = true;
        if (sndAmb) {
            return;   // already playing
        }
        var amb = sndAmbSettings();
        if (!amb.on) {
            return;
        }
        var ctx = sndGetContext();
        if (!ctx) {
            return;
        }
        var now = ctx.currentTime;

        // Four seconds of hiss - long enough that the ear can't hear it repeat.
        if (!sndAmbNoise) {
            sndAmbNoise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
            var samples = sndAmbNoise.getChannelData(0);
            for (var i = 0; i < samples.length; i++) {
                samples[i] = Math.random() * 2 - 1;
            }
        }

        // 'parts' keeps hold of every piece so they can be adjusted and
        // switched off later. The ambience's own volume knob ('bus')
        // starts silent and fades up.
        var parts = { ctx: ctx, sources: [], last: {} };
        parts.bus = ctx.createGain();
        parts.bus.gain.value = 0;
        parts.bus.connect(sndMaster);
        sndAmb = parts;

        var hiss = ctx.createBufferSource();
        hiss.buffer = sndAmbNoise;
        hiss.loop = true;

        // WIND: hiss with the harsh top cut off...
        var windFilter = ctx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 550;
        windFilter.Q.value = 0.8;
        parts.wind = ctx.createGain();
        parts.wind.gain.value = 0;
        hiss.connect(windFilter);
        windFilter.connect(parts.wind);
        parts.wind.connect(parts.bus);
        // ...that gusts louder and quieter, and slowly sighs up and down.
        parts.gust = sndAmbSwayer(ctx, parts, 1 / amb.gustSeconds, parts.wind.gain, 0);
        sndAmbSwayer(ctx, parts, 1 / (amb.gustSeconds * 1.7), windFilter.frequency, 250);

        // TRAFFIC: the same hiss, muffled right down to a deep rumble that slowly swells.
        var trafficFilter = ctx.createBiquadFilter();
        trafficFilter.type = 'lowpass';
        trafficFilter.frequency.value = 180;
        trafficFilter.Q.value = 0.7;
        parts.traffic = ctx.createGain();
        parts.traffic.gain.value = 0;
        hiss.connect(trafficFilter);
        trafficFilter.connect(parts.traffic);
        parts.traffic.connect(parts.bus);
        parts.swell = sndAmbSwayer(ctx, parts, 1 / 23, parts.traffic.gain, 0);

        // NIGHT DRONE: two low notes a hair apart (so they slowly throb)
        // plus a clashing third note. Silent until it gets dark.
        parts.drone = ctx.createGain();
        parts.drone.gain.value = 0;
        var droneFilter = ctx.createBiquadFilter();
        droneFilter.type = 'lowpass';
        droneFilter.frequency.value = 500;
        droneFilter.Q.value = 4;
        droneFilter.connect(parts.drone);
        parts.drone.connect(parts.bus);
        sndAmbSwayer(ctx, parts, 0.05, droneFilter.frequency, 250);
        var dronePitches = [110, 110.8, 155.6];
        var droneLevels = [0.5, 0.5, 0.3];
        for (var d = 0; d < dronePitches.length; d++) {
            var note = ctx.createOscillator();
            note.type = 'sawtooth';
            note.frequency.value = dronePitches[d];
            var noteLevel = ctx.createGain();
            noteLevel.gain.value = droneLevels[d];
            note.connect(noteLevel);
            noteLevel.connect(droneFilter);
            parts.sources.push(note);
        }

        // Switch it all on. The hiss starts at a random point so no two
        // games sound quite the same.
        hiss.start(now, Math.random() * 3);
        parts.sources.push(hiss);
        for (var s = 0; s < parts.sources.length - 1; s++) {
            parts.sources[s].start(now);
        }

        parts.nextBeep = now + sndAmbGap(amb.beepGapMin, amb.beepGapMax);
        parts.nextHum = now + sndAmbGap(amb.humGapMin, amb.humGapMax);
        parts.nextAlien = now + sndAmbGap(amb.alienGapMin, amb.alienGapMax);

        sndAmbTimer = setInterval(sndAmbTick, 250);
        sndAmbTick();
    } catch (e) {
        // Sound hardware trouble - tidy up and carry on in silence.
        sndAmbShutDown();
    }
}


// ---------------------------------------------------------------------
//  Runs 4 times a second while the ambience is on: follows the volume,
//  mute and night-time, and sets off the occasional far-off sound.
// ---------------------------------------------------------------------
function sndAmbTick() {
    try {
        if (!sndAmb) {
            return;
        }
        var parts = sndAmb;
        var now = parts.ctx.currentTime;
        var s = sndSettings();
        var amb = sndAmbSettings();

        if (!s.muted && sndMaster && Math.abs(sndMaster.gain.value - s.volume) > 0.001) {
            sndMaster.gain.value = s.volume;
        }

        // Muted, or switched off in config.js? Fade the whole ambience to silence.
        var level = amb.volume;
        if (s.muted || !amb.on || s.volume <= 0) {
            level = 0;
        }
        sndAmbSet(parts, 'bus', parts.bus.gain, level, 0.6);

        // 0 in the day, up to 1 at full dark (in small steps, so the knobs
        // only get adjusted now and then).
        var night = Math.round(sndAmbNight() * amb.nightSpooky * 20) / 20;

        var wind = sndAmbMix.wind * amb.wind * (1 + 0.3 * night);
        sndAmbSet(parts, 'wind', parts.wind.gain, wind, 1.5);
        sndAmbSet(parts, 'gust', parts.gust.gain, wind * 0.45, 1.5);

        var traffic = sndAmbMix.traffic * amb.traffic * (1 - 0.6 * night);
        sndAmbSet(parts, 'traffic', parts.traffic.gain, traffic, 2);
        sndAmbSet(parts, 'swell', parts.swell.gain, traffic * 0.35, 2);

        sndAmbSet(parts, 'drone', parts.drone.gain, sndAmbMix.drone * night, 3);

        // The occasional far-off sounds. When one is due it plays (unless
        // muted), then the next one is booked for a random time later.
        if (now >= parts.nextBeep) {
            // The site goes quiet after dark, so trucks reverse less often.
            if (level > 0 && amb.beeps > 0 && Math.random() >= night * 0.7) {
                sndAmbTruckBeeps(parts, amb.beeps);
            }
            parts.nextBeep = now + sndAmbGap(amb.beepGapMin, amb.beepGapMax);
        }
        if (now >= parts.nextHum) {
            if (level > 0 && amb.hum > 0) {
                sndAmbMachineHum(parts, amb.hum);
            }
            parts.nextHum = now + sndAmbGap(amb.humGapMin, amb.humGapMax);
        }
        if (now >= parts.nextAlien) {
            if (level > 0 && amb.alien > 0) {
                sndAmbAlienWarble(parts, amb.alien, night);
            }
            // Aliens get chattier after dark: up to twice as often.
            parts.nextAlien = now + sndAmbGap(amb.alienGapMin, amb.alienGapMax) / (1 + night);
        }
    } catch (e) {
        // Something went wrong - switch the ambience off quietly; the game carries on.
        sndAmbShutDown();
    }
}


// ---------------------------------------------------------------------
//  Fade the ambience out and release everything it was using.
// ---------------------------------------------------------------------
function sndAmbShutDown() {
    try {
        if (sndAmbTimer !== null) {
            clearInterval(sndAmbTimer);
        }
    } catch (e) {
        // Nothing to do.
    }
    sndAmbTimer = null;

    var parts = sndAmb;
    sndAmb = null;
    if (!parts) {
        return;
    }

    try {
        var now = parts.ctx.currentTime;
        parts.bus.gain.cancelScheduledValues(now);
        parts.bus.gain.setValueAtTime(parts.bus.gain.value, now);
        parts.bus.gain.linearRampToValueAtTime(0, now + 0.4);
        for (var i = 0; i < parts.sources.length; i++) {
            try {
                parts.sources[i].stop(now + 0.5);
            } catch (e) {
                // This one never started - nothing to stop.
            }
        }
        setTimeout(function () {
            try {
                parts.bus.disconnect();
            } catch (e) {
                // Already gone.
            }
        }, 800);
    } catch (e) {
        // Nothing more we can do - it's already switched off as far as the game knows.
    }
}


// ---------------------------------------------------------------------
//  stopAmbience() - fade the background ambience out and switch it off.
//  It stays off (even on key presses) until startAmbience() is called.
// ---------------------------------------------------------------------
function stopAmbience() {
    sndAmbAutoStart = false;
    sndAmbShutDown();
}

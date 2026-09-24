// ============================================================
//  ENGINE
//  The behind-the-scenes machinery: the game loop, the mouse and
//  keyboard, sound, and drawing helpers.
//  You should rarely need to change anything in this file.
// ============================================================


// ------------------------------------------------------------
//  THE DRAWING SURFACE
//  "canvas" is the box on the page; "ctx" is the pen we draw with.
// ------------------------------------------------------------
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
var WIDTH = canvas.width;     // always 900
var HEIGHT = canvas.height;   // always 600


// ------------------------------------------------------------
//  MOUSE
//  mouse.x / mouse.y   = where the pointer is, in game units (0-900, 0-600)
//  mouse.clicked       = true for exactly one frame after a click
// ------------------------------------------------------------
var mouse = { x: 0, y: 0, clicked: false };

// The page may stretch the game, so convert screen position to game position.
function toGamePosition(event) {
  var box = canvas.getBoundingClientRect();
  mouse.x = (event.clientX - box.left) * (WIDTH / box.width);
  mouse.y = (event.clientY - box.top) * (HEIGHT / box.height);
}

canvas.addEventListener('mousemove', function (event) {
  toGamePosition(event);
});

canvas.addEventListener('mousedown', function (event) {
  toGamePosition(event);
  mouse.clicked = true;
  unlockSound();
});


// ------------------------------------------------------------
//  KEYBOARD
//  keyWasPressed('Space') is true for exactly one frame after the key goes down.
//  Key names: 'Space', 'KeyM', 'KeyA', 'ArrowLeft', etc.
// ------------------------------------------------------------
var keysPressed = {};

window.addEventListener('keydown', function (event) {
  if (!event.repeat) {
    keysPressed[event.code] = true;
  }
  if (event.code === 'Space') {
    event.preventDefault();   // stop Space from scrolling the page
  }
  unlockSound();
});

function keyWasPressed(code) {
  return keysPressed[code] === true;
}


// ------------------------------------------------------------
//  SOUND
//  Beeps made by the browser itself - no sound files needed.
//  playTone(pitch, seconds, shape, volume)
//    pitch  : 200 = low, 800 = high
//    shape  : 'sine' (soft), 'square' (buzzy), 'sawtooth' (harsh), 'triangle'
// ------------------------------------------------------------
var audio = null;

// Browsers only allow sound after the player clicks or presses a key.
function unlockSound() {
  if (audio) {
    return;
  }
  try {
    audio = new (window.AudioContext || window.webkitAudioContext)();
  } catch (error) {
    audio = null;   // no sound available - the game still works
  }
}

function playTone(pitch, seconds, shape, volume) {
  if (!audio) {
    return;
  }
  try {
    var oscillator = audio.createOscillator();
    var gain = audio.createGain();
    oscillator.type = shape || 'sine';
    oscillator.frequency.value = pitch;
    gain.gain.setValueAtTime(volume || 0.2, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + seconds);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + seconds);
  } catch (error) {
    // If sound fails, carry on silently.
  }
}


// A brassy note that starts after "delay" seconds.
// wobble = how much the pitch wobbles up and down (0 = steady).
function playNote(pitch, delay, seconds, volume, wobble) {
  if (!audio) {
    return;
  }
  try {
    var start = audio.currentTime + delay;
    var oscillator = audio.createOscillator();
    var filter = audio.createBiquadFilter();
    var gain = audio.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(pitch, start);
    filter.type = 'lowpass';        // soften the buzz so it sounds like a horn
    filter.frequency.value = 1200;

    // Fade in, hold, fade out
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.05);
    gain.gain.setValueAtTime(volume, start + seconds - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);

    if (wobble > 0) {
      var wobbler = audio.createOscillator();
      var wobbleSize = audio.createGain();
      wobbler.frequency.value = 6;   // wobbles per second
      wobbleSize.gain.value = wobble;
      wobbler.connect(wobbleSize);
      wobbleSize.connect(oscillator.frequency);
      wobbler.start(start);
      wobbler.stop(start + seconds);
    }

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds);
  } catch (error) {
    // If sound fails, carry on silently.
  }
}

// Wah... wah... wah... wahhhh. Plays a list of notes one after another;
// the last one is held longer and wobbles.
function playSadTrombone(notes, noteLength, lastNoteLength, volume) {
  var delay = 0;
  for (var i = 0; i < notes.length; i++) {
    var isLast = i === notes.length - 1;
    var length = isLast ? lastNoteLength : noteLength;
    playNote(notes[i], delay, length, volume, isLast ? 6 : 0);
    delay = delay + noteLength;
  }
}


// ------------------------------------------------------------
//  DRAWING HELPERS
// ------------------------------------------------------------

// Draw an emoji centred on (x, y).
function drawEmoji(emoji, x, y, size) {
  ctx.font = size + 'px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, x, y);
}

// Draw text. align is 'left', 'center' or 'right'.
function drawText(text, x, y, size, colour, align, bold) {
  ctx.font = (bold ? 'bold ' : '') + size + 'px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = colour;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

// Draw text that wraps onto new lines if it's wider than maxWidth.
function drawWrappedText(text, x, y, maxWidth, size, colour, align, bold) {
  var font = (bold ? 'bold ' : '') + size + 'px "Segoe UI", Arial, sans-serif';
  var words = text.split(' ');
  var line = '';
  var lineY = y;
  for (var i = 0; i < words.length; i++) {
    var attempt = line === '' ? words[i] : line + ' ' + words[i];
    ctx.font = font;
    if (ctx.measureText(attempt).width > maxWidth && line !== '') {
      drawText(line, x, lineY, size, colour, align, bold);
      line = words[i];
      lineY = lineY + size * 1.3;
    } else {
      line = attempt;
    }
  }
  if (line !== '') {
    drawText(line, x, lineY, size, colour, align, bold);
  }
}

// Draw a filled rectangle with rounded corners.
function drawRoundRect(x, y, width, height, radius, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}


// ------------------------------------------------------------
//  HIT TESTS - "is this point inside that shape?"
// ------------------------------------------------------------
function pointInCircle(px, py, cx, cy, radius) {
  var dx = px - cx;
  var dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function pointInRect(px, py, x, y, width, height) {
  return px >= x && px <= x + width && py >= y && py <= y + height;
}


// ------------------------------------------------------------
//  THE GAME LOOP
//  About 60 times a second: work out how much time has passed ("dt",
//  in seconds), let the game update, then redraw the screen.
// ------------------------------------------------------------
var lastTime = 0;

function startGameLoop(updateFunction, drawFunction) {
  function frame(now) {
    var dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.1) {
      dt = 0.1;   // if the tab was hidden, don't jump ahead
    }

    updateFunction(dt);
    drawFunction();

    // Clicks and key presses only count for one frame.
    mouse.clicked = false;
    keysPressed = {};

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(function (now) {
    lastTime = now;
    requestAnimationFrame(frame);
  });
}

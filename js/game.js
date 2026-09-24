// ============================================================
//  THE GAME RULES
//  What happens, when, and what it looks like.
//  Numbers and words come from js/config.js.
// ============================================================


// ------------------------------------------------------------
//  GAME STATE
//  "state" is which screen we are on: 'menu', 'playing' or 'over'.
//  "popup" is the joke currently on screen, or null if there isn't one.
// ------------------------------------------------------------
var state = 'menu';
var coins = 0;            // coins you can spend right now
var totalEarned = 0;      // every coin earned this round - your final score
var sushiSquash = 0;      // counts down after a click, to make the sushi "squash"
var hired = [];           // one true/false per hero: have we hired them yet?
var autoClickTimer = 0;   // counts up to the next robot click
var roundTime = 0;        // seconds since you pressed Start
var nextEvent = 0;        // which line of the script is due next
var popup = null;         // the pop-up on screen right now
var jobpacDone = false;   // JobPac only interrupts your first hire
var promisesMade = 0;     // how many times we've promised Lynn a rebuild
var overTimer = 0;        // seconds since the end screen appeared
var shakeTime = 0;        // counts down while the screen is shaking
var floaters = [];        // the little "+1" coins floating up from the sushi
var bestScore = loadBestScore();
var newBest = false;      // did this round beat the best score?


// ------------------------------------------------------------
//  HIGH SCORE - saved in the browser.
//  Some computers block saving, so every read and write is wrapped
//  in "try" - if it fails, the game just carries on without it.
// ------------------------------------------------------------
function loadBestScore() {
  try {
    var saved = window.localStorage.getItem(CONFIG.highScore.storageKey);
    if (saved !== null) {
      return Number(saved) || 0;
    }
  } catch (error) {
    // saving is blocked - ignore
  }
  return 0;
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(CONFIG.highScore.storageKey, String(score));
  } catch (error) {
    // saving is blocked - ignore
  }
}


// ------------------------------------------------------------
//  START A NEW ROUND
// ------------------------------------------------------------
function startRound() {
  coins = 0;
  totalEarned = 0;
  sushiSquash = 0;
  autoClickTimer = 0;
  roundTime = 0;
  nextEvent = 0;
  popup = null;
  jobpacDone = false;
  promisesMade = 0;
  shakeTime = 0;
  floaters = [];
  newBest = false;
  hired = [];
  for (var i = 0; i < CONFIG.heroes.length; i++) {
    hired.push(false);
  }
  state = 'playing';
}

// Add coins, and count them towards the final score.
function earn(amount) {
  coins = coins + amount;
  totalEarned = totalEarned + amount;
}


// ------------------------------------------------------------
//  UPDATE - runs every frame. dt = seconds since the last frame.
// ------------------------------------------------------------
function update(dt) {
  if (state === 'menu') {
    if (mouse.clicked || keyWasPressed('Space')) {
      startRound();
    }
  } else if (state === 'playing') {
    updatePlaying(dt);
  } else if (state === 'over') {
    overTimer = overTimer + dt;
    if (overTimer >= CONFIG.endScreen.replayDelay && keyWasPressed('Space')) {
      startRound();
    }
  }
}

function updatePlaying(dt) {
  roundTime = roundTime + dt;

  // Secret demo key: free coins.
  if (keyWasPressed(CONFIG.demo.secretKey)) {
    earn(CONFIG.demo.secretCoins);
  }

  startScriptedEvents();

  // While a pop-up is open, you can only click the pop-up.
  if (popup !== null) {
    updatePopup(dt);
  } else {
    updateSushi();
    updateShop();
  }

  // Heroes keep working unless HRIS has taken everything down.
  if (!systemsAreDown()) {
    updateHeroes(dt);
  }

  if (sushiSquash > 0) {
    sushiSquash = sushiSquash - dt;
  }
  if (shakeTime > 0) {
    shakeTime = shakeTime - dt;
  }
  updateFloaters(dt);
}

// Move the floating "+1" coins up, and remove old ones.
function updateFloaters(dt) {
  var stillAlive = [];
  for (var i = 0; i < floaters.length; i++) {
    var f = floaters[i];
    f.life = f.life - dt;
    f.y = f.y - CONFIG.effects.floatSpeed * dt;
    if (f.life > 0) {
      stillAlive.push(f);
    }
  }
  floaters = stillAlive;
}

// True while HRIS (or the Great Outage) has frozen everything.
function systemsAreDown() {
  return popup !== null && (popup.type === 'hris' || popup.type === 'outage');
}


// ------------------------------------------------------------
//  THE SCRIPT - starts each joke when its time comes
// ------------------------------------------------------------
function startScriptedEvents() {
  if (popup !== null || nextEvent >= CONFIG.script.length) {
    return;   // wait until the current pop-up has gone
  }
  var item = CONFIG.script[nextEvent];
  if (roundTime < item.at) {
    return;   // not time yet
  }
  nextEvent = nextEvent + 1;

  if (item.event === 'gareth') {
    popup = { type: 'gareth', visit: CONFIG.gareth.visits[item.visit], timer: 0, result: null };
    playTone(880, 0.12, 'square', 0.12);
    playTone(988, 0.12, 'square', 0.12);
  } else if (item.event === 'hris') {
    popup = { type: 'hris', crash: CONFIG.hris.crashes[item.crash], timer: 0, promised: false };
    playCrashSound();
    playTrombone(CONFIG.sadTrombone.full);
  } else if (item.event === 'outage') {
    popup = { type: 'outage', timer: 0, linesShown: 0, promised: false };
  }
}

// Sad trombone - pass CONFIG.sadTrombone.full or CONFIG.sadTrombone.quick.
function playTrombone(settings) {
  playSadTrombone(settings.notes, settings.noteLength, settings.lastNoteLength, settings.volume);
}

// Crash noise plus a screen shake.
function playCrashSound() {
  playTone(220, 0.5, 'sawtooth', 0.15);
  playTone(110, 0.8, 'square', 0.12);
  shakeTime = CONFIG.effects.shakeTime;
}


// ------------------------------------------------------------
//  THE BIG SUSHI
// ------------------------------------------------------------

// One click of the sushi, by you or by the robot.
function clickSushi(byRobot) {
  earn(CONFIG.sushi.coinsPerClick);
  sushiSquash = CONFIG.sushi.squashTime;

  // A little "+1" coin floats up from a random spot on the sushi.
  floaters.push({
    x: CONFIG.sushi.x + (Math.random() - 0.5) * 100,
    y: CONFIG.sushi.y - 40,
    life: CONFIG.effects.floatTime
  });

  if (byRobot) {
    playTone(990, 0.04, 'square', 0.03);
  } else {
    playTone(660, 0.08, 'triangle', 0.15);
  }
}

function updateSushi() {
  var s = CONFIG.sushi;
  // The clickable area is 75% of the drawing, so near-misses still count.
  var hitRadius = (s.size / 2) * 0.75;

  if (mouse.clicked && pointInCircle(mouse.x, mouse.y, s.x, s.y, hitRadius)) {
    clickSushi(false);
  }
}


// ------------------------------------------------------------
//  THE HERO SHOP
// ------------------------------------------------------------

// Where hero number i is drawn (top edge).
function heroRowY(i) {
  return CONFIG.shop.y + i * (CONFIG.shop.rowHeight + CONFIG.shop.gap);
}

// Is hero number i under the mouse?
function mouseOverHero(i) {
  var shop = CONFIG.shop;
  return pointInRect(mouse.x, mouse.y, shop.x, heroRowY(i), shop.width, shop.rowHeight);
}

// Has the sign-flipping hero (Agent Andy) been hired?
function signHasFlipped() {
  for (var i = 0; i < CONFIG.heroes.length; i++) {
    if (hired[i] && CONFIG.heroes[i].flipsSign) {
      return true;
    }
  }
  return false;
}

// Clicking a hero you can afford hires them.
// The very first hire has to get through JobPac first.
function updateShop() {
  if (!mouse.clicked) {
    return;
  }
  for (var i = 0; i < CONFIG.heroes.length; i++) {
    if (hired[i] || !mouseOverHero(i)) {
      continue;
    }
    var hero = CONFIG.heroes[i];
    if (coins < hero.price) {
      playTone(140, 0.15, 'square', 0.1);   // "can't afford" buzz
      return;
    }
    coins = coins - hero.price;
    if (!jobpacDone) {
      jobpacDone = true;
      popup = { type: 'jobpac', heroIndex: i, attempt: 0, phase: 'loading', timer: 0 };
    } else {
      hireHero(i);
    }
    return;
  }
}

function hireHero(i) {
  hired[i] = true;
  playTone(523, 0.1, 'triangle', 0.2);
  playTone(784, 0.25, 'triangle', 0.2);
}


// ------------------------------------------------------------
//  HEROES AT WORK - earning coins every second
// ------------------------------------------------------------

// Coins earned per second by heroes, not counting robot clicks.
function passiveIncome() {
  var total = 0;
  for (var i = 0; i < CONFIG.heroes.length; i++) {
    if (hired[i]) {
      total = total + CONFIG.heroes[i].coinsPerSecond;
    }
  }
  return total;
}

// How many times a second the sushi gets clicked for you.
function robotClicksPerSecond() {
  var total = 0;
  for (var i = 0; i < CONFIG.heroes.length; i++) {
    if (hired[i]) {
      total = total + CONFIG.heroes[i].autoClicksPerSecond;
    }
  }
  return total;
}

function updateHeroes(dt) {
  earn(passiveIncome() * dt);

  var rate = robotClicksPerSecond();
  if (rate > 0) {
    autoClickTimer = autoClickTimer + dt;
    var timeBetweenClicks = 1 / rate;
    while (autoClickTimer >= timeBetweenClicks) {
      autoClickTimer = autoClickTimer - timeBetweenClicks;
      clickSushi(true);
    }
  }
}


// ------------------------------------------------------------
//  POP-UPS - the jokes
// ------------------------------------------------------------

// The main button at the bottom of a pop-up box.
function popupButtonRect() {
  var p = CONFIG.popup;
  return {
    x: p.x + (p.width - p.buttonWidth) / 2,
    y: p.y + p.height - p.buttonHeight - 24,
    width: p.buttonWidth,
    height: p.buttonHeight
  };
}

function mouseClickedPopupButton() {
  var b = popupButtonRect();
  return mouse.clicked && pointInRect(mouse.x, mouse.y, b.x, b.y, b.width, b.height);
}

function updatePopup(dt) {
  popup.timer = popup.timer + dt;

  if (popup.type === 'jobpac') {
    updateJobpac();
  } else if (popup.type === 'gareth') {
    updateGareth();
  } else if (popup.type === 'hris') {
    updateHris();
  } else if (popup.type === 'outage') {
    updateOutage();
  }
}

// --- JobPac: fails, fails again, then crawls through ---
function updateJobpac() {
  var j = CONFIG.jobpac;

  if (popup.phase === 'loading') {
    if (popup.timer >= j.loadingTime) {
      popup.timer = 0;
      if (popup.attempt < j.errors.length) {
        popup.phase = 'error';
        playTrombone(CONFIG.sadTrombone.quick);
      } else {
        popup.phase = 'progress';
      }
    }
  } else if (popup.phase === 'error') {
    if (mouseClickedPopupButton()) {
      popup.attempt = popup.attempt + 1;
      popup.phase = 'loading';
      popup.timer = 0;
    }
  } else if (popup.phase === 'progress') {
    var lastStep = j.progress[j.progress.length - 1];
    if (popup.timer >= lastStep[0]) {
      popup.phase = 'done';
      popup.timer = 0;
    }
  } else if (popup.phase === 'done') {
    if (popup.timer >= j.doneHold) {
      hireHero(popup.heroIndex);
      popup = null;
    }
  }
}

// Work out the progress bar percentage from the [seconds, percent] steps.
function jobpacPercent(time) {
  var steps = CONFIG.jobpac.progress;
  for (var i = 1; i < steps.length; i++) {
    if (time <= steps[i][0]) {
      var before = steps[i - 1];
      var after = steps[i];
      var fraction = (time - before[0]) / (after[0] - before[0]);
      return before[1] + (after[1] - before[1]) * fraction;
    }
  }
  return steps[steps.length - 1][1];
}

// --- Gareth: click him before his patience runs out ---
function garethPosition() {
  var p = CONFIG.popup;
  return { x: p.x + 100, y: p.y + 150 };
}

function updateGareth() {
  var visit = popup.visit;

  if (popup.result === null) {
    var spot = garethPosition();
    var clickedHim = mouse.clicked && pointInCircle(mouse.x, mouse.y, spot.x, spot.y, 55);
    if (visit.patience > 0 && clickedHim) {
      popup.result = 'served';
      popup.timer = 0;
      earn(visit.bonus);
      playTone(1047, 0.1, 'triangle', 0.2);
      playTone(1319, 0.3, 'triangle', 0.2);
    } else if (popup.timer >= visit.patience) {
      popup.result = 'left';
      popup.timer = 0;
      playTrombone(CONFIG.sadTrombone.quick);
    }
  } else if (popup.timer >= CONFIG.gareth.resultHold) {
    popup = null;
  }
}

// --- HRIS: everything stops until you promise Lynn a rebuild ---
function updateHris() {
  if (!popup.promised) {
    if (mouseClickedPopupButton()) {
      popup.promised = true;
      popup.timer = 0;
      promisesMade = promisesMade + 1;
      playTone(440, 0.15, 'triangle', 0.15);
    }
  } else if (popup.timer >= CONFIG.hris.resultHold) {
    popup = null;
  }
}

// --- The Great Outage: everything falls over, then the end screen ---
function updateOutage() {
  var o = CONFIG.outage;

  // A crash sound as each new line appears.
  var shouldShow = 0;
  for (var i = 0; i < o.lines.length; i++) {
    if (popup.timer >= o.lines[i].at) {
      shouldShow = i + 1;
    }
  }
  if (shouldShow > popup.linesShown) {
    popup.linesShown = shouldShow;
    playCrashSound();
  }

  if (!popup.promised) {
    if (popup.timer >= o.buttonAppearsAt && mouseClickedPopupButton()) {
      popup.promised = true;
      popup.timer = 0;
      promisesMade = promisesMade + 1;
      playTrombone(CONFIG.sadTrombone.full);
    }
  } else if (popup.timer >= o.endDelay) {
    popup = null;
    state = 'over';
    overTimer = 0;
    var score = Math.floor(totalEarned);
    if (score > bestScore) {
      bestScore = score;
      newBest = true;
      saveBestScore(score);
    }
  }
}


// ------------------------------------------------------------
//  DRAW - runs every frame, after update.
// ------------------------------------------------------------
function draw() {
  // Shake: nudge everything by a random amount while shakeTime lasts.
  ctx.save();
  if (state === 'playing' && shakeTime > 0) {
    var strength = CONFIG.effects.shakeStrength;
    ctx.translate((Math.random() - 0.5) * strength * 2, (Math.random() - 0.5) * strength * 2);
  }

  drawRestaurant();

  if (state === 'menu') {
    drawMenu();
  } else if (state === 'over') {
    drawEndScreen();
  } else {
    drawSushi();
    drawFloaters();
    drawCoins();
    drawShop();
    if (popup !== null) {
      drawPopup();
    }
  }

  ctx.restore();
}

// The "+1" coins floating up, fading as they go.
function drawFloaters() {
  for (var i = 0; i < floaters.length; i++) {
    var f = floaters[i];
    ctx.globalAlpha = Math.max(0, f.life / CONFIG.effects.floatTime);
    drawText('+' + CONFIG.sushi.coinsPerClick + ' 🪙', f.x, f.y, 20, CONFIG.colours.coinText, 'center', true);
  }
  ctx.globalAlpha = 1;
}

// The back wall, the counter and the sign.
function drawRestaurant() {
  var c = CONFIG.colours;

  // Back wall
  ctx.fillStyle = c.wall;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Wooden counter along the bottom
  ctx.fillStyle = c.counter;
  ctx.fillRect(0, 470, WIDTH, 130);
  ctx.fillStyle = c.counterTop;
  ctx.fillRect(0, 462, WIDTH, 14);

  // The sign at the top - it changes once Agent Andy is hired
  var signText = CONFIG.sign.before;
  if (signHasFlipped()) {
    signText = CONFIG.sign.after;
  }
  drawRoundRect(250, 18, 400, 62, 12, c.sign);
  drawText(signText, WIDTH / 2, 50, 36, c.signText, 'center', true);
  drawText(CONFIG.sign.subtitle, WIDTH / 2, 100, 16, c.faded, 'center');
}

// The big sushi. It shrinks slightly for a moment when clicked.
function drawSushi() {
  var s = CONFIG.sushi;
  var size = s.size;
  if (sushiSquash > 0) {
    size = size * 0.9;
  }
  drawEmoji(s.emoji, s.x, s.y, size);

  // Once the robot is hired, show it hammering the sushi.
  if (robotClicksPerSecond() > 0) {
    var bob = 0;
    if (sushiSquash > 0) {
      bob = 12;
    }
    drawEmoji('🤖', s.x + 100, s.y - 80 + bob, 60);
  }
}

// The coin counter above the sushi, and coins per second below it.
function drawCoins() {
  var t = CONFIG.text;
  var x = CONFIG.sushi.x;
  drawText('🪙 ' + Math.floor(coins) + ' ' + t.coinsLabel, x, 160, 34, CONFIG.colours.coinText, 'center', true);

  var perSecond = passiveIncome() + robotClicksPerSecond() * CONFIG.sushi.coinsPerClick;
  if (systemsAreDown()) {
    perSecond = 0;
  }
  drawText('+' + perSecond + ' ' + t.perSecondLabel, x, 200, 18, CONFIG.colours.faded, 'center');
}

// The list of heroes on the right.
function drawShop() {
  var shop = CONFIG.shop;
  var c = CONFIG.colours;

  drawText(shop.title, shop.x, shop.y - 20, 22, c.text, 'left', true);

  for (var i = 0; i < CONFIG.heroes.length; i++) {
    var hero = CONFIG.heroes[i];
    var y = heroRowY(i);

    // Background colour shows: hired, affordable, or too expensive.
    var rowColour = c.rowTooDear;
    if (hired[i]) {
      rowColour = c.rowHired;
    } else if (coins >= hero.price) {
      rowColour = c.rowCanAfford;
    }
    drawRoundRect(shop.x, y, shop.width, shop.rowHeight, 10, rowColour);

    // Emoji, name, team, and their line
    drawEmoji(hero.emoji, shop.x + 34, y + shop.rowHeight / 2, 40);
    drawText(hero.name, shop.x + 66, y + 18, 18, c.text, 'left', true);
    drawText(hero.team, shop.x + 66, y + 38, 12, c.teamText, 'left');
    drawText(hero.line, shop.x + 66, y + 56, 13, c.faded, 'left');

    // Price (or "HIRED") on the right
    var priceText = '🪙 ' + hero.price;
    if (hired[i]) {
      priceText = shop.hiredText;
    }
    drawText(priceText, shop.x + shop.width - 14, y + 18, 16, c.coinText, 'right', true);
  }
}


// ------------------------------------------------------------
//  DRAWING THE POP-UPS
// ------------------------------------------------------------
function drawPopup() {
  if (popup.type === 'jobpac') {
    drawJobpac();
  } else if (popup.type === 'gareth') {
    drawGareth();
  } else if (popup.type === 'hris') {
    drawHris();
  } else if (popup.type === 'outage') {
    drawOutage();
  }
}

// Darken the game behind a pop-up.
function dimBackground(colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawPopupBox(colour) {
  var p = CONFIG.popup;
  drawRoundRect(p.x, p.y, p.width, p.height, 16, colour);
}

// dropY and spin are only used for the last button, which falls off the screen.
function drawPopupButton(text, alpha, dropY, spin) {
  var b = popupButtonRect();
  ctx.save();
  ctx.globalAlpha = alpha;
  // Move to the button's centre, so it spins around its middle.
  ctx.translate(b.x + b.width / 2, b.y + b.height / 2 + dropY);
  ctx.rotate(spin || 0);
  drawRoundRect(-b.width / 2, -b.height / 2, b.width, b.height, 10, CONFIG.colours.button);
  drawText(text, 0, 0, 20, CONFIG.colours.buttonText, 'center', true);
  ctx.restore();
}

// --- JobPac: a grey "enterprise software" window ---
function drawJobpac() {
  var p = CONFIG.popup;
  var j = CONFIG.jobpac;
  var c = CONFIG.colours;
  var middle = p.x + p.width / 2;

  dimBackground('rgba(0, 0, 0, 0.55)');
  drawPopupBox(c.jobpacBg);

  // Title bar
  drawRoundRect(p.x, p.y, p.width, 44, 16, c.jobpacBar);
  ctx.fillStyle = c.jobpacBar;
  ctx.fillRect(p.x, p.y + 24, p.width, 20);
  drawText(j.windowTitle, p.x + 20, p.y + 22, 20, '#ffffff', 'left', true);

  // The big JobPac name, so everyone knows who to blame
  drawText(j.logoText, middle, p.y + 90, j.logoSize, c.jobpacBar, 'center', true);

  if (popup.phase === 'loading') {
    // A spinning hourglass
    var spin = Math.floor(popup.timer * 4) % 2 === 0 ? '⏳' : '⌛';
    drawEmoji(spin, middle, p.y + 170, 50);
    drawText(j.signingIn, middle, p.y + 230, 22, c.jobpacText, 'center');
  } else if (popup.phase === 'error') {
    drawEmoji('❌', middle, p.y + 155, 40);
    drawWrappedText(j.errors[popup.attempt], middle, p.y + 205, p.width - 60, 22, c.jobpacError, 'center', true);
    drawPopupButton(j.retryText, 1, 0);
  } else {
    // Progress bar (also shown full during "done")
    var percent = 100;
    if (popup.phase === 'progress') {
      percent = jobpacPercent(popup.timer);
    }
    drawText(j.progressText, middle, p.y + 150, 22, c.jobpacText, 'center');
    var barX = p.x + 60;
    var barWidth = p.width - 120;
    drawRoundRect(barX, p.y + 175, barWidth, 34, 8, '#cfd8dc');
    if (percent > 0) {
      drawRoundRect(barX, p.y + 175, Math.max(16, barWidth * percent / 100), 34, 8, c.progressFill);
    }
    drawText(Math.floor(percent) + '%', middle, p.y + 240, 28, c.jobpacText, 'center', true);
    if (popup.phase === 'done') {
      drawText(j.doneText, middle, p.y + 290, 22, c.progressFill, 'center', true);
    }
  }
}

// --- Gareth: demands the unreleased iPhone ---
function drawGareth() {
  var p = CONFIG.popup;
  var g = CONFIG.gareth;
  var c = CONFIG.colours;
  var visit = popup.visit;
  var spot = garethPosition();
  var textX = p.x + 200;
  var textWidth = p.width - 230;

  dimBackground('rgba(0, 0, 0, 0.55)');
  drawPopupBox(c.popupBg);

  // Gareth, with a little shake while he's waiting
  var shake = 0;
  if (popup.result === null) {
    shake = Math.sin(popup.timer * 40) * 4;
  }
  drawEmoji(g.emoji, spot.x + shake, spot.y, 110);
  drawText(g.name + ' (' + g.role + ')', spot.x, spot.y + 85, 16, c.faded, 'center', true);

  // What he wants
  drawWrappedText('"' + visit.says + '"', textX, p.y + 70, textWidth, 22, c.text, 'left', true);

  if (popup.result === null) {
    // Patience bar, draining away
    var left = Math.max(0, visit.patience - popup.timer);
    drawText('Patience: ' + left.toFixed(1) + ' seconds', textX, p.y + 200, 18, c.coinText, 'left', true);
    drawRoundRect(textX, p.y + 218, textWidth, 20, 6, '#2b3a5c');
    if (visit.patience > 0 && left > 0) {
      drawRoundRect(textX, p.y + 218, textWidth * left / visit.patience, 20, 6, c.hrisText);
    }
    drawText(g.hint, p.x + p.width / 2, p.y + p.height - 40, 20, c.coinText, 'center', true);
  } else {
    var reply = visit.leftLine;
    var colour = c.hrisText;
    if (popup.result === 'served') {
      reply = visit.successLine + '   +' + visit.bonus + ' coins';
      colour = c.progressFill;
    }
    drawWrappedText(reply, textX, p.y + 210, textWidth, 20, colour, 'left', true);
  }
}

// --- HRIS: red screen, Lynn, and the promise button ---
function drawHris() {
  var p = CONFIG.popup;
  var h = CONFIG.hris;
  var c = CONFIG.colours;
  var crash = popup.crash;
  var middle = p.x + p.width / 2;

  // Red wash that pulses
  dimBackground(c.hrisTint);
  if (Math.floor(popup.timer * 2) % 2 === 0) {
    dimBackground('rgba(200, 0, 0, 0.15)');
  }
  drawPopupBox(c.popupBg);

  drawText(h.title, middle, p.y + 40, 34, c.hrisText, 'center', true);
  drawText(h.subtitle, middle, p.y + 78, 16, c.faded, 'center');

  // Lynn and what she says
  drawEmoji(h.lynnEmoji, p.x + 80, p.y + 165, 80);
  drawText(h.lynnName, p.x + 80, p.y + 222, 16, c.text, 'center', true);
  drawText(h.lynnRole, p.x + 80, p.y + 240, 12, c.faded, 'center');
  drawWrappedText('"' + crash.lynnSays + '"', p.x + 150, p.y + 130, p.width - 180, 20, c.text, 'left', true);
  if (crash.extra !== '') {
    drawText(crash.extra, p.x + 150, p.y + 225, 16, c.coinText, 'left', true);
  }

  if (!popup.promised) {
    drawPopupButton(h.buttonText, 1, 0);
  } else {
    var result = h.resultText.replace('{n}', promisesMade).replace('{eta}', crash.eta);
    drawText(result, middle, p.y + p.height - 50, 20, c.coinText, 'center', true);
  }
}

// --- The Great Outage: everything goes down, one line at a time ---
function drawOutage() {
  var o = CONFIG.outage;
  var c = CONFIG.colours;
  var middle = WIDTH / 2;
  var t = popup.promised ? 999 : popup.timer;   // after the promise, everything stays shown

  // Red at first, then the lights go out.
  var darkness = 0.55;
  if (t >= o.darkAt) {
    darkness = Math.min(0.94, 0.55 + (t - o.darkAt) * 0.4);
  }
  dimBackground('rgba(60, 0, 0, ' + darkness + ')');

  for (var i = 0; i < o.lines.length; i++) {
    if (t >= o.lines[i].at) {
      drawText(o.lines[i].text, middle, 150 + i * 55, 26, c.hrisText, 'center', true);
    }
  }

  if (t < o.buttonAppearsAt) {
    return;
  }

  if (!popup.promised) {
    drawPopupButton(o.buttonText, 1, 0);
  } else {
    // "fall" goes from 0 to 1: the button drops, spins and fades.
    var fall = Math.min(1, popup.timer / o.buttonFallTime);
    drawPopupButton(o.buttonText, 1 - fall, fall * fall * 300, fall * CONFIG.effects.buttonSpin);

    // Lynn's last word - drawn after the button so it stays on top.
    drawEmoji(CONFIG.hris.lynnEmoji, middle - 170, 500, 60);
    drawText('"' + o.lynnSays + '"', middle + 30, 500, 26, c.text, 'center', true);
  }
}


// ------------------------------------------------------------
//  MENU AND END SCREENS
// ------------------------------------------------------------

// The title screen shown before the game starts.
function drawMenu() {
  var t = CONFIG.text;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawEmoji('🦸', WIDTH / 2 - 70, 230, 90);
  drawEmoji('🍣', WIDTH / 2 + 70, 230, 90);
  drawText(t.title, WIDTH / 2, 340, 48, CONFIG.colours.text, 'center', true);
  drawText(t.tagline, WIDTH / 2, 390, 22, CONFIG.colours.faded, 'center');
  drawText(t.startHint, WIDTH / 2, 470, 24, CONFIG.colours.coinText, 'center', true);
}

// The final screen after the Great Outage.
function drawEndScreen() {
  var e = CONFIG.endScreen;
  var c = CONFIG.colours;
  var middle = WIDTH / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawText(e.title, middle, 150, 44, c.hrisText, 'center', true);
  drawText(e.scoreLabel + ':  🪙 ' + Math.floor(totalEarned) + ' ' + CONFIG.text.coinsLabel, middle, 250, 36, c.coinText, 'center', true);
  drawText(e.promisesLabel + ':  ' + promisesMade, middle, 310, 24, c.text, 'center');
  drawText(e.etaLine, middle, 350, 24, c.text, 'center');

  var hs = CONFIG.highScore;
  if (newBest) {
    drawText(hs.newBestText, middle, 405, 24, c.progressFill, 'center', true);
  } else {
    drawText(hs.label + ':  🪙 ' + bestScore, middle, 405, 20, c.faded, 'center');
  }

  if (overTimer >= e.replayDelay) {
    drawText(e.replayHint, middle, 460, 24, c.coinText, 'center', true);
  }
}


// ------------------------------------------------------------
//  GO!
// ------------------------------------------------------------
startGameLoop(update, draw);

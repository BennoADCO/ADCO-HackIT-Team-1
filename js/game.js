// ================================================================
//  WIPE OUT - THE GAME RULES
// ================================================================
//  This is where the game actually happens. Most changes go here.
//  It is split into sections, each with a banner like this one:
//
//    GAME STATE ........... everything the game remembers right now
//    WORKER STATS ......... your stats, including shop upgrades
//    CLOCK & DIFFICULTY ... turning seconds into "3:30 pm"
//    MONEY ................ showing ciggies as 🥤 and 🚬
//    STARTING & ENDING .... starting a fresh shift, ending one
//    UPDATE ............... runs every frame: moves everything along
//                           (includes THE TP THIEF and getting hit)
//    TRAPS ................ wet concrete, open trenches, spare portaloos
//    SUPPLY CRATE ......... the rare 📦 that refills your TP
//    DRAW ................. runs every frame: paints the picture
//    SITE SHED ............ the shop between shifts, saving, and the wipe
//    JUICE ................ screen shake, TP streamers, hit flashes, TP bursts
//    NIGHT ................ the site getting dark after 6 pm
//    START UP ............. runs once, when the page opens
//
//  Every number and word lives in config.js, so to tune the game
//  look there first.
//
//  A FEW WORDS YOU'LL SEE
//   function - a named set of steps, e.g. updateWorker. It runs when
//              something "calls" it by name: updateWorker(dt);
//   var      - short for "variable": a labelled box that holds a value
//   [ ]      - a list of things, e.g. every alien on screen
//   { }      - a bundle of named values, e.g. one alien's x, y and size
//   x, y     - a position: x is pixels from the left edge, y is pixels
//              DOWN from the top edge
//   frame    - one picture. The game draws about 60 frames a second.
//   dt       - seconds since the last frame (about 0.016). Anything that
//              moves goes speed x dt, so the game runs at the same speed
//              on every computer.
//   for (var i = 0; i < list.length; i++) { ... }
//            - "do the steps inside once for each thing in the list".
//              i is the position in the list: 0 for the first, 1 for
//              the second, and so on.
// ================================================================


// ================================================================
//  GAME STATE - everything the game remembers right now
// ================================================================
//  It all lives in one bundle called "game", so it's easy to find.
//  To peek at it while playing: press F12, click Console, type  game
//  and press Enter.

var game = {
  state: 'menu',       // which screen we're on: 'menu', 'playing', 'over' or 'shop'
  screenTime: 0,       // seconds spent on the current screen (used for blinking words)

  // --- This shift (all reset when a new shift starts) ---
  time: 0,             // seconds since the shift started
  worker: null,        // you: position, TP, hard hats...
  workerStats: null,   // your stash, hats, speed, ply and throw speed for this shift
  aliens: [],          // every alien on the site
  rolls: [],           // rolls of TP flying through the air
  pickups: [],         // TP lying on the ground, waiting to be picked up
  traps: [],           // wet concrete, trenches and spare portaloos on the site
  trapTimer: 0,        // seconds until the next trap appears
  crateTimer: 0,       // seconds until the next supply crate lands
  banners: [],         // big messages waiting to be shown, like "SMOKO!"
  eventsDone: [],      // which clock bonuses (smoko, knock-off) have already happened
  spawnTimer: 0,       // seconds until the next alien arrives
  throwLocked: false,  // true until Space is let go after starting a shift (see updateThrowing)
  shift: null,         // this shift's score: ciggies earned, aliens caught...
  particles: [],       // little squares of TP flying about, just for show (see JUICE)
  shakeTimer: 0,       // seconds of screen shake left (see JUICE)
  shakeX: 0,           // how far the site is jolted this frame, across and down
  shakeY: 0,
  emptyClickTimer: 0,  // seconds until the "no TP" click can play again

  // --- Kept between shifts ---
  upgrades: {},        // level of each shop upgrade, e.g. { stash: 2, hats: 0, ... }
  bank: 0,             // ciggies saved up to spend in the site shed
  saveWorks: true,     // false if this browser blocks saving

  // --- The site shed screen (see the SITE SHED section) ---
  shop: {
    selected: 0,           // which upgrade row is chosen (0 = the top one)
    confirmingWipe: false, // true while asking "Press Y to wipe ALL progress"
    message: '',           // the short "Bought!" / "Not enough!" line
    messageGood: true,     // true shows it green, false shows it red
    messageAt: -99,        // when that line appeared (seconds on this screen)
    deniedAt: -99          // when you last tried to buy something you couldn't (the row shakes)
  },

  // --- The look of the ground (made once when the page opens) ---
  site: { patches: [], pebbles: [] }
};

// Every thing in the game (alien, roll, pickup, trap) is a bundle with a
// "type" saying what it is. Aliens also have a "status":
//   'walking' - on its way to get you. Can be hit, and can hurt you.
//   'caught'  - fully wrapped. Flashes for a moment, then vanishes.
//   'trapped' - stuck in a trap. Sinks out of sight, then vanishes.
// Only 'walking' aliens can be aimed at, hit by rolls, or hurt you.


// ================================================================
//  WORKER STATS - your stats, including shop upgrades
// ================================================================
//  Everything the shop can improve flows through getWorkerStats().
//  It starts from the base numbers in config.js and adds on whatever
//  upgrade levels are in game.upgrades.

function getWorkerStats() {
  var stats = {};
  stats.stash = CONFIG.tp.stash + getUpgradeBonus('stash');
  stats.hats = CONFIG.worker.hats + getUpgradeBonus('hats');
  stats.speed = CONFIG.worker.speed * (1 + getUpgradeBonus('speed'));
  stats.ply = CONFIG.tp.ply + getUpgradeBonus('ply');
  stats.throwInterval = CONFIG.tp.throwInterval + getUpgradeBonus('throwSpeed');
  if (stats.throwInterval < CONFIG.tp.fastestThrowInterval) {
    stats.throwInterval = CONFIG.tp.fastestThrowInterval;
  }
  return stats;
}

// Finds an upgrade's row in the CONFIG.upgrades list by its id.
// Gives back null (meaning "nothing") if there's no such upgrade.
function findUpgrade(id) {
  for (var i = 0; i < CONFIG.upgrades.length; i++) {
    if (CONFIG.upgrades[i].id === id) {
      return CONFIG.upgrades[i];
    }
  }
  return null;
}

// What level of an upgrade you've bought (0 if none). Never above its max.
function getUpgradeLevel(id) {
  var upgrade = findUpgrade(id);
  var level = game.upgrades[id];
  if (upgrade === null || typeof level !== 'number') {
    return 0;
  }
  return clamp(level, 0, upgrade.maxLevel);
}

// How much an upgrade adds right now: its level x its per-level amount.
function getUpgradeBonus(id) {
  var upgrade = findUpgrade(id);
  if (upgrade === null) {
    return 0;
  }
  return getUpgradeLevel(id) * upgrade.perLevel;
}

// Ciggies for the NEXT level of an upgrade: base cost x the level you're
// buying. Gives back null when the upgrade is already at its max.
function getUpgradeCost(id) {
  var upgrade = findUpgrade(id);
  if (upgrade === null) {
    return null;
  }
  var level = getUpgradeLevel(id);
  if (level >= upgrade.maxLevel) {
    return null;
  }
  return upgrade.baseCost * (level + 1);
}


// ================================================================
//  CLOCK & DIFFICULTY
// ================================================================

// How far through the shift we are: 0 at 6:30 am, 1 at midnight.
function getShiftProgress() {
  return clamp(game.time / CONFIG.shift.runLength, 0, 1);
}

// The clock time right now, in hours on the 24-hour clock
// (6.5 = 6:30 am, 15.5 = 3:30 pm, 24 = midnight).
function getClockHours() {
  var s = CONFIG.shift;
  return s.startAt + getShiftProgress() * (s.endAt - s.startAt);
}

// Turns clock hours into words for the screen: 15.5 -> "3:30 pm".
function formatClock(hours) {
  var totalMinutes = Math.floor(hours * 60 + 0.001);
  var hour24 = Math.floor(totalMinutes / 60) % 24;
  var minutes = totalMinutes % 60;
  var suffix = CONFIG.text.pm;
  if (hour24 < 12) {
    suffix = CONFIG.text.am;
  }
  var hour12 = hour24 % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  var minuteText = '' + minutes;
  if (minutes < 10) {
    minuteText = '0' + minutes;
  }
  return hour12 + ':' + minuteText + ' ' + suffix;
}

// How hard things are right now: 0 at the start of the shift, 1 at
// midnight, bent by the "curve" setting in config.js.
function getDifficulty() {
  return Math.pow(getShiftProgress(), CONFIG.difficulty.curve);
}

// Seconds between new aliens right now.
function getSpawnInterval() {
  var d = CONFIG.difficulty;
  return lerp(d.spawnIntervalStart, d.spawnIntervalEnd, getDifficulty());
}

// Every alien's speed is multiplied by this right now.
function getAlienSpeedMultiplier() {
  var d = CONFIG.difficulty;
  return lerp(d.speedMultiplierStart, d.speedMultiplierEnd, getDifficulty());
}


// ================================================================
//  MONEY - showing ciggies as 🥤 and 🚬
// ================================================================
//  The game only ever counts ciggies. Every 10 are SHOWN as an energy
//  drink, so 37 ciggies shows as "🥤 3  🚬 7".
//  "compact" leaves out a part that is zero, e.g. "🥤 2" instead of
//  "🥤 2  🚬 0" (handy for prices and payouts).

function formatCiggies(ciggies, compact) {
  var whole = Math.floor(ciggies);
  var perDrink = CONFIG.currency.ciggiesPerDrink;
  var drinks = Math.floor(whole / perDrink);
  var loose = whole % perDrink;
  var drinkText = CONFIG.currency.drinkEmoji + ' ' + drinks;
  var ciggieText = CONFIG.currency.ciggieEmoji + ' ' + loose;
  if (compact) {
    if (drinks === 0) {
      return ciggieText;
    }
    if (loose === 0) {
      return drinkText;
    }
  }
  return drinkText + '  ' + ciggieText;
}


// ================================================================
//  STARTING & ENDING
// ================================================================

// Switches to another screen and restarts that screen's timer.
function changeScreen(newState) {
  game.state = newState;
  game.screenTime = 0;
}

// A fresh worker, standing next to the portaloo with a full stash.
function makeWorker(stats) {
  return {
    type: 'worker',
    x: CONFIG.worker.startX,
    y: CONFIG.worker.startY,
    size: CONFIG.worker.size,
    tp: stats.stash,          // rolls in your pockets right now
    hats: stats.hats,         // hard hats left right now
    invincibleTimer: 0,       // seconds of flashing safety left
    throwCooldown: 0          // seconds until you can throw again
  };
}

// Wipes everything about the current shift, ready for a new one.
// (Upgrades and the bank are NOT touched - they carry over.)
function resetRun() {
  game.workerStats = getWorkerStats();
  game.worker = makeWorker(game.workerStats);
  game.time = 0;
  game.aliens = [];
  game.rolls = [];
  game.pickups = [];
  game.traps = [];
  game.trapTimer = CONFIG.traps.firstAfter;
  game.crateTimer = randRange(CONFIG.crate.everyMin, CONFIG.crate.everyMax);
  game.banners = [];
  game.eventsDone = [];
  game.spawnTimer = CONFIG.difficulty.firstAlienAfter;
  game.shift = {
    ciggies: 0,        // earned this shift
    caught: 0,         // aliens caught this shift (thrown TP and traps)
    won: false        // true if you made it to midnight
  };
}

function startShift() {
  resetRun();
  resetJuice();   // no shake or flying bits left over from last shift (see JUICE)
  leaveShop();    // no old shed messages waiting for next time (see SITE SHED)
  // If Space is still held from the key press that started the shift,
  // don't let it fire a throw. You have to let go of Space first.
  game.throwLocked = true;
  changeScreen('playing');
}

// The shift is over: won is true for midnight, false for overwhelmed.
function endShift(won) {
  game.shift.won = won;
  if (won) {
    game.shift.ciggies += CONFIG.shift.midnightBonus;
  }
  game.bank += game.shift.ciggies;
  saveProgress();   // keep the money safe even if the page is closed now
  playShiftEndSound(won);   // midnight bell, or sad trombone (see JUICE)
  changeScreen('over');
}


// ================================================================
//  UPDATE - runs every frame, moves everything along
// ================================================================
//  engine.js calls update(dt) about 60 times a second. It hands over
//  to a different function depending on which screen we're on.

function update(dt) {
  game.screenTime += dt;
  if (game.state === 'menu') {
    updateMenu();
  } else if (game.state === 'playing') {
    updatePlaying(dt);
  } else if (game.state === 'over') {
    updateOver();
  } else if (game.state === 'shop') {
    updateShop();
  }
}

function updateMenu() {
  if (wasPressed('Space')) {
    startShift();
  }
}

function updateOver() {
  // Ignore Space for a moment, so someone mashing Space as they go
  // down doesn't skip straight past their score.
  if (game.screenTime >= CONFIG.screens.overInputDelay && wasPressed('Space')) {
    changeScreen('shop');
  }
}

// updateShop() lives in the SITE SHED section further down.

// One frame of actual play. The order matters a little:
// the clock first (it can end the shift with a win), and getting hit
// last (it can end the shift with a loss), so nothing else scores
// after the shift is over.
function updatePlaying(dt) {
  game.time += dt;
  if (game.time >= CONFIG.shift.runLength) {
    game.time = CONFIG.shift.runLength;
    endShift(true);
    return;
  }

  updateClockEvents();
  updateWorker(dt);
  updateThrowing(dt);
  updateSpawning(dt);
  updateAliens(dt);
  updateRolls(dt);
  updateTraps(dt);
  updateSupplyCrate(dt);
  updatePickups(dt);
  updateBanners(dt);
  updateJuice(dt);
  checkAlienHitsWorker();
}


// ----------------------------------------------------------------
//  Clock bonuses: smoko and knock-off
// ----------------------------------------------------------------
function updateClockEvents() {
  var now = getClockHours();
  var events = CONFIG.shift.events;
  for (var i = 0; i < events.length; i++) {
    if (!game.eventsDone[i] && now >= events[i].at) {
      game.eventsDone[i] = true;
      game.shift.ciggies += events[i].ciggies;
      showBanner(events[i].title, events[i].subtitle, '+ ' + formatCiggies(events[i].ciggies, true));
      playSound('siren');
    }
  }
}


// ----------------------------------------------------------------
//  The worker: walking about
// ----------------------------------------------------------------
function updateWorker(dt) {
  var w = game.worker;

  // Which way do the arrow keys point? -1, 0 or +1 across and down.
  var moveX = 0;
  var moveY = 0;
  if (isDown('ArrowLeft')) {
    moveX = moveX - 1;
  }
  if (isDown('ArrowRight')) {
    moveX = moveX + 1;
  }
  if (isDown('ArrowUp')) {
    moveY = moveY - 1;
  }
  if (isDown('ArrowDown')) {
    moveY = moveY + 1;
  }

  // Going diagonally would otherwise be about 1.4 times faster, so
  // shrink the move to the same length whichever way you're going.
  var length = Math.sqrt(moveX * moveX + moveY * moveY);
  if (length > 0) {
    moveX = moveX / length;
    moveY = moveY / length;
  }

  w.x = w.x + moveX * game.workerStats.speed * dt;
  w.y = w.y + moveY * game.workerStats.speed * dt;

  // Stay on the site: not off the edges, and not up under the top bar.
  var half = w.size / 2;
  w.x = clamp(w.x, half, WIDTH - half);
  w.y = clamp(w.y, CONFIG.hud.height + half, HEIGHT - half);

  if (w.invincibleTimer > 0) {
    w.invincibleTimer = w.invincibleTimer - dt;
  }
}


// ----------------------------------------------------------------
//  Throwing TP
// ----------------------------------------------------------------
//  Tap Space for one throw, or hold it to keep throwing at your throw
//  rate. Each throw goes at the nearest alien that still needs wrapping.
//  No alien to aim at means no throw, and no TP used.
function updateThrowing(dt) {
  var w = game.worker;

  if (w.throwCooldown > 0) {
    w.throwCooldown = w.throwCooldown - dt;
  }

  // Right after a shift starts, wait until Space has been let go once.
  if (game.throwLocked) {
    if (isDown('Space')) {
      return;
    }
    game.throwLocked = false;
  }

  var wantsToThrow = isDown('Space') || wasPressed('Space');
  if (wantsToThrow && w.throwCooldown <= 0 && w.tp > 0) {
    var target = findThrowTarget();
    if (target !== null) {
      throwRoll(target);
      w.throwCooldown = w.throwCooldown + game.workerStats.throwInterval;
    }
  }
  // Space with no TP left: a dry little click, so you know you're out.
  if (wantsToThrow && w.tp <= 0) {
    playEmptyClick();
  }
}

// The nearest alien worth throwing at, or null if there isn't one.
function findThrowTarget() {
  var w = game.worker;
  var best = null;
  var bestDistance = Infinity;
  for (var i = 0; i < game.aliens.length; i++) {
    var alien = game.aliens[i];
    if (canBeTargeted(alien)) {
      var d = distance(w.x, w.y, alien.x, alien.y);
      if (d < bestDistance) {
        best = alien;
        bestDistance = d;
      }
    }
  }
  return best;
}

// Is this alien worth a roll?
function canBeTargeted(alien) {
  // Already caught, or stuck in a trap: leave it.
  if (alien.status !== 'walking') {
    return false;
  }
  // Not on screen yet: you can't see it, so don't throw at it.
  if (!isOnScreen(alien.x, alien.y, 0)) {
    return false;
  }
  // Rolls already in the air will finish it off: don't waste TP.
  if (alien.wraps + alien.pendingWraps >= alien.wrapsNeeded) {
    return false;
  }
  return true;
}

// Is this point on the screen? "margin" lets it be that many pixels past the edge.
function isOnScreen(x, y, margin) {
  return x >= -margin && x <= WIDTH + margin && y >= -margin && y <= HEIGHT + margin;
}

// Throws one roll from the worker, straight at where the alien is NOW.
// (It doesn't follow the alien, so a fast one can dodge.)
function throwRoll(target) {
  var w = game.worker;
  var dx = target.x - w.x;
  var dy = target.y - w.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  if (d < 1) {
    // The alien is right on top of you: throw straight up. It'll hit anyway.
    dx = 0;
    dy = -1;
    d = 1;
  }
  var speed = CONFIG.tp.rollSpeed;
  var ply = game.workerStats.ply;

  game.rolls.push({
    type: 'roll',
    x: w.x,
    y: w.y,
    vx: (dx / d) * speed,   // speed across, pixels per second
    vy: (dy / d) * speed,   // speed down, pixels per second
    size: CONFIG.tp.rollSize,
    spin: 0,                // how far round it has turned (just for looks)
    target: target,         // the alien it was thrown at
    wraps: ply              // wraps it adds when it hits
  });

  // Remember this roll is on its way, so the next throw aims elsewhere.
  target.pendingWraps = target.pendingWraps + ply;
  w.tp = w.tp - 1;
  playSound('throw');
}


// ----------------------------------------------------------------
//  Flying rolls
// ----------------------------------------------------------------
//  Each roll flies in a straight line. It wraps the first walking alien
//  it touches. A roll that misses flies off the screen and is lost.
//
//  We go through the list BACKWARDS (from the last roll to the first)
//  so that taking a roll out of the list doesn't make us skip the next one.
function updateRolls(dt) {
  for (var i = game.rolls.length - 1; i >= 0; i--) {
    var roll = game.rolls[i];
    roll.x = roll.x + roll.vx * dt;
    roll.y = roll.y + roll.vy * dt;
    roll.spin = roll.spin + CONFIG.tp.spinSpeed * dt;
    updateRollTrail(roll, dt);   // the TP streamer behind it (see JUICE)

    var hitAlien = findAlienTouchingRoll(roll);
    if (hitAlien !== null) {
      removeRoll(i);
      wrapAlien(hitAlien, roll.wraps);
    } else if (!isOnScreen(roll.x, roll.y, CONFIG.tp.offScreenMargin)) {
      removeRoll(i);
    }
  }
}

// Takes roll number "index" out of the list. Its target no longer
// has this roll on the way, so it can be aimed at again if needed.
function removeRoll(index) {
  var roll = game.rolls[index];
  roll.target.pendingWraps = Math.max(0, roll.target.pendingWraps - roll.wraps);
  game.rolls.splice(index, 1);   // splice = cut it out of the list
}

// The walking alien this roll is touching, or null. The roll's own
// target gets first dibs, then any other alien in the way.
function findAlienTouchingRoll(roll) {
  var rollRadius = hitRadius(roll.size);
  if (rollTouchesAlien(roll, rollRadius, roll.target)) {
    return roll.target;
  }
  for (var i = 0; i < game.aliens.length; i++) {
    if (rollTouchesAlien(roll, rollRadius, game.aliens[i])) {
      return game.aliens[i];
    }
  }
  return null;
}

function rollTouchesAlien(roll, rollRadius, alien) {
  if (alien.status !== 'walking') {
    return false;
  }
  return circlesTouch(roll.x, roll.y, rollRadius, alien.x, alien.y, hitRadius(alien.size));
}

// The "touching" circle for something drawn at this size. It's a bit
// smaller than the picture (see hitboxScale in config.js), which feels fair.
function hitRadius(size) {
  return (size * CONFIG.hitboxScale) / 2;
}


// ----------------------------------------------------------------
//  Wrapping and catching aliens
// ----------------------------------------------------------------

// A roll hit this alien: add wraps. Fully wrapped means caught.
function wrapAlien(alien, wraps) {
  playSound('splat');
  flashAlien(alien);   // it glows white for a moment (see JUICE)
  alien.wraps = alien.wraps + wraps;
  if (alien.wraps >= alien.wrapsNeeded) {
    alien.wraps = alien.wrapsNeeded;
    playSound('catch');
    catchAlien(alien, false);
  }
}

// THE place where an alien counts as caught, however it happened.
//   byTrap = false : wrapped up by thrown TP. It flashes, then vanishes.
//   byTrap = true  : caught by a trap. Pays double. It sinks, then vanishes.
// Pays the ciggies, counts the catch, and maybe drops some TP.
function catchAlien(alien, byTrap) {
  // Never pay out twice for the same alien.
  if (alien.counted) {
    return;
  }
  alien.counted = true;
  spawnBurst(alien.x, alien.y);   // a puff of TP squares (see JUICE)

  var kind = CONFIG.aliens[alien.type];
  var pay = kind.ciggies;
  if (byTrap) {
    pay = pay * CONFIG.traps.catchMultiplier;
    alien.status = 'trapped';
    alien.goneTimer = CONFIG.traps.sinkTime;
  } else {
    alien.status = 'caught';
    alien.goneTimer = CONFIG.wrapping.caughtFlashTime;
  }
  game.shift.ciggies = game.shift.ciggies + pay;
  game.shift.caught = game.shift.caught + 1;

  maybeDropTP(alien);
  coughUpStolen(alien);   // a TP Thief spits out everything it ate (see THE TP THIEF)
}

// Roll the dice: does this alien drop some TP?
function maybeDropTP(alien) {
  var kind = CONFIG.aliens[alien.type];
  if (Math.random() < kind.dropChance) {
    spawnTPPickup(alien.x, alien.y, randInt(kind.dropMin, kind.dropMax));
  }
}


// ----------------------------------------------------------------
//  Aliens arriving
// ----------------------------------------------------------------
function updateSpawning(dt) {
  game.spawnTimer = game.spawnTimer - dt;
  if (game.spawnTimer <= 0) {
    if (game.aliens.length < CONFIG.difficulty.maxAliens) {
      var typeName = pickAlienType();
      if (typeName !== null) {
        spawnAlien(typeName);
      }
    }
    game.spawnTimer = game.spawnTimer + getSpawnInterval();
  }
}

// Picks which kind of alien arrives next, from the kinds in config.js
// that have turned up by now. Kinds with a bigger "weight" come more often.
// Gives back null if no kind has arrived yet.
function pickAlienType() {
  var now = getClockHours();
  var arrived = [];
  var totalWeight = 0;
  for (var name in CONFIG.aliens) {   // go through every kind of alien in config.js
    // (isAlienKindFull: skip kinds already at their maxAtOnce limit)
    if (CONFIG.aliens[name].arrivesAt <= now && !isAlienKindFull(name)) {
      arrived.push(name);
      totalWeight = totalWeight + getSpawnWeight(CONFIG.aliens[name]);
    }
  }
  if (arrived.length === 0) {
    return null;
  }

  // Like a raffle: each kind holds as many tickets as its weight.
  var ticket = Math.random() * totalWeight;
  for (var i = 0; i < arrived.length; i++) {
    ticket = ticket - getSpawnWeight(CONFIG.aliens[arrived[i]]);
    if (ticket < 0) {
      return arrived[i];
    }
  }
  return arrived[arrived.length - 1];
}

// An alien kind's weight, or 1 if its row doesn't have one.
function getSpawnWeight(kind) {
  if (typeof kind.weight === 'number') {
    return kind.weight;
  }
  return 1;
}

// Makes a new alien of this kind just outside a random edge of the screen.
// Gives back the new alien, in case the caller wants to add to it.
function spawnAlien(typeName) {
  var kind = CONFIG.aliens[typeName];
  var spot = pickSpawnSpot(kind.size);
  var alien = {
    type: typeName,          // which row of CONFIG.aliens it comes from
    x: spot.x,
    y: spot.y,
    size: kind.size,
    speed: kind.speed,       // walking speed before the clock speeds it up
    wraps: 0,                // wraps of TP on it so far
    pendingWraps: 0,         // wraps still flying towards it
    wrapsNeeded: kind.wraps, // wraps to catch it
    status: 'walking',
    goneTimer: 0,            // once caught: seconds until it vanishes
    counted: false,          // true once it has been paid out as caught
    stolen: [],              // pickups a TP Thief has eaten (always empty for other aliens)
    bobPhase: randRange(0, Math.PI * 2)   // so they don't all bob in step
  };
  game.aliens.push(alien);
  return alien;
}

// A random spot just off one of the four edges. Tries a few times to
// find one that isn't right next to you, so nothing appears in your face.
function pickSpawnSpot(size) {
  var w = game.worker;
  var best = null;
  var bestDistance = -1;
  for (var attempt = 0; attempt < 10; attempt++) {
    var spot = randomEdgeSpot(size / 2 + CONFIG.difficulty.spawnOutside);
    var d = distance(spot.x, spot.y, w.x, w.y);
    if (d >= CONFIG.difficulty.safeSpawnDistance) {
      return spot;
    }
    if (d > bestDistance) {
      best = spot;
      bestDistance = d;
    }
  }
  return best;
}

// A random spot "outside" pixels past a random edge of the screen.
function randomEdgeSpot(outside) {
  var side = randInt(0, 3);
  if (side === 0) {
    // Top edge: they come out from under the top bar, so they're not hidden behind it for long.
    return { x: randRange(0, WIDTH), y: CONFIG.hud.height - outside };
  }
  if (side === 1) {
    return { x: randRange(0, WIDTH), y: HEIGHT + outside };    // bottom edge
  }
  if (side === 2) {
    return { x: -outside, y: randRange(CONFIG.hud.height, HEIGHT) };          // left edge
  }
  return { x: WIDTH + outside, y: randRange(CONFIG.hud.height, HEIGHT) };     // right edge
}


// ----------------------------------------------------------------
//  Aliens moving (and vanishing once caught)
// ----------------------------------------------------------------
function updateAliens(dt) {
  var speedMultiplier = getAlienSpeedMultiplier();

  // Backwards, because caught aliens get taken out of the list.
  for (var i = game.aliens.length - 1; i >= 0; i--) {
    var alien = game.aliens[i];
    if (alien.status === 'walking') {
      if (isThief(alien)) {
        moveThief(alien, speedMultiplier, dt);   // see THE TP THIEF
      } else {
        moveAlienTowardsWorker(alien, speedMultiplier, dt);
      }
    } else if (alien.status === 'caught' || alien.status === 'trapped') {
      alien.goneTimer = alien.goneTimer - dt;
      if (alien.goneTimer <= 0) {
        game.aliens.splice(i, 1);
      }
    }
  }

  pushAliensApart(dt);
}

// Walks straight at the worker. No clever pathfinding.
function moveAlienTowardsWorker(alien, speedMultiplier, dt) {
  var w = game.worker;
  var dx = w.x - alien.x;
  var dy = w.y - alien.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  if (d > 1) {
    var step = alien.speed * speedMultiplier * dt;
    alien.x = alien.x + (dx / d) * step;
    alien.y = alien.y + (dy / d) * step;
  }
}

// Walking aliens that bunch up nudge each other apart a little, so a
// crowd looks like a crowd and not one alien. (Set pushSpeed to 0 in
// config.js to switch this off.)
function pushAliensApart(dt) {
  var crowd = CONFIG.alienCrowd;
  var push = crowd.pushSpeed * dt;
  if (push <= 0) {
    return;
  }
  for (var i = 0; i < game.aliens.length; i++) {
    var a = game.aliens[i];
    if (a.status === 'walking') {
      for (var j = i + 1; j < game.aliens.length; j++) {
        var b = game.aliens[j];
        if (b.status === 'walking') {
          nudgeApart(a, b, ((a.size + b.size) / 2) * crowd.personalSpace, push);
        }
      }
    }
  }
}

function nudgeApart(a, b, minGap, push) {
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  if (d >= minGap) {
    return;
  }
  if (d < 0.01) {
    // Exactly on top of each other: pick a direction.
    dx = 1;
    dy = 0;
    d = 1;
  }
  a.x = a.x - (dx / d) * push;
  a.y = a.y - (dy / d) * push;
  b.x = b.x + (dx / d) * push;
  b.y = b.y + (dy / d) * push;
}


// ----------------------------------------------------------------
//  THE TP THIEF 🦑 (any alien with steals: true in config.js)
// ----------------------------------------------------------------
//  The Thief doesn't chase you, and touching it doesn't hurt. It runs
//  for the nearest pickup on the ground (TP or a supply crate), eats
//  it, and keeps it in its "stolen" list. With nothing to steal it
//  loiters about the middle of the site. Wrap it up (or trap it) and
//  catchAlien calls coughUpStolen, which spits it all back out.
//  Its numbers live in the "thief" section of config.js.

// Does this alien steal instead of chasing you?
function isThief(alien) {
  return CONFIG.aliens[alien.type].steals === true;
}

// Can touching this alien knock your hard hat off? Yes, unless its
// row in config.js says  hurts: false.
function alienCanHurt(alien) {
  return CONFIG.aliens[alien.type].hurts !== false;
}

// Used when picking the next alien: are there already as many of this
// kind walking about as its maxAtOnce setting allows? A kind with no
// maxAtOnce is never full.
function isAlienKindFull(typeName) {
  var max = CONFIG.aliens[typeName].maxAtOnce;
  if (typeof max !== 'number') {
    return false;
  }
  var count = 0;
  for (var i = 0; i < game.aliens.length; i++) {
    if (game.aliens[i].type === typeName && game.aliens[i].status === 'walking') {
      count = count + 1;
    }
  }
  return count >= max;
}

// One frame of a Thief's life: go for the nearest pickup and eat it,
// or loiter near the middle of the site if there's nothing to steal.
function moveThief(alien, speedMultiplier, dt) {
  var t = CONFIG.thief;
  var speed = alien.speed * speedMultiplier;

  var pickup = thiefFindNearestPickup(alien);
  if (pickup !== null) {
    thiefStepTowards(alien, pickup.x, pickup.y, speed * dt);
    var pickupSize = pickup.size || CONFIG.pickups.size;
    if (circlesTouch(alien.x, alien.y, hitRadius(alien.size), pickup.x, pickup.y, hitRadius(pickupSize))) {
      thiefEat(alien, pickup);
    }
    return;
  }

  // Nothing to steal. Stroll to a spot near the middle; once there,
  // pick another spot, so it mills about instead of standing still.
  if (!alien.wanderSpot ||
      distance(alien.x, alien.y, alien.wanderSpot.x, alien.wanderSpot.y) <= t.wanderArriveDistance) {
    alien.wanderSpot = thiefPickWanderSpot();
  }
  thiefStepTowards(alien, alien.wanderSpot.x, alien.wanderSpot.y, speed * t.wanderSpeedShare * dt);
}

// The pickup on the ground (of any kind) closest to this Thief, or
// null if there are none.
function thiefFindNearestPickup(alien) {
  var best = null;
  var bestDistance = Infinity;
  for (var i = 0; i < game.pickups.length; i++) {
    var d = distance(alien.x, alien.y, game.pickups[i].x, game.pickups[i].y);
    if (d < bestDistance) {
      best = game.pickups[i];
      bestDistance = d;
    }
  }
  return best;
}

// A random spot within wanderRadius of the middle of the site.
// (Math.sqrt spreads the spots evenly, instead of bunching them in the middle.)
function thiefPickWanderSpot() {
  var middleX = WIDTH / 2;
  var middleY = (CONFIG.hud.height + HEIGHT) / 2;
  var angle = randRange(0, Math.PI * 2);
  var howFar = CONFIG.thief.wanderRadius * Math.sqrt(Math.random());
  return {
    x: middleX + Math.cos(angle) * howFar,
    y: middleY + Math.sin(angle) * howFar
  };
}

// Moves this thing up to "step" pixels towards (x, y), without overshooting.
function thiefStepTowards(thing, x, y, step) {
  var dx = x - thing.x;
  var dy = y - thing.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  if (d <= step) {
    thing.x = x;
    thing.y = y;
  } else {
    thing.x = thing.x + (dx / d) * step;
    thing.y = thing.y + (dy / d) * step;
  }
}

// Gulp. Takes the pickup off the ground and into the Thief's "stolen" list.
function thiefEat(alien, pickup) {
  var index = game.pickups.indexOf(pickup);   // where it is in the list (-1 = not there)
  if (index === -1) {
    return;
  }
  game.pickups.splice(index, 1);
  alien.stolen.push(pickup);
}

// Called from catchAlien for EVERY caught alien. Anything this alien
// stole lands back on the ground in a ring around where it was caught:
// TP keeps its roll count, and a crate is still a crate.
function coughUpStolen(alien) {
  if (!alien.stolen || alien.stolen.length === 0) {
    return;
  }
  var t = CONFIG.thief;
  var count = alien.stolen.length;
  var firstAngle = randRange(0, Math.PI * 2);
  for (var i = 0; i < count; i++) {
    var pickup = alien.stolen[i];
    var angle = firstAngle + (i / count) * Math.PI * 2;   // spaced evenly round the ring
    var half = (pickup.size || CONFIG.pickups.size) / 2;
    // Kept on the site, so you can always reach it.
    pickup.x = clamp(alien.x + Math.cos(angle) * t.coughUpSpread, half, WIDTH - half);
    pickup.y = clamp(alien.y + Math.sin(angle) * t.coughUpSpread, CONFIG.hud.height + half, HEIGHT - half);
    pickup.timeLeft = t.coughUpLifetime;
    game.pickups.push(pickup);
  }
  alien.stolen = [];
}

// Draws what a Thief is carrying over its head, e.g. "🧻 3  📦 1".
// Does nothing for an alien that isn't carrying anything.
function drawThiefLoot(alien, y) {
  if (!alien.stolen || alien.stolen.length === 0) {
    return;
  }
  var t = CONFIG.thief;
  var rolls = 0;
  var crates = 0;
  for (var i = 0; i < alien.stolen.length; i++) {
    if (alien.stolen[i].type === 'tp') {
      rolls = rolls + alien.stolen[i].rolls;
    } else if (alien.stolen[i].type === 'crate') {
      crates = crates + 1;
    }
  }
  var label = '';
  if (rolls > 0) {
    label = CONFIG.tp.emoji + ' ' + rolls;
  }
  if (crates > 0) {
    if (label !== '') {
      label = label + '  ';
    }
    label = label + CONFIG.crate.emoji + ' ' + crates;
  }
  if (label === '') {
    return;
  }
  drawText(label, alien.x, y - alien.size / 2 - t.labelGap - t.labelSize / 2, {
    size: t.labelSize, bold: true, color: CONFIG.colors.text, outline: CONFIG.colors.outline, align: 'center'
  });
}


// ----------------------------------------------------------------
//  Getting hit: losing hard hats
// ----------------------------------------------------------------
function checkAlienHitsWorker() {
  var w = game.worker;
  if (w.invincibleTimer > 0) {
    return;   // still flashing from the last hit
  }
  var workerRadius = hitRadius(w.size);
  for (var i = 0; i < game.aliens.length; i++) {
    var alien = game.aliens[i];
    if (alien.status === 'walking' && alienCanHurt(alien) &&
        circlesTouch(w.x, w.y, workerRadius, alien.x, alien.y, hitRadius(alien.size))) {
      loseHat();
      return;
    }
  }
}

function loseHat() {
  var w = game.worker;
  playSound('bonk');
  startShake();   // the site shakes (see JUICE)
  w.hats = w.hats - 1;
  if (w.hats <= 0) {
    w.hats = 0;
    endShift(false);
  } else {
    w.invincibleTimer = CONFIG.worker.invincibleTime;
  }
}


// ================================================================
//  TRAPS - wet concrete, open trenches and spare portaloos
// ================================================================
//  Every so often a trap appears somewhere on the site. Any walking
//  alien that touches one is caught, pays double ciggies, and sinks
//  out of sight. Traps never hurt you, so walk over them all you like.
//
//    concrete - a grey slab. Catches every alien that walks in, until
//               it sets and goes.
//    trench   - a dark hole. Swallows a few aliens, then gets filled
//               back in with dirt ("backfilled") and goes.
//    portaloo - drags nearby aliens towards it, slams the door on them,
//               and goes once it's full.
//
//  All their numbers are in the TRAPS part of config.js.
//  Each trap in game.traps is a bundle like this:
//    { type: 'concrete', x: 300, y: 400, width: 140, height: 90, timeLeft: 12, ... }
//  x and y are the MIDDLE of the trap.

// The kinds of trap the game knows how to build. Each one needs a
// matching block in the TRAPS part of config.js.
var TRAP_TYPES = ['concrete', 'trench', 'portaloo'];

function updateTraps(dt) {
  updateTrapSpawning(dt);

  // Backwards, because finished traps get taken out of the list.
  for (var i = game.traps.length - 1; i >= 0; i--) {
    var trap = game.traps[i];
    trap.age = trap.age + dt;
    if (trap.doorTimer > 0) {
      trap.doorTimer = trap.doorTimer - dt;
    }

    if (trap.full) {
      // Full up: it's being backfilled, or fading away. Then it's gone.
      trap.closeTimer = trap.closeTimer - dt;
      if (trap.closeTimer <= 0) {
        game.traps.splice(i, 1);
      }
    } else {
      trap.timeLeft = trap.timeLeft - dt;
      if (trap.timeLeft <= 0) {
        game.traps.splice(i, 1);
      } else {
        if (trap.type === 'portaloo') {
          pullAliensTowards(trap, dt);
        }
        catchAliensInTrap(trap);
      }
    }
  }

  slideTrappedAliens(dt);
}


// ----------------------------------------------------------------
//  Traps: when and where a new one appears
// ----------------------------------------------------------------
function updateTrapSpawning(dt) {
  var t = CONFIG.traps;

  // While you're out of TP the countdown runs faster, so traps come
  // more often. (outOfTpWait 0.5 = half the wait = counts down twice as fast.)
  var tick = dt;
  if (game.worker.tp <= 0 && t.outOfTpWait > 0) {
    tick = dt / t.outOfTpWait;
  }
  game.trapTimer = game.trapTimer - tick;
  if (game.trapTimer > 0) {
    return;
  }

  var placed = false;
  var typeName = pickTrapType();
  if (typeName !== null) {
    placed = spawnTrap(typeName);
  }
  if (placed) {
    game.trapTimer = randRange(t.everyMin, t.everyMax);
  } else {
    // No room right now (too many traps, or you're standing in the way). Try again soon.
    game.trapTimer = t.retryAfter;
  }
}

// Picks which kind of trap appears next, like a raffle: each kind holds
// as many tickets as its weight. Only kinds that have turned up by now,
// and aren't already at their limit, go in the draw.
// Gives back null if no kind can appear right now.
function pickTrapType() {
  var now = getClockHours();
  var choices = [];
  var totalWeight = 0;
  for (var i = 0; i < TRAP_TYPES.length; i++) {
    var name = TRAP_TYPES[i];
    var kind = CONFIG.traps[name];
    if (kind && kind.weight > 0 && kind.arrivesAt <= now && countTraps(name) < kind.maxOnScreen) {
      choices.push(name);
      totalWeight = totalWeight + kind.weight;
    }
  }
  if (choices.length === 0) {
    return null;
  }

  var ticket = Math.random() * totalWeight;
  for (var j = 0; j < choices.length; j++) {
    ticket = ticket - CONFIG.traps[choices[j]].weight;
    if (ticket < 0) {
      return choices[j];
    }
  }
  return choices[choices.length - 1];
}

// How many traps of this kind are on the site right now.
function countTraps(typeName) {
  var count = 0;
  for (var i = 0; i < game.traps.length; i++) {
    if (game.traps[i].type === typeName) {
      count = count + 1;
    }
  }
  return count;
}

// Puts a new trap of this kind on the site.
// Gives back true if it found a spot for it, false if it didn't.
function spawnTrap(typeName) {
  var kind = CONFIG.traps[typeName];
  var spot = findTrapSpot(kind.width, kind.height);
  if (spot === null) {
    return false;
  }
  var trap = {
    type: typeName,
    x: spot.x,
    y: spot.y,
    width: kind.width,
    height: kind.height,
    timeLeft: kind.lifetime,   // seconds until it goes
    age: 0,                    // seconds since it appeared
    held: 0,                   // aliens it has caught so far
    full: false,               // true once a trench or portaloo can't take any more
    closeTimer: 0,             // once full: seconds until it's gone
    doorTimer: 0,              // portaloo only: seconds the door stays slammed shut
    footprints: []             // concrete only: boot prints in the slab
  };
  if (typeName === 'concrete') {
    trap.footprints = makeFootprints(kind.footprints, kind.width);
  }
  game.traps.push(trap);
  return true;
}

// A random spot for a trap this size: on the site, clear of the top bar,
// not too close to you, and not on top of another trap.
// Gives back null if none of the spots it tried were any good.
function findTrapSpot(width, height) {
  var t = CONFIG.traps;
  var w = game.worker;
  var left = width / 2 + t.edgeGap;
  var right = WIDTH - width / 2 - t.edgeGap;
  var top = CONFIG.hud.height + height / 2 + t.edgeGap;
  var bottom = HEIGHT - height / 2 - t.edgeGap;

  for (var attempt = 0; attempt < t.spotTries; attempt++) {
    var x = randRange(left, right);
    var y = randRange(top, bottom);
    var farFromYou = distanceToBox(w.x, w.y, x, y, width, height) >= t.safeDistance;
    if (farFromYou && !overlapsAnyTrap(x, y, width, height)) {
      return { x: x, y: y };
    }
  }
  return null;
}

// Pixels from a point to the nearest edge of a box (0 if the point is inside it).
// boxX, boxY is the middle of the box.
function distanceToBox(pointX, pointY, boxX, boxY, width, height) {
  var nearestX = clamp(pointX, boxX - width / 2, boxX + width / 2);
  var nearestY = clamp(pointY, boxY - height / 2, boxY + height / 2);
  return distance(pointX, pointY, nearestX, nearestY);
}

// Would a trap this size at (x, y) overlap (or crowd) a trap already on the site?
function overlapsAnyTrap(x, y, width, height) {
  var gap = CONFIG.traps.edgeGap;
  for (var i = 0; i < game.traps.length; i++) {
    var other = game.traps[i];
    var tooCloseAcross = Math.abs(x - other.x) < (width + other.width) / 2 + gap;
    var tooCloseDown = Math.abs(y - other.y) < (height + other.height) / 2 + gap;
    if (tooCloseAcross && tooCloseDown) {
      return true;
    }
  }
  return false;
}

// A trail of boot prints across a slab, left-right-left-right, from
// some clown who walked through it. Each print's x, y is measured from
// the middle of the slab.
function makeFootprints(count, slabWidth) {
  var prints = [];
  var angle = randRange(-0.5, 0.5);        // which way the trail heads (roughly across the slab)
  var trailLength = slabWidth * 0.7;       // the trail covers most of the slab
  var stride = CONFIG.traps.concrete.footprintSize * 0.7;   // gap between left and right feet
  for (var i = 0; i < count; i++) {
    var along = 0;
    if (count > 1) {
      along = (i / (count - 1) - 0.5) * trailLength;
    }
    var side = 1;
    if (i % 2 === 1) {
      side = -1;
    }
    prints.push({
      x: Math.cos(angle) * along - Math.sin(angle) * side * stride,
      y: Math.sin(angle) * along + Math.cos(angle) * side * stride,
      angle: angle
    });
  }
  return prints;
}


// ----------------------------------------------------------------
//  Traps: catching aliens
// ----------------------------------------------------------------

// Catches every walking alien touching this trap (until it's full).
function catchAliensInTrap(trap) {
  for (var i = 0; i < game.aliens.length; i++) {
    if (trap.full) {
      return;
    }
    var alien = game.aliens[i];
    if (alien.status === 'walking' && alienTouchesTrap(alien, trap)) {
      trapAlien(trap, alien);
    }
  }
}

function alienTouchesTrap(alien, trap) {
  var radius = hitRadius(alien.size);
  if (trap.type === 'portaloo') {
    // The portaloo only gets you at the door, in the middle.
    return distance(alien.x, alien.y, trap.x, trap.y) < radius + CONFIG.traps.portaloo.catchRadius;
  }
  // Slabs and trenches: touching any part of the rectangle counts.
  return distanceToBox(alien.x, alien.y, trap.x, trap.y, trap.width, trap.height) < radius;
}

// This alien has been caught by this trap.
function trapAlien(trap, alien) {
  catchAlien(alien, true);   // pays double, and sets it sinking
  if (alien.status !== 'trapped') {
    return;   // it had already been caught some other way
  }
  playSound('sink');

  // Where it sinks: a little way inside the trap (or at the portaloo's
  // door), so it goes down IN the trap and not on the edge of it.
  alien.inTrap = trap;
  if (trap.type === 'portaloo') {
    alien.sinkX = trap.x;
    alien.sinkY = trap.y;
    trap.doorTimer = CONFIG.traps.portaloo.slamTime;   // SLAM!
  } else {
    var insetX = Math.min(alien.size * 0.35, trap.width / 2);
    var insetY = Math.min(alien.size * 0.35, trap.height / 2);
    alien.sinkX = clamp(alien.x, trap.x - trap.width / 2 + insetX, trap.x + trap.width / 2 - insetX);
    alien.sinkY = clamp(alien.y, trap.y - trap.height / 2 + insetY, trap.y + trap.height / 2 - insetY);
  }

  // Trenches and portaloos can only hold so many.
  var kind = CONFIG.traps[trap.type];
  trap.held = trap.held + 1;
  if (kind.holds > 0 && trap.held >= kind.holds) {
    trap.full = true;
    trap.closeTimer = kind.closeTime;
  }
}

// Spare portaloo: walking aliens inside its pull circle get dragged
// towards it, a little each frame, on top of their normal walking.
function pullAliensTowards(trap, dt) {
  var p = CONFIG.traps.portaloo;
  var step = p.pullSpeed * dt;
  for (var i = 0; i < game.aliens.length; i++) {
    var alien = game.aliens[i];
    if (alien.status === 'walking') {
      var dx = trap.x - alien.x;
      var dy = trap.y - alien.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < p.pullRadius && d > 1) {
        var move = Math.min(step, d);   // never drag it past the middle
        alien.x = alien.x + (dx / d) * move;
        alien.y = alien.y + (dy / d) * move;
      }
    }
  }
}

// Trapped aliens slide the last little way into their trap as they sink.
function slideTrappedAliens(dt) {
  var amount = clamp(CONFIG.traps.sinkSlide * dt, 0, 1);
  for (var i = 0; i < game.aliens.length; i++) {
    var alien = game.aliens[i];
    if (alien.status === 'trapped' && typeof alien.sinkX === 'number') {
      alien.x = lerp(alien.x, alien.sinkX, amount);
      alien.y = lerp(alien.y, alien.sinkY, amount);
    }
  }
}


// ----------------------------------------------------------------
//  Pickups: TP lying on the ground
// ----------------------------------------------------------------

// Puts a TP pickup holding "rolls" rolls on the ground near (x, y).
function spawnTPPickup(x, y, rolls) {
  var size = CONFIG.pickups.size;
  var half = size / 2;
  game.pickups.push({
    type: 'tp',
    // Kept on the site, so you can always reach it.
    x: clamp(x, half, WIDTH - half),
    y: clamp(y, CONFIG.hud.height + half, HEIGHT - half),
    size: size,
    rolls: rolls,
    timeLeft: CONFIG.pickups.lifetime
  });
}

function updatePickups(dt) {
  var w = game.worker;
  var workerRadius = hitRadius(w.size);
  for (var i = game.pickups.length - 1; i >= 0; i--) {
    var pickup = game.pickups[i];
    pickup.timeLeft = pickup.timeLeft - dt;
    if (pickup.timeLeft <= 0) {
      game.pickups.splice(i, 1);
    } else if (circlesTouch(w.x, w.y, workerRadius, pickup.x, pickup.y, hitRadius(pickup.size))) {
      if (collectPickup(pickup)) {
        game.pickups.splice(i, 1);
      }
    }
  }
}

// You walked over a pickup. Gives back true if it's used up.
function collectPickup(pickup) {
  var w = game.worker;
  if (pickup.type === 'tp') {
    // You can't carry more than your stash. Whatever doesn't fit
    // stays on the ground for later.
    var room = game.workerStats.stash - w.tp;
    var taken = Math.min(room, pickup.rolls);
    if (taken <= 0) {
      return false;
    }
    w.tp = w.tp + taken;
    playSound('pickup');
    pickup.rolls = pickup.rolls - taken;
    return pickup.rolls <= 0;
  }
  if (pickup.type === 'crate') {
    return openSupplyCrate();
  }
  return false;
}


// ================================================================
//  SUPPLY CRATE 📦 - a rare pickup that refills your TP
// ================================================================
//  Every so often a crate lands somewhere on the site. Walk over it and
//  your TP is topped right up to your full stash. It's an ordinary
//  pickup (type 'crate' in game.pickups), so it blinks and vanishes
//  just like dropped TP - and a TP Thief can eat it.
//  Its numbers are in the SUPPLY CRATE part of config.js.

function updateSupplyCrate(dt) {
  game.crateTimer = game.crateTimer - dt;
  if (game.crateTimer <= 0) {
    spawnSupplyCrate();
    game.crateTimer = randRange(CONFIG.crate.everyMin, CONFIG.crate.everyMax);
  }
}

// Drops a crate at a random spot on the site, trying a few spots to
// find one that's a decent walk away from you.
function spawnSupplyCrate() {
  var c = CONFIG.crate;
  var w = game.worker;
  var gap = c.size / 2 + c.edgeGap;
  var best = null;
  var bestDistance = -1;
  for (var attempt = 0; attempt < 10; attempt++) {
    var x = randRange(gap, WIDTH - gap);
    var y = randRange(CONFIG.hud.height + gap, HEIGHT - gap);
    var d = distance(x, y, w.x, w.y);
    if (d > bestDistance) {
      best = { x: x, y: y };
      bestDistance = d;
    }
    if (d >= c.awayFromYou) {
      break;   // far enough away: use this one
    }
  }
  game.pickups.push({
    type: 'crate',
    x: best.x,
    y: best.y,
    size: c.size,
    timeLeft: c.lifetime
  });
}

// You walked over a crate. Gives back true if it's used up.
function openSupplyCrate() {
  var w = game.worker;
  if (w.tp >= game.workerStats.stash) {
    return false;   // your pockets are already full: leave it for later
  }
  w.tp = game.workerStats.stash;
  playSound('crate');
  return true;
}


// ----------------------------------------------------------------
//  Banners: big messages like "SMOKO!"
// ----------------------------------------------------------------
//  Banners wait in a queue and are shown one at a time.
//   title    - big words
//   subtitle - smaller words underneath ('' for none)
//   extra    - a last line, e.g. the payout ('' for none)
function showBanner(title, subtitle, extra) {
  game.banners.push({
    title: title,
    subtitle: subtitle || '',
    extra: extra || '',
    timeLeft: CONFIG.banner.duration
  });
}

function updateBanners(dt) {
  if (game.banners.length > 0) {
    game.banners[0].timeLeft = game.banners[0].timeLeft - dt;
    if (game.banners[0].timeLeft <= 0) {
      game.banners.shift();   // shift = take the first one off the queue
    }
  }
}


// ================================================================
//  DRAW - runs every frame, paints the picture
// ================================================================
//  engine.js calls draw() straight after update(). Things are painted
//  in order, back to front: whatever is drawn last ends up on top.

function draw() {
  if (game.state === 'menu') {
    drawSite();
    drawMenu();
  } else if (game.state === 'playing') {
    beginWorldShake();   // (see JUICE)
    drawWorld();
    endWorldShake();
    drawNight();         // darkness after 6 pm, under the top bar (see NIGHT)
    drawBanners();
    drawHud();
  } else if (game.state === 'over') {
    drawWorld();
    drawNight();
    drawHud();
    drawOverScreen();
  } else if (game.state === 'shop') {
    drawSite();
    drawShop();
  }
}

// Everything on the site, back to front.
function drawWorld() {
  drawSite();
  drawTraps();
  drawPickups();
  drawAliens();
  drawRolls();
  drawParticles();
  drawWorker();
}


// ----------------------------------------------------------------
//  The site: dirt, patches, pebbles and scenery
// ----------------------------------------------------------------

// Scatters dirt patches and pebbles about. Runs once when the page
// opens, so the ground doesn't jump about every frame.
function buildSiteDecoration() {
  var s = CONFIG.site;
  game.site.patches = [];
  for (var i = 0; i < s.patchCount; i++) {
    game.site.patches.push({
      x: randRange(0, WIDTH),
      y: randRange(0, HEIGHT),
      width: randRange(s.patchMinSize, s.patchMaxSize),
      height: randRange(s.patchMinSize, s.patchMaxSize) * 0.6,
      angle: randRange(0, Math.PI)
    });
  }
  game.site.pebbles = [];
  for (var j = 0; j < s.pebbleCount; j++) {
    game.site.pebbles.push({
      x: randRange(0, WIDTH),
      y: randRange(0, HEIGHT),
      size: randRange(s.pebbleMinSize, s.pebbleMaxSize)
    });
  }
}

function drawSite() {
  var s = CONFIG.site;

  // The dirt
  ctx.fillStyle = s.groundColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Darker patches
  ctx.fillStyle = s.patchColor;
  for (var i = 0; i < game.site.patches.length; i++) {
    var patch = game.site.patches[i];
    ctx.beginPath();
    ctx.ellipse(patch.x, patch.y, patch.width / 2, patch.height / 2, patch.angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pebbles
  ctx.fillStyle = s.pebbleColor;
  for (var j = 0; j < game.site.pebbles.length; j++) {
    var pebble = game.site.pebbles[j];
    ctx.fillRect(pebble.x, pebble.y, pebble.size, pebble.size);
  }

  // Scenery (decoration only - it doesn't block anything)
  for (var k = 0; k < s.scenery.length; k++) {
    var thing = s.scenery[k];
    drawEmoji(thing.emoji, thing.x, thing.y, thing.size);
  }
}


// ================================================================
//  TRAPS (drawing) - all canvas shapes, plus one 🚽
// ================================================================
function drawTraps() {
  for (var i = 0; i < game.traps.length; i++) {
    var trap = game.traps[i];
    ctx.globalAlpha = getTrapAlpha(trap);
    if (trap.type === 'concrete') {
      drawConcrete(trap);
    } else if (trap.type === 'trench') {
      drawTrench(trap);
    } else if (trap.type === 'portaloo') {
      drawPortaloo(trap);
    }
    ctx.globalAlpha = 1;
  }
}

// How solid a trap looks right now (1 = solid, 0 = invisible):
// it fades in when it appears, and blinks when it's about to go.
function getTrapAlpha(trap) {
  var t = CONFIG.traps;
  var alpha = 1;
  if (t.appearTime > 0 && trap.age < t.appearTime) {
    alpha = trap.age / t.appearTime;
  }
  if (trap.full) {
    // A full portaloo fades away. (A full trench fills with dirt instead - see drawTrench.)
    var kind = t[trap.type];
    if (trap.type === 'portaloo' && kind.closeTime > 0) {
      alpha = Math.min(alpha, trap.closeTimer / kind.closeTime);
    }
  } else if (trap.timeLeft < t.blinkTime && !blinkOn(trap.timeLeft, t.blinksPerSecond)) {
    alpha = Math.min(alpha, t.blinkFaintness);
  }
  return clamp(alpha, 0, 1);
}

// Wet concrete: timber edging, a grey slab, a wet shine sliding across,
// boot prints, and ripples where aliens are sinking.
function drawConcrete(trap) {
  var c = CONFIG.traps.concrete;
  var left = trap.x - trap.width / 2;
  var top = trap.y - trap.height / 2;

  // The timber edging (formwork), then the slab inside it
  ctx.fillStyle = c.formworkColor;
  ctx.fillRect(left - c.formworkSize, top - c.formworkSize, trap.width + c.formworkSize * 2, trap.height + c.formworkSize * 2);
  ctx.fillStyle = c.color;
  ctx.fillRect(left, top, trap.width, trap.height);

  // Everything from here to ctx.restore() is kept inside the slab.
  // ("clip" = only paint inside this rectangle.)
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, trap.width, trap.height);
  ctx.clip();

  // The wet shine: a pale slanted stripe that slides across, over and over
  var sweep = (trap.age * c.sheenSpeed) % 1;   // runs 0 to 1, then starts again
  var shineX = left - trap.width * 0.5 + sweep * trap.width * 2;
  var shineWidth = trap.width * 0.18;
  var slant = trap.height * 0.6;
  ctx.fillStyle = c.sheenColor;
  ctx.beginPath();
  ctx.moveTo(shineX, top);
  ctx.lineTo(shineX + shineWidth, top);
  ctx.lineTo(shineX + shineWidth - slant, top + trap.height);
  ctx.lineTo(shineX - slant, top + trap.height);
  ctx.closePath();
  ctx.fill();

  // Boot prints
  ctx.fillStyle = c.footprintColor;
  for (var i = 0; i < trap.footprints.length; i++) {
    var print = trap.footprints[i];
    ctx.save();
    ctx.translate(trap.x + print.x, trap.y + print.y);
    ctx.rotate(print.angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, c.footprintSize, c.footprintSize * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSinkRipples(trap, c.rippleColor);
  ctx.restore();

  if (c.label !== '') {
    drawText(c.label, trap.x, top + CONFIG.traps.labelSize, {
      size: CONFIG.traps.labelSize, bold: true, color: c.labelColor, align: 'center'
    });
  }
}

// Rings spreading out round every alien sinking in this trap.
function drawSinkRipples(trap, color) {
  var sinkTime = CONFIG.traps.sinkTime;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (var i = 0; i < game.aliens.length; i++) {
    var alien = game.aliens[i];
    if (alien.status === 'trapped' && alien.inTrap === trap && sinkTime > 0) {
      var sunk = 1 - clamp(alien.goneTimer / sinkTime, 0, 1);   // 0 = just caught, 1 = gone
      ctx.beginPath();
      ctx.ellipse(alien.x, alien.y + alien.size * 0.2, alien.size * (0.3 + sunk * 0.5), alien.size * (0.12 + sunk * 0.2), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// Open trench: a lip of loose dirt, a dark hole that's darker at the
// bottom, and once it's full, dirt piling back in.
function drawTrench(trap) {
  var c = CONFIG.traps.trench;
  var left = trap.x - trap.width / 2;
  var top = trap.y - trap.height / 2;

  ctx.fillStyle = c.lipColor;
  ctx.fillRect(left - c.lipSize, top - c.lipSize, trap.width + c.lipSize * 2, trap.height + c.lipSize * 2);
  ctx.fillStyle = c.holeColor;
  ctx.fillRect(left, top, trap.width, trap.height);
  ctx.fillStyle = c.deepColor;
  ctx.fillRect(left, top + trap.height * 0.35, trap.width, trap.height * 0.65);

  // Backfilling: dirt rises from the bottom until the hole is gone
  if (trap.full && c.closeTime > 0) {
    var filled = 1 - clamp(trap.closeTimer / c.closeTime, 0, 1);
    ctx.fillStyle = c.backfillColor;
    ctx.fillRect(left, top + trap.height * (1 - filled), trap.width, trap.height * filled);
  }

  drawTrapCount(trap, c.holds, trap.x, trap.y);
}

// Spare portaloo: the pixel-art 🚽 cabin (see js/sprites.js), or if there's
// no picture, a blue cabin of shapes with its door hanging open and the 🚽
// showing inside. "Suck" rings close in round it. When it catches an alien
// the door slams shut, the cabin rattles, and the light over the door goes red.
function drawPortaloo(trap) {
  var p = CONFIG.traps.portaloo;
  var shut = trap.full || trap.doorTimer > 0;

  // The "suck" rings, closing in on the portaloo
  if (!trap.full) {
    ctx.strokeStyle = p.pullColor;
    ctx.lineWidth = 2;
    for (var r = 0; r < 2; r++) {
      var phase = (trap.age * p.ringSpeed + r * 0.5) % 1;   // runs 0 to 1, then starts again
      ctx.beginPath();
      ctx.arc(trap.x, trap.y, p.pullRadius * (1 - phase), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Rattle side to side just after a slam
  var shake = 0;
  if (trap.doorTimer > 0) {
    shake = Math.sin(trap.age * p.shakeSpeed) * p.shakeSize;
  }
  var left = trap.x - trap.width / 2 + shake;
  var top = trap.y - trap.height / 2;
  var roofHeight = trap.height * 0.14;

  if (usingSprite(p.emoji)) {
    // The pixel-art 🚽 (js/sprites.js) is a whole portaloo cabin already,
    // so draw just that, as big as fits, standing on the bottom of the trap.
    var cabinSize = Math.min(trap.width, trap.height / pictureTallness(p.emoji));
    drawEmoji(p.emoji, trap.x + shake, top + trap.height - cabinSize / 2, cabinSize);
  } else {
    drawPortalooCabin(trap, left, top, roofHeight, shut);
  }

  // The little vacant / engaged light over the door
  ctx.fillStyle = p.vacantColor;
  if (shut) {
    ctx.fillStyle = p.engagedColor;
  }
  ctx.fillRect(trap.x + shake - 6, top + roofHeight + 1, 12, 4);

  if (trap.doorTimer > 0) {
    // Kept below the top bar, so it's never hidden under it
    var slamY = Math.max(top - p.slamTextSize * 0.7, CONFIG.hud.height + p.slamTextSize * 0.7);
    drawText(p.slamText, trap.x, slamY, {
      size: p.slamTextSize, bold: true, color: CONFIG.colors.title, outline: CONFIG.colors.outline, align: 'center'
    });
  }
  drawTrapCount(trap, p.holds, trap.x, top + trap.height + CONFIG.traps.countSize * 0.7);
}

// The portaloo cabin drawn from shapes, with the 🚽 emoji inside
// (used when there's no pixel-art portaloo - see js/sprites.js).
function drawPortalooCabin(trap, left, top, roofHeight, shut) {
  var p = CONFIG.traps.portaloo;

  // Cabin and roof (the roof sticks out a little each side)
  ctx.fillStyle = p.bodyColor;
  ctx.fillRect(left, top + roofHeight, trap.width, trap.height - roofHeight);
  ctx.fillStyle = p.roofColor;
  ctx.fillRect(left - 4, top, trap.width + 8, roofHeight);

  // The doorway
  var doorLeft = left + trap.width * 0.15;
  var doorTop = top + roofHeight + 6;
  var doorWidth = trap.width * 0.7;
  var doorHeight = trap.height - roofHeight - 10;

  if (shut) {
    ctx.fillStyle = p.doorColor;
    ctx.fillRect(doorLeft, doorTop, doorWidth, doorHeight);
    ctx.fillStyle = p.roofColor;   // the door handle
    ctx.fillRect(doorLeft + doorWidth * 0.75, doorTop + doorHeight * 0.45, 4, 10);
  } else {
    // Dark inside, with the 🚽 showing
    ctx.fillStyle = p.insideColor;
    ctx.fillRect(doorLeft, doorTop, doorWidth, doorHeight);
    drawEmoji(p.emoji, doorLeft + doorWidth / 2, doorTop + doorHeight * 0.62, doorWidth * 0.8);
    // The door, swung open on its hinge
    var doorRight = doorLeft + doorWidth;
    var swing = doorWidth * 0.35;
    ctx.fillStyle = p.doorColor;
    ctx.beginPath();
    ctx.moveTo(doorRight, doorTop);
    ctx.lineTo(doorRight + swing, doorTop - 4);
    ctx.lineTo(doorRight + swing, doorTop + doorHeight + 4);
    ctx.lineTo(doorRight, doorTop + doorHeight);
    ctx.closePath();
    ctx.fill();
  }
}

// "2/4" on a trap that can only hold so many aliens.
// Kept on the screen, even when the trap is right at the bottom edge.
function drawTrapCount(trap, holds, x, y) {
  if (!(holds > 0)) {
    return;
  }
  var size = CONFIG.traps.countSize;
  y = clamp(y, CONFIG.hud.height + size, HEIGHT - size * 0.6);
  drawText(trap.held + '/' + holds, x, y, {
    size: CONFIG.traps.countSize, bold: true, color: CONFIG.colors.text, outline: CONFIG.colors.outline, align: 'center'
  });
}


// ----------------------------------------------------------------
//  Pickups
// ----------------------------------------------------------------
function drawPickups() {
  var p = CONFIG.pickups;
  for (var i = 0; i < game.pickups.length; i++) {
    var pickup = game.pickups[i];

    // Blink for the last few seconds, as a warning it's about to go.
    var visible = true;
    if (pickup.timeLeft < p.blinkTime) {
      visible = blinkOn(pickup.timeLeft, p.blinksPerSecond);
    }

    if (visible && pickup.type === 'tp') {
      // A soft glow underneath, so it reads as "pick me up".
      ctx.fillStyle = CONFIG.colors.pickupGlow;
      ctx.beginPath();
      ctx.arc(pickup.x, pickup.y, pickup.size * 0.6, 0, Math.PI * 2);
      ctx.fill();

      drawEmoji(CONFIG.tp.emoji, pickup.x, pickup.y, pickup.size);
      if (pickup.rolls > 1) {
        drawText('x' + pickup.rolls, pickup.x + pickup.size * 0.45, pickup.y + pickup.size * 0.35, {
          size: p.labelSize, bold: true, color: CONFIG.colors.text, outline: CONFIG.colors.outline
        });
      }
    } else if (visible && pickup.type === 'crate') {
      drawSupplyCrate(pickup);
    }
  }
}


// ----------------------------------------------------------------
//  SUPPLY CRATE 📦 (drawing)
// ----------------------------------------------------------------
//  A golden glow underneath, and it gently swells and shrinks so it
//  catches your eye.
function drawSupplyCrate(crate) {
  var c = CONFIG.crate;
  var pulse = 1 + Math.sin(game.time * c.pulseSpeed) * c.pulseSize;

  ctx.fillStyle = c.glowColor;
  ctx.beginPath();
  ctx.arc(crate.x, crate.y, crate.size * 0.75 * pulse, 0, Math.PI * 2);
  ctx.fill();

  drawEmoji(c.emoji, crate.x, crate.y, crate.size * pulse);
}


// ----------------------------------------------------------------
//  Aliens
// ----------------------------------------------------------------
function drawAliens() {
  var crowd = CONFIG.alienCrowd;
  for (var i = 0; i < game.aliens.length; i++) {
    var alien = game.aliens[i];
    var emoji = CONFIG.aliens[alien.type].emoji;

    if (alien.status === 'walking') {
      // A little bob up and down as it walks.
      var bob = Math.sin(game.time * crowd.bobSpeed + alien.bobPhase) * crowd.bobHeight;
      drawEmoji(emoji, alien.x, alien.y + bob, alien.size);
      drawWrapBands(alien.x, alien.y + bob, alien.size, alien.wraps / alien.wrapsNeeded);
      drawHitFlash(alien, alien.x, alien.y + bob);   // white glow when just hit (see JUICE)
      drawThiefLoot(alien, alien.y + bob);   // "🧻 3" over a TP Thief's head

    } else if (alien.status === 'caught') {
      // Fully wrapped: flash on and off, then it's gone.
      if (blinkOn(alien.goneTimer, CONFIG.wrapping.caughtFlashesPerSecond)) {
        drawEmoji(emoji, alien.x, alien.y, alien.size);
        drawWrapBands(alien.x, alien.y, alien.size, 1);
      }

    } else if (alien.status === 'trapped') {
      // Stuck in a trap: shrink and fade as it sinks.
      var left = 0;
      if (CONFIG.traps.sinkTime > 0) {
        left = clamp(alien.goneTimer / CONFIG.traps.sinkTime, 0, 1);
      }
      ctx.globalAlpha = left;
      drawEmoji(emoji, alien.x, alien.y, alien.size * left);
      ctx.globalAlpha = 1;
    }
  }
}

// White TP bands across an alien. "fullness" runs from 0 (no wraps
// yet) to 1 (fully wrapped); more bands show as it fills up.
function drawWrapBands(x, y, size, fullness) {
  var wrap = CONFIG.wrapping;
  if (fullness <= 0) {
    return;
  }
  if (fullness > 1) {
    fullness = 1;
  }
  var bandsToShow = Math.ceil(fullness * wrap.bands);
  var bandWidth = size * wrap.bandWidth;
  var bandHeight = size * wrap.bandThickness;
  var bottom = y + (size * wrap.bandSpread) / 2;
  var top = y - (size * wrap.bandSpread) / 2;
  var gap = 0;
  if (wrap.bands > 1) {
    gap = (bottom - top) / (wrap.bands - 1);
  }

  ctx.fillStyle = CONFIG.colors.tpBand;
  ctx.strokeStyle = CONFIG.colors.tpBandEdge;
  ctx.lineWidth = 1;
  for (var b = 0; b < bandsToShow; b++) {
    // Every other band leans the other way, like it was wrapped in a hurry.
    var tilt = wrap.bandTilt;
    if (b % 2 === 1) {
      tilt = -tilt;
    }
    ctx.save();
    ctx.translate(x, bottom - b * gap);
    ctx.rotate(tilt);
    ctx.fillRect(-bandWidth / 2, -bandHeight / 2, bandWidth, bandHeight);
    ctx.strokeRect(-bandWidth / 2, -bandHeight / 2, bandWidth, bandHeight);
    ctx.restore();
  }
}


// ----------------------------------------------------------------
//  Flying rolls
// ----------------------------------------------------------------
function drawRolls() {
  for (var i = 0; i < game.rolls.length; i++) {
    var roll = game.rolls[i];
    drawRollTrail(roll);   // the TP streamer behind it (see JUICE)
    // Turn the paintbrush round the roll's middle, so it spins as it flies.
    ctx.save();
    ctx.translate(roll.x, roll.y);
    ctx.rotate(roll.spin);
    drawEmoji(CONFIG.tp.emoji, 0, 0, roll.size);
    ctx.restore();
  }
}


// ----------------------------------------------------------------
//  The worker
// ----------------------------------------------------------------
function drawWorker() {
  var w = game.worker;
  // Flash on and off while safe after losing a hat.
  var visible = true;
  if (w.invincibleTimer > 0) {
    visible = blinkOn(w.invincibleTimer, CONFIG.worker.flashesPerSecond);
  }
  if (visible) {
    drawEmoji(CONFIG.worker.emoji, w.x, w.y, w.size);
  }
}


// ----------------------------------------------------------------
//  The top bar: hard hats, TP, money, clock
// ----------------------------------------------------------------
function drawHud() {
  var hud = CONFIG.hud;
  var colors = CONFIG.colors;
  var w = game.worker;
  var middleY = hud.height / 2;

  // The bar itself
  ctx.fillStyle = colors.hudBar;
  ctx.fillRect(0, 0, WIDTH, hud.height);

  // Hard hats: yellow for the ones you still have, faint for lost ones.
  for (var i = 0; i < game.workerStats.hats; i++) {
    drawHardHat(hud.hatsX + i * hud.hatSpacing, middleY + hud.hatSize * 0.15, hud.hatSize, i < w.hats);
  }

  // TP count. Flashes red when you're out.
  var tpColor = colors.text;
  if (w.tp === 0 && blinkOn(game.screenTime, hud.warningFlashesPerSecond)) {
    tpColor = colors.warning;
  }
  drawText(CONFIG.tp.emoji + ' ' + w.tp, hud.tpX, middleY, { size: hud.textSize, bold: true, color: tpColor });

  // Energy drinks and ciggies earned this shift
  drawText(formatCiggies(game.shift.ciggies, false), hud.moneyX, middleY, { size: hud.textSize, bold: true, color: colors.text });

  // The clock
  drawText(formatClock(getClockHours()), WIDTH - hud.clockMargin, middleY, {
    size: hud.textSize, bold: true, color: colors.text, align: 'right'
  });

  // Out of TP warning, just under the bar
  if (w.tp === 0) {
    drawText(CONFIG.text.outOfTp, WIDTH / 2, hud.height + hud.warningSize, {
      size: hud.warningSize, bold: true, color: colors.warning, outline: colors.outline, align: 'center'
    });
  }
}

// A little hard hat made of shapes, sitting on (x, y).
// "stillHave" false draws a faint one, for a hat you've lost.
function drawHardHat(x, y, size, stillHave) {
  var colors = CONFIG.colors;
  var mainColor = colors.hatLost;
  var ridgeColor = colors.hatLost;
  if (stillHave) {
    mainColor = colors.hat;
    ridgeColor = colors.hatRidge;
  }

  // The dome: the top half of a circle
  ctx.fillStyle = mainColor;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.38, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // The brim
  ctx.fillRect(x - size * 0.5, y - size * 0.02, size, size * 0.14);

  // The ridge down the middle
  ctx.fillStyle = ridgeColor;
  ctx.fillRect(x - size * 0.06, y - size * 0.38, size * 0.12, size * 0.38);
}


// ----------------------------------------------------------------
//  Banners
// ----------------------------------------------------------------
function drawBanners() {
  if (game.banners.length === 0) {
    return;
  }
  var b = CONFIG.banner;
  var colors = CONFIG.colors;
  var banner = game.banners[0];

  // Fade in at the start and out at the end.
  var shownFor = b.duration - banner.timeLeft;
  var alpha = 1;
  if (b.fadeTime > 0) {
    alpha = Math.min(shownFor / b.fadeTime, banner.timeLeft / b.fadeTime, 1);
  }
  ctx.globalAlpha = clamp(alpha, 0, 1);

  // Work out how tall the panel needs to be for the lines it has.
  var height = b.titleSize * 1.5;
  if (banner.subtitle !== '') {
    height = height + b.subtitleSize * 1.5;
  }
  if (banner.extra !== '') {
    height = height + b.extraSize * 1.5;
  }
  ctx.fillStyle = colors.bannerPanel;
  ctx.fillRect(0, b.y, WIDTH, height + b.padding * 2);

  var lineY = b.y + b.padding + b.titleSize * 0.75;
  drawText(banner.title, WIDTH / 2, lineY, {
    size: b.titleSize, bold: true, color: colors.bannerTitle, outline: colors.outline, align: 'center', font: CONFIG.fonts.title
  });
  lineY = lineY + b.titleSize * 0.75;
  if (banner.subtitle !== '') {
    lineY = lineY + b.subtitleSize * 0.75;
    drawText(banner.subtitle, WIDTH / 2, lineY, { size: b.subtitleSize, bold: true, color: colors.bannerText, align: 'center' });
    lineY = lineY + b.subtitleSize * 0.75;
  }
  if (banner.extra !== '') {
    lineY = lineY + b.extraSize * 0.75;
    drawText(banner.extra, WIDTH / 2, lineY, { size: b.extraSize, bold: true, color: colors.bannerText, align: 'center' });
  }

  ctx.globalAlpha = 1;
}


// ----------------------------------------------------------------
//  Screens: menu, shift over, shop
// ----------------------------------------------------------------
function drawMenu() {
  var t = CONFIG.text;
  var sizes = CONFIG.textSizes;
  var colors = CONFIG.colors;
  var middleX = WIDTH / 2;

  drawOverlay(colors.overlay);

  drawText(t.title, middleX, 120, {
    size: sizes.title, bold: true, color: colors.title, outline: colors.outline, align: 'center', font: CONFIG.fonts.title
  });

  // The cast, in a row
  for (var i = 0; i < t.menuCast.length; i++) {
    var castX = middleX + (i - (t.menuCast.length - 1) / 2) * 80;
    drawEmoji(t.menuCast[i], castX, 215, 54);
  }

  drawText(t.tagline, middleX, 280, { size: sizes.normal, color: colors.dimText, align: 'center' });
  drawText(t.story, middleX, 325, { size: sizes.big, bold: true, color: colors.title, align: 'center' });

  for (var j = 0; j < t.controls.length; j++) {
    drawText(t.controls[j], middleX, 385 + j * 32, { size: sizes.normal, color: colors.text, align: 'center' });
  }

  if (blinkOn(game.screenTime, CONFIG.screens.promptBlinksPerSecond)) {
    drawText(t.pressStart, middleX, 525, {
      size: sizes.big, bold: true, color: colors.text, outline: colors.outline, align: 'center'
    });
  }

  // Right after a wipe: "All progress wiped...". Otherwise: "progress saves automatically".
  if (!drawShopMessage(CONFIG.shop.menuHintY)) {
    drawSaveHint(CONFIG.shop.menuHintY, false);
  }
}

function drawOverScreen() {
  var t = CONFIG.text;
  var sizes = CONFIG.textSizes;
  var colors = CONFIG.colors;
  var middleX = WIDTH / 2;

  drawOverlay(colors.overlay);

  var heading = t.loseHeading;
  var headingColor = colors.lose;
  if (game.shift.won) {
    heading = t.winHeading;
    headingColor = colors.win;
  }
  drawText(heading, middleX, 170, {
    size: sizes.heading, bold: true, color: headingColor, outline: colors.outline, align: 'center', font: CONFIG.fonts.title
  });

  drawText(t.reachedLabel + formatClock(getClockHours()), middleX, 260, { size: sizes.big, color: colors.text, align: 'center' });
  drawText(t.caughtLabel + game.shift.caught, middleX, 305, { size: sizes.big, color: colors.text, align: 'center' });
  drawText(t.earnedLabel + formatCiggies(game.shift.ciggies, false), middleX, 350, {
    size: sizes.big, bold: true, color: colors.title, align: 'center'
  });

  // Only offer "Press Space" once Space actually works.
  if (game.screenTime >= CONFIG.screens.overInputDelay &&
      blinkOn(game.screenTime, CONFIG.screens.promptBlinksPerSecond)) {
    drawText(t.toShop, middleX, 460, {
      size: sizes.big, bold: true, color: colors.text, outline: colors.outline, align: 'center'
    });
  }
}

// drawShop() lives in the SITE SHED section, next.


// ================================================================
//  SITE SHED (THE SHOP) - buying upgrades, saving, and the wipe
// ================================================================
//  You land here between shifts:
//    Up / Down  choose an upgrade
//    Space      buy it
//    Enter      start the next shift
//    R then Y   wipe ALL progress (for handing the laptop to someone new)
//
//  Your ciggies (game.bank) and upgrade levels (game.upgrades) are
//  saved in the browser after every purchase, at the end of every
//  shift, and after a wipe. They're loaded again when the page opens.
//
//  Upgrades kick in at the start of the next shift, because
//  startShift() asks getWorkerStats() for fresh numbers every time.
//  Every size, colour and word for this screen is in config.js
//  (the "shop" block, and the shop words in WORDS ON SCREEN).


// ----------------------------------------------------------------
//  Saving and loading
// ----------------------------------------------------------------

// Writes the bank and upgrade levels into the browser's storage.
// If the browser won't let us save, the game carries on anyway and
// the shed says so on screen (game.saveWorks becomes false).
function saveProgress() {
  game.saveWorks = saveData(CONFIG.shop.saveKey, { bank: game.bank, upgrades: game.upgrades });
}

// Reads back whatever saveProgress() wrote last time, if anything.
// Anything odd in the save (words where a number should be, a level
// past the max) is ignored or fixed, so a damaged save can't break the game.
function loadProgress() {
  var saved = loadData(CONFIG.shop.saveKey);
  if (saved !== null && typeof saved === 'object') {
    if (isSensibleNumber(saved.bank)) {
      game.bank = Math.max(0, Math.floor(saved.bank));
    }
    if (saved.upgrades !== null && typeof saved.upgrades === 'object') {
      for (var i = 0; i < CONFIG.upgrades.length; i++) {
        var upgrade = CONFIG.upgrades[i];
        var level = saved.upgrades[upgrade.id];
        if (isSensibleNumber(level)) {
          game.upgrades[upgrade.id] = clamp(Math.floor(level), 0, upgrade.maxLevel);
        }
      }
    }
  }
  // Save straight back. This also finds out whether this browser lets us save.
  saveProgress();
}

// true for a real, ordinary number (not words, not "nothing", not infinity).
function isSensibleNumber(value) {
  return typeof value === 'number' && isFinite(value);
}

// R then Y: every upgrade back to level 0, and the bank back to nothing.
// Then back to the title screen, so the next worker sees the controls.
function wipeAllProgress() {
  for (var i = 0; i < CONFIG.upgrades.length; i++) {
    game.upgrades[CONFIG.upgrades[i].id] = 0;
  }
  game.bank = 0;
  game.shop.selected = 0;
  saveProgress();
  playSound('sink');
  leaveShop();
  changeScreen('menu');
  showShopMessage(CONFIG.text.wiped, true);   // shown on the menu for a moment
}


// ----------------------------------------------------------------
//  The shed's keys
// ----------------------------------------------------------------
function updateShop() {
  var shop = game.shop;
  var count = CONFIG.upgrades.length;

  // Ignore keys for a moment after arriving, so someone still mashing
  // Space from the last screen doesn't buy something by accident.
  if (game.screenTime < CONFIG.screens.shopInputDelay) {
    return;
  }

  // While the "wipe everything?" question is up, only Y or "any
  // other key" count. Nothing else happens until it's answered.
  if (shop.confirmingWipe) {
    updateWipeQuestion();
    return;
  }

  if (wasPressed('Enter')) {
    startShift();
    return;
  }

  // Up and Down move the choice. Going off the top jumps to the
  // bottom, and off the bottom jumps back to the top.
  if (wasPressed('ArrowUp')) {
    shop.selected = shop.selected - 1;
    if (shop.selected < 0) {
      shop.selected = count - 1;
    }
    playSound('move');
  }
  if (wasPressed('ArrowDown')) {
    shop.selected = shop.selected + 1;
    if (shop.selected >= count) {
      shop.selected = 0;
    }
    playSound('move');
  }
  if (shop.selected >= count) {
    shop.selected = 0;   // in case an upgrade was deleted from config.js
  }

  if (wasPressed('Space')) {
    buySelectedUpgrade();
  }

  if (wasPressed('r')) {
    shop.confirmingWipe = true;
    playSound('move');
  }
}

// The "Press Y to wipe ALL progress, any other key to cancel" question.
function updateWipeQuestion() {
  if (wasPressed('y')) {
    game.shop.confirmingWipe = false;
    wipeAllProgress();
  } else if (anyKeyWasPressed()) {
    game.shop.confirmingWipe = false;
    showShopMessage(CONFIG.text.wipeCancelled, true);
  }
}

// true if any key at all was pressed this frame. (keysPressed is the
// list engine.js keeps of keys pressed this frame.)
function anyKeyWasPressed() {
  for (var name in keysPressed) {
    if (keysPressed[name]) {
      return true;
    }
  }
  return false;
}

// Tidies up the shed on the way out, so old messages don't linger.
function leaveShop() {
  game.shop.confirmingWipe = false;
  game.shop.message = '';
  game.shop.messageAt = -99;
  game.shop.deniedAt = -99;
}

// Space: buy the next level of the chosen upgrade, if you can.
function buySelectedUpgrade() {
  var t = CONFIG.text;
  var upgrade = CONFIG.upgrades[game.shop.selected];
  var cost = getUpgradeCost(upgrade.id);

  // getUpgradeCost gives back null when it's already at its max level.
  if (cost === null) {
    refuseToBuy(t.shopMaxed);
    return;
  }
  if (game.bank < cost) {
    refuseToBuy(t.shopCantAfford + formatCiggies(cost - game.bank, true) + t.shopCantAffordEnd);
    return;
  }

  game.bank = game.bank - cost;
  var newLevel = getUpgradeLevel(upgrade.id) + 1;
  game.upgrades[upgrade.id] = newLevel;
  saveProgress();
  playSound('buy');
  showShopMessage(t.shopBought + upgrade.name + t.shopNowLevel + newLevel, true);
}

// Can't buy it: a buzz, a red message, and the row gives a little shake.
function refuseToBuy(message) {
  playSound('deny');
  game.shop.deniedAt = game.screenTime;
  showShopMessage(message, false);
}

// Puts up the short line under the list. good = true shows it green.
function showShopMessage(message, good) {
  game.shop.message = message;
  game.shop.messageGood = good;
  game.shop.messageAt = game.screenTime;
}


// ----------------------------------------------------------------
//  Drawing the shed
// ----------------------------------------------------------------
function drawShop() {
  var s = CONFIG.shop;
  var t = CONFIG.text;
  var colors = CONFIG.colors;
  var shop = game.shop;
  var middleX = WIDTH / 2;

  // The shed wall: darken the site, then faint tin-shed stripes.
  drawOverlay(s.colors.backdrop);
  ctx.fillStyle = s.colors.wallStripe;
  for (var x = 0; x < WIDTH; x = x + s.stripeGap * 2) {
    ctx.fillRect(x, 0, s.stripeGap, HEIGHT);
  }

  // The title, with an emoji either side of it.
  drawText(t.shopTitle, middleX, s.titleY, {
    size: s.titleSize, bold: true, color: colors.title, outline: colors.outline, align: 'center', font: CONFIG.fonts.title
  });
  // (drawText has just set the title font, so this measures the title's width.)
  var titleHalfWidth = ctx.measureText(t.shopTitle).width / 2;
  drawEmoji(s.titleEmoji, middleX - titleHalfWidth - s.titleSize * 0.7, s.titleY, s.titleSize * 0.8);
  drawEmoji(s.titleEmoji, middleX + titleHalfWidth + s.titleSize * 0.7, s.titleY, s.titleSize * 0.8);

  // What you've got to spend, in a rounded box.
  shopBoxPath(middleX - s.walletWidth / 2, s.walletY - s.walletHeight / 2, s.walletWidth, s.walletHeight, s.walletHeight / 2);
  ctx.fillStyle = s.colors.walletBox;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = colors.title;
  ctx.stroke();
  drawText(t.walletLabel + formatCiggies(game.bank, false), middleX, s.walletY, {
    size: s.walletSize, bold: true, color: colors.text, align: 'center'
  });

  // One row per upgrade in config.js.
  for (var i = 0; i < CONFIG.upgrades.length; i++) {
    drawShopRow(CONFIG.upgrades[i], i, s.listY + i * (s.rowHeight + s.rowGap));
  }

  drawShopMessage(s.messageY);   // "Bought!" / "Not enough!"

  drawText(t.shopControls, middleX, s.controlsY, { size: s.controlsSize, bold: true, color: colors.text, align: 'center' });
  drawSaveHint(s.hintY, true);

  // The "wipe everything?" question goes on top of it all.
  if (shop.confirmingWipe) {
    drawWipeQuestion();
  }
}

// The short "Bought!" / "Not enough!" / "All progress wiped" line, centred
// on height y. It shows for a moment, then fades away.
// Gives back true if it drew something, false if there was nothing to show.
function drawShopMessage(y) {
  var s = CONFIG.shop;
  var colors = CONFIG.colors;
  var shop = game.shop;
  var age = game.screenTime - shop.messageAt;
  if (shop.message === '' || age < 0 || age >= s.messageTime) {
    return false;
  }
  var messageColor = colors.win;
  if (!shop.messageGood) {
    messageColor = colors.lose;
  }
  if (s.messageFadeTime > 0) {
    ctx.globalAlpha = clamp((s.messageTime - age) / s.messageFadeTime, 0, 1);
  }
  drawText(shop.message, WIDTH / 2, y, {
    size: s.messageSize, bold: true, color: messageColor, outline: colors.outline, align: 'center'
  });
  ctx.globalAlpha = 1;
  return true;
}

// One upgrade's row: emoji, name, what it does, level, and next price.
function drawShopRow(upgrade, index, top) {
  var s = CONFIG.shop;
  var c = s.colors;
  var colors = CONFIG.colors;
  var t = CONFIG.text;
  var shop = game.shop;
  var selected = (index === shop.selected);
  var left = s.listX;
  var width = WIDTH - s.listX * 2;
  var middleY = top + s.rowHeight / 2;

  // Shake the chosen row sideways for a moment if you couldn't buy it.
  var deniedAge = game.screenTime - shop.deniedAt;
  var denied = selected && deniedAge >= 0 && deniedAge < s.shakeTime;
  if (denied) {
    left = left + Math.sin(deniedAge * s.shakeSpeed) * s.shakeSize;
  }

  // The row's box. The chosen one is brighter, with a coloured edge
  // and a little arrow pointing at it.
  shopBoxPath(left, top, width, s.rowHeight, s.rowCorner);
  ctx.fillStyle = c.row;
  if (selected) {
    ctx.fillStyle = c.rowSelected;
  }
  ctx.fill();
  if (selected) {
    var edgeColor = c.rowEdge;
    if (denied) {
      edgeColor = colors.lose;
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = edgeColor;
    ctx.stroke();
    ctx.fillStyle = edgeColor;
    ctx.beginPath();
    ctx.moveTo(left + 12, middleY - 9);
    ctx.lineTo(left + 24, middleY);
    ctx.lineTo(left + 12, middleY + 9);
    ctx.closePath();
    ctx.fill();
  }

  // Emoji, name, and what it does
  drawEmoji(upgrade.emoji, left + 60, middleY, s.emojiSize);
  drawText(upgrade.name, left + 98, top + s.rowHeight * 0.36, { size: s.nameSize, bold: true, color: colors.text });
  drawText(upgrade.about, left + 98, top + s.rowHeight * 0.72, { size: s.aboutSize, color: colors.dimText });

  // Level: "LEVEL 2 / 10", and a little square for each level,
  // filled in for the levels you own.
  var level = getUpgradeLevel(upgrade.id);
  var levelX = left + s.levelX;
  drawText(t.shopLevelLabel + level + ' / ' + upgrade.maxLevel, levelX, top + s.rowHeight * 0.32, {
    size: s.levelSize, bold: true, color: colors.dimText
  });
  for (var p = 0; p < upgrade.maxLevel; p++) {
    ctx.fillStyle = c.pipOff;
    if (p < level) {
      ctx.fillStyle = c.pipOn;
    }
    ctx.fillRect(levelX + p * (s.pipSize + s.pipGap), top + s.rowHeight * 0.64 - s.pipSize / 2, s.pipSize, s.pipSize);
  }

  // Price of the next level (green if you can afford it), or MAX.
  var costX = left + width - s.costMargin;
  var cost = getUpgradeCost(upgrade.id);
  if (cost === null) {
    drawText(t.shopMax, costX, middleY, {
      size: s.costSize, bold: true, color: c.max, outline: colors.outline, align: 'right', font: CONFIG.fonts.title
    });
  } else {
    var costColor = c.cantAfford;
    if (game.bank >= cost) {
      costColor = c.canAfford;
    }
    drawText(t.shopCostLabel, costX, top + s.rowHeight * 0.3, { size: s.costLabelSize, bold: true, color: colors.dimText, align: 'right' });
    drawText(formatCiggies(cost, true), costX, top + s.rowHeight * 0.66, { size: s.costSize, bold: true, color: costColor, align: 'right' });
  }
}

// The box asking "WIPE ALL PROGRESS?", over the top of the shed.
function drawWipeQuestion() {
  var s = CONFIG.shop;
  var colors = CONFIG.colors;
  var t = CONFIG.text;
  var middleX = WIDTH / 2;
  var left = middleX - s.confirmWidth / 2;
  var top = HEIGHT / 2 - s.confirmHeight / 2;
  var h = s.confirmHeight;

  drawOverlay(s.colors.confirmDim);
  shopBoxPath(left, top, s.confirmWidth, h, s.rowCorner);
  ctx.fillStyle = s.colors.confirmPanel;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = colors.lose;
  ctx.stroke();

  // A tall pixel-art picture (like the portaloo) is shrunk to fit the
  // same space as the emoji, so its roof stays inside the box.
  var wipeSize = s.confirmEmojiSize / pictureTallness(s.wipeEmoji);
  drawEmoji(s.wipeEmoji, middleX, top + h * 0.19 + (s.confirmEmojiSize - wipeSize) / 2, wipeSize);
  drawText(t.wipeTitle, middleX, top + h * 0.44, {
    size: s.confirmTitleSize, bold: true, color: colors.lose, outline: colors.outline, align: 'center', font: CONFIG.fonts.title
  });
  drawText(t.wipeWarning, middleX, top + h * 0.62, { size: s.confirmTextSize, color: colors.dimText, align: 'center' });
  drawText(t.wipePrompt, middleX, top + h * 0.81, { size: s.confirmTextSize + 1, bold: true, color: colors.text, align: 'center' });
}

// The small "progress saves automatically" line (or a warning if this
// browser won't save). Used on the menu and in the shed.
function drawSaveHint(y, withWipeHint) {
  var t = CONFIG.text;
  var words = t.saveHint;
  if (!game.saveWorks) {
    words = t.saveBlocked;
  }
  if (withWipeHint) {
    words = words + '   ·   ' + t.wipeHint;
  }
  drawText(words, WIDTH / 2, y, { size: CONFIG.shop.hintSize, color: CONFIG.colors.dimText, align: 'center' });
}

// Traces the outline of a box with rounded corners, ready for
// ctx.fill() (paint it in) or ctx.stroke() (draw its edge).
function shopBoxPath(x, y, width, height, corner) {
  ctx.beginPath();
  ctx.moveTo(x + corner, y);
  ctx.arcTo(x + width, y, x + width, y + height, corner);
  ctx.arcTo(x + width, y + height, x, y + height, corner);
  ctx.arcTo(x, y + height, x, y, corner);
  ctx.arcTo(x, y, x + width, y, corner);
  ctx.closePath();
}


// ================================================================
//  JUICE - shake, streamers, hit flashes and bursts of TP
// ================================================================
//  None of this changes the rules. It's all just for show, to make
//  hits and catches feel good. Every number is in the JUICE block
//  in config.js.
//
//  "Particles" are the little squares of TP that fly out when an
//  alien is caught. They all live in the list game.particles.

// Clears away all the shake and flying bits, ready for a new shift.
function resetJuice() {
  game.particles = [];
  game.shakeTimer = 0;
  game.shakeX = 0;
  game.shakeY = 0;
  game.emptyClickTimer = 0;
}

// Runs every frame while playing: counts down the timers and moves
// the flying bits along.
function updateJuice(dt) {
  if (game.shakeTimer > 0) {
    game.shakeTimer = game.shakeTimer - dt;
  }
  if (game.emptyClickTimer > 0) {
    game.emptyClickTimer = game.emptyClickTimer - dt;
  }

  // Aliens that were just hit stop glowing after a moment.
  for (var i = 0; i < game.aliens.length; i++) {
    if (game.aliens[i].hitFlash > 0) {
      game.aliens[i].hitFlash = game.aliens[i].hitFlash - dt;
    }
  }

  updateParticles(dt);
}


// ----------------------------------------------------------------
//  Screen shake
// ----------------------------------------------------------------

// Starts the site shaking (when an alien knocks your hat off).
function startShake() {
  game.shakeTimer = CONFIG.juice.shakeTime;
}

// Called just before the site is drawn. If the screen is shaking,
// it moves the paintbrush a random few pixels, so the whole site
// gets drawn slightly off to one side. The shake fades as it ends.
function beginWorldShake() {
  var j = CONFIG.juice;
  game.shakeX = 0;
  game.shakeY = 0;
  if (game.shakeTimer > 0 && j.shakeTime > 0) {
    var strength = j.shakeStrength * (game.shakeTimer / j.shakeTime);
    game.shakeX = randRange(-strength, strength);
    game.shakeY = randRange(-strength, strength);
    // Paint the whole window dirt-coloured first, so no gap shows at
    // the edge the site has been jolted away from.
    ctx.fillStyle = CONFIG.site.groundColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  ctx.save();   // save = remember where the paintbrush was
  ctx.translate(game.shakeX, game.shakeY);
}

// Called just after the site is drawn: puts the paintbrush back, so
// the top bar and banners stay steady.
function endWorldShake() {
  ctx.restore();
}


// ----------------------------------------------------------------
//  Sounds that need a little extra thought
// ----------------------------------------------------------------

// The dry "click" when you press Space with no TP left. It waits a
// moment between clicks, so holding Space doesn't make a buzz.
function playEmptyClick() {
  if (game.emptyClickTimer > 0) {
    return;
  }
  playSound('empty');
  game.emptyClickTimer = CONFIG.juice.emptyClickGap;
}

// The shift is over: a bell for making midnight, a sad trombone if not.
function playShiftEndSound(won) {
  if (won) {
    playSound('bell');
  } else {
    playSound('over');
  }
}


// ----------------------------------------------------------------
//  Hit flash: an alien glows white for a moment when a roll lands
// ----------------------------------------------------------------

// A roll just landed on this alien: start it glowing.
function flashAlien(alien) {
  alien.hitFlash = CONFIG.juice.hitFlashTime;
}

// A plain white cut-out of an emoji (or its pixel-art picture), the same shape.
// Made once per emoji and size, then kept (like the emoji stickers
// in engine.js), because making them is slow.
var whiteStickers = {};

function getWhiteSticker(emoji, size) {
  var label = emoji + '@' + size;
  if (whiteStickers[label]) {
    return whiteStickers[label];
  }
  var normal = getPictureSticker(emoji, size);   // the pixel-art picture, if it has one
  var white = document.createElement('canvas');
  white.width = normal.width;
  white.height = normal.height;
  var whiteCtx = white.getContext('2d');
  whiteCtx.drawImage(normal, 0, 0);
  // 'source-in' means: only paint where the emoji already is.
  whiteCtx.globalCompositeOperation = 'source-in';
  whiteCtx.fillStyle = CONFIG.juice.hitFlashColor;
  whiteCtx.fillRect(0, 0, white.width, white.height);
  whiteStickers[label] = white;
  return white;
}

// Draws the white glow over an alien that was just hit, centred on (x, y).
function drawHitFlash(alien, x, y) {
  if (!(alien.hitFlash > 0)) {
    return;
  }
  var j = CONFIG.juice;
  var size = Math.round(alien.size);
  if (!(size >= 1) || !(j.hitFlashTime > 0)) {
    return;
  }
  var sticker = getWhiteSticker(CONFIG.aliens[alien.type].emoji, size);
  ctx.globalAlpha = clamp(alien.hitFlash / j.hitFlashTime, 0, 1) * j.hitFlashStrength;
  ctx.drawImage(sticker, x - sticker.width / 2, y - sticker.height / 2);
  ctx.globalAlpha = 1;
}


// ----------------------------------------------------------------
//  TP streamers behind flying rolls
// ----------------------------------------------------------------
//  Each roll remembers where it has just been (its "trail"). The
//  streamer is drawn through those spots, thinner and fainter
//  towards the tail, with a little flutter.

function updateRollTrail(roll, dt) {
  var j = CONFIG.juice;
  if (!roll.trail) {
    roll.trail = [];
  }
  // Every spot gets older. Spots too old to show are dropped off the tail.
  for (var i = 0; i < roll.trail.length; i++) {
    roll.trail[i].age = roll.trail[i].age + dt;
  }
  while (roll.trail.length > 0 && roll.trail[0].age >= j.trailLife) {
    roll.trail.shift();   // shift = take the oldest spot off the front of the list
  }
  roll.trail.push({ x: roll.x, y: roll.y, age: 0, phase: roll.spin });
}

// How far a trail spot is pushed sideways, for the flutter.
// Spots near the roll barely move; the tail flaps the most.
function trailFlutter(spot) {
  var j = CONFIG.juice;
  var tailShare = 0;
  if (j.trailLife > 0) {
    tailShare = spot.age / j.trailLife;
  }
  return Math.sin(spot.phase + spot.age * j.trailWiggleSpeed) * j.trailWiggle * tailShare;
}

function drawRollTrail(roll) {
  if (!roll.trail || roll.trail.length < 2) {
    return;
  }
  var j = CONFIG.juice;
  if (!(j.trailLife > 0)) {
    return;
  }

  // "Sideways" to the way the roll is flying, for the flutter.
  var speed = Math.sqrt(roll.vx * roll.vx + roll.vy * roll.vy);
  var sideX = 0;
  var sideY = 0;
  if (speed > 0) {
    sideX = -roll.vy / speed;
    sideY = roll.vx / speed;
  }

  ctx.strokeStyle = j.trailColor;
  ctx.lineCap = 'round';
  for (var i = 1; i < roll.trail.length; i++) {
    var from = roll.trail[i - 1];
    var to = roll.trail[i];
    var freshness = clamp(1 - to.age / j.trailLife, 0, 1);   // 1 right behind the roll, 0 at the tail
    var flutterFrom = trailFlutter(from);
    var flutterTo = trailFlutter(to);

    ctx.globalAlpha = freshness;
    ctx.lineWidth = Math.max(1, j.trailWidth * freshness);
    ctx.beginPath();
    ctx.moveTo(from.x + sideX * flutterFrom, from.y + sideY * flutterFrom);
    ctx.lineTo(to.x + sideX * flutterTo, to.y + sideY * flutterTo);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}


// ----------------------------------------------------------------
//  Bursts of little TP squares (particles)
// ----------------------------------------------------------------

// Throws out a burst of TP squares from (x, y). Used when an alien is caught.
function spawnBurst(x, y) {
  var j = CONFIG.juice;
  for (var i = 0; i < j.burstCount; i++) {
    // Never go over the limit, so a huge swarm can't slow the laptop down.
    if (game.particles.length >= j.maxParticles) {
      return;
    }
    var angle = randRange(0, Math.PI * 2);
    var speed = randRange(j.burstSpeedMin, j.burstSpeedMax);
    game.particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,     // speed across, pixels per second
      vy: Math.sin(angle) * speed,     // speed down, pixels per second
      size: randRange(j.burstSizeMin, j.burstSizeMax),
      turn: randRange(0, Math.PI * 2), // how far round it has tumbled
      spin: randRange(-j.burstSpin, j.burstSpin),
      timeLeft: j.burstLife,
      color: j.burstColors[randInt(0, j.burstColors.length - 1)]
    });
  }
}

// Moves every square along, slows it down, and removes it once it has faded.
// Backwards through the list, because squares get taken out as we go.
function updateParticles(dt) {
  var slow = 1 - CONFIG.juice.burstSlowDown * dt;
  if (slow < 0) {
    slow = 0;
  }
  for (var i = game.particles.length - 1; i >= 0; i--) {
    var p = game.particles[i];
    p.timeLeft = p.timeLeft - dt;
    if (p.timeLeft <= 0) {
      game.particles.splice(i, 1);
    } else {
      p.x = p.x + p.vx * dt;
      p.y = p.y + p.vy * dt;
      p.vx = p.vx * slow;
      p.vy = p.vy * slow;
      p.turn = p.turn + p.spin * dt;
    }
  }
}

function drawParticles() {
  var life = CONFIG.juice.burstLife;
  for (var i = 0; i < game.particles.length; i++) {
    var p = game.particles[i];
    var fade = 1;
    if (life > 0) {
      fade = clamp(p.timeLeft / life, 0, 1);
    }
    ctx.globalAlpha = fade;
    ctx.fillStyle = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.turn);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}


// ================================================================
//  NIGHT - the site gets dark after 6 pm
// ================================================================
//  From 6 pm a see-through layer of deep blue is laid over the site,
//  getting darker until 9 pm, then staying that dark till midnight.
//  Holes are cut in it round the worker (a head-torch) and round a
//  couple of floodlights, so aliens near you are always easy to see.
//  The top bar is drawn after this, so it's never darkened.
//  Every number is in the NIGHT block in config.js.

// How dark it is right now: 0 in the daytime, 1 at full dark.
function getNightAmount() {
  var n = CONFIG.night;
  var now = getClockHours();
  if (n.fullDarkAt <= n.startsAt) {
    if (now >= n.startsAt) {
      return 1;
    }
    return 0;
  }
  return clamp((now - n.startsAt) / (n.fullDarkAt - n.startsAt), 0, 1);
}

// Turns a colour like '#ffe7a8' into the same colour, see-through by "alpha"
// (0 = invisible, 1 = solid).
function colorWithAlpha(hex, alpha) {
  var r = parseInt(hex.substring(1, 3), 16);
  var g = parseInt(hex.substring(3, 5), 16);
  var b = parseInt(hex.substring(5, 7), 16);
  return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
}

// The darkness is painted on its own hidden layer first, so the light
// holes can be rubbed out of it without rubbing out the site underneath.
var nightLayer = null;
var nightCtx = null;

function getNightLayer() {
  if (nightLayer === null) {
    nightLayer = document.createElement('canvas');
    nightLayer.width = WIDTH;
    nightLayer.height = HEIGHT;
    nightCtx = nightLayer.getContext('2d');
  }
  return nightCtx;
}

// Rubs a soft round hole in the darkness at (x, y).
function cutLight(layerCtx, x, y, radius, strength) {
  if (!(radius > 0) || !(strength > 0)) {
    return;
  }
  var glow = layerCtx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, 'rgba(0, 0, 0, 1)');
  glow.addColorStop(0.45, 'rgba(0, 0, 0, 0.8)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  layerCtx.globalAlpha = clamp(strength, 0, 1);
  layerCtx.fillStyle = glow;
  layerCtx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

// A faint warm tint inside a light, painted straight onto the site.
function drawLightGlow(x, y, radius, strength, amount) {
  var n = CONFIG.night;
  var alpha = clamp(n.lightGlow * strength * amount, 0, 1);
  if (!(radius > 0) || !(alpha > 0)) {
    return;
  }
  var glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, colorWithAlpha(n.lightColor, alpha));
  glow.addColorStop(1, colorWithAlpha(n.lightColor, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawNight() {
  var amount = getNightAmount();
  if (amount <= 0) {
    return;
  }
  var n = CONFIG.night;
  var w = game.worker;
  var layer = getNightLayer();

  // The lights sit on the site, so they move with it when it shakes.
  var shakeX = 0;
  var shakeY = 0;
  if (game.state === 'playing') {
    shakeX = game.shakeX || 0;
    shakeY = game.shakeY || 0;
  }
  var workerX = w.x + shakeX;
  var workerY = w.y + shakeY;

  // 1. Fill the hidden layer with see-through night blue.
  layer.globalCompositeOperation = 'source-over';
  layer.globalAlpha = 1;
  layer.clearRect(0, 0, WIDTH, HEIGHT);
  layer.globalAlpha = clamp(n.darkness * amount, 0, 1);
  layer.fillStyle = n.color;
  layer.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. Rub out soft holes for the head-torch and the floodlights.
  //    ('destination-out' means: paint = rub out.)
  layer.globalCompositeOperation = 'destination-out';
  cutLight(layer, workerX, workerY, n.workerLight, n.workerLightStrength);
  for (var i = 0; i < n.floodlights.length; i++) {
    var f = n.floodlights[i];
    cutLight(layer, f.x + shakeX, f.y + shakeY, f.radius, f.strength);
  }
  layer.globalCompositeOperation = 'source-over';
  layer.globalAlpha = 1;

  // 3. Lay the darkness over the site, then a faint warm glow in the lights.
  ctx.drawImage(nightLayer, 0, 0);
  drawLightGlow(workerX, workerY, n.workerLight, n.workerLightStrength, amount);
  for (var k = 0; k < n.floodlights.length; k++) {
    var light = n.floodlights[k];
    drawLightGlow(light.x + shakeX, light.y + shakeY, light.radius, light.strength, amount);
  }
}


// ================================================================
//  START UP - runs once, when the page opens
// ================================================================
function setUpGame() {
  // Every upgrade starts at level 0.
  for (var i = 0; i < CONFIG.upgrades.length; i++) {
    game.upgrades[CONFIG.upgrades[i].id] = 0;
  }
  loadProgress();   // then bring back any saved 🥤 🚬 and upgrades
  buildSiteDecoration();
  resetRun();
  changeScreen('menu');
}

setUpGame();
startGameLoop();

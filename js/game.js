// ================================================================
//  WIPE OUT - THE GAME RULES
// ================================================================
//  This is where the game actually happens. Most changes go here.
//  It is split into sections, each with a banner like this one:
//
//    GAME STATE    - everything the game remembers right now
//    WORKER STATS  - your speed, stash and so on
//    STARTING & ENDING
//    UPDATE        - runs 60 times a second, moves everything along
//    DRAW          - runs 60 times a second, paints the picture
//    JUICE         - shake, streamers and little flying bits
//    START UP      - runs once, when the page opens
//
//  Every number and word lives in config.js, so to tune the game
//  you almost never need to come in here.
//
//  A FEW WORDS YOU'LL SEE
//    dt      - "delta time": how many seconds passed since the last
//              frame. Everything that moves is multiplied by it, so
//              the game runs at the same speed on every machine.
//    null    - means "nothing here".
//    splice  - cuts something out of a list.
//    push    - adds something onto the end of a list.
// ================================================================


// ================================================================
//  GAME STATE - everything the game remembers right now
// ================================================================
//  It all lives in one bundle called "game", so it's easy to find.
//  To peek at it while playing: press F12, click Console, type  game
//  and press Enter.

var game = {
  state: 'menu',       // which screen we're on: 'menu', 'playing' or 'over'
  screenTime: 0,       // seconds spent on the current screen (used for blinking words)

  // --- This run (all reset when a new run starts) ---
  time: 0,             // seconds since the run started
  worker: null,        // you: position, TP, hard hats...
  workerStats: null,   // your stash, hats, speed, ply and throw speed
  aliens: [],          // every alien on the site
  rolls: [],           // rolls of TP flying through the air
  pickups: [],         // TP lying on the ground, waiting to be picked up
  spawnTimer: 0,       // seconds until the next alien arrives
  throwLocked: false,  // true until Space is let go after starting (see updateThrowing)
  run: null,           // this run's score: aliens caught

  // --- The scripted opening (see THE TUTORIAL) ---
  tutorial: {
    running: true,     // true while the script is still going
    step: 0,           // which instruction in CONFIG.tutorial we're up to
    hasMoved: false,   // true once the player has pressed an arrow key
    watchPickup: null  // the roll the script last put down, so it can wait for it
  },

  // --- The chunky talking box (see THE TALKING BOX) ---
  dialog: {
    showing: false,    // true while a message is on screen
    lines: [],         // the lines of that message
    charsShown: 0,     // how many letters have typed themselves out so far
    blinkTime: 0,      // used to blink the little "press Space" arrow
    ticks: 0           // letters typed since the last typing tick sound
  },
  particles: [],       // little squares of TP flying about, just for show (see JUICE)
  shakeTimer: 0,       // seconds of screen shake left (see JUICE)
  shakeStrength: 0,    // how hard this particular shake jolts, in pixels
  shakeLength: 0,      // how long this particular shake was set to last
  shakeX: 0,           // how far the site is jolted this frame, across and down
  shakeY: 0,
  emptyClickTimer: 0,  // seconds until the "no TP" click can play again

  // --- Cut scenes: the bits that play themselves (see CUT SCENES) ---
  cutscene: {
    name: '',          // which one is playing ('' = none)
    phase: '',         // which stage of it we're up to
    time: 0,           // seconds spent in this stage
    running: false,    // true while it is playing
    blackout: false,   // true once the screen has gone black, and it stays black
    crushed: false,    // true once the crane has landed on the worker
    poolTime: 0,       // seconds since the blood started spreading
    beatsDone: 0       // how many heartbeats have thumped as the eyes close
  },

  // --- The look of the ground (made once when the page opens) ---
  site: { patches: [], pebbles: [] }
};

// Every thing in the game (alien, roll, pickup) is a bundle with a
// "type" saying what it is. Aliens also have a "status":
//   'walking' - on its way to get you. Can be hit, and can hurt you.
//   'caught'  - fully wrapped. Flashes for a moment, then vanishes.
// Only 'walking' aliens can be aimed at, hit by rolls, or hurt you.


// ================================================================
//  WORKER STATS - your stats for this run
// ================================================================
//  One place that decides what the worker is capable of. Right now it
//  just copies the numbers out of config.js.

function getWorkerStats() {
  var stats = {};
  stats.stash = CONFIG.tp.stash;
  stats.hats = CONFIG.worker.hats;
  stats.speed = CONFIG.worker.speed;
  stats.ply = CONFIG.tp.ply;
  stats.throwInterval = CONFIG.tp.throwInterval;
  return stats;
}


// ================================================================
//  STARTING & ENDING
// ================================================================

// Switches to another screen and restarts that screen's timer.
function changeScreen(newState) {
  game.state = newState;
  game.screenTime = 0;
}

// A fresh worker, standing in the middle of the site. They start with
// whatever CONFIG.tp.startWith says - which is nothing, until the
// tutorial hands them their first roll.
function makeWorker(stats) {
  return {
    type: 'worker',
    x: CONFIG.worker.startX,
    y: CONFIG.worker.startY,
    size: CONFIG.worker.size,
    tp: CONFIG.tp.startWith,  // rolls in your pockets right now
    hats: stats.hats,         // hard hats left right now
    invincibleTimer: 0,       // seconds of flashing safety left
    throwCooldown: 0          // seconds until you can throw again
  };
}

// Wipes everything about the current run, ready for a new one.
function resetRun() {
  game.workerStats = getWorkerStats();
  game.worker = makeWorker(game.workerStats);
  game.time = 0;
  game.aliens = [];
  game.rolls = [];
  game.pickups = [];
  game.spawnTimer = CONFIG.spawning.firstAlienAfter;
  game.run = {
    caught: 0        // aliens caught this run
  };
  resetTutorial();    // back to the first line of the script (see THE TUTORIAL)
  resetCutscene();    // no crane half way down from last time (see CUT SCENES)
}

function startRun() {
  resetRun();
  resetJuice();   // no shake or flying bits left over from last time (see JUICE)
  // If Space is still held from the key press that started the run,
  // don't let it fire a throw. You have to let go of Space first.
  game.throwLocked = true;
  changeScreen('playing');
}

// You ran out of hard hats.
function endRun() {
  playSound('over');
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
  }
}

function updateMenu() {
  if (wasPressed('Space')) {
    startRun();
  }
}

function updateOver() {
  // Ignore Space for a moment, so someone mashing Space as they go
  // down doesn't skip straight past their score.
  if (game.screenTime >= CONFIG.screens.overInputDelay && wasPressed('Space')) {
    startRun();
  }
}

// One frame of actual play. The order matters a little: getting hit
// comes last, because it can end the run, and nothing should score
// after the run is over.
function updatePlaying(dt) {
  game.time += dt;

  updateTutorial(dt);   // the scripted opening, and the talking box

  // During a cut scene the player is frozen: no walking, no throwing,
  // no aliens turning up, and nothing can hurt them. The only things
  // still moving are the scene itself and the bits flying about.
  if (isFrozen()) {
    updateCutscene(dt);
    updateJuice(dt);
    return;
  }

  updateWorker(dt);
  updateThrowing(dt);
  updateSpawning(dt);
  updateAliens(dt);
  updateRolls(dt);
  updatePickups(dt);
  updateJuice(dt);
  checkAlienHitsWorker();
}

// True while the player has had control taken off them.
function isFrozen() {
  return game.cutscene.running || game.cutscene.blackout;
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
    game.tutorial.hasMoved = true;   // the tutorial waits for this
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

  // While the talking box is open, Space belongs to the talking box.
  if (game.dialog.showing) {
    return;
  }

  // Right after a run starts, wait until Space has been let go once.
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
  // Already caught: leave it.
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
    catchAlien(alien);
  }
}

// THE place where an alien counts as caught. It flashes, then vanishes,
// and it might leave some TP behind.
function catchAlien(alien) {
  // Never count the same alien twice.
  if (alien.counted) {
    return;
  }
  alien.counted = true;
  spawnBurst(alien.x, alien.y);   // a puff of TP squares (see JUICE)

  alien.status = 'caught';
  alien.goneTimer = CONFIG.wrapping.caughtFlashTime;
  game.run.caught = game.run.caught + 1;

  maybeDropTP(alien);
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
  // While the tutorial is running, the script decides who turns up.
  if (game.tutorial.running) {
    return;
  }
  game.spawnTimer = game.spawnTimer - dt;
  if (game.spawnTimer <= 0) {
    if (game.aliens.length < CONFIG.spawning.maxAliens) {
      var typeName = pickAlienType();
      if (typeName !== null) {
        spawnAlien(typeName);
      }
    }
    game.spawnTimer = game.spawnTimer + CONFIG.spawning.every;
  }
}

// Picks which kind of alien arrives next, from the kinds in config.js.
// Kinds with a bigger "weight" come more often. Like a raffle: each kind
// holds as many tickets as its weight.
// Gives back null if config.js has no aliens in it at all.
function pickAlienType() {
  var names = [];
  var totalWeight = 0;
  for (var name in CONFIG.aliens) {   // go through every kind of alien in config.js
    names.push(name);
    totalWeight = totalWeight + getSpawnWeight(CONFIG.aliens[name]);
  }
  if (names.length === 0) {
    return null;
  }

  var ticket = Math.random() * totalWeight;
  for (var i = 0; i < names.length; i++) {
    ticket = ticket - getSpawnWeight(CONFIG.aliens[names[i]]);
    if (ticket < 0) {
      return names[i];
    }
  }
  return names[names.length - 1];
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
    speed: kind.speed,       // walking speed, in pixels per second
    wraps: 0,                // wraps of TP on it so far
    pendingWraps: 0,         // wraps still flying towards it
    wrapsNeeded: kind.wraps, // wraps to catch it
    status: 'walking',
    goneTimer: 0,            // once caught: seconds until it vanishes
    counted: false,          // true once it has been counted as caught
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
    var spot = randomEdgeSpot(size / 2 + CONFIG.spawning.spawnOutside);
    var d = distance(spot.x, spot.y, w.x, w.y);
    if (d >= CONFIG.spawning.safeSpawnDistance) {
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
  // Backwards, because caught aliens get taken out of the list.
  for (var i = game.aliens.length - 1; i >= 0; i--) {
    var alien = game.aliens[i];
    if (alien.status === 'walking') {
      moveAlienTowardsWorker(alien, dt);
    } else if (alien.status === 'caught') {
      alien.goneTimer = alien.goneTimer - dt;
      if (alien.goneTimer <= 0) {
        game.aliens.splice(i, 1);
      }
    }
  }

  pushAliensApart(dt);
}

// Walks straight at the worker. No clever pathfinding.
function moveAlienTowardsWorker(alien, dt) {
  var w = game.worker;
  var dx = w.x - alien.x;
  var dy = w.y - alien.y;
  var d = Math.sqrt(dx * dx + dy * dy);
  if (d > 1) {
    var step = alien.speed * dt;
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
    if (alien.status === 'walking' &&
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
    endRun();
  } else {
    w.invincibleTimer = CONFIG.worker.invincibleTime;
  }
}


// ----------------------------------------------------------------
//  Pickups: TP lying on the ground
// ----------------------------------------------------------------

// Puts a TP pickup holding "rolls" rolls on the ground near (x, y).
// "lifetime" is how many seconds it waits there before vanishing. Leave
// it out for the normal lifetime from config.js; the tutorial passes
// Infinity, which means "wait there forever".
// Gives back the new pickup, so the tutorial can keep an eye on it.
function spawnTPPickup(x, y, rolls, lifetime) {
  var size = CONFIG.pickups.size;
  var half = size / 2;
  if (typeof lifetime !== 'number') {
    lifetime = CONFIG.pickups.lifetime;
  }
  var pickup = {
    type: 'tp',
    // Kept on the site, so you can always reach it.
    x: clamp(x, half, WIDTH - half),
    y: clamp(y, CONFIG.hud.height + half, HEIGHT - half),
    size: size,
    rolls: rolls,
    timeLeft: lifetime
  };
  game.pickups.push(pickup);
  return pickup;
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


// ================================================================
//  THE TUTORIAL - the scripted opening
// ================================================================
//  The script itself is the "tutorial" list in config.js. That file
//  explains what each instruction does. This section is the machinery
//  that walks down the list and carries the instructions out.
//
//  The rule is simple: we sit on one instruction until it is finished,
//  then move to the next. A "talk" instruction is finished when the
//  player closes the talking box. A "waitFor" is finished when the
//  thing it is waiting for has happened. The other two happen straight
//  away and we carry on down the list in the same frame.
//
//  While the tutorial is running, updateSpawning() does nothing, so the
//  only aliens on the site are the ones the script asked for.

function resetTutorial() {
  game.tutorial.running = true;
  game.tutorial.step = 0;
  game.tutorial.hasMoved = false;
  game.tutorial.watchPickup = null;
  closeDialog();
}

function updateTutorial(dt) {
  updateDialog(dt);

  if (!game.tutorial.running) {
    return;
  }
  // While someone is talking, the script waits.
  if (game.dialog.showing) {
    return;
  }
  runTutorialSteps();
}

// Works down the list until it hits an instruction that has to wait.
// The "safety" counter means a mistake in config.js can never lock the
// game up in a never-ending loop - it just stops after 100 instructions.
function runTutorialSteps() {
  var safety = 0;
  while (game.tutorial.running && safety < 100) {
    safety = safety + 1;

    var step = CONFIG.tutorial[game.tutorial.step];
    if (!step) {
      finishTutorial();   // off the end of the list: the tutorial is over
      return;
    }

    if (step.talk) {
      showDialog(step.talk);
      game.tutorial.step = game.tutorial.step + 1;
      return;   // wait for the player to read it
    }

    if (step.waitFor) {
      if (!tutorialConditionMet(step.waitFor)) {
        return;   // not yet - try again next frame
      }
      game.tutorial.step = game.tutorial.step + 1;
      continue;
    }

    if (step.dropTP) {
      doTutorialDropTP(step.dropTP);
      game.tutorial.step = game.tutorial.step + 1;
      continue;
    }

    if (step.spawnAlien) {
      doTutorialSpawnAlien(step.spawnAlien);
      game.tutorial.step = game.tutorial.step + 1;
      continue;
    }

    if (step.cutscene) {
      // Start it if it isn't going yet, then sit here until it's done.
      if (game.cutscene.name !== step.cutscene) {
        startCutscene(step.cutscene);
      }
      if (game.cutscene.running) {
        return;
      }
      game.tutorial.step = game.tutorial.step + 1;
      continue;
    }

    // An instruction we don't recognise (probably a typo in config.js).
    // Skip past it rather than getting stuck.
    game.tutorial.step = game.tutorial.step + 1;
  }
}

// The script is done. From here the game spawns aliens on its own.
function finishTutorial() {
  game.tutorial.running = false;
  game.spawnTimer = CONFIG.spawning.firstAlienAfter;
}

// Has the thing this instruction is waiting for happened yet?
function tutorialConditionMet(name) {
  if (name === 'moved') {
    return game.tutorial.hasMoved;
  }
  if (name === 'gotTP') {
    // The roll the script last put down is no longer on the ground.
    if (game.tutorial.watchPickup === null) {
      return true;
    }
    return game.pickups.indexOf(game.tutorial.watchPickup) === -1;
  }
  if (name === 'noAliens') {
    return game.aliens.length === 0;
  }
  // Something we don't recognise: don't wait for it forever.
  return true;
}

// Put a roll on the ground where the script says, and remember it, so
// 'gotTP' knows which roll it is waiting for. Infinity means it never
// times out - it sits there until the player walks over it.
function doTutorialDropTP(where) {
  var rolls = where.rolls;
  if (typeof rolls !== 'number') {
    rolls = 1;
  }
  game.tutorial.watchPickup = spawnTPPickup(where.x, where.y, rolls, Infinity);
}

// Send in one alien, from a named edge if the script asked for one.
function doTutorialSpawnAlien(info) {
  var kind = info.kind;
  if (!kind || !CONFIG.aliens[kind]) {
    kind = pickAlienType();   // no kind named, or a typo: pick one
  }
  if (kind === null) {
    return;
  }
  var alien = spawnAlien(kind);
  var spot = namedEdgeSpot(info.from, alien.size / 2 + CONFIG.spawning.spawnOutside);
  if (spot !== null) {
    alien.x = spot.x;
    alien.y = spot.y;
  }
}

// A spot just past the named edge of the screen, or null if the name
// isn't one we know (in which case the alien keeps its random spot).
function namedEdgeSpot(which, outside) {
  if (which === 'top') {
    return { x: randRange(0, WIDTH), y: CONFIG.hud.height - outside };
  }
  if (which === 'bottom') {
    return { x: randRange(0, WIDTH), y: HEIGHT + outside };
  }
  if (which === 'left') {
    return { x: -outside, y: randRange(CONFIG.hud.height, HEIGHT) };
  }
  if (which === 'right') {
    return { x: WIDTH + outside, y: randRange(CONFIG.hud.height, HEIGHT) };
  }
  return null;
}


// ================================================================
//  CUT SCENES - the bits that play themselves
// ================================================================
//  A cut scene takes the controls off the player and runs through a
//  list of stages on a timer. Every stage length is in config.js,
//  under "cutscene".
//
//  There is one at the moment: 'crane'. Its stages are
//    creak - it shudders and groans, but stays up
//    fall  - it topples over onto the worker
//    hold  - a moment looking at what just happened
//    eyes  - your eyelids close over the screen
//    black - nothing. The screen STAYS black afterwards, which is
//            where the next part of the game picks up.

function resetCutscene() {
  var cs = game.cutscene;
  cs.name = '';
  cs.phase = '';
  cs.time = 0;
  cs.running = false;
  cs.blackout = false;
  cs.crushed = false;
  cs.poolTime = 0;
  cs.beatsDone = 0;
}

function startCutscene(name) {
  var cs = game.cutscene;
  // A name with no settings in config.js (usually a typo): skip it
  // rather than freezing the game forever.
  if (!CONFIG.cutscene[name]) {
    cs.name = name;
    cs.running = false;
    return;
  }
  resetCutscene();
  cs.name = name;
  cs.running = true;
  cs.phase = 'creak';
  cs.time = 0;
  playSound('creak');
}

function updateCutscene(dt) {
  var cs = game.cutscene;
  if (!cs.running) {
    return;
  }
  var c = CONFIG.cutscene[cs.name];
  cs.time = cs.time + dt;

  // The blood keeps spreading from the moment of impact onwards.
  if (cs.crushed) {
    cs.poolTime = cs.poolTime + dt;
  }

  if (cs.phase === 'creak') {
    if (cs.time >= c.creakTime) {
      goToCutscenePhase('fall');
    }

  } else if (cs.phase === 'fall') {
    if (cs.time >= c.fallTime) {
      craneImpact();
      goToCutscenePhase('hold');
    }

  } else if (cs.phase === 'hold') {
    if (cs.time >= c.holdTime) {
      goToCutscenePhase('eyes');
    }

  } else if (cs.phase === 'eyes') {
    playEyeHeartbeats(c);
    if (cs.time >= c.eyeTime) {
      goToCutscenePhase('black');
    }

  } else if (cs.phase === 'black') {
    if (cs.time >= c.blackHold) {
      finishCutscene();
    }
  }
}

function goToCutscenePhase(name) {
  game.cutscene.phase = name;
  game.cutscene.time = 0;
  game.cutscene.beatsDone = 0;
}

// The scene is over, but the screen stays black. Whatever comes next
// (more talking, or the next part of the game) happens over the top.
function finishCutscene() {
  game.cutscene.running = false;
  game.cutscene.blackout = true;
  game.cutscene.phase = 'black';
}

// A slow thump, at each point in the close listed in config.js.
function playEyeHeartbeats(c) {
  var cs = game.cutscene;
  if (!c.heartbeatAt || !(c.eyeTime > 0)) {
    return;
  }
  var howFar = cs.time / c.eyeTime;
  while (cs.beatsDone < c.heartbeatAt.length && howFar >= c.heartbeatAt[cs.beatsDone]) {
    cs.beatsDone = cs.beatsDone + 1;
    playSound('heartbeat');
  }
}

// The crane has landed. Jolt the screen, throw up dust, and make a mess.
function craneImpact() {
  var c = CONFIG.cutscene.crane;
  var w = game.worker;

  playSound('crash');
  startShake(c.impactShake, c.impactShakeTime);
  game.cutscene.crushed = true;
  game.cutscene.poolTime = 0;

  spawnDebris(w.x, w.y, {
    count: c.dustCount, colors: c.dustColors,
    speedMin: c.dustSpeedMin, speedMax: c.dustSpeedMax,
    sizeMin: c.dustSizeMin, sizeMax: c.dustSizeMax,
    life: c.dustLife, gravity: c.dustGravity
  });

  spawnDebris(w.x, w.y - w.size * 0.2, {
    count: c.bloodCount, colors: c.bloodColors,
    speedMin: c.bloodSpeedMin, speedMax: c.bloodSpeedMax,
    sizeMin: c.bloodSizeMin, sizeMax: c.bloodSizeMax,
    life: c.bloodLife, gravity: c.bloodGravity
  });
}


// ----------------------------------------------------------------
//  Drawing the crane scene
// ----------------------------------------------------------------

// Is the crane scene on screen right now? While it is, drawSite()
// leaves the crane alone and this section draws it instead.
function craneSceneActive() {
  return game.cutscene.name === 'crane' && (game.cutscene.running || game.cutscene.crushed);
}

// Finds a piece of scenery in config.js by its id, or null.
function findScenery(id) {
  var list = CONFIG.site.scenery;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list[i];
    }
  }
  return null;
}

// How far over the crane has tipped right now, in degrees.
// 0 = still standing, fallAngle = flat on the ground.
function craneAngleNow() {
  var cs = game.cutscene;
  var c = CONFIG.cutscene.crane;
  if (cs.phase === 'creak') {
    return 0;
  }
  if (cs.phase === 'fall') {
    var howFar = clamp(cs.time / c.fallTime, 0, 1);
    // "fallCurve" bends the timing: bigger means it hangs there
    // looking like it might hold, then goes all at once.
    return Math.pow(howFar, c.fallCurve) * c.fallAngle;
  }
  return c.fallAngle;   // down, and staying down
}

// The crane, drawn swinging over from its base. It is drawn AFTER the
// worker, so it lands on top of him, which is rather the point.
function drawFallingCrane() {
  if (!craneSceneActive()) {
    return;
  }
  var thing = findScenery('crane');
  if (thing === null) {
    return;
  }
  var c = CONFIG.cutscene.crane;
  var cs = game.cutscene;

  // Rattling about before it goes
  var shudder = 0;
  if (cs.phase === 'creak') {
    shudder = Math.sin(cs.time * c.shudderSpeed) * c.shudderSize;
  }

  // Turn the paintbrush about the foot of the crane, then draw the
  // crane standing on that spot. A tall picture is taller than it is
  // wide, so we ask how tall it actually is before finding its foot.
  var drawnHeight = thing.size * pictureTallness(thing.emoji);
  var footY = thing.y + drawnHeight / 2;

  ctx.save();
  ctx.translate(thing.x + shudder, footY);
  ctx.rotate(craneAngleNow() * Math.PI / 180);
  drawEmoji(thing.emoji, 0, -drawnHeight / 2, thing.size);
  ctx.restore();
}

// The puddle under the wreckage. It spreads out over a second or so.
function drawBloodPool() {
  var cs = game.cutscene;
  var c = CONFIG.cutscene.crane;
  if (!cs.crushed || !(c.bloodPoolSize > 0)) {
    return;
  }
  var grown = 1;
  if (c.bloodPoolGrowTime > 0) {
    grown = clamp(cs.poolTime / c.bloodPoolGrowTime, 0, 1);
  }
  var w = game.worker;
  ctx.fillStyle = c.bloodPoolColor;
  ctx.beginPath();
  ctx.ellipse(w.x, w.y + w.size * 0.25,
              c.bloodPoolSize * grown, c.bloodPoolSize * 0.45 * grown,
              0, 0, Math.PI * 2);
  ctx.fill();
}


// ----------------------------------------------------------------
//  Your eyes closing
// ----------------------------------------------------------------

// How shut your eyes are: 0 = wide open, 1 = fully closed.
function eyeClosedAmount() {
  var cs = game.cutscene;
  if (cs.blackout || cs.phase === 'black') {
    return 1;
  }
  if (cs.phase !== 'eyes' || !CONFIG.cutscene[cs.name]) {
    return 0;
  }
  var c = CONFIG.cutscene[cs.name];
  var howFar = clamp(cs.time / c.eyeTime, 0, 1);
  // They fight it on the way down, so the close slows in the middle
  // instead of running at an even speed.
  howFar = howFar - Math.sin(howFar * Math.PI) * c.eyeFlutter;
  return clamp(howFar, 0, 1);
}

// Two black eyelids, closing in from the top and the bottom. They bow
// in the middle, which is what stops them looking like lift doors.
function drawEyelids(closed) {
  if (closed <= 0) {
    return;
  }
  var c = CONFIG.cutscene.crane;
  if (closed >= 1) {
    drawBlackout();
    return;
  }

  var lid = (HEIGHT / 2) * closed;
  // The bow is widest half way, and flat at either end, so the lids
  // meet cleanly when they shut.
  var bow = c.eyeCurve * Math.sin(closed * Math.PI);
  var middleX = WIDTH / 2;

  ctx.fillStyle = c.eyeColor;

  // Top lid
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(WIDTH, 0);
  ctx.lineTo(WIDTH, lid);
  ctx.quadraticCurveTo(middleX, lid + bow, 0, lid);
  ctx.closePath();
  ctx.fill();

  // Bottom lid
  ctx.beginPath();
  ctx.moveTo(0, HEIGHT);
  ctx.lineTo(WIDTH, HEIGHT);
  ctx.lineTo(WIDTH, HEIGHT - lid);
  ctx.quadraticCurveTo(middleX, HEIGHT - lid - bow, 0, HEIGHT - lid);
  ctx.closePath();
  ctx.fill();
}

function drawBlackout() {
  ctx.fillStyle = CONFIG.cutscene.crane.eyeColor;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}


// ================================================================
//  THE TALKING BOX - the chunky pixel dialog box
// ================================================================
//  showDialog(['line one', 'line two']) puts a message on screen. The
//  words type themselves out one letter at a time. Space skips to the
//  end of the message; Space again closes it.
//
//  The pixel look comes from a trick: the words are drawn small onto a
//  hidden canvas, then blown up with smoothing switched off, so each
//  letter turns into chunky blocks. CONFIG.dialog.pixelScale sets how
//  chunky (1 = ordinary smooth text).

function showDialog(lines) {
  game.dialog.showing = true;
  game.dialog.lines = lines;
  game.dialog.charsShown = 0;
  game.dialog.blinkTime = 0;
  game.dialog.ticks = 0;
}

function closeDialog() {
  game.dialog.showing = false;
  game.dialog.lines = [];
  game.dialog.charsShown = 0;
}

// How many letters the whole message is, counting every line.
function dialogTotalChars() {
  var total = 0;
  for (var i = 0; i < game.dialog.lines.length; i++) {
    total = total + game.dialog.lines[i].length;
  }
  return total;
}

function updateDialog(dt) {
  var d = game.dialog;
  if (!d.showing) {
    return;
  }
  d.blinkTime = d.blinkTime + dt;

  var total = dialogTotalChars();
  var stillTyping = d.charsShown < total;

  if (stillTyping) {
    var before = Math.floor(d.charsShown);
    d.charsShown = d.charsShown + CONFIG.dialog.charsPerSecond * dt;
    if (d.charsShown > total) {
      d.charsShown = total;
    }
    playTypingTicks(Math.floor(d.charsShown) - before);
  }

  if (wasPressed('Space')) {
    if (stillTyping) {
      d.charsShown = total;   // show the rest of it straight away
    } else {
      closeDialog();
      // This same Space press must not also throw a roll of TP.
      game.throwLocked = true;
    }
  }
}

// A tiny tick every few letters, so the typing has a bit of life to it.
// Set typeSoundEvery to 0 in config.js for silent typing.
function playTypingTicks(newChars) {
  var every = CONFIG.dialog.typeSoundEvery;
  if (!(every > 0) || newChars <= 0) {
    return;
  }
  game.dialog.ticks = game.dialog.ticks + newChars;
  while (game.dialog.ticks >= every) {
    game.dialog.ticks = game.dialog.ticks - every;
    playSound(CONFIG.dialog.typeSound);
  }
}


// ----------------------------------------------------------------
//  Drawing the talking box
// ----------------------------------------------------------------
function drawDialog() {
  var d = CONFIG.dialog;
  if (!game.dialog.showing) {
    return;
  }

  var boxWidth = d.width;
  var boxHeight = d.height;
  var left = Math.round((WIDTH - boxWidth) / 2);
  var top = Math.round(HEIGHT - boxHeight - d.bottomGap);

  drawPixelPanel(left, top, boxWidth, boxHeight);
  drawDialogNameTag(left, top);

  // The lines, as far as they have typed themselves out.
  var lettersLeft = Math.floor(game.dialog.charsShown);
  var textTop = top + d.padY;
  for (var i = 0; i < game.dialog.lines.length; i++) {
    var line = game.dialog.lines[i];
    var showing = line;
    if (lettersLeft < line.length) {
      showing = line.substring(0, lettersLeft);   // part way through this line
    }
    if (lettersLeft > 0) {
      drawPixelText(showing, left + d.padX, textTop + i * d.lineGap, d.textSize, d.colors.text);
    }
    lettersLeft = lettersLeft - line.length;
    if (lettersLeft < 0) {
      lettersLeft = 0;
    }
  }

  // The blinking arrow, once the whole message is on screen.
  if (game.dialog.charsShown >= dialogTotalChars() &&
      blinkOn(game.dialog.blinkTime, d.promptBlinksPerSecond)) {
    drawPixelArrow(left + boxWidth - d.promptMargin, top + boxHeight - d.promptMargin, d.promptSize);
  }
}

// The chunky pixel frame: a near-black outer edge, a cream frame inside
// it, then the dark middle. The four corners are knocked out with little
// squares, which is what gives it that blocky, cut-corner look.
function drawPixelPanel(x, y, width, height) {
  var d = CONFIG.dialog;
  var b = d.borderSize;
  var notch = d.cornerNotch;

  // Outer edge, then the cream frame, then the dark middle
  ctx.fillStyle = d.colors.outline;
  ctx.fillRect(x - b, y - b, width + b * 2, height + b * 2);
  ctx.fillStyle = d.colors.border;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = d.colors.fill;
  ctx.fillRect(x + b, y + b, width - b * 2, height - b * 2);

  // Knock the corners off, so it reads as pixel art rather than a plain box
  if (notch > 0) {
    ctx.fillStyle = d.colors.outline;
    ctx.fillRect(x - b, y - b, notch + b, notch + b);
    ctx.fillRect(x + width - notch, y - b, notch + b, notch + b);
    ctx.fillRect(x - b, y + height - notch, notch + b, notch + b);
    ctx.fillRect(x + width - notch, y + height - notch, notch + b, notch + b);
  }
}

// The little cream name box sitting on the top edge, e.g. "THE FOREMAN".
function drawDialogNameTag(boxLeft, boxTop) {
  var d = CONFIG.dialog;
  if (d.nameTag === '') {
    return;
  }
  var textWidth = measurePixelText(d.nameTag, d.nameTagSize);
  var tagWidth = textWidth + d.nameTagPadX * 2;
  var tagLeft = boxLeft + d.nameTagX;
  var tagTop = boxTop - d.nameTagHeight;
  var b = d.borderSize;

  ctx.fillStyle = d.colors.outline;
  ctx.fillRect(tagLeft - b, tagTop - b, tagWidth + b * 2, d.nameTagHeight + b);
  ctx.fillStyle = d.colors.border;
  ctx.fillRect(tagLeft, tagTop, tagWidth, d.nameTagHeight);

  drawPixelText(d.nameTag, tagLeft + d.nameTagPadX,
                tagTop + (d.nameTagHeight - pixelTextHeight(d.nameTagSize)) / 2,
                d.nameTagSize, d.colors.nameText);
}

// A downward arrow built out of stacked blocks, so it matches the
// pixel look. "size" is the size of one block, in pixels.
function drawPixelArrow(x, y, size) {
  ctx.fillStyle = CONFIG.dialog.colors.prompt;
  for (var row = 0; row < 3; row++) {
    var blocks = 3 - row;                       // 3 blocks wide, then 2, then 1
    var rowWidth = blocks * size;
    ctx.fillRect(Math.round(x - rowWidth / 2), Math.round(y + row * size), rowWidth, size);
  }
}


// ----------------------------------------------------------------
//  Chunky pixel words
// ----------------------------------------------------------------
//  The words are drawn small onto this hidden canvas, then blown up
//  onto the game window with smoothing turned off. That is what turns
//  each letter into blocks. One hidden canvas is reused for every bit
//  of text, so we are not making new ones 60 times a second.

var pixelCanvas = null;
var pixelCtx = null;

// Makes sure the hidden canvas exists and gives back its context.
function getPixelCanvas() {
  if (pixelCanvas === null) {
    pixelCanvas = document.createElement('canvas');
    pixelCtx = pixelCanvas.getContext('2d');
  }
  return pixelCtx;
}

// The size the words are drawn at BEFORE being blown up.
function pixelSmallSize(size) {
  var small = Math.round(size / CONFIG.dialog.pixelScale);
  if (small < 4) {
    small = 4;   // any smaller and the letters turn to mush
  }
  return small;
}

// How tall a line is on the hidden canvas, before being blown up.
// The spare few pixels are room for the tails on letters like g and y.
function pixelSmallHeight(smallSize) {
  return smallSize + 3;
}

// How tall this text ends up ON SCREEN, in pixels. Used to sit text
// squarely in the middle of things, whatever pixelScale is set to.
function pixelTextHeight(size) {
  return pixelSmallHeight(pixelSmallSize(size)) * CONFIG.dialog.pixelScale;
}

// How wide this text will be on screen, in pixels.
function measurePixelText(text, size) {
  var small = getPixelCanvas();
  small.font = 'bold ' + pixelSmallSize(size) + 'px ' + CONFIG.fonts.pixel;
  return Math.ceil(small.measureText(text).width) * CONFIG.dialog.pixelScale;
}

// Draws text with its top-left corner at (x, y), in chunky pixel blocks.
function drawPixelText(text, x, y, size, color) {
  if (text === '') {
    return;
  }
  var scale = CONFIG.dialog.pixelScale;
  var smallSize = pixelSmallSize(size);
  var small = getPixelCanvas();

  // Measure first, so we know how big the hidden canvas needs to be.
  small.font = 'bold ' + smallSize + 'px ' + CONFIG.fonts.pixel;
  var wide = Math.ceil(small.measureText(text).width) + 2;
  var tall = pixelSmallHeight(smallSize);
  if (wide < 1) {
    wide = 1;
  }

  // Resizing a canvas wipes it clean AND forgets its font, so the font
  // has to be set again afterwards.
  if (pixelCanvas.width !== wide || pixelCanvas.height !== tall) {
    pixelCanvas.width = wide;
    pixelCanvas.height = tall;
  } else {
    small.clearRect(0, 0, wide, tall);
  }
  small.font = 'bold ' + smallSize + 'px ' + CONFIG.fonts.pixel;
  small.textAlign = 'left';
  small.textBaseline = 'top';
  small.fillStyle = color;
  small.fillText(text, 1, 1);

  // Blow it up. Smoothing off is what keeps the blocks sharp.
  var smoothingWas = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pixelCanvas, Math.round(x), Math.round(y), wide * scale, tall * scale);
  ctx.imageSmoothingEnabled = smoothingWas;
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
    if (game.cutscene.blackout) {
      drawBlackout();    // the screen has gone dark and stays dark
    } else {
      beginWorldShake(); // (see JUICE)
      drawWorld();
      endWorldShake();
      // The top bar is hidden during a cut scene - hard hats and a TP
      // count rather spoil the moment.
      if (!isFrozen()) {
        drawHud();
      }
      drawEyelids(eyeClosedAmount());   // (see CUT SCENES)
    }
    drawDialog();        // the talking box sits on top of everything
  } else if (game.state === 'over') {
    drawWorld();
    drawHud();
    drawOverScreen();
  }
}

// Everything on the site, back to front.
function drawWorld() {
  drawSite();
  drawBloodPool();      // on the ground, so it goes under everything (see CUT SCENES)
  drawPickups();
  drawAliens();
  drawRolls();
  drawParticles();
  drawWorker();
  drawFallingCrane();   // last, so it comes down ON TOP of the worker
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

  // Scenery (decoration only - it doesn't block anything).
  // The crane is skipped while the crane scene is running, because
  // that scene draws its own, toppling-over version (see CUT SCENES).
  var skipCrane = craneSceneActive();
  for (var k = 0; k < s.scenery.length; k++) {
    var thing = s.scenery[k];
    if (skipCrane && thing.id === 'crane') {
      continue;
    }
    drawEmoji(thing.emoji, thing.x, thing.y, thing.size);
  }
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

    if (visible) {
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
    }
  }
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

    } else if (alien.status === 'caught') {
      // Fully wrapped: flash on and off, then it's gone.
      if (blinkOn(alien.goneTimer, CONFIG.wrapping.caughtFlashesPerSecond)) {
        drawEmoji(emoji, alien.x, alien.y, alien.size);
        drawWrapBands(alien.x, alien.y, alien.size, 1);
      }
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
//  The top bar: hard hats and TP
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

  // Out of TP warning, just under the bar. Not during the tutorial -
  // you're MEANT to have none then, and the foreman is already saying so.
  if (w.tp === 0 && !game.tutorial.running) {
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
//  Screens: menu and game over
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
}

function drawOverScreen() {
  var t = CONFIG.text;
  var sizes = CONFIG.textSizes;
  var colors = CONFIG.colors;
  var middleX = WIDTH / 2;

  drawOverlay(colors.overlay);

  drawText(t.loseHeading, middleX, 200, {
    size: sizes.heading, bold: true, color: colors.lose, outline: colors.outline, align: 'center', font: CONFIG.fonts.title
  });

  drawText(t.caughtLabel + game.run.caught, middleX, 300, { size: sizes.big, color: colors.text, align: 'center' });

  // Only offer "Press Space" once Space actually works.
  if (game.screenTime >= CONFIG.screens.overInputDelay &&
      blinkOn(game.screenTime, CONFIG.screens.promptBlinksPerSecond)) {
    drawText(t.playAgain, middleX, 430, {
      size: sizes.big, bold: true, color: colors.text, outline: colors.outline, align: 'center'
    });
  }
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

// Clears away all the shake and flying bits, ready for a new run.
function resetJuice() {
  game.particles = [];
  game.shakeTimer = 0;
  game.shakeStrength = CONFIG.juice.shakeStrength;
  game.shakeLength = CONFIG.juice.shakeTime;
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

// Starts the site shaking (when an alien knocks your hat off, or when
// a crane lands on you). Leave both numbers out for the normal shake
// from config.js; the crane scene asks for a much bigger one.
//   strength - how far it jolts, in pixels
//   length   - how long it shakes for, in seconds
function startShake(strength, length) {
  if (typeof strength !== 'number') {
    strength = CONFIG.juice.shakeStrength;
  }
  if (typeof length !== 'number') {
    length = CONFIG.juice.shakeTime;
  }
  game.shakeStrength = strength;
  game.shakeLength = length;
  game.shakeTimer = length;
}

// Called just before the site is drawn. If the screen is shaking,
// it moves the paintbrush a random few pixels, so the whole site
// gets drawn slightly off to one side. The shake fades as it ends.
function beginWorldShake() {
  game.shakeX = 0;
  game.shakeY = 0;
  if (game.shakeTimer > 0 && game.shakeLength > 0) {
    var strength = game.shakeStrength * (game.shakeTimer / game.shakeLength);
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
// the top bar stays steady.
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
      gravity: 0,                      // TP squares float; dust and blood fall
      color: j.burstColors[randInt(0, j.burstColors.length - 1)]
    });
  }
}

// A burst of heavier bits that arc up and then fall back down. Used by
// the crane scene for dust and for blood. "look" is a bundle of
// settings: count, colors, speedMin, speedMax, sizeMin, sizeMax, life
// and gravity (how fast they fall, in pixels per second per second).
// They are thrown mostly upwards, so it reads as a splash rather than
// an explosion.
function spawnDebris(x, y, look) {
  var j = CONFIG.juice;
  for (var i = 0; i < look.count; i++) {
    if (game.particles.length >= j.maxParticles) {
      return;
    }
    // Angles from just past straight left, round the top, to just past
    // straight right. (In canvas, up is a negative angle.)
    var angle = randRange(-Math.PI * 0.95, -Math.PI * 0.05);
    var speed = randRange(look.speedMin, look.speedMax);
    game.particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randRange(look.sizeMin, look.sizeMax),
      turn: randRange(0, Math.PI * 2),
      spin: randRange(-j.burstSpin, j.burstSpin),
      timeLeft: look.life,
      gravity: look.gravity,
      color: look.colors[randInt(0, look.colors.length - 1)]
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
      if (p.gravity > 0) {
        p.vy = p.vy + p.gravity * dt;   // heavy bits fall back down
      }
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
//  START UP - runs once, when the page opens
// ================================================================
function setUpGame() {
  buildSiteDecoration();
  resetRun();
  changeScreen('menu');
}

setUpGame();
startGameLoop();

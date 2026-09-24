// ================================================================
//  STATE - how far you have got with everyone
// ================================================================
//  One bundle, called PROGRESS, holds everything the game remembers
//  between visits. It looks like this:
//
//    PROGRESS = {
//      time: 2,
//      characters: {
//        mia: { stage: 1, like: 3, flags: { mentionedCrane: true }, met: true },
//        goth: { stage: 0, like: 4, done: { goth_bar_n: true }, met: true }
//      }
//    }
//
//  What each bit means:
//    time  - what time of day it is: 0 morning, 1 daytime, 2 evening,
//            3 night. It decides who is out and about. Moves on by one
//            after every conversation, and wraps round to morning.
//    stage - which chapter of that character's story you are on. It
//            decides where they are and what they say. Starts at 0.
//            Only used by story characters like Mia.
//    like  - how warm they are towards you. Goes up and down with the
//            replies you pick.
//    flags - little true/false notes, so a character can remember
//            something you said ages ago.
//    done  - which of their scenes you have already played, so you do
//            not get the same conversation twice. Only used by the
//            Shauns, who have a scene per place per time of day.
//    met   - true once you have spoken to them at least once.
//
//  SAVING
//  It saves into the browser's own storage. Some locked-down browsers
//  refuse to do that when a page is opened straight off the disk, so
//  every read and write is wrapped in a safety net. If saving is
//  blocked the game plays perfectly well - progress just lasts until
//  you close the tab. saveWorks tells you which it is.
//
//  To look at your progress while playing: press F12, click Console,
//  type  PROGRESS  and press Enter.
// ================================================================

var SAVE_KEY = 'wipeout-dating-save';

var PROGRESS = { time: 0, characters: {} };
var saveWorks = true;   // set to false if this browser blocks saving


// A brand new, never-met-them state.
function blankCharacterState() {
  return {
    stage: 0,
    like: 0,
    flags: {},
    done: {},
    met: false
  };
}

// The state bundle for one character, making a fresh one if this is
// the first time they have come up.
function getCharacterState(characterId) {
  if (!PROGRESS.characters[characterId]) {
    PROGRESS.characters[characterId] = blankCharacterState();
  }
  return PROGRESS.characters[characterId];
}


// ----------------------------------------------------------------
//  Changing the state
// ----------------------------------------------------------------

// ----------------------------------------------------------------
//  The time of day
// ----------------------------------------------------------------
//  Four slots, going round and round: morning, daytime, evening,
//  night, then morning again. Who you can meet depends on it.

// What time it is now, as a number from 0 to 3.
function currentTimeIndex() {
  var time = PROGRESS.time;
  if (typeof time !== 'number' || time < 0 || time >= TIME_SLOTS.length) {
    return 0;
  }
  return time;
}

// What time it is now, as the letter the character files use:
// 'M' morning, 'D' daytime, 'A' evening, 'N' night.
function currentTimeCode() {
  return TIME_SLOTS[currentTimeIndex()].code;
}

// Move the clock on one slot. After night it comes back round to
// morning, so you can never run out of time to meet someone.
function advanceTime() {
  PROGRESS.time = (currentTimeIndex() + 1) % TIME_SLOTS.length;
  saveProgress();
}


// ----------------------------------------------------------------
//  Scenes you have already played
// ----------------------------------------------------------------

// Have we already had this exact conversation with this person?
function sceneIsDone(characterId, nodeId) {
  var done = getCharacterState(characterId).done;
  return done[nodeId] === true;
}

// Remember that we have, so they say something new next time.
function markSceneDone(characterId, nodeId) {
  getCharacterState(characterId).done[nodeId] = true;
}


// ----------------------------------------------------------------
//  Changing a character
// ----------------------------------------------------------------

// Move a character on to the next chapter of their story.
function advanceStage(characterId) {
  var state = getCharacterState(characterId);
  state.stage = state.stage + 1;
  saveProgress();
}

// Warm them up, or cool them off. "amount" can be negative.
function changeLike(characterId, amount) {
  if (typeof amount !== 'number') {
    return;
  }
  var state = getCharacterState(characterId);
  state.like = state.like + amount;
}

// Write down a set of little notes, e.g. { mentionedCrane: true }.
function setFlags(characterId, flags) {
  if (!flags) {
    return;
  }
  var state = getCharacterState(characterId);
  for (var name in flags) {
    state.flags[name] = flags[name];
  }
}

// Does this character's memory match what a line of dialogue is asking
// for? "needs" looks like { mentionedCrane: true }. No needs means yes.
function flagsMatch(characterId, needs) {
  if (!needs) {
    return true;
  }
  var state = getCharacterState(characterId);
  for (var name in needs) {
    var wanted = needs[name];
    var have = state.flags[name];
    // A flag that was never set counts as false, so
    // { toldHer: false } is true until you have told her.
    if (have === undefined) {
      have = false;
    }
    if (have !== wanted) {
      return false;
    }
  }
  return true;
}


// ----------------------------------------------------------------
//  Saving and loading
// ----------------------------------------------------------------

function saveProgress() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(PROGRESS));
  } catch (e) {
    // This browser will not let us save. Carry on without it.
    saveWorks = false;
  }
}

function loadProgress() {
  var text = null;
  try {
    text = localStorage.getItem(SAVE_KEY);
  } catch (e) {
    saveWorks = false;
    return;
  }
  if (!text) {
    return;   // nothing saved yet: a fresh start
  }
  try {
    var saved = JSON.parse(text);
    if (saved && saved.characters) {
      PROGRESS = saved;
    }
  } catch (e) {
    // The saved data is damaged. Start fresh rather than crashing.
    PROGRESS = { characters: {} };
  }
  tidyProgress();
}

// Saved progress can go stale: a character might have been renamed,
// or had stages taken out of their file since it was saved. This puts
// anything odd back into range, so a stale save can never wedge the
// game on a chapter that no longer exists.
function tidyProgress() {
  // A save made before the clock existed has no time in it at all.
  if (typeof PROGRESS.time !== 'number' ||
      PROGRESS.time < 0 || PROGRESS.time >= TIME_SLOTS.length) {
    PROGRESS.time = 0;
  }

  for (var id in PROGRESS.characters) {
    var state = PROGRESS.characters[id];

    if (typeof state.stage !== 'number' || state.stage < 0) {
      state.stage = 0;
    }
    if (typeof state.like !== 'number') {
      state.like = 0;
    }
    if (!state.flags || typeof state.flags !== 'object') {
      state.flags = {};
    }
    if (!state.done || typeof state.done !== 'object') {
      state.done = {};
    }

    // Never point past the end of a character's story.
    var character = CHARACTERS[id];
    if (character && character.stages && state.stage > character.stages.length) {
      state.stage = character.stages.length;
    }
  }
}

// Forget everything, for handing the laptop to someone new.
function wipeProgress() {
  PROGRESS = { time: 0, characters: {} };
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    saveWorks = false;
  }
}

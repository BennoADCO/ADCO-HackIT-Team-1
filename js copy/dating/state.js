// ================================================================
//  STATE - how far you have got with everyone
// ================================================================
//  One bundle, called PROGRESS, holds everything the game remembers
//  between visits. It looks like this:
//
//    PROGRESS = {
//      characters: {
//        mia: { stage: 1, like: 3, flags: { mentionedCrane: true }, met: true }
//      }
//    }
//
//  What each bit means:
//    stage - which chapter of that character's story you are on. It
//            decides where they are and what they say. Starts at 0.
//    like  - how warm they are towards you. Goes up and down with the
//            replies you pick.
//    flags - little true/false notes, so a character can remember
//            something you said ages ago.
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

var PROGRESS = { characters: {} };
var saveWorks = true;   // set to false if this browser blocks saving


// A brand new, never-met-them state.
function blankCharacterState() {
  return {
    stage: 0,
    like: 0,
    flags: {},
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

    // Never point past the end of a character's story.
    var character = CHARACTERS[id];
    if (character && character.stages && state.stage > character.stages.length) {
      state.stage = character.stages.length;
    }
  }
}

// Forget everything, for handing the laptop to someone new.
function wipeProgress() {
  PROGRESS = { characters: {} };
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    saveWorks = false;
  }
}

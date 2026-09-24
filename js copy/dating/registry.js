// ================================================================
//  THE REGISTRY - where all the game's data lands
// ================================================================
//  This file runs FIRST, before any location or character file. All
//  it does is make two empty shelves for everything else to put its
//  data on:
//
//    LOCATIONS  - the places you can visit
//    CHARACTERS - the people you can meet
//
//  A character file (characters/mia/mia.js) puts itself on the shelf
//  like this:
//
//    CHARACTERS['mia'] = { ... };
//
//  and a location file does the same with LOCATIONS. Nothing is
//  downloaded or read from disk while the game is running - every file
//  is pulled in by a <script> tag in dating.html, which is what lets
//  this work by double-clicking, with no internet and no set-up.
//
//  If you add a new character, you must ALSO add a <script> line for
//  it in dating.html, or the game will never know it exists.
// ================================================================

var LOCATIONS = {};
var CHARACTERS = {};


// ----------------------------------------------------------------
//  Looking things up
// ----------------------------------------------------------------

// The list of every location id, in the order they were added.
function allLocationIds() {
  var ids = [];
  for (var id in LOCATIONS) {
    ids.push(id);
  }
  return ids;
}

// The list of every character id.
function allCharacterIds() {
  var ids = [];
  for (var id in CHARACTERS) {
    ids.push(id);
  }
  return ids;
}

// Which stage of their story a character is up to right now, and what
// that stage says about them. Gives back null once they have run out
// of stages (their story is finished).
function currentStage(characterId) {
  var character = CHARACTERS[characterId];
  if (!character || !character.stages) {
    return null;
  }
  var stage = getCharacterState(characterId).stage;   // see state.js
  if (stage < 0 || stage >= character.stages.length) {
    return null;
  }
  return character.stages[stage];
}

// Where a character is right now, or null if their story is finished
// and they are no longer out and about.
function whereIs(characterId) {
  var stage = currentStage(characterId);
  if (stage === null) {
    return null;
  }
  return stage.at;
}

// Everyone standing in this location right now.
function charactersAt(locationId) {
  var found = [];
  var ids = allCharacterIds();
  for (var i = 0; i < ids.length; i++) {
    if (whereIs(ids[i]) === locationId) {
      found.push(ids[i]);
    }
  }
  return found;
}

// The conversation node a character starts on when you walk up to
// them right now. Null means there is nothing for them to say.
function openingNodeFor(characterId) {
  var stage = currentStage(characterId);
  if (stage === null) {
    return null;
  }
  return stage.start;
}

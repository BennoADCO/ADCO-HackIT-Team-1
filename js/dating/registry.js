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
//  THE TIME OF DAY
// ----------------------------------------------------------------
//  Four slots, in the order the day runs. The one-letter code is what
//  character files use; the name is what the player sees on the map.
//  To rename a time of day, change the "name" here and nowhere else.

var TIME_SLOTS = [
  { code: 'M', name: 'Morning' },
  { code: 'D', name: 'Daytime' },
  { code: 'A', name: 'Evening' },
  { code: 'N', name: 'Night' }
];

// The readable name of a one-letter code, for showing on screen.
function timeName(code) {
  for (var i = 0; i < TIME_SLOTS.length; i++) {
    if (TIME_SLOTS[i].code === code) {
      return TIME_SLOTS[i].name;
    }
  }
  return code;
}


// ----------------------------------------------------------------
//  Looking things up
// ----------------------------------------------------------------

// There are two sorts of character, and they work differently:
//
//   STORY characters (Mia) have "stages". They are in one place at a
//   time, and move on a chapter when a reply says so.
//
//   SCENE characters (the Shauns) have "appearances". They turn up in
//   lots of places, and which one depends on the time of day. Each
//   scene is played once and then they have something new to say.
//
// This tells the two apart.
function isSceneCharacter(characterId) {
  var character = CHARACTERS[characterId];
  return !!(character && character.appearances && character.appearances.length > 0);
}

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

// Where a STORY character is right now, or null if their story is
// finished and they are no longer out and about. Scene characters are
// not in any one place, so they always give back null here - use
// isHereNow instead.
function whereIs(characterId) {
  if (isSceneCharacter(characterId)) {
    return null;
  }
  var stage = currentStage(characterId);
  if (stage === null) {
    return null;
  }
  return stage.at;
}

// For a SCENE character: the scene they are here for, right now, at
// this place and this time of day - as long as it has not been played
// already. Null means they are not here, or you have already had every
// conversation they have in this spot.
function appearanceHereNow(characterId, locationId) {
  var character = CHARACTERS[characterId];
  if (!character || !character.appearances) {
    return null;
  }

  var now = currentTimeCode();   // see state.js

  for (var i = 0; i < character.appearances.length; i++) {
    var appearance = character.appearances[i];

    if (appearance.at !== locationId) {
      continue;
    }
    if (appearance.time !== now) {
      continue;
    }
    if (sceneIsDone(characterId, appearance.node)) {
      continue;   // already had this one
    }
    return appearance;
  }
  return null;
}

// Is this person standing here, right now? Works for both sorts.
function isHereNow(characterId, locationId) {
  if (isSceneCharacter(characterId)) {
    return appearanceHereNow(characterId, locationId) !== null;
  }
  return whereIs(characterId) === locationId;
}

// Everyone standing in this location right now.
function charactersAt(locationId) {
  var found = [];
  var ids = allCharacterIds();
  for (var i = 0; i < ids.length; i++) {
    if (isHereNow(ids[i], locationId)) {
      found.push(ids[i]);
    }
  }
  return found;
}

// The conversation node a character starts on when you walk up to
// them right now. Null means there is nothing for them to say.
function openingNodeFor(characterId, locationId) {
  if (isSceneCharacter(characterId)) {
    var appearance = appearanceHereNow(characterId, locationId);
    if (appearance === null) {
      return null;
    }
    return appearance.node;
  }

  var stage = currentStage(characterId);
  if (stage === null) {
    return null;
  }
  return stage.start;
}


// ----------------------------------------------------------------
//  Who is out and about at all
// ----------------------------------------------------------------

// Every place someone could be found right now, across the whole map.
// Used to work out whether waiting for a later time of day would
// actually help, so the player is never told to wait for nothing.
function anybodyOutAt(timeIndex) {
  var wasTime = PROGRESS.time;
  PROGRESS.time = timeIndex;

  var found = false;
  var places = allLocationIds();
  for (var i = 0; i < places.length && !found; i++) {
    if (charactersAt(places[i]).length > 0) {
      found = true;
    }
  }

  PROGRESS.time = wasTime;
  return found;
}

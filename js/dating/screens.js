// ================================================================
//  SCREENS - the map, the "who's here" list, and the scene
// ================================================================
//  There are three screens, and exactly one is on show at a time:
//
//    map    - the places you can go, and who is at each one
//    people - shown only when two or more people are in one place
//    scene  - the background, the character, and the talking
//
//  Everything here builds ordinary web page elements (a heading, a
//  button, a picture) rather than painting pixels. That is why the
//  words stay sharp however big the window is.
// ================================================================

var els = {};              // the bits of the page we keep coming back to
var currentLocation = '';  // where the player is standing right now


// Finds every part of the page once, when the game starts, so we are
// not hunting for them over and over.
function grabElements() {
  els.map = document.getElementById('map-screen');
  els.mapPins = document.getElementById('map-pins');
  els.timeOfDay = document.getElementById('time-of-day');
  els.waitButton = document.getElementById('wait-button');
  els.people = document.getElementById('people-screen');
  els.peopleTitle = document.getElementById('people-title');
  els.peopleList = document.getElementById('people-list');
  els.scene = document.getElementById('scene-screen');
  els.sceneBg = document.getElementById('scene-bg');
  els.sprite = document.getElementById('scene-sprite');
  els.speaker = document.getElementById('speaker');
  els.line = document.getElementById('line');
  els.replies = document.getElementById('replies');
  els.prompt = document.getElementById('continue-prompt');
  els.problems = document.getElementById('problems');
  els.saveHint = document.getElementById('save-hint');
}

// Shows one screen and hides the other two.
function showScreen(which) {
  els.map.hidden = (which !== 'map');
  els.people.hidden = (which !== 'people');
  els.scene.hidden = (which !== 'scene');
}

// Empties an element of everything inside it.
function emptyOut(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// Paints a place onto something: its picture if it has one, otherwise
// its flat colour. A place with no artwork yet still looks deliberate
// rather than broken, so dialogue can be written long before anyone
// has drawn anything.
function paintPlace(element, place) {
  if (!place) {
    return;
  }
  if (place.background) {
    element.style.backgroundImage = 'url("' + place.background + '")';
  } else {
    element.style.backgroundImage = 'none';
  }
  element.style.backgroundColor = place.colour || '#2a2f3a';
}


// ----------------------------------------------------------------
//  The map
// ----------------------------------------------------------------
function showMap() {
  currentLocation = '';
  renderMap();
  showScreen('map');
}

function renderMap() {
  emptyOut(els.mapPins);
  var ids = allLocationIds();

  for (var i = 0; i < ids.length; i++) {
    var place = LOCATIONS[ids[i]];

    // A place with no pin position cannot be put anywhere on the
    // picture. The checker already shouts about this on screen; here we
    // just leave it off rather than piling it up in the corner.
    if (typeof place.mapX !== 'number' || typeof place.mapY !== 'number') {
      continue;
    }
    els.mapPins.appendChild(buildMapPin(ids[i]));
  }

  showTimeOfDay();

  // A line at the bottom saying whether progress is being kept.
  if (saveWorks) {
    els.saveHint.textContent = 'Your progress saves automatically on this computer.';
  } else {
    els.saveHint.textContent = "This browser won't save: progress lasts until you close the tab.";
  }
}

// ----------------------------------------------------------------
//  The clock
// ----------------------------------------------------------------
//  Who is out depends on the time of day, so the player has to be able
//  to see it, and has to be able to move it on without talking to
//  somebody. Otherwise an empty map would be a dead end.

function showTimeOfDay() {
  els.timeOfDay.textContent = TIME_SLOTS[currentTimeIndex()].name;

  var nextSlot = (currentTimeIndex() + 1) % TIME_SLOTS.length;
  els.waitButton.textContent = 'Wait until ' + TIME_SLOTS[nextSlot].name;
}

// Let the hours pass without meeting anyone, and go back to the map to
// see who that has brought out.
function waitForNextTime() {
  advanceTime();
  showMap();
}

// ----------------------------------------------------------------
//  One clickable pin on the town map
// ----------------------------------------------------------------
//  The picture already has the pins and the place names drawn on it,
//  so this does not repeat them. All it adds is a ring you can click,
//  sitting exactly on top of the drawn pin, and - when somebody is
//  there - a little tag underneath saying who.

function buildMapPin(locationId) {
  var place = LOCATIONS[locationId];
  var people = charactersAt(locationId);

  var pin = document.createElement('button');
  pin.className = 'map-pin';
  if (people.length > 0) {
    pin.className = pin.className + ' has-people';
  }

  // Percentages, so the pin stays on its building at any window size.
  pin.style.left = place.mapX + '%';
  pin.style.top = place.mapY + '%';

  pin.onclick = function () {
    enterLocation(locationId);
  };

  // The names of whoever is here. This is the whole reason to pick one
  // place over another, so it has to be readable at a glance.
  var names = [];
  for (var i = 0; i < people.length; i++) {
    names.push(CHARACTERS[people[i]].name);
  }

  // Hovering says where you are about to go, which the ring alone does
  // not - the place names are part of the picture, not of these pins.
  if (names.length > 0) {
    pin.title = place.name + ' - ' + names.join(', ');
  } else {
    pin.title = place.name + ' - nobody about';
  }

  var ring = document.createElement('span');
  ring.className = 'map-pin-ring';
  pin.appendChild(ring);

  if (names.length > 0) {
    var who = document.createElement('span');
    who.className = 'map-pin-who';
    who.textContent = names.join(', ');
    pin.appendChild(who);
  }

  return pin;
}


// ----------------------------------------------------------------
//  Walking into a place
// ----------------------------------------------------------------
function enterLocation(locationId) {
  currentLocation = locationId;
  var people = charactersAt(locationId);

  if (people.length === 0) {
    showNobodyHere(locationId);
    return;
  }
  if (people.length === 1) {
    startConversation(people[0]);   // see conversation.js
    return;
  }
  showPeoplePicker(locationId, people);
}

// Two or more people in one place: let the player choose.
function showPeoplePicker(locationId, people) {
  els.peopleTitle.textContent = LOCATIONS[locationId].name;
  paintPlace(els.people, LOCATIONS[locationId]);

  emptyOut(els.peopleList);
  for (var i = 0; i < people.length; i++) {
    els.peopleList.appendChild(buildPersonButton(people[i]));
  }

  var back = document.createElement('button');
  back.className = 'plain-button';
  back.textContent = 'Back to the map';
  back.onclick = showMap;
  els.peopleList.appendChild(back);

  showScreen('people');
}

function buildPersonButton(characterId) {
  var character = CHARACTERS[characterId];

  var button = document.createElement('button');
  button.className = 'person-button';
  button.onclick = function () {
    startConversation(characterId);
  };

  var portrait = document.createElement('img');
  portrait.className = 'person-portrait';
  setSpriteSource(portrait, character);
  button.appendChild(portrait);

  var name = document.createElement('span');
  name.textContent = character.name;
  button.appendChild(name);

  return button;
}

// Nobody home. Say so plainly instead of doing nothing, which would
// look like a broken button.
function showNobodyHere(locationId) {
  els.peopleTitle.textContent = LOCATIONS[locationId].name;
  paintPlace(els.people, LOCATIONS[locationId]);

  emptyOut(els.peopleList);

  // Say WHY it is empty. "Nobody here" on its own reads like a bug;
  // naming the time of day tells the player what to do about it.
  var message = document.createElement('p');
  message.className = 'nobody-here';
  message.textContent = 'Nobody here in the ' +
    TIME_SLOTS[currentTimeIndex()].name.toLowerCase() + '.';
  els.peopleList.appendChild(message);

  // The way out of an empty map: let the hours pass.
  var nextSlot = (currentTimeIndex() + 1) % TIME_SLOTS.length;
  var wait = document.createElement('button');
  wait.className = 'plain-button';
  wait.textContent = 'Wait until ' + TIME_SLOTS[nextSlot].name;
  wait.onclick = waitForNextTime;
  els.peopleList.appendChild(wait);

  var back = document.createElement('button');
  back.className = 'plain-button';
  back.textContent = 'Back to the map';
  back.onclick = showMap;
  els.peopleList.appendChild(back);

  showScreen('people');
}


// ----------------------------------------------------------------
//  Character pictures
// ----------------------------------------------------------------

// Points a picture element at a character's sprite. If that file is
// missing, a plain stand-in is drawn instead, so a character with no
// artwork yet still shows up and can still be talked to.
//
// The character pictures are drawn on white, so on the way through we
// ask pictures.js to rub that white background out. If it cannot, the
// picture is shown as it is and the game carries on regardless.
function setSpriteSource(imageElement, character) {
  imageElement.alt = character.name;
  imageElement.onerror = function () {
    imageElement.onerror = null;   // only swap once, or a broken
                                   // stand-in would loop forever
    imageElement.src = placeholderSprite(character.name);
  };

  // No picture drawn for them yet: show the stand-in.
  if (!character.sprite) {
    imageElement.src = placeholderSprite(character.name);
    return;
  }

  // Cleaned this one up earlier: use the copy we kept.
  if (cleanedPictures[character.sprite]) {
    imageElement.src = cleanedPictures[character.sprite];
    return;
  }

  // Show it as it is right now, then clean it up and swap it in.
  imageElement.src = character.sprite;
  if (REMOVE_WHITE_BACKGROUNDS) {
    cleanPictureAndSwapIn(character.sprite, imageElement);
  }
}

// A stand-in picture, drawn as a shape rather than loaded from a file,
// so it works with nothing downloaded. It is just a dark silhouette
// with the character's initial on it.
function placeholderSprite(name) {
  var initial = String(name || '?').charAt(0).toUpperCase();
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="760" viewBox="0 0 420 760">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#5b6478"/>' +
        '<stop offset="1" stop-color="#262b38"/>' +
      '</linearGradient></defs>' +
      '<circle cx="210" cy="170" r="105" fill="url(#g)"/>' +
      '<path d="M40 760 C40 520 110 400 210 400 C310 400 380 520 380 760 Z" fill="url(#g)"/>' +
      '<text x="210" y="205" font-family="Arial, sans-serif" font-size="110" font-weight="bold"' +
      ' fill="#ffffff" fill-opacity="0.75" text-anchor="middle">' + initial + '</text>' +
    '</svg>';
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}


// ----------------------------------------------------------------
//  Problems panel
// ----------------------------------------------------------------
//  Lists anything the checker found wrong in the character files.
//  Hidden completely when there is nothing to report.

function showProblems(problems) {
  emptyOut(els.problems);
  if (problems.length === 0) {
    els.problems.hidden = true;
    return;
  }

  var heading = document.createElement('h2');
  heading.textContent = problems.length + ' problem' + (problems.length === 1 ? '' : 's') + ' in the character files';
  els.problems.appendChild(heading);

  var list = document.createElement('ul');
  for (var i = 0; i < problems.length; i++) {
    var item = document.createElement('li');
    item.textContent = problems[i];
    list.appendChild(item);
  }
  els.problems.appendChild(list);

  var hide = document.createElement('button');
  hide.className = 'plain-button';
  hide.textContent = 'Hide this';
  hide.onclick = function () {
    els.problems.hidden = true;
  };
  els.problems.appendChild(hide);

  els.problems.hidden = false;
}

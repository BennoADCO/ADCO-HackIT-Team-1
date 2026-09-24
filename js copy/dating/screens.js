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
  els.mapGrid = document.getElementById('map-grid');
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


// ----------------------------------------------------------------
//  The map
// ----------------------------------------------------------------
function showMap() {
  currentLocation = '';
  renderMap();
  showScreen('map');
}

function renderMap() {
  emptyOut(els.mapGrid);
  var ids = allLocationIds();

  for (var i = 0; i < ids.length; i++) {
    els.mapGrid.appendChild(buildLocationCard(ids[i]));
  }

  // A line at the bottom saying whether progress is being kept.
  if (saveWorks) {
    els.saveHint.textContent = 'Your progress saves automatically on this computer.';
  } else {
    els.saveHint.textContent = "This browser won't save: progress lasts until you close the tab.";
  }
}

function buildLocationCard(locationId) {
  var place = LOCATIONS[locationId];
  var people = charactersAt(locationId);

  var card = document.createElement('button');
  card.className = 'location-card';
  card.style.backgroundImage = 'url("' + place.background + '")';
  card.onclick = function () {
    enterLocation(locationId);
  };

  var shade = document.createElement('span');
  shade.className = 'location-shade';
  card.appendChild(shade);

  var name = document.createElement('span');
  name.className = 'location-name';
  name.textContent = place.name;
  card.appendChild(name);

  // Who is here, so the player has a reason to pick one place over another.
  var who = document.createElement('span');
  who.className = 'location-who';
  if (people.length === 0) {
    who.textContent = 'Nobody about';
    who.className = who.className + ' is-empty';
  } else {
    var names = [];
    for (var i = 0; i < people.length; i++) {
      names.push(CHARACTERS[people[i]].name);
    }
    who.textContent = names.join(', ');
  }
  card.appendChild(who);

  return card;
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
  els.people.style.backgroundImage = 'url("' + LOCATIONS[locationId].background + '")';

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
  els.people.style.backgroundImage = 'url("' + LOCATIONS[locationId].background + '")';

  emptyOut(els.peopleList);

  var message = document.createElement('p');
  message.className = 'nobody-here';
  message.textContent = 'There is nobody here right now.';
  els.peopleList.appendChild(message);

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
function setSpriteSource(imageElement, character) {
  imageElement.alt = character.name;
  imageElement.onerror = function () {
    imageElement.onerror = null;   // only swap once, or a broken
                                   // stand-in would loop forever
    imageElement.src = placeholderSprite(character.name);
  };
  if (character.sprite) {
    imageElement.src = character.sprite;
  } else {
    imageElement.src = placeholderSprite(character.name);
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

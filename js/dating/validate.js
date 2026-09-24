// ================================================================
//  THE CHECKER - finds mistakes in character files
// ================================================================
//  Dialogue files are written by hand, so they WILL have typos in
//  them: a reply pointing at a conversation node that does not exist,
//  a character standing in a location nobody ever made, that sort of
//  thing.
//
//  Without this, a typo just means a button that silently does
//  nothing - which is horrible to track down. Instead, the game reads
//  every character file when it starts and lists any problems in a
//  panel on screen, naming the file and the exact line that is wrong.
//
//  It never stops the game. You can play round a broken reply; you
//  just get told about it.
// ================================================================

// Checks everything and gives back a list of plain-English problems.
// An empty list means all is well.
function checkAllCharacters() {
  var problems = [];
  var ids = allCharacterIds();

  if (ids.length === 0) {
    problems.push('No characters loaded at all. Check the <script> lines in dating.html.');
  }
  if (allLocationIds().length === 0) {
    problems.push('No locations loaded at all. Check data/locations.js is listed in dating.html.');
  }

  for (var i = 0; i < ids.length; i++) {
    checkOneCharacter(ids[i], problems);
  }
  return problems;
}

function checkOneCharacter(id, problems) {
  var character = CHARACTERS[id];
  var who = 'characters/' + id + '/' + id + '.js';

  if (!character.name) {
    problems.push(who + ': no "name", so nobody knows what to call them.');
  }

  var nodes = character.nodes || {};

  // There are two sorts of character file, and they are checked
  // differently. A Shaun has "appearances"; Mia has "stages".
  if (isSceneCharacter(id)) {
    checkAppearances(who, character, nodes, problems);
  } else if (!character.stages || character.stages.length === 0) {
    problems.push(who + ': no "stages" and no "appearances", so they will never appear anywhere.');
    return;
  } else {
    checkStages(who, character, nodes, problems);
  }

  // Every conversation node must make sense.
  for (var nodeId in nodes) {
    checkOneNode(who, nodeId, nodes[nodeId], nodes, problems);
  }
}

// STORY characters: a list of chapters, one place each.
function checkStages(who, character, nodes, problems) {
  for (var s = 0; s < character.stages.length; s++) {
    var stage = character.stages[s];
    var label = who + ', stage ' + s;

    if (!stage.at) {
      problems.push(label + ': no "at", so they are nowhere.');
    } else if (!LOCATIONS[stage.at]) {
      problems.push(label + ': "at" is set to "' + stage.at + '", which is not a location in data/locations.js.');
    }

    if (!stage.start) {
      problems.push(label + ': no "start", so there is nothing for them to say.');
    } else if (!nodes[stage.start]) {
      problems.push(label + ': "start" points at "' + stage.start + '", which is not in their "nodes".');
    }
  }
}

// SCENE characters: a place and a time of day per scene.
function checkAppearances(who, character, nodes, problems) {
  var seen = {};

  for (var a = 0; a < character.appearances.length; a++) {
    var appearance = character.appearances[a];
    var label = who + ', appearance ' + a;

    if (!appearance.at) {
      problems.push(label + ': no "at", so they are nowhere.');
    } else if (!LOCATIONS[appearance.at]) {
      problems.push(label + ': "at" is set to "' + appearance.at + '", which is not a location in data/locations.js.');
    }

    if (!appearance.time) {
      problems.push(label + ': no "time", so they are never out.');
    } else if (timeName(appearance.time) === appearance.time) {
      // timeName gives the code straight back when it does not know it.
      problems.push(label + ': "time" is "' + appearance.time +
                    '", which is not one of M, D, A or N.');
    }

    if (!appearance.node) {
      problems.push(label + ': no "node", so there is nothing for them to say.');
    } else if (!nodes[appearance.node]) {
      problems.push(label + ': "node" points at "' + appearance.node + '", which is not in their "nodes".');
    }

    // Two scenes in the same place at the same hour means the second
    // one can never come up - the first always wins.
    var slot = appearance.at + ' in the ' + timeName(appearance.time);
    if (seen[slot]) {
      problems.push(label + ': they are already at ' + slot +
                    ' in an earlier appearance, so this one never comes up.');
    }
    seen[slot] = true;
  }
}

function checkOneNode(who, nodeId, node, nodes, problems) {
  var label = who + ', node "' + nodeId + '"';

  if (!node.says || node.says.length === 0) {
    problems.push(label + ': no "says", so it shows an empty dialogue box.');
  }

  var options = node.options || [];

  // A node has to go SOMEWHERE, or the conversation dead-ends with no
  // way out and the player is stuck staring at it.
  if (options.length === 0 && !node.end) {
    problems.push(label + ': no "options" and no "end: true", so the conversation gets stuck here.');
  }

  // The scene only has room for four replies.
  if (options.length > 4) {
    problems.push(label + ': has ' + options.length + ' replies. Four is the most that fits on screen.');
  }

  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    var optionLabel = label + ', reply ' + (i + 1);

    if (!option.text) {
      problems.push(optionLabel + ': no "text", so the button is blank.');
    }
    if (!option.goto && !option.end) {
      problems.push(optionLabel + ': no "goto" and no "end: true", so picking it does nothing.');
    }
    if (option.goto && !nodes[option.goto]) {
      problems.push(optionLabel + ': "goto" points at "' + option.goto + '", which is not in their "nodes".');
    }
  }
}


// ----------------------------------------------------------------
//  Nodes nothing can ever reach
// ----------------------------------------------------------------
//  Not an error - usually it means a reply was rewritten and left an
//  old branch behind - but worth knowing about, because a node you
//  cannot reach is dialogue nobody will ever read.

function findStrandedNodes(characterId) {
  var character = CHARACTERS[characterId];
  if (!character || !character.nodes) {
    return [];
  }

  // Start from every node the game can open on - a chapter's "start"
  // for a story character, or a scene for a Shaun - and follow every
  // reply out from there.
  var reached = {};
  var toVisit = [];

  var stages = character.stages || [];
  for (var s = 0; s < stages.length; s++) {
    if (stages[s].start) {
      toVisit.push(stages[s].start);
    }
  }

  var appearances = character.appearances || [];
  for (var a = 0; a < appearances.length; a++) {
    if (appearances[a].node) {
      toVisit.push(appearances[a].node);
    }
  }

  while (toVisit.length > 0) {
    var nodeId = toVisit.pop();
    if (reached[nodeId]) {
      continue;      // been here already
    }
    reached[nodeId] = true;

    var node = character.nodes[nodeId];
    if (!node || !node.options) {
      continue;
    }
    for (var i = 0; i < node.options.length; i++) {
      var next = node.options[i].goto;
      if (next && !reached[next]) {
        toVisit.push(next);
      }
    }
  }

  // Anything we never arrived at is stranded.
  var stranded = [];
  for (var id in character.nodes) {
    if (!reached[id]) {
      stranded.push(id);
    }
  }
  return stranded;
}

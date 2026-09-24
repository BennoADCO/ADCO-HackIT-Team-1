// ================================================================
//  CONVERSATION - running one chat with one person
// ================================================================
//  A character's file holds a set of conversation "nodes". Each node
//  is one thing they say, plus the ways you can reply:
//
//    mia_first_meeting: {
//      says: ["Oh - you're new.", "You're the crane one."],
//      options: [
//        { text: "That's me.",  goto: 'mia_proud', like: 2 },
//        { text: 'Rather not.', goto: 'mia_shy',   like: -1 }
//      ]
//    }
//
//  How it runs:
//    1. Show the first line of "says".
//    2. Click, or press Space, to step through the rest.
//    3. On the last line, the replies appear as buttons.
//    4. Picking one carries out its effects, then jumps to its "goto".
//    5. A node or reply with  end: true  closes the conversation.
//
//  Everything except "says" is optional. The smallest reply that works
//  is  { text: 'Hello', goto: 'some_node' }.
//
//  What a node or a reply may also carry:
//    like: 2            - warms them up by 2 (a minus number cools them)
//    set: { x: true }   - writes a note into their memory
//    needs: { x: true } - (replies only) hide this reply unless their
//                         memory matches
//    reply: 'Ha. Good.' - (replies only) what they say BACK to that
//                         answer, before the conversation closes. May
//                         be one line or a list of them. See ANSWERING
//                         BACK further down this file.
//    end: true          - the conversation finishes here
//    advance: true      - move them on to their next chapter, which is
//                         what makes them turn up somewhere new
// ================================================================

var chat = {
  characterId: '',   // who we are talking to
  nodeId: '',        // which node we are on
  sceneNode: '',     // the scene we opened on, so it can be ticked off
  lineIndex: 0,      // which line of that node is on screen
  finished: false,   // true once the conversation has closed
  reaction: null     // what they said back to your answer (see ANSWERING BACK)
};

// What is on screen right now. Usually a node out of the character's
// file, but while they are reacting to something you said it is the
// little one-off node built in answeredWith() below.
function currentNode() {
  if (chat.reaction) {
    return chat.reaction;
  }
  return CHARACTERS[chat.characterId].nodes[chat.nodeId];
}


function startConversation(characterId) {
  var character = CHARACTERS[characterId];
  var startNode = openingNodeFor(characterId, currentLocation);

  // Their story has run out, or their file is broken. Say something
  // rather than opening an empty box.
  if (startNode === null || !character.nodes || !character.nodes[startNode]) {
    showNobodyHere(currentLocation);
    return;
  }

  chat.characterId = characterId;
  chat.sceneNode = startNode;
  chat.finished = false;
  chat.reaction = null;

  getCharacterState(characterId).met = true;

  // Dress the set: the background of wherever we are, and the person.
  paintPlace(els.sceneBg, LOCATIONS[currentLocation]);
  setSpriteSource(els.sprite, character);
  els.sprite.className = 'sprite anchor-' + (character.anchor || 'right');
  els.speaker.textContent = character.name;

  showScreen('scene');
  goToNode(startNode);
}


// ----------------------------------------------------------------
//  Moving through a node
// ----------------------------------------------------------------

function goToNode(nodeId) {
  var node = CHARACTERS[chat.characterId].nodes[nodeId];
  if (!node) {
    // A reply pointed somewhere that does not exist. The checker will
    // already have said so on the map screen; bail out gracefully
    // rather than freezing on a dead button.
    endConversation(false);
    return;
  }

  chat.nodeId = nodeId;
  chat.lineIndex = 0;
  chat.reaction = null;   // back to their own words

  // A node can warm someone up or leave a note just by being reached.
  changeLike(chat.characterId, node.like);
  setFlags(chat.characterId, node.set);

  showCurrentLine();
}

function showCurrentLine() {
  var node = currentNode();
  var lines = node.says || [''];

  els.line.textContent = lines[chat.lineIndex];

  // Replies only appear once they have finished talking.
  var onLastLine = (chat.lineIndex >= lines.length - 1);
  if (onLastLine) {
    showReplies(node);
  } else {
    emptyOut(els.replies);
    els.prompt.hidden = false;
  }
}

// Click, or Space: step to the next line. Does nothing once the
// replies are up - at that point the player has to choose.
function nextLine() {
  if (chat.finished) {
    return;
  }
  var node = currentNode();
  var lines = node.says || [''];
  if (chat.lineIndex >= lines.length - 1) {
    return;
  }
  chat.lineIndex = chat.lineIndex + 1;
  showCurrentLine();
}


// ----------------------------------------------------------------
//  The replies
// ----------------------------------------------------------------

function showReplies(node) {
  els.prompt.hidden = true;
  emptyOut(els.replies);

  var options = node.options || [];
  var shown = 0;

  for (var i = 0; i < options.length; i++) {
    var option = options[i];

    // A reply with "needs" only shows if their memory matches.
    if (!flagsMatch(chat.characterId, option.needs)) {
      continue;
    }
    if (shown >= 4) {
      break;   // four is all that fits on screen
    }
    els.replies.appendChild(buildReplyButton(option));
    shown = shown + 1;
  }

  // Nothing to choose from: this is the end of the road. That is
  // normal for a node marked  end: true,  and it is also the safety
  // net if every reply was hidden by its "needs".
  if (shown === 0) {
    els.replies.appendChild(buildLeaveButton(node));
  }
}

function buildReplyButton(option) {
  var button = document.createElement('button');
  button.className = 'reply';
  button.textContent = option.text || '...';
  button.onclick = function () {
    chooseOption(option);
  };
  return button;
}

function buildLeaveButton(node) {
  var button = document.createElement('button');
  button.className = 'reply reply-leave';
  button.textContent = node.leaveText || 'Leave';
  button.onclick = function () {
    endConversation(node.advance === true);
  };
  return button;
}

// The player picked a reply. Carry out whatever it does, then move on.
function chooseOption(option) {
  changeLike(chat.characterId, option.like);
  setFlags(chat.characterId, option.set);

  // If this reply goes on to another node, go there - that node IS the
  // answer back, so there is nothing to add.
  if (option.goto) {
    goToNode(option.goto);
    return;
  }

  // Otherwise the chat is about to finish. Let them say something back
  // first, so it does not slam shut the moment you answer.
  var answer = reactionTo(option);
  if (answer) {
    answeredWith(answer, option);
    return;
  }

  if (option.end === true) {
    endConversation(option.advance === true);
    return;
  }
  // Neither "goto" nor "end": the checker warns about this, but if it
  // slips through, close the chat rather than leaving a dead button.
  endConversation(false);
}


// ----------------------------------------------------------------
//  ANSWERING BACK
// ----------------------------------------------------------------
//  Picking a reply used to end the conversation on the spot, which
//  made every scene stop dead. Now they say something back first.
//
//  There are two ways they can do that, and the first one wins:
//
//  1. A "reply" written on that exact answer, in the character's file:
//
//       { "text": "Yes, very.", "like": 2,
//         "reply": ["Good. Most people fill it with noise."],
//         "end": true }
//
//     This is the good stuff - written for that one answer. Add them
//     to the answers you care about most.
//
//  2. If there is no "reply", one of the character's general
//     reactions is used instead, picked on whether your answer
//     pleased them, left them cold, or missed them completely. That
//     is the "reactions" block near the top of their file.
//
//  The general one is chosen by the name of the scene rather than at
//  random, so the same scene always gets the same reaction. It stays
//  put instead of changing every time you replay it.

// Which of the three sorts of reaction an answer earns. It goes off
// "like": above zero pleased them, zero was a shrug, below zero missed.
function reactionBand(option) {
  var like = option.like;
  if (typeof like !== 'number' || like === 0) {
    return 'ok';
  }
  if (like > 0) {
    return 'good';
  }
  return 'bad';
}

// The lines they say back, or null if there are none to say.
function reactionTo(option) {
  // 1. Written for this exact answer.
  if (option.reply) {
    return linesOf(option.reply);
  }

  // 2. One of their general ones.
  var character = CHARACTERS[chat.characterId];
  if (!character.reactions) {
    return null;
  }
  var pool = character.reactions[reactionBand(option)];
  if (!pool || pool.length === 0) {
    return null;
  }
  return linesOf(pool[steadyPick(chat.nodeId, pool.length)]);
}

// Lets a reply be written as one line or as a list of them, so nobody
// has to remember which. Always gives back a list.
function linesOf(reply) {
  if (typeof reply === 'string') {
    return [reply];
  }
  return reply;
}

// Turns a name into a number between 0 and howMany-1, the same way
// every time. Used so a scene always gets the same general reaction
// rather than a different one on every replay.
function steadyPick(name, howMany) {
  var total = 0;
  var text = String(name || '');
  for (var i = 0; i < text.length; i++) {
    total = total + text.charCodeAt(i);
  }
  return total % howMany;
}

// Put their answer on screen. It is built as a one-off node with no
// replies of its own, so the usual "Leave" button turns up underneath
// it and the conversation closes when the player is ready - not the
// instant they clicked.
function answeredWith(lines, option) {
  var character = CHARACTERS[chat.characterId];

  chat.reaction = {
    says: lines,
    end: true,
    advance: option.advance === true,
    leaveText: option.leaveText || character.leaveText || 'Leave'
  };
  chat.lineIndex = 0;

  showCurrentLine();
}


// ----------------------------------------------------------------
//  Finishing up
// ----------------------------------------------------------------

// "moveOn" true means this character's story steps forward, which is
// usually what sends them somewhere new next time you look.
//
// Whatever else happens, this always finishes by putting the player
// back on the map. There is no other way out of a scene, so nobody can
// end up stuck in one.
function endConversation(moveOn) {
  chat.finished = true;

  // Tick this scene off, so a Shaun has something new to say next time
  // you find them here rather than repeating themselves.
  if (isSceneCharacter(chat.characterId) && chat.sceneNode) {
    markSceneDone(chat.characterId, chat.sceneNode);
  }

  if (moveOn) {
    advanceStage(chat.characterId);   // this saves as well
  }

  // Talking to someone takes a while. The clock moves on, which is
  // what changes who is out and about next time you look at the map.
  advanceTime();                      // this saves as well

  showMap();
}

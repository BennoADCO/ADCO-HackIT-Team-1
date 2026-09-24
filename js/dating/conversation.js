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
//    end: true          - the conversation finishes here
//    advance: true      - move them on to their next chapter, which is
//                         what makes them turn up somewhere new
// ================================================================

var chat = {
  characterId: '',   // who we are talking to
  nodeId: '',        // which node we are on
  sceneNode: '',     // the scene we opened on, so it can be ticked off
  lineIndex: 0,      // which line of that node is on screen
  finished: false    // true once the conversation has closed
};


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

  // A node can warm someone up or leave a note just by being reached.
  changeLike(chat.characterId, node.like);
  setFlags(chat.characterId, node.set);

  showCurrentLine();
}

function showCurrentLine() {
  var node = CHARACTERS[chat.characterId].nodes[chat.nodeId];
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
  var node = CHARACTERS[chat.characterId].nodes[chat.nodeId];
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

  if (option.end === true) {
    endConversation(option.advance === true);
    return;
  }
  if (option.goto) {
    goToNode(option.goto);
    return;
  }
  // Neither "goto" nor "end": the checker warns about this, but if it
  // slips through, close the chat rather than leaving a dead button.
  endConversation(false);
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

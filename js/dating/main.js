// ================================================================
//  START UP - runs once, when the page opens
// ================================================================
//  This file is loaded LAST, after every location and character file,
//  so by the time it runs everything is already on the shelves in
//  registry.js.
//
//  What it does, in order:
//    1. Find the parts of the page we will be using.
//    2. Bring back any saved progress.
//    3. Check every character file and list anything wrong on screen.
//    4. Set up the mouse and keyboard.
//    5. Show the map.
// ================================================================

function startDatingGame() {
  grabElements();
  loadProgress();
  reportAnyProblems();
  setUpControls();
  showMap();
}


// Runs the checker and puts anything it found on screen, so a typo in
// a character file is visible instead of silently doing nothing.
function reportAnyProblems() {
  var problems = checkAllCharacters();

  // Dialogue nothing can reach is not an error, but it does mean
  // words nobody will ever read, so it is worth mentioning.
  var ids = allCharacterIds();
  for (var i = 0; i < ids.length; i++) {
    var stranded = findStrandedNodes(ids[i]);
    for (var j = 0; j < stranded.length; j++) {
      problems.push('characters/' + ids[i] + '/' + ids[i] + '.js: node "' + stranded[j] +
                    '" cannot be reached from any reply, so nobody will ever see it.');
    }
  }

  showProblems(problems);
}


function setUpControls() {
  // Clicking the dialogue box steps to the next line.
  var box = document.getElementById('dialogue');
  box.addEventListener('click', function (event) {
    // Not when they clicked an actual reply button - that has its own job.
    if (event.target.closest && event.target.closest('button')) {
      return;
    }
    nextLine();
  });

  // Space or Enter does the same, but only while a scene is on screen.
  document.addEventListener('keydown', function (event) {
    if (els.scene.hidden) {
      return;
    }
    if (event.key === ' ' || event.key === 'Enter') {
      // Let the keyboard work normally if a reply button is focused,
      // otherwise Space would both pick the reply and skip a line.
      if (document.activeElement && document.activeElement.className.indexOf('reply') !== -1) {
        return;
      }
      event.preventDefault();
      nextLine();
    }
  });

  // "Start again" on the map.
  document.getElementById('wipe-button').onclick = function () {
    if (window.confirm('Forget everyone and start again?')) {
      wipeProgress();
      showMap();
    }
  };
}


// The page runs the scripts in order, so by this point every
// character file has put itself on the shelf. Off we go.
startDatingGame();

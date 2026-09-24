// ================================================================
//  PICTURES - taking the white background off a character
// ================================================================
//  The character pictures in assets/people are drawn on a plain white
//  background. Dropped straight onto a scene that leaves them sitting
//  in an obvious white box.
//
//  This file rubs that white out when the picture loads, so they stand
//  in the scene properly, with no need to re-draw or re-save anything.
//
//  HOW IT DECIDES WHAT IS BACKGROUND
//  It does NOT simply delete every white pixel - that would punch holes
//  in a white shirt, white teeth or the whites of someone's eyes. It
//  starts from the outside edges of the picture and works inwards,
//  rubbing out white until it meets the character. Anything white that
//  is walled in by the character is left alone.
//
//  IF IT DOES NOT WORK
//  Some browsers refuse to let a page look at the dots of a picture
//  that was opened straight off the disk rather than off the internet.
//  There is nothing we can do about that from here, so if it happens
//  the picture is simply left as it was - white box and all. The game
//  carries on either way. See the note in HOW-TO-ADD-A-CHARACTER.md
//  for the permanent fix.
// ================================================================


// ----------------------------------------------------------------
//  SETTINGS - the two numbers worth changing
// ----------------------------------------------------------------

// How light a dot has to be before it counts as background. 255 is pure
// white. Lower this if a grubby off-white edge is being left behind;
// raise it if parts of the character are disappearing.
var WHITE_CUTOFF = 232;

// Set to false to turn this whole thing off and show the pictures
// exactly as they are on disk.
var REMOVE_WHITE_BACKGROUNDS = true;


// Pictures we have already cleaned up, kept so the work is only ever
// done once per character no matter how often they turn up.
var cleanedPictures = {};


// ----------------------------------------------------------------
//  Is this dot part of the background?
// ----------------------------------------------------------------
//  "data" is one long list of numbers, four per dot: how much red,
//  green and blue it has, then how see-through it is. "at" is where
//  this dot's four numbers start.

function isBackgroundDot(data, at) {
  // Already see-through: treat it as background, so the rubbing-out
  // can carry on through it.
  if (data[at + 3] === 0) {
    return true;
  }
  return data[at] >= WHITE_CUTOFF &&
         data[at + 1] >= WHITE_CUTOFF &&
         data[at + 2] >= WHITE_CUTOFF;
}


// ----------------------------------------------------------------
//  Rubbing out from the edges inwards
// ----------------------------------------------------------------
//  Start at every dot around the outside of the picture. Any that is
//  white becomes see-through, and then we look at its four neighbours
//  and do the same to them. It spreads until it runs into the
//  character, and stops there.

function clearWhiteFromEdges(data, width, height) {
  var seen = new Uint8Array(width * height);   // dots we have looked at
  var toCheck = [];

  // The top and bottom rows.
  for (var x = 0; x < width; x++) {
    toCheck.push(x);
    toCheck.push((height - 1) * width + x);
  }
  // The left and right edges.
  for (var y = 0; y < height; y++) {
    toCheck.push(y * width);
    toCheck.push(y * width + width - 1);
  }

  while (toCheck.length > 0) {
    var dot = toCheck.pop();

    if (seen[dot]) {
      continue;            // been here already
    }
    seen[dot] = 1;

    var at = dot * 4;
    if (!isBackgroundDot(data, at)) {
      continue;            // hit the character: stop spreading this way
    }

    data[at + 3] = 0;      // make it see-through

    // Now look at the four dots around it.
    var acrossBy = dot % width;
    var downBy = (dot - acrossBy) / width;

    if (acrossBy > 0) {
      toCheck.push(dot - 1);
    }
    if (acrossBy < width - 1) {
      toCheck.push(dot + 1);
    }
    if (downBy > 0) {
      toCheck.push(dot - width);
    }
    if (downBy < height - 1) {
      toCheck.push(dot + width);
    }
  }
}


// ----------------------------------------------------------------
//  Cleaning up one picture
// ----------------------------------------------------------------
//  Gives back the cleaned-up picture, or null if the browser would not
//  let us do it. Null means "leave the original alone".

function whiteBackgroundRemoved(picture) {
  var width = picture.naturalWidth;
  var height = picture.naturalHeight;

  if (!width || !height) {
    return null;
  }

  // Copy the picture onto a scratch pad we are allowed to draw on.
  var scratch = document.createElement('canvas');
  scratch.width = width;
  scratch.height = height;
  var pen = scratch.getContext('2d');
  pen.drawImage(picture, 0, 0);

  var dots;
  try {
    dots = pen.getImageData(0, 0, width, height);
  } catch (e) {
    // This is the browser refusing to let us look at the dots. It is
    // the expected failure, not a bug - see the note at the top.
    return null;
  }

  clearWhiteFromEdges(dots.data, width, height);
  pen.putImageData(dots, 0, 0);

  try {
    return scratch.toDataURL('image/png');
  } catch (e) {
    return null;
  }
}


// ----------------------------------------------------------------
//  Doing it in the background, once the picture has loaded
// ----------------------------------------------------------------
//  The picture on screen is shown straight away, as it is. This loads a
//  second, hidden copy, cleans that up, and swaps it in when it is
//  ready. In practice that happens too fast to notice, and if it never
//  finishes, nothing is lost.

function cleanPictureAndSwapIn(fileName, imageElement) {
  var loader = new Image();

  loader.onload = function () {
    var cleaned = whiteBackgroundRemoved(loader);
    if (!cleaned) {
      return;   // not allowed, or an empty picture: leave it as it was
    }

    cleanedPictures[fileName] = cleaned;

    // Only swap it in if this element is still showing this character.
    // The player may have walked off and be looking at someone else by
    // now, and we must not paste the wrong face over them.
    if (imageElement.getAttribute('src') === fileName) {
      imageElement.src = cleaned;
    }
  };

  // If it will not load at all, do nothing. The element doing the
  // showing has its own stand-in picture for that (see screens.js).
  loader.onerror = function () {
    loader.onerror = null;
  };

  loader.src = fileName;
}

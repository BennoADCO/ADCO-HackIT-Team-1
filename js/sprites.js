// ================================================================
//  WIPE OUT - PIXEL-ART PICTURES
// ================================================================
//  The worker, the aliens, the toilet paper and the rest of the site
//  are little pixel-art pictures, and they are all typed out in this
//  file as letters. There are no picture files: every picture lives
//  right here, so the game still works offline on any laptop.
//
//  HOW A PICTURE WORKS
//   Each picture has two parts:
//     palette - the paint box. Each letter stands for one colour.
//     rows    - the picture itself: one line of letters for each row
//               of pixels, from the top down. Each letter paints one
//               square pixel in that letter's colour.
//               A dot  .  is see-through (nothing is painted there).
//
//   A tiny example: a 4 x 4 red square with a see-through middle.
//     SPRITES['🟥'] = {
//       palette: { r: '#ff0000' },
//       rows: [
//         'rrrr',
//         'r..r',
//         'r..r',
//         'rrrr'
//       ]
//     };
//
//  HOW TO EDIT A PICTURE
//   - Change one pixel: find its row and change the letter. Swap an
//     'o' for a 'k' and that pixel goes from orange to black.
//   - Change a colour everywhere: change the colour code next to its
//     letter in the palette. Change  o: '#ff7a1a'  to  o: '#2f7fd1'
//     and every 'o' pixel turns blue at once.
//   - Add a new colour: add a new letter and colour code to the
//     palette, with a comma between each one:
//        palette: { k: '#1b1b1b', o: '#ff7a1a', g: '#3ad13a' },
//     then use the new letter in the rows. Capital letters count as
//     different letters, so 'g' and 'G' can be two different colours.
//   - Rub out a pixel: change its letter to a dot.
//   Colour codes are written #rrggbb, the same as in config.js.
//
//  KEEP IT TIDY
//   - Keep every row the same length (the same number of letters).
//     Most pictures are 16 letters across and 16 rows down. The alien
//     Chonker 🐙 is 24 x 24, the portaloo 🚽 is 16 across and 24 down,
//     and the crane 🏗️ is 32 x 32.
//   - Every row goes inside 'quote marks', with a comma after it.
//     The last row in a picture doesn't need the comma.
//   - A letter that isn't in the palette just shows as see-through,
//     so a typo in a row won't crash the game. If a pixel goes missing,
//     check its letter is in the palette.
//   - After a change: save this file, then press F5 in the browser.
//
//  HOW BIG PICTURES ARE DRAWN
//   The sizes are in config.js (e.g. the worker's size: 44). A picture
//   is stretched so it's that many pixels across. A square picture
//   fills the same space the emoji did. A tall one (the portaloo) is
//   the same width and stands on the same ground line, so it's taller.
//
//  IF EVERY PICTURE SUDDENLY TURNS BACK INTO AN EMOJI
//   This file has a typo in it (usually a missing quote mark or comma),
//   so the browser skipped the whole file. The game still plays, with
//   the plain emoji. To find the typo: press F12, click Console, copy
//   the red line and paste it to Claude.
//
//  WANT THE PLAIN EMOJI BACK?
//   - All of them: open js/config.js, find PIXEL-ART PICTURES and change
//        useSprites: true    to    useSprites: false
//   - Just one: put  /*  on the line above its block below, and  */  on
//     the line below it. That switches the block off, and that thing
//     goes back to its emoji. Take the two marks away to switch it on.
// ================================================================


// Every picture, looked up by its emoji. The pictures themselves are
// at the very bottom of this file, under THE PICTURES.
var SPRITES = {};


// ================================================================
//  THE MACHINERY - turns the letters into pictures
// ================================================================
//  You shouldn't need to change anything from here down to
//  THE PICTURES. drawEmoji() in engine.js uses these to draw a
//  picture in place of an emoji.

// Some emoji have an invisible extra character on the end (called a
// "variation selector") that tells the computer to draw them in colour.
// So '🏗️' and '🏗' look the same but aren't the same to the computer.
// This takes that extra character off, so both find the same picture.
function spriteName(emoji) {
  return String(emoji).replace(/️/g, '');
}

// Finds the picture for an emoji. Gives null ("nothing") if there's
// no picture for it, or the picture is missing its palette or rows.
// The answer is remembered, so the search only happens once per emoji.
var spriteSearches = {};

function findSprite(emoji) {
  if (spriteSearches[emoji] !== undefined) {
    return spriteSearches[emoji];
  }
  var found = null;
  var wanted = spriteName(emoji);
  // "for (var key in SPRITES)" means: do this once for each picture's emoji.
  for (var key in SPRITES) {
    var sprite = SPRITES[key];
    if (found === null && spriteName(key) === wanted && isUsableSprite(sprite)) {
      found = sprite;
    }
  }
  spriteSearches[emoji] = found;
  return found;
}

// Does this picture have what it needs to be drawn?
function isUsableSprite(sprite) {
  if (!sprite || !sprite.palette || !Array.isArray(sprite.rows)) {
    return false;
  }
  return sprite.rows.length > 0 && spriteWidth(sprite) > 0;
}

// How many pixels across a picture is. Every row should be the same
// length; if one isn't (a typo), go with the length most rows have.
// Longer rows get their extra letters ignored; shorter rows are
// see-through at the end.
function spriteWidth(sprite) {
  var howMany = {};    // how many rows have each length
  var best = 0;
  var bestCount = 0;
  for (var r = 0; r < sprite.rows.length; r++) {
    var length = String(sprite.rows[r]).length;
    howMany[length] = (howMany[length] || 0) + 1;
    if (howMany[length] > bestCount) {
      best = length;
      bestCount = howMany[length];
    }
  }
  return best;
}

// Like the emoji stickers in engine.js: each picture is painted once
// per size onto a hidden "sticker", then copied every frame after.
var spriteStickers = {};

// The sticker for an emoji's picture at a size, or null if it has none.
function getSpriteSticker(emoji, size) {
  var label = emoji + '@' + size;
  if (spriteStickers[label] !== undefined) {
    return spriteStickers[label];
  }
  var sticker = null;
  var sprite = findSprite(emoji);
  if (sprite) {
    sticker = makeSpriteSticker(sprite, size);
  }
  spriteStickers[label] = sticker;
  return sticker;
}

// Paints a picture onto a new sticker, "size" pixels across.
// The sticker is drawn centred on the spot the emoji would have been,
// so it's made tall enough that the picture's bottom edge lands where
// the bottom of a square emoji would be.
function makeSpriteSticker(sprite, size) {
  var across = spriteWidth(sprite);
  var down = sprite.rows.length;

  // 1. Paint the picture at its real size: one dot per letter.
  var small = document.createElement('canvas');
  small.width = across;
  small.height = down;
  var smallCtx = small.getContext('2d');
  for (var r = 0; r < down; r++) {
    var row = String(sprite.rows[r]);
    for (var c = 0; c < across && c < row.length; c++) {
      var letter = row.charAt(c);
      var colour = sprite.palette[letter];
      if (letter !== '.' && typeof colour === 'string') {
        // Start see-through, so a colour code with a typo in it paints
        // nothing, instead of reusing the last good colour.
        smallCtx.fillStyle = 'rgba(0, 0, 0, 0)';
        smallCtx.fillStyle = colour;
        smallCtx.fillRect(c, r, 1, 1);
      }
    }
  }

  // 2. Stretch it up to size. Smoothing off keeps the pixels as crisp
  //    squares instead of a blur.
  var width = size;
  var height = Math.max(1, Math.round(size * down / across));
  var stickerHeight = Math.max(size, height * 2 - size);
  var sticker = document.createElement('canvas');
  sticker.width = width;
  sticker.height = stickerHeight;
  var stickerCtx = sticker.getContext('2d');
  stickerCtx.imageSmoothingEnabled = false;
  stickerCtx.drawImage(small, 0, stickerHeight / 2 + size / 2 - height, width, height);
  return sticker;
}


// ================================================================
//  THE PICTURES (one block per sprite)
// ================================================================

// 👷 A cheerful site worker in a yellow hard hat, orange hi-vis shirt with silver reflective tape, blue work pants and dark steel-cap boots.
SPRITES['👷'] = {
  palette: { k: '#1b1b1b', y: '#ffd23f', h: '#fff4a3', Y: '#d99a00', s: '#f6c59e', S: '#d9956a', r: '#ef8a7a', o: '#ff7a1a', O: '#c4500a', w: '#e8eef2', b: '#2f6fd6', B: '#1f4a99', d: '#5b3a24', D: '#9a6a3f' },
  rows: [
    '.....kkkkkk.....',
    '....kyyhhyYk....',
    '...khyyhhyyYk...',
    '..kYYYYYYYYYYk..',
    '...kssksskssk...',
    '...krssssssrk...',
    '...ksskssksSk...',
    '....ksskksSk....',
    '..kooOSSSSOook..',
    '.koOowoooowoOok.',
    '.kwOwwwwwwwwOwk.',
    '.ksOooooooooOsk.',
    '..kkbbbbbbbBkk..',
    '...kbbBkkbbBk...',
    '..kDdddkkdddDk..',
    '..kkkkk..kkkkk..'
  ]
};

// 👽 The Grunt: a goofy green alien with a pink-tipped antenna, huge shiny black eyes, a little smile and a purple jumpsuit.
SPRITES['👽'] = {
  palette: { k: '#1b1b1b', g: '#6fd34a', l: '#b6f28a', d: '#3f9a2e', e: '#0b0f1e', b: '#4a6fb0', w: '#ffffff', p: '#ff6fae', s: '#9b6ee0', S: '#6a45b0' },
  rows: [
    '......kkkk......',
    '......kppk......',
    '.......kk.......',
    '....kkkkkkkk....',
    '..kkgllgggggkk..',
    '.kgllggggggggdk.',
    'kggeeeggggeeegdk',
    'kgeweeeggeweeedk',
    'kgeeebeggeeebedk',
    'kggeeeggggeeegdk',
    '.kgpgkggggkgpdk.',
    '..kgggkkkkggdk..',
    '...kkgggggdkk...',
    '..kgksssssSkgk..',
    '..kdksssssSkdk..',
    '...kkkk..kkkk...'
  ]
};

// 👾 The Zoomer: a cheeky winking magenta invader with its tongue out, jet flame blasting from its bum and speed streaks behind it
SPRITES['👾'] = {
  palette: { k: '#1b1b1b', m: '#d63ad6', h: '#ff8cf0', p: '#8a2a9e', w: '#f4f4f4', r: '#ff4d6d', y: '#ffe14d', o: '#ff7a1a', c: '#8ff0ff' },
  rows: [
    '......kk....kk..',
    '.....kyyk..kyyk.',
    '.......kk..kk...',
    '......kkkkkkkk..',
    'ccc..khhmmmmmmk.',
    '....khmmmmmmmmmk',
    '..ookmwwwmmmkmmk',
    '.oyykmwkkmmkmkmk',
    'oyyykmmkmmmmmkmk',
    '.oyykmmmkwkkkmpk',
    '..ookmmmmkrrkppk',
    'ccc.kppppkrrkppk',
    '.....kkkkkkkkkk.',
    '.....kpk...kpk..',
    '.cc.kpk.....kpk.',
    '...kkk.......kkk'
  ]
};

// 🐙 The Chonker: a big beefy raspberry-purple blob with an angry heavy brow, small glowing yellow eyes, gritted teeth and five thick stubby tentacles
SPRITES['🐙'] = {
  palette: { k: '#1b1b1b', p: '#ad3780', l: '#dc6aa8', h: '#f7bde0', d: '#72205c', b: '#3f0d2c', y: '#ffe23d', w: '#f3e7c8', s: '#f5a3c7' },
  rows: [
    '.......kkkkkkkkkk.......',
    '.....kkphllppppppkk.....',
    '...kkplhllllpppppppkk...',
    '..kpplllllppppddppppdk..',
    '.kpllllppppppppdddpppdk.',
    'kppbbbbbppppppppbbbbbpdk',
    'kpppbbbbbbbppbbbbbbbppdk',
    'kppkyyybbbbbbbbbbyyykpdk',
    'kppkykkppppppppppkkykpdk',
    'kpppkkkppppppppppkkkppdk',
    'kppppppppppppppppppppddk',
    'kpppppppkkkkkkkkpppppddk',
    'kppppppkwwkwwkwwkppppddk',
    'kpppppkpkkkkkkkkpkpppddk',
    'kpppppppppppppppppppdddk',
    'kdpppppppppppppppppddddk',
    'kppdkpppdkpppdkpppdkpddk',
    'kppdkpppdkpppdkpppdkpddk',
    'kpsdkpspdkpssdkppsdkpsdk',
    'kppdkpppdkpppdkpppdkpddk',
    'kppdkpppdkpppdkpppdkpddk',
    '.kkkkpspdkpdddkppsdkkkk.',
    '....kpppdkkkkkkpppdk....',
    '.....kkkk......kkkk.....'
  ]
};

// 🦑 The TP Thief: a teal squid alien in a black bandit mask with shifty eyes, a sneaky toothy grin and four wiggly tentacles.
SPRITES['🦑'] = {
  palette: { k: '#1b1b1b', t: '#2ec4b6', d: '#1a8a80', l: '#8ff0e4', m: '#2e2b40', w: '#f5f1dc' },
  rows: [
    '....kkkkkkkk....',
    '..kklltttttdkk..',
    '.klltttttttttdk.',
    '.kltttttttttddk.',
    'kmmmmmmmmmmmmmmk',
    'kmmmwkmmmmmwkmmk',
    'kmmwwkmmmmwwkmmk',
    '.kmmmmmmmmmmmmk.',
    '.kttttttttttkdk.',
    '.ktkwwwwwwwkddk.',
    '.kttkkkkkkkdddk.',
    '.kttttttttttddk.',
    '.ktdktdkktdktdk.',
    'ktdktdk..ktdktdk',
    'ktk.kktkktkk.ktk',
    '.k....k..k....k.'
  ]
};

// 🧻 A plump white toilet roll seen from above at an angle: cardboard tube hole on top, a loose sheet peeling off the front.
SPRITES['🧻'] = {
  palette: { k: '#1b1b1b', w: '#ffffff', e: '#e4e8ef', g: '#b9c0cc', d: '#8a92a2', t: '#d39a55', o: '#9c6a34', b: '#4a2e17' },
  rows: [
    '....kkkkkk......',
    '..kkwwwwwwkk....',
    '.kwwwttttwwek...',
    'kwwwtooootweek..',
    'kwwwtbbbbtweek..',
    'kgwwwttttwwegk..',
    'keggwwwwwwggdk..',
    'kewwggggggggdk..',
    'kewweedwwweddk..',
    'kewweekwwwekdk..',
    'kewweegkwwwekk..',
    'kewweeekwwwegk..',
    '.kweeeegkgwgekk.',
    '..kkeeegkwwwwegk',
    '....kkkkkwwwwegk',
    '.........kkkkkk.'
  ]
};

// 📦 A chunky orange wooden supply crate with steel corner brackets and a white toilet-roll stencil on the front.
SPRITES['📦'] = {
  palette: { k: '#1b1b1b', t: '#ffe3a3', w: '#f6b04e', o: '#d9822b', x: '#a4521a', d: '#a9561c', e: '#7a3a10', m: '#e6edf3', s: '#8a97a4', p: '#ffffff', q: '#b9c6d3', y: '#ffe14d' },
  rows: [
    '.y..kkkkkkkkkkkk',
    'ypykttttttttttkk',
    '.ykttttttttttkdk',
    '.kmttttttttmkddk',
    'kkkkkkkkkkkksddk',
    'kmmwwwwwwmmksddk',
    'kmoooooooomkdddk',
    'kwooppppoowkddek',
    'kwopqkkqpowkdedk',
    'kwxppqqppxwkeddk',
    'kwoppppppowkdddk',
    'kwoppqpppowkdddk',
    'kwxooqppoxwkddk.',
    'kmoooqpqoomksky.',
    'kmmwwwwwwmmkkypy',
    'kkkkkkkkkkkk..y.'
  ]
};

// 🚽 A blue plastic site portaloo with a white roof, vented door, red/green "occupied" slot and a silver handle
SPRITES['🚽'] = {
  palette: { k: '#1b1b1b', b: '#2f80e0', d: '#1c4f9c', l: '#6fb6ff', w: '#e6f3ff', r: '#e8403a', g: '#3ccf5a', s: '#d9dde3' },
  rows: [
    '..kkkkkkkkkkkk..',
    '.kwwwwwwwwwwwwk.',
    'kwwwwwwwwwwwwllk',
    'kllllllllllllllk',
    'kkkkkkkkkkkkkkkk',
    '.klbbbbbbbbbbdk.',
    '.kldddddddddbdk.',
    '.kldbkkkkkbdbdk.',
    '.kldbdddddbdbdk.',
    '.kldbkkkkkbdbdk.',
    '.kldbbbbbbbdbdk.',
    '.kldbbkrrgkdbdk.',
    '.kldbbkrrgkdbdk.',
    '.kldbbbbbbbdbdk.',
    '.kldbbbbbskdbdk.',
    '.kldbbbbsskdbdk.',
    '.kldbbbbbbbdbdk.',
    '.kldbdddddbdbdk.',
    '.kldbdbbblbdbdk.',
    '.kldbdbbblbdbdk.',
    '.kldblllllbdbdk.',
    '.kldddddddddbdk.',
    '.kddddddddddddk.',
    '.kkkkkkkkkkkkkk.'
  ]
};

// 🏗️ A yellow lattice tower crane with a long jib, grey concrete counterweight, operator cab and a hook on a cable.
SPRITES['🏗'] = {
  palette: { k: '#1b1b1b', y: '#f7c325', o: '#c98a12', w: '#fff0a0', g: '#a6a6a6', l: '#d8d8d8', d: '#6f6f6f', c: '#7fd4ff', b: '#e9f9ff', r: '#e8412c' },
  rows: [
    '.........kk.....................',
    '........krrk....................',
    '......kkkwokkkkk................',
    '....kk.kwkkok...kkkk............',
    '..kk...kwkkok.......kkkk........',
    'kk....kwyyyyok..........kkkk....',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kwwwwwkwyyyyokwwwwwwwwwwwwwwwwwk',
    'kyykkykyyyyyokykkyykkyykkyykkyyk',
    'kkkyykkyyyyyokkyykkyykkyykkyykkk',
    'koooookooooookoooooooooooooooook',
    'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk',
    'kllllkkwyyyyokyyyyyk....kgggk...',
    'klggdkkwykkyokybccok.....kkk....',
    'kddddkkwkyykokycccok......k.....',
    'klggdkkwykkyokoooook......k.....',
    'kggddkkwyyyyokkkkkkk......k.....',
    'kkkkkkkwykkyok............k.....',
    '......kwkyykok............k.....',
    '......kwykkyok..........kkkkk...',
    '......kwyyyyok..........krwrk...',
    '......kwykkyok..........krrrk...',
    '......kwkyykok..........kkkkk...',
    '......kwykkyok...........kgk....',
    '......kwyyyyok........k..kgk....',
    '......kwykkyok.......kgk.kgk....',
    '......kwkyykok.......kgkkkgk....',
    '......kwykkyok........kggggk....',
    '...kkkkkkkkkkkkkk......kkkk.....',
    '...kllllllllllllk...............',
    '...kggggggggggddk...............',
    '...kkkkkkkkkkkkkk...............'
  ]
};

// 🚧 A red-and-white striped site barrier on two grey legs, with a glowing amber warning light on top
SPRITES['🚧'] = {
  palette: { k: '#1b1b1b', r: '#e53935', d: '#a8231f', w: '#ffffff', g: '#c9d3d8', y: '#ffc107', o: '#e68a00', h: '#fff59d', s: '#b0bec5', t: '#78909c' },
  rows: [
    '....y.kkkk.y....',
    '.....khyyyk.....',
    '..yy.kyyyok.yy..',
    '.....kssssk.....',
    'kkkkkkkkkkkkkkkk',
    'krrrwwwrrrwwwrrk',
    'krrwwwrrrwwwrrrk',
    'krwwwrrrwwwrrrwk',
    'kgggdddgggdddggk',
    'kkkkkkkkkkkkkkkk',
    '..kssk....kssk..',
    '..kstk....ktsk..',
    '.kssk......kssk.',
    '.kstk......ktsk.',
    'kssk........kssk',
    'kkkk........kkkk'
  ]
};

// 🧱 A stack of red-orange bricks in staggered rows with pale mortar, one brick missing off the top, sitting on a wooden pallet.
SPRITES['🧱'] = {
  palette: { k: '#1b1b1b', r: '#d9582b', h: '#f59a60', d: '#a33a1c', m: '#dfcfa8', w: '#d49a55', b: '#8a5a2b' },
  rows: [
    'kkkkkkkkkkk.....',
    'khhrrmhhrrk.....',
    'krrrdmrrrdk.....',
    'kmmmmmmmmmmkkkkk',
    'khrmhhrrmhhrrmhk',
    'krdmrrrdmrrrdmdk',
    'kmmmmmmmmmmmmmmk',
    'khhrrmhhrrmhhrrk',
    'krrrdmrrrdmrrrdk',
    'kmmmmmmmmmmmmmmk',
    'khrmhhrrmhhrrmhk',
    'krdmrrrdmrrrdmdk',
    'kkkkkkkkkkkkkkkk',
    'kwwwwwbwwwwwbwwk',
    'kbbkkkkbbkkkkbbk',
    'kkkk..kkkk..kkkk'
  ]
};

// ⛑️ A shiny yellow site hard hat with a raised centre ridge and a wide brim.
SPRITES['⛑'] = {
  palette: { k: '#1b1b1b', y: '#ffc81e', l: '#ffe680', w: '#fffbe6', o: '#e59400', d: '#a55f00' },
  rows: [
    '................',
    '......kkkk......',
    '....kkowlokk....',
    '...klwolloyok...',
    '..klwwolloyyok..',
    '..kwwyolloyyok..',
    '..kwyyolloyook..',
    '..klyyolloyook..',
    '..kyyyolloyodk..',
    '..kyyyolloyodk..',
    'kkkoyyollooddkkk',
    'kllkkkkkkkkkkyok',
    'kllyyyyyyyyyyyok',
    'kooooooooooooddk',
    '.kddddddddddddk.',
    '..kkkkkkkkkkkk..'
  ]
};

// 🥾 A tan leather work boot side-on, cream laces, grey steel toe cap, chunky black sole and three speed lines behind it
SPRITES['🥾'] = {
  palette: {
    k: '#1b1b1b',
    T: '#f3c88e',
    t: '#d8964f',
    b: '#a4622b',
    d: '#693a17',
    l: '#fff3c8',
    S: '#f2f5f8',
    s: '#b4bbc4',
    g: '#6f7782',
    e: '#5e5e64',
    o: '#34343a',
    y: '#f2c230',
    c: '#d6f1ff'
  },
  rows: [
    '...kkkkkk.......',
    '...kdddddkk.....',
    'cc.kbTttllk.....',
    '...kbTttddk.....',
    '...kbTtttllk....',
    'ccckbTttttddk...',
    '...kbTtttttllk..',
    '...kbTttttttkk..',
    'cc.kbttttttgSSk.',
    '...kbtttttbgSssk',
    '...kdbbbbbbgssgk',
    '...kdydydydggggk',
    '..keeeeeeeeeeeek',
    '..kooooooooooook',
    '..kooookkkoooook',
    '...kkkk...kkkkk.'
  ]
};

// 💪 A flexed arm in a rolled-up hi-vis orange sleeve, fist gripping a toilet roll.
SPRITES['💪'] = {
  palette: { k: '#1b1b1b', s: '#f0a877', h: '#ffd2a8', d: '#c47a4f', o: '#ff7a00', O: '#c25400', r: '#e6eef2', w: '#ffffff', g: '#c8cdd8' },
  rows: [
    '..........kkkkk.',
    '.........kwwwwwk',
    '.........kwgkgwk',
    '....kkk..kgwwwgk',
    '...khhsk.kkkkkkk',
    '...khhsskhhhhhdk',
    'kkkkhssskkdsssdk',
    'korohssskhssssdk',
    'korohsssskdddddk',
    'korosssssdhsssdk',
    'korossssssdsssdk',
    'korossssssssssdk',
    'korosssssssssddk',
    'kOrOddssssssddk.',
    'kOrOdddddddddk..',
    'kkkkkkkkkkkkk...'
  ]
};

// 🚬 A ciggie lying diagonally: orange filter, white paper, glowing red-orange tip and a curl of grey smoke.
SPRITES['🚬'] = {
  palette: {
    k: '#1b1b1b',
    y: '#ffb866', o: '#f08a24', d: '#b85a14',
    w: '#ffffff', s: '#c9ced8',
    l: '#b4b4b4', a: '#8a8a8a', x: '#5e5e5e',
    h: '#fff27a', e: '#ffa32b', r: '#f0441c', q: '#b3200f',
    m: '#e6e6e6', n: '#b8b8b8'
  },
  rows: [
    '............m...',
    '............m...',
    '.............m..',
    '.............n..',
    '.........kk.n...',
    '........khek....',
    '.......klerrk...',
    '......kwaaqk....',
    '.....kwwwxk.....',
    '....kwwwsk......',
    '...kwwwsk.......',
    '..kyowsk........',
    '.kyoodk.........',
    'kyoddk..........',
    '.kodk...........',
    '..kk............'
  ]
};

// 🥤 A tall dark-blue energy drink can with a lime lightning bolt, silver top with ring-pull and a shiny stripe down the left
SPRITES['🥤'] = {
  palette: {
    k: '#1b1b1b',
    S: '#f4f6fa',
    s: '#c3c9d3',
    d: '#7d8592',
    B: '#3456c4',
    h: '#9cc0ff',
    b: '#1a2f8a',
    n: '#0f1d50',
    g: '#a8f02a',
    G: '#5fae12'
  },
  rows: [
    '....kkkkkkkk....',
    '...kSSSdddssk...',
    '...kSsdkdssdk...',
    '...kddddddddk...',
    '...kBhBbbbbnk...',
    '...kBhBbbggnk...',
    '...kBhBbggGnk...',
    '...kBhBggGbnk...',
    '...kBhgggggnk...',
    '...kBhBbggGnk...',
    '...kBhBggGbnk...',
    '...kBhggGbbnk...',
    '...kBhgGbbbnk...',
    '...kBhBbbbbnk...',
    '...ksSssssddk...',
    '....kkkkkkkk....'
  ]
};


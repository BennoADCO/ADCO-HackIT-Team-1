// ================================================================
//  CONVERTER - turns a *_Shaun.json file into a playable character
// ================================================================
//  YOU PROBABLY DO NOT NEED THIS FILE.
//
//  It has already been run. The character files it produced live in
//  characters/goth/, characters/lumberjack/, characters/nurse/ and
//  characters/party/, and THOSE are the files the game reads. If you
//  want to change some dialogue, edit those, not the JSON.
//
//  It is kept here only so the conversion can be repeated if someone
//  writes a big batch of new scenes in the old JSON format.
//
//  WHY THE CONVERSION IS NEEDED AT ALL
//  A .json file cannot be loaded by a page you opened by double-
//  clicking it - reading one needs a web server. A .js file loaded by
//  a <script> tag can. So each character is written out as the exact
//  same data with  CHARACTERS['id'] =  on the front and a  ;  on the
//  end. That one wrapper is the whole difference.
//
//  TO RUN IT (needs Node, so this is a developer job):
//     node tools/convert-characters.js
// ================================================================

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');


// ----------------------------------------------------------------
//  The lookup tables
// ----------------------------------------------------------------

// The JSON writes places out in full. The game uses short ids.
var LOCATION_IDS = {
  'Shopping Centre': 'mall',
  'Hospital': 'hospital',
  'Coffee Shop': 'coffee_shop',
  'Uni Campus': 'uni_campus',
  'Gym': 'gym',
  'Construction Site': 'construction_site',
  'Bar': 'bar',
  'Club': 'club'
};

// Which file becomes which character, and how they look on screen.
// Their picture is assets/people/<id>.png - named after the id, so
// there is only ever one name to remember per character.
var PEOPLE = [
  { json: 'Goth_Shaun.json',       id: 'goth',       name: 'Goth Shaun',       anchor: 'right' },
  { json: 'Lumberjack_Shaun.json', id: 'lumberjack', name: 'Lumberjack Shaun', anchor: 'left' },
  { json: 'Nurse_Shaun.json',      id: 'nurse',      name: 'Nurse Shaun',      anchor: 'right' },
  { json: 'Party_Shaun.json',      id: 'party',      name: 'Party Shaun',      anchor: 'centre' }
];


// ----------------------------------------------------------------
//  Turning one scene into one conversation node
// ----------------------------------------------------------------
//  A scene in the JSON is: something they say, a question, and three
//  ways to answer. A node in the game is: some lines, then some reply
//  buttons. So the dialogue and the question become the two lines, and
//  each response becomes a button worth its "favour" in likeability.

function sceneToNode(scene) {
  var options = [];

  for (var i = 0; i < scene.responses.length; i++) {
    var response = scene.responses[i];
    options.push({
      text: response.text,
      like: response.favour,
      end: true
    });
  }

  return {
    says: [scene.dialogue, scene.question],
    options: options
  };
}


// ----------------------------------------------------------------
//  Turning one JSON file into one character
// ----------------------------------------------------------------

function convert(person) {
  var source = path.join(ROOT, 'characters', person.json);
  var data = JSON.parse(fs.readFileSync(source, 'utf8'));

  var appearances = [];
  var nodes = {};
  var skipped = [];

  for (var i = 0; i < data.scenes.length; i++) {
    var scene = data.scenes[i];
    var locationId = LOCATION_IDS[scene.location];

    if (!locationId) {
      skipped.push(scene.id + ' (unknown place "' + scene.location + '")');
      continue;
    }

    appearances.push({ at: locationId, time: scene.time, node: scene.id });
    nodes[scene.id] = sceneToNode(scene);
  }

  var character = {
    name: person.name,
    sprite: 'assets/people/' + person.id + '.png',
    anchor: person.anchor,

    // Kept from the original file. Nothing uses these yet - they are
    // here so the gift idea in CHARACTER-SCHEMA.md can be built later
    // without anyone having to dig the JSON back out.
    favourite_items: data.favourite_items,
    secret_item: data.secret_item,
    contested_secret_items: data.contested_secret_items,

    appearances: appearances,
    nodes: nodes
  };

  return { character: character, skipped: skipped, sceneCount: appearances.length };
}


// ----------------------------------------------------------------
//  Writing the .js file out
// ----------------------------------------------------------------

function header(person, sceneCount) {
  return [
    '// ================================================================',
    '//  ' + person.name.toUpperCase(),
    '// ================================================================',
    '//  ' + sceneCount + ' scenes. Each one is a place, a time of day, something',
    '//  they say, and three ways to answer.',
    '//',
    '//  MADE BY A CONVERTER. This file was generated from',
    '//  characters/' + person.json + ' by tools/convert-characters.js.',
    '//  Edit THIS file, not the JSON - this is the one the game reads.',
    '//',
    '//  HOW TO CHANGE A SCENE',
    '//    Find it under "nodes". The first line in "says" is what they',
    '//    open with, the second is their question. Each "options" entry',
    '//    is a reply button. "like" is how much that answer warms them',
    '//    up - 2 is the right answer, 0 is a shrug, -1 misses them.',
    '//',
    '//  HOW TO MOVE A SCENE SOMEWHERE ELSE',
    '//    Find it in "appearances" and change "at" (a place id from',
    '//    data/locations.js) or "time" (M morning, D daytime,',
    '//    A evening, N night).',
    '//',
    '//  Everything between the first line and the last is plain JSON.',
    '//  Only the  CHARACTERS[...] =  at the top and the  ;  at the',
    '//  bottom are extra, and they are what let this file load by',
    '//  double-clicking, with no web server and no internet.',
    '// ================================================================',
    ''
  ].join('\n');
}

function main() {
  var total = 0;

  for (var i = 0; i < PEOPLE.length; i++) {
    var person = PEOPLE[i];
    var result = convert(person);

    var folder = path.join(ROOT, 'characters', person.id);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    var body = JSON.stringify(result.character, null, 2);
    var text = header(person, result.sceneCount) +
      "CHARACTERS['" + person.id + "'] = " + body + ';\n';

    fs.writeFileSync(path.join(folder, person.id + '.js'), text, 'utf8');

    console.log(person.id.padEnd(12) + result.sceneCount + ' scenes -> characters/' +
      person.id + '/' + person.id + '.js');
    for (var s = 0; s < result.skipped.length; s++) {
      console.log('   SKIPPED ' + result.skipped[s]);
    }
    total = total + result.sceneCount;
  }

  console.log('\n' + total + ' scenes converted.');
  console.log('Remember: each character needs a <script> line in dating.html.');
}

main();

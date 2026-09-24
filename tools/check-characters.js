// ================================================================
//  CHARACTER FILE CHECKER
// ================================================================
//  Checks every *_Shaun.json file against the rules written down in
//  CHARACTER-SCHEMA.md, and prints what is wrong.
//
//  Run it from the project folder:
//      node tools/check-characters.js
//
//  It exits with an error code if anything is broken, so it can be
//  used to gate generated content before it gets committed.
// ================================================================

var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');

var TIMES = ['M', 'D', 'A', 'N'];
var LOCATIONS = [
  'Hospital', 'Uni Campus', 'Construction Site', 'Bar',
  'Club', 'Coffee Shop', 'Gym', 'Shopping Centre'
];
var TYPE_ORDER = ['best', 'neutral', 'wrong'];
var TOP_KEYS = [
  'availability', 'character', 'contested_secret_items',
  'favour_values', 'favourite_items', 'scenes', 'secret_item'
];

var problems = [];
var notes = [];

function problem(file, message) {
  problems.push(file + ': ' + message);
}

// The id a scene is supposed to have, from its own fields.
function expectedId(characterName, location, time) {
  return (characterName + '_' + location + '_' + time)
    .toLowerCase()
    .replace(/ /g, '_');
}

// ---- find the files -------------------------------------------------
var files = fs.readdirSync(ROOT).filter(function (name) {
  return /_Shaun\.json$/.test(name);
});

if (files.length === 0) {
  console.log('No *_Shaun.json files found in ' + ROOT);
  process.exit(1);
}

// ---- load and check each one ---------------------------------------
var loaded = [];

files.forEach(function (name) {
  var text = fs.readFileSync(path.join(ROOT, name), 'utf8');
  var data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    problem(name, 'is not valid JSON - ' + e.message);
    return;
  }
  loaded.push({ name: name, data: data });

  // Top-level keys
  var keys = Object.keys(data).sort();
  TOP_KEYS.forEach(function (k) {
    if (keys.indexOf(k) === -1) {
      problem(name, 'is missing the top-level key "' + k + '"');
    }
  });
  keys.forEach(function (k) {
    if (TOP_KEYS.indexOf(k) === -1) {
      problem(name, 'has an unexpected top-level key "' + k + '"');
    }
  });

  if (!Array.isArray(data.availability) || data.availability.length === 0) {
    problem(name, 'availability must be a non-empty list');
    return;
  }
  data.availability.forEach(function (t) {
    if (TIMES.indexOf(t) === -1) {
      problem(name, 'availability has unknown time code "' + t + '"');
    }
  });

  if (!Array.isArray(data.scenes)) {
    problem(name, 'scenes must be a list');
    return;
  }

  // Scenes
  var seenIds = {};
  var seenCells = {};

  data.scenes.forEach(function (s, i) {
    var where = 'scene ' + i + ' (' + (s.id || 'no id') + ')';

    if (LOCATIONS.indexOf(s.location) === -1) {
      problem(name, where + ' has unknown location "' + s.location + '"');
    }
    if (TIMES.indexOf(s.time) === -1) {
      problem(name, where + ' has unknown time "' + s.time + '"');
    }
    if (data.availability.indexOf(s.time) === -1) {
      problem(name, where + ' is set at time "' + s.time +
              '" but that is not in availability (' + data.availability.join(',') + ')');
    }

    var want = expectedId(data.character, s.location, s.time);
    if (s.id !== want) {
      problem(name, where + ' id should be "' + want + '"');
    }
    if (seenIds[s.id]) {
      problem(name, 'has two scenes with id "' + s.id + '"');
    }
    seenIds[s.id] = true;

    var cell = s.location + '|' + s.time;
    if (seenCells[cell]) {
      problem(name, 'has two scenes for ' + s.location + ' at time ' + s.time);
    }
    seenCells[cell] = true;

    if (typeof s.dialogue !== 'string' || s.dialogue === '') {
      problem(name, where + ' has no dialogue');
    }
    if (typeof s.question !== 'string' || s.question === '') {
      problem(name, where + ' has no question');
    } else if (s.question.slice(-1) !== '?') {
      notes.push(name + ': ' + where + ' question does not end in "?"');
    }

    if (!Array.isArray(s.responses) || s.responses.length !== 3) {
      problem(name, where + ' must have exactly 3 responses, has ' +
              (s.responses ? s.responses.length : 0));
      return;
    }
    s.responses.forEach(function (r, j) {
      if (r.type !== TYPE_ORDER[j]) {
        problem(name, where + ' response ' + j + ' should be type "' +
                TYPE_ORDER[j] + '", is "' + r.type + '"');
      }
      var owed = data.favour_values[r.type];
      if (r.favour !== owed) {
        problem(name, where + ' response "' + r.type + '" has favour ' +
                r.favour + ', should be ' + owed);
      }
      if (typeof r.text !== 'string' || r.text === '') {
        problem(name, where + ' response ' + j + ' has no text');
      }
    });
  });
});

// ---- cross-file checks ---------------------------------------------
var byName = {};
loaded.forEach(function (f) { byName[f.data.character] = f; });

loaded.forEach(function (f) {
  var d = f.data;
  if (!d.secret_item) {
    return;
  }
  var partnerName = d.secret_item.also_liked_by;
  var partner = byName[partnerName];
  if (!partner) {
    problem(f.name, 'secret_item.also_liked_by names "' + partnerName +
            '", who has no character file');
    return;
  }
  var reciprocated = (partner.data.contested_secret_items || []).some(function (item) {
    return item.name === d.secret_item.name && item.primary_character === d.character;
  });
  if (!reciprocated) {
    problem(f.name, 'secret item "' + d.secret_item.name + '" is not listed in ' +
            partnerName + "'s contested_secret_items with primary_character \"" +
            d.character + '"');
  }
});

// ---- coverage report ------------------------------------------------
var totalScenes = 0;
var totalPossible = 0;
var coverage = [];

loaded.forEach(function (f) {
  var d = f.data;
  var have = {};
  d.scenes.forEach(function (s) { have[s.location + '|' + s.time] = true; });

  var gaps = [];
  LOCATIONS.forEach(function (L) {
    d.availability.forEach(function (T) {
      if (!have[L + '|' + T]) {
        gaps.push(expectedId(d.character, L, T));
      }
    });
  });
  var possible = LOCATIONS.length * d.availability.length;
  totalScenes += d.scenes.length;
  totalPossible += possible;
  coverage.push({ name: d.character, has: d.scenes.length, possible: possible, gaps: gaps });
});

// ---- print -----------------------------------------------------------
console.log('Checked ' + loaded.length + ' character files, ' + totalScenes + ' scenes.\n');

console.log('COVERAGE');
coverage.forEach(function (c) {
  console.log('  ' + c.name.padEnd(12) + c.has + '/' + c.possible +
              '   missing ' + c.gaps.length);
  c.gaps.forEach(function (g) { console.log('      - ' + g); });
});
console.log('  ' + 'TOTAL'.padEnd(12) + totalScenes + '/' + totalPossible +
            '   missing ' + (totalPossible - totalScenes) + '\n');

if (notes.length > 0) {
  console.log('NOTES (not failures)');
  notes.forEach(function (n) { console.log('  ' + n); });
  console.log('');
}

if (problems.length === 0) {
  console.log('No problems found.');
  process.exit(0);
}

console.log(problems.length + ' PROBLEM(S)');
problems.forEach(function (p) { console.log('  ' + p); });
process.exit(1);

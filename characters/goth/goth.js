// ================================================================
//  GOTH SHAUN
// ================================================================
//  5 scenes. Each one is a place, a time of day, something
//  they say, and three ways to answer.
//
//  MADE BY A CONVERTER. This file was generated from
//  characters/Goth_Shaun.json by tools/convert-characters.js.
//  Edit THIS file, not the JSON - this is the one the game reads.
//
//  HOW TO CHANGE A SCENE
//    Find it under "nodes". The first line in "says" is what they
//    open with, the second is their question. Each "options" entry
//    is a reply button. "like" is how much that answer warms them
//    up - 2 is the right answer, 0 is a shrug, -1 misses them.
//
//  HOW TO MOVE A SCENE SOMEWHERE ELSE
//    Find it in "appearances" and change "at" (a place id from
//    data/locations.js) or "time" (M morning, D daytime,
//    A evening, N night).
//
//  Everything between the first line and the last is plain JSON.
//  Only the  CHARACTERS[...] =  at the top and the  ;  at the
//  bottom are extra, and they are what let this file load by
//  double-clicking, with no web server and no internet.
// ================================================================
CHARACTERS['goth'] = {
  "name": "Goth Shaun",
  "sprite": "assets/people/goth.png",
  "anchor": "right",

  // ------------------------------------------------------------
  //  ANSWERING BACK
  // ------------------------------------------------------------
  //  What he says after you answer, so a scene does not stop dead
  //  the moment you pick something.
  //    good - your answer pleased him  (a reply with "like" above 0)
  //    ok   - your answer was a shrug  ("like" of 0)
  //    bad  - your answer missed him   ("like" below 0)
  //
  //  These have to work after ANY of his questions, so keep them
  //  about how he took it rather than about the subject. For a line
  //  written to fit one exact answer, put a "reply" on that answer
  //  down in "nodes" instead - that always wins over these.
  //
  //  Goth Shaun is dry and withdrawn. He does not gush.
  "reactions": {
    "good": [
      "Huh. You actually meant that.",
      "Most people say the opposite. Noted.",
      "That is not the answer I expected. Good.",
      "Alright. You might not be hopeless."
    ],
    "ok": [
      "Mm.",
      "Fair enough, I suppose.",
      "That is a very safe answer.",
      "Noncommittal. Fine."
    ],
    "bad": [
      "Right.",
      "Of course you would say that.",
      "...We are very different people.",
      "Forget I asked."
    ]
  },
  "leaveText": "Leave him to it.",
  "favourite_items": [
    "Black Rose",
    "Skull Ring",
    "Eyeliner"
  ],
  "secret_item": {
    "name": "Candles",
    "also_liked_by": "Nurse"
  },
  "contested_secret_items": [
    {
      "name": "Black Nail Polish",
      "primary_character": "Party"
    }
  ],
  "appearances": [
    {
      "at": "hospital",
      "time": "N",
      "node": "goth_hospital_n"
    },
    {
      "at": "uni_campus",
      "time": "N",
      "node": "goth_uni_campus_n"
    },
    {
      "at": "bar",
      "time": "N",
      "node": "goth_bar_n"
    },
    {
      "at": "club",
      "time": "N",
      "node": "goth_club_n"
    },
    {
      "at": "gym",
      "time": "N",
      "node": "goth_gym_n"
    }
  ],
  "nodes": {
    // WORKED EXAMPLE. Every answer here has its own "reply" - what he
    // says back to that exact answer. That is better than the general
    // "reactions" at the top of this file, because it can talk about
    // what you actually said. Copy this pattern into the other scenes
    // as you get time. Any answer with no "reply" of its own falls
    // back to the general ones, so nothing breaks while you work.
    "goth_hospital_n": {
      "says": [
        "Visiting my grandmother. Hospitals at night are strangely beautiful.",
        "Do you find silence comforting?"
      ],
      "options": [
        {
          "text": "Yes, very.",
          "like": 2,
          "reply": [
            "Most people fill it with noise the second it turns up.",
            "You just let it sit there. I noticed."
          ],
          "end": true
        },
        {
          "text": "Sometimes.",
          "like": 0,
          "reply": "Sometimes. The honest answer, at least.",
          "end": true
        },
        {
          "text": "No, it's creepy.",
          "like": -1,
          "reply": [
            "Creepy.",
            "It is the only part of the day nobody wants anything from you.",
            "But sure. Creepy."
          ],
          "end": true
        }
      ]
    },
    "goth_uni_campus_n": {
      "says": [
        "Everyone avoids the old cemetery by campus. I read there. It's peaceful.",
        "Do you believe in ghosts?"
      ],
      "options": [
        {
          "text": "Yes, I'd love to meet one.",
          "like": 2,
          "end": true
        },
        {
          "text": "I'm not sure.",
          "like": 0,
          "end": true
        },
        {
          "text": "No, that's silly.",
          "like": -1,
          "end": true
        }
      ]
    },
    "goth_bar_n": {
      "says": [
        "They play real music here after ten. Not that chart garbage.",
        "What music are you into?"
      ],
      "options": [
        {
          "text": "Post-punk and darkwave.",
          "like": 2,
          "end": true
        },
        {
          "text": "A bit of everything.",
          "like": 0,
          "end": true
        },
        {
          "text": "Top 40 pop.",
          "like": -1,
          "end": true
        }
      ]
    },
    "goth_club_n": {
      "says": [
        "The lights are too bright. I only come for the DJ in the back room.",
        "What's your favourite time of day?"
      ],
      "options": [
        {
          "text": "Midnight.",
          "like": 2,
          "end": true
        },
        {
          "text": "Doesn't matter to me.",
          "like": 0,
          "end": true
        },
        {
          "text": "Early morning, sunrises!",
          "like": -1,
          "end": true
        }
      ]
    },
    "goth_gym_n": {
      "says": [
        "I come at night so no one talks to me. Yet here you are.",
        "Why are you here so late?"
      ],
      "options": [
        {
          "text": "I prefer it empty too.",
          "like": 2,
          "end": true
        },
        {
          "text": "Only time I'm free.",
          "like": 0,
          "end": true
        },
        {
          "text": "I wanted someone to chat with!",
          "like": -1,
          "end": true
        }
      ]
    }
  }
};

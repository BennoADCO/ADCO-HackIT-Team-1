// ================================================================
//  MIA
// ================================================================
//  A worked example. Copy this whole folder, rename it, and change
//  the words to make a new character.
//
//  Everything between the first line and the last is plain JSON - you
//  can paste it into any JSON editor and back again. Only the
//  CHARACTERS['mia'] = at the top and the ; at the bottom are extra,
//  and they are what let the file load by double-clicking, with no
//  web server and no internet.
//
//  AFTER COPYING THIS FOLDER you must also add a line to dating.html:
//     <script src="characters/yourname/yourname.js"></script>
//  or the game will never know they exist.
// ================================================================

CHARACTERS['mia'] = {

  "name": "Mia",

  // Their picture. If this file is missing, a plain stand-in is shown
  // instead, so you can write all the dialogue before any art exists.
  // A tall picture with a see-through background works best.
  "sprite": "characters/mia/mia.png",

  // Which side of the screen they stand on: 'left', 'centre' or 'right'.
  "anchor": "right",

  // ------------------------------------------------------------
  //  STAGES - their story, one chapter at a time
  // ------------------------------------------------------------
  //  You start on stage 0. A reply marked  "advance": true  moves them
  //  on to the next one, which is what makes them turn up somewhere
  //  new. Run off the end of this list and they stop appearing.
  //    at    - the location id they are standing in (see data/locations.js)
  //    start - the conversation node this chapter opens on
  "stages": [
    { "at": "mall", "start": "first_meeting" },
    { "at": "mall", "start": "second_time" }
  ],

  // ------------------------------------------------------------
  //  NODES - everything they can say
  // ------------------------------------------------------------
  //  says    - the lines, one after another. Click or press Space
  //            to step through them.
  //  options - up to FOUR replies. More than four will not fit.
  //  goto    - which node that reply jumps to
  //  like    - warms them up (a minus number cools them off)
  //  set     - writes a note into their memory
  //  needs   - only show this reply if their memory matches
  //  end     - the conversation finishes here
  //  advance - move them on to their next stage
  "nodes": {

    "first_meeting": {
      "says": [
        "Oh - you're awake.",
        "You've been out cold in the food court for two hours.",
        "Everyone just walked around you. Honestly, this place."
      ],
      "options": [
        { "text": "Where am I?",              "goto": "explains" },
        { "text": "A crane fell on me.",      "goto": "crane",    "like": 1,
          "set": { "mentionedCrane": true } },
        { "text": "Say nothing at all.",      "goto": "awkward",  "like": -1 }
      ]
    },

    "explains": {
      "says": [
        "The shopping centre. Where else would you be?",
        "You're not from round here, are you."
      ],
      "options": [
        { "text": "Apparently not.", "goto": "warm" },
        { "text": "I should go.",    "goto": "cold" }
      ]
    },

    "crane": {
      "says": [
        "A crane.",
        "Right. Sure. And I'm the Queen of the food court.",
        "...you're serious, aren't you."
      ],
      "options": [
        { "text": "Completely serious.", "goto": "warm", "like": 1 },
        { "text": "Maybe I imagined it.", "goto": "cold" }
      ]
    },

    "awkward": {
      "says": [
        "Right. Strong silent type.",
        "I'll leave you to it, then."
      ],
      "end": true,
      "advance": true,
      "leaveText": "Watch her go."
    },

    "warm": {
      "says": [
        "Well. Whatever happened to you, you're standing up now.",
        "I'm Mia. I'm here most days, unfortunately.",
        "Come find me when you've worked out what year it is."
      ],
      "like": 2,
      "end": true,
      "advance": true,
      "leaveText": "Say goodbye."
    },

    "cold": {
      "says": [
        "Suit yourself.",
        "Mind the escalator on your way out."
      ],
      "like": -1,
      "end": true,
      "advance": true,
      "leaveText": "Leave."
    },

    // ---- Stage 1: coming back a second time ----
    "second_time": {
      "says": [
        "Back again. You must like the lighting in here.",
        "How's the head?"
      ],
      "options": [
        { "text": "Still ringing.",   "goto": "sympathy", "like": 1 },
        { "text": "Never better.",    "goto": "sympathy" },
        // This reply only appears if you told her about the crane the
        // first time. That is what "needs" is for.
        { "text": "You still don't believe me about the crane, do you.",
          "needs": { "mentionedCrane": true },
          "goto": "crane_callback", "like": 2 }
      ]
    },

    "crane_callback": {
      "says": [
        "I looked it up, actually.",
        "There was a crane. On a site out past the highway.",
        "So either you're telling the truth, or you read the news. Both are worrying."
      ],
      "end": true,
      "advance": true,
      "leaveText": "Let her wonder."
    },

    "sympathy": {
      "says": [
        "You'll live. Probably.",
        "Same time tomorrow?"
      ],
      "end": true,
      "advance": true,
      "leaveText": "Nod."
    }
  }
};

// ================================================================
//  LUMBERJACK SHAUN
// ================================================================
//  13 scenes. Each one is a place, a time of day, something
//  they say, and three ways to answer.
//
//  MADE BY A CONVERTER. This file was generated from
//  characters/Lumberjack_Shaun.json by tools/convert-characters.js.
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
CHARACTERS['lumberjack'] = {
  "name": "Lumberjack Shaun",
  "sprite": "assets/people/lumberjack.png",
  "anchor": "left",

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
  //  Lumberjack Shaun is plain and warm. No edge to him at all.
  "reactions": {
    "good": [
      "Ha! Good answer, that.",
      "See, I knew I liked you.",
      "That is the spirit.",
      "Too right. Good on ya."
    ],
    "ok": [
      "Fair enough.",
      "Yeah, no, that is fair.",
      "Can't argue with that.",
      "Suppose so, yeah."
    ],
    "bad": [
      "Huh. Each to their own.",
      "Really? Not how I would have it.",
      "Well. You are honest, I will give you that.",
      "Ah well. Can't agree on everything."
    ]
  },
  "leaveText": "Head off.",
  "favourite_items": [
    "Axe",
    "Flannel Shirt",
    "Maple Syrup"
  ],
  "secret_item": {
    "name": "Marshmallows",
    "also_liked_by": "Party"
  },
  "contested_secret_items": [
    {
      "name": "Band-Aids",
      "primary_character": "Nurse"
    }
  ],
  "appearances": [
    {
      "at": "hospital",
      "time": "M",
      "node": "lumberjack_hospital_m"
    },
    {
      "at": "hospital",
      "time": "A",
      "node": "lumberjack_hospital_a"
    },
    {
      "at": "uni_campus",
      "time": "M",
      "node": "lumberjack_uni_campus_m"
    },
    {
      "at": "uni_campus",
      "time": "A",
      "node": "lumberjack_uni_campus_a"
    },
    {
      "at": "construction_site",
      "time": "M",
      "node": "lumberjack_construction_site_m"
    },
    {
      "at": "construction_site",
      "time": "A",
      "node": "lumberjack_construction_site_a"
    },
    {
      "at": "bar",
      "time": "A",
      "node": "lumberjack_bar_a"
    },
    {
      "at": "coffee_shop",
      "time": "M",
      "node": "lumberjack_coffee_shop_m"
    },
    {
      "at": "coffee_shop",
      "time": "A",
      "node": "lumberjack_coffee_shop_a"
    },
    {
      "at": "gym",
      "time": "M",
      "node": "lumberjack_gym_m"
    },
    {
      "at": "gym",
      "time": "A",
      "node": "lumberjack_gym_a"
    },
    {
      "at": "mall",
      "time": "M",
      "node": "lumberjack_shopping_centre_m"
    },
    {
      "at": "mall",
      "time": "A",
      "node": "lumberjack_shopping_centre_a"
    }
  ],
  "nodes": {
    "lumberjack_hospital_m": {
      "says": [
        "Splinter the size of a pencil. Walked it off for two days.",
        "Would you have come in sooner?"
      ],
      "options": [
        {
          "text": "Nah, I'd tough it out too.",
          "like": 2,
          "end": true
        },
        {
          "text": "Probably.",
          "like": 0,
          "end": true
        },
        {
          "text": "I'd call an ambulance.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_hospital_a": {
      "says": [
        "Dropping off firewood for the hospital fundraiser.",
        "Want to help me stack it?"
      ],
      "options": [
        {
          "text": "Sure, let's do it.",
          "like": 2,
          "end": true
        },
        {
          "text": "Just a few logs.",
          "like": 0,
          "end": true
        },
        {
          "text": "I'll get splinters.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_uni_campus_m": {
      "says": [
        "Giving a forestry talk to the environmental students.",
        "Do you care about the environment?"
      ],
      "options": [
        {
          "text": "Yes, I plant trees every year.",
          "like": 2,
          "end": true
        },
        {
          "text": "I recycle.",
          "like": 0,
          "end": true
        },
        {
          "text": "Not really.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_uni_campus_a": {
      "says": [
        "Nice campus. Not enough trees, though.",
        "City or countryside?"
      ],
      "options": [
        {
          "text": "Countryside.",
          "like": 2,
          "end": true
        },
        {
          "text": "Somewhere in between.",
          "like": 0,
          "end": true
        },
        {
          "text": "City, always.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_construction_site_m": {
      "says": [
        "Mornin'! Just dropped off timber. Nothing beats fresh-cut pine.",
        "You ever work with your hands?"
      ],
      "options": [
        {
          "text": "Yeah, I love building things.",
          "like": 2,
          "end": true
        },
        {
          "text": "A little.",
          "like": 0,
          "end": true
        },
        {
          "text": "No, I'd rather pay someone.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_construction_site_a": {
      "says": [
        "Long day. Built the frame for this whole second floor.",
        "Want to see what I built?"
      ],
      "options": [
        {
          "text": "Show me!",
          "like": 2,
          "end": true
        },
        {
          "text": "Quickly.",
          "like": 0,
          "end": true
        },
        {
          "text": "It's just wood.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_bar_a": {
      "says": [
        "One cold beer after work. That's the rule.",
        "What are you drinking?"
      ],
      "options": [
        {
          "text": "A beer.",
          "like": 2,
          "end": true
        },
        {
          "text": "Just a soft drink.",
          "like": 0,
          "end": true
        },
        {
          "text": "Something pink with an umbrella.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_coffee_shop_m": {
      "says": [
        "Black coffee and a bacon roll. Breakfast of champions.",
        "What's your ideal breakfast?"
      ],
      "options": [
        {
          "text": "Pancakes with maple syrup.",
          "like": 2,
          "end": true
        },
        {
          "text": "Toast.",
          "like": 0,
          "end": true
        },
        {
          "text": "I skip breakfast.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_coffee_shop_a": {
      "says": [
        "Filling my thermos, then heading back to the woods.",
        "Ever been camping?"
      ],
      "options": [
        {
          "text": "Loads, I love it.",
          "like": 2,
          "end": true
        },
        {
          "text": "Once or twice.",
          "like": 0,
          "end": true
        },
        {
          "text": "Never, too many bugs.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_gym_m": {
      "says": [
        "Early lift before work.",
        "Could you carry a log on your shoulder?"
      ],
      "options": [
        {
          "text": "Let's find out!",
          "like": 2,
          "end": true
        },
        {
          "text": "Maybe a small one.",
          "like": 0,
          "end": true
        },
        {
          "text": "Why would I?",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_gym_a": {
      "says": [
        "Chopping wood is my workout, but the rain kept me inside.",
        "Where would you rather spend a weekend?"
      ],
      "options": [
        {
          "text": "A cabin in the woods.",
          "like": 2,
          "end": true
        },
        {
          "text": "Anywhere with good food.",
          "like": 0,
          "end": true
        },
        {
          "text": "A fancy city hotel.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_shopping_centre_m": {
      "says": [
        "Need new work boots. These have seen three winters.",
        "What matters most in boots?"
      ],
      "options": [
        {
          "text": "Tough and waterproof.",
          "like": 2,
          "end": true
        },
        {
          "text": "Comfort.",
          "like": 0,
          "end": true
        },
        {
          "text": "Whatever's trending.",
          "like": -1,
          "end": true
        }
      ]
    },
    "lumberjack_shopping_centre_a": {
      "says": [
        "Help me pick a flannel.",
        "Red or green?"
      ],
      "options": [
        {
          "text": "Red, a classic.",
          "like": 2,
          "end": true
        },
        {
          "text": "Green.",
          "like": 0,
          "end": true
        },
        {
          "text": "Neither, flannel's out of style.",
          "like": -1,
          "end": true
        }
      ]
    }
  }
};

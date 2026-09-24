// ================================================================
//  PARTY SHAUN
// ================================================================
//  12 scenes. Each one is a place, a time of day, something
//  they say, and three ways to answer.
//
//  MADE BY A CONVERTER. This file was generated from
//  characters/Party_Shaun.json by tools/convert-characters.js.
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
CHARACTERS['party'] = {
  "name": "Party Shaun",
  "sprite": "assets/people/party.png",
  "anchor": "centre",

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
  //  Party Shaun is loud and inviting. Everything is the best thing
  //  that has ever happened.
  "reactions": {
    "good": [
      "YES! See, this one gets it!",
      "Mate! That is what I am talking about!",
      "Okay okay okay. I like you.",
      "Finally, someone with a bit of life in them!"
    ],
    "ok": [
      "Ha! Alright, sitting on the fence.",
      "Sure, sure. We will work on you.",
      "That is a maybe. I will take a maybe.",
      "Eh! Good enough!"
    ],
    "bad": [
      "Oh, come ON.",
      "Boo! Terrible. Awful. Nul points.",
      "Wow. Okay. Wow.",
      "You are killing me here. Killing me."
    ]
  },
  "leaveText": "Escape while you can.",
  "favourite_items": [
    "Glow Sticks",
    "Party Hat",
    "Disco Ball"
  ],
  "secret_item": {
    "name": "Black Nail Polish",
    "also_liked_by": "Goth"
  },
  "contested_secret_items": [
    {
      "name": "Marshmallows",
      "primary_character": "Lumberjack"
    }
  ],
  "appearances": [
    {
      "at": "hospital",
      "time": "A",
      "node": "party_hospital_a"
    },
    {
      "at": "hospital",
      "time": "N",
      "node": "party_hospital_n"
    },
    {
      "at": "uni_campus",
      "time": "A",
      "node": "party_uni_campus_a"
    },
    {
      "at": "uni_campus",
      "time": "N",
      "node": "party_uni_campus_n"
    },
    {
      "at": "construction_site",
      "time": "A",
      "node": "party_construction_site_a"
    },
    {
      "at": "bar",
      "time": "A",
      "node": "party_bar_a"
    },
    {
      "at": "bar",
      "time": "N",
      "node": "party_bar_n"
    },
    {
      "at": "club",
      "time": "N",
      "node": "party_club_n"
    },
    {
      "at": "coffee_shop",
      "time": "A",
      "node": "party_coffee_shop_a"
    },
    {
      "at": "gym",
      "time": "A",
      "node": "party_gym_a"
    },
    {
      "at": "gym",
      "time": "N",
      "node": "party_gym_n"
    },
    {
      "at": "mall",
      "time": "A",
      "node": "party_shopping_centre_a"
    }
  ],
  "nodes": {
    "party_hospital_a": {
      "says": [
        "Sprained my ankle dancing on a table. Worth it!",
        "Was it worth it?"
      ],
      "options": [
        {
          "text": "Totally, great story!",
          "like": 2,
          "end": true
        },
        {
          "text": "Hope you're okay.",
          "like": 0,
          "end": true
        },
        {
          "text": "Sounds irresponsible.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_hospital_n": {
      "says": [
        "Visiting a friend who got hurt at a gig. Brought glow sticks!",
        "Would you sneak in balloons for me?"
      ],
      "options": [
        {
          "text": "Absolutely.",
          "like": 2,
          "end": true
        },
        {
          "text": "If the nurses allow it.",
          "like": 0,
          "end": true
        },
        {
          "text": "That's against the rules.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_uni_campus_a": {
      "says": [
        "Handing out flyers for tonight's campus party!",
        "You coming?"
      ],
      "options": [
        {
          "text": "Wouldn't miss it.",
          "like": 2,
          "end": true
        },
        {
          "text": "Maybe.",
          "like": 0,
          "end": true
        },
        {
          "text": "I have to study.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_uni_campus_n": {
      "says": [
        "Someone brought a smoke machine to the party!",
        "Want to start a dance circle?"
      ],
      "options": [
        {
          "text": "Let's do it!",
          "like": 2,
          "end": true
        },
        {
          "text": "I'll watch.",
          "like": 0,
          "end": true
        },
        {
          "text": "That's embarrassing.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_construction_site_a": {
      "says": [
        "My friend works here. Dropping off party invites!",
        "Should I invite the whole crew?"
      ],
      "options": [
        {
          "text": "The more the merrier!",
          "like": 2,
          "end": true
        },
        {
          "text": "Just a few.",
          "like": 0,
          "end": true
        },
        {
          "text": "Keep it small.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_bar_a": {
      "says": [
        "Happy hour! Best two hours of the day!",
        "What's your go-to drink?"
      ],
      "options": [
        {
          "text": "Whatever you're having!",
          "like": 2,
          "end": true
        },
        {
          "text": "Something simple.",
          "like": 0,
          "end": true
        },
        {
          "text": "Just water, I'm leaving early.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_bar_n": {
      "says": [
        "Karaoke night! I already signed us up.",
        "What are we singing?"
      ],
      "options": [
        {
          "text": "A big 80s anthem!",
          "like": 2,
          "end": true
        },
        {
          "text": "Something slow.",
          "like": 0,
          "end": true
        },
        {
          "text": "I'm not singing.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_club_n": {
      "says": [
        "This DJ is insane! You're not just going to stand there, are you?",
        "Dance with me?"
      ],
      "options": [
        {
          "text": "Absolutely, let's go!",
          "like": 2,
          "end": true
        },
        {
          "text": "After one more song.",
          "like": 0,
          "end": true
        },
        {
          "text": "I don't really dance.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_coffee_shop_a": {
      "says": [
        "Iced coffee, extra syrup. Fuelling up for tonight!",
        "What's your plan tonight?"
      ],
      "options": [
        {
          "text": "Wherever you're going!",
          "like": 2,
          "end": true
        },
        {
          "text": "Dinner, then home.",
          "like": 0,
          "end": true
        },
        {
          "text": "Staying in to read.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_gym_a": {
      "says": [
        "Working out so I can dance all night!",
        "Want to try my dance cardio class?"
      ],
      "options": [
        {
          "text": "Sure!",
          "like": 2,
          "end": true
        },
        {
          "text": "Next time.",
          "like": 0,
          "end": true
        },
        {
          "text": "Dancing isn't exercise.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_gym_n": {
      "says": [
        "Night gym, then straight to the club. Efficient!",
        "Coming with me after?"
      ],
      "options": [
        {
          "text": "Let's go!",
          "like": 2,
          "end": true
        },
        {
          "text": "Just for an hour.",
          "like": 0,
          "end": true
        },
        {
          "text": "I need sleep.",
          "like": -1,
          "end": true
        }
      ]
    },
    "party_shopping_centre_a": {
      "says": [
        "I need an outfit for tonight!",
        "Sparkly or neon?"
      ],
      "options": [
        {
          "text": "Both!",
          "like": 2,
          "end": true
        },
        {
          "text": "Sparkly.",
          "like": 0,
          "end": true
        },
        {
          "text": "Plain black.",
          "like": -1,
          "end": true
        }
      ]
    }
  }
};

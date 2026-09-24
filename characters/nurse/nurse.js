// ================================================================
//  NURSE SHAUN
// ================================================================
//  24 scenes. Each one is a place, a time of day, something
//  they say, and three ways to answer.
//
//  MADE BY A CONVERTER. This file was generated from
//  characters/Nurse_Shaun.json by tools/convert-characters.js.
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
CHARACTERS['nurse'] = {
  "name": "Nurse Shaun",
  "sprite": "assets/people/nurse.png",
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
  //  Nurse Shaun is tired, competent and dry. Twelve hours in.
  "reactions": {
    "good": [
      "Finally. Someone sensible.",
      "Good. That is the right answer.",
      "Hm. You are alright, you.",
      "See, that is what I have been saying all week."
    ],
    "ok": [
      "Mm. Fair.",
      "That is a very diplomatic answer.",
      "Sure. Whatever gets you through.",
      "Right. Okay."
    ],
    "bad": [
      "Oh, don't you start.",
      "That is exactly what the last one said.",
      "Wrong, but I have not got the energy.",
      "Hm. No."
    ]
  },
  "leaveText": "Let him get back to it.",
  "favourite_items": [
    "Stethoscope",
    "Coffee",
    "Scrubs"
  ],
  "secret_item": {
    "name": "Band-Aids",
    "also_liked_by": "Lumberjack"
  },
  "contested_secret_items": [
    {
      "name": "Candles",
      "primary_character": "Goth"
    }
  ],
  "appearances": [
    {
      "at": "hospital",
      "time": "M",
      "node": "nurse_hospital_m"
    },
    {
      "at": "hospital",
      "time": "D",
      "node": "nurse_hospital_d"
    },
    {
      "at": "hospital",
      "time": "A",
      "node": "nurse_hospital_a"
    },
    {
      "at": "hospital",
      "time": "N",
      "node": "nurse_hospital_n"
    },
    {
      "at": "uni_campus",
      "time": "M",
      "node": "nurse_uni_campus_m"
    },
    {
      "at": "uni_campus",
      "time": "D",
      "node": "nurse_uni_campus_d"
    },
    {
      "at": "uni_campus",
      "time": "A",
      "node": "nurse_uni_campus_a"
    },
    {
      "at": "uni_campus",
      "time": "N",
      "node": "nurse_uni_campus_n"
    },
    {
      "at": "construction_site",
      "time": "M",
      "node": "nurse_construction_site_m"
    },
    {
      "at": "construction_site",
      "time": "D",
      "node": "nurse_construction_site_d"
    },
    {
      "at": "construction_site",
      "time": "A",
      "node": "nurse_construction_site_a"
    },
    {
      "at": "bar",
      "time": "A",
      "node": "nurse_bar_a"
    },
    {
      "at": "bar",
      "time": "N",
      "node": "nurse_bar_n"
    },
    {
      "at": "club",
      "time": "N",
      "node": "nurse_club_n"
    },
    {
      "at": "coffee_shop",
      "time": "M",
      "node": "nurse_coffee_shop_m"
    },
    {
      "at": "coffee_shop",
      "time": "D",
      "node": "nurse_coffee_shop_d"
    },
    {
      "at": "coffee_shop",
      "time": "A",
      "node": "nurse_coffee_shop_a"
    },
    {
      "at": "gym",
      "time": "M",
      "node": "nurse_gym_m"
    },
    {
      "at": "gym",
      "time": "D",
      "node": "nurse_gym_d"
    },
    {
      "at": "gym",
      "time": "A",
      "node": "nurse_gym_a"
    },
    {
      "at": "gym",
      "time": "N",
      "node": "nurse_gym_n"
    },
    {
      "at": "mall",
      "time": "M",
      "node": "nurse_shopping_centre_m"
    },
    {
      "at": "mall",
      "time": "D",
      "node": "nurse_shopping_centre_d"
    },
    {
      "at": "mall",
      "time": "A",
      "node": "nurse_shopping_centre_a"
    }
  ],
  "nodes": {
    "nurse_hospital_m": {
      "says": [
        "Morning handover is chaos. Please tell me you're not a patient.",
        "Are you a morning person?"
      ],
      "options": [
        {
          "text": "Only after coffee.",
          "like": 2,
          "end": true
        },
        {
          "text": "Yes, I love mornings.",
          "like": 0,
          "end": true
        },
        {
          "text": "No, I sleep till noon.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_hospital_d": {
      "says": [
        "Lunch break, finally. Ten whole minutes.",
        "What do you usually eat for lunch?"
      ],
      "options": [
        {
          "text": "Something quick and healthy.",
          "like": 2,
          "end": true
        },
        {
          "text": "Takeaway.",
          "like": 0,
          "end": true
        },
        {
          "text": "I skip lunch most days.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_hospital_a": {
      "says": [
        "A kid just gave me a drawing for fixing his arm. Best part of the job.",
        "What makes a job worth it for you?"
      ],
      "options": [
        {
          "text": "Helping people.",
          "like": 2,
          "end": true
        },
        {
          "text": "The pay.",
          "like": 0,
          "end": true
        },
        {
          "text": "Finishing early.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_hospital_n": {
      "says": [
        "Third night shift this week. Running on vending machine snacks.",
        "If you had a whole day off, what would you do?"
      ],
      "options": [
        {
          "text": "Sleep in and do nothing.",
          "like": 2,
          "end": true
        },
        {
          "text": "Work on my projects.",
          "like": 0,
          "end": true
        },
        {
          "text": "Party all night!",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_uni_campus_m": {
      "says": [
        "I'm giving a guest lecture to the nursing students.",
        "Ever thought about studying medicine?"
      ],
      "options": [
        {
          "text": "Yes, I admire what you do.",
          "like": 2,
          "end": true
        },
        {
          "text": "Maybe, but blood makes me queasy.",
          "like": 0,
          "end": true
        },
        {
          "text": "No, sounds boring.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_uni_campus_d": {
      "says": [
        "I've seen healthier food in the ER than this cafeteria.",
        "Do you cook for yourself?"
      ],
      "options": [
        {
          "text": "Yes, proper meals.",
          "like": 2,
          "end": true
        },
        {
          "text": "Sometimes.",
          "like": 0,
          "end": true
        },
        {
          "text": "Instant noodles every night.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_uni_campus_a": {
      "says": [
        "Studying for a certification exam. My brain is mush.",
        "How do you deal with stress?"
      ],
      "options": [
        {
          "text": "Take breaks and rest.",
          "like": 2,
          "end": true
        },
        {
          "text": "Just push through.",
          "like": 0,
          "end": true
        },
        {
          "text": "Stay up all night.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_uni_campus_n": {
      "says": [
        "The library is the only quiet place I can study.",
        "Would you quiz me on my flashcards?"
      ],
      "options": [
        {
          "text": "Of course, hand them over.",
          "like": 2,
          "end": true
        },
        {
          "text": "For a few minutes.",
          "like": 0,
          "end": true
        },
        {
          "text": "Nah, I've got better things to do.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_construction_site_m": {
      "says": [
        "Site safety check. Someone forgot their hard hat again.",
        "Do you take safety seriously?"
      ],
      "options": [
        {
          "text": "Always.",
          "like": 2,
          "end": true
        },
        {
          "text": "Most of the time.",
          "like": 0,
          "end": true
        },
        {
          "text": "Rules are made to be broken.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_construction_site_d": {
      "says": [
        "A worker cut his hand on sheet metal. Patched him right up.",
        "Could you handle seeing an injury?"
      ],
      "options": [
        {
          "text": "Yes, I'd stay calm and help.",
          "like": 2,
          "end": true
        },
        {
          "text": "I'd try.",
          "like": 0,
          "end": true
        },
        {
          "text": "I'd faint.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_construction_site_a": {
      "says": [
        "Heat stroke is the number one thing I treat out here.",
        "Do you drink enough water?"
      ],
      "options": [
        {
          "text": "Yes, I carry a bottle everywhere.",
          "like": 2,
          "end": true
        },
        {
          "text": "When I remember.",
          "like": 0,
          "end": true
        },
        {
          "text": "Only soft drinks.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_bar_a": {
      "says": [
        "One drink after a shift. Just one. Nurse's orders.",
        "Want to share a table?"
      ],
      "options": [
        {
          "text": "Sure, you've earned a break.",
          "like": 2,
          "end": true
        },
        {
          "text": "Just for a bit.",
          "like": 0,
          "end": true
        },
        {
          "text": "Let's order shots!",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_bar_n": {
      "says": [
        "My co-workers dragged me out. I'd rather be in bed.",
        "Want to get out of here?"
      ],
      "options": [
        {
          "text": "Let's grab a quiet bite.",
          "like": 2,
          "end": true
        },
        {
          "text": "Let's stay a little longer.",
          "like": 0,
          "end": true
        },
        {
          "text": "No way, the night's just starting!",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_club_n": {
      "says": [
        "I'm on call in case anyone overdoes it tonight.",
        "Promise you'll stay safe tonight?"
      ],
      "options": [
        {
          "text": "I promise.",
          "like": 2,
          "end": true
        },
        {
          "text": "I'll try.",
          "like": 0,
          "end": true
        },
        {
          "text": "No promises!",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_coffee_shop_m": {
      "says": [
        "Grabbing coffee before my shift. Four hours of sleep and counting.",
        "How do you take your coffee?"
      ],
      "options": [
        {
          "text": "Black and strong.",
          "like": 2,
          "end": true
        },
        {
          "text": "Lots of cream and sugar.",
          "like": 0,
          "end": true
        },
        {
          "text": "I don't drink coffee.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_coffee_shop_d": {
      "says": [
        "Double espresso. Don't judge me.",
        "How many coffees have you had today?"
      ],
      "options": [
        {
          "text": "Same as you, too many.",
          "like": 2,
          "end": true
        },
        {
          "text": "Just one.",
          "like": 0,
          "end": true
        },
        {
          "text": "Coffee is for the weak.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_coffee_shop_a": {
      "says": [
        "A post-shift pastry. My one treat.",
        "Sweet or savoury?"
      ],
      "options": [
        {
          "text": "Sweet, you deserve it.",
          "like": 2,
          "end": true
        },
        {
          "text": "Savoury.",
          "like": 0,
          "end": true
        },
        {
          "text": "I don't do treats.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_gym_m": {
      "says": [
        "Twelve-hour shifts need a strong back.",
        "Do you stretch before working out?"
      ],
      "options": [
        {
          "text": "Always.",
          "like": 2,
          "end": true
        },
        {
          "text": "Sometimes.",
          "like": 0,
          "end": true
        },
        {
          "text": "Stretching's a waste of time.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_gym_d": {
      "says": [
        "Squeezing in a workout between shifts.",
        "What's your favourite exercise?"
      ],
      "options": [
        {
          "text": "Yoga, good for recovery.",
          "like": 2,
          "end": true
        },
        {
          "text": "Running.",
          "like": 0,
          "end": true
        },
        {
          "text": "I don't exercise.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_gym_a": {
      "says": [
        "Watch your form! I see so many back injuries from bad lifting.",
        "Will you let me correct your form?"
      ],
      "options": [
        {
          "text": "Please do.",
          "like": 2,
          "end": true
        },
        {
          "text": "If you have to.",
          "like": 0,
          "end": true
        },
        {
          "text": "I know what I'm doing.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_gym_n": {
      "says": [
        "Night shift workouts. Empty gym, just how I like it.",
        "Night owl or early bird?"
      ],
      "options": [
        {
          "text": "Whatever my schedule needs.",
          "like": 2,
          "end": true
        },
        {
          "text": "Early bird.",
          "like": 0,
          "end": true
        },
        {
          "text": "I never sleep, it's overrated.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_shopping_centre_m": {
      "says": [
        "Buying new scrubs. The last pair didn't survive a bad shift.",
        "Blue or green scrubs?"
      ],
      "options": [
        {
          "text": "Blue, very calming.",
          "like": 2,
          "end": true
        },
        {
          "text": "Green.",
          "like": 0,
          "end": true
        },
        {
          "text": "Neither, they're ugly.",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_shopping_centre_d": {
      "says": [
        "Pharmacy run. We keep running out of basics.",
        "Do you keep a first aid kit at home?"
      ],
      "options": [
        {
          "text": "Yes, fully stocked.",
          "like": 2,
          "end": true
        },
        {
          "text": "Somewhere, I think.",
          "like": 0,
          "end": true
        },
        {
          "text": "What for?",
          "like": -1,
          "end": true
        }
      ]
    },
    "nurse_shopping_centre_a": {
      "says": [
        "Looking for comfy shoes. My feet are killing me.",
        "Comfort or style?"
      ],
      "options": [
        {
          "text": "Comfort, every time.",
          "like": 2,
          "end": true
        },
        {
          "text": "A bit of both.",
          "like": 0,
          "end": true
        },
        {
          "text": "Style, pain is fashion.",
          "like": -1,
          "end": true
        }
      ]
    }
  }
};

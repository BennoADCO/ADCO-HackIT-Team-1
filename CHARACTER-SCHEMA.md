# Character schema

How a character file is shaped, and how the pieces fit together. Written so
someone — or an agent — can write new scenes and new characters without
having to reverse-engineer the existing ones.

Everything in the **Schema** and **Invariants** sections was checked against
all four existing files and holds without exception. Sections marked
*Inferred* or *Undecided* are not settled by the data — read those before
generating anything.

---

## The files

One file per character, in the repository root:

```
Goth_Shaun.json          5 scenes
Lumberjack_Shaun.json   13 scenes
Nurse_Shaun.json        24 scenes
Party_Shaun.json        12 scenes
                        ──────────
                        54 scenes
```

The `_Shaun` suffix is the joke: every love interest is a Shaun. The
`character` field inside holds the short name (`"Goth"`), which is what the
rest of the data refers to.

---

## The shape

```jsonc
{
  "character": "Goth",

  // Which time slots this character can be met in, at all.
  "availability": ["N"],

  // Gifting data. Not referenced by any scene — see "Undecided".
  "favourite_items": ["Black Rose", "Skull Ring", "Eyeliner"],
  "secret_item":  { "name": "Candles", "also_liked_by": "Nurse" },
  "contested_secret_items": [
    { "name": "Black Nail Polish", "primary_character": "Party" }
  ],

  // The score each response type is worth. Identical in all four files.
  "favour_values": { "best": 2, "neutral": 0, "wrong": -1 },

  "scenes": [
    {
      "id": "goth_hospital_n",
      "location": "Hospital",
      "time": "N",
      "dialogue": "Visiting my grandmother. Hospitals at night are strangely beautiful.",
      "question": "Do you find silence comforting?",
      "responses": [
        { "text": "Yes, very.",       "type": "best",    "favour":  2 },
        { "text": "Sometimes.",       "type": "neutral", "favour":  0 },
        { "text": "No, it's creepy.", "type": "wrong",   "favour": -1 }
      ]
    }
  ]
}
```

### Field reference

| Field | Type | Meaning |
|---|---|---|
| `character` | string | Short name. Used as the key in `also_liked_by` and `primary_character`. |
| `availability` | array of time codes | The only slots this character can appear in. |
| `favourite_items` | array of 3 strings | Items they openly like. |
| `secret_item.name` | string | The item they secretly like most. |
| `secret_item.also_liked_by` | character name | The one other character who also wants it. |
| `contested_secret_items` | array of 1 | An item they like that is *really* someone else's secret. |
| `contested_secret_items[].primary_character` | character name | Who it truly belongs to. |
| `favour_values` | object | Score per response type. |
| `scenes` | array | One scene per location-and-time the character can be found in. |

### Scene fields

| Field | Type | Meaning |
|---|---|---|
| `id` | string | `character_location_time`, lowercased, spaces → underscores. |
| `location` | string | One of the eight locations. Exact casing. |
| `time` | time code | Must be one of the character's `availability` values. |
| `dialogue` | string | What they say when you walk up. One sentence or two. |
| `question` | string | What they ask you. Always ends in `?`. |
| `responses` | array of exactly 3 | Your reply options, in `best`, `neutral`, `wrong` order. |
| `responses[].text` | string | The reply as written on the button. |
| `responses[].type` | `best` \| `neutral` \| `wrong` | Which bucket it falls in. |
| `responses[].favour` | number | Must equal `favour_values[type]`. |

---

## Vocabularies

**Time codes** — four slots, in day order:

| Code | Slot |
|---|---|
| `M` | Morning |
| `D` | Daytime |
| `A` | Afternoon / evening |
| `N` | Night |

*Inferred:* the letters are never spelled out in the data. `M`/`D`/`N` are
unambiguous; `A` is read as afternoon-into-evening from its content (after
work, happy hour, pre-night-out).

**Locations** — exactly eight, spelled and cased like this:

```
Hospital            Bar        Coffee Shop
Uni Campus          Club       Gym
Construction Site              Shopping Centre
```

`Construction Site` is the tie back to the opening game, where the crane
lands on you.

---

## Invariants

Hold across all 54 scenes with zero exceptions. Anything generated must
keep them true.

1. All four files carry the **same seven top-level keys**.
2. Every scene's `time` appears in that character's `availability`.
3. Every scene has **exactly 3** responses.
4. Response order is always **`best`, `neutral`, `wrong`**.
5. `response.favour` always equals `favour_values[response.type]`
   — so `best` = +2, `neutral` = 0, `wrong` = −1.
6. `id` is always `character_location_time`, lowercased, spaces → underscores.
   `Uni Campus` + `M` + `Nurse` → `nurse_uni_campus_m`.
7. At most **one scene per character per location per time**.
8. The item graph is **fully reciprocal**: if A's `secret_item.also_liked_by`
   is B, then B's `contested_secret_items` contains that item with
   `primary_character` = A.

### The item graph as it stands

A closed four-way loop. Each character secretly wants one item, and exactly
one other character also wants it:

```
Goth  ──Candles──▶ Nurse ──Band-Aids──▶ Lumberjack
  ▲                                          │
  └──Black Nail Polish── Party ◀──Marshmallows┘
```

Read as: Candles are Goth's secret, and Nurse also wants them.

---

## How it works at runtime

*Inferred — no engine code exists for this yet.*

1. The clock sits in one of the four time slots.
2. The player picks a location on a map.
3. The game looks for a character whose `availability` includes the current
   slot **and** who has a scene for that location and slot.
4. That scene plays: `dialogue`, then `question`, then the three responses
   as buttons.
5. Picking a response adds its `favour` to that character's running score.
6. Favour presumably gates the ending, and gifting the right item presumably
   moves it too.

---

## Undecided — resolve before generating at scale

These are real gaps, not nitpicks. Each one changes what generated content
should look like.

**Items have no mechanics.** `favourite_items`, `secret_item` and
`contested_secret_items` are defined on every character but **no scene
references an item at all**. There is nothing in the data about where items
are found, how they are given, or what a gift is worth. Either scenes need a
gift-related shape, or gifting lives entirely outside the scene system.

**Characters never react to your answer.** A response has `text`, `type` and
`favour` — but no reply line. As written, you pick an answer and the
character says nothing back. Most of the warmth in this genre lives in that
reaction. Adding a `reply` string per response is a small schema change and a
large content change; decide before writing 18 more scenes, not after.

**Repeat visits are undefined.** One scene per location-and-time means going
back to the same place in the same slot replays the identical exchange, and
presumably farms favour. Needs either a "seen" flag, a repeat line, or a
rule that a scene is consumed once used.

**`favour_values` is global, not per-character.** It is byte-identical in all
four files. Today it is duplication that can silently drift; if nobody
intends per-character scoring, it belongs in one shared config.

**No sprite or portrait field.** Nothing in the file points at an image. The
agreed layout is one folder per character holding their sprite alongside
their data, so a field will be needed.

**No location backgrounds.** Only one background image exists so far
(`assets/backgrounds/shopping_Mall.png`, 1672×941), and the location list has
eight entries. Seven have no art.

---

## Content gaps

18 scenes are missing from cells that the characters' own `availability`
says should exist. `-` = outside availability, `X` = written, `.` = **gap**.

| Location | Goth `N` | Lumberjack `M` `A` | Nurse `M` `D` `A` `N` | Party `A` `N` |
|---|---|---|---|---|
| Hospital | X | X X | X X X X | X X |
| Uni Campus | X | X X | X X X X | X X |
| Construction Site | **.** | X X | X X X **.** | X **.** |
| Bar | X | **.** X | **.** **.** X X | X X |
| Club | X | **.** **.** | **.** **.** **.** X | **.** X |
| Coffee Shop | **.** | X X | X X X **.** | X **.** |
| Gym | X | X X | X X X X | X X |
| Shopping Centre | **.** | X X | X X X **.** | X **.** |

| Character | Written | Possible | Missing |
|---|---|---|---|
| Goth | 5 | 8 | 3 |
| Lumberjack | 13 | 16 | 3 |
| Nurse | 24 | 32 | 8 |
| Party | 12 | 16 | 4 |
| **Total** | **54** | **72** | **18** |

### Two structural thin spots

**Daytime is nearly empty.** Only Nurse is available in `D`. A player who
spends a daytime slot anywhere else meets nobody.

| Slot | Who is out |
|---|---|
| `M` | Lumberjack, Nurse |
| `D` | **Nurse only** |
| `A` | Lumberjack, Nurse, Party |
| `N` | Goth, Nurse, Party |

**The Club is a night-only room.** Nobody is ever there in `M`, `D` or `A`.
Filling the Club gaps above would still leave it empty for three quarters of
the day.

Both are fixable by widening someone's `availability` — but that creates new
empty cells to write, so it is a content decision, not a data fix.

---

## Writing new scenes

### Template

```jsonc
{
  "id": "<character>_<location>_<time>",
  "location": "<exact location name>",
  "time": "<M|D|A|N>",
  "dialogue": "Why they are here, in their voice. One or two sentences.",
  "question": "Something that opens a door for the player?",
  "responses": [
    { "text": "The answer this character wants.", "type": "best",    "favour":  2 },
    { "text": "A polite non-answer.",             "type": "neutral", "favour":  0 },
    { "text": "The answer that lands badly.",     "type": "wrong",   "favour": -1 }
  ]
}
```

### Rules the existing content follows

- **`dialogue` explains why they are in that place at that hour.** Nurse is
  at the Coffee Shop in `M` because she is pre-shift; in `A` because she is
  post-shift. Same room, different reason. This is what makes the grid feel
  authored rather than filled in.
- **`question` is aimed at the player**, never rhetorical, and always ends
  in `?`.
- **`best` agrees with the character's established taste** — countryside for
  Lumberjack, midnight for Goth, comfort for Nurse, "both!" for Party.
- **`wrong` is a genuine answer someone would give**, not an insult. "Top 40
  pop", "I'd rather pay someone", "Style, pain is fashion". It misses the
  character, it does not attack them.
- **`neutral` is a shrug.** "Sometimes.", "Maybe.", "Green."
- **Keep `text` short** — these are buttons. Existing replies run about 2–6
  words, with the longest at 31 characters.
- **Voice per character:** Goth is dry and withdrawn. Lumberjack is plain and
  warm. Nurse is tired, competent, dry. Party is loud and inviting.

### Checks before committing generated output

1. Valid JSON, 2-space indent.
2. `id` matches `character_location_time` exactly.
3. `time` is in `availability`.
4. Exactly 3 responses, in `best`/`neutral`/`wrong` order.
5. `favour` is +2 / 0 / −1 to match.
6. `location` spelled exactly as in the vocabulary list.
7. No duplicate `id` within the file.

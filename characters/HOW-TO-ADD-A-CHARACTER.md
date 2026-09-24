# How to add a character

No coding needed. Four steps, about five minutes.

## 1. Copy a character folder

Copy `characters/goth/` and rename it to your character, all lowercase, no spaces:

```
characters/goth/     ->   characters/dave/
        goth.js                  goth.js   ->  dave.js
```

Rename the file inside to match the folder.

## 2. Change the name at the top

Open your new `dave.js`. The first line is the only bit that isn't plain data — change `'goth'` to `'dave'`:

```js
CHARACTERS['dave'] = {
  "name": "Dave Shaun",
  "sprite": "assets/people/dave.png",
```

That id (`dave`) must match the folder name.

## 3. Tell the game they exist

Open `dating.html`, find the lines with the other characters on them, and add one underneath:

```html
<script src="characters/goth/goth.js"></script>
<script src="characters/dave/dave.js"></script>
```

**If you skip this step the character simply won't appear.** It is the most common thing to forget.

## 4. Write their dialogue

Everything else in the file is words. Change them.

Save, then press **F5** in the browser.

---

## The picture

Drop a `dave.png` into `assets/people/`, named after their id. Tall, with a see-through background, works best.

**You don't need one to start.** With no picture the game shows a grey stand-in with their initial on it, so you can write and test all the dialogue before anyone has drawn anything.

`"anchor"` decides which side of the screen they stand on: `"left"`, `"centre"` or `"right"`.

## Appearances — where and when you can meet them

`"appearances"` is the list of places they turn up, and at what time of day.

```js
"appearances": [
  { "at": "bar", "time": "N", "node": "dave_bar_n" },
  { "at": "gym", "time": "M", "node": "dave_gym_m" }
]
```

- `"at"` must be a place from `data/locations.js`.
- `"time"` is **M** morning, **D** daytime, **A** evening, or **N** night.
- `"node"` is the conversation they have in that spot — it must be one of the entries under `"nodes"`.

Each scene plays **once**. Once you've had it, they'll have something else to say next time you find them there. When you've had all of them, they stop appearing.

The clock moves on by one slot after every conversation, and wraps round from night back to morning. There's a **Wait until…** button on the map for passing the time without meeting anyone.

> **Spread them about.** If everyone is only out at night, the other three-quarters of the day is an empty map. Two people in the same place at the same hour is fine — you get asked which one to talk to.

## Nodes — what they actually say

```js
"dave_bar_n": {
  "says": [
    "Didn't expect to see you in here.",
    "What are you drinking?"
  ],
  "options": [
    { "text": "Whatever you're having.", "like": 2,  "end": true },
    { "text": "Just a water.",           "like": 0,  "end": true },
    { "text": "I'm not staying.",        "like": -1, "end": true }
  ]
}
```

The lines in `"says"` come one at a time — click, or press Space. The replies appear on the last one.

## What a reply can do

Only `text` plus either `goto` or `end` is needed. The rest are optional extras.

| Put this on a reply | What happens |
|---|---|
| `"text": "Hello"` | The words on the button |
| `"like": 2` | Warms them up. A minus number cools them off |
| `"end": true` | Ends the conversation and goes back to the map |
| `"goto": "some_node"` | Jumps to another bit of the conversation instead of ending |
| `"set": { "toldHim": true }` | Writes a note into their memory |
| `"needs": { "toldHim": true }` | Only show this reply if their memory matches |

**Four replies is the most that fits on screen.** More than that and the game will tell you.

Most scenes are three replies — a right answer worth `2`, a shrug worth `0`, and one that misses them worth `-1`. A wrong answer should be something a real person would say. It misses the character; it doesn't insult them.

## When something's wrong

The game checks every character file when it opens and lists any mistakes in a **red panel in the bottom-right corner** — naming the file and the exact line. Typos in a `node` name, a place that doesn't exist, a time that isn't M/D/A/N, two scenes in the same place at the same hour, a conversation with no way out, too many replies. It never stops the game; it just tells you.

If you get a red *"Oops - something broke"* page instead, press **F12**, click **Console**, copy the red line and paste it to Claude. That means a missing comma or a missing quote mark.

## Testing without replaying the game

Double-click `dating.html` directly. You go straight to the map — no need to play through the crane every time.

"Start again" on the map forgets everyone, resets all progress, and puts the clock back to morning.

---

## Where the Shauns came from

The four Shauns were written as `*_Shaun.json` files, which are still in this folder. Those are **no longer what the game reads** — `tools/convert-characters.js` turned them into the `.js` files described above, and those are the live ones.

Edit the `.js` files. If you edit the JSON, nothing will happen.

(A `.json` file can't be loaded by a page you opened by double-clicking — that needs a web server. A `.js` file can. That one wrapper line at the top is the whole difference.)

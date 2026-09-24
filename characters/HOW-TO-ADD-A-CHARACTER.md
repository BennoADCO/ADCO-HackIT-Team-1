# How to add a character

No coding needed. Four steps, about five minutes.

## 1. Copy Mia's folder

Copy `characters/mia/` and rename it to your character, all lowercase, no spaces:

```
characters/mia/     ->   characters/dave/
        mia.js                  mia.js   ->  dave.js
```

Rename the file inside to match the folder.

## 2. Change the name at the top

Open your new `dave.js`. The first line is the only bit that isn't plain data — change `'mia'` to `'dave'`:

```js
CHARACTERS['dave'] = {
  "name": "Dave",
  "sprite": "characters/dave/dave.png",
```

That id (`dave`) must match the folder name.

## 3. Tell the game they exist

Open `dating.html`, find the line with Mia on it, and add one underneath:

```html
<script src="characters/mia/mia.js"></script>
<script src="characters/dave/dave.js"></script>
```

**If you skip this step the character simply won't appear.** It is the most common thing to forget.

## 4. Write their dialogue

Everything else in the file is words. Change them.

Save, then press **F5** in the browser.

---

## The picture

Drop a `dave.png` into their folder. Tall, with a see-through background, works best.

**You don't need one to start.** With no picture the game shows a grey stand-in with their initial on it, so you can write and test all the dialogue before anyone has drawn anything.

`"anchor"` decides which side of the screen they stand on: `"left"`, `"centre"` or `"right"`.

## Stages — how they move about

`"stages"` is their story, a chapter at a time. Everyone starts on the first one.

```js
"stages": [
  { "at": "mall", "start": "first_meeting" },
  { "at": "park", "start": "second_time"   }
]
```

A reply marked `"advance": true` moves them to the next chapter — which is how they turn up somewhere new. Run off the end of the list and they stop appearing anywhere.

`"at"` must be a place from `data/locations.js`.

## What a reply can do

Only `text` and `goto` are needed. The rest are optional extras.

| Put this on a reply | What happens |
|---|---|
| `"text": "Hello"` | The words on the button |
| `"goto": "some_node"` | Jumps to that bit of the conversation |
| `"like": 2` | Warms them up. A minus number cools them off |
| `"set": { "toldHer": true }` | Writes a note into their memory |
| `"needs": { "toldHer": true }` | Only show this reply if their memory matches |
| `"end": true` | Ends the conversation here |
| `"advance": true` | Moves them on to their next chapter |

**Four replies is the most that fits on screen.** More than that and the game will tell you.

## When something's wrong

The game checks every character file when it opens and lists any mistakes in a **red panel in the bottom-right corner** — naming the file and the exact line. Typos in a `goto`, a place that doesn't exist, a conversation with no way out, too many replies. It never stops the game; it just tells you.

If you get a red *"Oops - something broke"* page instead, press **F12**, click **Console**, copy the red line and paste it to Claude. That means a missing comma or a missing quote mark.

## Testing without replaying the game

Double-click `dating.html` directly. You go straight to the map — no need to play through the crane every time.

"Start again" on the map forgets everyone and resets all progress.

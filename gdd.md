# Wipe Out — Game Design Doc

> One worker. One portaloo. Not nearly enough toilet paper.

This is the team's game plan. It covers everything `CLAUDE.md` asks for in `GAME-PLAN.md`, so build from this file.

## Pitch

Aliens have landed on an ADCO job site, and they want the toilet paper. You're the site worker 👷 with a limited stack of TP 🧻. Throw rolls to wrap the aliens up, lead them into wet concrete when you run dry, and hold out until midnight. Every alien you catch earns ciggies 🚬, and every 10 ciggies stack into an energy drink 🥤. You spend them in the site shed between runs so the next shift goes further.

**Genre:** roguelike-lite. Runs are short, you get one life per run, aliens and traps spawn at random, and upgrades bought between runs are permanent.

## Controls

| Key | Does |
|---|---|
| Arrow keys | Move the worker (8 directions) |
| Space | Throw a roll at the nearest alien. Tap it, or hold it to keep throwing at your throw rate. |
| Shop: ↑ ↓ | Choose an upgrade |
| Shop: Space | Buy it |
| Shop: Enter | Start the next shift |
| Shop: R then Y | Wipe all progress (for handing the laptop to someone new) |

No mouse needed.

## The first 10 seconds

1. The clock reads 6:30 am. The worker stands mid-site next to the portaloo. HUD: ⛑️⛑️⛑️ · 🧻 20 · 🥤 0 🚬 0.
2. A 👽 walks in from the edge of the screen, heading for you.
3. You press Space. A roll flies at the alien, white TP bands wrap it, and it flashes and vanishes. +1 🚬.
4. Two more aliens come in from different sides. You back away and keep throwing.
5. About 20 seconds in, a slab of wet concrete appears. An alien wanders into it and sinks. +2 🚬, because trap catches pay double.

For the rest of the run, aliens arrive faster and faster as the clock runs toward midnight and your TP runs low. When the TP is gone you can't throw any more. You survive by dodging and luring aliens into traps.

## How a run ends

- **Lose (Overwhelmed):** an alien touching you knocks off a hard hat, then you get 1.5 s of flashing invincibility. Lose your last hat and the shift is over.
- **Win (Midnight):** survive until the clock hits 12:00 am, about 7 real minutes. This should be **hard**. A fresh worker should go down before knock-off, and only a heavily upgraded one should make it to midnight.
- **Clock bonuses along the way.** Each one sounds a siren, shows a banner, pays out, and then the aliens keep coming:
  - **Smoko** at 10:30 am and 1:30 pm: "SMOKO!" and +2 🥤 each.
  - **Knock-off** at 3:30 pm: "KNOCK-OFF… nobody's coming to relieve you. OVERTIME!" and +5 🥤. It's a checkpoint, not the end.
- **Running out of TP is not death.** It's the last stand. While you're empty, traps spawn twice as often to give you a fighting chance.
- Win or lose, you go to the shop next, then start a fresh run.

## Rules

### Toilet paper (ammo)
- Every throw uses 1 roll. If there are no aliens on screen, there's no throw and no TP spent.
- Auto-aim skips any alien that rolls already in the air will finish off, and any alien already sinking in a trap, so no TP is wasted on them.
- A roll flies in a straight line at where the alien is *now*, so fast aliens can dodge. A roll that misses flies off-screen and is lost.
- You can carry up to your stash size, which starts at 20. Pickups can't take you over it.

### Wrapping
- Each hit adds wraps equal to your ply. You start at 1-ply, which is 1 wrap per hit.
- An alien shows more white bands as it fills up. Once it's fully wrapped it flashes, disappears and counts as caught.

### Getting TP back
- **Alien drops:** a caught alien may drop a TP pickup with 1–3 rolls on it. Tougher aliens drop more often and drop more rolls (see the alien table). A basic alien rarely drops anything, and never more than 1 roll.
- **Supply crate 📦:** rare, like Max Ammo in CoD Zombies. It appears at a random spot and refills your TP to full.
- Drops happen however the alien was caught: by thrown TP or by a trap.
- Pickups blink for their last 3 s, then vanish.

### Traps
Traps appear at random spots, never within 150 px of you. Each one stays for a while, then goes. Any alien that touches a trap is caught and pays **double ciggies**. Traps never hurt you.

- **Wet concrete** (Must-Have): a grey slab. Aliens that walk in get stuck and sink.
- **Open trench** (Nice-To-Have): swallows up to 3 aliens, then gets backfilled.
- **Spare portaloo** (Nice-To-Have): sucks in aliens and slams the door. Once it holds 4 it's full and disappears.

### Aliens
Every alien except the Thief walks straight at the worker. There's no clever pathfinding. Aliens come in from random screen edges. At 6:30 am one arrives every 2 s. By midnight one arrives every 0.15 s, and every alien moves 50% faster than it did at the start.

| Alien | Wraps to catch | Speed at 6:30 am (px/s) | Ciggies | TP drop chance | Rolls dropped | Arrives from |
|---|---|---|---|---|---|---|
| 👽 Grunt | 1 | 70 | 1 | 8% | 1 | 6:30 am (Must-Have) |
| 👾 Zoomer | 1 | 150 | 2 | 5% | 1 | 9:00 am |
| 🐙 Chonker | 5 | 40 | 5 | 60% | 1–3 | 12:00 pm |
| 🦑 TP Thief | 2 | 110 | 3 | 25% | 1, plus everything it stole | 3:30 pm (knock-off) |

The TP Thief ignores you. It runs for the nearest roll or crate on the ground and eats it. Wrap the Thief and it coughs everything back up.

### Currency and the site shed (the shop)
- **One currency, two sizes.** You earn ciggies 🚬, and every 10 ciggies show as an energy drink 🥤. This is for show only: the game keeps a single ciggie count, so 37 ciggies displays as 🥤 3 🚬 7, and prices display the same way.
- Earned for each alien caught (see the alien table). Trap catches pay double. Each smoko (10:30 am, 1:30 pm) adds 2 🥤, knock-off (3:30 pm) adds 5 🥤, and midnight adds 20 🥤.
- Your currency and upgrades carry over between runs. They're saved in the browser, so they survive closing the page. If the browser blocks saving, progress lasts until the tab is closed and the game still plays.
- The cost of an upgrade level is its base cost × the level you're buying.

| Upgrade | Effect per level | Range | Base cost |
|---|---|---|---|
| 🧻 Bigger TP stash | +5 rolls, to start with and to carry | 20 → 70 | 🥤 1 🚬 5 |
| ⛑️ Extra hard hat | +1 hat | 3 → 6 | 🥤 4 |
| 🥾 Steel-cap sprint | +10% move speed | up to +50% | 🥤 2 |
| 🧻 Ply | +1 wrap per hit | 1-ply → 10-ply | 🥤 2 🚬 5 |
| 💪 Throw speed | −0.05 s between throws | 0.5 s → 0.15 s | 🥤 2 |

## Screens

- **Menu:** the title, a one-line story ("Survive until midnight"), the controls, and "Press Space to start".
- **Playing:** the site, plus a top bar showing hard hats, TP count, 🥤/🚬 earned this shift, and the clock. At 0 TP the counter flashes red with "OUT OF TP: use the traps!"
- **Shift over:** the heading is "OVERWHELMED" or "MIDNIGHT! YOU MADE IT". Shows the clock time you reached, aliens caught and 🥤/🚬 earned. Space goes to the shop.
- **Site shed (the shop):** your 🥤/🚬 balance and the upgrade list, with each upgrade's current level and next cost ("MAX" when it's fully upgraded). Enter starts the next shift.

## Look and feel

- Everything alive or collectable is an emoji: 👷 worker, 👽👾🐙🦑 aliens, 🧻 rolls, 📦 crate, 🚬 ciggies, 🥤 energy drinks.
- Everything else is canvas shapes: dirt-brown ground, grey concrete slabs, dark trenches, little yellow hard hats in the HUD, and white TP bands on aliens.
- Scenery (🏗️ crane, 🚧 barriers, 🧱 bricks, 🚽 portaloo) is decoration only. Nothing blocks movement.
- Tone: daft, not gross. The jokes are about toilet paper, not what it's for.

## Must-Have: the smallest real version

Build these in order. The game must be playable after every step.

1. The site is drawn, the worker moves with the arrow keys, and the worker can't leave the screen.
2. 👽 Grunts spawn at the edges, walk at you, and get faster and more frequent as the clock runs.
3. Space throws a roll at the nearest alien and uses 1 TP. Wraps fill up, then the alien flashes and is gone.
4. The HUD shows TP, 🥤/🚬 and the clock. Grunts sometimes drop a roll.
5. 3 hard hats, the invincibility flash, and the "Overwhelmed" screen. The smoko and knock-off banners and bonuses. Midnight shows the win screen. You can restart.
6. The wet concrete trap, including faster trap spawns while you're out of TP.
7. The shop with all 5 upgrades, saved between runs, plus the R-then-Y reset.

## Nice-To-Have, in this order

1. Supply crate 📦. It's small because it reuses the pickup code.
2. Sound effects, generated by the browser (no audio files): throw whoosh, wrap splat, hard-hat bonk, pickup ding, smoko/knock-off siren, midnight bell.
3. Juice: screen shake when you lose a hat, TP streamer trails, hit flashes, and a burst of TP squares when an alien is caught.
4. Night falls: the site slowly darkens from 6 pm, which makes late aliens harder to spot (but everything stays readable).
5. 👾 Zoomer and 🐙 Chonker.
6. The open trench trap.
7. The spare portaloo trap.
8. 🦑 TP Thief. This needs pickups and crates to exist first.

## Not Today

These are named here so nobody is waiting for them:
- Mid-run level-up picks. The shop replaces them.
- A mothership boss, a UFO alien that beams in more aliens, and a crane-drop trap.
- Endless mode after midnight.
- Two players.
- Mouse aiming.
- Multiple sites or levels, online leaderboards, and real art or music files.

## Starting tuning numbers (these all go in `js/config.js`)

**Tuning target:** a fresh worker goes down before knock-off, and a fully upgraded worker only *just* makes midnight.

| Setting | Start value |
|---|---|
| Worker speed | 220 px/s |
| Starting TP / stash size | 20 |
| Time between throws | 0.5 s |
| Roll flight speed | 600 px/s |
| Hard hats | 3 |
| Invincibility after a hit | 1.5 s |
| Run length | 420 s. The clock runs 6:30 am → midnight at 2.5 clock-minutes per real second, so knock-off lands about 3.5 minutes in. |
| Alien spawn interval | 2.0 s → 0.15 s by midnight |
| Alien speed multiplier | ×1.0 → ×1.5 by midnight |
| Wet concrete | every 15–25 s (half that while out of TP), lasts 12 s, max 2 on screen, 140 × 90 px |
| Supply crate | every 45–75 s, lasts 10 s |
| Pickup lifetime | 10 s |
| Trap catch multiplier | ×2 |
| Ciggies per energy drink | 10 |
| Smoko bonus (10:30 am, 1:30 pm) | 2 🥤 (20 🚬) each |
| Knock-off bonus (3:30 pm) | 5 🥤 (50 🚬) |
| Midnight bonus | 20 🥤 (200 🚬) |
| Hitboxes | 75% of visual size |

# Reference Games (Touchstones)

Games we deliberately learn from. These are *spirit* references, not things to
copy. Sandbox Moto is its own thing — toy dirt bikes brought to life in a
backyard sandbox — but these games have already solved feelings we want.

See also `docs/BEHAVIOR_SPEC.md` (how the game should *act*) and
`docs/visual_style_guide.md` (how it should *look*).

---

## Sandcastle — the primary touchstone

- **Developer:** Fabien Weibel / Bubblebird Studio (solo, Luxembourg; also made *Haven Park*).
- **Steam:** app `3216520` (full game, "Coming soon"); demo `4894830`.
- **Reception:** ~165,000 wishlists before the first demo; demo **Very Positive**
  (~95% of 262 reviews). Launched the demo Aug 6.
- **What it is:** a cozy, physics-based **sandcastle builder** on a sun-warmed
  tropical beach. Gather wet sand, raise towers and walls, carve battlements,
  dig moats to divert or hold back the tide. "Plastic buckets and shovels, just
  like in childhood."

### Why it is our touchstone

It is the closest existing game to our North Star feeling: **hands in the sand,
building something with childhood toys, with no pressure.** A director reference
clip of Sandcastle is what prompted this whole direction ("the game should act
like this").

### What we take from it

| Sandcastle quality | What we do with it |
| --- | --- |
| Plastic buckets & shovels, childhood framing | This *is* our North Star — reinforce it, don't chase realism. |
| **Touchable, physical sand** + satisfying sand/water audio | Our biggest fidelity gap. Raked/combed sand (issue #33), sculpted (not blobby) dirt features, and sand SFX (`docs/AUDIO_BIBLE.md`). |
| Warm, sun-lit palette; soft shadows; miniature diorama | Already our visual target — keep pushing warmth and softness. |
| **No timers, no score, no fail state** in building | Our building phase must feel this unhurried. Behavior rule B4. |
| Slow tide; the world drifts and breathes | Our **living camera** (behavior rules B1/B2). |
| Pick a beach layout; day/night; vegetation; buried treasures | Maps to our memory locations, day/night, props, and toy-box unlocks (roadmap V4/V3). |

### Where we deliberately diverge

Sandcastle is pure zen — there is no "win," only building. **Our differentiator
is the race:** Build → Watch → Imagine → Adjust → Race Again → One More Race.
The lesson is not to remove the race, but to make everything *before* the race
feel as calm and tactile as Sandcastle's entire game. The race is the payoff for
a cozy build, not a source of pressure during it.

---

## Secondary references (by spirit)

- **Tiny Glade** — relaxing, low-pressure shaping; build for the joy of it, no fail state.
- **Mini Motorways** — clean, friendly tool bubbles; everything editable and forgiving.
- **Handmade miniature dioramas** — staging, scale, and the "toys on a table" read.

---

## Graphics target derived from Sandcastle

Concrete bar for the art pass (tracked against `web/game.js` and the Godot build):

1. **Dirt features must read as *sculpted*, not as blobs.** Jumps have a
   recognizable silhouette — a takeoff face, a rounded lip, a landing slope.
   A single is a kicker; a double/triple is takeoff-plus-landing(s); a tabletop
   is a flat-topped ramp; a berm is a *banked wall*, not a ring of lumps.
2. **Sand reads as touchable** — warm golden grain, soft raked grooves, gentle
   ambient shading, not a flat tinted plane.
3. **Warm, soft light.** Golden key light, soft shadows, no gritty contrast.
4. **Toy-plastic objects** stay chunky and glossy; dirt stays matte and soft.
5. **Played-in wear** accumulates (ruts, worn lips, roost) so an afternoon of
   play shows in the sand.

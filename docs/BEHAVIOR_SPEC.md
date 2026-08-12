# Game Behavior Spec

This document captures how Sandbox Moto should *behave and feel*, distinct from
what it contains. It exists to answer one recurring instruction from the
director: **"the game should act like this."**

It is the reference-video contract. When a reference clip is shared, the
behavior it demonstrates gets distilled here as a small set of observable,
testable rules, so the feeling survives past the moment the clip is watched.

If this spec and the code disagree, this spec wins (per `CLAUDE.md`). If this
spec and another design doc disagree on *behavior*, the more specific behavior
rule here wins; on *intent*, the design bible wins.

---

## Reference: the cozy sandbox diorama clip

The originating reference is a 9-second portrait clip of a cozy top-down
sandbox game ("free demo out now on steam!"). What matters is not its art —
ours is deliberately toy-like, not photoreal (see `docs/ART_BIBLE.md`) — but
how it *moves and feels*:

- A high, gently-angled camera looking down into a hand-made diorama.
- The camera is **never still**. It slowly drifts, breathes, and eases across
  the scene, the way you'd circle a sandbox on your knees to admire what you
  built. Nothing is being "operated"; the world is simply alive.
- The opening frame is **raked sand** — long, soft grooves combed through the
  dirt. The surface reads as *touchable*.
- Water, coral, and plants drift past as the view eases along. The pace is
  calm. Nothing demands input. It invites lingering.

The instruction "the game should act like this" is, first and foremost, about
**motion and calm**, not about coral reefs.

---

## Behavior rules

### B1 — The camera is alive at rest (implemented)

When the player's hands are still, the sandbox breathes. The camera performs a
slow, imperfect, looping drift: a gentle sway around the sandbox, a shallow
breathing zoom, a small target drift, and a faint tilt. Periods are long
(≈25–70s) and amplitudes are small. The result should read as *kneeling beside
a living diorama*, never as an orbiting showroom turntable.

- It **hushes instantly** the moment the player touches the sandbox (draw,
  place, pan, zoom, or hover). The world holds still while hands are working.
- It **eases back in** after a short beat of stillness (~0.9s), ramping over a
  couple of seconds via a smoothstep. It never snaps on.
- Direct manipulation stays crisp: panning and drawing track the pointer 1:1,
  with no drift fighting the input.

Implemented in `web/game.js` (`updateCameraFrame`, `pokeCamera`, `applyCamera`).

### B2 — The race camera gently frames the toys (implemented)

During a race the camera softly follows the pack: it eases its focus toward the
riders' centroid and leans back a touch for readability. It is a *cozy* follow,
not a broadcast chase or a realistic replay cam (see `docs/CAMERA_DESIGN.md`).
Control returns to the player's framing when the race ends.

### B3 — Building feels tactile (partially implemented)

Placing and shaping should feel like hands in dirt: translucent snapped
previews, then a quick hand/shovel/dozer animation, and played-in wear left
behind. This already exists for placement; the surface itself does not yet read
as *combed* the way the reference's raked sand does — see Open Gaps.

### B4 — Stillness is a feature, not empty time

The loop is Build → Watch → Imagine → Adjust → Race Again → One More Race. The
quiet between actions is where imagination happens. The game must never fill
that silence with nagging UI, timers, or motion that demands a response. The
living camera (B1) is the *only* thing allowed to move during stillness, and it
moves gently.

---

## Acceptance criteria

A build "acts like the reference" when:

1. Left untouched for ~3 seconds, the rendered view visibly and continuously
   changes on its own, slowly. (Verified in the prototype: two idle frames
   captured 2.6s apart differ.)
2. On the first pointer interaction, that drift stops within one frame.
3. Panning and drawing follow the pointer with no perceptible lag or fight.
4. During a race, the camera keeps the moving pack comfortably in view without
   whipping or snapping.
5. Nothing in the idle state blinks, counts down, or otherwise pressures the
   player to act.

---

## Open gaps (tracked as follow-up work)

These are reference qualities we do **not** yet meet. They are art/technical
follow-ups, filed as GitHub issues rather than silently deferred:

- **Raked / combed sand surface.** The reference's signature opening is grooved
  sand. Our sand is flat textured dirt. Add soft rake grooves (and ideally let
  building comb the surface) to make it read as touchable. (B3)
- **Living environment ambience.** The reference eases past water, coral, and
  plants. Version 4 of the roadmap already calls for butterflies, leaves, wind,
  moving grass, and cloud shadows; the living camera is the first piece of that
  "sandbox feels alive" polish.

See `docs/roadmap.md` (Version 4 living-sandbox polish) and
`docs/CAMERA_DESIGN.md` (Idle Life).

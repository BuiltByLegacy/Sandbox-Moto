# Camera Design

The camera should feel like the player is kneeling beside a sandbox.

## Principles

- Use a slightly angled perspective to show miniature depth.
- Preserve tiny scale.
- Zoom in for tactile building and hand/tool animations.
- Zoom out for track readability and toy-race storytelling.
- Occasionally reveal the larger context: sandbox edge, garage floor, living room rug, pit area, or tailgate.

## Emotional Reveal

One signature moment is a zoom-out that reveals the whole race is inside a sandbox. This should feel warm and nostalgic, not like a joke. It reminds the player that the race is imagined.

## Idle Life

Even when the player's hands are still, the camera is never dead-static. It
breathes: a slow, imperfect, looping drift — a gentle sway around the sandbox, a
shallow breathing zoom, a small target drift, and a faint tilt — with long
periods (≈25–70s) and small amplitudes. This should feel like kneeling beside a
living diorama and slowly admiring it, not like an orbiting showroom turntable.

The drift hushes the instant the player touches the sandbox (draw, place, pan,
zoom, or hover) so building always feels crisp and direct, and eases back in
after a short beat of stillness. Stillness is a feature, not empty time; the
living camera is the only thing allowed to move while the player is thinking.

Implemented in the browser prototype (`web/game.js`). See the behavior contract
and acceptance criteria in `docs/BEHAVIOR_SPEC.md`.

## Race Camera

Race camera movement should be gentle and readable. It should make toy bikes feel alive without becoming a broadcast camera or realistic racing replay. During a race the camera softly follows the pack's center and leans back a touch for readability, then returns the framing to the player when the race ends.


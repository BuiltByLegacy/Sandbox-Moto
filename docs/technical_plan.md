# Sandbox Moto Technical Plan

## Browser Prototype Delivery

The dependency-free prototype in `web/` is deployed through `.github/workflows/deploy-pages.yml`. GitHub Pages publishes only that folder from `main`, keeping the browser build isolated from Godot source and documentation. The canonical playable URL is `https://builtbylegacy.github.io/Sandbox-Moto/`.

## Target

- Engine: Godot 4.x
- Language: GDScript
- Scene style: simple Node2D prototype first, expandable into richer 2D or 2.5D diorama systems later.

## Current Architecture

### MainGame.gd

Owns the high-level mode loop:

- Play Time / build-state editing.
- Race mode.
- Race completion.
- Feedback display.
- Return to Play Time.

It connects the tool panel, track builder, rider spawning, and feedback system.

### ToolPanel.gd

Creates simple placeholder buttons for tools:

- Track drawing.
- Start and finish placement.
- Obstacle placement.
- Race launch.

Future work can replace this with Mini Motorways-style tool bubbles, icons, and radial/subtool behavior.

### TrackBuilder.gd

Handles direct player editing:

- Smooth free-draw path.
- Start gate placement.
- Finish marker placement.
- Obstacle placement.
- Obstacle move (grab/drag/drop) and single pick-up, with hover ring, undo, and toy dents in the sand.
- Track and obstacle rendering.

The prototype intentionally avoids a blocky grid track system. Free-draw smooth track behavior should be preserved until there is a stronger terrain editing reason to change it.

### Obstacle.gd

Stores obstacle type and provides placeholder visuals. It also exposes race metadata used by riders.

Future terrain/art systems should replace placeholder drawing with actual handmade mound, rut, berm, sand, and toy-prop visuals.

### ToyRider.gd

Moves a tiny toy rider along the track:

- Smooth path following.
- Stable lane offset.
- Start skill affects holeshot.
- Skill profiles influence obstacle outcomes.
- Jump outcomes can be clear, roll, or crash.
- Airborne riders draw above obstacles.
- Toy animation per the toy bike bible: riding bob, consistency wobble, takeoff wheelie, whole-bike air tilt (nose up then nose down), landing squash bounce, roost/sand puffs, crash dust, and a soft airborne shadow. All hand-drawn dictionary particles (capped), applied through the draw transform - no physics or GPU particles.

The current implementation is intentionally toy-like rather than physically realistic.

### FeedbackSystem.gd

Displays cozy imagination feedback. It should stay qualitative and playful rather than analytical. Also provides `show_whisper()` for tiny self-fading corner notes (used by autosave).

### TrackNamer.gd and TrackNameplate.gd

Kid-style track naming, the first Memory Book piece:

- `TrackNamer` (RefCounted, static) suggests names from what is on the track - content-gated specials like "The Impossible Triple" only appear when the feature exists. Also owns `clean_name()` sanitizing (trim, 28-char cap, non-strings become empty).
- `TrackNameplate` (CanvasLayer) shows the editable name centered above the sandbox with a New Name button. Camera key input is disabled while typing.
- Names persist through the save schema's `track_name` field and caption photo mode Polaroids.

### SandboxSave.gd

Persists the player's sandbox to `user://sandbox_save.json` so leaving the game feels like leaving toys out overnight:

- Debounced autosave driven by `TrackBuilder.track_changed`.
- Save on window close, flush after each race, paused during races.
- Versioned, validated JSON; malformed or newer files fall back to a fresh sandbox without crashing.
- Serialization stays out of UI code: SandboxSave owns file IO and the schema, TrackBuilder owns `get_save_state()` / `apply_save_state()` / `clear_all()`.

See `docs/SAVE_SYSTEM.md` for the schema, save location, and safety rules.

## Layering Rules

The prototype should preserve these visual priorities:

- Track at bottom.
- Grounded riders above track.
- Obstacles above grounded riders where useful.
- Airborne rider above obstacle.

## Next Implementation Steps

1. ~~Add editable obstacle movement and deletion.~~ Done: Hand / Move and Pick Up tools in `TrackBuilder.gd`.
2. Add path smoothing controls and track width visualization.
3. Add simple berm placement and feedback.
4. ~~Add richer toy rider animation: wobble, tiny roost puffs, happy landings.~~ Done in `ToyRider.gd`.
5. ~~Add save/load for created tracks.~~ Done: `SandboxSave.gd`, see `docs/SAVE_SYSTEM.md`.
6. Replace placeholder colors with handmade art assets.
7. Add environmental toy props: bucket, shovel, cones, grass blades, fence, toy pits.
8. Add a lightweight camera pan/zoom tool.
9. Add input affordances for gamepad and touch.
10. Wire the headless tests in `tests/` into CI when the project gains it.

## Headless Tests

Run from the project root with the Godot binary:

- `godot --headless --path . --script res://tests/save_load_smoke.gd` - save/load unit coverage: roundtrip of every obstacle type, missing/empty/malformed/newer-version files, partial corruption, clear.
- `godot --headless --path . --script res://tests/reload_integration.gd` - boots the real Main scene twice and confirms a built sandbox reloads into quiet Play Time with no riders.
- `godot --headless --path . --script res://tests/obstacle_edit_smoke.gd` - move/pick-up coverage: grab, drag, drop, missed grabs, undo for both actions, dents, and freed-node safety.
- `godot --headless --path . --script res://tests/rider_animation_smoke.gd` - rider animation state machine: takeoff/flight/landing, roost, puff cap and fade, crash dust, and that riders still finish races.
- `godot --headless --path . --script res://tests/track_name_smoke.gd` - track names: generator content rules, sanitizing, save-file roundtrip, and the name surviving a full scene restart.

Both exit non-zero on failure. Note for future tests: in `--script` mode `_ready` only fires once the main loop runs, so tests that instance scenes must `await process_frame`, and standalone scripts cannot use `class_name` types (no global class cache).

## Technical Constraints

- Keep code simple and readable.
- Keep names and skills independently randomized every race.
- Keep track drawing smooth.
- Avoid overbuilding simulation systems before the build/race/adjust loop is fun.
- Use Play Time as the player-facing name for building/editing, even if code still uses build-state names internally.
- Prefer data-driven obstacle metadata so future obstacle types are easy to add.

# Sandbox Moto Technical Plan

## Architecture Decision

The canonical shipping runtime for Steam is **Godot 4 in 3D**. See `docs/ADR_001_CANONICAL_3D_RUNTIME.md`.

The Three.js browser prototype remains a rapid visual/interaction lab and executable reference. It is not a second production client. Successful browser interactions should migrate into Godot 3D as playable vertical slices.

The existing Godot Node2D systems remain useful gameplay/reference implementations during migration, but they must not constrain the final terrain, camera, tool, or toy-bike architecture.

## Browser Prototype Delivery

The browser prototype in `web/` is deployed through `.github/workflows/deploy-pages.yml`. It uses Three.js from a pinned CDN module to render a true 3D sandbox diorama, toy bikes, track geometry, obstacles, props, lighting, and shadows. GitHub Pages publishes only that folder from `main`. The canonical playable URL is `https://builtbylegacy.github.io/Sandbox-Moto/`.

Browser placement samples the Catmull-Rom track curve, projects each placed feature to its nearest point, and derives yaw from the local tangent. Gate yaw is offset 90 degrees to span the track. Undo snapshots persist snapped position and rotation together.

## Production Target

- Engine: Godot 4.x.
- Language: GDScript.
- Scene style: miniature 3D sandbox diorama.
- Terrain direction: localized deformable heightfield/deformable surface first; only escalate to voxels if a proven gameplay requirement demands it.
- Camera: controlled perspective diorama camera that feels like kneeling beside the sandbox.
- Steam launch: Windows PC first, with scalability and input decisions that keep Steam Deck compatibility viable later.

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

This is a legacy/reference implementation. The production 3D tool flow is governed by #29 and #30: a compact tactile tool tray with physical in-world tools and miniature machinery.

### TrackBuilder.gd

Handles direct player editing:

- Smooth free-draw path.
- Start gate placement.
- Finish marker placement.
- Obstacle placement.
- Obstacle move (grab/drag/drop) and single pick-up, with hover ring, undo, and toy dents in the sand.
- Track and obstacle rendering.

The smooth free-draw system remains useful as a route-definition reference, but production 3D terrain sculpting should not be limited to a painted 2D path. Issue #32 owns the physical player-facing route-definition workflow; the hidden implementation may still use a smoothed centerline/corridor.

### Obstacle.gd

Stores obstacle type and provides placeholder visuals. It also exposes race metadata used by riders.

Production 3D should progressively replace placeholder obstacle labels with shapes recognized from terrain where practical (#41), while retaining placed toy objects where that is more readable or playful.

### ToyRider.gd

Moves a tiny toy rider along the track:

- Smooth path following.
- Stable lane offset.
- Start skill affects holeshot.
- Skill profiles influence obstacle outcomes.
- Jump outcomes can be clear, roll, or crash.
- Airborne riders draw above obstacles.
- Toy animation per the toy bike bible: riding bob, consistency wobble, takeoff wheelie, whole-bike air tilt (nose up then nose down), landing squash bounce, roost/sand puffs, crash dust, and a soft airborne shadow.

The production 3D migration should preserve these readable toy behaviors while moving them onto a 3D sampled course and improved pack/racing intelligence (#40).

### FeedbackSystem.gd

Displays cozy imagination feedback. It should stay qualitative and playful rather than analytical. Also provides `show_whisper()` for tiny self-fading corner notes (used by autosave).

Issue #39 expands this into an Emergent Race Story Engine that converts race events into memorable childhood stories rather than statistics.

### TrackNamer.gd and TrackNameplate.gd

Kid-style track naming, the first Memory Book piece:

- `TrackNamer` suggests names from what is on the track.
- `TrackNameplate` shows the editable name and New Name affordance.
- Names persist through the save schema and caption photo-mode Polaroids.

### SandboxSave.gd

Persists the player's sandbox to `user://sandbox_save.json` so leaving the game feels like leaving toys out overnight:

- Debounced autosave driven by `TrackBuilder.track_changed`.
- Save on window close, flush after each race, paused during races.
- Versioned, validated JSON; malformed or newer files fall back to a fresh sandbox without crashing.
- Serialization stays out of UI code.

The 3D migration must evolve this schema rather than replacing it casually. Future versions should separate world identity, terrain deformation/state, rideable route/corridor data, placed toys/markers, dirt material state, and Memory Book/collection references.

See `docs/SAVE_SYSTEM.md` for the current schema and `docs/ADR_001_CANONICAL_3D_RUNTIME.md` for the migration direction.

## Production 3D Core Contracts

### Terrain

The canonical terrain model should support localized edits and layered state:

- height/elevation;
- material preset;
- moisture;
- compaction/looseness;
- wear/rut state;
- recognized feature metadata;
- edit-region invalidation for route validation and save updates.

### Rideable Course

The player should never need to edit splines directly. Internally, the course may use a smoothed centerline/corridor that:

- samples actual terrain elevation;
- exposes local slope, width, surface state, and feature metadata;
- supports multiple racing lines within a corridor;
- updates locally after terrain edits;
- integrates with #36 playability validation.

### Validation

Issue #36 defines hard-invalid versus difficult-but-playable terrain. Validation must return structured reasons plus world-space problem locations so the UI can show playful in-world guidance instead of technical dialogs.

### Race Events

Race systems should emit reusable structured events for #39, including starts, passes, lead changes, battles, feature attempts, crashes, recoveries, and finishes.

## Layering / 3D Readability Rules

- Terrain is the base world.
- Grounded toy riders must remain readable against dirt and props.
- Physical obstacles/props should occlude riders naturally where appropriate.
- Airborne riders should remain visually readable through camera, shadows, and silhouette rather than arbitrary 2D z-index tricks.
- Tool previews should clearly separate editable terrain from decorative props.

## Execution Wave

Work in this order so dependent systems share one architecture:

1. **#35 Canonical 3D Runtime and Godot Migration Strategy** — architecture decision complete with ADR-001.
2. **#36 Automated Playability Validation** — establish course validity contract.
3. **#31 / #32 Heavy Equipment + Rideable Course Definition** — first physical sculpt/build/race vertical slice.
4. **#37 / #48 Living Dirt + Physical Dirt Transfer** — shared terrain state and material movement.
5. **#38 / #43 / #49 Watering + Track Repair + Edit History** — between-race prep and forgiving iteration.
6. **#40 / #39 / #41 Racecraft + Story Engine + Feature Discovery** — deepen watch-phase and feedback.
7. **#42 / #44 / #45 / #46 / #47 Emotional/world-depth systems** — imagination events, toy attachment, time/weather, spectators/scale cues, and make-believe scenarios.

## First 3D Migration Vertical Slice

The first production migration slice should prove all of the following together:

1. A Godot 3D sandbox scene exists with the target diorama camera.
2. A small terrain region can be raised/lowered locally.
3. A hidden rideable route samples that terrain.
4. The validator can report one invalid local slope/width condition.
5. At least one toy rider can traverse the valid route.
6. Save/load restores the edited terrain and route state.
7. The player can return to Play Time and edit the same section again.

This slice should be completed before treating the larger heavy-equipment or living-dirt epics as production-complete.

## Performance Targets

Initial targets:

- 60 FPS at 1080p on a representative mid-range Windows gaming PC.
- At least 8 toy riders in the first Steam target.
- Local terrain updates rather than whole-sandbox rebuilds every frame.
- Scalable shadows, particles, terrain detail, and ambient props.
- Steam Deck compatibility is later, but controller input and scalable rendering must not be designed out.

## Headless / Automated Tests

Current Godot tests:

- `godot --headless --path . --script res://tests/save_load_smoke.gd`
- `godot --headless --path . --script res://tests/reload_integration.gd`
- `godot --headless --path . --script res://tests/obstacle_edit_smoke.gd`
- `godot --headless --path . --script res://tests/rider_animation_smoke.gd`
- `godot --headless --path . --script res://tests/track_name_smoke.gd`

Current browser tests:

- `npm run test:web`

Future tests should add course validation, terrain edit serialization, mixed undo/redo, race-event/story patterns, and migration-scene smoke coverage.

## Technical Constraints

- Keep code simple and readable.
- Keep names and temporary skills independently randomized every race.
- Preserve the Build → Race → Feedback → Adjust → One More Race loop during migration.
- Avoid overbuilding simulation systems before tactile editing and watching are fun.
- Use Play Time as the player-facing name for building/editing.
- Prefer data-driven obstacle/feature metadata.
- If an action can be represented as physical interaction with the sandbox, prefer that over a conventional editor dialog.

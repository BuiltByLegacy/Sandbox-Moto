# Sandbox Moto Technical Plan

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

The current implementation is intentionally toy-like rather than physically realistic.

### FeedbackSystem.gd

Displays cozy imagination feedback. It should stay qualitative and playful rather than analytical.

## Layering Rules

The prototype should preserve these visual priorities:

- Track at bottom.
- Grounded riders above track.
- Obstacles above grounded riders where useful.
- Airborne rider above obstacle.

## Next Implementation Steps

1. Add editable obstacle movement and deletion.
2. Add path smoothing controls and track width visualization.
3. Add simple berm placement and feedback.
4. Add richer toy rider animation: wobble, tiny roost puffs, happy landings.
5. Add save/load for created tracks.
6. Replace placeholder colors with handmade art assets.
7. Add environmental toy props: bucket, shovel, cones, grass blades, fence, toy pits.
8. Add a lightweight camera pan/zoom tool.
9. Add input affordances for gamepad and touch.
10. Add automated Godot scene smoke test if the project gains CI.

## Technical Constraints

- Keep code simple and readable.
- Keep names and skills independently randomized every race.
- Keep track drawing smooth.
- Avoid overbuilding simulation systems before the build/race/adjust loop is fun.
- Use Play Time as the player-facing name for building/editing, even if code still uses build-state names internally.
- Prefer data-driven obstacle metadata so future obstacle types are easy to add.

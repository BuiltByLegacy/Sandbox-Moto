# Sandbox Moto

Sandbox Moto is a cozy, nostalgic motocross sandbox game about building tiny toy tracks in warm sand and watching imaginary riders race them.

> Remember when every pile of dirt became a motocross track?

This first commit is a clean Godot 4.x prototype. It is not a pro racing simulator, a business sim, or a realistic physics project. The goal is childhood motocross imagination: build a smooth track, drop in toy-scale obstacles, press Play Race, then adjust the track and run it again.

## Design Pillars

1. Nostalgia first.
2. Building is the main mechanic.
3. Racing validates the player's track.
4. No pressure, no game over.
5. The player is not a promoter; they are a kid imagining races.
6. The world should feel tiny, handmade, and playful.

## Prototype Features

- Warm sand/dirt play area.
- Left-side tool panel with placeholder track-building buttons.
- Free-draw smooth track path.
- Start gate and finish placement.
- Placeable obstacle types: single, double, triple, tabletop, whoops, sand, rollers, hill, and dozer.
- Play Race button spawns tiny toy riders.
- Riders get random names, numbers, colors, and skill profiles every race.
- Larger jumps use simple risk/reward logic: skilled riders clear more often, cautious riders roll, aggressive low-skill riders may crash.
- After each race, imagination-style feedback bubbles appear.
- The game returns to build mode so the player can adjust and race again.

## How To Run

1. Install Godot 4.x.
2. Open this folder as a Godot project.
3. Run the main scene at `scenes/Main.tscn`.

The project is intentionally simple and uses placeholder `Node2D`, `Line2D`, and UI visuals. Future art, terrain, and diorama systems should replace the placeholders without changing the high-level loop.

## Project Structure

- `project.godot` - Godot project configuration.
- `scenes/Main.tscn` - Main playable prototype scene.
- `scripts/MainGame.gd` - Build/race mode coordination.
- `scripts/TrackBuilder.gd` - Smooth track drawing, start/finish placement, and obstacles.
- `scripts/ToyRider.gd` - Toy-bike path following and obstacle outcomes.
- `scripts/Obstacle.gd` - Placeholder obstacle visuals and metadata.
- `scripts/ToolPanel.gd` - Tool selection UI.
- `scripts/FeedbackSystem.gd` - Imagination-style feedback bubbles.
- `docs/game_design.md` - Full design vision.
- `docs/technical_plan.md` - Architecture and next implementation steps.


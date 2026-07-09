# Sandbox Moto

Sandbox Moto is a cozy nostalgic motocross sandbox game about building tiny tracks in warm sand, then watching toy dirt bikes come alive through imagination.

Tagline options:

- Remember when every pile of dirt became a motocross track?
- Build the tracks you imagined as a kid.
- Every pile of dirt was a Supercross track.

## Creative North Star

Sandbox Moto should feel like being a kid again, kneeling beside a sandbox, dirt pile, or motocross pit area, building tiny motocross tracks with toy bikes and imagination.

The player is not explicitly told they are a kid, but the game should quietly make them feel like one. They build tracks, watch toy riders come alive, imagine stories, fix jumps, change berms, re-race, and keep playing because they want to build one cooler track.

## What This Is

- A cozy sandbox track-building game.
- A toy motocross imagination game.
- A warm handcrafted diorama.
- A loop of building, racing, imagining feedback, adjusting, and racing again.

## What This Is Not

- Not a racing simulator.
- Not primarily a track manager.
- Not about money, business, or pro racing.
- Not gritty realistic motocross.
- Not serious telemetry or performance analytics.

## Core Loop

Build -> Race -> Imagine Feedback -> Adjust -> Race Again

## Design Pillars

1. Nostalgia first.
2. Building is the main mechanic.
3. Racing validates the track.
4. The riders are toy bikes brought to life by imagination.
5. No pressure, no game over.
6. The world should feel tiny, warm, handmade, and playful.
7. Feedback should feel like imagination, not analytics.

## Current Prototype

The current Godot prototype includes:

- Warm sand/dirt play area.
- Smooth free-draw track path.
- Start gate and finish placement.
- Placeholder obstacle tools.
- Play Race button.
- Random toy riders with names, numbers, colors, and temporary skills.
- Simple obstacle risk/reward.
- Imagination-style feedback bubbles.

Important implementation note: keep the current free-draw smooth track system as the baseline for now. Do not switch back to a blocky grid system. If grid logic is introduced later, it should only guide editing while visuals remain smooth and natural.

## How To Run

1. Install Godot 4.x.
2. Open this folder as a Godot project.
3. Run `scenes/Main.tscn`.

## Key Docs

- `VISION.md` - Emotional north star.
- `docs/game_design.md` - Full creative direction.
- `docs/visual_style_guide.md` - Sandcastle-like visual target.
- `docs/gameplay_loop.md` - Build/race/feedback/adjust loop.
- `docs/worlds_and_locations.md` - Tiny-world settings and props.
- `docs/rider_imagination_system.md` - Random toy rider behavior.
- `docs/building_tools.md` - Dirt-play building tools.
- `docs/feedback_system.md` - Imagination feedback language.
- `docs/sound_and_mood.md` - Cozy ambience and sound direction.
- `docs/roadmap.md` - Development phases.
- `prompts/claude_code_master_prompt.md` - Claude Code alignment prompt.
- `prompts/higgsfield_game_prompt.md` - Higgsfield visual/game prompt.


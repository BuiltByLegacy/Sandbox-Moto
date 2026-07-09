# Claude Code Master Prompt

You are working on Sandbox Moto, a cozy nostalgic motocross sandbox game built in Godot 4.x with GDScript.

Read `VISION.md` first, then use the docs in `/docs` as the source of truth.

## Creative North Star

Sandbox Moto should feel like being a kid again, kneeling beside a sandbox, dirt pile, or motocross pit area, building tiny motocross tracks with toy bikes and imagination.

The player is not explicitly told they are a kid, but the game should quietly make them feel like one.

## Boundaries

This is not a racing simulator.

This is not primarily a track manager.

This is not about money, business, or pro racing.

This is about childhood motocross imagination.

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

## Implementation Priorities

- Preserve the current free-draw smooth track system.
- Do not switch to a blocky grid track system.
- If grid logic is introduced later, use it only as an editing helper while visuals remain smooth and natural.
- Keep code simple, readable, and expandable.
- Keep rider names, numbers, colors, and skills randomized independently each race.
- Make bigger jumps risk/reward.
- Make beginner riders roll or crash on bigger features.
- Make better riders clear bigger features more often.
- Keep feedback playful, short, and imagination-style.

## Visual Direction

Aim for a Sandcastle-like cozy handcrafted sandbox diorama:

- Warm golden sand.
- Soft shadows.
- Miniature scale.
- Toy dirt bikes.
- Oversized grass blades.
- Plastic shovel.
- Red bucket.
- Garden hose.
- Popsicle sticks.
- Tiny cones.
- Toy dump truck.

Avoid gritty realistic motocross, serious racing sim presentation, business analytics, and pro racing management systems.


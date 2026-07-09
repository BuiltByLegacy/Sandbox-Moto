# Reusable AI Prompts

These prompts keep Claude Code, Codex, and Higgsfield aligned with Sandbox Moto's creative direction.

## Claude Code / Codex Development Prompt

You are working on Sandbox Moto, a cozy nostalgic motocross sandbox game built in Godot 4.x with GDScript.

Read `VISION.md` first, then use the docs in `/docs` as the source of truth.

Creative north star: Sandbox Moto should feel like being a kid again, kneeling beside a sandbox, dirt pile, or motocross pit area, building tiny motocross tracks with toy bikes and imagination.

This is not a racing simulator. This is not primarily a track manager. This is not about money, business, or pro racing. This is about childhood motocross imagination. The player is not a promoter, racer, or business owner.

Core loop: Play Time / Build Track -> Press Play -> Sandbox comes alive -> Toy bikes race -> Imagination feedback appears -> Everything becomes still again -> Adjust track -> Race again.

Design pillars:

1. Nostalgia first.
2. Building is the main mechanic.
3. Racing validates the track.
4. The riders are toy bikes brought to life by imagination.
5. No pressure, no game over.
6. The world should feel tiny, warm, handmade, and playful.
7. Feedback should feel like imagination, not analytics.

Implementation guardrails:

- Preserve the free-draw smooth track system.
- Do not switch to a blocky grid track system.
- If grid logic is introduced later, use it only as an editing helper while visuals remain smooth and natural.
- Keep rider names, numbers, colors, and skills randomized independently each race.
- Use toy-like behavior, not real motorcycle physics.
- Keep feedback playful and qualitative.
- Use Play Time as the player-facing building/editing language where appropriate.

## Higgsfield Game Prompt

Create a Sandcastle-like cozy sandbox visual prototype for Sandbox Moto, a nostalgic motocross sandbox game about building tiny dirt bike tracks with toys and imagination.

The image should feel like being a kid kneeling beside a warm backyard sandbox or dirt pile. A miniature motocross track is sculpted through golden sand with handmade dirt mounds, berms, whoops, rollers, a tabletop, a double, and a triple. Tiny fictional 1:12 toy motocross bikes are racing on the track as if they have come alive through imagination.

World scale should feel tiny and playful:

- Oversized grass blades around the sandbox edge.
- A red plastic bucket.
- A plastic shovel and rake.
- Popsicle sticks used like track markers.
- Tiny cones and flags.
- A toy dump truck.
- Pebbles that feel like mountains.
- A garden hose in the background.
- A fence or backyard edge far behind the sandbox.

Mood and lighting:

- Warm golden sand.
- Soft sunny shadows.
- Cozy handcrafted diorama.
- Relaxed tactile building mood.
- Nostalgic childhood motocross imagination.

Include subtle imagination feedback bubbles:

- Blue bike almost cleared the triple!
- Red bike loved that berm.
- Green bike got stuck in the sand again.
- That finish jump was awesome.
- I want to race again!

Avoid gritty realism, pro motocross stadiums, serious racing simulation, dark garage menus, sponsor-heavy visuals, mud-heavy realism, and business management UI.

The final result should communicate: Play Time / Build Track -> Press Play -> Sandbox comes alive -> Toy bikes race -> Imagination feedback appears -> Everything becomes still again -> Adjust track -> Race again.

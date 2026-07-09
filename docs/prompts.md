# Reusable AI Prompts

Use these prompts to keep Claude, Codex, and Higgsfield aligned with the same creative north star.

## Claude / Claude Code Master Prompt

You are working on Sandbox Moto, a cozy nostalgic motocross sandbox game built in Godot 4.x with GDScript.

Emotional north star: Sandbox Moto should feel like being a kid again, building motocross tracks in the sandbox and imagining toy bikes racing them.

This is not a pro racing simulator, not a business sim, and not a track management game. Building is the main mechanic. Racing validates the player's handmade track and creates playful imagination feedback.

Core loop: Build track -> run toy race -> get imagination feedback -> modify track -> race again.

Preserve these directions:

- Smooth free-draw track, not a blocky grid system.
- Cozy sandbox diorama visual style.
- Warm golden sand and handmade dirt.
- Tiny toy dirt bikes.
- Oversized grass, buckets, shovels, cones, and backyard props.
- Placeholder visuals are acceptable, but code should be organized for future art.
- Rider names, numbers, colors, and skills randomize independently every race.
- Bigger jumps have risk/reward.
- Beginner riders roll or crash on bigger features.
- Better riders clear bigger features more often.
- Feedback is playful and imagination-style, not analytics.

When coding, keep the prototype simple, readable, and expandable.

## Codex Prompt

Continue developing Sandbox Moto in the existing Godot 4.x repo.

Read `VISION.md` first, then use the docs in `/docs` as the source of truth. Keep the project aligned with the childhood sandbox motocross fantasy.

Prioritize:

- Working playable increments.
- Clean GDScript.
- Smooth track building.
- Toy-like rider behavior.
- Cozy placeholder visuals that can later be replaced by handmade art.
- No gritty realism, pro sim complexity, or business sim systems.

Before changing behavior, check the current scripts and preserve the build -> race -> feedback -> adjust loop.

## Higgsfield Visual Prompt

Create visual direction for Sandbox Moto, a cozy nostalgic motocross sandbox diorama game.

The scene should feel like a child kneeling beside a warm sandbox, building a tiny motocross track from golden sand and dirt, then imagining toy dirt bikes racing around it.

Visual ingredients:

- Warm golden sand.
- Handmade dirt mounds.
- Smooth miniature motocross track.
- Tiny colorful toy dirt bikes.
- Oversized grass blades.
- Plastic buckets.
- Toy shovels and rakes.
- Small cones and fence pieces.
- Soft sunny backyard light.
- Cozy handcrafted Sandcastle-like mood, but motocross.

Avoid gritty realism, professional stadium racing, mud-heavy realism, dark garages, sponsor-heavy motorsport branding, and serious simulation energy.

## Higgsfield Game Prompt

Create a cozy gameplay concept visual for Sandbox Moto.

Show a miniature sandbox motocross track with toy dirt bikes racing through playful handmade features: single, double, triple, tabletop, whoops, rollers, sand patch, and hill.

The image should communicate the loop:

Build track -> run toy race -> get imagination feedback -> modify track -> race again.

Include simple playful feedback bubbles such as:

- Blue bike almost cleared the triple!
- Green bike got stuck in the sand.
- That double might be too big.

Keep it warm, nostalgic, handmade, and toy-like. It should feel like childhood imagination, not professional racing simulation.


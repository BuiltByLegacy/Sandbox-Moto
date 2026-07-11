# Sandbox Moto

Sandbox Moto is a cozy nostalgic motocross sandbox game about building tiny tracks in warm sand, then watching toy dirt bikes come alive through imagination.

Tagline options:

- Remember when every pile of dirt became a motocross track?
- Build the tracks you imagined as a kid.
- Every pile of dirt was a Supercross track.

## Creative North Star

If someone who grew up riding or loving motocross smiles because Sandbox Moto reminds them of spending entire afternoons building tracks in the dirt with toy bikes, we succeeded.

Sandbox Moto should feel like being a kid again, kneeling beside a sandbox, dirt pile, or motocross pit area, building tiny motocross tracks with toy bikes and imagination.

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

Play Time / Build Track
-> Press Play
-> Sandbox comes alive
-> Toy bikes race
-> Imagination feedback appears
-> Everything becomes still again
-> Adjust track
-> Race again

## Design Pillars

1. Nostalgia first.
2. Creativity over optimization.
3. Building is the core mechanic.
4. Racing validates the player's imagination.
5. No pressure, no game over.
6. Unlock imagination, not power.
7. The world should feel tiny, warm, handmade, playful, and emotionally familiar.

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

## Progression Direction

Progression should not be money-first. It should feel like growing imagination, collecting toys, unlocking memories, and filling a scrapbook.

Examples include toy bikes, toy riders, shovels, buckets, rakes, molds, cones, flags, toy dump trucks, mini excavators, bridges, PVC pipes, cardboard ramps, plastic tunnels, toy trees, toy campers, and tiny spectators.

## How To Run

1. Install Godot 4.x.
2. Open this folder as a Godot project.
3. Run `scenes/Main.tscn`.

### HTML Prototype

Open `web/index.html` in a modern browser. It is a self-contained playable version of the core loop with smooth track drawing, obstacle placement, randomized toy riders, race stories, track wear, touch support, and no build step.

Play the latest version online at **https://builtbylegacy.github.io/Sandbox-Moto/**. GitHub Pages automatically republishes changes from `web/` after they reach `main`.

## Key Docs

- `docs/GAME_VISION.md` - Canonical full concept, fantasy, loop, and boundaries.
- `docs/NORTH_STAR.md` - One-page design filter.
- `docs/EMOTIONAL_PILLARS.md` - Emotional goals and feature support.
- `docs/ART_BIBLE.md` - Canonical visual direction.
- `docs/CAMERA_DESIGN.md` - Kneeling-beside-the-sandbox camera language.
- `docs/SANDBOX_RULES.md` - Dirt, sand, sculpting, and played-in track behavior.
- `docs/TOY_BIKE_BIBLE.md` - Fictional 1:12 toy bike rules.
- `docs/INPUT_PHILOSOPHY.md` - Tactile input and platform priorities.
- `docs/TOY_BOX_DESIGN.md` - Toy-box menus and unlockable play objects.
- `docs/WORLD_BIBLE.md` - Memory locations.
- `docs/AUDIO_BIBLE.md` - Cozy nostalgic sound direction.
- `docs/STORY_BIBLE.md` - Imagination story rules and signature moments.
- `docs/UNLOCK_PHILOSOPHY.md` - Unlock imagination, not power.
- `docs/MEMORY_BOOK.md` - Scrapbook/save-memory system.
- `docs/SCREENSHOT_PHILOSOPHY.md` - Shareable toy photography direction.
- `docs/LONG_TERM_VISION.md` - Version and platform strategy.
- `VISION.md` - Emotional north star.
- `docs/game_design.md` - Full creative direction.
- `docs/visual_style_guide.md` - Sandcastle-like visual target.
- `docs/gameplay_loop.md` - Build/race/feedback/adjust loop.
- `docs/worlds_and_locations.md` - Tiny-world settings and props.
- `docs/rider_imagination_system.md` - Random toy rider behavior.
- `docs/building_tools.md` - Dirt-play building tools.
- `docs/collectible_bike_system.md` - Toy collection progression.
- `docs/progression.md` - Toy box unlocks and non-money progression.
- `docs/memory_scrapbook.md` - Polaroid-style saved race memories.
- `docs/feedback_system.md` - Imagination feedback language.
- `docs/sound_and_mood.md` - Cozy ambience and sound direction.
- `docs/toy_bike_art_direction.md` - 1:12 fictional toy bike art direction.
- `docs/signature_moments.md` - Emotional moments the game should create.
- `docs/roadmap.md` - Development phases.
- `CLAUDE.md` - Root agent directive: roles, session-start routine, workflow rules.
- `prompts/claude_code_master_prompt.md` - Claude Code alignment prompt.
- `prompts/higgsfield_game_prompt.md` - Higgsfield visual/game prompt.
- `CHANGELOG.md` - Documentation and direction changes.

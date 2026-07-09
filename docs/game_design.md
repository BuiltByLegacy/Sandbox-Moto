# Sandbox Moto Game Design

## Core Concept

Sandbox Moto is a cozy, nostalgic motocross sandbox game. It should feel like being a kid again, kneeling next to a sandbox or dirt pile, building toy motocross tracks with imagination, then watching tiny toy riders race the track.

The emotional goal is not realistic racing simulation. The emotional goal is childhood motocross imagination.

## High-Level Pitch

Remember when every pile of dirt became a motocross track?

Sandbox Moto turns that memory into a relaxed build-and-race loop. Players sculpt and sketch tiny motocross tracks, place playful obstacles, run a race, laugh at what happened, and adjust the track for the next imaginary moto.

## Inspiration

- Sandcastle-style cozy sandbox building and warm handcrafted visuals.
- Tiny Glade-style relaxed creation.
- Mini Motorways-style simple tool bubbles and clean interaction.
- Childhood motocross sandbox and toy bike play.

## What This Is Not

- Not a pro racing simulator.
- Not a hardcore physics simulation.
- Not primarily a track manager.
- Not a business, promotion, or career sim.
- Not a fail-state-driven game.

## Design Pillars

1. Nostalgia first.
2. Building is the main mechanic.
3. Racing validates the player's track.
4. No pressure, no game over.
5. The player is not a promoter; they are a kid imagining races.
6. The world should feel tiny, handmade, and playful.

## Gameplay Loop

Build -> Race -> Imagine Feedback -> Adjust -> Race Again

### Build

The player draws a smooth track path and places start, finish, jumps, whoops, sand, rollers, hills, and playful utility tools like a dozer. Building should feel casual and tactile, closer to smoothing sand with a hand than operating a professional editor.

### Race

Tiny toy riders spawn with fresh names, numbers, colors, and skill profiles. They follow the player-built path, spread into lanes, interact with obstacles, and create toy-like race moments.

The race is a validation pass, not a judgment. It answers playful questions:

- Is the double too big?
- Does the sand slow everyone down?
- Did the green bike have a great start?
- Did someone almost clear the triple?

### Feedback

After the race, feedback appears as imagination-style bubbles:

- Blue bike almost cleared the triple!
- Red bike loved the berm.
- Green bike got stuck in the sand.
- That double might be too big.

Feedback should feel like a child narrating an imaginary race, not like a telemetry dashboard.

### Adjust

The game returns to build mode. The player can redraw, place more obstacles, move the finish, or press Play Race again.

## Prototype Tool List

- Shovel / Track
- Start Gate
- Finish
- Single
- Double
- Triple
- Tabletop
- Whoops
- Sand
- Rollers
- Hill
- Dozer
- Play Race

## Rider Generation

Each race creates new riders. Names and skills are not linked. A rider called "Milo" should not always be good at whoops, and the blue bike should not always be fast.

Each rider has:

- jump_skill
- whoop_skill
- sand_skill
- roller_skill
- hill_skill
- start_skill
- aggression
- consistency

## Toy Bike Feel

Riders should not behave like realistic motorcycles. They are imagined toy bikes. Motion should be smooth, readable, and playful. A crash can be a small spin-out or wobble, not a serious accident.

Important behavior:

- Bigger jumps have risk/reward.
- Low-skill riders often roll doubles and triples.
- Aggressive low-skill riders may attempt and crash.
- High-skill riders clear bigger jumps more often.
- Holeshot and start skill create early race variation.
- Line changes are smooth and should not jitter.
- Riders should not constantly bounce between lanes.

## Visual Direction

The current prototype can use placeholder shapes, but the target mood is a warm sandbox diorama:

- Soft warm sand colors.
- Miniature toy scale.
- Simple toy bikes.
- Handmade obstacle shapes.
- Oversized props later: grass blades, buckets, toy shovels, cones, fence, pits.
- Avoid gritty realism.
- Prioritize cozy, nostalgic, handmade play.


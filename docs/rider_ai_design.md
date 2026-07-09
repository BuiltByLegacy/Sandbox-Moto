# Rider Imagination AI Design

## Goal

Riders should feel like toy bikes brought to life by imagination, not realistic motocross athletes.

They should be readable, playful, and slightly unpredictable. The system should create little stories without needing complex physics.

## Random Identity

Each race generates riders with:

- Random color identity or toy-like nickname.
- Random number.
- Random bike color.
- Random temporary personality.
- Random skill profile.

There are no real riders. Names, if used, are toy-like nicknames only. Names and skills must not be tied together. A rider named Milo should not always be good at jumps, and the blue bike should not always be fast.

Temporary personality examples:

- Fearless.
- Careful.
- Always sends it.
- Smooth.
- Bad starter.
- Great jumper.
- Struggles in sand.
- Loves whoops.
- Crashes a lot.

## Skill Profile

Each rider has:

- `jump_skill`
- `whoop_skill`
- `sand_skill`
- `roller_skill`
- `hill_skill`
- `start_skill`
- `aggression`
- `consistency`

## Start Behavior

`start_skill` creates holeshot variation. Better starters accelerate sooner and separate into lanes more confidently.

Riders should spread out smoothly and avoid jittery lane switching.

## Obstacle Decisions

Riders evaluate each feature with a simple toy-like decision:

- Clear it.
- Roll it.
- Bobble.
- Slow down.
- Crash or wobble briefly.

Aggressive low-skill riders may attempt features they should not attempt. Skilled riders clear bigger jumps more often.

## Motion Feel

Movement should be smooth and legible:

- Stable lane offsets.
- No constant bouncing between lines.
- No high-fidelity suspension simulation.
- Airborne riders rise visually above obstacles.
- Crashes are gentle toy-bike spinouts or wobbles, not serious accidents.


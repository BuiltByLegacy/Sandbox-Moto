# Claude Code Master Prompt

You are working on Sandbox Moto, a cozy nostalgic motocross sandbox game built in Godot 4.x with GDScript.

Read `VISION.md` first, then use the docs in `/docs` as the source of truth.

## Creative North Star

Sandbox Moto should feel like being a kid again, kneeling beside a sandbox, dirt pile, or motocross pit area, building tiny motocross tracks with toy bikes and imagination.

The player is not explicitly told they are a kid, but the game should quietly make them feel like one.

The player is not a promoter, racer, or business owner. The game should imply childhood through scale, sound, props, camera, and interaction.

## Boundaries

This is not a racing simulator.

This is not primarily a track manager.

This is not about money, business, or pro racing.

This is about childhood motocross imagination.

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
- Use "Play Time" for player-facing building/editing language where appropriate.

## Visual Direction

Aim for a Sandcastle-like cozy handcrafted sandbox diorama:

- Warm golden sand.
- Soft shadows.
- Miniature scale.
- Tiny Glade-inspired relaxing creation.
- Mini Motorways-inspired simple tool bubbles and editability.
- Toy dirt bikes.
- Oversized grass blades.
- Plastic shovel.
- Red bucket.
- Garden hose.
- Popsicle sticks.
- Tiny cones.
- Toy dump truck.
- Real-world props that make the toy world feel tiny.

Memory locations include backyard sandbox, garage floor in winter, living room rug, driveway dirt pile, camping trip, beach vacation, local motocross pits, tailgate at race day, edge of a practice track, snow pile, and toy room.

## Toy Dirt Bike Art Direction

The bikes should look like collectible toy motocross bikes that came alive in a kid's imagination.

Use nostalgic 1:12 scale toy motocross bike inspiration, not real licensed motorcycles.

Do not use real motorcycle brand names, logos, graphics, or exact model designs. Avoid Honda, Yamaha, Kawasaki, KTM, Husqvarna, and Suzuki branding. Use fictional toy-style brands and original graphics instead.

Bike visual targets:

- Chunky plastic bodywork.
- Slightly oversized fenders.
- Thick toy-like tires.
- Simplified engines.
- Simplified forks and swingarms.
- Glossy molded plastic.
- Rounded toy-safe edges.
- Plastic number plates.
- Simple decals.
- Tiny scratches and sand or dirt on tires.
- Premium collectible toy-store feel.

Fictional brand examples:

- Legacy Moto.
- Sandbox Racing.
- TrailWorks.
- DirtCo.
- MotoForge.
- TinyMoto.
- Backyard Factory.
- PitKid Racing.

Each race should spawn toy bikes from a collectible pool. Each bike gets a random number, random colorway, random temporary skill profile, and random race behavior with no permanent real-world identity.

Riders should look toy-like too: oversized helmets, chunky boots, simplified plastic body proportions, colorful gear, and an articulated action-figure feeling. Do not use real rider names or licensed gear.

Rider personalities are temporary and imagined. Examples: fearless, careful, always sends it, smooth, bad starter, great jumper, struggles in sand, loves whoops, crashes a lot. Do not make skills name-specific.

Animation should feel like toys brought to life by imagination: slight bounce while riding, simple wheelie over jumps, whole-bike tilt in air, simple landing bounce, and tiny roost or sand spray. Do not build toward full realistic suspension simulation.

## Signature Moments

- Camera zooms out and reveals the whole race is in a sandbox.
- A kid's hand reaches in to move a jump.
- The race starts and the quiet sandbox becomes alive.
- After the race, everything becomes still again.
- Fake Polaroid or scrapbook saves favorite track memories.
- Mom calls "Dinner!" and the world freezes.
- Dad's real dirt bike revs in the distance.
- One tiny rider finally clears the impossible jump.

Avoid gritty realistic motocross, serious racing sim presentation, business analytics, and pro racing management systems.

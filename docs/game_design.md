# Game Design

## Core Concept

Sandbox Moto is a cozy nostalgic motocross sandbox game. It should feel like being a kid again, kneeling beside a sandbox, dirt pile, or motocross pit area, building tiny motocross tracks with toy bikes and imagination.

The emotional goal is childhood motocross imagination, not realistic racing simulation.

## Tagline Options

- Remember when every pile of dirt became a motocross track?
- Build the tracks you imagined as a kid.
- Every pile of dirt was a Supercross track.

## Important Design Pivot

This is not a racing simulator.

This is not primarily a track manager.

This is not about money, business, or pro racing.

This is about childhood motocross imagination.

## Player Fantasy

The player is not explicitly told they are a kid, but the game should quietly make them feel like one.

They build tracks, watch toy riders come alive, imagine stories, fix jumps, change berms, re-race, and keep playing because they want to build one cooler track.

The player is not a promoter, racer, or business owner. The game implies childhood through scale, sound, props, camera, and interaction rather than stating it directly.

The emotional goal is nostalgia, warmth, creativity, and "one more race."

## Core Gameplay Loop

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

## What The Player Does

The player draws and shapes a smooth toy motocross track, places handmade features, drops a start gate and finish marker, then starts a race.

Tiny riders spawn with temporary identities and skills. They get good starts, roll jumps, crash on risky triples, struggle in sand, or flow through a section. After the race, the game gives playful feedback that makes the player want to adjust the track.

## Emotional Moments

Sandbox Moto should create moments like:

- You build a huge jump and everyone crashes.
- One rider finally clears it.
- You fix a landing and the race suddenly flows.
- A rider almost clears a triple and you adjust it.
- The camera zooms out and reveals the whole track is in a sandbox.
- A kid's hand reaches in to move a jump.
- The race starts and the quiet sandbox becomes alive.
- After the race, everything becomes still again.
- A fake Polaroid or scrapbook saves a favorite track memory.
- Mom calls "Dinner!" and the world freezes.
- Dad's real dirt bike revs in the distance.
- One tiny rider finally clears the impossible jump.
- After every race, a soft "One more race?" prompt appears like childhood play continuing.
- The sandbox starts to look played in after repeated races.

## Progression

Avoid money-focused progression.

Progression should feel like growing imagination:

- New toy bikes.
- New buckets.
- New shovels.
- New environments.
- New decorations.
- New track markers.
- New dirt and sand types.
- New props.
- Scrapbook memories.

Unlock examples:

- Toy bikes.
- Toy riders.
- Shovels.
- Buckets.
- Rakes.
- Molds.
- Cones.
- Flags.
- Toy dump trucks.
- Mini excavators.
- Bridges.
- PVC pipes.
- Cardboard ramps.
- Plastic tunnels.
- Toy trees.
- Toy campers.
- Spectators.
- Old tires.
- Popsicle-stick fences.
- Stickers and number plates.

## Memory Scrapbook

Favorite race moments can be saved as scrapbook memories, like a small Polaroid taped into a notebook.

Each memory can save:

- Track name.
- Winning bike color.
- Best jump.
- Biggest crash.
- Funniest feedback bubble.
- Small snapshot or Polaroid-style image.

Kid-style generated track names should sound imagined:

- Dragon Hill.
- Mega Jump Raceway.
- Backyard National.
- Big Sand SX.
- The Impossible Triple.
- Bucket Turn Speedway.
- Dad's Garage Supercross.

## Played-In Dirt

The sandbox should visually remember play:

- Darker ruts.
- Worn jump faces.
- Sand pushed out of corners.
- Smoother landings after repeated races.
- Tire marks.
- Little roost piles.

The track should start to look played in, like a real sandbox after a long afternoon.

## Implementation Note

Keep the current free-draw smooth track system as the baseline for now. Do not switch back to a blocky grid system. If grid logic is introduced later, it should only guide editing while visuals remain smooth and natural.

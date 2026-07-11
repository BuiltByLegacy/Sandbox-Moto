# Obstacle System

## Purpose

Obstacles are the player's main way to shape toy race stories. They should be visually distinct, easy to place, and understandable at a glance.

## Core Obstacles

### Single

A small jump that most riders can handle. Beginner riders may roll it, while better riders hop it cleanly.

### Double

A medium risk/reward feature. Beginner riders often roll it. Aggressive beginner riders may try to clear it and crash or bobble.

### Triple

A larger risk/reward feature. Better riders clear it more often. Low-skill riders should often roll it or fail an aggressive attempt.

### Tabletop

A friendly jump with lower risk than a double or triple. Good for cozy progression and beginner-friendly tracks.

### Whoops

A rhythm section that tests `whoop_skill`. Strong riders skim through faster. Weak riders bobble and slow down.

### Rollers

Small rolling bumps that test `roller_skill`. They should be playful and forgiving.

### Sand

A soft slow section that tests `sand_skill`. Weak riders may get stuck or lose momentum.

### Hill

An elevation-style feature that tests `hill_skill`. Better riders carry momentum; weaker riders slow down.

## Editing Placed Obstacles

Placed obstacles are toys, and toys get rearranged:

- Hand / Move: press a toy, drag it somewhere better, let go. This is the interactive version of the "kid's hand reaches in to move a jump" signature moment.
- Pick Up: tap a toy to lift it out of the sandbox and back to the toy box.
- Lifting a toy leaves a small dent in the sand where it sat.
- A soft ring shows which toy the hand is over; it brightens while carrying.
- Both actions support Undo, autosave like any other build change, and persist through the save system.
- The Dozer remains the area-clearing tool; Pick Up is for one toy at a time.

## Rider Outcomes

Beginner riders:

- Roll bigger jumps.
- Slow down in sand.
- Bobble in whoops.
- May crash if aggression is high and skill is low.

Better riders:

- Clear bigger features more often.
- Maintain speed through whoops and rollers.
- Carry momentum through sand and hills.
- Create exciting but still toy-like race moments.

Feedback should stay imagination-first:

- Blue bike almost cleared the triple!
- Nobody could clear that jump.
- Make the whoops smoother.
- That finish jump was awesome.

## Visual Requirements

Each obstacle should have a clear silhouette:

- Doubles and triples should visibly show multiple peaks.
- Sand should look like a soft patch.
- Whoops should look like repeated small bumps.
- Rollers should look rounded and forgiving.
- Hills should feel larger and smoother.

Future versions should replace placeholders with handmade sandbox-style art.

# Claude Code Master Prompt

You are working on Sandbox Moto, a cozy sandbox imagination game built in Godot 4.x with GDScript.

Read these first:

1. `VISION.md`
2. `docs/GAME_VISION.md`
3. `docs/NORTH_STAR.md`
4. The relevant uppercase bible doc for the task.

## North Star

If someone who grew up riding or loving motocross smiles because Sandbox Moto reminds them of spending entire afternoons building tracks in the dirt with toy bikes, we succeeded.

Every mechanic, asset, tool, sound, UI choice, and progression system should answer:

Does this make the player feel more like they are reliving a childhood motocross sandbox memory?

## Identity

Sandbox Moto is not a motocross simulator, track manager, business game, pro racing game, or realism project. It is about childhood imagination, nostalgia, tactile building, toy bikes, and "one more race."

## Core Loop

Play Time / Build Track
-> Press Play
-> Sandbox comes alive
-> Toy bikes race
-> Imagination feedback appears
-> Everything becomes still again
-> Adjust track
-> One more race

## Game Pillars

- Nostalgia first.
- Creativity over optimization.
- Building is the core mechanic.
- Racing validates the player's imagination.
- No pressure, no game over.
- Unlock imagination, not power.
- The world should feel tiny, warm, handmade, playful, and emotionally familiar.

## Implementation Guardrails

- Preserve free-draw smooth track building.
- Do not replace smooth track visuals with blocky grid visuals.
- Keep code simple, readable, and expandable.
- Keep rider identities and skills randomized independently each race.
- Use imagination bubbles, not analytics-first feedback.
- Use Play Time as the player-facing building/editing language.
- Add toy-like behavior, not full realistic motorcycle physics.

## Art And Bikes

Aim for cozy Sandcastle-like visuals, Tiny Glade-style relaxed creation, and Mini Motorways-style clean tool bubbles.

Use fictional 1:12 toy motocross bikes only. No real-world motorcycle brands, logos, exact graphics, licensed bikes, pro riders, or model replicas.

Bikes should have chunky plastic bodywork, glossy molded plastic, simplified engines, thick tires, oversized fenders, colorful fictional graphics, number plates, tiny scratches, sand, bounce, simple wheelies, whole-bike tilt, and landing bounce.

## Rider Imagination

Riders are not real pros or permanent personalities. Each race randomly creates bike color identity, number, temporary personality, temporary skill profile, aggression, consistency, jump skill, whoop skill, sand skill, roller skill, hill skill, and start skill.

Examples:

- Blue bike almost cleared the triple.
- Red bike loved the berm.
- Green bike got stuck in the sand.
- Yellow bike always sends it.
- Purple bike is careful but smooth.

## Feedback

Use imagination bubbles:

- "Blue bike almost cleared the triple!"
- "Red bike loved that berm."
- "Green bike got stuck in the sand again."
- "Nobody could clear that jump."
- "Make the whoops smoother."
- "I want to race again!"
- "That finish jump was awesome."

## Signature Moments

- Camera zooms out and reveals the race is in a sandbox.
- Kid's hand reaches in to move a jump.
- Quiet sandbox comes alive when Play is pressed.
- After the race everything becomes still again.
- Fake Polaroid/scrapbook saves a favorite track memory.
- Mom calls "Dinner!" and the world freezes/saves.
- Dad's real dirt bike revs in the distance.
- One tiny rider finally clears the impossible jump.


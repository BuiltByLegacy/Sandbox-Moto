# Roadmap

This roadmap follows the Sandbox Moto north star: unlock imagination, not power.

## Architecture Direction

The shipping Steam game is now explicitly **Godot 4 in 3D**. The Three.js browser build remains a rapid visual/interaction lab and executable reference. See `docs/ADR_001_CANONICAL_3D_RUNTIME.md`.

The current development priority is to migrate the proven build/race/feedback fantasy into a production 3D terrain architecture without losing playability.

## Version 1: Cozy Sandbox Prototype

- Preserve the Godot 4.x prototype foundation.
- Use a 3D miniature diorama presentation for the playable browser prototype.
- Keep free-draw smooth track building.
- Place start, finish, and core obstacles.
- Spawn toy bike racers.
- Show imagination feedback bubbles.
- Keep the loop: Play Time -> Press Play -> toy race -> feedback -> adjust -> one more race.
- Establish the initial Steam Early Access release checklist.

## Version 2: Better Sculpting And Toy Bikes

- Canonical Godot 3D runtime and migration strategy. **Done: ADR-001 / #35.**
- Automated playability validation for sculpted courses (#36).
- Physical sandbox tool interaction and heavy-equipment workflow (#29).
- Tactile tool tray and in-world handling (#30).
- Mini excavator, dozer, and skid-steer terrain sculpting (#31).
- Physical route definition without exposing splines (#32).
- Living dirt/material model (#37).
- Physical dirt transfer (#48).
- Watering/drying and track prep (#38).
- Track repair/grooming (#43).
- Multi-step terrain edit history (#49).
- Better toy-bike visuals and 1:12 collectible proportions.
- Better obstacle risk/reward and toy-like jump behavior.
- Played-in dirt: ruts, tire marks, worn jump faces, roost piles.
- Done: local sandbox autosave and reload (`docs/SAVE_SYSTEM.md`).

### Version 2 execution order

1. #35 — canonical 3D runtime decision. **Complete.**
2. #36 — playability validation contract and first implementation.
3. #31 + #32 — heavy equipment + rideable course vertical slice.
4. #37 + #48 — shared living dirt + physical material transfer.
5. #38 + #43 + #49 — watering, repair, and forgiving edit history.
6. #40 + #39 + #41 — racing intelligence, race stories, and automatic feature discovery.

## Version 3: Scrapbook And Toy Box Progression

- Memory Book / scrapbook save system.
- Polaroid-style race memories.
- Done: kid-style track names - suggested from track contents, editable on the nameplate, saved with the sandbox, and used as the Polaroid caption.
- Toy box unlocks: bikes, colors, props, shovels, buckets, molds, stickers, spectators, and frames.
- Toy Bike Collection Identity and Patina (#44).
- One More Race prompt after each race.
- Mom called Dinner pause/save moment.

## Version 4: Multiple Memory Locations

- Backyard sandbox.
- Garage floor in winter.
- Living room rug.
- Driveway dirt pile.
- Camping trip.
- Beach vacation.
- Local motocross pits.
- Tailgate at race day.
- Edge of a practice track.
- Snow pile.
- Toy room.

Each location should have mood, lighting, sound, props, dirt/sand type, and unlocks.

Environmental polish should make the sandbox feel alive: butterflies, leaves, wind, moving grass, ants, bird shadows, kids laughing, and cloud shadows.

Emotional/world-depth wave after the core 3D/race systems:

- #42 Imagination Events and Childhood Memory Moments.
- #44 Toy Bike Collection Identity and Patina.
- #45 Time of Day and Gentle Weather Memory System.
- #46 Toy Spectators, Crowd Reactions, and Oversized Real-World Intrusions.
- #47 Make-Believe Race Scenarios and Imagination Prompts.

## Version 5: Sharing And Community

- Track sharing.
- Steam Workshop-style community.
- Challenge seeds.
- Community sandbox gallery.
- Shareable Polaroid/scrapbook pages.
- Custom toy collections.
- Photo mode with tilt shift, golden hour, Polaroid frames, scrapbook borders, hide UI, and screenshot shortcut.

## Steam Early Access Preparation

- Steamworks account.
- Steam Direct registration.
- Steam store page.
- Capsule art.
- Trailer.
- Screenshots.
- Tags.
- Description.
- Wishlist campaign.
- Steam achievements.
- Cloud save investigation.
- Steam Deck compatibility.
- Early Access checklist.

## Version 6: Sandbox Neighborhood / Larger World

- Larger connected memory-world framing.
- Neighborhood of sandbox play spaces.
- More long-term scrapbook identity.
- More ways for players to revisit, remix, and share favorite toy-moto memories.

## Platform Strategy

- Steam first.
- PC first because mouse input and screen space fit creative building.
- Steam Deck/controller support later.
- iPad later may be excellent for touch sandbox play.
- iPhone later should be simplified.

## Permanent Guardrails

- No money-first progression.
- No promoter, business, or pro racing focus.
- No gritty realism.
- No blocky grid track visuals replacing smooth track language.
- No real motorcycle branding or exact real bike designs.
- No power unlocks.
- No conventional spline/CAD editor exposed to the player when a physical sandbox interaction can solve the same problem.

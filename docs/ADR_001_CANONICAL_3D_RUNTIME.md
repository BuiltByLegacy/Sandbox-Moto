# ADR-001: Canonical 3D Runtime for Sandbox Moto

**Status:** Accepted

**Decision date:** 2026-08-26

## Context

Sandbox Moto now depends on physical terrain sculpting, real elevation, toy construction equipment, rideable jump faces and landings, route inference, living dirt, weather, track wear, and a miniature diorama camera. The repository currently contains two useful but diverging prototypes:

- A Three.js browser prototype that already expresses the desired 3D diorama look and interaction language.
- A Godot 4 prototype whose original implementation is predominantly Node2D and remains useful as a gameplay/reference implementation.

Maintaining both as equal shipping runtimes would create duplicated gameplay logic, asset work, save formats, validation rules, and QA.

## Decision

**The canonical shipping runtime for Steam is Godot 4 in 3D.**

The Three.js build remains a **rapid visual/interaction lab and executable reference**, not a second shipping client. Successful interactions proven in the browser prototype should be migrated into Godot 3D as vertical slices.

The existing Godot 2D systems are reference implementations and migration sources. They should not constrain the final visual or terrain architecture.

## Runtime responsibilities

### Godot 4 3D — shipping game

Owns the authoritative implementation of:

- deformable/sculptable sandbox terrain;
- miniature heavy-equipment tools;
- 3D toy bikes and riders;
- rideable-course representation and validation;
- race simulation and race-story events;
- save/load and Memory Book integration;
- Steam input, packaging, achievements/cloud/workshop integrations;
- production audio, art, lighting, camera, and performance budgets.

### Three.js — visual and interaction lab

Used to quickly prototype and compare:

- camera language;
- tool-tray behavior;
- toy-scale art direction;
- terrain/material look;
- obstacle readability;
- environmental composition;
- UI motion and interaction concepts.

No feature is considered production-complete solely because it exists in the browser prototype.

## Terrain architecture direction

Use a **heightfield/deformable surface first**, with localized mesh regeneration and layered metadata for moisture, compaction, wear, and recognized track features.

Why this first:

- motocross tracks are primarily heightfield-friendly surfaces;
- it supports digging, pushing, grading, berms, jumps, ruts, and water without requiring full voxel complexity;
- local edit regions can be serialized and validated;
- it is compatible with a clear Steam performance budget.

Do not introduce full voxel terrain unless a proven gameplay requirement cannot be represented with the heightfield approach.

## Rideable course architecture

The player-facing course definition must remain physical and playful. Internally, the game may maintain a smoothed centerline/corridor sampled across the terrain.

The route system should:

- remain hidden from normal play;
- sample terrain elevation rather than flattening it;
- expose local slope, width, surface state, and recognized feature metadata to riders;
- support local revalidation after terrain edits;
- preserve multiple racing lines inside a corridor.

Issue #32 owns the player-facing route-definition interaction. Issue #36 owns hard-invalid vs difficult-but-playable validation.

## Save architecture

Evolve the existing versioned save schema rather than replacing it abruptly.

Future 3D saves should separate:

1. sandbox/world identity;
2. terrain deformation/state;
3. rideable route/corridor data;
4. placed toys/tools/markers;
5. wear/moisture/material state;
6. collection and Memory Book references.

Older 2D/path saves should either migrate through an explicit version adapter or load as legacy sandboxes where practical.

## Camera architecture

The shipping camera is a perspective 3D diorama camera that feels like kneeling beside a sandbox:

- orbit/rotate within controlled limits;
- pan and zoom for building;
- soft idle life when hands are still;
- pack-follow framing during races;
- cinematic pull-back for memory/signature moments;
- no unrestricted free-fly camera in normal play.

## Performance targets

Initial production targets:

- 60 FPS target at 1080p on a representative mid-range Windows gaming PC;
- scalable shadows, particles, terrain detail, and ambient props;
- terrain edits should update locally, not rebuild the entire sandbox every frame;
- race simulation should remain stable with at least 8 toy riders in the first Steam target;
- Steam Deck is a follow-up compatibility target and should influence input/UI and scalability decisions from the beginning.

## Migration sequence

1. Create a minimal Godot 3D sandbox scene and diorama camera while preserving the current playable loop elsewhere.
2. Port route/race data contracts so current rider logic can consume a 3D sampled course.
3. Implement one localized terrain-editing vertical slice.
4. Add course validation (#36).
5. Port heavy equipment (#31) and route definition (#32).
6. Move dirt/material/wear systems (#37/#48/#38/#43/#49) onto the shared terrain representation.
7. Port racecraft/story systems (#40/#39/#41).
8. Add emotional/world-depth systems (#42/#44/#45/#46/#47).

## Consequences

### Positive

- One production runtime for Steam.
- The final game can achieve the tactile 3D sandbox fantasy.
- Browser experimentation remains fast without becoming architectural debt.
- Future systems share one terrain, route, save, and event model.

### Cost

- Some existing 2D Godot code becomes reference/migration code rather than final production code.
- A deliberate 3D migration is required before major terrain systems should be considered complete.

## Guardrail

Do not rebuild the entire game in one pass. Every migration step must preserve or restore a playable **Build → Race → Feedback → Adjust → One More Race** vertical slice.

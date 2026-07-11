# Memory Book

The Memory Book is the scrapbook system. It can become the player's save file.

The underlying persistence already exists: the sandbox autosaves to a versioned local file and reloads on launch (see `docs/SAVE_SYSTEM.md`). The save schema reserves a `track_name` field for the kid-style track names below. Memory Book entries build on top of that foundation.

## Purpose

Save favorite races as Polaroid-style memories instead of analytics pages.

## Memory Fields

- Track name.
- Winning bike color.
- Best jump.
- Biggest crash.
- Funniest feedback bubble.
- Screenshot.
- Caption.
- "One more race" feeling.

## Track Names

Track names should sound like a kid made them:

- Dragon Hill.
- Mega Jump Raceway.
- Backyard National.
- Big Sand SX.
- The Impossible Triple.
- Bucket Turn Speedway.
- Dad's Garage Supercross.


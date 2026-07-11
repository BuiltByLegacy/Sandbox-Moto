# Memory Book

The Memory Book is the scrapbook system. It can become the player's save file.

The underlying persistence already exists: the sandbox autosaves to a versioned local file and reloads on launch (see `docs/SAVE_SYSTEM.md`). Memory Book entries build on top of that foundation.

Kid-style track names are implemented: every sandbox gets a suggested name on a nameplate above the sand (content-aware - a triple can suggest "The Impossible Triple"), players can type their own, the name persists in the save file's `track_name` field, and photo mode Polaroids are captioned with it. Generator lives in `scripts/TrackNamer.gd`.

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


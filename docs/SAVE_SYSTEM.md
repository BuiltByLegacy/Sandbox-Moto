# Save System

The sandbox quietly remembers itself. Closing the game is the "Mom called
dinner" moment: the player walks away, and the toys stay exactly where they
were left. This is the persistence foundation the Memory Book and future
track sharing build on.

## What It Feels Like

- No save menus, no slots, no prompts.
- Autosave whispers a tiny "Sandbox saved" in the corner and fades away.
- Reopening the game shows the sandbox just how you left it, still and
  quiet, in Play Time.
- Riders never spawn on load. Races are never saved.

## Where Saves Live

One JSON file in Godot's user data directory, never in the repository:

- Path: `user://sandbox_save.json`
- Windows: `%APPDATA%\Godot\app_userdata\Sandbox Moto\sandbox_save.json`
- macOS: `~/Library/Application Support/Godot/app_userdata/Sandbox Moto/`
- Linux: `~/.local/share/godot/app_userdata/Sandbox Moto/`

## Save Triggers

- Debounced autosave 2.5 seconds after the last meaningful build change
  (`TrackBuilder.track_changed` -> `SandboxSave.mark_dirty()`).
- Once after every race ends, so played-in wear is kept.
- On window close (`NOTIFICATION_WM_CLOSE_REQUEST`).
- Never during an active race: autosave is paused when the race starts and
  flushed when it ends. The snapshot never contains riders or race state.

## Schema (save_version 1)

```json
{
  "save_version": 1,
  "saved_at": "2026-07-10T14:03:22",
  "location_id": "backyard_sandbox",
  "track_name": "",
  "track": {
    "points": [[320.0, 320.0], [480.0, 380.0]],
    "start": {"position": [330.0, 325.0], "rotation": 0.0, "placed": true},
    "finish": {"position": [790.0, 375.0], "rotation": 0.0, "placed": true},
    "obstacles": [
      {"type": "double", "position": [350.0, 350.0], "rotation": 0.0}
    ],
    "wear_marks": [
      {"position": [420.0, 340.0], "radius": 5.2, "alpha": 0.24, "stretch": 1.6}
    ]
  }
}
```

Notes:

- `points` are the raw free-draw points; smoothing is recomputed on load so
  the track always renders through the current smoothing code.
- `rotation` on start/finish is reserved: gates have no orientation in the
  prototype yet, but the field exists so save_version 1 files survive when
  they do. Obstacle `rotation` round-trips the real node rotation.
- `location_id` is fixed to `backyard_sandbox` until multiple memory
  locations exist (roadmap Version 4).
- `track_name` is an empty placeholder until the Memory Book adds kid-style
  track naming (roadmap Version 3).

## Versioning And Safety

- `save_version` gates every load. Newer-than-supported files are ignored
  with a warning instead of guessed at. Future bumps run migrations inside
  `SandboxSave.load_state()` before the data is applied.
- Missing, empty, malformed, or wrong-shaped files all resolve to "start
  with a fresh sandbox" - never a crash.
- Corrupt individual entries (a bad point, an unknown obstacle type, a
  broken wear mark) are skipped one by one; everything valid still loads.

## Code Map

- `scripts/SandboxSave.gd` - file IO, schema, versioning, validation,
  debounce. Talks to TrackBuilder only through
  `get_save_state()` / `apply_save_state()`; knows nothing about UI.
- `scripts/TrackBuilder.gd` - owns what gets serialized (it owns the data):
  `get_save_state()`, `apply_save_state()`, `clear_all()`.
- `scripts/MainGame.gd` - wiring: load on ready, pause during races,
  quit save, F9 dev clear.
- `scripts/FeedbackSystem.gd` - `show_whisper()` for the cozy confirmation.

## Development Helpers

- F9 (debug builds only, outside races) deletes the save and rakes the
  sandbox flat. Temporary until real reset tooling exists.
- Headless tests:
  - `godot --headless --path . --script res://tests/save_load_smoke.gd`
  - `godot --headless --path . --script res://tests/reload_integration.gd`

## Out Of Scope For Now

- Multiple save slots or a save menu.
- Saving races, riders, or camera state.
- Memory Book scrapbook entries (built on top of this later).

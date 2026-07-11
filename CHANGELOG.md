# Changelog

## Unreleased

- feat: toy rider animation. Bikes now animate like toys brought to life, straight from the toy bike bible: slight bounce while riding (wobblier for low-consistency riders), takeoff wheelies, whole-bike tilt in the air (nose up then nose down), happy landing squash bounces with sand puffs, roost spray behind the rear wheel, crash dust clouds, and a soft shadow under airborne bikes. Hand-drawn capped particles, no physics. Headless test in `tests/rider_animation_smoke.gd`.
- feat: obstacle move and pick-up tools. The kid's hand can now reach in: Hand / Move drags a placed toy to a new spot, Pick Up lifts it out of the sandbox, both leave a little dent in the sand, show a hover ring, support Undo, and autosave/persist like any other build change. Tool panel compacted so all tools fit a 720p window. Headless test in `tests/obstacle_edit_smoke.gd`.
- feat: publish the playable HTML prototype through GitHub Pages.
- feat: sandbox track save/load. The sandbox autosaves (debounced, plus on quit and after races) to a versioned JSON file in the user data directory and reloads on launch into quiet Play Time - track path, start/finish, obstacles, and played-in wear all persist; riders never do. Includes cozy "Sandbox saved" whisper, F9 dev save-clear, headless smoke and integration tests in `tests/`, and `docs/SAVE_SYSTEM.md` documenting the schema.
- docs: add `CLAUDE.md` root directive defining agent roles, session-start reading order, GitHub workflow, Higgsfield prompt standards, and documentation rules.
- docs: update roadmap for Steam release prep, living sandbox polish, and photo mode.
- docs: add design bible and north star for Sandbox Moto.
- docs: add scrapbook, toy box, one-more-race, and played-in dirt concepts.
- Refined the creative direction around Sandbox Moto as a nostalgic toy sandbox imagination game, not a racing simulator or track manager.
- Clarified the player-facing loop as Play Time -> Press Play -> sandbox comes alive -> toy bikes race -> imagination feedback -> stillness -> adjust -> race again.
- Expanded memory-world location guidance, toy collection progression, signature moments, sound mood, and prompt alignment for Claude Code, Codex, and Higgsfield.

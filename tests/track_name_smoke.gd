extends SceneTree

# Headless smoke test for kid-style track names.
# Run with:
#   godot --headless --path . --script res://tests/track_name_smoke.gd
# Covers the generator's content rules, name sanitizing, save-file
# roundtrip, and the name surviving a full Main-scene restart.

const TrackNamerScript := preload("res://scripts/TrackNamer.gd")
const TrackBuilderScript := preload("res://scripts/TrackBuilder.gd")
const SandboxSaveScript := preload("res://scripts/SandboxSave.gd")
const MainScene := preload("res://scenes/Main.tscn")

const TEST_SAVE_PATH := "user://test_sandbox_save.json"
const SAVE_PATH := "user://sandbox_save.json"
const BACKUP_PATH := "user://sandbox_save.pretest_backup.json"

var failures: Array[String] = []

func _initialize() -> void:
	_run_tests()

func _run_tests() -> void:
	_test_generator_always_names_something()
	_test_content_gated_names_need_their_feature()
	_test_feature_names_show_up_for_matching_tracks()
	_test_clean_name()
	_test_name_roundtrips_through_save_file()
	await _test_name_survives_scene_restart()

	if failures.is_empty():
		print("TRACK NAME SMOKE TEST PASSED")
		quit(0)
	else:
		for failure in failures:
			push_error(failure)
		print("TRACK NAME SMOKE TEST FAILED (%d failures)" % failures.size())
		quit(1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)

func _seeded_rng(seed_value: int) -> RandomNumberGenerator:
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_value
	return rng

func _test_generator_always_names_something() -> void:
	var rng := _seeded_rng(7)
	for i in range(200):
		var name := TrackNamerScript.suggest_name(["double", "sand"], rng)
		_check(not name.strip_edges().is_empty(), "generator: produced an empty name")
		_check(name.length() <= TrackNamerScript.MAX_NAME_LENGTH, "generator: name too long: %s" % name)
	var empty_track_name := TrackNamerScript.suggest_name([], rng)
	_check(not empty_track_name.strip_edges().is_empty(), "generator: empty track should still get a name")

func _test_content_gated_names_need_their_feature() -> void:
	# A track with only sand should never be named after a triple.
	var rng := _seeded_rng(99)
	for i in range(300):
		var name := TrackNamerScript.suggest_name(["sand"], rng)
		_check(not name.contains("Triple"), "content: sand-only track got a triple name: %s" % name)
		_check(not name.contains("Berm"), "content: sand-only track got a berm name: %s" % name)

func _test_feature_names_show_up_for_matching_tracks() -> void:
	# With a triple on the track, triple-flavored names should appear sometimes.
	var rng := _seeded_rng(4242)
	var saw_triple := false
	for i in range(300):
		if TrackNamerScript.suggest_name(["triple"], rng).contains("Triple"):
			saw_triple = true
			break
	_check(saw_triple, "content: 300 rolls with a triple never produced a triple name")

func _test_clean_name() -> void:
	_check(TrackNamerScript.clean_name("  Dragon Hill  ") == "Dragon Hill", "clean: should trim edges")
	_check(TrackNamerScript.clean_name(null) == "", "clean: non-string should become empty")
	_check(TrackNamerScript.clean_name(12345) == "", "clean: number should become empty")
	var long_name := "This Track Name Is Way Way Way Too Long For A Kid"
	_check(TrackNamerScript.clean_name(long_name).length() <= TrackNamerScript.MAX_NAME_LENGTH, "clean: should cap length")

func _test_name_roundtrips_through_save_file() -> void:
	if FileAccess.file_exists(TEST_SAVE_PATH):
		DirAccess.remove_absolute(TEST_SAVE_PATH)
	var builder = TrackBuilderScript.new()
	builder.track_points.append(Vector2(100, 100))
	builder.track_points.append(Vector2(300, 100))
	var save = SandboxSaveScript.new()
	save.save_path = TEST_SAVE_PATH
	save.setup(builder)
	save.track_name = "The Impossible Triple"
	_check(save.save_now(), "roundtrip: save_now failed")
	var loaded: Dictionary = save.load_state()
	_check(loaded.get("track_name") == "The Impossible Triple", "roundtrip: track_name did not survive the save file")
	DirAccess.remove_absolute(TEST_SAVE_PATH)
	builder.free()
	save.free()

func _test_name_survives_scene_restart() -> void:
	_backup_player_save()
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(SAVE_PATH)

	var game1 = MainScene.instantiate()
	root.add_child(game1)
	await process_frame
	var nameplate1 = game1.get_node("TrackNameplate")
	_check(not nameplate1.get_track_name().is_empty(), "restart: a fresh sandbox should get a suggested name")
	nameplate1.set_track_name("Dragon Hill")
	game1._on_track_renamed("Dragon Hill")
	game1.get_node("SandboxSave").save_now()
	root.remove_child(game1)
	game1.free()

	var game2 = MainScene.instantiate()
	root.add_child(game2)
	await process_frame
	var nameplate2 = game2.get_node("TrackNameplate")
	_check(nameplate2.get_track_name() == "Dragon Hill", "restart: track name did not reload, got '%s'" % nameplate2.get_track_name())
	root.remove_child(game2)
	game2.free()

	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(SAVE_PATH)
	_restore_player_save()

func _backup_player_save() -> void:
	if FileAccess.file_exists(BACKUP_PATH):
		DirAccess.remove_absolute(BACKUP_PATH)
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.copy_absolute(SAVE_PATH, BACKUP_PATH)

func _restore_player_save() -> void:
	if FileAccess.file_exists(BACKUP_PATH):
		DirAccess.copy_absolute(BACKUP_PATH, SAVE_PATH)
		DirAccess.remove_absolute(BACKUP_PATH)

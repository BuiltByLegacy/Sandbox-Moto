extends SceneTree

# Headless smoke test for the sandbox save/load slice.
# Run with:
#   godot --headless --path . --script res://tests/save_load_smoke.gd
# Uses a test-only save path so it never touches a real player save.
# Note: standalone --script runs have no global class_name registry, so
# locals below are intentionally untyped and use the preloaded scripts.

const TrackBuilderScript := preload("res://scripts/TrackBuilder.gd")
const SandboxSaveScript := preload("res://scripts/SandboxSave.gd")

const TEST_SAVE_PATH := "user://test_sandbox_save.json"

var failures: Array[String] = []

func _initialize() -> void:
	_test_roundtrip_every_obstacle_type()
	_test_missing_file()
	_test_empty_file()
	_test_malformed_json()
	_test_wrong_shape_json()
	_test_newer_save_version()
	_test_partial_corruption_skips_bad_entries()
	_test_clear_save()
	_remove_test_file()

	if failures.is_empty():
		print("SAVE SMOKE TEST PASSED")
		quit(0)
	else:
		for failure in failures:
			push_error(failure)
		print("SAVE SMOKE TEST FAILED (%d failures)" % failures.size())
		quit(1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)

func _make_save():
	var save = SandboxSaveScript.new()
	save.save_path = TEST_SAVE_PATH
	return save

func _remove_test_file() -> void:
	if FileAccess.file_exists(TEST_SAVE_PATH):
		DirAccess.remove_absolute(TEST_SAVE_PATH)

func _write_test_file(text: String) -> void:
	var file := FileAccess.open(TEST_SAVE_PATH, FileAccess.WRITE)
	file.store_string(text)
	file.close()

func _test_roundtrip_every_obstacle_type() -> void:
	_remove_test_file()
	var builder = TrackBuilderScript.new()
	builder.track_points.append(Vector2(300, 300))
	builder.track_points.append(Vector2(450, 340))
	builder.track_points.append(Vector2(600, 300))
	builder.track_points.append(Vector2(750, 360))
	builder._smooth_track()
	builder.start_position = Vector2(310, 305)
	builder.has_start = true
	builder.finish_position = Vector2(740, 355)
	builder.has_finish = true
	var x := 320.0
	for obstacle_type in TrackBuilderScript.SAVABLE_OBSTACLE_TYPES:
		builder._add_obstacle(obstacle_type, Vector2(x, 330))
		x += 45.0
	builder.add_track_wear(Vector2(400, 320), 1.0)
	builder.add_track_wear(Vector2(500, 330), 0.8)

	var save = _make_save()
	save.setup(builder)
	_check(save.save_now(), "roundtrip: save_now returned false")

	var loaded: Dictionary = save.load_state()
	_check(not loaded.is_empty(), "roundtrip: load_state returned empty")
	_check(int(loaded.get("save_version", -1)) == SandboxSaveScript.SAVE_VERSION, "roundtrip: save_version mismatch")
	_check(loaded.get("location_id") == "backyard_sandbox", "roundtrip: location_id mismatch")
	_check(loaded.has("track_name"), "roundtrip: track_name field missing")

	var restored_builder = TrackBuilderScript.new()
	var restored: bool = restored_builder.apply_save_state(loaded["track"])
	_check(restored, "roundtrip: apply_save_state reported nothing restored")
	_check(restored_builder.track_points.size() == builder.track_points.size(), "roundtrip: track point count mismatch")
	for i in range(builder.track_points.size()):
		_check(restored_builder.track_points[i].is_equal_approx(builder.track_points[i]), "roundtrip: track point %d drifted" % i)
	_check(restored_builder.has_start and restored_builder.start_position.is_equal_approx(builder.start_position), "roundtrip: start gate mismatch")
	_check(restored_builder.has_finish and restored_builder.finish_position.is_equal_approx(builder.finish_position), "roundtrip: finish mismatch")
	_check(restored_builder.obstacles.size() == builder.obstacles.size(), "roundtrip: obstacle count mismatch")
	for i in range(mini(restored_builder.obstacles.size(), builder.obstacles.size())):
		_check(restored_builder.obstacles[i].obstacle_type == builder.obstacles[i].obstacle_type, "roundtrip: obstacle %d type mismatch" % i)
		_check(restored_builder.obstacles[i].position.is_equal_approx(builder.obstacles[i].position), "roundtrip: obstacle %d position mismatch" % i)
	_check(restored_builder.wear_marks.size() == builder.wear_marks.size(), "roundtrip: wear mark count mismatch")
	_check(restored_builder.smoothed_points.size() >= restored_builder.track_points.size(), "roundtrip: track was not re-smoothed on load")

	builder.free()
	restored_builder.free()
	save.free()

func _test_missing_file() -> void:
	_remove_test_file()
	var save = _make_save()
	_check(save.load_state().is_empty(), "missing file: expected empty state")
	save.free()

func _test_empty_file() -> void:
	_write_test_file("")
	var save = _make_save()
	_check(save.load_state().is_empty(), "empty file: expected empty state")
	save.free()

func _test_malformed_json() -> void:
	_write_test_file("{ this is not json !!!")
	var save = _make_save()
	_check(save.load_state().is_empty(), "malformed json: expected empty state")
	save.free()

func _test_wrong_shape_json() -> void:
	var save = _make_save()
	_write_test_file("[1, 2, 3]")
	_check(save.load_state().is_empty(), "wrong shape (array): expected empty state")
	_write_test_file("{\"save_version\": 1}")
	_check(save.load_state().is_empty(), "wrong shape (no track): expected empty state")
	_write_test_file("{\"track\": {}}")
	_check(save.load_state().is_empty(), "wrong shape (no version): expected empty state")
	save.free()

func _test_newer_save_version() -> void:
	_write_test_file("{\"save_version\": 999, \"track\": {\"points\": []}}")
	var save = _make_save()
	_check(save.load_state().is_empty(), "newer version: expected empty state")
	save.free()

func _test_partial_corruption_skips_bad_entries() -> void:
	var text := JSON.stringify({
		"save_version": 1,
		"track": {
			"points": [[100.0, 100.0], "garbage", [200.0, 120.0], [1.0]],
			"start": {"position": [110.0, 100.0], "placed": true},
			"finish": {"position": "nope", "placed": true},
			"obstacles": [
				{"type": "double", "position": [150.0, 110.0]},
				{"type": "lava_pit", "position": [160.0, 110.0]},
				{"type": "berm"},
				"garbage"
			],
			"wear_marks": [
				{"position": [140.0, 105.0], "radius": 4.0, "alpha": 0.2, "stretch": 1.5},
				{"position": [140.0, 105.0], "radius": "bad"}
			]
		}
	})
	_write_test_file(text)
	var save = _make_save()
	var loaded: Dictionary = save.load_state()
	_check(not loaded.is_empty(), "partial corruption: expected loadable state")
	var builder = TrackBuilderScript.new()
	var restored: bool = builder.apply_save_state(loaded["track"])
	_check(restored, "partial corruption: expected something restored")
	_check(builder.track_points.size() == 2, "partial corruption: expected 2 valid points, got %d" % builder.track_points.size())
	_check(builder.has_start, "partial corruption: valid start should restore")
	_check(not builder.has_finish, "partial corruption: invalid finish should not restore")
	_check(builder.obstacles.size() == 1, "partial corruption: expected 1 valid obstacle, got %d" % builder.obstacles.size())
	_check(builder.wear_marks.size() == 1, "partial corruption: expected 1 valid wear mark, got %d" % builder.wear_marks.size())
	builder.free()
	save.free()

func _test_clear_save() -> void:
	var builder = TrackBuilderScript.new()
	builder.track_points.append(Vector2(100, 100))
	builder.track_points.append(Vector2(200, 100))
	var save = _make_save()
	save.setup(builder)
	save.save_now()
	_check(FileAccess.file_exists(TEST_SAVE_PATH), "clear: save file should exist before clear")
	save.clear_save()
	_check(not FileAccess.file_exists(TEST_SAVE_PATH), "clear: save file should be gone after clear")
	_check(save.load_state().is_empty(), "clear: load after clear should be empty")
	builder.clear_all()
	_check(builder.track_points.is_empty() and builder.obstacles.is_empty() and not builder.has_start, "clear: clear_all should empty the sandbox")
	builder.free()
	save.free()

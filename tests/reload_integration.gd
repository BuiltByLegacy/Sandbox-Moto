extends SceneTree

# End-to-end reload test: boots the real Main scene, builds a track the way
# a play session would leave one, saves, boots a second fresh Main scene,
# and confirms the sandbox is exactly how the player left it.
# Run with:
#   godot --headless --path . --script res://tests/reload_integration.gd
# Backs up and restores any real player save so it is safe to run locally.

const MainScene := preload("res://scenes/Main.tscn")
const TrackBuilderScript := preload("res://scripts/TrackBuilder.gd")

const SAVE_PATH := "user://sandbox_save.json"
const BACKUP_PATH := "user://sandbox_save.pretest_backup.json"

var failures: Array[String] = []

func _initialize() -> void:
	# _ready only fires once the main loop runs, so the test body is async
	# and awaits a frame after instancing each session.
	_run_tests()

func _run_tests() -> void:
	_backup_player_save()
	_remove(SAVE_PATH)

	await _play_first_session()
	_check(FileAccess.file_exists(SAVE_PATH), "session 1: expected a save file on disk")
	await _verify_second_session()

	_remove(SAVE_PATH)
	_restore_player_save()

	if failures.is_empty():
		print("RELOAD INTEGRATION TEST PASSED")
		quit(0)
	else:
		for failure in failures:
			push_error(failure)
		print("RELOAD INTEGRATION TEST FAILED (%d failures)" % failures.size())
		quit(1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)

func _play_first_session() -> void:
	var game = MainScene.instantiate()
	root.add_child(game)
	await process_frame
	var builder = game.get_node("TrackBuilder")
	_check(builder.track_points.is_empty(), "session 1: fresh launch with no save should start empty")

	builder.track_points.append(Vector2(320, 320))
	builder.track_points.append(Vector2(480, 380))
	builder.track_points.append(Vector2(640, 320))
	builder.track_points.append(Vector2(800, 380))
	builder._smooth_track()
	builder.start_position = Vector2(330, 325)
	builder.has_start = true
	builder.finish_position = Vector2(790, 375)
	builder.has_finish = true
	var x := 350.0
	for obstacle_type in TrackBuilderScript.SAVABLE_OBSTACLE_TYPES:
		builder._add_obstacle(obstacle_type, Vector2(x, 350))
		x += 40.0
	builder.add_track_wear(Vector2(420, 340), 1.0)

	var save = game.get_node("SandboxSave")
	_check(save.save_now(), "session 1: save_now failed")
	root.remove_child(game)
	game.free()

func _verify_second_session() -> void:
	var game = MainScene.instantiate()
	root.add_child(game)
	await process_frame
	var builder = game.get_node("TrackBuilder")

	_check(builder.track_points.size() == 4, "session 2: expected 4 track points, got %d" % builder.track_points.size())
	_check(builder.smoothed_points.size() >= 4, "session 2: track should be re-smoothed after load")
	_check(builder.has_start and builder.start_position.is_equal_approx(Vector2(330, 325)), "session 2: start gate did not reload")
	_check(builder.has_finish and builder.finish_position.is_equal_approx(Vector2(790, 375)), "session 2: finish did not reload")
	var expected_count: int = TrackBuilderScript.SAVABLE_OBSTACLE_TYPES.size()
	_check(builder.obstacles.size() == expected_count, "session 2: expected %d obstacles, got %d" % [expected_count, builder.obstacles.size()])
	var reloaded_types: Array = []
	for obstacle in builder.obstacles:
		reloaded_types.append(obstacle.obstacle_type)
	for obstacle_type in TrackBuilderScript.SAVABLE_OBSTACLE_TYPES:
		_check(obstacle_type in reloaded_types, "session 2: obstacle type %s missing after reload" % obstacle_type)
	_check(builder.wear_marks.size() == 1, "session 2: expected 1 wear mark, got %d" % builder.wear_marks.size())

	_check(game.race_running == false, "session 2: race must not be running after load")
	_check(game.get_node("Riders").get_child_count() == 0, "session 2: no riders may spawn on load")
	_check(builder.build_enabled, "session 2: player should be back in quiet Play Time")

	root.remove_child(game)
	game.free()

func _backup_player_save() -> void:
	_remove(BACKUP_PATH)
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.copy_absolute(SAVE_PATH, BACKUP_PATH)

func _restore_player_save() -> void:
	if FileAccess.file_exists(BACKUP_PATH):
		DirAccess.copy_absolute(BACKUP_PATH, SAVE_PATH)
		_remove(BACKUP_PATH)

func _remove(path: String) -> void:
	if FileAccess.file_exists(path):
		DirAccess.remove_absolute(path)

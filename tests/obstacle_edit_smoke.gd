extends SceneTree

# Headless smoke test for the obstacle move / pick up tools.
# Run with:
#   godot --headless --path . --script res://tests/obstacle_edit_smoke.gd

const TrackBuilderScript := preload("res://scripts/TrackBuilder.gd")

var failures: Array[String] = []
var change_count := 0

func _initialize() -> void:
	_test_grab_drag_drop()
	_test_grab_misses_when_far()
	_test_move_undo()
	_test_pickup_and_undo()
	_test_pickup_leaves_dent()
	_test_drop_survives_freed_obstacle()

	if failures.is_empty():
		print("OBSTACLE EDIT SMOKE TEST PASSED")
		quit(0)
	else:
		for failure in failures:
			push_error(failure)
		print("OBSTACLE EDIT SMOKE TEST FAILED (%d failures)" % failures.size())
		quit(1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)

func _make_builder():
	var builder = TrackBuilderScript.new()
	builder._add_obstacle("double", Vector2(400, 300))
	builder._add_obstacle("berm", Vector2(600, 300))
	builder.undo_stack.clear()
	builder.track_changed.connect(func() -> void: change_count += 1)
	change_count = 0
	return builder

func _test_grab_drag_drop() -> void:
	var builder = _make_builder()
	builder._grab_obstacle_at(Vector2(410, 305))
	_check(builder.dragged_obstacle != null, "move: grab near the double should pick it up")
	_check(builder.dragged_obstacle.obstacle_type == "double", "move: grabbed the wrong obstacle")
	_check(builder.wear_marks.size() > 0, "move: lifting a toy should leave a dent")

	builder._drag_obstacle_to(Vector2(500, 350))
	var expected: Vector2 = Vector2(500, 350) + builder.drag_offset
	_check(builder.obstacles[0].position.is_equal_approx(expected), "move: drag did not follow the hand")

	builder._drop_obstacle()
	_check(builder.dragged_obstacle == null, "move: drop should release the toy")
	_check(change_count == 1, "move: drop should emit track_changed exactly once, got %d" % change_count)
	_check(builder.obstacles.size() == 2, "move: moving must not add or remove obstacles")
	builder.free()

func _test_grab_misses_when_far() -> void:
	var builder = _make_builder()
	builder._grab_obstacle_at(Vector2(100, 100))
	_check(builder.dragged_obstacle == null, "move: grab far from any toy should do nothing")
	_check(builder.undo_stack.is_empty(), "move: a missed grab must not push undo state")
	builder.free()

func _test_move_undo() -> void:
	var builder = _make_builder()
	builder._grab_obstacle_at(Vector2(400, 300))
	builder._drag_obstacle_to(Vector2(520, 340))
	builder._drop_obstacle()
	builder._undo()
	_check(builder.obstacles.size() == 2, "move undo: obstacle count changed")
	_check(builder.obstacles[0].position.is_equal_approx(Vector2(400, 300)), "move undo: position was not restored")
	_check(builder.dragged_obstacle == null, "move undo: drag reference must be cleared")
	builder.free()

func _test_pickup_and_undo() -> void:
	var builder = _make_builder()
	builder._pickup_obstacle_at(Vector2(600, 300))
	_check(builder.obstacles.size() == 1, "pickup: expected 1 obstacle left, got %d" % builder.obstacles.size())
	_check(builder.obstacles[0].obstacle_type == "double", "pickup: removed the wrong obstacle")
	_check(change_count == 1, "pickup: should emit track_changed exactly once, got %d" % change_count)

	builder._undo()
	_check(builder.obstacles.size() == 2, "pickup undo: obstacle did not come back")
	var types: Array = []
	for obstacle in builder.obstacles:
		types.append(obstacle.obstacle_type)
	_check("berm" in types, "pickup undo: the berm should be restored")
	builder.free()

func _test_pickup_leaves_dent() -> void:
	var builder = _make_builder()
	builder._pickup_obstacle_at(Vector2(600, 300))
	_check(builder.wear_marks.size() > 0, "pickup: lifting a toy out should leave a dent")
	builder.free()

func _test_drop_survives_freed_obstacle() -> void:
	var builder = _make_builder()
	builder._grab_obstacle_at(Vector2(400, 300))
	builder.obstacles[0].free()
	builder.obstacles.remove_at(0)
	builder._drag_obstacle_to(Vector2(500, 300))
	_check(builder.dragged_obstacle == null, "safety: dragging a freed toy should self-clear")
	builder._drop_obstacle()
	_check(builder.dragged_obstacle == null, "safety: drop after a freed toy should not crash")
	builder.free()

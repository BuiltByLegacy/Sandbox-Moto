class_name TrackBuilder
extends Node2D

signal track_changed

const ObstacleScene := preload("res://scripts/Obstacle.gd")
const SAVABLE_OBSTACLE_TYPES := ["single", "double", "triple", "tabletop", "whoops", "sand", "berm", "rollers", "hill"]
const MAX_WEAR_MARKS := 420

var active_tool := "track"
var track_points: Array[Vector2] = []
var smoothed_points: Array[Vector2] = []
var obstacles: Array = []
var start_position := Vector2(280, 360)
var finish_position := Vector2(980, 360)
var has_start := false
var has_finish := false
var is_drawing := false
var build_enabled := true
var wear_marks: Array[Dictionary] = []
var wear_rng := RandomNumberGenerator.new()
var brush_radius := 42.0
var undo_stack: Array[Dictionary] = []

func _ready() -> void:
	set_process_input(true)
	wear_rng.randomize()

func set_tool(tool_name: String) -> void:
	if tool_name == "undo":
		_undo()
		return
	if tool_name == "brush_up":
		brush_radius = minf(brush_radius + 10.0, 96.0)
		queue_redraw()
		return
	if tool_name == "brush_down":
		brush_radius = maxf(brush_radius - 10.0, 20.0)
		queue_redraw()
		return
	active_tool = tool_name

func set_build_enabled(enabled: bool) -> void:
	build_enabled = enabled
	is_drawing = false

func get_track_path() -> Array[Vector2]:
	if smoothed_points.size() >= 2:
		return smoothed_points.duplicate()
	return track_points.duplicate()

func get_race_path() -> Array[Vector2]:
	var path := get_track_path()
	if path.size() < 2:
		return path
	if not has_start:
		return path

	var start_index := _nearest_path_index(path, start_position)
	var ordered_path := path.slice(start_index)
	if start_index > 0:
		ordered_path.append_array(path.slice(0, start_index + 1))

	if has_finish and ordered_path.size() > 2:
		var finish_index := _nearest_path_index(ordered_path, finish_position)
		if finish_index > 1:
			ordered_path = ordered_path.slice(0, finish_index + 1)

	return ordered_path

func get_obstacles() -> Array:
	return obstacles.duplicate()

func add_track_wear(world_pos: Vector2, intensity := 1.0) -> void:
	var offset := Vector2(wear_rng.randf_range(-9.0, 9.0), wear_rng.randf_range(-7.0, 7.0))
	wear_marks.append({
		"position": world_pos + offset,
		"radius": wear_rng.randf_range(3.5, 8.0) * intensity,
		"alpha": clampf(wear_rng.randf_range(0.18, 0.36) * intensity, 0.12, 0.52),
		"stretch": wear_rng.randf_range(1.0, 2.4)
	})
	if wear_marks.size() > MAX_WEAR_MARKS:
		wear_marks.pop_front()
	queue_redraw()

func get_save_state() -> Dictionary:
	var point_pairs: Array = []
	for point in track_points:
		point_pairs.append(_vec_to_pair(point))
	var obstacle_state: Array = []
	for obstacle in obstacles:
		if is_instance_valid(obstacle):
			obstacle_state.append({
				"type": obstacle.obstacle_type,
				"position": _vec_to_pair(obstacle.position),
				"rotation": obstacle.rotation
			})
	var wear_state: Array = []
	for mark in wear_marks:
		wear_state.append({
			"position": _vec_to_pair(mark["position"]),
			"radius": mark["radius"],
			"alpha": mark["alpha"],
			"stretch": mark["stretch"]
		})
	return {
		"points": point_pairs,
		"start": {"position": _vec_to_pair(start_position), "rotation": 0.0, "placed": has_start},
		"finish": {"position": _vec_to_pair(finish_position), "rotation": 0.0, "placed": has_finish},
		"obstacles": obstacle_state,
		"wear_marks": wear_state
	}

func apply_save_state(state: Dictionary) -> bool:
	clear_all()
	var restored := false

	var saved_points: Variant = state.get("points")
	if saved_points is Array:
		for pair in saved_points:
			var point: Variant = _pair_to_vec(pair)
			if point is Vector2:
				track_points.append(point)
		if not track_points.is_empty():
			restored = true
		_smooth_track()

	var saved_start: Variant = state.get("start")
	if saved_start is Dictionary and saved_start.get("placed") == true:
		var start_point: Variant = _pair_to_vec(saved_start.get("position"))
		if start_point is Vector2:
			start_position = start_point
			has_start = true
			restored = true

	var saved_finish: Variant = state.get("finish")
	if saved_finish is Dictionary and saved_finish.get("placed") == true:
		var finish_point: Variant = _pair_to_vec(saved_finish.get("position"))
		if finish_point is Vector2:
			finish_position = finish_point
			has_finish = true
			restored = true

	var saved_obstacles: Variant = state.get("obstacles")
	if saved_obstacles is Array:
		for entry in saved_obstacles:
			if not entry is Dictionary:
				continue
			var obstacle_type: Variant = entry.get("type")
			var obstacle_point: Variant = _pair_to_vec(entry.get("position"))
			if not (obstacle_type is String and obstacle_type in SAVABLE_OBSTACLE_TYPES and obstacle_point is Vector2):
				continue
			var obstacle := ObstacleScene.new()
			obstacle.setup(obstacle_type)
			obstacle.position = obstacle_point
			var obstacle_rotation: Variant = entry.get("rotation", 0.0)
			if obstacle_rotation is float:
				obstacle.rotation = obstacle_rotation
			obstacle.z_index = 12
			add_child(obstacle)
			obstacles.append(obstacle)
			restored = true

	var saved_wear: Variant = state.get("wear_marks")
	if saved_wear is Array:
		for entry in saved_wear:
			if wear_marks.size() >= MAX_WEAR_MARKS:
				break
			if not entry is Dictionary:
				continue
			var wear_point: Variant = _pair_to_vec(entry.get("position"))
			if not (wear_point is Vector2 and entry.get("radius") is float and entry.get("alpha") is float and entry.get("stretch") is float):
				continue
			wear_marks.append({
				"position": wear_point,
				"radius": entry["radius"],
				"alpha": entry["alpha"],
				"stretch": entry["stretch"]
			})

	queue_redraw()
	return restored

func clear_all() -> void:
	track_points.clear()
	smoothed_points.clear()
	wear_marks.clear()
	undo_stack.clear()
	start_position = Vector2(280, 360)
	finish_position = Vector2(980, 360)
	has_start = false
	has_finish = false
	is_drawing = false
	for obstacle in obstacles:
		if is_instance_valid(obstacle):
			obstacle.queue_free()
	obstacles.clear()
	queue_redraw()

static func _vec_to_pair(point: Vector2) -> Array:
	return [point.x, point.y]

static func _pair_to_vec(value: Variant) -> Variant:
	if value is Array and value.size() == 2 and value[0] is float and value[1] is float:
		return Vector2(value[0], value[1])
	return null

func _unhandled_input(event: InputEvent) -> void:
	if not build_enabled:
		return
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		var mouse_pos := get_global_mouse_position()
		if mouse_pos.x < 205:
			return
		if event.pressed:
			_handle_press(mouse_pos)
		else:
			is_drawing = false
			if active_tool == "track":
				_smooth_track()
				track_changed.emit()
				queue_redraw()
	elif event is InputEventMouseMotion and is_drawing and active_tool == "track":
		var mouse_pos := get_global_mouse_position()
		if track_points.is_empty() or track_points.back().distance_to(mouse_pos) > 12.0:
			track_points.append(mouse_pos)
			_smooth_track()
			track_changed.emit()
			queue_redraw()

func _handle_press(mouse_pos: Vector2) -> void:
	match active_tool:
		"track":
			_push_undo_state()
			is_drawing = true
			track_points.clear()
			smoothed_points.clear()
			wear_marks.clear()
			track_points.append(mouse_pos)
			queue_redraw()
		"start":
			_push_undo_state()
			start_position = mouse_pos
			has_start = true
			track_changed.emit()
			queue_redraw()
		"finish":
			_push_undo_state()
			finish_position = mouse_pos
			has_finish = true
			track_changed.emit()
			queue_redraw()
		"smooth":
			_push_undo_state()
			_smooth_track()
			_add_smoothing_wear(mouse_pos)
			track_changed.emit()
			queue_redraw()
		"flatten":
			_push_undo_state()
			_flatten_area(mouse_pos)
			track_changed.emit()
			queue_redraw()
		_:
			if active_tool == "dozer":
				_push_undo_state()
				_flatten_area(mouse_pos)
				_remove_obstacles_near(mouse_pos)
				track_changed.emit()
				queue_redraw()
			elif active_tool in ["single", "double", "triple", "tabletop", "whoops", "sand", "berm", "rollers", "hill"]:
				_add_obstacle(active_tool, mouse_pos)

func _add_obstacle(obstacle_type: String, pos: Vector2) -> void:
	_push_undo_state()
	var obstacle := ObstacleScene.new()
	obstacle.setup(obstacle_type)
	obstacle.position = pos
	obstacle.z_index = 12
	add_child(obstacle)
	obstacles.append(obstacle)
	track_changed.emit()

func _flatten_area(pos: Vector2) -> void:
	for i in range(10):
		var angle := wear_rng.randf_range(0.0, TAU)
		var distance := wear_rng.randf_range(0.0, brush_radius)
		wear_marks.append({
			"position": pos + Vector2(cos(angle), sin(angle)) * distance,
			"radius": wear_rng.randf_range(7.0, 13.0),
			"alpha": wear_rng.randf_range(0.08, 0.16),
			"stretch": wear_rng.randf_range(1.8, 3.2)
		})
	if wear_marks.size() > MAX_WEAR_MARKS:
		wear_marks = wear_marks.slice(wear_marks.size() - MAX_WEAR_MARKS)

func _add_smoothing_wear(pos: Vector2) -> void:
	for i in range(6):
		add_track_wear(pos, 0.42)

func _remove_obstacles_near(pos: Vector2) -> void:
	for i in range(obstacles.size() - 1, -1, -1):
		var obstacle = obstacles[i]
		if is_instance_valid(obstacle) and obstacle.global_position.distance_to(pos) <= brush_radius:
			obstacles.remove_at(i)
			obstacle.queue_free()

func _smooth_track() -> void:
	smoothed_points.clear()
	if track_points.size() < 3:
		smoothed_points = track_points.duplicate()
		return

	smoothed_points.append(track_points[0])
	for i in range(track_points.size() - 1):
		var p0: Vector2 = track_points[max(i - 1, 0)]
		var p1: Vector2 = track_points[i]
		var p2: Vector2 = track_points[i + 1]
		var p3: Vector2 = track_points[min(i + 2, track_points.size() - 1)]
		for step in range(1, 7):
			var t := float(step) / 6.0
			smoothed_points.append(_catmull_rom(p0, p1, p2, p3, t))

func _catmull_rom(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: float) -> Vector2:
	var t2 := t * t
	var t3 := t2 * t
	return 0.5 * ((2.0 * p1) + (-p0 + p2) * t + (2.0 * p0 - 5.0 * p1 + 4.0 * p2 - p3) * t2 + (-p0 + 3.0 * p1 - 3.0 * p2 + p3) * t3)

func _nearest_path_index(path: Array[Vector2], target: Vector2) -> int:
	var best_index := 0
	var best_distance := INF
	for i in range(path.size()):
		var distance := path[i].distance_squared_to(target)
		if distance < best_distance:
			best_distance = distance
			best_index = i
	return best_index

func _push_undo_state() -> void:
	var obstacle_state: Array[Dictionary] = []
	for obstacle in obstacles:
		if is_instance_valid(obstacle):
			obstacle_state.append({
				"type": obstacle.obstacle_type,
				"position": obstacle.position
			})
	undo_stack.append({
		"track_points": track_points.duplicate(),
		"smoothed_points": smoothed_points.duplicate(),
		"wear_marks": wear_marks.duplicate(true),
		"obstacles": obstacle_state,
		"start_position": start_position,
		"finish_position": finish_position,
		"has_start": has_start,
		"has_finish": has_finish
	})
	if undo_stack.size() > 16:
		undo_stack.pop_front()

func _undo() -> void:
	if undo_stack.is_empty():
		return
	var state: Dictionary = undo_stack.pop_back()
	track_points = state["track_points"].duplicate()
	smoothed_points = state["smoothed_points"].duplicate()
	wear_marks = state["wear_marks"].duplicate(true)
	start_position = state["start_position"]
	finish_position = state["finish_position"]
	has_start = state["has_start"]
	has_finish = state["has_finish"]
	for obstacle in obstacles:
		if is_instance_valid(obstacle):
			obstacle.queue_free()
	obstacles.clear()
	for saved in state["obstacles"]:
		var obstacle := ObstacleScene.new()
		obstacle.setup(saved["type"])
		obstacle.position = saved["position"]
		obstacle.z_index = 12
		add_child(obstacle)
		obstacles.append(obstacle)
	track_changed.emit()
	queue_redraw()

func _draw() -> void:
	_draw_sand_texture()
	_draw_track()
	_draw_track_wear()
	_draw_start_finish()

func _draw_sand_texture() -> void:
	for i in range(90):
		var x := 220.0 + fmod(float(i * 97), 1020.0)
		var y := 30.0 + fmod(float(i * 53), 650.0)
		var radius := 1.5 + fmod(float(i), 4.0)
		draw_circle(Vector2(x, y), radius, Color(0.95, 0.78, 0.48, 0.22))

func _draw_track() -> void:
	var path := get_track_path()
	if path.size() < 2:
		draw_string(ThemeDB.fallback_font, Vector2(315, 345), "Draw a smooth track in the sand, place a start gate, add jumps, then Play Race.", HORIZONTAL_ALIGNMENT_LEFT, 760, 20, Color(0.34, 0.22, 0.12, 0.8))
		return

	draw_polyline(PackedVector2Array(path), Color(0.42, 0.26, 0.12, 0.35), 32.0, true)
	draw_polyline(PackedVector2Array(path), Color(0.68, 0.43, 0.20, 0.65), 20.0, true)
	draw_polyline(PackedVector2Array(path), Color(0.95, 0.75, 0.42, 0.28), 4.0, true)

func _draw_track_wear() -> void:
	for mark in wear_marks:
		var pos: Vector2 = mark["position"]
		var radius: float = mark["radius"]
		var alpha: float = mark["alpha"]
		var stretch: float = mark["stretch"]
		draw_ellipse(pos, radius * stretch, radius * 0.62, Color(0.27, 0.16, 0.08, alpha))

func _draw_start_finish() -> void:
	if active_tool in ["smooth", "flatten", "dozer"]:
		draw_arc(get_local_mouse_position(), brush_radius, 0.0, TAU, 64, Color(0.38, 0.24, 0.12, 0.32), 2.0)
	if has_start:
		draw_rect(Rect2(start_position - Vector2(30, 18), Vector2(60, 36)), Color(0.15, 0.18, 0.18, 0.85), false, 4.0)
		draw_line(start_position + Vector2(-28, -16), start_position + Vector2(28, 16), Color.WHITE, 2.0)
		draw_line(start_position + Vector2(-28, 16), start_position + Vector2(28, -16), Color.WHITE, 2.0)
		draw_string(ThemeDB.fallback_font, start_position + Vector2(-28, -26), "START", HORIZONTAL_ALIGNMENT_LEFT, 90, 12, Color(0.20, 0.13, 0.07))
	if has_finish:
		draw_rect(Rect2(finish_position - Vector2(28, 24), Vector2(56, 48)), Color(1, 1, 1, 0.75), true)
		for x in range(4):
			for y in range(3):
				if (x + y) % 2 == 0:
					draw_rect(Rect2(finish_position + Vector2(-28 + x * 14, -24 + y * 16), Vector2(14, 16)), Color(0.08, 0.08, 0.08), true)
		draw_string(ThemeDB.fallback_font, finish_position + Vector2(-28, -32), "FINISH", HORIZONTAL_ALIGNMENT_LEFT, 90, 12, Color(0.20, 0.13, 0.07))

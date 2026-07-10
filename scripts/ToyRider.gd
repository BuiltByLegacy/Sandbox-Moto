class_name ToyRider
extends Node2D

signal finished(rider)

const FIRST_NAMES := ["Milo", "Rex", "Pip", "June", "Ace", "Sunny", "Dot", "Tuck", "Kit", "Bea", "Dash", "Nico"]
const PERSONALITIES := [
	"fearless",
	"careful",
	"always sends it",
	"smooth",
	"bad starter",
	"great jumper",
	"struggles in sand",
	"loves whoops",
	"crashes a lot"
]

var rider_name := "Milo"
var number := 7
var bike_color := Color.CORNFLOWER_BLUE
var personality := "smooth"
var confidence := 0.5
var skills := {}
var path: Array[Vector2] = []
var obstacles: Array = []
var progress := 0.0
var speed := 95.0
var lane_offset := 0.0
var lane_target := 0.0
var finished_race := false
var crashed_timer := 0.0
var airborne_timer := 0.0
var feedback: Array[String] = []
var checked_obstacles: Dictionary = {}

func setup(new_path: Array[Vector2], race_obstacles: Array, lane: float, rng: RandomNumberGenerator) -> void:
	path = new_path.duplicate()
	obstacles = race_obstacles.duplicate()
	lane_offset = lane
	lane_target = lane
	rider_name = FIRST_NAMES[rng.randi_range(0, FIRST_NAMES.size() - 1)]
	number = rng.randi_range(2, 989)
	bike_color = Color.from_hsv(rng.randf(), 0.62, 0.90)
	personality = PERSONALITIES[rng.randi_range(0, PERSONALITIES.size() - 1)]
	confidence = rng.randf()
	skills = {
		"jump_skill": rng.randf(),
		"whoop_skill": rng.randf(),
		"sand_skill": rng.randf(),
		"roller_skill": rng.randf(),
		"hill_skill": rng.randf(),
		"start_skill": rng.randf(),
		"aggression": rng.randf(),
		"consistency": rng.randf(),
		"confidence": confidence
	}
	_apply_personality()
	speed = 78.0 + skills["start_skill"] * 58.0 + rng.randf_range(-10.0, 12.0)
	progress = rng.randf_range(0.0, 10.0) * skills["start_skill"]
	z_index = 18
	if path.size() > 0:
		position = path[0] + Vector2(0, lane_offset)
	queue_redraw()

func _process(delta: float) -> void:
	if finished_race or path.size() < 2:
		return

	if crashed_timer > 0.0:
		crashed_timer -= delta
		rotation += delta * 8.0
		queue_redraw()
		return

	if airborne_timer > 0.0:
		airborne_timer -= delta
		z_index = 40
	else:
		z_index = 18

	lane_offset = lerpf(lane_offset, lane_target, min(delta * 3.0, 1.0))
	progress += speed * delta * _consistency_wobble()
	_check_obstacles()
	_update_position()

	if progress >= _path_length():
		finished_race = true
		finished.emit(self)

func get_feedback() -> Array[String]:
	return feedback.duplicate()

func get_imagination_intro() -> String:
	return _color_name() + " bike is " + personality + " this race."

func _update_position() -> void:
	var sample := _sample_path(progress)
	var tangent: Vector2 = sample.direction
	var normal := Vector2(-tangent.y, tangent.x)
	position = sample.point + normal * lane_offset
	rotation = tangent.angle()
	queue_redraw()

func _check_obstacles() -> void:
	for obstacle in obstacles:
		var nearest := _nearest_distance_along_path(obstacle.global_position)
		if nearest < 0.0:
			continue
		if progress >= nearest and not checked_obstacles.has(obstacle.get_instance_id()):
			checked_obstacles[obstacle.get_instance_id()] = true
			_handle_obstacle(obstacle)

func _handle_obstacle(obstacle) -> void:
	var skill_key: String = obstacle.get_skill_key()
	var skill: float = skills.get(skill_key, 0.5)
	var difficulty: float = obstacle.get_difficulty()
	var obstacle_confidence: float = skill * 0.58 + skills["consistency"] * 0.22 + skills["confidence"] * 0.20
	var attack: float = skills["aggression"] - difficulty + randf_range(-0.12, 0.12)

	if obstacle.is_jump():
		if obstacle_confidence > difficulty:
			speed += 16.0 * obstacle_confidence
			airborne_timer = 0.34 + difficulty * 0.34
			feedback.append(_color_name() + " bike cleared the " + obstacle.obstacle_type + "!")
		elif attack > 0.08:
			speed *= 0.45
			crashed_timer = 0.55
			feedback.append(_color_name() + " bike almost cleared the " + obstacle.obstacle_type + "!")
		else:
			speed *= 0.72
			feedback.append(_color_name() + " bike rolled the " + obstacle.obstacle_type + ".")
	else:
		if confidence > difficulty:
			speed += 8.0
			if obstacle.obstacle_type == "berm":
				feedback.append(_color_name() + " bike loved that berm.")
			else:
				feedback.append(_color_name() + " bike loved the " + obstacle.obstacle_type + ".")
		else:
			speed *= 0.62
			if obstacle.obstacle_type == "sand":
				feedback.append(_color_name() + " bike got stuck in the sand.")
			else:
				feedback.append(_color_name() + " bike bobbled through the " + obstacle.obstacle_type + ".")

	speed = clampf(speed, 42.0, 190.0)

func _apply_personality() -> void:
	match personality:
		"fearless", "always sends it":
			skills["aggression"] = max(skills["aggression"], 0.72)
			skills["confidence"] = max(skills["confidence"], 0.62)
		"careful":
			skills["aggression"] = min(skills["aggression"], 0.34)
			skills["consistency"] = max(skills["consistency"], 0.62)
		"smooth":
			skills["consistency"] = max(skills["consistency"], 0.76)
		"bad starter":
			skills["start_skill"] = min(skills["start_skill"], 0.28)
		"great jumper":
			skills["jump_skill"] = max(skills["jump_skill"], 0.82)
		"struggles in sand":
			skills["sand_skill"] = min(skills["sand_skill"], 0.24)
		"loves whoops":
			skills["whoop_skill"] = max(skills["whoop_skill"], 0.82)
		"crashes a lot":
			skills["aggression"] = max(skills["aggression"], 0.78)
			skills["consistency"] = min(skills["consistency"], 0.30)

func _sample_path(distance: float) -> Dictionary:
	var remaining := distance
	for i in range(path.size() - 1):
		var a := path[i]
		var b := path[i + 1]
		var segment_length := a.distance_to(b)
		if remaining <= segment_length:
			var t: float = remaining / max(segment_length, 0.001)
			return {"point": a.lerp(b, t), "direction": (b - a).normalized()}
		remaining -= segment_length
	var final_direction := (path[-1] - path[-2]).normalized()
	return {"point": path[-1], "direction": final_direction}

func _path_length() -> float:
	var total := 0.0
	for i in range(path.size() - 1):
		total += path[i].distance_to(path[i + 1])
	return total

func _nearest_distance_along_path(world_pos: Vector2) -> float:
	var best_distance := INF
	var best_along := -1.0
	var along := 0.0
	for i in range(path.size() - 1):
		var a := path[i]
		var b := path[i + 1]
		var ab := b - a
		var t := clampf((world_pos - a).dot(ab) / max(ab.length_squared(), 0.001), 0.0, 1.0)
		var projected := a + ab * t
		var distance := projected.distance_to(world_pos)
		if distance < best_distance:
			best_distance = distance
			best_along = along + ab.length() * t
		along += ab.length()
	if best_distance > 65.0:
		return -1.0
	return best_along

func _consistency_wobble() -> float:
	return 1.0 + sin(Time.get_ticks_msec() * 0.004 + float(number)) * (0.045 * (1.0 - skills["consistency"]))

func _color_name() -> String:
	var hue := bike_color.h
	if hue < 0.06 or hue > 0.94:
		return "Red"
	if hue < 0.15:
		return "Orange"
	if hue < 0.25:
		return "Yellow"
	if hue < 0.43:
		return "Green"
	if hue < 0.60:
		return "Blue"
	if hue < 0.78:
		return "Purple"
	return "Pink"

func _draw() -> void:
	var body_height := 8.0
	if airborne_timer > 0.0:
		body_height = 13.0
	draw_circle(Vector2(-10, 7), 5, Color(0.08, 0.08, 0.08))
	draw_circle(Vector2(12, 7), 5, Color(0.08, 0.08, 0.08))
	draw_rect(Rect2(Vector2(-13, -body_height), Vector2(28, 10)), bike_color, true)
	draw_circle(Vector2(0, -body_height - 6), 5, Color(0.96, 0.79, 0.56))
	draw_string(ThemeDB.fallback_font, Vector2(-9, -24), str(number), HORIZONTAL_ALIGNMENT_CENTER, 34, 10, Color(0.12, 0.08, 0.04))

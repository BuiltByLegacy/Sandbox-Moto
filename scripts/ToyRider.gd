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
var base_lane := 0.0
var finished_race := false
var crashed_timer := 0.0
var airborne_timer := 0.0
var feedback: Array[String] = []
var checked_obstacles: Dictionary = {}

# Toy animation state: bounce, tilt, wheelie, landing squash, sand puffs.
# All drawn by hand - toys brought to life, never suspension simulation.
const MAX_PUFFS := 26
const ROOST_INTERVAL := 0.05
const LANDING_BOUNCE_TIME := 0.30

var bob_phase := 0.0
var visual_tilt := 0.0
var wheelie_lift := 0.0
var landing_bounce_timer := 0.0
var air_duration := 0.0
var roost_timer := 0.0
var puffs: Array[Dictionary] = []

func setup(new_path: Array[Vector2], race_obstacles: Array, lane: float, rng: RandomNumberGenerator) -> void:
	path = new_path.duplicate()
	obstacles = race_obstacles.duplicate()
	lane_offset = lane
	lane_target = lane
	base_lane = lane
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
	_update_puffs(delta)
	if finished_race or path.size() < 2:
		return

	if crashed_timer > 0.0:
		crashed_timer -= delta
		rotation += delta * 8.0
		queue_redraw()
		return

	if landing_bounce_timer > 0.0:
		landing_bounce_timer -= delta

	if airborne_timer > 0.0:
		airborne_timer -= delta
		z_index = 40
		# Whole-bike tilt: nose up off the lip, nose down for the landing.
		var air_progress := 1.0 - clampf(airborne_timer / max(air_duration, 0.001), 0.0, 1.0)
		visual_tilt = lerpf(-0.32, 0.26, air_progress)
		wheelie_lift = maxf(wheelie_lift - delta * 22.0, 0.0)
		if airborne_timer <= 0.0:
			_land()
	else:
		z_index = 18
		bob_phase += delta * (5.0 + speed * 0.055)
		visual_tilt = sin(bob_phase * 0.7 + float(number)) * 0.05 * (1.0 - skills["consistency"])
		wheelie_lift = 0.0
		_update_roost(delta)

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

func get_color_name() -> String:
	return _color_name()

func get_progress() -> float:
	return progress

func nudge_lane(amount: float) -> void:
	lane_target = clampf(base_lane + amount, -38.0, 38.0)

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
			air_duration = airborne_timer
			wheelie_lift = 5.0
			feedback.append(_color_name() + " bike cleared the " + obstacle.obstacle_type + "!")
		elif attack > 0.08:
			speed *= 0.45
			crashed_timer = 0.55
			_spawn_crash_dust()
			feedback.append(_color_name() + " bike almost cleared the " + obstacle.obstacle_type + "!")
		else:
			speed *= 0.72
			feedback.append(_color_name() + " bike rolled the " + obstacle.obstacle_type + ".")
	else:
		if obstacle_confidence > difficulty:
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

func _land() -> void:
	# Happy landing: a little squash bounce and a puff of sand at each wheel.
	landing_bounce_timer = LANDING_BOUNCE_TIME
	visual_tilt = 0.0
	z_index = 18
	for wheel_x in [-12.0, 13.0]:
		for i in range(3):
			_spawn_puff(to_global(Vector2(wheel_x, 8)), _scatter_velocity(34.0), randf_range(2.4, 4.2), randf_range(0.3, 0.5))

func _update_roost(delta: float) -> void:
	roost_timer -= delta
	if roost_timer > 0.0 or speed < 55.0:
		return
	roost_timer = ROOST_INTERVAL
	var back_dir := Vector2.LEFT.rotated(global_rotation)
	var spray := back_dir * randf_range(30.0, 58.0) + _scatter_velocity(12.0)
	_spawn_puff(to_global(Vector2(-14, 8)), spray, randf_range(1.6, 3.2), randf_range(0.35, 0.6))

func _spawn_crash_dust() -> void:
	for i in range(7):
		_spawn_puff(global_position + _scatter_velocity(10.0) * 0.4, _scatter_velocity(46.0), randf_range(2.8, 5.0), randf_range(0.4, 0.7))

func _spawn_puff(world_pos: Vector2, velocity: Vector2, size: float, life: float) -> void:
	puffs.append({
		"position": world_pos,
		"velocity": velocity,
		"size": size,
		"life": life,
		"max_life": life
	})
	if puffs.size() > MAX_PUFFS:
		puffs.pop_front()

func _update_puffs(delta: float) -> void:
	if puffs.is_empty():
		return
	for i in range(puffs.size() - 1, -1, -1):
		var puff := puffs[i]
		puff["life"] -= delta
		if puff["life"] <= 0.0:
			puffs.remove_at(i)
			continue
		puff["position"] += puff["velocity"] * delta
		puff["velocity"] *= 1.0 - min(delta * 4.5, 0.9)
	queue_redraw()

func _scatter_velocity(strength: float) -> Vector2:
	return Vector2(randf_range(-strength, strength), randf_range(-strength, strength))

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
	_draw_puffs()

	var body_height := 8.0
	var air_arc := 0.0
	if airborne_timer > 0.0:
		body_height = 13.0
		var air_progress := 1.0 - clampf(airborne_timer / max(air_duration, 0.001), 0.0, 1.0)
		air_arc = sin(air_progress * PI)
		_draw_air_shadow(air_arc)

	var bounce := 0.0
	if landing_bounce_timer > 0.0:
		bounce = sin((LANDING_BOUNCE_TIME - landing_bounce_timer) / LANDING_BOUNCE_TIME * PI)
	var bob := 0.0
	if airborne_timer <= 0.0 and crashed_timer <= 0.0:
		bob = sin(bob_phase) * 1.5

	var lift := Vector2(0.0, bob + bounce * 2.6 - air_arc * 6.0)
	var squash := Vector2(1.0 + bounce * 0.10, 1.0 - bounce * 0.16)
	draw_set_transform(lift, visual_tilt, squash)

	draw_circle(Vector2(-12, 8), 6, Color(0.07, 0.07, 0.06))
	draw_circle(Vector2(13, 8 - wheelie_lift), 6, Color(0.07, 0.07, 0.06))
	draw_circle(Vector2(-12, 8), 3, Color(0.38, 0.38, 0.34))
	draw_circle(Vector2(13, 8 - wheelie_lift), 3, Color(0.38, 0.38, 0.34))
	draw_rect(Rect2(Vector2(-16, -body_height), Vector2(32, 11)), bike_color, true)
	draw_rect(Rect2(Vector2(-20, -body_height - 4), Vector2(14, 5)), bike_color.lightened(0.16), true)
	draw_rect(Rect2(Vector2(9, -body_height - 5), Vector2(16, 5)), bike_color.lightened(0.12), true)
	draw_rect(Rect2(Vector2(-3, -body_height + 4), Vector2(10, 7)), Color(0.24, 0.22, 0.20), true)
	draw_circle(Vector2(0, -body_height - 8), 6, Color(0.96, 0.79, 0.56))
	draw_rect(Rect2(Vector2(-9, -body_height - 14), Vector2(18, 7)), bike_color.darkened(0.10), true)
	draw_string(ThemeDB.fallback_font, Vector2(-10, -27), str(number), HORIZONTAL_ALIGNMENT_CENTER, 36, 10, Color(0.12, 0.08, 0.04))

func _draw_puffs() -> void:
	for puff in puffs:
		var fade: float = puff["life"] / puff["max_life"]
		var size: float = puff["size"] * (1.5 - fade * 0.5)
		draw_circle(to_local(puff["position"]), size, Color(0.89, 0.72, 0.45, 0.5 * fade))

func _draw_air_shadow(air_arc: float) -> void:
	# A soft shadow left on the sand makes the jump read at a glance.
	draw_ellipse(Vector2(2, 13), 15.0 - air_arc * 5.0, 5.0 - air_arc * 1.6, Color(0.0, 0.0, 0.0, 0.20 - air_arc * 0.09))

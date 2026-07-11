extends SceneTree

# Headless smoke test for the toy rider animation state machine.
# Run with:
#   godot --headless --path . --script res://tests/rider_animation_smoke.gd
# Drives _process manually with fixed deltas and forced skill values so
# jump outcomes are deterministic.

const ToyRiderScript := preload("res://scripts/ToyRider.gd")
const ObstacleScript := preload("res://scripts/Obstacle.gd")

const STEP := 1.0 / 60.0

var failures: Array[String] = []

func _initialize() -> void:
	_test_takeoff_flight_and_landing()
	_test_roost_while_riding()
	_test_puff_cap_and_fade()
	_test_crash_dust()
	_test_still_finishes_race()

	if failures.is_empty():
		print("RIDER ANIMATION SMOKE TEST PASSED")
		quit(0)
	else:
		for failure in failures:
			push_error(failure)
		print("RIDER ANIMATION SMOKE TEST FAILED (%d failures)" % failures.size())
		quit(1)

func _check(condition: bool, message: String) -> void:
	if not condition:
		failures.append(message)

func _straight_path() -> Array[Vector2]:
	var path: Array[Vector2] = []
	for i in range(11):
		path.append(Vector2(i * 100.0, 0.0))
	return path

func _make_rider(obstacles: Array):
	var rng := RandomNumberGenerator.new()
	rng.seed = 12345
	var rider = ToyRiderScript.new()
	rider.setup(_straight_path(), obstacles, 0.0, rng)
	rider.progress = 0.0
	rider.speed = 120.0
	return rider

func _make_jump(pos: Vector2):
	var obstacle = ObstacleScript.new()
	obstacle.setup("double")
	obstacle.position = pos
	return obstacle

func _force_clean_jumper(rider) -> void:
	rider.skills["jump_skill"] = 1.0
	rider.skills["consistency"] = 1.0
	rider.skills["confidence"] = 1.0
	rider.skills["aggression"] = 0.0

func _force_crasher(rider) -> void:
	rider.skills["jump_skill"] = 0.0
	rider.skills["consistency"] = 0.0
	rider.skills["confidence"] = 0.0
	rider.skills["aggression"] = 1.0

func _test_takeoff_flight_and_landing() -> void:
	var jump = _make_jump(Vector2(300, 0))
	var rider = _make_rider([jump])
	_force_clean_jumper(rider)

	var steps := 0
	while rider.airborne_timer <= 0.0 and steps < 600:
		rider._process(STEP)
		steps += 1
	_check(rider.airborne_timer > 0.0, "takeoff: rider never went airborne over the double")
	_check(rider.wheelie_lift > 0.0, "takeoff: wheelie lift should start on takeoff")
	_check(rider.air_duration > 0.0, "takeoff: air_duration should be recorded")

	rider._process(STEP)
	_check(rider.z_index == 40, "flight: airborne rider should draw above obstacles")
	_check(rider.visual_tilt < 0.0, "flight: early air time should tilt nose up")

	steps = 0
	while rider.airborne_timer > 0.0 and steps < 600:
		rider._process(STEP)
		steps += 1
	_check(rider.landing_bounce_timer > 0.0, "landing: landing bounce should trigger when air time ends")
	_check(rider.puffs.size() > 0, "landing: landing should kick up sand puffs")
	_check(rider.z_index == 18, "landing: rider should return to ground layer")

	rider.free()
	jump.free()

func _test_roost_while_riding() -> void:
	var rider = _make_rider([])
	rider.skills["consistency"] = 0.5
	for i in range(30):
		rider._process(STEP)
	_check(rider.puffs.size() > 0, "roost: a fast rider should spray sand behind the rear wheel")
	_check(rider.bob_phase > 0.0, "roost: riding bob should advance on the ground")
	rider.free()

func _test_puff_cap_and_fade() -> void:
	var rider = _make_rider([])
	for i in range(400):
		rider._process(STEP)
	_check(rider.puffs.size() <= rider.MAX_PUFFS, "puffs: cap exceeded (%d)" % rider.puffs.size())

	rider.speed = 0.0
	rider.finished_race = true
	for i in range(120):
		rider._process(STEP)
	_check(rider.puffs.is_empty(), "puffs: puffs should fade out after the rider stops")
	rider.free()

func _test_crash_dust() -> void:
	var jump = _make_jump(Vector2(300, 0))
	var rider = _make_rider([jump])
	_force_crasher(rider)
	rider._handle_obstacle(jump)
	_check(rider.crashed_timer > 0.0, "crash: forced crasher should crash on the double")
	_check(rider.puffs.size() > 0, "crash: crashing should raise a dust cloud")
	rider.free()
	jump.free()

func _test_still_finishes_race() -> void:
	var rider = _make_rider([])
	# Array container because GDScript lambdas capture locals by value.
	var finish_count := [0]
	rider.finished.connect(func(_rider) -> void: finish_count[0] += 1)
	var steps := 0
	while not rider.finished_race and steps < 4000:
		rider._process(STEP)
		steps += 1
	_check(rider.finished_race, "finish: rider should still finish the race with animation active")
	_check(finish_count[0] == 1, "finish: finished signal should fire exactly once")
	rider.free()

extends Node2D

const ToyRiderScene := preload("res://scripts/ToyRider.gd")

@onready var track_builder = $TrackBuilder
@onready var tool_panel = $ToolPanel
@onready var feedback_system = $FeedbackSystem
@onready var riders_root: Node2D = $Riders
@onready var cozy_camera = $CozyCamera

var rng := RandomNumberGenerator.new()
var active_riders: Array = []
var finished_count := 0
var race_running := false

func _ready() -> void:
	rng.randomize()
	tool_panel.tool_selected.connect(_on_tool_selected)
	tool_panel.race_requested.connect(_on_race_requested)
	track_builder.set_tool("track")
	feedback_system.show_feedback([
		"Draw a smooth track in the sand.",
		"Place a start gate, finish, and a few jumps.",
		"Press Play Race when the imaginary moto is ready."
	])

func _on_tool_selected(tool_name: String) -> void:
	track_builder.set_tool(tool_name)

func _on_race_requested() -> void:
	if race_running:
		return
	var path: Array[Vector2] = track_builder.get_race_path()
	if path.size() < 2:
		feedback_system.show_feedback(["The toy bikes need a smooth track first."])
		return

	_start_race(path)

func _start_race(path: Array[Vector2]) -> void:
	race_running = true
	finished_count = 0
	_clear_riders()
	feedback_system.clear()
	track_builder.set_build_enabled(false)
	tool_panel.set_build_enabled(false)

	var lanes := [-24.0, -8.0, 8.0, 24.0]
	for lane in lanes:
		var rider := ToyRiderScene.new()
		rider.setup(path, track_builder.get_obstacles(), lane, rng)
		rider.finished.connect(_on_rider_finished)
		riders_root.add_child(rider)
		active_riders.append(rider)
	cozy_camera.focus_on_track(path)

func _on_rider_finished(rider) -> void:
	finished_count += 1
	if finished_count >= active_riders.size():
		_end_race()

func _end_race() -> void:
	race_running = false
	var messages: Array[String] = []
	for rider in active_riders:
		if messages.size() < 2:
			messages.append(rider.get_imagination_intro())
	for rider in active_riders:
		for message in rider.get_feedback():
			if messages.size() < 5:
				messages.append(message)

	if _has_obstacle_type("double") and not _feedback_mentions(messages, "double"):
		messages.append("That double might be too big.")
	if _has_obstacle_type("triple") and not _feedback_mentions(messages, "triple"):
		messages.append("The triple is waiting for a brave toy rider.")
	if messages.is_empty():
		messages.append("The little moto felt smooth and fast.")
	messages.append("One more race?")

	feedback_system.show_feedback(messages)
	track_builder.set_build_enabled(true)
	tool_panel.set_build_enabled(true)

func _clear_riders() -> void:
	for child in riders_root.get_children():
		child.queue_free()
	active_riders.clear()

func _has_obstacle_type(obstacle_type: String) -> bool:
	for obstacle in track_builder.get_obstacles():
		if obstacle.obstacle_type == obstacle_type:
			return true
	return false

func _feedback_mentions(messages: Array[String], text: String) -> bool:
	for message in messages:
		if message.contains(text):
			return true
	return false

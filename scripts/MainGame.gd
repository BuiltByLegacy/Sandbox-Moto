extends Node2D

const ToyRiderScene := preload("res://scripts/ToyRider.gd")

@onready var track_builder = $TrackBuilder
@onready var tool_panel = $ToolPanel
@onready var feedback_system = $FeedbackSystem
@onready var riders_root: Node2D = $Riders
@onready var cozy_camera = $CozyCamera
@onready var signature_moment = $SignatureMoment
@onready var photo_mode = $PhotoMode
@onready var sandbox_save = $SandboxSave

var rng := RandomNumberGenerator.new()
var active_riders: Array = []
var finish_order: Array = []
var finished_count := 0
var race_running := false
var wear_timer := 0.0
var signature_active := false

func _process(delta: float) -> void:
	if race_running:
		cozy_camera.focus_on_riders(active_riders)
		_update_rider_pack()
		wear_timer -= delta
		if wear_timer <= 0.0:
			wear_timer = 0.08
			_add_race_wear()

func _ready() -> void:
	rng.randomize()
	tool_panel.tool_selected.connect(_on_tool_selected)
	tool_panel.race_requested.connect(_on_race_requested)
	photo_mode.set_targets([tool_panel, feedback_system])
	track_builder.set_tool("track")

	sandbox_save.setup(track_builder)
	var restored := _restore_saved_sandbox()
	track_builder.track_changed.connect(sandbox_save.mark_dirty)
	sandbox_save.saved.connect(_on_sandbox_saved)

	if restored:
		feedback_system.show_feedback([
			"Your sandbox is just how you left it.",
			"Adjust the track, or press Play Race when the moto is ready."
		])
	else:
		feedback_system.show_feedback([
			"Draw a smooth track in the sand.",
			"Place a start gate, finish, and a few jumps.",
			"Press Play Race when the imaginary moto is ready.",
			"Press P for pretend Polaroid mode."
		])

func _restore_saved_sandbox() -> bool:
	var saved_state: Dictionary = sandbox_save.load_state()
	if saved_state.is_empty():
		return false
	var restored: bool = track_builder.apply_save_state(saved_state["track"])
	if restored:
		var path: Array[Vector2] = track_builder.get_race_path()
		if path.size() >= 2:
			cozy_camera.focus_on_track(path)
	return restored

func _on_sandbox_saved() -> void:
	feedback_system.show_whisper("Sandbox saved")

func _notification(what: int) -> void:
	# Leaving the game is the "Mom called dinner" moment: quietly keep the
	# sandbox exactly as the player left it. Riders are never saved, so a
	# race in progress simply is not part of the snapshot.
	if what == NOTIFICATION_WM_CLOSE_REQUEST:
		if sandbox_save != null:
			sandbox_save.save_now()

func _unhandled_input(event: InputEvent) -> void:
	if not OS.is_debug_build():
		return
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_F9:
		if race_running or signature_active:
			return
		sandbox_save.clear_save()
		track_builder.clear_all()
		feedback_system.show_feedback([
			"Fresh sand! (Dev only: saved sandbox cleared with F9.)",
			"Draw a smooth track to start a new one."
		])

func _on_tool_selected(tool_name: String) -> void:
	track_builder.set_tool(tool_name)

func _on_race_requested() -> void:
	if race_running or signature_active:
		return
	var path: Array[Vector2] = track_builder.get_race_path()
	if path.size() < 2:
		feedback_system.show_feedback(["The toy bikes need a smooth track first."])
		return

	_start_race(path)

func _start_race(path: Array[Vector2]) -> void:
	race_running = true
	sandbox_save.set_autosave_paused(true)
	finished_count = 0
	finish_order.clear()
	wear_timer = 0.0
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
	if not finish_order.has(rider):
		finish_order.append(rider)
	if finished_count >= active_riders.size():
		_end_race()

func _end_race() -> void:
	race_running = false
	var messages: Array[String] = []
	if not finish_order.is_empty():
		var winner = finish_order[0]
		messages.append(winner.get_color_name() + " bike won the pretend moto!")
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
	_add_obstacle_wear()

	feedback_system.show_feedback(messages)
	track_builder.set_build_enabled(true)
	tool_panel.set_build_enabled(true)
	cozy_camera.focus_on_track(track_builder.get_race_path())
	sandbox_save.set_autosave_paused(false)
	sandbox_save.mark_dirty()
	if rng.randf() < 0.30:
		_play_signature_ending()

func _play_signature_ending() -> void:
	signature_active = true
	track_builder.set_build_enabled(false)
	tool_panel.set_build_enabled(false)
	cozy_camera.reveal_sandbox(track_builder.get_race_path())
	await signature_moment.play_mom_called()
	cozy_camera.focus_on_track(track_builder.get_race_path())
	track_builder.set_build_enabled(true)
	tool_panel.set_build_enabled(true)
	signature_active = false

func _clear_riders() -> void:
	for child in riders_root.get_children():
		child.queue_free()
	active_riders.clear()

func _add_race_wear() -> void:
	for rider in active_riders:
		if is_instance_valid(rider) and not rider.finished_race:
			track_builder.add_track_wear(rider.global_position, 0.75)

func _add_obstacle_wear() -> void:
	for obstacle in track_builder.get_obstacles():
		track_builder.add_track_wear(obstacle.global_position, 1.35)
		track_builder.add_track_wear(obstacle.global_position + Vector2(18, 10), 0.95)

func _update_rider_pack() -> void:
	for i in range(active_riders.size()):
		var rider = active_riders[i]
		if not is_instance_valid(rider) or rider.finished_race:
			continue
		var pass_bias := 0.0
		for j in range(active_riders.size()):
			if i == j:
				continue
			var other = active_riders[j]
			if is_instance_valid(other) and not other.finished_race:
				var gap: float = absf(rider.get_progress() - other.get_progress())
				if gap < 34.0:
					pass_bias += signf(float(i - j)) * (34.0 - gap) * 0.35
		rider.nudge_lane(pass_bias)

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

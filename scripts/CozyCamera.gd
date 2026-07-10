class_name CozyCamera
extends Camera2D

const MIN_ZOOM := 0.65
const MAX_ZOOM := 1.45
const ZOOM_STEP := 0.08
const PAN_SPEED := 540.0
const ROTATE_STEP := 0.015
const MAX_ROTATION := 0.08

var dragging := false
var target_zoom := Vector2.ONE
var target_position := Vector2(640, 360)
var target_rotation := 0.0

func _ready() -> void:
	make_current()
	position = target_position
	target_zoom = zoom

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP and event.pressed:
			_set_zoom(target_zoom.x + ZOOM_STEP)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN and event.pressed:
			_set_zoom(target_zoom.x - ZOOM_STEP)
		elif event.button_index == MOUSE_BUTTON_MIDDLE:
			dragging = event.pressed
	elif event is InputEventMouseMotion and dragging:
		target_position -= event.relative / max(target_zoom.x, 0.001)

func _process(delta: float) -> void:
	var move := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
	target_position += move * PAN_SPEED * delta / max(target_zoom.x, 0.001)

	if Input.is_key_pressed(KEY_Q):
		target_rotation -= ROTATE_STEP
	elif Input.is_key_pressed(KEY_E):
		target_rotation += ROTATE_STEP
	else:
		target_rotation = lerpf(target_rotation, 0.0, delta * 1.7)
	target_rotation = clampf(target_rotation, -MAX_ROTATION, MAX_ROTATION)

	position = position.lerp(target_position, min(delta * 8.0, 1.0))
	zoom = zoom.lerp(target_zoom, min(delta * 8.0, 1.0))
	rotation = lerpf(rotation, target_rotation, min(delta * 8.0, 1.0))

func focus_on_track(points: Array[Vector2]) -> void:
	if points.is_empty():
		return
	var min_point := points[0]
	var max_point := points[0]
	for point in points:
		min_point.x = minf(min_point.x, point.x)
		min_point.y = minf(min_point.y, point.y)
		max_point.x = maxf(max_point.x, point.x)
		max_point.y = maxf(max_point.y, point.y)
	target_position = min_point.lerp(max_point, 0.5)

func _set_zoom(value: float) -> void:
	var clamped := clampf(value, MIN_ZOOM, MAX_ZOOM)
	target_zoom = Vector2(clamped, clamped)

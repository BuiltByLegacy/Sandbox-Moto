class_name PhotoMode
extends CanvasLayer

var overlay: Control
var frame: PanelContainer
var caption: Label
var targets_to_hide: Array = []
var photo_active := false

func _ready() -> void:
	layer = 20
	_build_overlay()
	visible = false

func set_targets(layers: Array) -> void:
	targets_to_hide = layers

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_P:
			toggle()
		elif event.keycode == KEY_F12:
			await save_screenshot()
		elif event.keycode == KEY_H and photo_active:
			_set_target_visibility(not _any_target_visible())

func toggle() -> void:
	photo_active = not photo_active
	visible = photo_active
	_set_target_visibility(not photo_active)

func save_screenshot() -> void:
	var was_visible := visible
	var was_active := photo_active
	if not photo_active:
		photo_active = true
		visible = true
		_set_target_visibility(false)
	await RenderingServer.frame_post_draw
	var image := get_viewport().get_texture().get_image()
	var timestamp := Time.get_datetime_string_from_system().replace(":", "-")
	image.save_png("user://sandbox_moto_photo_" + timestamp + ".png")
	photo_active = was_active
	visible = was_visible
	_set_target_visibility(not photo_active)

func _build_overlay() -> void:
	overlay = Control.new()
	overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(overlay)

	var golden := ColorRect.new()
	golden.color = Color(1.0, 0.78, 0.42, 0.10)
	golden.set_anchors_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(golden)

	frame = PanelContainer.new()
	frame.offset_left = 58
	frame.offset_top = 38
	frame.offset_right = 1222
	frame.offset_bottom = 682
	var style := StyleBoxFlat.new()
	style.bg_color = Color(1, 1, 1, 0.0)
	style.border_color = Color(1.0, 0.94, 0.82, 0.92)
	style.set_border_width_all(12)
	style.corner_radius_top_left = 4
	style.corner_radius_top_right = 4
	style.corner_radius_bottom_left = 4
	style.corner_radius_bottom_right = 4
	frame.add_theme_stylebox_override("panel", style)
	overlay.add_child(frame)

	caption = Label.new()
	caption.text = "Sandbox Moto  /  pretend Polaroid"
	caption.offset_left = 84
	caption.offset_top = 628
	caption.add_theme_color_override("font_color", Color(0.28, 0.18, 0.10))
	caption.add_theme_font_size_override("font_size", 18)
	overlay.add_child(caption)

func _set_target_visibility(next_visible: bool) -> void:
	for target in targets_to_hide:
		if is_instance_valid(target):
			target.visible = next_visible

func _any_target_visible() -> bool:
	for target in targets_to_hide:
		if is_instance_valid(target) and target.visible:
			return true
	return false

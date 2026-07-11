class_name TrackNameplate
extends CanvasLayer

# The track's name, scribbled proudly above the sandbox. Click it to type
# your own, or press New Name for another kid-style suggestion.

signal name_changed(new_name: String)
signal shuffle_requested
signal editing_changed(editing: bool)

var name_edit: LineEdit
var shuffle_button: Button

func _ready() -> void:
	var row := HBoxContainer.new()
	row.offset_left = 430
	row.offset_top = 12
	row.add_theme_constant_override("separation", 8)
	add_child(row)

	name_edit = LineEdit.new()
	name_edit.custom_minimum_size = Vector2(330, 36)
	name_edit.alignment = HORIZONTAL_ALIGNMENT_CENTER
	name_edit.max_length = 28
	name_edit.placeholder_text = "Name your track"
	name_edit.add_theme_font_size_override("font_size", 19)
	name_edit.add_theme_color_override("font_color", Color(0.30, 0.18, 0.08))
	name_edit.add_theme_color_override("font_placeholder_color", Color(0.30, 0.18, 0.08, 0.45))
	var style := StyleBoxFlat.new()
	style.bg_color = Color(1.0, 0.93, 0.74, 0.55)
	style.border_color = Color(0.50, 0.33, 0.16, 0.30)
	style.set_border_width_all(1)
	style.corner_radius_top_left = 10
	style.corner_radius_top_right = 10
	style.corner_radius_bottom_left = 10
	style.corner_radius_bottom_right = 10
	name_edit.add_theme_stylebox_override("normal", style)
	name_edit.text_changed.connect(func(text: String) -> void: name_changed.emit(text))
	name_edit.focus_entered.connect(func() -> void: editing_changed.emit(true))
	name_edit.focus_exited.connect(func() -> void: editing_changed.emit(false))
	name_edit.text_submitted.connect(func(_text: String) -> void: name_edit.release_focus())
	row.add_child(name_edit)

	shuffle_button = Button.new()
	shuffle_button.text = "New Name"
	shuffle_button.focus_mode = Control.FOCUS_NONE
	shuffle_button.custom_minimum_size = Vector2(0, 36)
	shuffle_button.add_theme_font_size_override("font_size", 13)
	shuffle_button.pressed.connect(func() -> void: shuffle_requested.emit())
	row.add_child(shuffle_button)

func set_track_name(new_name: String) -> void:
	# Programmatic set: text_changed does not fire, so no signal loop.
	name_edit.text = new_name

func get_track_name() -> String:
	return name_edit.text

func set_build_enabled(enabled: bool) -> void:
	name_edit.editable = enabled
	shuffle_button.disabled = not enabled
	if not enabled:
		name_edit.release_focus()

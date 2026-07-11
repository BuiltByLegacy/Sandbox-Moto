class_name FeedbackSystem
extends CanvasLayer

var bubble_container: VBoxContainer

func _ready() -> void:
	bubble_container = VBoxContainer.new()
	bubble_container.name = "Bubbles"
	bubble_container.offset_left = 235
	bubble_container.offset_top = 22
	bubble_container.custom_minimum_size = Vector2(430, 0)
	bubble_container.add_theme_constant_override("separation", 8)
	add_child(bubble_container)

func show_feedback(messages: Array) -> void:
	clear()
	for message in messages:
		var label := Label.new()
		label.text = message
		label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		label.add_theme_color_override("font_color", Color(0.20, 0.13, 0.07))
		label.add_theme_font_size_override("font_size", 15)

		var bubble := PanelContainer.new()
		bubble.custom_minimum_size = Vector2(360, 36)
		var style := StyleBoxFlat.new()
		style.bg_color = Color(1.0, 0.91, 0.70, 0.94)
		style.border_color = Color(0.50, 0.33, 0.16, 0.35)
		style.set_border_width_all(1)
		style.corner_radius_top_left = 8
		style.corner_radius_top_right = 8
		style.corner_radius_bottom_left = 8
		style.corner_radius_bottom_right = 8
		style.content_margin_left = 12
		style.content_margin_right = 12
		style.content_margin_top = 8
		style.content_margin_bottom = 8
		bubble.add_theme_stylebox_override("panel", style)
		bubble.add_child(label)
		bubble_container.add_child(bubble)

func show_whisper(text: String) -> void:
	# A tiny corner note that fades away on its own. Used for quiet moments
	# like autosave, where a full feedback bubble would feel too loud.
	var whisper := Label.new()
	whisper.text = text
	whisper.offset_left = 1090
	whisper.offset_top = 688
	whisper.add_theme_color_override("font_color", Color(0.32, 0.21, 0.11, 0.75))
	whisper.add_theme_font_size_override("font_size", 13)
	add_child(whisper)
	var tween := create_tween()
	tween.tween_interval(1.2)
	tween.tween_property(whisper, "modulate:a", 0.0, 0.9)
	tween.tween_callback(whisper.queue_free)

func clear() -> void:
	for child in bubble_container.get_children():
		child.queue_free()

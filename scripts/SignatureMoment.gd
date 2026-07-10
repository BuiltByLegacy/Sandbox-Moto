class_name SignatureMoment
extends CanvasLayer

signal finished

var fade: ColorRect
var card: PanelContainer
var label: Label

func _ready() -> void:
	visible = false

	fade = ColorRect.new()
	fade.color = Color(0.30, 0.19, 0.09, 0.0)
	fade.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(fade)

	card = PanelContainer.new()
	card.custom_minimum_size = Vector2(420, 118)
	card.offset_left = 430
	card.offset_top = 286
	var style := StyleBoxFlat.new()
	style.bg_color = Color(1.0, 0.90, 0.68, 0.0)
	style.border_color = Color(0.46, 0.30, 0.15, 0.0)
	style.set_border_width_all(2)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	style.content_margin_left = 20
	style.content_margin_right = 20
	style.content_margin_top = 16
	style.content_margin_bottom = 16
	card.add_theme_stylebox_override("panel", style)
	add_child(card)

	label = Label.new()
	label.text = ""
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.modulate.a = 0.0
	label.add_theme_color_override("font_color", Color(0.21, 0.13, 0.07))
	label.add_theme_font_size_override("font_size", 20)
	card.add_child(label)

func play_mom_called() -> void:
	visible = true
	label.text = "Mom called Dinner!\nThe sandbox freezes exactly how you left it.\nSaved to the pretend scrapbook."

	var tween := create_tween()
	tween.set_parallel(true)
	tween.tween_property(fade, "color:a", 0.30, 0.65)
	tween.tween_property(card.get_theme_stylebox("panel"), "bg_color:a", 0.96, 0.65)
	tween.tween_property(card.get_theme_stylebox("panel"), "border_color:a", 0.55, 0.65)
	tween.tween_property(label, "modulate:a", 1.0, 0.65)
	tween.set_parallel(false)
	tween.tween_interval(2.2)
	tween.set_parallel(true)
	tween.tween_property(fade, "color:a", 0.0, 0.65)
	tween.tween_property(card.get_theme_stylebox("panel"), "bg_color:a", 0.0, 0.65)
	tween.tween_property(card.get_theme_stylebox("panel"), "border_color:a", 0.0, 0.65)
	tween.tween_property(label, "modulate:a", 0.0, 0.65)
	await tween.finished

	visible = false
	finished.emit()

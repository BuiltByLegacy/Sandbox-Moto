class_name LivingSandbox
extends Node2D

var breeze := 0.0

func _process(delta: float) -> void:
	breeze += delta
	queue_redraw()

func _draw() -> void:
	_draw_cloud_shadows()
	_draw_oversized_grass()
	_draw_toy_props()
	_draw_leaves_and_butterflies()

func _draw_cloud_shadows() -> void:
	for i in range(3):
		var x := 330.0 + i * 280.0 + sin(breeze * 0.18 + i) * 28.0
		var y := 118.0 + i * 86.0
		draw_ellipse(Vector2(x, y), 110.0, 34.0, Color(0.30, 0.22, 0.14, 0.055))

func _draw_oversized_grass() -> void:
	for i in range(18):
		var base := Vector2(225.0 + i * 58.0, 704.0 + sin(float(i)) * 10.0)
		var sway := sin(breeze * 1.2 + float(i) * 0.7) * 8.0
		var tip := base + Vector2(sway, -58.0 - float(i % 4) * 14.0)
		draw_line(base, tip, Color(0.22, 0.43, 0.20, 0.78), 4.0)
		draw_circle(tip, 3.0, Color(0.30, 0.55, 0.24, 0.72))

func _draw_toy_props() -> void:
	draw_circle(Vector2(1160, 120), 42, Color(0.82, 0.12, 0.10, 0.92))
	draw_circle(Vector2(1160, 120), 26, Color(0.96, 0.68, 0.34, 0.92))
	draw_rect(Rect2(Vector2(1116, 158), Vector2(88, 18)), Color(0.72, 0.08, 0.07, 0.92), true)

	draw_rect(Rect2(Vector2(1070, 588), Vector2(104, 42)), Color(0.96, 0.74, 0.20, 0.95), true)
	draw_circle(Vector2(1092, 634), 10, Color(0.08, 0.08, 0.07))
	draw_circle(Vector2(1148, 634), 10, Color(0.08, 0.08, 0.07))
	draw_rect(Rect2(Vector2(1162, 596), Vector2(30, 26)), Color(0.70, 0.50, 0.18, 0.95), true)

	for i in range(6):
		var x := 244.0 + i * 34.0
		draw_line(Vector2(x, 46), Vector2(x, 86), Color(0.62, 0.44, 0.27, 0.72), 3.0)
		draw_line(Vector2(x - 12, 58), Vector2(x + 20, 58), Color(0.62, 0.44, 0.27, 0.72), 2.0)

func _draw_leaves_and_butterflies() -> void:
	for i in range(7):
		var p := Vector2(294.0 + i * 126.0 + sin(breeze * 0.7 + i) * 18.0, 92.0 + fmod(float(i * 71), 430.0))
		draw_ellipse(p, 10.0, 4.0, Color(0.44, 0.30, 0.12, 0.32))
	for i in range(3):
		var p := Vector2(430.0 + i * 220.0 + sin(breeze * 1.6 + i) * 28.0, 150.0 + cos(breeze * 1.1 + i) * 18.0)
		draw_circle(p + Vector2(-4, 0), 4.0, Color(1.0, 0.84, 0.25, 0.58))
		draw_circle(p + Vector2(4, 0), 4.0, Color(1.0, 0.84, 0.25, 0.58))
		draw_line(p + Vector2(0, -5), p + Vector2(0, 5), Color(0.20, 0.13, 0.08, 0.55), 1.0)

class_name Obstacle
extends Node2D

const COLORS := {
	"single": Color(0.58, 0.35, 0.18),
	"double": Color(0.62, 0.38, 0.18),
	"triple": Color(0.68, 0.41, 0.19),
	"tabletop": Color(0.55, 0.36, 0.22),
	"whoops": Color(0.76, 0.54, 0.28),
	"sand": Color(0.92, 0.76, 0.47, 0.9),
	"rollers": Color(0.70, 0.48, 0.25),
	"hill": Color(0.50, 0.38, 0.20),
	"dozer": Color(0.92, 0.70, 0.18)
}

const LABELS := {
	"single": "Single",
	"double": "Double",
	"triple": "Triple",
	"tabletop": "Table",
	"whoops": "Whoops",
	"sand": "Sand",
	"rollers": "Rollers",
	"hill": "Hill",
	"dozer": "Dozer"
}

var obstacle_type := "single"
var radius := 34.0

func setup(next_type: String) -> void:
	obstacle_type = next_type
	queue_redraw()

func get_difficulty() -> float:
	match obstacle_type:
		"single":
			return 0.25
		"double":
			return 0.55
		"triple":
			return 0.82
		"tabletop":
			return 0.45
		"whoops":
			return 0.58
		"sand":
			return 0.62
		"rollers":
			return 0.42
		"hill":
			return 0.50
		_:
			return 0.20

func get_skill_key() -> String:
	match obstacle_type:
		"whoops":
			return "whoop_skill"
		"sand":
			return "sand_skill"
		"rollers":
			return "roller_skill"
		"hill":
			return "hill_skill"
		_:
			return "jump_skill"

func is_jump() -> bool:
	return obstacle_type in ["single", "double", "triple", "tabletop"]

func _draw() -> void:
	var color: Color = COLORS.get(obstacle_type, Color.SADDLE_BROWN)
	var label: String = LABELS.get(obstacle_type, obstacle_type.capitalize())

	match obstacle_type:
		"whoops":
			for i in range(5):
				draw_circle(Vector2(-28 + i * 14, 0), 8, color)
		"rollers":
			for i in range(3):
				draw_circle(Vector2(-24 + i * 24, 0), 13, color)
		"sand":
			draw_rect(Rect2(Vector2(-42, -24), Vector2(84, 48)), color, true)
			for i in range(7):
				draw_circle(Vector2(-32 + i * 11, -4 + (i % 2) * 10), 3, Color(0.98, 0.84, 0.55, 0.8))
		"dozer":
			draw_rect(Rect2(Vector2(-24, -16), Vector2(48, 32)), color, true)
			draw_rect(Rect2(Vector2(18, -24), Vector2(16, 48)), Color(0.55, 0.42, 0.24), true)
		"triple":
			for i in range(3):
				draw_polygon(PackedVector2Array([Vector2(-45 + i * 32, 16), Vector2(-29 + i * 32, -20), Vector2(-13 + i * 32, 16)]), PackedColorArray([color]))
		"double":
			for i in range(2):
				draw_polygon(PackedVector2Array([Vector2(-34 + i * 38, 16), Vector2(-15 + i * 38, -20), Vector2(4 + i * 38, 16)]), PackedColorArray([color]))
		"tabletop":
			draw_polygon(PackedVector2Array([Vector2(-44, 16), Vector2(-22, -18), Vector2(22, -18), Vector2(44, 16)]), PackedColorArray([color]))
		"hill":
			draw_circle(Vector2.ZERO, 30, color)
		_:
			draw_polygon(PackedVector2Array([Vector2(-26, 16), Vector2(0, -22), Vector2(26, 16)]), PackedColorArray([color]))

	draw_arc(Vector2.ZERO, radius, 0.0, TAU, 48, Color(0.35, 0.24, 0.15, 0.45), 2.0)
	draw_string(ThemeDB.fallback_font, Vector2(-24, 45), label, HORIZONTAL_ALIGNMENT_LEFT, 80, 12, Color(0.24, 0.16, 0.10))


class_name Obstacle
extends Node2D

const COLORS := {
	"single": Color(0.73, 0.45, 0.22),
	"double": Color(0.75, 0.46, 0.22),
	"triple": Color(0.78, 0.48, 0.22),
	"tabletop": Color(0.73, 0.45, 0.24),
	"whoops": Color(0.80, 0.56, 0.30),
	"sand": Color(0.94, 0.80, 0.52, 0.92),
	"berm": Color(0.74, 0.45, 0.22),
	"rollers": Color(0.78, 0.52, 0.28),
	"hill": Color(0.70, 0.46, 0.24),
	"dozer": Color(0.92, 0.70, 0.18)
}
const SHADOW := Color(0.20, 0.13, 0.08, 0.20)

const LABELS := {
	"single": "Single",
	"double": "Double",
	"triple": "Triple",
	"tabletop": "Table",
	"whoops": "Whoops",
	"sand": "Sand",
	"berm": "Berm",
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
		"berm":
			return 0.35
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
		"berm":
			return "roller_skill"
		"rollers":
			return "roller_skill"
		"hill":
			return "hill_skill"
		_:
			return "jump_skill"

func is_jump() -> bool:
	return obstacle_type in ["single", "double", "triple", "tabletop"]

# A shaded dirt kicker: darker packed base, a lit takeoff face, and a bright
# worn lip at the crest - so a jump reads as sculpted dirt, not a flat triangle.
func _kicker(cx: float, color: Color, half_w := 18.0, h := 20.0) -> void:
	var deep := color.darkened(0.26)
	var lip := color.lightened(0.34)
	draw_colored_polygon(PackedVector2Array([
		Vector2(cx - half_w, 16), Vector2(cx - half_w * 0.28, -h),
		Vector2(cx + half_w * 0.28, -h), Vector2(cx + half_w, 16)]), deep)
	# lit takeoff face (approach side)
	draw_colored_polygon(PackedVector2Array([
		Vector2(cx - half_w, 16), Vector2(cx - half_w * 0.28, -h),
		Vector2(cx + 2, -h), Vector2(cx - 3, 16)]), color)
	draw_line(Vector2(cx - half_w * 0.28, -h), Vector2(cx + half_w * 0.28, -h), lip, 3.0)

func _hump(cx: float, color: Color, r: float) -> void:
	draw_circle(Vector2(cx, 2), r, color.darkened(0.18))
	draw_circle(Vector2(cx - r * 0.25, -r * 0.2), r * 0.7, color.lightened(0.22))

func _draw() -> void:
	var color: Color = COLORS.get(obstacle_type, Color.SADDLE_BROWN)
	var label: String = LABELS.get(obstacle_type, obstacle_type.capitalize())

	# soft ground shadow beneath every feature
	if obstacle_type != "sand":
		draw_circle(Vector2(5, 10), radius * 0.85, SHADOW)

	match obstacle_type:
		"whoops":
			for i in range(6):
				_hump(-30 + i * 12, color, 7)
		"rollers":
			for i in range(3):
				_hump(-24 + i * 24, color, 13)
		"sand":
			draw_circle(Vector2(2, 6), 40, SHADOW)
			draw_circle(Vector2.ZERO, 38, color.darkened(0.06))
			draw_circle(Vector2(-3, -3), 30, color.lightened(0.08))
			for i in range(6):
				var a := float(i) / 6.0 * TAU
				draw_arc(Vector2(cos(a) * 6, sin(a) * 6), 10 + (i % 3) * 8, PI * 0.1, PI * 0.9, 14, Color(0.98, 0.86, 0.58, 0.5), 2.0)
		"berm":
			# banked wall: darker outer bank, lit inner ride line
			draw_arc(Vector2.ZERO, 32, PI * 0.15, PI * 1.15, 28, color.darkened(0.22), 16.0)
			draw_arc(Vector2.ZERO, 24, PI * 0.15, PI * 1.15, 26, color, 8.0)
			draw_arc(Vector2.ZERO, 19, PI * 0.15, PI * 1.15, 24, color.lightened(0.32), 3.0)
		"dozer":
			draw_rect(Rect2(Vector2(-24, -16), Vector2(48, 32)), color, true)
			draw_rect(Rect2(Vector2(18, -24), Vector2(16, 48)), Color(0.55, 0.42, 0.24), true)
		"triple":
			_kicker(-30, color, 15, 18)
			_kicker(0, color, 15, 20)
			_kicker(30, color, 15, 16)
		"double":
			_kicker(-18, color, 16, 19)
			_kicker(19, color, 16, 16)
		"tabletop":
			draw_colored_polygon(PackedVector2Array([
				Vector2(-44, 16), Vector2(-22, -18), Vector2(22, -18), Vector2(44, 16)]), color.darkened(0.22))
			draw_colored_polygon(PackedVector2Array([
				Vector2(-22, -18), Vector2(22, -18), Vector2(18, -12), Vector2(-18, -12)]), color.lightened(0.28))
		"hill":
			_hump(0, color, 30)
		_:
			_kicker(0, color, 20, 22)

	draw_arc(Vector2.ZERO, radius, 0.0, TAU, 48, Color(0.35, 0.24, 0.15, 0.35), 2.0)
	draw_string(ThemeDB.fallback_font, Vector2(-24, 45), label, HORIZONTAL_ALIGNMENT_LEFT, 80, 12, Color(0.24, 0.16, 0.10))

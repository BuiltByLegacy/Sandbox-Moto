class_name ToolPanel
extends CanvasLayer

signal tool_selected(tool_name: String)
signal race_requested

const TOOLS := [
	{"label": "Shovel / Track", "tool": "track"},
	{"label": "Start Gate", "tool": "start"},
	{"label": "Finish", "tool": "finish"},
	{"label": "Single", "tool": "single"},
	{"label": "Double", "tool": "double"},
	{"label": "Triple", "tool": "triple"},
	{"label": "Tabletop", "tool": "tabletop"},
	{"label": "Whoops", "tool": "whoops"},
	{"label": "Sand", "tool": "sand"},
	{"label": "Berm", "tool": "berm"},
	{"label": "Rollers", "tool": "rollers"},
	{"label": "Hill", "tool": "hill"},
	{"label": "Dozer", "tool": "dozer"},
]

var buttons: Dictionary = {}
var active_tool := "track"
var panel: PanelContainer

func _ready() -> void:
	panel = PanelContainer.new()
	panel.name = "Panel"
	panel.offset_left = 16
	panel.offset_top = 16
	panel.custom_minimum_size = Vector2(170, 0)
	add_child(panel)

	var style := StyleBoxFlat.new()
	style.bg_color = Color(0.98, 0.86, 0.62, 0.92)
	style.border_color = Color(0.46, 0.29, 0.13, 0.55)
	style.set_border_width_all(2)
	style.corner_radius_top_left = 8
	style.corner_radius_top_right = 8
	style.corner_radius_bottom_left = 8
	style.corner_radius_bottom_right = 8
	panel.add_theme_stylebox_override("panel", style)

	var list := VBoxContainer.new()
	list.add_theme_constant_override("separation", 6)
	panel.add_child(list)

	var title := Label.new()
	title.text = "Sandbox Moto"
	title.add_theme_color_override("font_color", Color(0.24, 0.15, 0.08))
	list.add_child(title)

	for tool_info in TOOLS:
		var button := Button.new()
		button.text = tool_info.label
		button.focus_mode = Control.FOCUS_NONE
		button.custom_minimum_size = Vector2(140, 32)
		button.pressed.connect(_on_tool_pressed.bind(tool_info.tool))
		list.add_child(button)
		buttons[tool_info.tool] = button

	var race_button := Button.new()
	race_button.text = "Play Race"
	race_button.focus_mode = Control.FOCUS_NONE
	race_button.custom_minimum_size = Vector2(140, 38)
	race_button.pressed.connect(func() -> void: race_requested.emit())
	list.add_child(race_button)
	buttons["race"] = race_button

	_refresh_buttons()

func set_build_enabled(enabled: bool) -> void:
	for key in buttons:
		buttons[key].disabled = not enabled
	buttons["race"].disabled = not enabled

func _on_tool_pressed(tool_name: String) -> void:
	active_tool = tool_name
	_refresh_buttons()
	tool_selected.emit(tool_name)

func _refresh_buttons() -> void:
	for key in buttons:
		var button: Button = buttons[key]
		if key == active_tool:
			button.add_theme_color_override("font_color", Color(0.12, 0.08, 0.04))
			button.modulate = Color(1.0, 0.93, 0.68)
		else:
			button.remove_theme_color_override("font_color")
			button.modulate = Color.WHITE

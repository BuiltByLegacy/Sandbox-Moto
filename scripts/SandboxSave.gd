class_name SandboxSave
extends Node

signal saved

const SAVE_PATH := "user://sandbox_save.json"
const SAVE_VERSION := 1
const LOCATION_ID := "backyard_sandbox"
const AUTOSAVE_DEBOUNCE_SECONDS := 2.5

var save_path := SAVE_PATH
var track_name := ""
# Deliberately untyped: SandboxSave only needs get_save_state() from the
# builder, and avoiding the class_name keeps this script loadable in
# standalone headless test runs.
var track_builder: Node2D
var seconds_until_save := -1.0
var autosave_paused := false
var pending_while_paused := false

func setup(builder: Node2D) -> void:
	track_builder = builder

func _process(delta: float) -> void:
	if seconds_until_save < 0.0:
		return
	seconds_until_save -= delta
	if seconds_until_save <= 0.0:
		seconds_until_save = -1.0
		save_now()

func mark_dirty() -> void:
	if autosave_paused:
		pending_while_paused = true
		return
	if seconds_until_save < 0.0:
		seconds_until_save = AUTOSAVE_DEBOUNCE_SECONDS

func set_autosave_paused(paused: bool) -> void:
	autosave_paused = paused
	if paused:
		if seconds_until_save >= 0.0:
			seconds_until_save = -1.0
			pending_while_paused = true
	elif pending_while_paused:
		pending_while_paused = false
		mark_dirty()

func save_now() -> bool:
	if track_builder == null:
		return false
	var payload := {
		"save_version": SAVE_VERSION,
		"saved_at": Time.get_datetime_string_from_system(),
		"location_id": LOCATION_ID,
		"track_name": track_name,
		"track": track_builder.get_save_state()
	}
	var file := FileAccess.open(save_path, FileAccess.WRITE)
	if file == null:
		push_warning("Sandbox save skipped: could not write %s (%s)." % [save_path, error_string(FileAccess.get_open_error())])
		return false
	file.store_string(JSON.stringify(payload, "  "))
	file.close()
	saved.emit()
	return true

func load_state() -> Dictionary:
	# Returns an empty dictionary when there is nothing safe to restore,
	# so a fresh sandbox is always the fallback.
	if not FileAccess.file_exists(save_path):
		return {}
	var file := FileAccess.open(save_path, FileAccess.READ)
	if file == null:
		push_warning("Sandbox save ignored: could not read %s (%s)." % [save_path, error_string(FileAccess.get_open_error())])
		return {}
	var text := file.get_as_text()
	file.close()
	if text.strip_edges().is_empty():
		return {}
	var parsed: Variant = JSON.parse_string(text)
	if not parsed is Dictionary:
		push_warning("Sandbox save ignored: %s is not valid JSON." % save_path)
		return {}
	var version: Variant = parsed.get("save_version")
	if not version is float and not version is int:
		push_warning("Sandbox save ignored: missing save_version.")
		return {}
	if int(version) < 1 or int(version) > SAVE_VERSION:
		push_warning("Sandbox save ignored: unsupported save_version %d." % int(version))
		return {}
	# Future save_version bumps run their migrations here before returning.
	if not parsed.get("track") is Dictionary:
		push_warning("Sandbox save ignored: missing track data.")
		return {}
	return parsed

func clear_save() -> void:
	seconds_until_save = -1.0
	pending_while_paused = false
	if FileAccess.file_exists(save_path):
		DirAccess.remove_absolute(save_path)

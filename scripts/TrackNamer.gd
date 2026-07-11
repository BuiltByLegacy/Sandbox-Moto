class_name TrackNamer
extends RefCounted

# Suggests track names that sound like a kid made them up on the spot.
# Tone reference: docs/memory_scrapbook.md - Dragon Hill, Mega Jump Raceway,
# Backyard National, Big Sand SX, The Impossible Triple.

const MAX_NAME_LENGTH := 28

const PREFIXES := [
	"Mega", "Big", "Super", "Turbo", "Secret", "Backyard",
	"Dusty", "Muddy", "Tiny", "Wild", "Monster", "Lucky"
]

const VENUES := [
	"Raceway", "Speedway", "National", "SX", "Supercross",
	"Classic", "Showdown", "Track", "500"
]

# Names that work for any track, straight from the scrapbook doc's tone.
const ANYTIME_NAMES := [
	"Dragon Hill",
	"Backyard National",
	"Dad's Garage Supercross",
	"The Secret Track",
	"Big Air Sunday",
	"Sandbox Nationals",
	"After School Special"
]

# Feature words used to build names from what is actually on the track.
const FEATURE_WORDS := {
	"single": "Jump",
	"double": "Double",
	"triple": "Triple",
	"tabletop": "Tabletop",
	"whoops": "Whoop",
	"sand": "Sand",
	"berm": "Berm",
	"rollers": "Roller",
	"hill": "Hill"
}

# Whole names that only make sense when their feature is really there.
const FEATURE_SPECIALS := {
	"triple": ["The Impossible Triple", "Triple Trouble"],
	"berm": ["Bucket Turn Speedway", "Berm City"],
	"sand": ["Big Sand SX", "The Sand Trap"],
	"whoops": ["Wobble Whoops Raceway"],
	"hill": ["Dragon Hill", "King Of The Hill"],
	"tabletop": ["Picnic Table Nationals"]
}

static func suggest_name(obstacle_types: Array, rng: RandomNumberGenerator) -> String:
	var present: Array[String] = []
	for feature in FEATURE_WORDS:
		if feature in obstacle_types and not feature in present:
			present.append(feature)

	if not present.is_empty() and rng.randf() < 0.72:
		var feature: String = present[rng.randi_range(0, present.size() - 1)]
		if FEATURE_SPECIALS.has(feature) and rng.randf() < 0.38:
			var specials: Array = FEATURE_SPECIALS[feature]
			return specials[rng.randi_range(0, specials.size() - 1)]
		var prefix: String = PREFIXES[rng.randi_range(0, PREFIXES.size() - 1)]
		var venue: String = VENUES[rng.randi_range(0, VENUES.size() - 1)]
		return prefix + " " + FEATURE_WORDS[feature] + " " + venue

	if rng.randf() < 0.5:
		return ANYTIME_NAMES[rng.randi_range(0, ANYTIME_NAMES.size() - 1)]
	var prefix: String = PREFIXES[rng.randi_range(0, PREFIXES.size() - 1)]
	var venue: String = VENUES[rng.randi_range(0, VENUES.size() - 1)]
	return prefix + " Jump " + venue

static func clean_name(raw: Variant) -> String:
	# Shared sanitizer for typed and loaded names.
	if not raw is String:
		return ""
	var cleaned: String = raw.strip_edges()
	if cleaned.length() > MAX_NAME_LENGTH:
		cleaned = cleaned.substr(0, MAX_NAME_LENGTH).strip_edges()
	return cleaned

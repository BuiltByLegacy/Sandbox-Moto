const canvas = document.querySelector("#sandbox");
const ctx = canvas.getContext("2d");
const toolsRoot = document.querySelector("#tools");
const raceButton = document.querySelector("#raceButton");
const resetButton = document.querySelector("#resetButton");
const modeLabel = document.querySelector("#modeLabel");
const feedback = document.querySelector("#feedback");
const feedbackText = document.querySelector("#feedbackText");
const oneMoreButton = document.querySelector("#oneMoreButton");
const raceBanner = document.querySelector("#raceBanner");
const sandboxWrap = document.querySelector(".sandbox-wrap");
const status = document.querySelector(".status");
const toolHint = document.querySelector("#toolHint");

const TOOL_DEFS = [
  ["track", "⌁", "Track", "Drag through the sand"],
  ["start", "▥", "Start", "Place the start gate"],
  ["finish", "⚑", "Finish", "Place the finish marker"],
  ["single", "⌃", "Single", "Place a little jump"],
  ["double", "⌃⌃", "Double", "Risk and reward"],
  ["triple", "⌃⌃⌃", "Triple", "The brave line"],
  ["tabletop", "▰", "Tabletop", "A friendly big jump"],
  ["whoops", "∿", "Whoops", "A bumpy rhythm section"],
  ["rollers", "≈", "Rollers", "A smooth rhythm section"],
  ["sand", "░", "Deep sand", "A soft slow section"],
  ["berm", "◒", "Berm", "A banked toy turn"],
  ["hill", "▲", "Hill", "A tiny mountain"],
  ["dozer", "▣", "Dozer", "Remove nearby pieces"],
  ["undo", "↶", "Undo", "Take back the last change"]
];

const BIKE_COLORS = [
  ["Red", "#d94b35"], ["Blue", "#377bc0"], ["Green", "#4f945c"],
  ["Yellow", "#e4b73f"], ["Purple", "#8763a4"], ["Orange", "#e87938"]
];
const PERSONALITIES = ["fearless", "careful", "always sends it", "smooth", "a bad starter", "a great jumper", "loves whoops"];
const JUMPS = new Set(["single", "double", "triple", "tabletop"]);
const DIFFICULTY = { single: .25, double: .52, triple: .76, tabletop: .44, whoops: .56, rollers: .36, sand: .58, berm: .3, hill: .48 };

let width = 0;
let height = 0;
let activeTool = "track";
let path = [];
let start = null;
let finish = null;
let obstacles = [];
let history = [];
let riders = [];
let trackWear = [];
let drawing = false;
let racing = false;
let lastTime = 0;
let finishOrder = [];
let feedbackTimer = 0;
let grains = [];

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = rect.width;
  height = rect.height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!grains.length) makeGrains();
}

function makeGrains() {
  grains = Array.from({ length: 320 }, (_, i) => ({
    x: (i * 83.71) % Math.max(width, 1), y: (i * 47.33) % Math.max(height, 1),
    r: .5 + (i % 4) * .35, a: .06 + (i % 5) * .018
  }));
}

function createTools() {
  for (const [id, symbol, label, hint] of TOOL_DEFS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tool${id === activeTool ? " active" : ""}`;
    button.dataset.tool = id;
    button.title = hint;
    button.innerHTML = `<span class="tool-symbol">${symbol}</span><span>${label}</span>`;
    button.addEventListener("click", () => selectTool(id, hint));
    toolsRoot.append(button);
  }
}

function selectTool(tool, hint) {
  if (racing) return;
  if (tool === "undo") return undo();
  activeTool = tool;
  toolHint.textContent = hint;
  document.querySelectorAll(".tool").forEach(button => button.classList.toggle("active", button.dataset.tool === tool));
}

function snapshot() {
  history.push(JSON.stringify({ path, start, finish, obstacles, trackWear }));
  if (history.length > 20) history.shift();
}

function undo() {
  const previous = history.pop();
  if (!previous) return;
  ({ path, start, finish, obstacles, trackWear } = JSON.parse(previous));
}

function pointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

canvas.addEventListener("pointerdown", event => {
  if (racing) return;
  const p = pointerPosition(event);
  canvas.setPointerCapture(event.pointerId);
  snapshot();
  if (activeTool === "track") {
    path = [p];
    trackWear = [];
    drawing = true;
  } else if (activeTool === "start") start = p;
  else if (activeTool === "finish") finish = p;
  else if (activeTool === "dozer") obstacles = obstacles.filter(o => distance(o, p) > 55);
  else if (DIFFICULTY[activeTool] !== undefined) obstacles.push({ ...p, type: activeTool });
});

canvas.addEventListener("pointermove", event => {
  if (!drawing || activeTool !== "track" || racing) return;
  const p = pointerPosition(event);
  if (!path.length || distance(path.at(-1), p) > 8) path.push(p);
});

canvas.addEventListener("pointerup", () => { drawing = false; path = smoothPath(path); });
canvas.addEventListener("pointercancel", () => { drawing = false; });

function smoothPath(points) {
  if (points.length < 4) return points;
  const smoothed = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const previous = points[i - 1], current = points[i], next = points[i + 1];
    smoothed.push({ x: (previous.x + current.x * 2 + next.x) / 4, y: (previous.y + current.y * 2 + next.y) / 4 });
  }
  smoothed.push(points.at(-1));
  return smoothed;
}

function randomSkill() { return .15 + Math.random() * .85; }

function startRace() {
  if (racing) return;
  if (path.length < 3) return showFeedback("The toy bikes need a smooth track first.");
  racing = true;
  finishOrder = [];
  oneMoreButton.hidden = true;
  raceButton.disabled = true;
  status.classList.add("racing");
  sandboxWrap.classList.add("racing");
  modeLabel.textContent = "The sandbox is alive";
  document.querySelectorAll(".tool").forEach(button => button.disabled = true);
  raceBanner.textContent = "Ready...";
  setTimeout(() => { if (racing) raceBanner.textContent = "Go!"; }, 650);
  setTimeout(() => { raceBanner.textContent = ""; }, 1350);

  riders = BIKE_COLORS.slice(0, 5).sort(() => Math.random() - .5).map(([name, color], i) => {
    const skills = {
      jump: randomSkill(), whoops: randomSkill(), sand: randomSkill(), rollers: randomSkill(),
      hill: randomSkill(), start: randomSkill(), aggression: randomSkill(), consistency: randomSkill()
    };
    return {
      name, color, number: 2 + Math.floor(Math.random() * 987), personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
      skills, progress: skills.start * 12, speed: 80 + skills.start * 48, lane: (i - 2) * 10,
      targetLane: (i - 2) * 10, checked: new Set(), crash: 0, air: 0, finished: false, messages: []
    };
  });
  showFeedback(`${riders[0].name} bike is ${riders[0].personality} this race.`);
}

function updateRace(dt) {
  if (!racing) return;
  for (const rider of riders) {
    if (rider.finished) continue;
    if (rider.crash > 0) { rider.crash -= dt; continue; }
    rider.air = Math.max(0, rider.air - dt);
    const wobble = 1 + Math.sin(performance.now() * .004 + rider.number) * .05 * (1 - rider.skills.consistency);
    rider.progress += rider.speed * dt * wobble;
    rider.lane += (rider.targetLane - rider.lane) * Math.min(1, dt * 3);
    checkObstacles(rider);
    addWear(rider);
    if (rider.progress >= pathLength()) {
      rider.finished = true;
      finishOrder.push(rider);
      if (finishOrder.length === riders.length) endRace();
    }
  }
  separateRiders();
}

function checkObstacles(rider) {
  obstacles.forEach((obstacle, index) => {
    if (rider.checked.has(index)) return;
    const along = nearestPathDistance(obstacle);
    if (along < 0 || rider.progress < along) return;
    rider.checked.add(index);
    const type = obstacle.type;
    const key = type === "double" || type === "triple" || type === "single" || type === "tabletop" ? "jump" : type;
    const skill = rider.skills[key] ?? .5;
    const confidence = skill * .7 + rider.skills.consistency * .3;
    const difficulty = DIFFICULTY[type];
    if (JUMPS.has(type)) {
      if (confidence > difficulty) {
        rider.air = .28 + difficulty * .45;
        rider.speed = Math.min(180, rider.speed + 10);
        rider.messages.push(`${rider.name} bike cleared the ${type}!`);
      } else if (rider.skills.aggression + Math.random() * .2 > difficulty + .25) {
        rider.crash = .48;
        rider.speed *= .58;
        rider.messages.push(`${rider.name} bike almost cleared the ${type}!`);
      } else {
        rider.speed *= .78;
        rider.messages.push(`${rider.name} bike rolled the ${type}.`);
      }
    } else if (confidence > difficulty) {
      rider.speed = Math.min(170, rider.speed + 5);
      rider.messages.push(type === "berm" ? `${rider.name} bike loved that berm.` : `${rider.name} bike flew through the ${type}.`);
    } else {
      rider.speed *= .7;
      rider.messages.push(type === "sand" ? `${rider.name} bike got stuck in the sand again.` : `${rider.name} bike bobbled through the ${type}.`);
    }
    rider.speed = Math.max(48, rider.speed);
  });
}

function separateRiders() {
  riders.forEach((rider, i) => {
    let nudge = 0;
    riders.forEach((other, j) => {
      if (i !== j && Math.abs(rider.progress - other.progress) < 28) nudge += Math.sign(i - j) * 7;
    });
    rider.targetLane = Math.max(-30, Math.min(30, (i - 2) * 7 + nudge));
  });
}

function addWear(rider) {
  if (Math.random() > .12) return;
  const sample = samplePath(rider.progress);
  trackWear.push({ x: sample.x + (Math.random() - .5) * 15, y: sample.y + (Math.random() - .5) * 12, r: 2 + Math.random() * 4, a: .08 + Math.random() * .13 });
  if (trackWear.length > 450) trackWear.shift();
}

function endRace() {
  racing = false;
  raceButton.disabled = false;
  status.classList.remove("racing");
  sandboxWrap.classList.remove("racing");
  modeLabel.textContent = "Everything is still again";
  document.querySelectorAll(".tool").forEach(button => button.disabled = false);
  const winner = finishOrder[0];
  const stories = riders.flatMap(r => r.messages);
  const story = stories.length ? stories[Math.floor(Math.random() * stories.length)] : "That little moto felt fast!";
  showFeedback(`${winner.name} bike won the pretend moto. ${story}`);
  oneMoreButton.hidden = false;
}

function showFeedback(message) {
  feedbackText.textContent = message;
  feedback.classList.remove("pop");
  requestAnimationFrame(() => feedback.classList.add("pop"));
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => feedback.classList.remove("pop"), 500);
}

function pathLength() {
  let total = 0;
  for (let i = 1; i < path.length; i++) total += distance(path[i - 1], path[i]);
  return total;
}

function samplePath(at) {
  if (!path.length) return { x: 0, y: 0, angle: 0 };
  let remaining = at;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], length = distance(a, b);
    if (remaining <= length) {
      const t = Math.max(0, remaining / Math.max(length, .001));
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, angle: Math.atan2(b.y - a.y, b.x - a.x) };
    }
    remaining -= length;
  }
  const a = path.at(-2) || path[0], b = path.at(-1);
  return { ...b, angle: Math.atan2(b.y - a.y, b.x - a.x) };
}

function nearestPathDistance(point) {
  let best = Infinity, bestAlong = -1, along = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], dx = b.x - a.x, dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / Math.max(lengthSq, .001)));
    const projected = { x: a.x + dx * t, y: a.y + dy * t };
    const d = distance(point, projected);
    if (d < best) { best = d; bestAlong = along + Math.sqrt(lengthSq) * t; }
    along += Math.sqrt(lengthSq);
  }
  return best < 70 ? bestAlong : -1;
}

function distance(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

function roundedLine(points, color, lineWidth) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawSand() {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#efbd6d");
  gradient.addColorStop(1, "#dda052");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  grains.forEach(g => { ctx.fillStyle = `rgba(117,70,30,${g.a})`; ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "rgba(70,105,57,.65)";
  for (let x = 12; x < width; x += 29) {
    const sway = Math.sin(performance.now() * .0007 + x) * 4;
    ctx.fillRect(x + sway, 0, 2, 17 + (x % 13));
  }
  ctx.fillStyle = "rgba(190,55,37,.82)";
  ctx.fillRect(width - 82, 18, 42, 37);
  ctx.fillStyle = "rgba(255,236,198,.3)";
  ctx.fillRect(width - 77, 21, 32, 5);
}

function drawTrack() {
  if (path.length < 2) return;
  roundedLine(path, "rgba(93,51,22,.28)", 38);
  roundedLine(path, "rgba(163,94,39,.72)", 26);
  roundedLine(path, "rgba(247,198,111,.22)", 5);
  trackWear.forEach(mark => { ctx.fillStyle = `rgba(71,38,18,${mark.a})`; ctx.beginPath(); ctx.ellipse(mark.x, mark.y, mark.r * 2.2, mark.r, 0, 0, Math.PI * 2); ctx.fill(); });
}

function drawMarker(point, type) {
  if (!point) return;
  ctx.save(); ctx.translate(point.x, point.y);
  if (type === "start") {
    ctx.strokeStyle = "#2c2924"; ctx.lineWidth = 4; ctx.strokeRect(-25, -17, 50, 34);
    ctx.fillStyle = "#fff5d7"; ctx.font = "800 10px Trebuchet MS"; ctx.fillText("START", -18, -23);
  } else {
    for (let x = 0; x < 4; x++) for (let y = 0; y < 3; y++) { ctx.fillStyle = (x + y) % 2 ? "#f9f4e6" : "#26231f"; ctx.fillRect(-24 + x * 12, -18 + y * 12, 12, 12); }
    ctx.fillStyle = "#fff5d7"; ctx.font = "800 10px Trebuchet MS"; ctx.fillText("FINISH", -22, -24);
  }
  ctx.restore();
}

function drawObstacle(o) {
  ctx.save(); ctx.translate(o.x, o.y);
  const dirt = "#8e522b", light = "#ca8243";
  ctx.fillStyle = dirt; ctx.strokeStyle = "rgba(67,35,16,.32)"; ctx.lineWidth = 2;
  if (o.type === "sand") { ctx.fillStyle = "rgba(250,206,124,.72)"; ctx.beginPath(); ctx.ellipse(0, 0, 37, 21, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (o.type === "berm") { ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 28, -.5, 2.3); ctx.strokeStyle = dirt; ctx.stroke(); }
  else if (["whoops", "rollers"].includes(o.type)) { const count = o.type === "whoops" ? 6 : 4; for (let i = 0; i < count; i++) { ctx.beginPath(); ctx.arc((i - (count - 1) / 2) * 11, 0, o.type === "whoops" ? 7 : 10, Math.PI, 0); ctx.fill(); } }
  else if (o.type === "tabletop") { ctx.beginPath(); ctx.moveTo(-32, 13); ctx.lineTo(-20, -9); ctx.lineTo(20, -9); ctx.lineTo(32, 13); ctx.closePath(); ctx.fill(); }
  else { const count = o.type === "triple" ? 3 : o.type === "double" ? 2 : 1; for (let i = 0; i < count; i++) { ctx.beginPath(); ctx.moveTo((i - (count - 1) / 2) * 25 - 13, 12); ctx.quadraticCurveTo((i - (count - 1) / 2) * 25, -18, (i - (count - 1) / 2) * 25 + 13, 12); ctx.closePath(); ctx.fill(); } }
  ctx.fillStyle = light; ctx.font = "800 9px Trebuchet MS"; ctx.textAlign = "center"; ctx.fillText(o.type.toUpperCase(), 0, 28);
  ctx.restore();
}

function drawBike(rider) {
  const p = samplePath(rider.progress);
  const nx = -Math.sin(p.angle), ny = Math.cos(p.angle);
  const airLift = rider.air > 0 ? 11 + Math.sin((rider.air * 10) % Math.PI) * 5 : 0;
  ctx.save();
  ctx.translate(p.x + nx * rider.lane, p.y + ny * rider.lane - airLift);
  ctx.rotate(p.angle + (rider.crash > 0 ? rider.crash * 7 : 0) - (rider.air > 0 ? .12 : 0));
  ctx.fillStyle = "rgba(66,38,20,.18)"; ctx.beginPath(); ctx.ellipse(0, 13 + airLift, 24, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#282521"; [-12, 13].forEach(x => { ctx.beginPath(); ctx.arc(x, 7, 7, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#aaa18d"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, 7, 3, 0, Math.PI * 2); ctx.stroke(); });
  ctx.fillStyle = rider.color; ctx.fillRect(-16, -7, 32, 11); ctx.fillRect(-21, -11, 15, 5); ctx.fillRect(9, -12, 17, 5);
  ctx.fillStyle = "#3f3931"; ctx.fillRect(-3, 2, 10, 7);
  ctx.fillStyle = rider.color; ctx.beginPath(); ctx.arc(0, -16, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff8e8"; ctx.font = "900 8px Trebuchet MS"; ctx.textAlign = "center"; ctx.fillText(rider.number, 0, -13);
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawSand();
  drawTrack();
  obstacles.forEach(drawObstacle);
  drawMarker(start, "start");
  drawMarker(finish, "finish");
  [...riders].sort((a, b) => a.air - b.air).forEach(drawBike);
  if (!path.length) {
    ctx.fillStyle = "rgba(83,48,22,.65)"; ctx.font = "700 16px Trebuchet MS"; ctx.textAlign = "center";
    ctx.fillText("Drag a smooth motocross track through the sand", width / 2, height / 2);
  }
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000 || 0, .035);
  lastTime = now;
  updateRace(dt);
  draw();
  requestAnimationFrame(loop);
}

function resetSandbox() {
  if (racing) return;
  snapshot(); path = []; start = null; finish = null; obstacles = []; riders = []; trackWear = [];
  oneMoreButton.hidden = true;
  showFeedback("Fresh sand. What should we build this time?");
}

raceButton.addEventListener("click", startRace);
oneMoreButton.addEventListener("click", startRace);
resetButton.addEventListener("click", resetSandbox);
window.addEventListener("resize", resize);
window.addEventListener("keydown", event => {
  if (event.code === "Space") { event.preventDefault(); startRace(); }
  if (event.key.toLowerCase() === "z" && !racing) undo();
});

createTools();
resize();
requestAnimationFrame(loop);

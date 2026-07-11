import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const $ = selector => document.querySelector(selector);
const canvas = $("#sandbox");
const ui = {
  tools: $("#tools"), race: $("#raceButton"), reset: $("#resetButton"), mode: $("#modeLabel"),
  feedback: $("#feedback"), feedbackText: $("#feedbackText"), again: $("#oneMoreButton"),
  banner: $("#raceBanner"), wrap: $(".sandbox-wrap"), status: $(".status"),
  hint: $("#toolHint"), loading: $("#loadingState")
};

const TOOL_DEFS = [
  ["track", "~", "Track", "Drag a smooth line through the sand"], ["start", "S", "Start", "Place the start gate"],
  ["finish", "F", "Finish", "Place the finish marker"], ["single", "^", "Single", "Place a little jump"],
  ["double", "^^", "Double", "Place a risky double"], ["triple", "^^^", "Triple", "Place the brave line"],
  ["tabletop", "=", "Tabletop", "Place a friendly big jump"], ["whoops", "www", "Whoops", "Stamp a bumpy rhythm"],
  ["rollers", "ooo", "Rollers", "Stamp a smooth rhythm"], ["sand", "...", "Deep sand", "Place a soft slow section"],
  ["berm", "C", "Berm", "Place a banked toy turn"], ["hill", "A", "Hill", "Build a tiny mountain"],
  ["dozer", "X", "Dozer", "Remove nearby pieces"], ["undo", "<-", "Undo", "Take back the last change"]
];
const COLORS = [["Red",0xd94b35],["Blue",0x347cc2],["Green",0x4c955b],["Yellow",0xe4b73f],["Purple",0x825da2],["Orange",0xe87938]];
const PERSONALITIES = ["fearless","careful","always sends it","smooth","a bad starter","a great jumper","loves whoops"];
const DIFFICULTY = {single:.22,double:.5,triple:.74,tabletop:.4,whoops:.54,rollers:.34,sand:.56,berm:.28,hill:.46};
const JUMPS = new Set(["single","double","triple","tabletop"]);
const dirtColor = 0x98592d;

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc7d9ce);
scene.fog = new THREE.Fog(0xc7d9ce, 42, 72);
const camera = new THREE.PerspectiveCamera(38, 1, .1, 120);
const cameraTarget = new THREE.Vector3();
let cameraDistance = 33;

scene.add(new THREE.HemisphereLight(0xfff1cf, 0x687557, 2.2));
const sun = new THREE.DirectionalLight(0xffd89a, 3.4);
sun.position.set(-12,24,10); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera, {left:-28,right:28,top:22,bottom:-22}); scene.add(sun);

const world = new THREE.Group(), buildLayer = new THREE.Group(), riderLayer = new THREE.Group();
scene.add(world, buildLayer, riderLayer);

function material(color, roughness=.8, metalness=0) { return new THREE.MeshStandardMaterial({color,roughness,metalness}); }
function addMesh(geometry, mat, position, parent=world) {
  const object = new THREE.Mesh(geometry, mat); object.position.copy(position); object.castShadow=true; object.receiveShadow=true; parent.add(object); return object;
}

const sand = addMesh(new THREE.BoxGeometry(36,1.5,24), material(0xe4a958,.94), new THREE.Vector3(0,-.78,0));
const wood = material(0x9c6034,.8);
for (const [x,z,sx,sz] of [[0,-12.4,38,1],[0,12.4,38,1],[-18.4,0,1,26],[18.4,0,1,26]]) addMesh(new THREE.BoxGeometry(sx,2.1,sz),wood,new THREE.Vector3(x,-.35,z));
const ground = addMesh(new THREE.PlaneGeometry(100,100),material(0x80936a,1),new THREE.Vector3(0,-1.58,0)); ground.rotation.x=-Math.PI/2;

function addWorldProps() {
  const green=material(0x4d7246,.9);
  for(let i=0;i<38;i++){const blade=addMesh(new THREE.ConeGeometry(.09,1.2+(i%4)*.25,4),green,new THREE.Vector3(-19+(i%19)*2.1,-.6,i<19?-13.2:13.2));blade.rotation.z=(i%3-1)*.15;}
  const red=material(0xd14c34,.35); const bucket=addMesh(new THREE.CylinderGeometry(1.5,1.15,2.7,20,1,true),red,new THREE.Vector3(15.7,.3,-9.5));bucket.rotation.z=-.1;
  const truck=new THREE.Group();truck.position.set(-15,-.15,9.3);world.add(truck);const yellow=material(0xe4aa2f,.4),tire=material(0x282623,.8);
  addMesh(new THREE.BoxGeometry(3.1,1.15,1.7),yellow,new THREE.Vector3(0,.7,0),truck);addMesh(new THREE.BoxGeometry(1.2,1.1,1.65),yellow,new THREE.Vector3(-1.5,1.05,0),truck);
  for(const x of [-1.2,1.1])for(const z of [-.88,.88]){const wheel=addMesh(new THREE.CylinderGeometry(.42,.42,.25,12),tire,new THREE.Vector3(x,.25,z),truck);wheel.rotation.x=Math.PI/2;}
  const shovel=new THREE.Group();shovel.position.set(16,0,7);shovel.rotation.z=-.2;world.add(shovel);
  addMesh(new THREE.CylinderGeometry(.11,.11,6,8),material(0xb88950),new THREE.Vector3(0,2.2,0),shovel);const blade=addMesh(new THREE.BoxGeometry(1.5,.18,1.7),red,new THREE.Vector3(0,-.75,0),shovel);blade.rotation.x=-.25;
}
addWorldProps();

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(), sandPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
let activeTool="track", path=[], startMarker=null, finishMarker=null, obstacles=[], riders=[], history=[];
let trackMesh=null, raceCurve=null, drawing=false, panning=false, lastPointer=null, racing=false, finishOrder=[];
let lastTime=performance.now(); const wearGroup=new THREE.Group(); buildLayer.add(wearGroup);

function updateCamera(){camera.position.set(cameraTarget.x,Math.sin(.78)*cameraDistance,cameraTarget.z+Math.cos(.78)*cameraDistance);camera.lookAt(cameraTarget);}
function resize(){const rect=canvas.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/Math.max(rect.height,1);camera.updateProjectionMatrix();}
function pointerToSand(event){const rect=canvas.getBoundingClientRect();pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.ray.intersectPlane(sandPlane,new THREE.Vector3());}
function inside(point){return point&&Math.abs(point.x)<17.6&&Math.abs(point.z)<11.6;}

function createTools(){for(const [id,symbol,label,hint] of TOOL_DEFS){const button=document.createElement("button");button.type="button";button.className=`tool${id===activeTool?" active":""}`;button.dataset.tool=id;button.title=hint;button.innerHTML=`<span class="tool-symbol">${symbol}</span><span>${label}</span>`;button.onclick=()=>selectTool(id,hint);ui.tools.append(button);}}
function selectTool(tool,hint){if(racing)return;if(tool==="undo")return undo();activeTool=tool;ui.hint.textContent=hint;document.querySelectorAll(".tool").forEach(button=>button.classList.toggle("active",button.dataset.tool===tool));}
function stateSnapshot(){return{path:path.map(p=>p.toArray()),start:startMarker?.position.toArray()||null,finish:finishMarker?.position.toArray()||null,obstacles:obstacles.map(o=>({type:o.userData.type,position:o.position.toArray()}))};}
function snapshot(){history.push(stateSnapshot());if(history.length>20)history.shift();}
function disposeObject(object){object.traverse(child=>{child.geometry?.dispose();if(child.material)(Array.isArray(child.material)?child.material:[child.material]).forEach(m=>m.dispose());});object.removeFromParent();}
function clearBuildObjects(){if(trackMesh)disposeObject(trackMesh);trackMesh=null;if(startMarker)disposeObject(startMarker);startMarker=null;if(finishMarker)disposeObject(finishMarker);finishMarker=null;obstacles.forEach(disposeObject);obstacles=[];}
function undo(){if(!history.length)return;const state=history.pop();clearBuildObjects();path=state.path.map(p=>new THREE.Vector3(...p));rebuildTrack();if(state.start)startMarker=makeMarker("start",new THREE.Vector3(...state.start));if(state.finish)finishMarker=makeMarker("finish",new THREE.Vector3(...state.finish));state.obstacles.forEach(o=>obstacles.push(makeObstacle(o.type,new THREE.Vector3(...o.position))));}

function rebuildTrack(){if(trackMesh)disposeObject(trackMesh);if(path.length<2){trackMesh=null;return;}raceCurve=new THREE.CatmullRomCurve3(path,false,"catmullrom",.35);trackMesh=new THREE.Mesh(new THREE.TubeGeometry(raceCurve,Math.max(40,path.length*3),.72,10,false),material(dirtColor,.98));trackMesh.scale.y=.13;trackMesh.position.y=.08;trackMesh.receiveShadow=true;buildLayer.add(trackMesh);}
function makeMarker(type,position){const group=new THREE.Group();group.position.copy(position);buildLayer.add(group);const dark=material(0x2b2925,.65),white=material(0xf7f0dc,.55);for(const x of [-.9,.9])addMesh(new THREE.BoxGeometry(.12,1.4,.12),dark,new THREE.Vector3(x,.7,0),group);for(let i=0;i<5;i++)addMesh(new THREE.BoxGeometry(.36,.32,.08),i%2?dark:white,new THREE.Vector3(-.72+i*.36,1.18,0),group);group.userData.type=type;return group;}
function mound(parent,x,z,scale=1){const item=addMesh(new THREE.SphereGeometry(.7*scale,12,7,0,Math.PI*2,0,Math.PI/2),material(dirtColor,1),new THREE.Vector3(x,0,z),parent);item.scale.set(1.2,.9,1);return item;}
function makeObstacle(type,position){const group=new THREE.Group();group.position.copy(position);group.userData.type=type;buildLayer.add(group);
  if(type==="sand")addMesh(new THREE.CylinderGeometry(1.5,1.7,.09,20),material(0xf2c875,1),new THREE.Vector3(0,.04,0),group);
  else if(type==="berm")for(let i=0;i<7;i++){const a=-1.2+i*.4;mound(group,Math.sin(a)*1.4,Math.cos(a)*1.4,.65);}
  else if(type==="tabletop")addMesh(new THREE.BoxGeometry(2.5,.65,1.35),material(dirtColor,1),new THREE.Vector3(0,.33,0),group);
  else{const count=type==="triple"?3:type==="double"?2:type==="whoops"?6:type==="rollers"?4:1,gap=type==="whoops"?.48:type==="rollers"?.75:1.35;for(let i=0;i<count;i++)mound(group,(i-(count-1)/2)*gap,0,type==="whoops"?.38:type==="rollers"?.58:type==="hill"?1.45:.82);}
  return group;
}

function randomSkill(){return .15+Math.random()*.85;}
function createBike(name,color,index){const group=new THREE.Group();group.scale.setScalar(.62);riderLayer.add(group);const plastic=material(color,.26,.04),dark=material(0x252524,.72),chrome=material(0xa7a49a,.28,.65);
  for(const x of [-.85,.85]){const wheel=addMesh(new THREE.TorusGeometry(.42,.14,8,16),dark,new THREE.Vector3(x,.45,0),group);wheel.rotation.y=Math.PI/2;const hub=addMesh(new THREE.CylinderGeometry(.1,.1,.18,10),chrome,new THREE.Vector3(x,.45,0),group);hub.rotation.x=Math.PI/2;}
  addMesh(new THREE.BoxGeometry(1.25,.34,.48),plastic,new THREE.Vector3(0,.72,0),group);const rear=addMesh(new THREE.BoxGeometry(.7,.16,.55),plastic,new THREE.Vector3(-.72,.98,0),group);rear.rotation.z=.12;const front=addMesh(new THREE.BoxGeometry(.72,.13,.52),plastic,new THREE.Vector3(.78,.97,0),group);front.rotation.z=-.15;
  addMesh(new THREE.BoxGeometry(.42,.42,.42),dark,new THREE.Vector3(0,.52,0),group);const body=addMesh(new THREE.CapsuleGeometry(.22,.55,4,8),plastic,new THREE.Vector3(-.1,1.35,0),group);body.rotation.z=-.2;addMesh(new THREE.SphereGeometry(.36,12,8),plastic,new THREE.Vector3(.08,1.93,0),group);
  const skills={jump:randomSkill(),whoops:randomSkill(),sand:randomSkill(),rollers:randomSkill(),hill:randomSkill(),start:randomSkill(),aggression:randomSkill(),consistency:randomSkill()};
  return{group,name,number:2+Math.floor(Math.random()*987),personality:PERSONALITIES[Math.floor(Math.random()*PERSONALITIES.length)],skills,progress:skills.start*.015,speed:.075+skills.start*.045,lane:(index-2)*.28,targetLane:(index-2)*.28,checked:new Set(),crash:0,air:0,finished:false,messages:[],bounce:Math.random()*6};}

function nearestPathProgress(position){if(!raceCurve)return-1;let best=Infinity,bestT=-1;const samples=Math.max(80,path.length*5);for(let i=0;i<=samples;i++){const t=i/samples,d=raceCurve.getPointAt(t).distanceToSquared(position);if(d<best){best=d;bestT=t;}}return best<6?bestT:-1;}
function startRace(){if(racing)return;if(path.length<3)return showFeedback("The toy bikes need a smooth track first.");racing=true;finishOrder=[];ui.again.hidden=true;ui.race.disabled=true;ui.status.classList.add("racing");ui.wrap.classList.add("racing");ui.mode.textContent="The sandbox is alive";document.querySelectorAll(".tool").forEach(b=>b.disabled=true);ui.banner.textContent="Ready...";setTimeout(()=>{if(racing)ui.banner.textContent="Go!";},650);setTimeout(()=>ui.banner.textContent="",1350);riders.forEach(r=>disposeObject(r.group));riders=[...COLORS].sort(()=>Math.random()-.5).slice(0,5).map(([name,color],i)=>createBike(name,color,i));raceCurve=new THREE.CatmullRomCurve3(path,false,"catmullrom",.35);showFeedback(`${riders[0].name} bike is ${riders[0].personality} this race.`);}
function checkObstacles(rider){obstacles.forEach((obstacle,index)=>{if(rider.checked.has(index))return;const at=nearestPathProgress(obstacle.position);if(at<0||rider.progress<at)return;rider.checked.add(index);const type=obstacle.userData.type,key=JUMPS.has(type)?"jump":type,skill=rider.skills[key]??.5,difficulty=DIFFICULTY[type],confidence=skill*.7+rider.skills.consistency*.3;
    if(JUMPS.has(type)){if(confidence>difficulty){rider.air=.34+difficulty*.42;rider.speed=Math.min(.15,rider.speed+.008);rider.messages.push(`${rider.name} bike cleared the ${type}!`);}else if(rider.skills.aggression+Math.random()*.2>difficulty+.25){rider.crash=.5;rider.speed*=.62;rider.messages.push(`${rider.name} bike almost cleared the ${type}!`);}else{rider.speed*=.82;rider.messages.push(`${rider.name} bike rolled the ${type}.`);}}
    else if(confidence>difficulty){rider.speed=Math.min(.14,rider.speed+.004);rider.messages.push(type==="berm"?`${rider.name} bike loved that berm.`:`${rider.name} bike flew through the ${type}.`);}else{rider.speed*=.74;rider.messages.push(type==="sand"?`${rider.name} bike got stuck in the sand again.`:`${rider.name} bike bobbled through the ${type}.`);}rider.speed=Math.max(.045,rider.speed);});}
function addWear(point){if(wearGroup.children.length>380)disposeObject(wearGroup.children[0]);const mark=addMesh(new THREE.CircleGeometry(.08+Math.random()*.12,8),new THREE.MeshBasicMaterial({color:0x66391f,transparent:true,opacity:.13}),new THREE.Vector3(point.x+(Math.random()-.5)*.45,.015,point.z+(Math.random()-.5)*.35),wearGroup);mark.rotation.x=-Math.PI/2;mark.scale.x=2;}
function updateRace(dt,time){if(!racing)return;for(const rider of riders){if(rider.finished)continue;if(rider.crash>0){rider.crash-=dt;rider.group.rotation.z+=dt*8;continue;}rider.air=Math.max(0,rider.air-dt);rider.progress+=rider.speed*dt*(1+Math.sin(time*.004+rider.number)*.05*(1-rider.skills.consistency));rider.lane+=(rider.targetLane-rider.lane)*Math.min(1,dt*3);checkObstacles(rider);const t=Math.min(rider.progress,1),point=raceCurve.getPointAt(t),tangent=raceCurve.getTangentAt(t).normalize(),normal=new THREE.Vector3(-tangent.z,0,tangent.x),jump=rider.air>0?Math.sin(Math.min(1,rider.air/.6)*Math.PI)*1.65:0;rider.group.position.copy(point).addScaledVector(normal,rider.lane);rider.group.position.y=.16+jump+Math.sin(time*.01+rider.bounce)*.035;rider.group.rotation.y=Math.atan2(tangent.x,tangent.z)+Math.PI/2;rider.group.rotation.z=rider.air>0?-.18:0;if(Math.random()<.08)addWear(point);if(rider.progress>=1){rider.finished=true;finishOrder.push(rider);if(finishOrder.length===riders.length)endRace();}}
  riders.forEach((r,i)=>{let n=0;riders.forEach((o,j)=>{if(i!==j&&Math.abs(r.progress-o.progress)<.025)n+=Math.sign(i-j)*.22;});r.targetLane=THREE.MathUtils.clamp((i-2)*.18+n,-.8,.8);});}
function endRace(){racing=false;ui.race.disabled=false;ui.status.classList.remove("racing");ui.wrap.classList.remove("racing");ui.mode.textContent="Everything is still again";document.querySelectorAll(".tool").forEach(b=>b.disabled=false);const winner=finishOrder[0],stories=riders.flatMap(r=>r.messages),story=stories.length?stories[Math.floor(Math.random()*stories.length)]:"That little moto felt fast!";showFeedback(`${winner.name} bike won the pretend moto. ${story}`);ui.again.hidden=false;}
function showFeedback(message){ui.feedbackText.textContent=message;ui.feedback.classList.remove("pop");requestAnimationFrame(()=>ui.feedback.classList.add("pop"));}

canvas.addEventListener("pointerdown",event=>{if(racing)return;lastPointer={x:event.clientX,y:event.clientY};if(event.shiftKey||event.button===1||event.button===2){panning=true;canvas.setPointerCapture(event.pointerId);return;}const point=pointerToSand(event);if(!inside(point))return;canvas.setPointerCapture(event.pointerId);snapshot();if(activeTool==="track"){path=[point];drawing=true;rebuildTrack();}else if(activeTool==="start"){if(startMarker)disposeObject(startMarker);startMarker=makeMarker("start",point);}else if(activeTool==="finish"){if(finishMarker)disposeObject(finishMarker);finishMarker=makeMarker("finish",point);}else if(activeTool==="dozer")obstacles=obstacles.filter(o=>{if(o.position.distanceTo(point)<2){disposeObject(o);return false;}return true;});else if(DIFFICULTY[activeTool]!==undefined)obstacles.push(makeObstacle(activeTool,point));});
canvas.addEventListener("pointermove",event=>{if(panning&&lastPointer){cameraTarget.x-=(event.clientX-lastPointer.x)*.025;cameraTarget.z-=(event.clientY-lastPointer.y)*.025;lastPointer={x:event.clientX,y:event.clientY};updateCamera();return;}if(!drawing||racing)return;const point=pointerToSand(event);if(inside(point)&&(!path.length||path.at(-1).distanceTo(point)>.28)){path.push(point);rebuildTrack();}});
canvas.addEventListener("pointerup",()=>{drawing=false;panning=false;lastPointer=null;});canvas.addEventListener("pointercancel",()=>{drawing=false;panning=false;lastPointer=null;});canvas.addEventListener("contextmenu",event=>event.preventDefault());canvas.addEventListener("wheel",event=>{event.preventDefault();cameraDistance=THREE.MathUtils.clamp(cameraDistance+event.deltaY*.018,19,45);updateCamera();},{passive:false});
function resetSandbox(){if(racing)return;snapshot();clearBuildObjects();path=[];riders.forEach(r=>disposeObject(r.group));riders=[];while(wearGroup.children.length)disposeObject(wearGroup.children[0]);ui.again.hidden=true;showFeedback("Fresh sand. What should we build this time?");}
function animate(time){const dt=Math.min((time-lastTime)/1000,.035);lastTime=time;updateRace(dt,time);renderer.render(scene,camera);requestAnimationFrame(animate);}

ui.race.onclick=startRace;ui.again.onclick=startRace;ui.reset.onclick=resetSandbox;window.addEventListener("resize",resize);window.addEventListener("keydown",event=>{if(event.code==="Space"){event.preventDefault();startRace();}if(event.key.toLowerCase()==="z"&&!racing)undo();});
createTools();updateCamera();resize();requestAnimationFrame(animate);requestAnimationFrame(()=>ui.loading.classList.add("ready"));

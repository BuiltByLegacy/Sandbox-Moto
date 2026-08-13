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
// Little toy illustrations for the toy-box buttons - each shows the actual
// dirt feature or tool, in the warm sandbox palette, so the menu reads like a
// tray of toys instead of typed symbols.
const ICON = (inner)=>`<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="21" rx="9.4" ry="1.5" fill="#5a3a1a" opacity=".13"/>${inner}</svg>`;
const kick=(cx,s)=>`<path d="M${cx-6*s} 19 Q${cx-2.4*s} 18 ${cx-0.5*s} 7.5 Q${cx} 6.4 ${cx+0.9*s} 7.5 Q${cx+3.4*s} 15 ${cx+6*s} 19 Z" fill="#b5713a"/><path d="M${cx-6*s} 19 Q${cx-2.4*s} 18 ${cx-0.5*s} 7.5 L${cx+0.4*s} 7.6 Q${cx-1.4*s} 15 ${cx-2.6*s} 19 Z" fill="#c98c4e"/><path d="M${cx-0.6*s} 7.2 L${cx+1*s} 7.4" stroke="#e2b174" stroke-width="1.5" stroke-linecap="round"/>`;
const TOOL_ICONS = {
  track: ICON(`<path d="M2.5 17 C6 9 10 20 13 13 S19 6.5 21.5 9.5" fill="none" stroke="#b5713a" stroke-width="5.2" stroke-linecap="round"/><path d="M2.5 17 C6 9 10 20 13 13 S19 6.5 21.5 9.5" fill="none" stroke="#e2b174" stroke-width="1.3" stroke-linecap="round" stroke-dasharray="1.2 3.2"/>`),
  start: ICON(`<rect x="4.4" y="6.5" width="2.3" height="13.5" rx="1" fill="#835a34"/><rect x="17.3" y="6.5" width="2.3" height="13.5" rx="1" fill="#835a34"/><path d="M4 5.6 h16 a1 1 0 0 1 1 1 v3.2 a1 1 0 0 1-1 1 h-16 a1 1 0 0 1-1-1 v-3.2 a1 1 0 0 1 1-1 z" fill="#d94b35"/><rect x="6" y="7" width="12" height="1.5" fill="#f4ead0" opacity=".85"/><circle cx="12" cy="9.4" r="1.1" fill="#7fd08a"/>`),
  finish: ICON(`<rect x="5" y="4" width="2.2" height="16" rx="1" fill="#835a34"/><g>${[0,1,2,3].map(r=>[0,1,2,3].map(c=>`<rect x="${7.2+c*3.1}" y="${4.4+r*2.1}" width="3.1" height="2.1" fill="${(r+c)%2?'#f4ead0':'#2b2925'}"/>`).join('')).join('')}</g>`),
  single: ICON(kick(12,1.4)),
  double: ICON(kick(8,1)+kick(16.5,0.9)),
  triple: ICON(kick(6,0.82)+kick(12,0.86)+kick(18,0.78)),
  tabletop: ICON(`<path d="M3 19 L7.6 8 L16.4 8 L21 19 Z" fill="#b5713a"/><path d="M3 19 L7.6 8 L11.5 8 L8.5 19 Z" fill="#c98c4e"/><rect x="7.4" y="6.9" width="9.2" height="2" rx="1" fill="#e2b174"/>`),
  whoops: ICON(`<path d="M2.5 19 Q4.5 12.5 6.5 19 Q8.5 12.5 10.5 19 Q12.5 12.5 14.5 19 Q16.5 12.5 18.5 19 Q20.5 13.5 21.5 19 Z" fill="#b5713a"/><path d="M2.5 19 Q4.5 12.5 6.5 19 Q8.5 12.5 10.5 19 Q12.5 12.5 14.5 19 Q16.5 12.5 18.5 19 Q20.5 13.5 21.5 19" fill="none" stroke="#e2b174" stroke-width="1" opacity=".7"/>`),
  rollers: ICON(`<path d="M2.5 19 Q6 9.5 9.5 19 Q13 9.5 16.5 19 Q19 12 21.5 19 Z" fill="#b5713a"/><path d="M2.5 19 Q6 9.5 9.5 19 Q13 9.5 16.5 19" fill="none" stroke="#e2b174" stroke-width="1.1" opacity=".7"/>`),
  sand: ICON(`<path d="M3 18.5 Q12 8.5 21 18.5 Z" fill="#edcb84"/><path d="M3 18.5 Q12 8.5 21 18.5" fill="none" stroke="#d8b268" stroke-width="1"/><path d="M7.5 16.4 Q12 13 16.5 16.4 M9.5 18.2 Q12 16.6 14.5 18.2" fill="none" stroke="#fbe6ad" stroke-width="1" stroke-linecap="round" opacity=".8"/>`),
  berm: ICON(`<path d="M3.5 20 Q3.5 6 18 6 L18 11 Q10 11 9.2 20 Z" fill="#b5713a"/><path d="M3.5 20 Q3.5 6 18 6 L18 8.4 Q7.5 8.4 6.4 20 Z" fill="#c98c4e"/>`),
  hill: ICON(`<path d="M2.5 19 Q12 3.5 21.5 19 Z" fill="#b5713a"/><path d="M2.5 19 Q12 3.5 21.5 19" fill="none" stroke="#8a4f27" stroke-width="0"/><path d="M8 12 Q12 6.5 16 12" fill="none" stroke="#e2b174" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`),
  dozer: ICON(`<circle cx="9" cy="16" r="2.4" fill="#3a3330"/><circle cx="14.5" cy="16" r="2.4" fill="#3a3330"/><circle cx="9" cy="16" r=".9" fill="#7a716a"/><circle cx="14.5" cy="16" r=".9" fill="#7a716a"/><rect x="7" y="9.5" width="9" height="5" rx="1.4" fill="#e4aa2f"/><rect x="12" y="6.5" width="4" height="4" rx="1" fill="#efc25a"/><path d="M4.6 8.5 L6.4 8.5 L6.4 16 L4.6 16 Q3.8 12 4.6 8.5 Z" fill="#c88f1e"/>`),
  undo: ICON(`<path d="M7.5 12 A5.5 5.5 0 1 1 9 16.2" fill="none" stroke="#835a34" stroke-width="2.6" stroke-linecap="round"/><path d="M7.5 7.5 L7.2 12.4 L12 11.6 Z" fill="#835a34"/>`)
};
const COLORS = [["Red",0xd94b35],["Blue",0x347cc2],["Green",0x4c955b],["Yellow",0xe4b73f],["Purple",0x825da2],["Orange",0xe87938]];
const PERSONALITIES = ["is fearless","is careful","always sends it","is feeling smooth","is a bad starter","is a great jumper","loves the whoops"];
const DIFFICULTY = {single:.22,double:.5,triple:.74,tabletop:.4,whoops:.54,rollers:.34,sand:.56,berm:.28,hill:.46};
const JUMPS = new Set(["single","double","triple","tabletop"]);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xc7d9ce);
scene.fog = new THREE.Fog(0xc7d9ce, 42, 72);
const camera = new THREE.PerspectiveCamera(38, 1, .1, 120);
const cameraTarget = new THREE.Vector3();
let cameraDistance = 33;                    // user-controlled zoom (kneeling closer / leaning back)
let cameraYaw = 0;                          // user-controlled azimuth (reserved for future orbit)
const CAM_ELEV = 0.82;                       // base "kneeling beside the sandbox" angle
let cameraIdleSince = performance.now();     // when the player last touched the sandbox
const camView = { tx: 0, tz: 0, dist: 33, yaw: 0, elev: CAM_ELEV }; // smoothed values actually rendered
function pokeCamera(){ cameraIdleSince = performance.now(); } // the player is here - hush the drift

scene.add(new THREE.HemisphereLight(0xfff1cf, 0x687557, 2.2));
const sun = new THREE.DirectionalLight(0xffd89a, 3.4);
sun.position.set(-12,24,10); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
sun.shadow.bias = -.0004;
Object.assign(sun.shadow.camera, {left:-28,right:28,top:22,bottom:-22}); scene.add(sun);
const warmFill = new THREE.PointLight(0xffb85c, 18, 38, 2);
warmFill.position.set(12, 9, 8); scene.add(warmFill);

const world = new THREE.Group(), buildLayer = new THREE.Group(), riderLayer = new THREE.Group();
scene.add(world, buildLayer, riderLayer);

function material(color, roughness=.8, metalness=0) { return new THREE.MeshStandardMaterial({color,roughness,metalness}); }
function addMesh(geometry, mat, position, parent=world) {
  const object = new THREE.Mesh(geometry, mat); object.position.copy(position); object.castShadow=true; object.receiveShadow=true; parent.add(object); return object;
}

function makeTexture(base, flecks, count, lines=false) {
  const textureCanvas=document.createElement("canvas");textureCanvas.width=textureCanvas.height=512;const context=textureCanvas.getContext("2d");
  context.fillStyle=base;context.fillRect(0,0,512,512);
  if(lines){for(let i=0;i<34;i++){context.strokeStyle=`${flecks}${.1+(i%4)*.04})`;context.lineWidth=1+(i%3);context.beginPath();context.moveTo(0,i*17+Math.sin(i)*8);context.bezierCurveTo(140,i*17-8,360,i*17+11,512,i*17);context.stroke();}}
  else{for(let i=0;i<count;i++){const alpha=.08+(i%7)*.018;context.fillStyle=`${flecks}${alpha})`;const radius=.4+(i%5)*.32;context.beginPath();context.arc((i*73.17)%512,(i*139.41)%512,radius,0,Math.PI*2);context.fill();}}
  const texture=new THREE.CanvasTexture(textureCanvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(lines?3:8,lines?1:5);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();return texture;
}

const sandTexture=makeTexture("#e8b45f","rgba(112,65,25,",2300);
// Soft raked grooves combed through the sand - the touchable, Sandcastle-like surface.
function makeRakeBump(){const c=document.createElement("canvas");c.width=c.height=512;const x=c.getContext("2d");x.fillStyle="#808080";x.fillRect(0,0,512,512);for(let i=0;i<9;i++){const y=i*58+20;x.strokeStyle="rgba(38,38,38,0.9)";x.lineWidth=5;x.beginPath();x.moveTo(-20,y);x.bezierCurveTo(160,y-20,360,y+22,532,y-8);x.stroke();x.strokeStyle="rgba(232,232,232,0.7)";x.lineWidth=2;x.beginPath();x.moveTo(-20,y+5);x.bezierCurveTo(160,y-15,360,y+27,532,y-3);x.stroke();}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);t.colorSpace=THREE.NoColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const sandRake=makeRakeBump();
const sandMaterial=new THREE.MeshStandardMaterial({map:sandTexture,color:0xffdf9f,roughness:.98,bumpMap:sandRake,bumpScale:.12});
// Packed, played-in dirt for sculpted track features - matte, grainy, warm.
const dirtTexture=makeTexture("#9c6233","rgba(72,40,18,",1500);dirtTexture.repeat.set(3,3);
const dirtPacked=new THREE.MeshStandardMaterial({map:dirtTexture,color:0xba7238,roughness:.98,bumpMap:dirtTexture,bumpScale:.025});
const dirtWorn=new THREE.MeshStandardMaterial({color:0xd39a5b,roughness:.94}); // sun-lit worn line on top
const sand = addMesh(new THREE.BoxGeometry(36,1.5,24), sandMaterial, new THREE.Vector3(0,-.78,0));
const woodTexture=makeTexture("#a76234","rgba(72,34,16,",0,true);
const wood = new THREE.MeshStandardMaterial({map:woodTexture,color:0xd18a4a,roughness:.8,bumpMap:woodTexture,bumpScale:.06});
for (const [x,z,sx,sz] of [[0,-12.4,38,1],[0,12.4,38,1],[-18.4,0,1,26],[18.4,0,1,26]]) addMesh(new THREE.BoxGeometry(sx,2.1,sz),wood,new THREE.Vector3(x,-.35,z));
const ground = addMesh(new THREE.PlaneGeometry(100,100),material(0x80936a,1),new THREE.Vector3(0,-1.58,0)); ground.rotation.x=-Math.PI/2;

function toyPlastic(color){return new THREE.MeshStandardMaterial({color,roughness:.34,metalness:.02});}
function addWorldProps() {
  // grass tufts (a few leaning blades each) along the sandbox rim
  const green=material(0x4d7246,.9),green2=material(0x5f8a50,.9);
  for(let i=0;i<22;i++){const tuft=new THREE.Group();tuft.position.set(-18.5+(i%11)*3.7,-.55,i<11?-13.3:13.3);world.add(tuft);for(let b=0;b<3;b++){const blade=addMesh(new THREE.ConeGeometry(.08,.95+(b%2)*.5,4),b%2?green2:green,new THREE.Vector3((b-1)*.17,.42,(b-1)*.05),tuft);blade.rotation.z=(b-1)*.24;}}
  // premium toy bucket with rim, arched handle, and sand inside
  const bucket=new THREE.Group();bucket.position.set(15.6,0,-9.4);bucket.rotation.y=-.35;world.add(bucket);const bred=toyPlastic(0xdd4a33);
  addMesh(new THREE.CylinderGeometry(1.18,.86,1.9,22),bred,new THREE.Vector3(0,.95,0),bucket);
  addMesh(new THREE.TorusGeometry(1.18,.1,10,24),bred,new THREE.Vector3(0,1.9,0),bucket).rotation.x=Math.PI/2;
  addMesh(new THREE.TorusGeometry(1.05,.05,8,20,Math.PI),material(0x9a938a,.4,.3),new THREE.Vector3(0,1.9,0),bucket);
  addMesh(new THREE.CylinderGeometry(1.02,1.02,.4,22),material(0xedcb84,1),new THREE.Vector3(0,1.55,0),bucket);
  // toy dump truck: tilted bed with a sand pile, cab, chunky wheels
  const truck=new THREE.Group();truck.position.set(-14.8,0,9.2);truck.rotation.y=.42;world.add(truck);const yellow=toyPlastic(0xe7b23c),ydark=toyPlastic(0xcaa02f),tire=material(0x2a2724,.7),hub=material(0xb9b7ad,.35,.4);
  addMesh(new THREE.BoxGeometry(4,.42,1.7),ydark,new THREE.Vector3(.2,.55,0),truck);
  const bed=addMesh(new THREE.BoxGeometry(2.6,1,1.85),yellow,new THREE.Vector3(-.35,1.2,0),truck);bed.rotation.z=.13;
  addMesh(new THREE.CylinderGeometry(.85,1.05,.5,16),material(0xedcb84,1),new THREE.Vector3(-.5,1.75,0),truck);
  addMesh(new THREE.BoxGeometry(1.15,1.15,1.7),yellow,new THREE.Vector3(1.65,1.1,0),truck);
  addMesh(new THREE.BoxGeometry(.7,.6,1.5),material(0x9cc3e0,.3,.2),new THREE.Vector3(1.78,1.42,0),truck);
  for(const x of [-1.0,1.6])for(const z of [-.92,.92]){const w=addMesh(new THREE.CylinderGeometry(.52,.52,.32,16),tire,new THREE.Vector3(x,.4,z),truck);w.rotation.x=Math.PI/2;addMesh(new THREE.CylinderGeometry(.19,.19,.34,10),hub,new THREE.Vector3(x,.4,z),truck).rotation.x=Math.PI/2;}
  // a little rake leaning in the sand - the tool that combs the grooves
  const rake=new THREE.Group();rake.position.set(12.8,0,8.6);rake.rotation.set(0,.55,-.34);world.add(rake);const rakeMeta=material(0x6f6a63,.4,.3);
  addMesh(new THREE.CylinderGeometry(.09,.09,5.4,8),material(0xc79a5b,.6),new THREE.Vector3(0,2.35,0),rake);
  addMesh(new THREE.BoxGeometry(1.7,.16,.16),rakeMeta,new THREE.Vector3(0,.12,0),rake);
  for(let i=0;i<7;i++)addMesh(new THREE.BoxGeometry(.07,.42,.07),rakeMeta,new THREE.Vector3(-.72+i*.24,-.14,0),rake);
  // plastic shovel standing in the sand
  const shovel=new THREE.Group();shovel.position.set(17,0,6.6);shovel.rotation.z=-.2;world.add(shovel);
  addMesh(new THREE.CylinderGeometry(.11,.11,6,8),material(0xc79a5b,.6),new THREE.Vector3(0,2.2,0),shovel);addMesh(new THREE.CylinderGeometry(.3,.3,.16,14),toyPlastic(0xdd4a33),new THREE.Vector3(0,5.2,0),shovel);const blade=addMesh(new THREE.BoxGeometry(1.5,.18,1.7),toyPlastic(0xdd4a33),new THREE.Vector3(0,-.75,0),shovel);blade.rotation.x=-.25;
  // popsicle-stick fence along the back
  const stick=material(0xc9995b,.78), white=material(0xf4e6c9,.55), coneOrange=toyPlastic(0xef6f34);
  for(let i=0;i<10;i++){const post=addMesh(new THREE.BoxGeometry(.22,2.4,.18),stick,new THREE.Vector3(-10.8+i*2.35,.1,-14.1));post.rotation.z=(i%2?1:-1)*.025;}
  for(const y of [-.25,.65])addMesh(new THREE.BoxGeometry(23,.2,.16),stick,new THREE.Vector3(-.2,y,-14.05));
  // tiny toy cones
  for(const x of [-11,-7.5,8.5,12]){const cone=new THREE.Group();cone.position.set(x,0,-10.7);world.add(cone);addMesh(new THREE.ConeGeometry(.38,1.1,16),coneOrange,new THREE.Vector3(0,.55,0),cone);addMesh(new THREE.BoxGeometry(.9,.08,.9),coneOrange,new THREE.Vector3(0,.04,0),cone);addMesh(new THREE.TorusGeometry(.27,.045,6,16),white,new THREE.Vector3(0,.48,0),cone).rotation.x=Math.PI/2;}
  // rocks as mountains
  const stone=material(0x8f8978,1);for(let i=0;i<12;i++){const rock=addMesh(new THREE.DodecahedronGeometry(.22+(i%3)*.12,0),stone,new THREE.Vector3(-15+(i*5.7)%30,.03,-9+(i*3.8)%18));rock.scale.y=.55;rock.rotation.set(i*.2,i*.7,0);}
}
addWorldProps();

const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(), sandPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
let activeTool="track", path=[], startMarker=null, finishMarker=null, obstacles=[], riders=[], history=[];
let trackMesh=null, raceCurve=null, drawing=false, panning=false, lastPointer=null, racing=false, finishOrder=[];
let previewObject=null, buildAnimations=[];
let lastTime=performance.now(); const wearGroup=new THREE.Group(); buildLayer.add(wearGroup);

function applyCamera(){const horizon=Math.cos(camView.elev)*camView.dist;camera.position.set(camView.tx+Math.sin(camView.yaw)*horizon,Math.sin(camView.elev)*camView.dist,camView.tz+Math.cos(camView.yaw)*horizon);camera.lookAt(camView.tx,0,camView.tz);}
// The sandbox should feel alive even when the player's hands are still: a slow, imperfect
// breath and drift, like kneeling beside a diorama and slowly circling it. It hushes the
// instant the player touches the sand, and gently eases back after a moment of stillness.
function updateCameraFrame(dt,time){
  const idle=THREE.MathUtils.clamp((performance.now()-cameraIdleSince-900)/2600,0,1);
  const life=idle*idle*(3-2*idle);                       // smoothstep in after ~0.9s of stillness
  let wantTx=cameraTarget.x+Math.sin(time*.00009)*.9*life;
  let wantTz=cameraTarget.z+Math.cos(time*.000115)*.7*life;
  let wantDist=cameraDistance+Math.sin(time*.00023)*1.7*life;   // slow breathing zoom
  let wantYaw=cameraYaw+Math.sin(time*.000165)*.12*life;        // gentle sway around the sandbox
  let wantElev=CAM_ELEV+Math.sin(time*.000135)*.015*life;
  if(racing&&riders.length){let cx=0,cz=0;for(const r of riders){cx+=r.group.position.x;cz+=r.group.position.z;}cx/=riders.length;cz/=riders.length;wantTx=cx;wantTz=cz;wantDist=cameraDistance+2.4;wantYaw=cameraYaw;wantElev=CAM_ELEV;}
  const ease=1-Math.pow(racing?.0008:.0016,dt);
  if((panning||drawing)&&!racing){camView.tx=cameraTarget.x;camView.tz=cameraTarget.z;} // crisp direct panning
  else{camView.tx+=(wantTx-camView.tx)*ease;camView.tz+=(wantTz-camView.tz)*ease;}
  camView.dist+=(wantDist-camView.dist)*ease;camView.yaw+=(wantYaw-camView.yaw)*ease;camView.elev+=(wantElev-camView.elev)*ease;
  applyCamera();
}
function resize(){const rect=canvas.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/Math.max(rect.height,1);camera.updateProjectionMatrix();}
function pointerToSand(event){const rect=canvas.getBoundingClientRect();pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);raycaster.setFromCamera(pointer,camera);return raycaster.ray.intersectPlane(sandPlane,new THREE.Vector3());}
function inside(point){return point&&Math.abs(point.x)<17.6&&Math.abs(point.z)<11.6;}

function createTools(){for(const [id,symbol,label,hint] of TOOL_DEFS){const button=document.createElement("button");button.type="button";button.className=`tool${id===activeTool?" active":""}`;button.dataset.tool=id;button.title=hint;button.innerHTML=`<span class="tool-symbol">${TOOL_ICONS[id]||symbol}</span><span>${label}</span>`;button.onclick=()=>selectTool(id,hint);ui.tools.append(button);}}
function selectTool(tool,hint){if(racing)return;clearPreview();if(tool==="undo")return undo();activeTool=tool;ui.hint.textContent=hint;document.querySelectorAll(".tool").forEach(button=>button.classList.toggle("active",button.dataset.tool===tool));}
function savedTransform(object){return object?{position:object.position.toArray(),rotation:object.rotation.y}:null;}
function stateSnapshot(){return{path:path.map(p=>p.toArray()),start:savedTransform(startMarker),finish:savedTransform(finishMarker),obstacles:obstacles.map(o=>({type:o.userData.type,...savedTransform(o)}))};}
function snapshot(){history.push(stateSnapshot());if(history.length>20)history.shift();}
function disposeObject(object){object.traverse(child=>{child.geometry?.dispose();if(child.material)(Array.isArray(child.material)?child.material:[child.material]).forEach(m=>m.dispose());});object.removeFromParent();}
function clearBuildObjects(){if(trackMesh)disposeObject(trackMesh);trackMesh=null;if(startMarker)disposeObject(startMarker);startMarker=null;if(finishMarker)disposeObject(finishMarker);finishMarker=null;obstacles.forEach(disposeObject);obstacles=[];}
function undo(){if(!history.length)return;const state=history.pop();clearBuildObjects();path=state.path.map(p=>new THREE.Vector3(...p));rebuildTrack();if(state.start)startMarker=makeMarker("start",new THREE.Vector3(...state.start.position),state.start.rotation);if(state.finish)finishMarker=makeMarker("finish",new THREE.Vector3(...state.finish.position),state.finish.rotation);state.obstacles.forEach(o=>obstacles.push(makeObstacle(o.type,new THREE.Vector3(...o.position),o.rotation)));}

function ribbonGeometry(curve,width,y,samples){const positions=[],uvs=[],indices=[];for(let i=0;i<=samples;i++){const t=i/samples,p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize(),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();for(const sign of [-1,1]){positions.push(p.x+side.x*width*sign,y,p.z+side.z*width*sign);uvs.push((sign+1)/2,t*8);}}for(let i=0;i<samples;i++){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,b,c,b,d,c);}const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;}
function offsetCurve(curve,offset,samples){const points=[];for(let i=0;i<=samples;i++){const t=i/samples,p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize(),side=new THREE.Vector3(-tangent.z,0,tangent.x);points.push(p.clone().addScaledVector(side,offset).setY(.105));}return new THREE.CatmullRomCurve3(points,false,"catmullrom",.35);}
function rebuildTrack(){if(trackMesh)disposeObject(trackMesh);if(path.length<2){trackMesh=null;return;}raceCurve=new THREE.CatmullRomCurve3(path,false,"catmullrom",.35);const samples=Math.max(48,path.length*3);trackMesh=new THREE.Group();
  const outer=new THREE.Mesh(ribbonGeometry(raceCurve,.92,.035,samples),material(0x643719,1));outer.receiveShadow=true;trackMesh.add(outer);
  const trackTexture=sandTexture.clone();trackTexture.repeat.set(3,12);trackTexture.needsUpdate=true;const surfaceMat=new THREE.MeshStandardMaterial({color:0x96552c,roughness:.98,map:trackTexture,bumpMap:trackTexture,bumpScale:.018});const surface=new THREE.Mesh(ribbonGeometry(raceCurve,.72,.06,samples),surfaceMat);surface.receiveShadow=true;trackMesh.add(surface);
  const rutMat=material(0x4d2b1a,1);for(const offset of [-.34,.34]){const rut=new THREE.Mesh(new THREE.TubeGeometry(offsetCurve(raceCurve,offset,samples),samples,.025,7,false),rutMat);trackMesh.add(rut);}
  buildLayer.add(trackMesh);
}
function nearestTrackPlacement(position,acrossTrack=false){if(!raceCurve||path.length<2)return{position:position.clone(),rotation:0,snapped:false,progress:0};let bestDistance=Infinity,bestT=0;const samples=Math.max(120,path.length*6);for(let i=0;i<=samples;i++){const t=i/samples,distance=raceCurve.getPointAt(t).distanceToSquared(position);if(distance<bestDistance){bestDistance=distance;bestT=t;}}const snappedPosition=raceCurve.getPointAt(bestT);snappedPosition.y=0;const tangent=raceCurve.getTangentAt(bestT).normalize();const alongTrack=-Math.atan2(tangent.z,tangent.x);return{position:snappedPosition,rotation:alongTrack+(acrossTrack?Math.PI/2:0),snapped:true,progress:bestT};}
function checkerTexture(){const c=document.createElement("canvas");c.width=128;c.height=48;const x=c.getContext("2d");const cols=8,rows=3,w=c.width/cols,h=c.height/rows;for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){x.fillStyle=(r+col)%2?"#f6ecd2":"#2b2925";x.fillRect(col*w,r*h,w,h);}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const checkerTex=checkerTexture();
// Proper toy gates: two rounded posts with cap balls and a banner across the
// top - a red "go" banner for the start, a checkered banner for the finish.
function makeMarker(type,position,savedRotation=null){const placement=savedRotation===null?nearestTrackPlacement(position,true):{position,rotation:savedRotation,snapped:true};const group=new THREE.Group();group.position.copy(placement.position);group.rotation.y=placement.rotation;buildLayer.add(group);
  const postMat=material(0x8a5a30,.66),red=material(0xd8452f,.32),cream=material(0xf6ecd2,.4),dark=material(0x2b2925,.5),green=material(0x62c47a,.28);
  for(const x of [-1.05,1.05]){addMesh(new THREE.CylinderGeometry(.1,.12,1.5,12),postMat,new THREE.Vector3(x,.75,0),group);addMesh(new THREE.SphereGeometry(.17,14,10),type==="finish"?dark:red,new THREE.Vector3(x,1.56,0),group);}
  if(type==="finish"){const banner=new THREE.Mesh(new THREE.BoxGeometry(2.55,.58,.1),new THREE.MeshStandardMaterial({map:checkerTex,roughness:.72}));banner.position.set(0,1.4,0);banner.castShadow=true;banner.receiveShadow=true;group.add(banner);}
  else{addMesh(new THREE.BoxGeometry(2.55,.58,.1),red,new THREE.Vector3(0,1.4,0),group);addMesh(new THREE.BoxGeometry(2.55,.16,.12),cream,new THREE.Vector3(0,1.4,0),group);addMesh(new THREE.SphereGeometry(.12,12,8),green,new THREE.Vector3(0,1.68,.07),group);}
  group.userData.type=type;group.userData.snapped=placement.snapped;return group;}
// Sweep a 2D side profile (x=along track, y=up) across the track width into a
// soft-edged dirt feature. Local +X is the riding direction, so takeoff faces
// sit on the -X (approach) side and landings on +X.
function sweepFeature(shape,width,mat,bevel=.09){const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:2,steps:1,curveSegments:14});geo.translate(0,0,-width/2);geo.computeVertexNormals();const mesh=new THREE.Mesh(geo,mat);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
function kickerShape(len,h){const s=new THREE.Shape();s.moveTo(-len,0);s.quadraticCurveTo(-len*.42,h*.2,-len*.06,h*.92);s.quadraticCurveTo(len*.04,h*1.02,len*.2,h*.94);s.quadraticCurveTo(len*.6,h*.5,len*.82,0);s.lineTo(-len,0);return s;}
function tabletopShape(len,h,top){const s=new THREE.Shape();s.moveTo(-len,0);s.quadraticCurveTo(-len*.58,h*.62,-len*top,h);s.lineTo(len*top,h);s.quadraticCurveTo(len*.58,h*.62,len,0);s.lineTo(-len,0);return s;}
function hillShape(len,h){const s=new THREE.Shape();s.moveTo(-len,0);s.quadraticCurveTo(-len*.5,h,0,h);s.quadraticCurveTo(len*.5,h,len,0);s.lineTo(-len,0);return s;}
// A washboard rhythm section: a row of rounded humps on a thin dirt base.
function bumpsShape(count,spacing,r,h){const s=new THREE.Shape();const total=(count-1)*spacing,x0=-total/2-r,x1=total/2+r,b=.12;s.moveTo(x0,b);for(let i=0;i<count;i++){const cx=-total/2+i*spacing;s.lineTo(cx-r,b);s.quadraticCurveTo(cx,b+h,cx+r,b);}s.lineTo(x1,b);s.lineTo(x1,0);s.lineTo(x0,0);s.closePath();return s;}
function addKicker(group,cx,len,h,width,lip=true){const face=sweepFeature(kickerShape(len,h),width,dirtPacked);face.position.x=cx;group.add(face);if(lip){const cap=sweepFeature(kickerShape(len*.9,h),width*.82,dirtWorn);cap.position.set(cx+len*.02,h*.06,0);cap.scale.set(1,.16,1);group.add(cap);}} // worn lip catches light
// A banked toy berm: a curved wall that rises toward the outside of the turn.
function bankedBerm(mat){const rIn=1.0,rOut=2.2,h=1.2,a0=-1.3,a1=1.3,seg=22;const pos=[],idx=[];for(let i=0;i<=seg;i++){const a=a0+(a1-a0)*i/seg,c=Math.cos(a),s=Math.sin(a);pos.push(c*rIn,0,s*rIn, c*rOut,h,s*rOut, c*rOut,0,s*rOut);}for(let i=0;i<seg;i++){const b=i*3,n=b+3;idx.push(b,b+1,n, b+1,n+1,n);idx.push(b+1,b+2,n+1, b+2,n+2,n+1);}const capA=[0,1,2],capB=[seg*3,seg*3+1,seg*3+2];idx.push(capA[0],capA[1],capA[2],capB[2],capB[1],capB[0]);const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();const m=mat.clone();m.side=THREE.DoubleSide;const mesh=new THREE.Mesh(geo,m);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
function makeObstacle(type,position,savedRotation=null){const placement=savedRotation===null?nearestTrackPlacement(position,false):{position,rotation:savedRotation,snapped:true};const group=new THREE.Group();group.position.copy(placement.position);group.rotation.y=placement.rotation;group.userData.type=type;group.userData.snapped=placement.snapped;buildLayer.add(group);
  if(type==="sand"){addMesh(new THREE.CylinderGeometry(1.55,1.75,.12,24),material(0xdcb469,1),new THREE.Vector3(0,.02,0),group);const soft=addMesh(new THREE.CylinderGeometry(1.35,1.5,.14,24),material(0xf0cd86,1),new THREE.Vector3(0,.05,0),group);soft.scale.y=1;for(let i=0;i<9;i++){const a=i/9*Math.PI*2;addMesh(new THREE.TorusGeometry(.5+ (i%3)*.28,.05,5,16,Math.PI),material(0xe9c47d,1),new THREE.Vector3(Math.cos(a)*.2,.11,Math.sin(a)*.2),group).rotation.x=-Math.PI/2;}}
  else if(type==="berm")group.add(bankedBerm(dirtPacked));
  else if(type==="tabletop"){group.add(sweepFeature(tabletopShape(1.55,.6,.42),1.7,dirtPacked));const top=sweepFeature(tabletopShape(1.4,.6,.46),1.5,dirtWorn);top.scale.set(1,.06,1);top.position.y=.6*.95;group.add(top);}
  else if(type==="whoops")group.add(sweepFeature(bumpsShape(6,.5,.26,.34),1.6,dirtPacked,.05));
  else if(type==="rollers")group.add(sweepFeature(bumpsShape(4,.8,.42,.52),1.7,dirtPacked,.05));
  else if(type==="hill")group.add(sweepFeature(hillShape(1.7,1.3),2.5,dirtPacked));
  else if(type==="double"){addKicker(group,-.85,1.0,.66,1.7);addKicker(group,1.0,.95,.58,1.7);}
  else if(type==="triple"){addKicker(group,-1.65,.95,.64,1.7);addKicker(group,0,.98,.7,1.7);addKicker(group,1.65,.95,.58,1.7);}
  else addKicker(group,0,1.1,.68,1.8);
  return group;
}

function clearPreview(){if(previewObject){disposeObject(previewObject);previewObject=null;}}
function ghostify(object){object.userData.preview=true;object.traverse(child=>{if(!child.material)return;child.material=child.material.clone();child.material.transparent=true;child.material.opacity=.38;child.material.depthWrite=false;child.material.emissive?.setHex(0xffd89a);child.material.emissiveIntensity=.12;});}
function updatePlacementPreview(point){const isMarker=activeTool==="start"||activeTool==="finish",isObstacle=DIFFICULTY[activeTool]!==undefined;if(!inside(point)||path.length<2||(!isMarker&&!isObstacle)){clearPreview();return;}if(!previewObject||previewObject.userData.type!==activeTool){clearPreview();previewObject=isMarker?makeMarker(activeTool,point):makeObstacle(activeTool,point);ghostify(previewObject);}const placement=nearestTrackPlacement(point,isMarker);previewObject.position.copy(placement.position);previewObject.rotation.y=placement.rotation;previewObject.userData.snapped=placement.snapped;}

function createBuilderHelper(kind,position){const helper=new THREE.Group();helper.position.copy(position);buildLayer.add(helper);const yellow=material(0xe0a62d,.3),red=material(0xd34b35,.3),skin=material(0xe4ad79,.48),woodHandle=material(0xb8874f,.72),dark=material(0x2c2c2a,.72);
  if(kind==="hand"){addMesh(new THREE.BoxGeometry(1.15,.34,1.55),skin,new THREE.Vector3(0,.3,0),helper);for(let i=0;i<4;i++){const finger=addMesh(new THREE.CapsuleGeometry(.12,.72,4,8),skin,new THREE.Vector3(-.42+i*.28,.22,-.88),helper);finger.rotation.x=Math.PI/2;}helper.rotation.x=-.28;}
  else if(kind==="shovel"){const handle=addMesh(new THREE.CylinderGeometry(.055,.055,3.2,8),woodHandle,new THREE.Vector3(0,1.7,0),helper);handle.rotation.z=-.35;const blade=addMesh(new THREE.BoxGeometry(.8,.12,.9),red,new THREE.Vector3(.54,.22,0),helper);blade.rotation.z=-.35;}
  else{addMesh(new THREE.BoxGeometry(1.6,.7,1.05),yellow,new THREE.Vector3(0,.52,0),helper);addMesh(new THREE.BoxGeometry(.7,.65,1),yellow,new THREE.Vector3(-.72,.88,0),helper);for(const x of [-.55,.55])for(const z of [-.58,.58]){const wheel=addMesh(new THREE.CylinderGeometry(.22,.22,.16,10),dark,new THREE.Vector3(x,.22,z),helper);wheel.rotation.x=Math.PI/2;}const blade=addMesh(new THREE.BoxGeometry(.18,.65,1.5),yellow,new THREE.Vector3(.95,.35,0),helper);blade.rotation.z=-.18;}
  helper.scale.setScalar(kind==="hand"?1.25:.9);return helper;
}
function animatePlacement(object,type){const kind=type==="start"||type==="finish"?"hand":type==="whoops"||type==="rollers"||type==="sand"?"dozer":"shovel";object.scale.setScalar(.06);object.userData.building=true;const helper=createBuilderHelper(kind,object.position);buildAnimations.push({object,helper,kind,elapsed:0,duration:kind==="hand"?.48:.62,start:object.position.clone()});}
function updateBuildAnimations(delta){for(let i=buildAnimations.length-1;i>=0;i--){const animation=buildAnimations[i];animation.elapsed+=delta;const p=Math.min(animation.elapsed/animation.duration,1),back=1+2.6*Math.pow(p-1,3)+1.6*Math.pow(p-1,2);animation.object.scale.setScalar(Math.max(.06,back));if(animation.kind==="dozer")animation.helper.position.set(animation.start.x-3.5+p*5,animation.start.y+.15,animation.start.z+1.2);else if(animation.kind==="shovel")animation.helper.position.set(animation.start.x+1.5-p*.9,animation.start.y+1.1+Math.abs(Math.sin(p*Math.PI*3))*.9,animation.start.z+.6);else animation.helper.position.set(animation.start.x+(1-p)*2.2,animation.start.y+1.1+Math.sin(p*Math.PI)*1.8,animation.start.z-1.3*(1-p));if(p>=1){animation.object.scale.setScalar(1);animation.object.userData.building=false;disposeObject(animation.helper);buildAnimations.splice(i,1);}}}

function randomSkill(){return .15+Math.random()*.85;}
function createBike(name,color,index){
  const group=new THREE.Group();group.scale.setScalar(.66);riderLayer.add(group);
  const plastic=material(color,.22,.04),dark=material(0x222323,.75),chrome=material(0xb9b7ad,.2,.72),white=material(0xf5ecd7,.35),boot=material(0x30363a,.48);
  for(const x of [-.9,.9]){const wheel=addMesh(new THREE.TorusGeometry(.44,.15,10,20),dark,new THREE.Vector3(x,.46,0),group);wheel.rotation.y=Math.PI/2;const hub=addMesh(new THREE.CylinderGeometry(.11,.11,.22,12),chrome,new THREE.Vector3(x,.46,0),group);hub.rotation.x=Math.PI/2;}
  const frame=addMesh(new THREE.CylinderGeometry(.055,.055,1.25,8),chrome,new THREE.Vector3(-.12,.74,0),group);frame.rotation.z=Math.PI/2.8;
  addMesh(new THREE.BoxGeometry(1.18,.34,.5),plastic,new THREE.Vector3(-.04,.78,0),group);
  const rear=addMesh(new THREE.BoxGeometry(.72,.15,.58),plastic,new THREE.Vector3(-.74,1.01,0),group);rear.rotation.z=.13;
  const front=addMesh(new THREE.BoxGeometry(.75,.13,.55),plastic,new THREE.Vector3(.82,1.02,0),group);front.rotation.z=-.16;
  addMesh(new THREE.BoxGeometry(.48,.44,.46),dark,new THREE.Vector3(-.02,.55,0),group);
  addMesh(new THREE.BoxGeometry(.7,.11,.42),material(0x343331,.7),new THREE.Vector3(-.25,1.08,0),group);
  for(const z of [-.16,.16]){const fork=addMesh(new THREE.CylinderGeometry(.035,.035,.82,8),chrome,new THREE.Vector3(.73,.78,z),group);fork.rotation.z=-.22;}
  const bar=addMesh(new THREE.CylinderGeometry(.035,.035,.72,8),chrome,new THREE.Vector3(.58,1.28,0),group);bar.rotation.x=Math.PI/2;
  const plate=addMesh(new THREE.BoxGeometry(.12,.48,.55),white,new THREE.Vector3(.75,1.2,0),group);plate.rotation.z=-.12;
  const torso=addMesh(new THREE.CapsuleGeometry(.23,.58,5,10),plastic,new THREE.Vector3(-.12,1.5,0),group);torso.rotation.z=-.22;
  for(const z of [-.22,.22]){const leg=addMesh(new THREE.CapsuleGeometry(.105,.42,4,8),boot,new THREE.Vector3(-.12,1.05,z),group);leg.rotation.z=.38;}
  const helmet=addMesh(new THREE.SphereGeometry(.38,16,12),plastic,new THREE.Vector3(.12,2.05,0),group);helmet.scale.set(1.08,.92,1);
  const visor=addMesh(new THREE.BoxGeometry(.38,.07,.5),dark,new THREE.Vector3(.39,2.08,0),group);visor.rotation.z=-.12;
  const skills={jump:randomSkill(),whoops:randomSkill(),sand:randomSkill(),rollers:randomSkill(),hill:randomSkill(),start:randomSkill(),aggression:randomSkill(),consistency:randomSkill()};
  return{group,name,number:2+Math.floor(Math.random()*987),personality:PERSONALITIES[Math.floor(Math.random()*PERSONALITIES.length)],skills,progress:skills.start*.015,speed:.075+skills.start*.045,lane:(index-2)*.28,targetLane:(index-2)*.28,checked:new Set(),crash:0,air:0,finished:false,messages:[],bounce:Math.random()*6};
}

function nearestPathProgress(position){if(!raceCurve)return-1;let best=Infinity,bestT=-1;const samples=Math.max(80,path.length*5);for(let i=0;i<=samples;i++){const t=i/samples,d=raceCurve.getPointAt(t).distanceToSquared(position);if(d<best){best=d;bestT=t;}}return best<6?bestT:-1;}
function startRace(){if(racing)return;if(path.length<3)return showFeedback("The toy bikes need a smooth track first.");clearPreview();racing=true;finishOrder=[];ui.again.hidden=true;ui.race.disabled=true;ui.status.classList.add("racing");ui.wrap.classList.add("racing");ui.mode.textContent="The sandbox is alive";document.querySelectorAll(".tool").forEach(b=>b.disabled=true);ui.banner.textContent="Ready...";setTimeout(()=>{if(racing)ui.banner.textContent="Go!";},650);setTimeout(()=>ui.banner.textContent="",1350);riders.forEach(r=>disposeObject(r.group));riders=[...COLORS].sort(()=>Math.random()-.5).slice(0,5).map(([name,color],i)=>createBike(name,color,i));raceCurve=new THREE.CatmullRomCurve3(path,false,"catmullrom",.35);showFeedback(`${riders[0].name} bike ${riders[0].personality} this race.`);}
function checkObstacles(rider){obstacles.forEach((obstacle,index)=>{if(rider.checked.has(index))return;const at=nearestPathProgress(obstacle.position);if(at<0||rider.progress<at)return;rider.checked.add(index);const type=obstacle.userData.type,key=JUMPS.has(type)?"jump":type,skill=rider.skills[key]??.5,difficulty=DIFFICULTY[type],confidence=skill*.7+rider.skills.consistency*.3;
    if(JUMPS.has(type)){if(confidence>difficulty){rider.air=.34+difficulty*.42;rider.speed=Math.min(.15,rider.speed+.008);rider.messages.push(`${rider.name} bike cleared the ${type}!`);}else if(rider.skills.aggression+Math.random()*.2>difficulty+.25){rider.crash=.5;rider.speed*=.62;rider.messages.push(`${rider.name} bike almost cleared the ${type}!`);}else{rider.speed*=.82;rider.messages.push(`${rider.name} bike rolled the ${type}.`);}}
    else if(confidence>difficulty){rider.speed=Math.min(.14,rider.speed+.004);rider.messages.push(type==="berm"?`${rider.name} bike loved that berm.`:`${rider.name} bike flew through the ${type}.`);}else{rider.speed*=.74;rider.messages.push(type==="sand"?`${rider.name} bike got stuck in the sand again.`:`${rider.name} bike bobbled through the ${type}.`);}rider.speed=Math.max(.045,rider.speed);});}
function addWear(point){if(wearGroup.children.length>380)disposeObject(wearGroup.children[0]);const mark=addMesh(new THREE.CircleGeometry(.08+Math.random()*.12,8),new THREE.MeshBasicMaterial({color:0x66391f,transparent:true,opacity:.13}),new THREE.Vector3(point.x+(Math.random()-.5)*.45,.015,point.z+(Math.random()-.5)*.35),wearGroup);mark.rotation.x=-Math.PI/2;mark.scale.x=2;}
function updateRace(dt,time){if(!racing)return;for(const rider of riders){if(rider.finished)continue;if(rider.crash>0){rider.crash-=dt;rider.group.rotation.z+=dt*8;continue;}rider.air=Math.max(0,rider.air-dt);rider.progress+=rider.speed*dt*(1+Math.sin(time*.004+rider.number)*.05*(1-rider.skills.consistency));rider.lane+=(rider.targetLane-rider.lane)*Math.min(1,dt*3);checkObstacles(rider);const t=Math.min(rider.progress,1),point=raceCurve.getPointAt(t),tangent=raceCurve.getTangentAt(t).normalize(),normal=new THREE.Vector3(-tangent.z,0,tangent.x),jump=rider.air>0?Math.sin(Math.min(1,rider.air/.6)*Math.PI)*1.65:0;rider.group.position.copy(point).addScaledVector(normal,rider.lane);rider.group.position.y=.16+jump+Math.sin(time*.01+rider.bounce)*.035;rider.group.rotation.y=-Math.atan2(tangent.z,tangent.x);rider.group.rotation.z=rider.air>0?-.18:0;if(Math.random()<.08)addWear(point);if(rider.progress>=1){rider.finished=true;finishOrder.push(rider);if(finishOrder.length===riders.length)endRace();}}
  riders.forEach((r,i)=>{let n=0;riders.forEach((o,j)=>{if(i!==j&&Math.abs(r.progress-o.progress)<.025)n+=Math.sign(i-j)*.22;});r.targetLane=THREE.MathUtils.clamp((i-2)*.18+n,-.8,.8);});}
function endRace(){racing=false;ui.race.disabled=false;ui.status.classList.remove("racing");ui.wrap.classList.remove("racing");ui.mode.textContent="Everything is still again";document.querySelectorAll(".tool").forEach(b=>b.disabled=false);const winner=finishOrder[0],stories=riders.flatMap(r=>r.messages),story=stories.length?stories[Math.floor(Math.random()*stories.length)]:"That little moto felt fast!";showFeedback(`${winner.name} bike won the pretend moto. ${story}`);ui.again.hidden=false;}
function showFeedback(message){ui.feedbackText.textContent=message;ui.feedback.classList.remove("pop");requestAnimationFrame(()=>ui.feedback.classList.add("pop"));}

canvas.addEventListener("pointerdown",event=>{if(racing)return;pokeCamera();lastPointer={x:event.clientX,y:event.clientY};if(event.shiftKey||event.button===1||event.button===2){panning=true;canvas.setPointerCapture(event.pointerId);return;}const point=pointerToSand(event);if(!inside(point))return;canvas.setPointerCapture(event.pointerId);snapshot();clearPreview();if(activeTool==="track"){path=[point];drawing=true;rebuildTrack();}else if(activeTool==="start"){if(startMarker)disposeObject(startMarker);startMarker=makeMarker("start",point);animatePlacement(startMarker,"start");}else if(activeTool==="finish"){if(finishMarker)disposeObject(finishMarker);finishMarker=makeMarker("finish",point);animatePlacement(finishMarker,"finish");}else if(activeTool==="dozer")obstacles=obstacles.filter(o=>{if(o.position.distanceTo(point)<2){disposeObject(o);return false;}return true;});else if(DIFFICULTY[activeTool]!==undefined){const obstacle=makeObstacle(activeTool,point);obstacles.push(obstacle);animatePlacement(obstacle,activeTool);}});
canvas.addEventListener("pointermove",event=>{pokeCamera();if(panning&&lastPointer){cameraTarget.x-=(event.clientX-lastPointer.x)*.025;cameraTarget.z-=(event.clientY-lastPointer.y)*.025;lastPointer={x:event.clientX,y:event.clientY};return;}if(racing)return;const point=pointerToSand(event);if(drawing){if(inside(point)&&(!path.length||path.at(-1).distanceTo(point)>.28)){path.push(point);rebuildTrack();}return;}updatePlacementPreview(point);});
canvas.addEventListener("pointerup",event=>{drawing=false;panning=false;lastPointer=null;const point=pointerToSand(event);if(!racing)updatePlacementPreview(point);});canvas.addEventListener("pointercancel",()=>{drawing=false;panning=false;lastPointer=null;clearPreview();});canvas.addEventListener("pointerleave",()=>{if(!drawing&&!panning)clearPreview();});canvas.addEventListener("contextmenu",event=>event.preventDefault());canvas.addEventListener("wheel",event=>{event.preventDefault();pokeCamera();cameraDistance=THREE.MathUtils.clamp(cameraDistance+event.deltaY*.018,19,45);},{passive:false});
function resetSandbox(){if(racing)return;clearPreview();snapshot();clearBuildObjects();path=[];riders.forEach(r=>disposeObject(r.group));riders=[];while(wearGroup.children.length)disposeObject(wearGroup.children[0]);ui.again.hidden=true;showFeedback("Fresh sand. What should we build this time?");}
function animate(time){const elapsed=Math.min((time-lastTime)/1000,.1);lastTime=time;updateBuildAnimations(elapsed);updateRace(Math.min(elapsed,.035),time);updateCameraFrame(elapsed,time);renderer.render(scene,camera);requestAnimationFrame(animate);}

ui.race.onclick=startRace;ui.again.onclick=startRace;ui.reset.onclick=resetSandbox;window.addEventListener("resize",resize);window.addEventListener("keydown",event=>{if(event.code==="Space"){event.preventDefault();startRace();}if(event.key.toLowerCase()==="z"&&!racing)undo();});
window.__sandboxMotoDebug={camera:()=>({position:camera.position.toArray(),target:[camView.tx,camView.tz],idleMs:performance.now()-cameraIdleSince}),placementState:()=>({preview:previewObject&&{type:previewObject.userData.type,snapped:previewObject.userData.snapped,opacity:previewObject.children[0]?.material?.opacity},building:buildAnimations.length,start:startMarker&&{position:startMarker.position.toArray(),rotation:startMarker.rotation.y,snapped:startMarker.userData.snapped},finish:finishMarker&&{position:finishMarker.position.toArray(),rotation:finishMarker.rotation.y,snapped:finishMarker.userData.snapped},obstacles:obstacles.map(object=>({type:object.userData.type,position:object.position.toArray(),rotation:object.rotation.y,snapped:object.userData.snapped}))})};
createTools();applyCamera();resize();pokeCamera();requestAnimationFrame(animate);requestAnimationFrame(()=>ui.loading.classList.add("ready"));

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const $ = selector => document.querySelector(selector);
const canvas = $("#sandbox");
const ui = {
  tools: $("#tools"), race: $("#raceButton"), reset: $("#resetButton"), mode: $("#modeLabel"),
  feedback: $("#feedback"), feedbackText: $("#feedbackText"), again: $("#oneMoreButton"),
  banner: $("#raceBanner"), wrap: $(".sandbox-wrap"), status: $(".status"),
  hint: $("#toolHint"), loading: $("#loadingState"),
  shell: $(".game-shell"), label: $(".sandbox-label"), photoBtn: $("#photoButton"),
  photoBar: $("#photoBar"), savePhoto: $("#savePhoto"), closePhoto: $("#closePhoto"), photoCaption: $("#photoCaption")
};

const TOOL_DEFS = [
  ["track", "~", "Track", "Drag a smooth line through the sand"], ["start", "S", "Start", "Place the start gate"],
  ["finish", "F", "Finish", "Place the finish marker"], ["single", "^", "Single", "Place a little jump"],
  ["double", "^^", "Double", "Place a risky double"], ["triple", "^^^", "Triple", "Place the brave line"],
  ["tabletop", "=", "Tabletop", "Place a friendly big jump"], ["whoops", "www", "Whoops", "Stamp a bumpy rhythm"],
  ["rollers", "ooo", "Rollers", "Stamp a smooth rhythm"], ["sand", "...", "Deep sand", "Place a soft slow section"],
  ["hill", "A", "Hill", "Build a tiny mountain"],
  ["pile", "^", "Pile", "Push sand up - drag to build mounds and berms"], ["smooth", "-", "Smooth", "Smooth the sand flatter"],
  ["carve", "v", "Carve", "Scoop sand away"],
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
  hill: ICON(`<path d="M2.5 19 Q12 3.5 21.5 19 Z" fill="#b5713a"/><path d="M2.5 19 Q12 3.5 21.5 19" fill="none" stroke="#8a4f27" stroke-width="0"/><path d="M8 12 Q12 6.5 16 12" fill="none" stroke="#e2b174" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`),
  pile: ICON(`<path d="M2.5 19 Q12 9 21.5 19 Z" fill="#cf9f5c"/><path d="M8 13.5 Q12 9.5 16 13.5" fill="none" stroke="#e2b174" stroke-width="1.2" stroke-linecap="round" opacity=".7"/><path d="M12 2 L15.6 6.5 L13 6.5 L13 10 L11 10 L11 6.5 L8.4 6.5 Z" fill="#8a5a30"/>`),
  smooth: ICON(`<path d="M2.5 18.5 Q12 13.5 21.5 18.5 Z" fill="#cf9f5c"/><path d="M3.5 11.5 h17" stroke="#8a5a30" stroke-width="2.8" stroke-linecap="round"/><path d="M3.5 11 h17" stroke="#f1dca6" stroke-width="1" stroke-linecap="round"/>`),
  carve: ICON(`<path d="M2.8 12 Q12 5.5 21.2 12 Q12 20.5 2.8 12 Z" fill="#a86a38"/><path d="M6.5 11.5 Q12 15.5 17.5 11.5" fill="none" stroke="#7a4f27" stroke-width="1.1" opacity=".55"/><path d="M12 2 L15.6 6.5 L13 6.5 L13 10 L11 10 L11 6.5 L8.4 6.5 Z" fill="#8a5a30" transform="rotate(180 12 6)"/>`),
  dozer: ICON(`<circle cx="9" cy="16" r="2.4" fill="#3a3330"/><circle cx="14.5" cy="16" r="2.4" fill="#3a3330"/><circle cx="9" cy="16" r=".9" fill="#7a716a"/><circle cx="14.5" cy="16" r=".9" fill="#7a716a"/><rect x="7" y="9.5" width="9" height="5" rx="1.4" fill="#e4aa2f"/><rect x="12" y="6.5" width="4" height="4" rx="1" fill="#efc25a"/><path d="M4.6 8.5 L6.4 8.5 L6.4 16 L4.6 16 Q3.8 12 4.6 8.5 Z" fill="#c88f1e"/>`),
  undo: ICON(`<path d="M7.5 12 A5.5 5.5 0 1 1 9 16.2" fill="none" stroke="#835a34" stroke-width="2.6" stroke-linecap="round"/><path d="M7.5 7.5 L7.2 12.4 L12 11.6 Z" fill="#835a34"/>`)
};
// Fictional toy brands (Toy Bike Bible): [display name, primary, accent, brand].
// The name stays the kid-simple colour so feedback reads "the Red bike"; the
// accent + brand give each a distinct colourway and decals.
const COLORS = [
  ["Red",0xd94b35,0xf4c542,"Legacy Moto"],
  ["Blue",0x347cc2,0xeef1f4,"TrailWorks"],
  ["Green",0x4c955b,0xf2e64a,"DirtCo"],
  ["Yellow",0xe4b73f,0x2b2b2b,"PitKid Racing"],
  ["Purple",0x825da2,0xf39ac7,"MotoForge"],
  ["Orange",0xe87938,0x2f6fb0,"Backyard Factory"]
];
const PERSONALITIES = ["is fearless","is careful","always sends it","is feeling smooth","is a bad starter","is a great jumper","loves the whoops"];
const DIFFICULTY = {single:.22,double:.5,triple:.74,tabletop:.4,whoops:.54,rollers:.34,sand:.56,hill:.46};
const JUMPS = new Set(["single","double","triple","tabletop"]);

const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.17;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd9dcc3);
scene.fog = new THREE.Fog(0xdfe0c8, 44, 74);
const camera = new THREE.PerspectiveCamera(38, 1, .1, 120);
const cameraTarget = new THREE.Vector3();
let cameraDistance = 33;                    // user-controlled zoom (kneeling closer / leaning back)
let cameraYaw = 0;                          // user-controlled azimuth (reserved for future orbit)
const CAM_ELEV = 0.82;                       // base "kneeling beside the sandbox" angle
let cameraIdleSince = performance.now();     // when the player last touched the sandbox
const camView = { tx: 0, tz: 0, dist: 33, yaw: 0, elev: CAM_ELEV }; // smoothed values actually rendered
function pokeCamera(){ cameraIdleSince = performance.now(); } // the player is here - hush the drift

scene.add(new THREE.HemisphereLight(0xfff2cd, 0x7d6f4c, 2.35)); // warm sky, warm-earth bounce
const sun = new THREE.DirectionalLight(0xffcf86, 3.5);           // golden late-afternoon key
sun.position.set(-12,24,10); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048);
sun.shadow.bias = -.0004; sun.shadow.radius = 3;
Object.assign(sun.shadow.camera, {left:-28,right:28,top:22,bottom:-22}); scene.add(sun);
const warmFill = new THREE.PointLight(0xffb457, 21, 40, 2);
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
const dirtTexture=makeTexture("#b07a44","rgba(96,60,28,",1500);dirtTexture.repeat.set(3,3);
const dirtPacked=new THREE.MeshStandardMaterial({map:dirtTexture,color:0xcb9150,roughness:.98,bumpMap:dirtTexture,bumpScale:.022}); // packed dirt, warmed to match the groomed track
const dirtWorn=new THREE.MeshStandardMaterial({color:0xe3b972,roughness:.94}); // sun-lit worn line on top
const sand = addMesh(new THREE.BoxGeometry(36,1.5,24), sandMaterial, new THREE.Vector3(0,-.9,0));
// Deformable sand: a subdivided heightfield you can sculpt by hand (pile up a
// berm, smooth it, carve it away). The box above sits just below as the base.
const HF_SX=108,HF_SZ=72;
const heightGeo=new THREE.PlaneGeometry(36,24,HF_SX,HF_SZ);heightGeo.rotateX(-Math.PI/2);
const hpos=heightGeo.attributes.position;
heightGeo.setAttribute("color",new THREE.BufferAttribute(new Float32Array(hpos.count*3).fill(1),3));
const hcol=heightGeo.attributes.color;
// own material so height shading (peaks lit, hollows shaded) makes sculpted dirt read from above
const heightMat=new THREE.MeshStandardMaterial({map:sandTexture,color:0xffdf9f,roughness:.98,bumpMap:sandRake,bumpScale:.12,vertexColors:true});
const heightMesh=new THREE.Mesh(heightGeo,heightMat);heightMesh.receiveShadow=true;heightMesh.castShadow=true;world.add(heightMesh);
const SCULPT=new Set(["pile","smooth","carve"]);
let terrainDirty=false;
// Bake directional relief shading into vertex colours from the terrain normals,
// so piles and hollows read clearly even under the flat, warm scene lighting.
function shadeTerrain(){const nrm=heightGeo.attributes.normal,lx=-.44,ly=.78,lz=.44;for(let i=0;i<hpos.count;i++){const nd=nrm.getX(i)*lx+nrm.getY(i)*ly+nrm.getZ(i)*lz;const m=THREE.MathUtils.clamp(.6+.52*nd+hpos.getY(i)*.05,.48,1.0);hcol.setXYZ(i,m,m,m*.98);}hcol.needsUpdate=true;}
function refreshTerrain(){heightGeo.computeVertexNormals();shadeTerrain();}
function readHeights(){const a=new Float32Array(hpos.count);for(let i=0;i<hpos.count;i++)a[i]=hpos.getY(i);return a;}
function writeHeights(a){for(let i=0;i<hpos.count;i++)hpos.setY(i,a[i]);hpos.needsUpdate=true;refreshTerrain();}
function flattenHeights(){for(let i=0;i<hpos.count;i++)hpos.setY(i,0);hpos.needsUpdate=true;refreshTerrain();}
function applySculpt(px,pz,tool){const r=tool==="smooth"?3.3:2.1,r2=r*r,hits=[];for(let i=0;i<hpos.count;i++){const dx=hpos.getX(i)-px,dz=hpos.getZ(i)-pz,d2=dx*dx+dz*dz;if(d2<r2)hits.push([i,Math.sqrt(d2)]);}
  if(!hits.length)return;
  if(tool==="smooth"){let sum=0;for(const h of hits)sum+=hpos.getY(h[0]);const avg=sum/hits.length;for(const [i,d] of hits){const f=(1-d/r)*.45,y=hpos.getY(i);hpos.setY(i,y+(avg-y)*f);}}
  else{const dir=tool==="carve"?-1:1;for(const [i,d] of hits){const f=(1-d/r)*(1-d/r),y=THREE.MathUtils.clamp(hpos.getY(i)+dir*f*.16,-.8,3.0);hpos.setY(i,y);}}
  hpos.needsUpdate=true;terrainDirty=true;} // normals + shading refreshed once per frame in animate()
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
let sculpting=false, lastSculpt=null;
let previewObject=null, buildAnimations=[];
let lastTime=performance.now(); const wearGroup=new THREE.Group(); buildLayer.add(wearGroup);
// Comb marks: light grooves the player's hand/tool leaves in the sand while
// building - along the drawn track and around placed toys. Shared flat geometry.
const combGroup=new THREE.Group(); buildLayer.add(combGroup);
const combGeo=new THREE.PlaneGeometry(.7,.15); combGeo.rotateX(-Math.PI/2);
function addComb(x,z,angle,dark){if(combGroup.children.length>460){const old=combGroup.children[0];old.material.dispose();old.removeFromParent();}const m=new THREE.Mesh(combGeo,new THREE.MeshBasicMaterial({color:dark?0xb07f43:0xfbe7ac,transparent:true,opacity:dark?.16:.24,depthWrite:false}));m.position.set(x,.014,z);m.rotation.y=angle+(Math.random()-.5)*.22;m.scale.setScalar(.85+Math.random()*.5);combGroup.add(m);}
function combRing(p){for(let i=0;i<8;i++){const a=i/8*Math.PI*2,r=1.15+Math.random()*.6;addComb(p.x+Math.cos(a)*r,p.z+Math.sin(a)*r,a+Math.PI/2,i%2===0);}}
function clearCombs(){while(combGroup.children.length){const c=combGroup.children[0];c.material.dispose();c.removeFromParent();}}

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
function stateSnapshot(){return{path:path.map(p=>p.toArray()),start:savedTransform(startMarker),finish:savedTransform(finishMarker),obstacles:obstacles.map(o=>({type:o.userData.type,...savedTransform(o)})),heights:readHeights()};}
function snapshot(){history.push(stateSnapshot());if(history.length>20)history.shift();}
function disposeObject(object){object.traverse(child=>{child.geometry?.dispose();if(child.material)(Array.isArray(child.material)?child.material:[child.material]).forEach(m=>m.dispose());});object.removeFromParent();}
function clearBuildObjects(){if(trackMesh)disposeObject(trackMesh);trackMesh=null;if(startMarker)disposeObject(startMarker);startMarker=null;if(finishMarker)disposeObject(finishMarker);finishMarker=null;obstacles.forEach(disposeObject);obstacles=[];}
function undo(){if(!history.length)return;const state=history.pop();clearBuildObjects();path=state.path.map(p=>new THREE.Vector3(...p));rebuildTrack();if(state.start)startMarker=makeMarker("start",new THREE.Vector3(...state.start.position),state.start.rotation);if(state.finish)finishMarker=makeMarker("finish",new THREE.Vector3(...state.finish.position),state.finish.rotation);state.obstacles.forEach(o=>obstacles.push(makeObstacle(o.type,new THREE.Vector3(...o.position),o.rotation)));if(state.heights)writeHeights(state.heights);}

function ribbonGeometry(curve,width,y,samples){const positions=[],uvs=[],indices=[];for(let i=0;i<=samples;i++){const t=i/samples,p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize(),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize();for(const sign of [-1,1]){positions.push(p.x+side.x*width*sign,y,p.z+side.z*width*sign);uvs.push((sign+1)/2,t*8);}}for(let i=0;i<samples;i++){const a=i*2,b=a+1,c=a+2,d=a+3;indices.push(a,b,c,b,d,c);}const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute("uv",new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;}
function offsetCurve(curve,offset,samples){const points=[];for(let i=0;i<=samples;i++){const t=i/samples,p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize(),side=new THREE.Vector3(-tangent.z,0,tangent.x);points.push(p.clone().addScaledVector(side,offset).setY(.105));}return new THREE.CatmullRomCurve3(points,false,"catmullrom",.35);}
function rebuildTrack(){if(trackMesh)disposeObject(trackMesh);if(path.length<2){trackMesh=null;return;}raceCurve=new THREE.CatmullRomCurve3(path,false,"catmullrom",.35);const samples=Math.max(48,path.length*3);trackMesh=new THREE.Group();
  // soft sandy shoulder that blends into the floor (no hard dark border)
  const shoulder=new THREE.Mesh(ribbonGeometry(raceCurve,1.02,.028,samples),material(0xe0b775,1));shoulder.receiveShadow=true;trackMesh.add(shoulder);
  // groomed packed-sand surface: warm and light, with fleck map + raked grooming
  const surfTex=sandTexture.clone();surfTex.repeat.set(3,14);surfTex.needsUpdate=true;
  const surfBump=sandRake.clone();surfBump.repeat.set(1,11);surfBump.needsUpdate=true;
  const surfaceMat=new THREE.MeshStandardMaterial({color:0xcf9f5c,roughness:.99,map:surfTex,bumpMap:surfBump,bumpScale:.05});
  const surface=new THREE.Mesh(ribbonGeometry(raceCurve,.8,.048,samples),surfaceMat);surface.receiveShadow=true;trackMesh.add(surface);
  // two soft wheel ruts - subtle grooming lines, not dark gouges
  const rutMat=material(0xb07d42,1);for(const offset of [-.32,.32]){const rut=new THREE.Mesh(new THREE.TubeGeometry(offsetCurve(raceCurve,offset,samples),samples,.018,7,false),rutMat);trackMesh.add(rut);}
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
function makeObstacle(type,position,savedRotation=null){const placement=savedRotation===null?nearestTrackPlacement(position,false):{position,rotation:savedRotation,snapped:true};const group=new THREE.Group();group.position.copy(placement.position);group.rotation.y=placement.rotation;group.userData.type=type;group.userData.snapped=placement.snapped;buildLayer.add(group);
  if(type==="sand"){addMesh(new THREE.CylinderGeometry(1.55,1.75,.12,24),material(0xdcb469,1),new THREE.Vector3(0,.02,0),group);const soft=addMesh(new THREE.CylinderGeometry(1.35,1.5,.14,24),material(0xf0cd86,1),new THREE.Vector3(0,.05,0),group);soft.scale.y=1;for(let i=0;i<9;i++){const a=i/9*Math.PI*2;addMesh(new THREE.TorusGeometry(.5+ (i%3)*.28,.05,5,16,Math.PI),material(0xe9c47d,1),new THREE.Vector3(Math.cos(a)*.2,.11,Math.sin(a)*.2),group).rotation.x=-Math.PI/2;}}
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
function numberTexture(num,bg){const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d");x.fillStyle=bg;x.fillRect(0,0,64,64);x.fillStyle="#2b2925";x.font=`bold ${String(num).length>2?32:46}px Arial, sans-serif`;x.textAlign="center";x.textBaseline="middle";x.fillText(String(num),32,35);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
// A premium 1:12 toy motocross bike with an action-figure rider (Toy Bike Bible):
// chunky glossy bodywork, oversized fenders, a real number plate, simplified
// engine and pipe. Local +X is forward. Return shape/data is unchanged.
function createBike(def,index){
  const [name,color,accentColor,brand]=def;
  const group=new THREE.Group();group.scale.setScalar(.66);riderLayer.add(group);
  const number=2+Math.floor(Math.random()*97);
  const col=new THREE.Color(color),body=new THREE.MeshStandardMaterial({color,roughness:.3,metalness:.05}),bodyD=material(col.clone().multiplyScalar(.62).getHex(),.34,.05),rubber=material(0x1d1d1e,.86),chrome=material(0xcbc9c3,.26,.78),frameMat=material(col.clone().multiplyScalar(.8).getHex(),.35,.12),engine=material(0x44474a,.5,.4),seat=material(0x232221,.62),skin=material(0xe6b184,.5),glove=material(0x2b2b2b,.5),pants=material(0x2f3338,.6),bootMat=material(0x1f2124,.5),accent=material(accentColor,.32,.06);
  const plateMat=new THREE.MeshStandardMaterial({map:numberTexture(number,"#f4ead0"),roughness:.45});
  // two big equal knobby wheels, long wheelbase, open frame between them (local +X forward)
  for(const x of [-.95,.98]){addMesh(new THREE.TorusGeometry(.42,.13,12,24),rubber,new THREE.Vector3(x,.46,0),group);addMesh(new THREE.TorusGeometry(.29,.03,8,22),accent,new THREE.Vector3(x,.46,0),group);const hub=addMesh(new THREE.CylinderGeometry(.12,.12,.14,16),chrome,new THREE.Vector3(x,.46,0),group);hub.rotation.x=Math.PI/2;for(let s=0;s<3;s++){const sp=addMesh(new THREE.BoxGeometry(.58,.024,.024),chrome,new THREE.Vector3(x,.46,0),group);sp.rotation.z=s*Math.PI/3;}}
  // swingarm to the rear wheel
  const swing=addMesh(new THREE.BoxGeometry(.72,.06,.07),chrome,new THREE.Vector3(-.55,.5,.1),group);swing.rotation.z=.08;
  // compact engine low and central, with a slanted head and cooling fins
  addMesh(new THREE.BoxGeometry(.42,.34,.32),engine,new THREE.Vector3(.14,.48,0),group);
  const head=addMesh(new THREE.BoxGeometry(.24,.3,.3),engine,new THREE.Vector3(.31,.66,0),group);head.rotation.z=-.32;
  for(let i=0;i<3;i++)addMesh(new THREE.BoxGeometry(.3,.02,.34),chrome,new THREE.Vector3(.12,.4+i*.09,0),group);
  // open frame triangle: downtube + backbone
  const dt=addMesh(new THREE.CylinderGeometry(.028,.028,.72,8),frameMat,new THREE.Vector3(.5,.7,0),group);dt.rotation.z=Math.PI/2.6;
  const bb=addMesh(new THREE.CylinderGeometry(.028,.028,.82,8),frameMat,new THREE.Vector3(.14,.83,0),group);bb.rotation.z=Math.PI/2.12;
  // raked telescopic forks push the front wheel forward; triple clamp + steering
  for(const z of [-.1,.1]){const fork=addMesh(new THREE.CylinderGeometry(.032,.032,.64,8),chrome,new THREE.Vector3(.85,.69,z),group);fork.rotation.z=.5;}
  addMesh(new THREE.BoxGeometry(.12,.17,.26),frameMat,new THREE.Vector3(.71,.93,0),group);
  addMesh(new THREE.CylinderGeometry(.026,.026,.14,8),chrome,new THREE.Vector3(.66,1.04,0),group);
  const bar=addMesh(new THREE.CylinderGeometry(.025,.025,.5,8),chrome,new THREE.Vector3(.6,1.12,0),group);bar.rotation.x=Math.PI/2;
  // small narrow tank + long thin flat seat
  addMesh(new THREE.BoxGeometry(.32,.2,.3),body,new THREE.Vector3(.44,.83,0),group);
  addMesh(new THREE.BoxGeometry(.34,.05,.16),accent,new THREE.Vector3(.44,.9,0),group); // brand stripe on the tank
  const seatM=addMesh(new THREE.BoxGeometry(.86,.1,.3),seat,new THREE.Vector3(-.2,.9,0),group);seatM.rotation.z=.04;
  // angled radiator shrouds - the prominent side colour - with a brand accent stripe
  for(const z of [-.19,.19]){const shroud=addMesh(new THREE.BoxGeometry(.5,.42,.04),body,new THREE.Vector3(.36,.72,z),group);shroud.rotation.z=-.28;shroud.rotation.y=z>0?-.14:.14;const stripe=addMesh(new THREE.BoxGeometry(.52,.12,.04),accent,new THREE.Vector3(.36,.68,z*1.08),group);stripe.rotation.z=-.28;stripe.rotation.y=z>0?-.14:.14;}
  // kicked-up rear tail + angled side number plates
  const tail=addMesh(new THREE.BoxGeometry(.5,.06,.32),body,new THREE.Vector3(-.86,.99,0),group);tail.rotation.z=.32;
  for(const z of [-.17,.17]){const sp=addMesh(new THREE.BoxGeometry(.4,.28,.04),plateMat,new THREE.Vector3(-.6,.9,z),group);sp.rotation.z=.16;}
  // small floating front fender + front number plate on the bars
  const ff=addMesh(new THREE.BoxGeometry(.5,.05,.34),body,new THREE.Vector3(1.02,.78,0),group);ff.rotation.z=-.4;
  const fp=addMesh(new THREE.BoxGeometry(.06,.26,.3),plateMat,new THREE.Vector3(.6,.99,0),group);fp.rotation.z=-.32;
  // exhaust: header off the engine sweeping up-and-back to a muffler at the rear
  const hdr=addMesh(new THREE.CylinderGeometry(.04,.04,.62,8),chrome,new THREE.Vector3(.34,.62,.16),group);hdr.rotation.z=.7;
  const muff=addMesh(new THREE.CylinderGeometry(.06,.05,.62,10),chrome,new THREE.Vector3(-.4,.8,.18),group);muff.rotation.set(0,.12,Math.PI/2.1);
  // footpegs
  for(const z of [-.2,.2])addMesh(new THREE.BoxGeometry(.14,.04,.05),chrome,new THREE.Vector3(.02,.42,z),group);
  // rider: seated on the bike, feet on the pegs, hands on the bars, leaning forward
  addMesh(new THREE.BoxGeometry(.28,.2,.36),pants,new THREE.Vector3(-.18,1.0,0),group);
  const torso=addMesh(new THREE.CapsuleGeometry(.18,.4,6,12),body,new THREE.Vector3(.04,1.28,0),group);torso.rotation.z=-.6;
  for(const z of [-.18,.18]){const arm=addMesh(new THREE.CapsuleGeometry(.06,.42,4,8),body,new THREE.Vector3(.34,1.16,z),group);arm.rotation.z=-1.15;addMesh(new THREE.BoxGeometry(.1,.1,.1),glove,new THREE.Vector3(.58,1.08,z),group);}
  for(const z of [-.2,.2]){const thigh=addMesh(new THREE.CapsuleGeometry(.085,.3,4,8),pants,new THREE.Vector3(-.02,.86,z),group);thigh.rotation.z=1.0;addMesh(new THREE.BoxGeometry(.24,.14,.15),bootMat,new THREE.Vector3(.06,.5,z),group);}
  addMesh(new THREE.CylinderGeometry(.07,.07,.12,8),skin,new THREE.Vector3(.16,1.5,0),group);
  const helmet=addMesh(new THREE.SphereGeometry(.21,16,12),body,new THREE.Vector3(.22,1.62,0),group);helmet.scale.set(1.16,1,1.02);
  addMesh(new THREE.BoxGeometry(.42,.08,.4),accent,new THREE.Vector3(.22,1.67,0),group); // brand helmet stripe
  addMesh(new THREE.BoxGeometry(.12,.09,.36),material(0x26282b,.4,.3),new THREE.Vector3(.4,1.6,0),group);
  const skills={jump:randomSkill(),whoops:randomSkill(),sand:randomSkill(),rollers:randomSkill(),hill:randomSkill(),start:randomSkill(),aggression:randomSkill(),consistency:randomSkill()};
  return{group,name,brand,number,personality:PERSONALITIES[Math.floor(Math.random()*PERSONALITIES.length)],skills,progress:skills.start*.015,speed:.075+skills.start*.045,lane:(index-2)*.28,targetLane:(index-2)*.28,roostSide:index%2?1:-1,checked:new Set(),crash:0,air:0,finished:false,messages:[],bounce:Math.random()*6};
}

function nearestPathProgress(position){if(!raceCurve)return-1;let best=Infinity,bestT=-1;const samples=Math.max(80,path.length*5);for(let i=0;i<=samples;i++){const t=i/samples,d=raceCurve.getPointAt(t).distanceToSquared(position);if(d<best){best=d;bestT=t;}}return best<6?bestT:-1;}
function startRace(){if(racing)return;if(path.length<3)return showFeedback("The toy bikes need a smooth track first.");clearPreview();racing=true;finishOrder=[];ui.again.hidden=true;ui.race.disabled=true;ui.status.classList.add("racing");ui.wrap.classList.add("racing");ui.mode.textContent="The sandbox is alive";document.querySelectorAll(".tool").forEach(b=>b.disabled=true);ui.banner.textContent="Ready...";setTimeout(()=>{if(racing)ui.banner.textContent="Go!";},650);setTimeout(()=>ui.banner.textContent="",1350);riders.forEach(r=>disposeObject(r.group));riders=[...COLORS].sort(()=>Math.random()-.5).slice(0,5).map((def,i)=>createBike(def,i));raceCurve=new THREE.CatmullRomCurve3(path,false,"catmullrom",.35);showFeedback(`${riders[0].name} bike ${riders[0].personality} this race.`);}
function checkObstacles(rider){obstacles.forEach((obstacle,index)=>{if(rider.checked.has(index))return;const at=nearestPathProgress(obstacle.position);if(at<0||rider.progress<at)return;rider.checked.add(index);const type=obstacle.userData.type,key=JUMPS.has(type)?"jump":type,skill=rider.skills[key]??.5,difficulty=DIFFICULTY[type],confidence=skill*.7+rider.skills.consistency*.3;
    if(JUMPS.has(type)){if(confidence>difficulty){rider.air=.34+difficulty*.42;rider.speed=Math.min(.15,rider.speed+.008);rider.messages.push(`${rider.name} bike cleared the ${type}!`);}else if(rider.skills.aggression+Math.random()*.2>difficulty+.25){rider.crash=.5;rider.speed*=.62;rider.messages.push(`${rider.name} bike almost cleared the ${type}!`);}else{rider.speed*=.82;rider.messages.push(`${rider.name} bike rolled the ${type}.`);}}
    else if(confidence>difficulty){rider.speed=Math.min(.14,rider.speed+.004);rider.messages.push(`${rider.name} bike flew through the ${type}.`);}else{rider.speed*=.74;rider.messages.push(type==="sand"?`${rider.name} bike got stuck in the sand again.`:`${rider.name} bike bobbled through the ${type}.`);}rider.speed=Math.max(.045,rider.speed);});}
function addWear(point,heavy){if(wearGroup.children.length>460)disposeObject(wearGroup.children[0]);const r=(heavy?.16:.08)+Math.random()*(heavy?.14:.12);const mark=addMesh(new THREE.CircleGeometry(r,8),new THREE.MeshBasicMaterial({color:heavy?0x4a2a15:0x66391f,transparent:true,opacity:heavy?.2:.13,depthWrite:false}),new THREE.Vector3(point.x+(Math.random()-.5)*.45,.015,point.z+(Math.random()-.5)*.35),wearGroup);mark.rotation.x=-Math.PI/2;mark.scale.x=2;}
// Roost: light sand fanned out onto the ground beside the track, thrown by the
// rear wheel - reads against the dark dirt where the ridden-line marks can't.
function addRoost(point,tangent,normal,side){const base=point.clone().addScaledVector(tangent,-.45);const n=2+Math.floor(Math.random()*3);for(let i=0;i<n;i++){if(wearGroup.children.length>460)disposeObject(wearGroup.children[0]);const dist=1.0+Math.random()*1.7,s=.07+Math.random()*.13;const m=addMesh(new THREE.CircleGeometry(s,7),new THREE.MeshBasicMaterial({color:0xf4d99c,transparent:true,opacity:.13+Math.random()*.13,depthWrite:false}),new THREE.Vector3(base.x+normal.x*dist*side+(Math.random()-.5)*.6,.016,base.z+normal.z*dist*side+(Math.random()-.5)*.6),wearGroup);m.rotation.x=-Math.PI/2;m.scale.x=1.5;}}
function updateRace(dt,time){if(!racing)return;for(const rider of riders){if(rider.finished)continue;if(rider.crash>0){rider.crash-=dt;rider.group.rotation.z+=dt*8;continue;}const wasAir=rider.air>.002;rider.air=Math.max(0,rider.air-dt);rider.progress+=rider.speed*dt*(1+Math.sin(time*.004+rider.number)*.05*(1-rider.skills.consistency));rider.lane+=(rider.targetLane-rider.lane)*Math.min(1,dt*3);checkObstacles(rider);const t=Math.min(rider.progress,1),point=raceCurve.getPointAt(t),tangent=raceCurve.getTangentAt(t).normalize(),normal=new THREE.Vector3(-tangent.z,0,tangent.x),jump=rider.air>0?Math.sin(Math.min(1,rider.air/.6)*Math.PI)*1.65:0;rider.group.position.copy(point).addScaledVector(normal,rider.lane);rider.group.position.y=.16+jump+Math.sin(time*.01+rider.bounce)*.035;rider.group.rotation.y=-Math.atan2(tangent.z,tangent.x);rider.group.rotation.z=rider.air>0?-.18:0;const roostSide=Math.abs(rider.lane)>.12?Math.sign(rider.lane):rider.roostSide;if(wasAir&&rider.air<=.002){for(let k=0;k<3;k++)addWear(point,true);addRoost(point,tangent,normal,roostSide);}else if(rider.air<=0){if(Math.random()<.06)addWear(point);if(Math.random()<.4)addRoost(point,tangent,normal,roostSide);}if(rider.progress>=1){rider.finished=true;finishOrder.push(rider);if(finishOrder.length===riders.length)endRace();}}
  riders.forEach((r,i)=>{let n=0;riders.forEach((o,j)=>{if(i!==j&&Math.abs(r.progress-o.progress)<.025)n+=Math.sign(i-j)*.22;});r.targetLane=THREE.MathUtils.clamp((i-2)*.18+n,-.8,.8);});}
function endRace(){racing=false;ui.race.disabled=false;ui.status.classList.remove("racing");ui.wrap.classList.remove("racing");ui.mode.textContent="Everything is still again";document.querySelectorAll(".tool").forEach(b=>b.disabled=false);const winner=finishOrder[0],stories=riders.flatMap(r=>r.messages),story=stories.length?stories[Math.floor(Math.random()*stories.length)]:"That little moto felt fast!";showFeedback(`${winner.name} bike won the pretend moto. ${story}`);ui.again.hidden=false;}
function showFeedback(message){ui.feedbackText.textContent=message;ui.feedback.classList.remove("pop");requestAnimationFrame(()=>ui.feedback.classList.add("pop"));}

canvas.addEventListener("pointerdown",event=>{if(racing)return;pokeCamera();lastPointer={x:event.clientX,y:event.clientY};if(event.shiftKey||event.button===1||event.button===2){panning=true;canvas.setPointerCapture(event.pointerId);return;}const point=pointerToSand(event);if(!inside(point))return;canvas.setPointerCapture(event.pointerId);snapshot();clearPreview();if(SCULPT.has(activeTool)){sculpting=true;lastSculpt=point.clone();applySculpt(point.x,point.z,activeTool);return;}if(activeTool==="track"){path=[point];drawing=true;rebuildTrack();}else if(activeTool==="start"){if(startMarker)disposeObject(startMarker);startMarker=makeMarker("start",point);animatePlacement(startMarker,"start");}else if(activeTool==="finish"){if(finishMarker)disposeObject(finishMarker);finishMarker=makeMarker("finish",point);animatePlacement(finishMarker,"finish");}else if(activeTool==="dozer"){obstacles=obstacles.filter(o=>{if(o.position.distanceTo(point)<2){disposeObject(o);return false;}return true;});combRing(point);}else if(DIFFICULTY[activeTool]!==undefined){const obstacle=makeObstacle(activeTool,point);obstacles.push(obstacle);animatePlacement(obstacle,activeTool);combRing(point);}if(activeTool==="start"||activeTool==="finish")combRing(point);});
canvas.addEventListener("pointermove",event=>{pokeCamera();if(panning&&lastPointer){cameraTarget.x-=(event.clientX-lastPointer.x)*.025;cameraTarget.z-=(event.clientY-lastPointer.y)*.025;lastPointer={x:event.clientX,y:event.clientY};return;}if(racing)return;const point=pointerToSand(event);if(drawing){if(inside(point)&&(!path.length||path.at(-1).distanceTo(point)>.28)){const prev=path.at(-1);path.push(point);rebuildTrack();if(prev){const dx=point.x-prev.x,dz=point.z-prev.z,a=Math.atan2(-dz,dx),pl=Math.hypot(dx,dz)||1,px=-dz/pl,pz=dx/pl;for(const s of [-1,1]){const off=.95+Math.random()*.55;addComb(point.x+px*off*s,point.z+pz*off*s,a);}if(Math.random()<.4)addComb(point.x+px*(1.8+Math.random())*(Math.random()<.5?1:-1),point.z+pz*(1.8+Math.random()),a,true);}}return;}if(sculpting){if(inside(point)&&(!lastSculpt||lastSculpt.distanceToSquared(point)>.05)){applySculpt(point.x,point.z,activeTool);lastSculpt=point.clone();}return;}updatePlacementPreview(point);});
canvas.addEventListener("pointerup",event=>{drawing=false;panning=false;sculpting=false;lastSculpt=null;lastPointer=null;const point=pointerToSand(event);if(!racing)updatePlacementPreview(point);});canvas.addEventListener("pointercancel",()=>{drawing=false;panning=false;sculpting=false;lastSculpt=null;lastPointer=null;clearPreview();});canvas.addEventListener("pointerleave",()=>{if(!drawing&&!panning)clearPreview();});canvas.addEventListener("contextmenu",event=>event.preventDefault());canvas.addEventListener("wheel",event=>{event.preventDefault();pokeCamera();cameraDistance=THREE.MathUtils.clamp(cameraDistance+event.deltaY*.018,19,45);},{passive:false});
function resetSandbox(){if(racing)return;clearPreview();snapshot();clearBuildObjects();path=[];riders.forEach(r=>disposeObject(r.group));riders=[];while(wearGroup.children.length)disposeObject(wearGroup.children[0]);clearCombs();flattenHeights();ui.again.hidden=true;showFeedback("Fresh sand. What should we build this time?");}
function animate(time){const elapsed=Math.min((time-lastTime)/1000,.1);lastTime=time;if(terrainDirty){refreshTerrain();terrainDirty=false;}updateBuildAnimations(elapsed);updateRace(Math.min(elapsed,.035),time);updateCameraFrame(elapsed,time);renderer.render(scene,camera);requestAnimationFrame(animate);}

// Photo mode: frame the sandbox like a handmade memory and save a Polaroid PNG.
const PHOTO_SUBS=["one more race!","the sandbox came alive","best track ever","built it myself","just like when we were kids"];
let photoMode=false;
function setPhotoMode(on){photoMode=on;ui.shell.classList.toggle("photo",on);ui.photoBar.hidden=!on;ui.photoCaption.hidden=!on;ui.photoBtn.setAttribute("aria-pressed",on?"true":"false");if(on){ui.photoCaption.textContent=ui.label.textContent;cameraDistance=Math.min(cameraDistance,27);pokeCamera();}resize();}
function savePhoto(download=true){
  if(!canvas.width||!canvas.height)return""; // layout not ready
  renderer.render(scene,camera); // capture a fresh frame from the drawing buffer
  const W=1080,H=1320,pad=54,capH=214,pw=W-pad*2,ph=H-pad*2-capH,px=pad,py=pad;
  const pc=document.createElement("canvas");pc.width=W;pc.height=H;const g=pc.getContext("2d");
  g.fillStyle="#fbf3e2";g.fillRect(0,0,W,H);
  g.save();g.beginPath();g.rect(px,py,pw,ph);g.clip();
  const src=canvas,sAsp=src.width/src.height,dAsp=pw/ph;let sw,sh,sx,sy;
  if(sAsp>dAsp){sh=src.height;sw=sh*dAsp;sx=(src.width-sw)/2;sy=0;}else{sw=src.width;sh=sw/dAsp;sx=0;sy=(src.height-sh)/2;}
  g.drawImage(src,sx,sy,sw,sh,px,py,pw,ph);
  const warm=g.createLinearGradient(0,py,0,py+ph);warm.addColorStop(0,"rgba(255,206,120,.10)");warm.addColorStop(1,"rgba(255,150,60,.17)");g.fillStyle=warm;g.fillRect(px,py,pw,ph);
  const vig=g.createRadialGradient(W/2,py+ph*.5,ph*.32,W/2,py+ph*.5,ph*.78);vig.addColorStop(0,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(38,20,5,.24)");g.fillStyle=vig;g.fillRect(px,py,pw,ph);
  g.restore();
  g.strokeStyle="rgba(120,80,40,.22)";g.lineWidth=2;g.strokeRect(px+1,py+1,pw-2,ph-2);
  const label=(ui.label.textContent||"My Sandbox Track").trim();
  g.textAlign="center";g.fillStyle="#3a2a17";g.font="700 60px 'Segoe Print','Bradley Hand','Comic Sans MS',cursive";g.fillText(label,W/2,py+ph+94);
  g.fillStyle="#8a6a3f";g.font="600 32px 'Segoe Print','Comic Sans MS',cursive";g.fillText(PHOTO_SUBS[Math.floor(Math.random()*PHOTO_SUBS.length)],W/2,py+ph+150);
  const url=pc.toDataURL("image/png");
  if(download){const a=document.createElement("a");a.href=url;a.download=(label.replace(/[^a-z0-9]+/gi,"_").replace(/^_+|_+$/g,"")||"sandbox_moto")+".png";document.body.appendChild(a);a.click();a.remove();}
  return url;
}
ui.photoBtn.onclick=()=>setPhotoMode(!photoMode);ui.closePhoto.onclick=()=>setPhotoMode(false);ui.savePhoto.onclick=()=>savePhoto(true);
ui.race.onclick=startRace;ui.again.onclick=startRace;ui.reset.onclick=resetSandbox;window.addEventListener("resize",resize);window.addEventListener("keydown",event=>{if(event.code==="Space"){event.preventDefault();startRace();}if(event.key.toLowerCase()==="z"&&!racing)undo();if(event.key.toLowerCase()==="p"){event.preventDefault();setPhotoMode(!photoMode);}if(event.key==="Escape"&&photoMode)setPhotoMode(false);});
window.__sandboxMotoDebug={camera:()=>({position:camera.position.toArray(),target:[camView.tx,camView.tz],idleMs:performance.now()-cameraIdleSince}),photo:()=>({on:photoMode,url:savePhoto(false)}),terrain:()=>{let mx=-1e9,mn=1e9;for(let i=0;i<hpos.count;i++){const y=hpos.getY(i);if(y>mx)mx=y;if(y<mn)mn=y;}return{max:mx,min:mn,verts:hpos.count};},placementState:()=>({preview:previewObject&&{type:previewObject.userData.type,snapped:previewObject.userData.snapped,opacity:previewObject.children[0]?.material?.opacity},building:buildAnimations.length,start:startMarker&&{position:startMarker.position.toArray(),rotation:startMarker.rotation.y,snapped:startMarker.userData.snapped},finish:finishMarker&&{position:finishMarker.position.toArray(),rotation:finishMarker.rotation.y,snapped:finishMarker.userData.snapped},obstacles:obstacles.map(object=>({type:object.userData.type,position:object.position.toArray(),rotation:object.rotation.y,snapped:object.userData.snapped}))})};
createTools();applyCamera();resize();pokeCamera();requestAnimationFrame(animate);requestAnimationFrame(()=>ui.loading.classList.add("ready"));

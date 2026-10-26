import { VisionModels,maskToBytes } from './segmentation.js';
import { PoseController } from './pose.js';
import { PowerLevel } from './powerLevel.js';
import { AuraRenderer } from './aura.js';
import { Effects } from './particles.js';
import { AuraAudio } from './audio.js';
import { HUD } from './hud.js';

// Tunable experience settings: charge/decay, pose thresholds, mask quality, and visual effects.
const CONFIG={
 chargeRate:.12, decayRate:.25, thresholds:[.2,.5,.8], poseInterval:2,
 maxDpr:2, particleCap:600,
 camera:{width:1280,height:720,minBrightness:.6},
 mask:{oldWeight:.6,newWeight:.4,thresholdLow:.42,thresholdHigh:.58},
 pose:{visibility:.25,wristVisibility:.4,raisedShoulderOffset:.06,hipMargin:.04,armSpread:.16,elbowRatio:.82},
 filter:{minCutoff:1.2,beta:.04,derivativeCutoff:1},
 aura:{maxRadius:.06,flameSpeed:3.5},
 audio:{volume:.22},
 effects:{lightningInterval:50,emissionRate:145},
 keys:{space:' ',pose:'p',sound:'s',reset:'r',hud:'h',fullscreen:'f',debug:'d'}
};
const video=document.querySelector('#camera'),auraCanvas=document.querySelector('#aura'),overlay=document.querySelector('#overlay'),hud=new HUD(CONFIG.camera),audio=new AuraAudio(CONFIG.audio),power=new PowerLevel(CONFIG),pose=new PoseController(CONFIG.pose,CONFIG.filter);
let vision,renderer,effects,stream,mask=null,maskCanvas=document.createElement('canvas'),maskCtx=maskCanvas.getContext('2d'),lastVideoTime=-1,frame=0,lastTime=performance.now(),fps=0,fpsFrames=0,fpsStart=lastTime,space=false,debug=false,shakeUntil=0;
// Mirrored cover mapping: camera CSS mirrors video; shader mirrors mask x and applies object-fit:cover crop to align the silhouette.
function resize(){renderer?.resize();effects?.resize()}
window.addEventListener('resize',resize);
function levelUp(tier){effects?.burst();audio.hit(tier);shakeUntil=performance.now()+400;hud.level(tier)}
power.onLevelUp=levelUp;
function drawDebugPose(){if(!debug||!pose.landmarks)return;const c=overlay.getContext('2d'),scale=Math.min(devicePixelRatio||1,CONFIG.maxDpr),w=innerWidth,h=innerHeight;c.save();c.setTransform(scale,0,0,scale,0,0);c.strokeStyle='#8affc9';c.fillStyle='#d5ffe9';c.lineWidth=2;const links=[[11,13],[13,15],[12,14],[14,16],[11,12],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];for(const [a,b] of links){const p=pose.landmarks[a],q=pose.landmarks[b];c.beginPath();c.moveTo((1-p.x)*w,p.y*h);c.lineTo((1-q.x)*w,q.y*h);c.stroke()}for(const p of pose.landmarks){c.beginPath();c.arc((1-p.x)*w,p.y*h,3,0,7);c.fill()}c.restore()}
async function start(){const button=document.querySelector('#startButton');button.disabled=true;hud.error.textContent='';hud.status('Requesting camera…');try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:CONFIG.camera.width},height:{ideal:CONFIG.camera.height}},audio:false});video.srcObject=stream;await video.play();hud.status('Preparing WebGL aura…');renderer=new AuraRenderer(auraCanvas,{...CONFIG.aura,...CONFIG.mask,maxDpr:CONFIG.maxDpr});effects=new Effects(overlay,CONFIG.particleCap,{...CONFIG.effects,maxDpr:CONFIG.maxDpr});resize();hud.status('Loading MediaPipe models…');vision=new VisionModels();await vision.create(s=>hud.status(s));audio.start();hud.started();requestAnimationFrame(loop)}catch(err){console.error(err);const message=err?.name==='NotAllowedError'?'Camera permission was denied. Allow camera access, then retry.':err?.name==='NotFoundError'?'No camera was found. Connect a camera, then retry.':err?.message||'A camera or vision model could not start. Check your connection and retry.';hud.showError(message);button.disabled=false;vision?.close();vision=null;stream?.getTracks().forEach(t=>t.stop());stream=null}}
document.querySelector('#startButton').addEventListener('click',start);
function loop(now){if(!vision||video.readyState<2)return;const dt=Math.min(.05,Math.max(.001,(now-lastTime)/1000));lastTime=now;frame++;fpsFrames++;if(now-fpsStart>500){fps=fpsFrames*1000/(now-fpsStart);fpsFrames=0;fpsStart=now}if(video.currentTime!==lastVideoTime){lastVideoTime=video.currentTime;const stamp=now;const result=vision.segment(video,stamp);const converted=maskToBytes(result);if(converted)mask=converted;if(frame%CONFIG.poseInterval===0)pose.update(vision.detect(video,stamp),stamp)}const active=space||pose.active();const value=power.update(active,dt);audio.update(value);const tier=power.tier();renderer.clear();renderer.render(mask,video,value,now/1000,debug);effects.emit(mask,value,dt);effects.draw(dt,value,tier);if(tier>=2)audio.crackle();drawDebugPose();hud.update({fps,detected:space||pose.detected,power:value,tier,mode:pose.mode,debug});if(now<shakeUntil){const strength=(shakeUntil-now)/400*7;document.body.style.transform=`translate(${(Math.random()-.5)*strength}px,${(Math.random()-.5)*strength}px)`}else document.body.style.transform='';requestAnimationFrame(loop)}
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.code==='Space'){e.preventDefault();space=true}if(k===CONFIG.keys.pose){pose.toggle()}if(k===CONFIG.keys.sound){const muted=audio.toggle();hud.status(muted?'Sound muted':'Sound on')}if(k===CONFIG.keys.reset){power.value=0;power.lastTier=0;effects?.burst()}if(k===CONFIG.keys.hud)hud.toggle();if(k===CONFIG.keys.fullscreen){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()}if(k===CONFIG.keys.debug){debug=hud.toggleDebug()}});
window.addEventListener('keyup',e=>{if(e.code==='Space')space=false});window.addEventListener('blur',()=>space=false);
window.addEventListener('beforeunload',()=>{vision?.close();stream?.getTracks().forEach(t=>t.stop())});
export { CONFIG };

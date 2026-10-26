import { LandmarkSmoother } from './filters.js';

export class PoseController {
  constructor(config={},filterConfig={}) {
    this.config={visibility:.25,...config};
    this.smoother=new LandmarkSmoother(filterConfig);
    this.landmarks=null;
    this.handLandmarks=[];
    this.handDetected=false;
    this.pointing=false;
    this.detected=false;
    this.motion=0;
    this.lastHand=null;
    this.lastTime=0;
    this.pointingFrames=0;
  }

  update(result,time,gestureResult=null) {
    // Hand recognition is deliberately independent of body/arm tracking.
    this.handLandmarks=gestureResult?.landmarks||[];
    this.handDetected=this.handLandmarks.length>0;
    const classified=(gestureResult?.gestures||[]).some(categories=>categories?.some(category=>(category.categoryName||category.category_name)==='Pointing_Up'&&(category.score??1)>.4));
    const geometric=this.handLandmarks.some(points=>this.isPointing(points));
    this.pointing=this.handDetected&&(classified||geometric);
    this.pointingFrames=this.pointing?Math.min(3,this.pointingFrames+1):0;

    const wrist=this.handLandmarks[0]?.[0];
    if(wrist&&this.lastHand&&this.lastTime){const dt=Math.max(.03,(time-this.lastTime)/1000);const speed=Math.hypot(wrist.x-this.lastHand.x,wrist.y-this.lastHand.y)/dt;this.motion=this.motion*.55+Math.min(1,speed)*.45}
    if(wrist)this.lastHand={x:wrist.x,y:wrist.y};else this.lastHand=null;
    this.lastTime=time;

    const raw=result?.landmarks?.[0];
    if(!raw){this.detected=false;this.motion*=.92;return}
    this.landmarks=this.smoother.apply(raw,time);
    this.detected=this.landmarks.length>24&&Math.min(this.landmarks[11].visibility||0,this.landmarks[12].visibility||0)>this.config.visibility;
  }

  isPointing(p) {
    if(!p||p.length<21)return false;
    const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
    const indexExtended=d(p[8],p[0])>d(p[6],p[0])*1.12&&p[8].y<p[6].y-.025;
    const othersCurled=[[12,10],[16,14],[20,18]].filter(([tip,pip])=>d(p[tip],p[0])<d(p[pip],p[0])*1.35).length;
    return indexExtended&&othersCurled>=2;
  }

  // The one-finger hand pose is the only camera gesture needed to charge.
  active(){return this.pointingFrames>=2}
  center(){const p=this.landmarks;if(!p)return{x:.5,y:.5};return{x:(p[11].x+p[12].x+p[23].x+p[24].x)/4,y:(p[11].y+p[12].y+p[23].y+p[24].y)/4}}
  musicControls(){const hand=this.handLandmarks[0],p=this.landmarks;if(hand?.[0])return{spread:.5,height:Math.max(0,Math.min(1,1-hand[0].y)),motion:this.motion};if(!p)return{spread:.5,height:.5,motion:this.motion};return{spread:Math.min(1,Math.abs(p[15].x-p[16].x)*1.5),height:Math.max(0,Math.min(1,1-(p[15].y+p[16].y)/2)),motion:this.motion}}
  feet(){const p=this.landmarks;if(!p)return{x:.5,y:.87};return{x:1-(p[27].x+p[28].x)/2,y:(p[27].y+p[28].y)/2}}
  head(){const p=this.landmarks;if(!p)return{x:.5,y:.24};return{x:1-p[0].x,y:p[0].y-.025}}
  shoulders(){const p=this.landmarks;if(!p)return null;return{left:{x:1-p[11].x,y:p[11].y},right:{x:1-p[12].x,y:p[12].y}}}
}

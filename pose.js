import { LandmarkSmoother } from './filters.js';
export class PoseController{
 constructor(){this.smoother=new LandmarkSmoother();this.landmarks=null;this.detected=false;this.mode=0}
 toggle(){this.mode=1-this.mode;return this.mode}
 update(result,time){const raw=result?.landmarks?.[0];if(!raw){this.detected=false;return}this.landmarks=this.smoother.apply(raw,time);this.detected=this.landmarks.length>24&&Math.min(this.landmarks[11].visibility||0,this.landmarks[12].visibility||0)>.25}
 active(){if(!this.detected||!this.landmarks)return false;const p=this.landmarks;const wristVis=(p[15].visibility||0)+(p[16].visibility||0);if(wristVis<.4)return false;if(this.mode===1)return p[15].y<p[11].y-.06&&p[16].y<p[12].y-.06;const below=p[15].y>p[23].y-.04&&p[16].y>p[24].y-.04;const spread=Math.abs(p[15].x-p[16].x)>.16;const bent=(Math.hypot(p[13].x-p[15].x,p[13].y-p[15].y)<Math.hypot(p[11].x-p[15].x,p[11].y-p[15].y)*.82)&&(Math.hypot(p[14].x-p[16].x,p[14].y-p[16].y)<Math.hypot(p[12].x-p[16].x,p[12].y-p[16].y)*.82);return below&&spread&&bent}
 center(){const p=this.landmarks;if(!p)return{x:.5,y:.5};return{x:(p[11].x+p[12].x+p[23].x+p[24].x)/4,y:(p[11].y+p[12].y+p[23].y+p[24].y)/4}}
}

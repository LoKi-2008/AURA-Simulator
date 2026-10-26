// One Euro filter: adaptive low-pass smoothing that follows fast movement while damping jitter.
export class OneEuroFilter {
  constructor(minCutoff=1.2,beta=.04,dCutoff=1){this.minCutoff=minCutoff;this.beta=beta;this.dCutoff=dCutoff;this.x=null;this.dx=0;this.t=null}
  alpha(cutoff,dt){const tau=1/(2*Math.PI*cutoff);return 1/(1+tau/dt)}
  filter(value,time){if(this.t===null||this.x===null){this.x=value;this.t=time;return value}const dt=Math.max(1/120,(time-this.t)/1000);const derivative=(value-this.x)/dt;this.dx+=this.alpha(this.dCutoff,dt)*(derivative-this.dx);const a=this.alpha(this.minCutoff+this.beta*Math.abs(this.dx),dt);this.x+=a*(value-this.x);this.t=time;return this.x}
}
export class LandmarkSmoother{constructor(){this.filters=[]}apply(points,time){return points.map((p,i)=>{if(!this.filters[i])this.filters[i]=[new OneEuroFilter(),new OneEuroFilter(),new OneEuroFilter()];return{x:this.filters[i][0].filter(p.x,time),y:this.filters[i][1].filter(p.y,time),z:this.filters[i][2].filter(p.z||0,time),visibility:p.visibility}})}}

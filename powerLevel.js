export const THRESHOLDS=[0,.2,.5,.8];export const NAMES=['IDLE','AWAKENING','SUPER','SUPER 2','ULTRA'];
export class PowerLevel{
 constructor(){this.value=0;this.previous=0;this.lastTier=0;this.onLevelUp=()=>{}}
 update(active,dt){this.previous=this.value;this.value=Math.max(0,Math.min(1,this.value+(active?.12:-.25)*dt));const tier=this.tier();if(tier>this.lastTier){this.onLevelUp(tier);this.lastTier=tier}else if(tier<this.lastTier)this.lastTier=tier;return this.value}
 tier(){return this.value<.2?0:this.value<.5?1:this.value<.8?2:3}
 name(){return NAMES[this.tier()+1]}
}

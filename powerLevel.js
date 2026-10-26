export const NAMES=['IDLE','AWAKENING','SUPER','SUPER 2','ULTRA'];
export class PowerLevel{
 constructor(config={}){this.chargeRate=config.chargeRate??.12;this.decayRate=config.decayRate??.25;this.thresholds=config.thresholds??[.2,.5,.8];this.value=0;this.previous=0;this.lastTier=0;this.onLevelUp=()=>{}}
 update(active,dt){this.previous=this.value;this.value=Math.max(0,Math.min(1,this.value+(active?this.chargeRate:-this.decayRate)*dt));const tier=this.tier();if(tier>this.lastTier){this.onLevelUp(tier);this.lastTier=tier}else if(tier<this.lastTier)this.lastTier=tier;return this.value}
 tier(){return this.value<this.thresholds[0]?0:this.value<this.thresholds[1]?1:this.value<this.thresholds[2]?2:3}
 name(){return NAMES[this.tier()+1]}
}

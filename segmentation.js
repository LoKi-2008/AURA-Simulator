const VISION='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
export class VisionModels{
 constructor(){this.segmenter=null;this.pose=null;this.mp=null}
 async create(onStatus=()=>{}){onStatus('Loading MediaPipe vision runtime…');const mp=await import(VISION);this.mp=mp;const files=await mp.FilesetResolver.forVisionTasks(WASM);const common={runningMode:'VIDEO'};const segmentUrl='https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';const poseUrl='https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';
  onStatus('Loading person segmentation model…');this.segmenter=await this.withDelegate(d=>mp.ImageSegmenter.createFromOptions(files,{...common,baseOptions:{modelAssetPath:segmentUrl,delegate:d},outputConfidenceMasks:true,outputCategoryMask:false}),onStatus);
  onStatus('Loading pose model…');this.pose=await this.withDelegate(d=>mp.PoseLandmarker.createFromOptions(files,{...common,numPoses:1,baseOptions:{modelAssetPath:poseUrl,delegate:d}}),onStatus);return this}
 async withDelegate(factory,onStatus){try{return await factory('GPU')}catch(err){onStatus('GPU unavailable; retrying with CPU…');return factory('CPU')}}
 segment(video,time){let result=null;this.segmenter.segmentForVideo(video,time,r=>{result=r});return result}
 detect(video,time){let result=null;this.pose.detectForVideo(video,time,r=>{result=r});return result}
 close(){this.segmenter?.close();this.pose?.close()}
}
export function maskToBytes(result){const mask=result?.confidenceMasks?.[0];if(!mask)return null;const data=mask.getAsFloat32Array();const bytes=new Uint8Array(data.length);for(let i=0;i<data.length;i++)bytes[i]=Math.max(0,Math.min(255,Math.round(data[i]*255)));return{data:bytes,width:mask.width,height:mask.height}}

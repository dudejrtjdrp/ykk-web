import { canvasNodes } from '@/lib/mock-data';
import { WORLD, TILE_W, TILE_H } from '@/lib/canvas/constants';
let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
for(const n of canvasNodes){
  minX=Math.min(minX,n.x-n.w/2); maxX=Math.max(maxX,n.x+n.w/2);
  minY=Math.min(minY,n.y-n.h/2); maxY=Math.max(maxY,n.y+n.h/2);
}
const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
console.log('node count:', canvasNodes.length);
console.log('content X:', Math.round(minX),'..',Math.round(maxX),'span',Math.round(maxX-minX));
console.log('content Y:', Math.round(minY),'..',Math.round(maxY),'span',Math.round(maxY-minY));
console.log('content center:', Math.round(cx), Math.round(cy));
console.log('max|x|', Math.round(Math.max(Math.abs(minX),Math.abs(maxX))), 'max|y|', Math.round(Math.max(Math.abs(minY),Math.abs(maxY))));
console.log('WORLD X:', WORLD.minX,'..',WORLD.maxX,'  WORLD Y:', WORLD.minY,'..',WORLD.maxY);
console.log('TILE_W', TILE_W, 'TILE_H', TILE_H);
console.log('horizontal empty gap between tiles:', Math.round(TILE_W-(maxX-minX)));
console.log('vertical   empty gap between tiles:', Math.round(TILE_H-(maxY-minY)));

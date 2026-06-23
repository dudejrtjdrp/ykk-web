import { canvasNodes } from '@/lib/mock-data';
import { WORLD, TILE_W, TILE_H } from '@/lib/canvas/constants';
let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9, onEdge=0;
for(const n of canvasNodes){
  const l=n.x-n.w/2,r=n.x+n.w/2,t=n.y-n.h/2,b=n.y+n.h/2;
  minX=Math.min(minX,l); maxX=Math.max(maxX,r); minY=Math.min(minY,t); maxY=Math.max(maxY,b);
  if(l<=WORLD.minX+12||r>=WORLD.maxX-12||t<=WORLD.minY+12||b>=WORLD.maxY-12) onEdge++;
}
console.log('content X', Math.round(minX),'..',Math.round(maxX),'span',Math.round(maxX-minX));
console.log('content Y', Math.round(minY),'..',Math.round(maxY),'span',Math.round(maxY-minY));
console.log('TILE', TILE_W,'x',TILE_H);
console.log('NEW horizontal gap', Math.round(TILE_W-(maxX-minX)), '(was 3522)');
console.log('NEW vertical   gap', Math.round(TILE_H-(maxY-minY)), '(was 2699)');
console.log('nodes clamped onto WORLD edge:', onEdge, '(0 = layout unchanged, no pile-up)');

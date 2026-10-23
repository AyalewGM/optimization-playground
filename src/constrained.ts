export type V={x:number;y:number};
export type Region='box'|'disk'|'halfplane';
export type Objective='distance'|'tilted';
export const objectives={distance:{name:'Distance to target',target:{x:2.2,y:1.6}},tilted:{name:'Tilted quadratic',target:{x:-1.8,y:2.1}}};
export function objective(p:V,kind:Objective){const t=objectives[kind].target;return (p.x-t.x)**2+2*(p.y-t.y)**2}
export function gradient(p:V,kind:Objective):V{const t=objectives[kind].target;return{x:2*(p.x-t.x),y:4*(p.y-t.y)}}
export function project(p:V,region:Region):V{
 if(region==='box')return{x:Math.max(-1,Math.min(1,p.x)),y:Math.max(-1,Math.min(1,p.y))};
 if(region==='halfplane'){const exceed=Math.max(0,p.x+p.y-1);return{x:p.x-exceed/2,y:p.y-exceed/2}};
 const norm=Math.hypot(p.x,p.y);return norm<=1?p:{x:p.x/norm,y:p.y/norm}
}
export function feasible(p:V,region:Region,tolerance=1e-9){if(region==='box')return Math.abs(p.x)<=1+tolerance&&Math.abs(p.y)<=1+tolerance;if(region==='disk')return Math.hypot(p.x,p.y)<=1+tolerance;return p.x+p.y<=1+tolerance}
export function constraint(p:V,region:Region){if(region==='box')return Math.max(p.x-1,-p.x-1,p.y-1,-p.y-1);if(region==='disk')return p.x*p.x+p.y*p.y-1;return p.x+p.y-1}
export type State={point:V;history:V[];iteration:number};
export function initialize(start:V,region:Region):State{const point=project(start,region);return{point,history:[point],iteration:0}}
export function advance(state:State,region:Region,kind:Objective,rate:number):State{const g=gradient(state.point,kind),point=project({x:state.point.x-rate*g.x,y:state.point.y-rate*g.y},region);return{point,history:[...state.history,point],iteration:state.iteration+1}}
export function projectedResidual(p:V,region:Region,kind:Objective){const g=gradient(p,kind),q=project({x:p.x-g.x,y:p.y-g.y},region);return Math.hypot(q.x-p.x,q.y-p.y)}
export function kktDisk(p:V,kind:Objective){const g=gradient(p,kind),norm2=p.x*p.x+p.y*p.y;const active=Math.abs(norm2-1)<1e-3;const lambda=active?Math.max(0,-(g.x*p.x+g.y*p.y)/(2*Math.max(norm2,1e-9))):0;return{lambda,stationarity:Math.hypot(g.x+2*lambda*p.x,g.y+2*lambda*p.y),complementarity:Math.abs(lambda*(norm2-1)),active}}

import {type V,type Objective,objective,gradient,project,initialize,advance,type State} from './constrained';
export type CompactRegion='disk'|'box';
export function linearOracle(g:V,region:CompactRegion):V {
 if(region==='box')return{x:g.x>0?-1:1,y:g.y>0?-1:1};
 const n=Math.hypot(g.x,g.y);
 return n<1e-14?{x:0,y:0}:{x:-g.x/n,y:-g.y/n};
}
export function frankWolfeGap(p:V,region:CompactRegion,kind:Objective):number{
 const g=gradient(p,kind),v=linearOracle(g,region);
 return Math.max(0,g.x*(p.x-v.x)+g.y*(p.y-v.y));
}
export function frankWolfeStep(state:State,region:CompactRegion,kind:Objective):State {
 const g=gradient(state.point,kind),v=linearOracle(g,region);
 const dx=v.x-state.point.x,dy=v.y-state.point.y;
 // Exact segment minimizer for quadratic f(x,y)=(x-tx)^2+2(y-ty)^2.
 const denom=2*(dx*dx+2*dy*dy);
 const gamma=denom<1e-14?0:Math.max(0,Math.min(1,-(g.x*dx+g.y*dy)/denom));
 const point={x:state.point.x+gamma*dx,y:state.point.y+gamma*dy};
 return{point,iteration:state.iteration+1,history:[...state.history,point]};
}
export type Comparison={projected:State;frankWolfe:State};
export function beginComparison(start:V,region:CompactRegion):Comparison{
 return{projected:initialize(start,region),frankWolfe:initialize(start,region)};
}
export function comparisonStep(s:Comparison,region:CompactRegion,kind:Objective,rate:number):Comparison{
 return{projected:advance(s.projected,region,kind,rate),frankWolfe:frankWolfeStep(s.frankWolfe,region,kind)};
}
export function comparisonDiagnostics(s:Comparison,region:CompactRegion,kind:Objective){
 return {projectedValue:objective(s.projected.point,kind),frankWolfeValue:objective(s.frankWolfe.point,kind),gap:frankWolfeGap(s.frankWolfe.point,region,kind),projectedResidual:Math.hypot(...Object.values((()=>{const p=s.projected.point,g=gradient(p,kind),q=project({x:p.x-g.x,y:p.y-g.y},region);return{x:p.x-q.x,y:p.y-q.y}})()))};
}

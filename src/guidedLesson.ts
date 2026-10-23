import {initialize,advance,objective,projectedResidual,type State} from './constrained';
export type Prediction='inside'|'boundary'|'outside';
export type Stage='predict'|'observe'|'explain'|'complete';
export const initialPoint={x:-.8,y:-.7};
export function runLesson(steps=45):State{let s=initialize(initialPoint,'disk');for(let i=0;i<steps;i++)s=advance(s,'disk','distance',.15);return s}
export function lessonEvidence(steps=45){const first=initialize(initialPoint,'disk'),last=runLesson(steps),distance=Math.hypot(last.point.x,last.point.y);return{firstValue:objective(first.point,'distance'),lastValue:objective(last.point,'distance'),distance,residual:projectedResidual(last.point,'disk','distance'),last,optimalBoundary:Math.abs(distance-1)<.02}}
export function assessExplanation(answer:string){const s=answer.toLowerCase();const feasibility=/feasib|constraint|disk|radius|unit circle|boundary|project/.test(s);const gradient=/gradient|derivative|descent|step|direction/.test(s);return{feasibility,gradient,complete:feasibility&&gradient}}

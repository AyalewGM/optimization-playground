import {type Point,type Surface,landscapes} from './math';
export type Method='gradient'|'momentum'|'nesterov'|'rmsprop'|'adam'|'newton'|'bfgs';
export const methods:Method[]=['gradient','momentum','nesterov','rmsprop','adam','newton','bfgs'];
export const names:Record<Method,string>={gradient:'Gradient descent',momentum:'Momentum',nesterov:'Nesterov',rmsprop:'RMSProp',adam:'Adam',newton:'Newton',bfgs:'BFGS'};
export const colors:Record<Method,string>={gradient:'#9ef4ce',momentum:'#f8c56f',nesterov:'#b8a3ff',rmsprop:'#57c8f2',adam:'#ff91ab',newton:'#f2f19a',bfgs:'#e995ff'};
type Matrix=[number,number,number,number];
export type Runner={method:Method;point:Point;velocity:Point;second:Point;time:number;inverse:Matrix;history:Point[];values:number[];evaluations:number;status:'running'|'converged'|'diverged'|'limit'};
const cap=(v:Point,max=1.25)=>{const norm=Math.hypot(v.x,v.y);return norm>max?{x:v.x*max/norm,y:v.y*max/norm}:v};
const dot=(a:Point,b:Point)=>a.x*b.x+a.y*b.y;
const mul=(a:Matrix,v:Point):Point=>({x:a[0]*v.x+a[1]*v.y,y:a[2]*v.x+a[3]*v.y});
export function createRunner(method:Method,start:Point,surface:Surface):Runner{return{method,point:{...start},velocity:{x:0,y:0},second:{x:0,y:0},time:0,inverse:[1,0,0,1],history:[{...start}],values:[landscapes[surface].f(start)],evaluations:1,status:'running'}}
export function advanceRunner(r:Runner,surface:Surface,rate:number,limit=250):Runner{
 if(r.status!=='running')return r;
 const objective=landscapes[surface],g=objective.grad(r.point);let step:Point={x:0,y:0},velocity=r.velocity,second=r.second,inverse=r.inverse,evaluations=r.evaluations;
 const t=r.time+1;
 if(Math.hypot(g.x,g.y)<1e-4)return{...r,status:'converged'};
 switch(r.method){
 case 'gradient':step={x:-rate*g.x,y:-rate*g.y};break;
 case 'momentum':velocity={x:.85*velocity.x-rate*g.x,y:.85*velocity.y-rate*g.y};step=velocity;break;
 case 'nesterov':{const look={x:r.point.x+.85*velocity.x,y:r.point.y+.85*velocity.y};const ahead=objective.grad(look);velocity={x:.85*velocity.x-rate*ahead.x,y:.85*velocity.y-rate*ahead.y};step=velocity;break}
 case 'rmsprop':second={x:.9*second.x+.1*g.x*g.x,y:.9*second.y+.1*g.y*g.y};step={x:-rate*g.x/(Math.sqrt(second.x)+1e-8),y:-rate*g.y/(Math.sqrt(second.y)+1e-8)};break;
 case 'adam':{velocity={x:.9*velocity.x+.1*g.x,y:.9*velocity.y+.1*g.y};second={x:.999*second.x+.001*g.x*g.x,y:.999*second.y+.001*g.y*g.y};const bx=velocity.x/(1-.9**t),by=velocity.y/(1-.9**t),sx=second.x/(1-.999**t),sy=second.y/(1-.999**t);step={x:-rate*bx/(Math.sqrt(sx)+1e-8),y:-rate*by/(Math.sqrt(sy)+1e-8)};break}
 case 'newton':{const[a,b,c]=objective.hessian(r.point),det=a*c-b*b;step=det>1e-9&&a>0&&c>0?{x:-rate*(c*g.x-b*g.y)/det,y:-rate*(-b*g.x+a*g.y)/det}:{x:-rate*g.x,y:-rate*g.y};break}
 case 'bfgs':{const d=mul(inverse,g);step={x:-rate*d.x,y:-rate*d.y};break}
 }
 // Shared educational safeguard: bound the displacement, not the gradient.
 step=cap(step);
 const point={x:r.point.x+step.x,y:r.point.y+step.y};const value=objective.f(point);evaluations++;
 if(r.method==='bfgs'){const nextGrad=objective.grad(point),y={x:nextGrad.x-g.x,y:nextGrad.y-g.y},ys=dot(y,step);if(ys>1e-10){const rho=1/ys,H=inverse,Hy=mul(H,y),yHy=dot(y,Hy);
 inverse=[H[0]+((ys+yHy)/(ys*ys))*step.x*step.x-(Hy.x*step.x+step.x*Hy.x)/ys,H[1]+((ys+yHy)/(ys*ys))*step.x*step.y-(Hy.x*step.y+step.x*Hy.y)/ys,H[2]+((ys+yHy)/(ys*ys))*step.y*step.x-(Hy.y*step.x+step.y*Hy.x)/ys,H[3]+((ys+yHy)/(ys*ys))*step.y*step.y-(Hy.y*step.y+step.y*Hy.y)/ys]}}
 const status:Runner['status']=!Number.isFinite(value)||Math.abs(point.x)>1e5||Math.abs(point.y)>1e5?'diverged':t>=limit?'limit':Math.hypot(...Object.values(objective.grad(point)))<1e-4?'converged':'running';
 return{...r,point,velocity,second,inverse,time:t,history:[...r.history,point],values:[...r.values,value],evaluations,status};
}
export function raceStep(runners:Runner[],surface:Surface,rate:number,limit=250){return runners.map(r=>advanceRunner(r,surface,rate,limit))}

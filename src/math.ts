export type Point={x:number;y:number};
export type Algorithm='gradient'|'momentum'|'newton';
export type Surface='quadratic'|'rosenbrock'|'himmelblau';
export type Landscape={id:Surface;name:string;formula:string;range:number;f:(p:Point)=>number;grad:(p:Point)=>Point;hessian:(p:Point)=>[number,number,number]};
export const landscapes:Record<Surface,Landscape>={
 quadratic:{id:'quadratic',name:'Elliptic bowl',formula:'f(x,y)=x²+4y²',range:3.5,f:p=>p.x*p.x+4*p.y*p.y,grad:p=>({x:2*p.x,y:8*p.y}),hessian:()=>[2,0,8]},
 rosenbrock:{id:'rosenbrock',name:'Rosenbrock valley',formula:'f(x,y)=(1−x)²+10(y−x²)²',range:2.5,f:p=>(1-p.x)**2+10*(p.y-p.x*p.x)**2,grad:p=>({x:2*(p.x-1)-40*p.x*(p.y-p.x*p.x),y:20*(p.y-p.x*p.x)}),hessian:p=>[2-40*p.y+120*p.x*p.x,-40*p.x,20]},
 himmelblau:{id:'himmelblau',name:'Himmelblau landscape',formula:'f(x,y)=(x²+y−11)²+(x+y²−7)²',range:5.5,f:p=>(p.x*p.x+p.y-11)**2+(p.x+p.y*p.y-7)**2,grad:p=>({x:4*p.x*(p.x*p.x+p.y-11)+2*(p.x+p.y*p.y-7),y:2*(p.x*p.x+p.y-11)+4*p.y*(p.x+p.y*p.y-7)}),hessian:p=>[12*p.x*p.x+4*p.y-42,4*(p.x+p.y),12*p.y*p.y+4*p.x-26]}
};
export const defaults:Record<Surface,Point>={quadratic:{x:2.6,y:2.2},rosenbrock:{x:-1.5,y:1.8},himmelblau:{x:-3.6,y:0.2}};
export type OptimizerState={point:Point;velocity:Point;iteration:number;history:Point[]};
export function initialize(point:Point):OptimizerState{return{point:{...point},velocity:{x:0,y:0},iteration:0,history:[{...point}]}}
export function advance(state:OptimizerState,surface:Surface,algorithm:Algorithm,rate:number,momentum=.85):OptimizerState{
 const{grad,hessian}=landscapes[surface];const g=grad(state.point);let velocity:Point;
 if(algorithm==='newton'){const[a,b,c]=hessian(state.point),det=a*c-b*b;if(det<=1e-9||a<=0||c<=0)velocity={x:-rate*g.x,y:-rate*g.y};else velocity={x:-rate*(c*g.x-b*g.y)/det,y:-rate*(-b*g.x+a*g.y)/det}}
 else if(algorithm==='momentum')velocity={x:momentum*state.velocity.x-rate*g.x,y:momentum*state.velocity.y-rate*g.y};
 else velocity={x:-rate*g.x,y:-rate*g.y};
 const norm=Math.hypot(velocity.x,velocity.y);if(norm>1.25)velocity={x:velocity.x*1.25/norm,y:velocity.y*1.25/norm};
 const point={x:state.point.x+velocity.x,y:state.point.y+velocity.y};return{point,velocity,iteration:state.iteration+1,history:[...state.history.slice(-299),point]};
}
export function run(start:Point,surface:Surface,algorithm:Algorithm,rate:number,steps:number):OptimizerState{let state=initialize(start);for(let i=0;i<steps;i++)state=advance(state,surface,algorithm,rate);return state;}

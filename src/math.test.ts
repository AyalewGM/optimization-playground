import{describe,it,expect}from'vitest';import{advance,initialize,landscapes,run}from'./math';
describe('optimization mathematics',()=>{
it('quadratic gradient and Hessian',()=>{expect(landscapes.quadratic.grad({x:2,y:-3})).toEqual({x:4,y:-24});expect(landscapes.quadratic.hessian({x:0,y:0})).toEqual([2,0,8])});
it('gradient descent converges on the convex quadratic',()=>{const end=run({x:2,y:2},'quadratic','gradient',.1,30);expect(Math.hypot(end.point.x,end.point.y)).toBeLessThan(.02)});
it('one full Newton step solves the quadratic',()=>{const p=advance(initialize({x:1,y:1}),'quadratic','newton',1).point;expect(p.x).toBeCloseTo(0,10);expect(p.y).toBeCloseTo(0,10)});
it('Rosenbrock gradient matches finite differences',()=>{const p={x:-.7,y:.4},h=1e-6,f=landscapes.rosenbrock.f,g=landscapes.rosenbrock.grad(p);expect(g.x).toBeCloseTo((f({x:p.x+h,y:p.y})-f({x:p.x-h,y:p.y}))/(2*h),4);expect(g.y).toBeCloseTo((f({x:p.x,y:p.y+h})-f({x:p.x,y:p.y-h}))/(2*h),4)});
it('known Himmelblau minima',()=>{expect(landscapes.himmelblau.f({x:3,y:2})).toBeCloseTo(0,8);expect(landscapes.himmelblau.f({x:-2.805118,y:3.131312})).toBeLessThan(1e-8)});
it('momentum is deterministic',()=>{expect(run({x:1,y:1},'quadratic','momentum',.02,10)).toEqual(run({x:1,y:1},'quadratic','momentum',.02,10))});
});

import {describe,it,expect} from 'vitest';
import {methods,createRunner,advanceRunner,raceStep} from './race';
import {landscapes} from './math';
describe('synchronized optimizer arena',()=>{
 it('starts every method at same initial point',()=>{const start={x:.5,y:-.6};for(const method of methods)expect(createRunner(method,start,'quadratic').point).toEqual(start)});
 it('runs every method with finite objective values',()=>{for(const method of methods){let r=createRunner(method,{x:.5,y:.5},'quadratic');for(let i=0;i<20;i++)r=advanceRunner(r,'quadratic',.06);expect(r.values.every(Number.isFinite)).toBe(true);expect(r.history.length).toBe(r.values.length);expect(r.time).toBeLessThanOrEqual(20)}});
 it('preserves previous state without mutation',()=>{const r=createRunner('adam',{x:1,y:1},'quadratic'),snapshot=JSON.stringify(r);advanceRunner(r,'quadratic',.1);expect(JSON.stringify(r)).toBe(snapshot)});
 it('gradient descent decreases a convex objective from moderate initial state',()=>{let r=createRunner('gradient',{x:1,y:1},'quadratic');const before=landscapes.quadratic.f(r.point);for(let i=0;i<20;i++)r=advanceRunner(r,'quadratic',.1);expect(landscapes.quadratic.f(r.point)).toBeLessThan(before)});
 it('race step advances all active methods synchronously',()=>{const a=methods.slice(0,4).map(m=>createRunner(m,{x:.8,y:.4},'quadratic'));const b=raceStep(a,'quadratic',.05);expect(b).toHaveLength(4);expect(b.every(r=>r.time===1)).toBe(true);expect(a.every(r=>r.time===0)).toBe(true)});
 it('limits the maximum number of steps',()=>{let r=createRunner('gradient',{x:3,y:3},'rosenbrock');for(let i=0;i<20;i++)r=advanceRunner(r,'rosenbrock',.03,5);expect(r.time).toBe(5);expect(r.status).toBe('limit')});
});

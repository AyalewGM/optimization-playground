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

describe('numerical diagnostics',()=>{
 it('accounts for objective and gradient evaluations independently',()=>{
  const start=createRunner('gradient',{x:.7,y:.3},'quadratic');
  expect(start.evaluations).toBe(1);
  expect(start.gradientEvaluations).toBe(1);
  const next=advanceRunner(start,'quadratic',.1);
  expect(next.evaluations).toBe(2);
  expect(next.gradientEvaluations).toBe(3);
  expect(next.stepNorms).toHaveLength(2);
  expect(next.gradientNorms).toHaveLength(2);
 });
 it('counts extra gradients for Nesterov and BFGS',()=>{
  const start={x:1,y:.8};
  expect(advanceRunner(createRunner('nesterov',start,'quadratic'),'quadratic',.1).gradientEvaluations).toBe(4);
  expect(advanceRunner(createRunner('bfgs',start,'quadratic'),'quadratic',.1).gradientEvaluations).toBe(4);
 });
 it('reports clipped step displacements',()=>{
  const start=createRunner('gradient',{x:3,y:3},'quadratic');
  const next=advanceRunner(start,'quadratic',1);
  expect(next.clippedSteps).toBe(1);
  expect(next.stepNorms[1]).toBeCloseTo(1.25,10);
 });
 it('preserves all diagnostics for stopped runners',()=>{
  let r=createRunner('gradient',{x:1,y:1},'quadratic');
  r=advanceRunner(r,'quadratic',.01,1);
  expect(r.status).toBe('limit');
  expect(advanceRunner(r,'quadratic',.01,1)).toEqual(r);
 });
});

import {describe,it,expect} from 'vitest';
import {project,feasible,gradient,objective,initialize,advance,projectedResidual,kktDisk} from './constrained';
describe('constrained optimization',()=>{
 it('projects points onto the closed box',()=>expect(project({x:3,y:-2},'box')).toEqual({x:1,y:-1}));
 it('projects radially onto the unit disk',()=>{const p=project({x:3,y:4},'disk');expect(p.x).toBeCloseTo(.6);expect(p.y).toBeCloseTo(.8)});
 it('orthogonally projects onto the halfplane',()=>expect(project({x:2,y:2},'halfplane')).toEqual({x:.5,y:.5}));
 it('leaves feasible points unchanged',()=>{for(const region of ['disk','box','halfplane'] as const){const p={x:.1,y:.2};expect(project(p,region)).toEqual(p)}});
 it('every update stays feasible for all supported sets',()=>{for(const region of ['disk','box','halfplane'] as const){let s=initialize({x:-2,y:-2},region);for(let i=0;i<100;i++){s=advance(s,region,'distance',.15);expect(feasible(s.point,region)).toBe(true)}}});
 it('analytic gradient agrees with centered finite differences',()=>{const p={x:.2,y:-.3},h=1e-6,g=gradient(p,'tilted');expect(g.x).toBeCloseTo((objective({x:p.x+h,y:p.y},'tilted')-objective({x:p.x-h,y:p.y},'tilted'))/(2*h),5);expect(g.y).toBeCloseTo((objective({x:p.x,y:p.y+h},'tilted')-objective({x:p.x,y:p.y-h},'tilted'))/(2*h),5)});
 it('projected residual decreases on a convex example',()=>{let s=initialize({x:-.8,y:-.8},'disk'),before=projectedResidual(s.point,'disk','distance');for(let i=0;i<80;i++)s=advance(s,'disk','distance',.15);expect(projectedResidual(s.point,'disk','distance')).toBeLessThan(before)});
 it('disk KKT stationarity and complementarity hold near converged point',()=>{let s=initialize({x:-.8,y:-.8},'disk');for(let i=0;i<200;i++)s=advance(s,'disk','distance',.1);const k=kktDisk(s.point,'distance');expect(k.stationarity).toBeLessThan(.01);expect(k.complementarity).toBeLessThan(.01)});
 it('does not mutate previous optimization states',()=>{const before=initialize({x:2,y:2},'disk'),snapshot=JSON.stringify(before);advance(before,'disk','distance',.2);expect(JSON.stringify(before)).toBe(snapshot)});
});

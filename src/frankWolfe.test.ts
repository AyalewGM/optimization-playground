import {describe,it,expect} from 'vitest';
import {linearOracle,beginComparison,comparisonStep,frankWolfeGap} from './frankWolfe';
import {feasible} from './constrained';
describe('Frank-Wolfe',()=>{
 it('selects box vertex',()=>expect(linearOracle({x:3,y:-2},'box')).toEqual({x:-1,y:1}));
 it('selects disk oracle',()=>{const p=linearOracle({x:3,y:4},'disk');expect(p.x).toBeCloseTo(-.6);expect(p.y).toBeCloseTo(-.8)});
 it('remains feasible under both methods',()=>{for(const region of ['box','disk'] as const){let s=beginComparison({x:2,y:2},region);for(let i=0;i<50;i++){s=comparisonStep(s,region,'distance',.1);expect(feasible(s.projected.point,region)).toBe(true);expect(feasible(s.frankWolfe.point,region)).toBe(true)}}});
 it('has nonnegative gap',()=>expect(frankWolfeGap({x:0,y:0},'disk','distance')).toBeGreaterThanOrEqual(0));
});

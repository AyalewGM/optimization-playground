import {useMemo} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls,Grid,Line,Html} from '@react-three/drei';
import * as THREE from 'three';
import {landscapes,type Point,type Surface} from './math';
import {colors,type Runner} from './race';
export function heightOf(surface:Surface,p:Point){return Math.min(7,Math.log1p(Math.max(0,landscapes[surface].f(p)))*1.35)}
export function SurfaceScene({surface,runners}:{surface:Surface;runners:Runner[]}){
 const range=landscapes[surface].range;
 const geometry=useMemo(()=>{const g=new THREE.PlaneGeometry(range*2,range*2,90,90);const positions=g.getAttribute('position');for(let i=0;i<positions.count;i++){const x=positions.getX(i),y=positions.getY(i);positions.setZ(i,heightOf(surface,{x,y}))}positions.needsUpdate=true;g.computeVertexNormals();return g},[surface,range]);
 const paths=useMemo(()=>runners.map(r=>({method:r.method,points:r.history.map(p=>new THREE.Vector3(p.x,heightOf(surface,p)+.08,-p.y))})),[runners,surface]);
 return <div className="webgl-surface" role="group" aria-label="Rotatable 3D optimization landscape with optimizer paths">
 <Canvas camera={{position:[range*1.5,range*1.65,range*1.9],fov:45}} gl={{antialias:true}} dpr={[1,1.7]}>
 <color attach="background" args={['#0d1829']}/>
 <ambientLight intensity={.85}/><directionalLight position={[5,12,7]} intensity={1.8}/>
 <mesh rotation={[-Math.PI/2,0,0]} geometry={geometry}><meshStandardMaterial color="#397b8e" side={THREE.DoubleSide} metalness={.14} roughness={.63} wireframe={false}/></mesh>
 <mesh rotation={[-Math.PI/2,0,0]} geometry={geometry}><meshBasicMaterial color="#90e7d0" wireframe transparent opacity={.20} side={THREE.DoubleSide}/></mesh>
 <Grid position={[0,-.1,0]} infiniteGrid sectionColor="#375b68" cellColor="#253a50" fadeDistance={range*5}/>
 {paths.map(path=><group key={path.method}>{path.points.length>1&&<Line points={path.points} color={colors[path.method]} lineWidth={2.8}/>}<mesh position={path.points[path.points.length-1]}><sphereGeometry args={[range*.024,12,12]}/><meshBasicMaterial color={colors[path.method]}/></mesh></group>)}
 <OrbitControls makeDefault enableDamping dampingFactor={.1} minDistance={range*.8} maxDistance={range*7} target={[0,2,0]}/>
 </Canvas><div className="webgl-hint">Drag to rotate · Scroll to zoom · Right-drag to pan</div>
 </div>;
}


import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Explosion } from '../types';
import { Color, Vector3 } from 'three';

interface ExplosionManagerProps {
  explosions: Explosion[];
}

const ExplosionManager: React.FC<ExplosionManagerProps> = ({ explosions }) => {
  return (
    <>
      {explosions.map((exp) => (
        <group key={exp.id} position={exp.position}>
          {exp.particles.map((p, i) => (
            <Particle 
              key={i} 
              velocity={p.velocity} 
              life={exp.life} 
              baseColor={exp.color} 
              isMega={exp.isMega} 
            />
          ))}
          <pointLight 
            color={exp.color} 
            intensity={exp.life * (exp.isMega ? 150 : 40)} 
            distance={exp.isMega ? 50 : 15} 
          />
        </group>
      ))}
    </>
  );
};

const Particle: React.FC<{ velocity: Vector3, life: number, baseColor: string, isMega?: boolean }> = ({ velocity, life, baseColor, isMega }) => {
  const ref = useRef<any>(null);
  
  const speedMult = useMemo(() => (isMega ? 5.0 : 3.0) + Math.random() * 5.0, [isMega]);
  const rotAxis = useMemo(() => new Vector3(Math.random(), Math.random(), Math.random()).normalize(), []);
  const rotSpeed = useMemo(() => 5 + Math.random() * 10, []);
  
  const colorObj = useMemo(() => new Color(), []);
  const enemyColor = useMemo(() => new Color(baseColor), [baseColor]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // 위치 이동
    ref.current.position.x += velocity.x * delta * speedMult;
    ref.current.position.y += velocity.y * delta * speedMult;
    ref.current.position.z += velocity.z * delta * speedMult;
    
    // 크기 조절
    const baseScale = isMega ? (0.3 + Math.random() * 0.7) : (0.15 + Math.random() * 0.25);
    ref.current.scale.setScalar(life * baseScale);
    
    // 색상 페이드
    if (life > 0.9) {
      colorObj.set('#ffffff');
    } else {
      colorObj.copy(enemyColor).multiplyScalar(life);
    }
    
    ref.current.material.color.copy(colorObj);
    ref.current.material.emissive.copy(colorObj);
    ref.current.material.emissiveIntensity = life * 15;
    
    ref.current.rotateOnAxis(rotAxis, delta * rotSpeed);
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial 
        transparent 
        opacity={Math.min(1, life * 2)} 
      />
    </mesh>
  );
};

export default ExplosionManager;


import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Explosion } from '../types';
import { Color } from 'three';

interface ExplosionManagerProps {
  explosions: Explosion[];
}

const ExplosionManager: React.FC<ExplosionManagerProps> = ({ explosions }) => {
  return (
    <>
      {explosions.map((exp) => (
        <group key={exp.id} position={exp.position}>
          {exp.particles.map((p, i) => (
            <Particle key={i} velocity={p.velocity} life={exp.life} index={i} />
          ))}
          {/* 중앙 섬광 효과 */}
          <mesh scale={exp.life * 3}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={exp.life * 0.8} />
          </mesh>
          <pointLight color="#ffaa00" intensity={exp.life * 10} distance={10} />
        </group>
      ))}
    </>
  );
};

const Particle: React.FC<{ velocity: any, life: number, index: number }> = ({ velocity, life, index }) => {
  const ref = React.useRef<any>(null);
  
  // 파티클마다 고유한 특성 부여
  const speedMult = React.useMemo(() => 0.5 + Math.random() * 1.5, []);
  const colorObj = React.useMemo(() => new Color(), []);

  useFrame((state, delta) => {
    if (ref.current) {
      // 속도 적용
      ref.current.position.x += velocity.x * delta * speedMult;
      ref.current.position.y += velocity.y * delta * speedMult;
      ref.current.position.z += velocity.z * delta * speedMult;
      
      // 생명주기에 따른 크기 변화 (커졌다가 사라짐)
      const scale = life * (0.8 + Math.random() * 0.5);
      ref.current.scale.setScalar(scale);
      
      // 색상 보간: 흰색/노랑 -> 빨강 -> 어두운 보라
      if (life > 0.7) {
        colorObj.set('#ffffff');
      } else if (life > 0.4) {
        colorObj.lerpColors(new Color('#ff0044'), new Color('#ffff00'), (life - 0.4) / 0.3);
      } else {
        colorObj.lerpColors(new Color('#220044'), new Color('#ff0044'), life / 0.4);
      }
      ref.current.material.color.copy(colorObj);
      ref.current.material.emissive.copy(colorObj);
      
      // 회전 효과
      ref.current.rotation.x += delta * 5;
      ref.current.rotation.y += delta * 5;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff" 
        emissiveIntensity={4} 
        transparent 
        opacity={life} 
      />
    </mesh>
  );
};

export default ExplosionManager;

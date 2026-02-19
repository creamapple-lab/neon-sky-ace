
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
            <Particle 
              key={i} 
              velocity={p.velocity} 
              life={exp.life} 
              baseColor={exp.color} 
              isMega={exp.isMega} 
            />
          ))}
          
          {/* 섬광(Flash) 메쉬는 이제 존재하지 않음 */}

          {/* 폭발 지점의 강렬한 라이트 효과 (순간적인 물리적 충격 표현) */}
          <pointLight 
            color={exp.color} 
            intensity={exp.life * (exp.isMega ? 200 : 40)} 
            distance={exp.isMega ? 80 : 25} 
          />
          {exp.isMega && (
            <pointLight color="#ffffff" intensity={exp.life * 100} distance={50} />
          )}
        </group>
      ))}
    </>
  );
};

const Particle: React.FC<{ velocity: any, life: number, baseColor: string, isMega?: boolean }> = ({ velocity, life, baseColor, isMega }) => {
  const ref = React.useRef<any>(null);
  
  // 파편 속도 보정: 메가는 훨씬 더 빠르고 파괴적으로
  const speedMult = React.useMemo(() => (isMega ? 2.5 : 1.0) + Math.random() * 4.0, [isMega]);
  const colorObj = React.useMemo(() => new Color(), []);
  const targetColor = React.useMemo(() => new Color(baseColor), [baseColor]);
  
  // 무작위 회전축
  const rotAxis = React.useMemo(() => ({
    x: Math.random() * 30,
    y: Math.random() * 30,
    z: Math.random() * 30
  }), []);

  useFrame((state, delta) => {
    if (ref.current) {
      // 파편 이동
      ref.current.position.x += velocity.x * delta * speedMult;
      ref.current.position.y += velocity.y * delta * speedMult;
      ref.current.position.z += velocity.z * delta * speedMult;
      
      // 크기 변화: 메가는 파편 크기가 아주 다양함
      const baseScale = isMega ? (0.5 + Math.random() * 3.0) : (0.3 + Math.random() * 1.2);
      const scale = life * baseScale;
      ref.current.scale.setScalar(scale);
      
      // 색상 연출: 초기에는 아주 밝은 흰색이었다가 점차 고유 색상으로 변하며 어두워짐
      if (life > 0.9) {
        colorObj.set('#ffffff');
      } else {
        colorObj.lerpColors(new Color('#000000'), targetColor, life / 0.9);
      }
      
      ref.current.material.color.copy(colorObj);
      ref.current.material.emissive.copy(colorObj);
      
      // 파편 회전
      ref.current.rotation.x += delta * rotAxis.x;
      ref.current.rotation.y += delta * rotAxis.y;
    }
  });

  return (
    <mesh ref={ref}>
      {/* 아케이드 느낌을 위해 상자 형태의 파편 사용 */}
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff" 
        emissiveIntensity={isMega ? 20 : 10} 
        transparent 
        opacity={life} 
      />
    </mesh>
  );
};

export default ExplosionManager;

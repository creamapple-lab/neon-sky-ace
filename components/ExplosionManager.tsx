
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
          
          {/* 타격 지점 핵심 광원 (파편이 더 잘 보이게 함) */}
          <pointLight 
            color={exp.color} 
            intensity={exp.life * (exp.isMega ? 250 : 60)} 
            distance={exp.isMega ? 80 : 25} 
          />
        </group>
      ))}
    </>
  );
};

const Particle: React.FC<{ velocity: Vector3, life: number, baseColor: string, isMega?: boolean }> = ({ velocity, life, baseColor, isMega }) => {
  const ref = useRef<any>(null);
  
  // 파편 속도와 회전축 초기화
  const speedMult = useMemo(() => (isMega ? 4.0 : 2.5) + Math.random() * 4.0, [isMega]);
  const rotAxis = useMemo(() => new Vector3(Math.random(), Math.random(), Math.random()).normalize(), []);
  const rotSpeed = useMemo(() => 10 + Math.random() * 20, []);
  
  // 색상 계산용 객체
  const colorObj = useMemo(() => new Color(), []);
  const enemyColor = useMemo(() => new Color(baseColor), [baseColor]);

  useFrame((state, delta) => {
    if (ref.current) {
      // 1. 위치 이동
      ref.current.position.x += velocity.x * delta * speedMult;
      ref.current.position.y += velocity.y * delta * speedMult;
      ref.current.position.z += velocity.z * delta * speedMult;
      
      // 2. 크기 조절 (너무 작지 않게 보정)
      // 이전 버전에서 너무 작아 안보였던 문제를 해결하기 위해 기본 스케일 상향
      const baseScale = isMega ? (0.2 + Math.random() * 0.8) : (0.1 + Math.random() * 0.3);
      const currentScale = life * baseScale;
      ref.current.scale.setScalar(currentScale);
      
      // 3. 색상 및 발광 연출 (선명도 확보)
      // 초기 0.1초는 하얗게 빛나다가 적의 색상으로 변함
      if (life > 0.85) {
        colorObj.set('#ffffff');
      } else {
        // 적 색상에서 검은색으로 서서히 페이드 아웃
        colorObj.copy(enemyColor).multiplyScalar(life);
      }
      
      ref.current.material.color.copy(colorObj);
      ref.current.material.emissive.copy(colorObj);
      // 발광 강도를 높게 유지하여 작은 입자도 빛나게 만듦
      ref.current.material.emissiveIntensity = life * (isMega ? 25 : 12);
      
      // 4. 회전
      ref.current.rotateOnAxis(rotAxis, delta * rotSpeed);
    }
  });

  return (
    <mesh ref={ref}>
      {/* 너무 뭉툭하지 않게 작은 박스 지오메트리 사용 */}
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial 
        color="#ffffff" 
        emissive="#ffffff" 
        transparent 
        opacity={Math.min(1, life * 1.5)} 
      />
    </mesh>
  );
};

export default ExplosionManager;

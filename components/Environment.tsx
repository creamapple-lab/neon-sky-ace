
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils, Color } from 'three';
import { Stars, Float } from '@react-three/drei';

interface EnvironmentProps {
  speedFactor?: number;
}

const Environment: React.FC<EnvironmentProps> = ({ speedFactor = 1.0 }) => {
  const planetsRef = useRef<Group>(null);

  // 행성 데이터 생성 (위치, 크기, 색상 등)
  const planetData = useMemo(() => {
    return Array.from({ length: 25 }).map(() => ({
      position: new Vector3(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        Math.random() * -150 - 20
      ),
      size: 1 + Math.random() * 5,
      color: new Color().setHSL(Math.random() * 0.2 + 0.7, 0.8, 0.5), // Vaporwave palette
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      id: Math.random()
    }));
  }, []);

  useFrame((state, delta) => {
    if (planetsRef.current) {
      planetsRef.current.children.forEach((child, i) => {
        // 행성을 플레이어 쪽으로 이동 (Z축)
        child.position.z += 25 * delta * speedFactor;
        child.rotation.y += planetData[i].rotationSpeed;
        child.rotation.x += planetData[i].rotationSpeed * 0.5;

        // 화면 뒤로 넘어가면 다시 저 멀리로 리스폰
        if (child.position.z > 30) {
          child.position.z = -150;
          child.position.x = (Math.random() - 0.5) * 100;
          child.position.y = (Math.random() - 0.5) * 80;
        }
      });
    }
  });

  return (
    <>
      {/* 밤하늘의 별 */}
      <Stars radius={150} depth={100} count={6000} factor={6} saturation={1} fade speed={2} />
      
      {/* 배경의 거대 태양/성운 */}
      <mesh position={[0, 15, -100]}>
        <circleGeometry args={[30, 64]} />
        <meshBasicMaterial color="#ff00aa" transparent opacity={0.3} />
      </mesh>
      <pointLight position={[0, 15, -80]} color="#ff00ff" intensity={5} distance={200} />

      {/* 흘러가는 행성들 */}
      <group ref={planetsRef}>
        {planetData.map((data, i) => (
          <Planet key={i} data={data} />
        ))}
      </group>

      {/* 우주 공간의 안개 느낌을 위한 조명 */}
      <ambientLight intensity={0.2} />
    </>
  );
};

const Planet: React.FC<{ data: any }> = ({ data }) => {
  return (
    <group position={data.position}>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <mesh>
          {/* 행성 모양을 위해 고품질 구체 대신 약간 각진 형태 사용 (아케이드 느낌) */}
          <icosahedronGeometry args={[data.size, 1]} />
          <meshStandardMaterial 
            color={data.color} 
            emissive={data.color} 
            emissiveIntensity={0.8} 
            wireframe 
          />
        </mesh>
        
        {/* 일부 행성에는 고리(Ring) 추가 */}
        {data.id > 0.6 && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <torusGeometry args={[data.size * 1.6, 0.05, 16, 64]} />
            <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2} />
          </mesh>
        )}
      </Float>
    </group>
  );
};

export default Environment;


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, Color } from 'three';
import { Stars, Float } from '@react-three/drei';

interface EnvironmentProps {
  speedFactor?: number;
}

const Environment: React.FC<EnvironmentProps> = ({ speedFactor = 1.0 }) => {
  const planetsRef = useRef<Group>(null);

  // 행성 데이터 (위치, 크기, 색상)
  const planetData = useMemo(() => {
    return Array.from({ length: 32 }).map(() => ({
      position: new Vector3(
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 100,
        Math.random() * -250 - 20
      ),
      size: 1.5 + Math.random() * 7,
      color: new Color().setHSL(Math.random() * 0.15 + 0.65, 0.8, 0.5),
      rotationSpeed: (Math.random() - 0.5) * 0.015,
      id: Math.random()
    }));
  }, []);

  useFrame((state, delta) => {
    if (planetsRef.current) {
      planetsRef.current.children.forEach((child, i) => {
        // 프레임 보간을 위해 delta 값을 확실히 곱함
        const moveStep = 40 * delta * speedFactor;
        child.position.z += moveStep;
        child.rotation.y += planetData[i].rotationSpeed;
        
        // 화면 뒤로 넘어가면 부드럽게 재배치
        if (child.position.z > 50) {
          child.position.z = -250;
          child.position.x = (Math.random() - 0.5) * 140;
          child.position.y = (Math.random() - 0.5) * 120;
        }
      });
    }
  });

  return (
    <>
      <Stars radius={200} depth={60} count={8000} factor={7} saturation={1} fade speed={1.5} />
      
      {/* 원경 성운 효과 */}
      <mesh position={[0, 25, -150]}>
        <circleGeometry args={[50, 64]} />
        <meshBasicMaterial color="#330088" transparent opacity={0.12} />
      </mesh>

      <group ref={planetsRef}>
        {planetData.map((data, i) => (
          <group key={i} position={data.position}>
            <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.3}>
              <mesh>
                <icosahedronGeometry args={[data.size, 1]} />
                <meshStandardMaterial 
                  color={data.color} 
                  emissive={data.color} 
                  emissiveIntensity={1.0} 
                  wireframe 
                />
              </mesh>
              {data.id > 0.75 && (
                <mesh rotation={[Math.PI / 3.2, 0, 0]}>
                  <torusGeometry args={[data.size * 1.8, 0.05, 12, 48]} />
                  <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2.5} />
                </mesh>
              )}
            </Float>
          </group>
        ))}
      </group>
      <ambientLight intensity={0.15} />
    </>
  );
};

export default Environment;

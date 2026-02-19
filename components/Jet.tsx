
import React, { forwardRef } from 'react';
import { Group } from 'three';

const Jet = forwardRef<Group>((props, ref) => {
  return (
    <group ref={ref} {...props}>
      {/* 메인 바디 */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 2.5, 4]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={4} 
          roughness={0} 
          metalness={1} 
        />
      </mesh>
      
      {/* 네온 날개 */}
      <mesh position={[0, -0.1, 0.4]} scale={[3.8, 0.05, 1.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={2} />
      </mesh>

      {/* 날개 끝 네온 포인트 */}
      <mesh position={[1.9, -0.1, 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-1.9, -0.1, 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 꼬리 날개 */}
      <mesh position={[0, 0.5, 0.9]} scale={[0.05, 0.8, 0.5]} rotation={[-0.2, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
      </mesh>

      {/* 엔진 부스터 빛 */}
      <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.4, 0.5, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <pointLight position={[0, 0, 1.5]} color="#00ffff" intensity={8} distance={5} />
    </group>
  );
});

export default Jet;


import React, { forwardRef } from 'react';
import { Group } from 'three';

const Jet = forwardRef<Group>((props, ref) => {
  return (
    <group ref={ref} {...props} scale={0.6}>
      {/* 메인 바디: 뾰족한 부분이 전방(-Z)을 향하도록 회전 수정 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 2.5, 4]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={4} 
          roughness={0} 
          metalness={1} 
        />
      </mesh>
      
      {/* 네온 날개: 기체 뒤쪽에 배치 */}
      <mesh position={[0, -0.1, 0.5]} scale={[3.8, 0.05, 1.0]}>
        <boxGeometry />
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={2} />
      </mesh>

      {/* 날개 끝 네온 포인트 */}
      <mesh position={[1.9, -0.1, 0.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-1.9, -0.1, 0.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 꼬리 날개: 기체 맨 뒤 상단 */}
      <mesh position={[0, 0.5, 0.8]} scale={[0.05, 0.7, 0.4]} rotation={[0.2, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
      </mesh>

      {/* 엔진 부스터: 기체 맨 뒤 중앙 */}
      <mesh position={[0, 0, 1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
      
      {/* 부스터 불빛 */}
      <pointLight position={[0, 0, 1.6]} color="#00ffff" intensity={10} distance={4} />
    </group>
  );
});

export default Jet;

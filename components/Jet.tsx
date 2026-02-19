
import React from 'react';

const Jet: React.FC = () => {
  return (
    <group scale={0.65}>
      {/* 메인 바디 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.3, 2.5, 4]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff" 
          emissiveIntensity={5} 
          roughness={0} 
          metalness={1} 
        />
      </mesh>
      
      {/* 네온 날개 */}
      <mesh position={[0, -0.1, 0.5]} scale={[4.0, 0.05, 1.2]}>
        <boxGeometry />
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" emissiveIntensity={3} />
      </mesh>

      {/* 날개 끝 포인트 */}
      <mesh position={[2.0, -0.1, 0.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-2.0, -0.1, 0.8]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      
      {/* 꼬리 날개 */}
      <mesh position={[0, 0.6, 0.9]} scale={[0.05, 0.8, 0.5]} rotation={[0.2, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>

      {/* 엔진 부스터 */}
      <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#00ffff" emissiveIntensity={5} />
      </mesh>
      
      <pointLight position={[0, 0, 1.6]} color="#00ffff" intensity={15} distance={5} />
    </group>
  );
};

export default Jet;

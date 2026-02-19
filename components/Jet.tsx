
import React, { forwardRef } from 'react';
import { Group } from 'three';

const Jet = forwardRef<Group>((props, ref) => {
  return (
    <group ref={ref} {...props}>
      {/* Cockpit/Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.4, 2, 8]} />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
      </mesh>
      
      {/* Wings */}
      <mesh position={[0, -0.2, 0.2]} scale={[3.5, 0.1, 0.8]}>
        <boxGeometry />
        <meshStandardMaterial color="#0088ff" emissive="#0088ff" />
      </mesh>
      
      {/* Tail Fins */}
      <mesh position={[0, 0.4, 0.8]} scale={[0.1, 0.6, 0.4]}>
        <boxGeometry />
        <meshStandardMaterial color="#00ffff" emissive="#00ffff" />
      </mesh>

      {/* Engine Glow */}
      <pointLight position={[0, 0, 1]} color="#00ffff" intensity={5} distance={3} />
    </group>
  );
});

export default Jet;

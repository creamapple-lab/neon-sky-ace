
import React from 'react';
import { Enemy } from '../types';
import { useFrame } from '@react-three/fiber';

interface EnemyManagerProps {
  enemies: Enemy[];
}

const EnemyManager: React.FC<EnemyManagerProps> = ({ enemies }) => {
  return (
    <>
      {enemies.map((enemy) => (
        <group key={enemy.id} position={enemy.position}>
          <EnemyMesh type={enemy.type} color={enemy.color} />
          <pointLight color={enemy.color} intensity={4} distance={8} />
        </group>
      ))}
    </>
  );
};

const EnemyMesh: React.FC<{ type: string, color: string }> = ({ type, color }) => {
  const meshRef = React.useRef<any>(null);
  const rotationSpeed = React.useMemo(() => ({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: (Math.random() - 0.5) * 2
  }), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed.x;
      meshRef.current.rotation.y += delta * rotationSpeed.y;
      meshRef.current.rotation.z += delta * rotationSpeed.z;
    }
  });

  return (
    <mesh ref={meshRef}>
      {type === 'SCOUT' && <tetrahedronGeometry args={[0.9]} />}
      {type === 'STINGER' && <octahedronGeometry args={[1.0]} />}
      {type === 'INTERCEPTOR' && <boxGeometry args={[1.3, 1.3, 1.3]} />}
      {type === 'GHOST' && <dodecahedronGeometry args={[1.1]} />}
      {type === 'GOLIATH' && <icosahedronGeometry args={[1.9]} />}
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={3} 
        wireframe={type === 'GOLIATH'}
      />
    </mesh>
  );
};

export default EnemyManager;

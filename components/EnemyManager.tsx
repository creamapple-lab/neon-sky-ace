
import React from 'react';
import { Enemy } from '../types';

interface EnemyManagerProps {
  enemies: Enemy[];
}

const EnemyManager: React.FC<EnemyManagerProps> = ({ enemies }) => {
  return (
    <>
      {enemies.map((enemy) => (
        <group key={enemy.id} position={enemy.position}>
          <mesh rotation={[Math.random(), Math.random(), 0]}>
            <tetrahedronGeometry args={[0.8]} />
            <meshStandardMaterial 
              color="#ff0044" 
              emissive="#ff0044" 
              emissiveIntensity={2} 
            />
          </mesh>
          <pointLight color="#ff0044" intensity={2} distance={5} />
        </group>
      ))}
    </>
  );
};

export default EnemyManager;

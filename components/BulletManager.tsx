
import React from 'react';
import { Bullet } from '../types';

interface BulletManagerProps {
  bullets: Bullet[];
}

const BulletManager: React.FC<BulletManagerProps> = ({ bullets }) => {
  return (
    <>
      {bullets.map((bullet) => (
        <group key={bullet.id} position={bullet.position}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.02, 1.8, 8]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={10} />
          </mesh>
          <pointLight color="#ffff00" intensity={5} distance={3} />
        </group>
      ))}
    </>
  );
};

export default BulletManager;

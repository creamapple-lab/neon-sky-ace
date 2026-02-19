
import React from 'react';
import { Bullet } from '../types';

interface BulletManagerProps {
  bullets: Bullet[];
}

const BulletManager: React.FC<BulletManagerProps> = ({ bullets }) => {
  return (
    <>
      {bullets.map((bullet) => (
        <mesh key={bullet.id} position={bullet.position} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={5} />
        </mesh>
      ))}
    </>
  );
};

export default BulletManager;

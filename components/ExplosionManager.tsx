
import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Explosion } from '../types';

interface ExplosionManagerProps {
  explosions: Explosion[];
}

const ExplosionManager: React.FC<ExplosionManagerProps> = ({ explosions }) => {
  return (
    <>
      {explosions.map((exp) => (
        <group key={exp.id} position={exp.position}>
          {exp.particles.map((p, i) => (
            <Particle key={i} velocity={p.velocity} life={exp.life} />
          ))}
        </group>
      ))}
    </>
  );
};

const Particle: React.FC<{ velocity: any, life: number }> = ({ velocity, life }) => {
  const ref = React.useRef<any>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.x += velocity.x * delta;
      ref.current.position.y += velocity.y * delta;
      ref.current.position.z += velocity.z * delta;
      ref.current.scale.setScalar(life);
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" transparent opacity={life} />
    </mesh>
  );
};

export default ExplosionManager;


import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, TextureLoader, RepeatWrapping, Vector2 } from 'three';
import { Stars } from '@react-three/drei';

const Environment: React.FC = () => {
  const gridRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (gridRef.current) {
      // Create illusion of movement by shifting texture offset
      const material = gridRef.current.material as any;
      material.map.offset.y -= 0.05;
    }
  });

  // Create a grid texture procedurally or via placeholder logic
  const gridTexture = React.useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#050010';
    ctx.fillRect(0, 0, size, size);
    
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, size, size);
    
    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(50, 50);
    return texture;
  }, []);

  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Floating neon lines (horizon) */}
      <mesh position={[0, -2, -40]}>
        <planeGeometry args={[200, 0.5]} />
        <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={5} />
      </mesh>

      {/* Grid Floor */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial map={gridTexture} />
      </mesh>
    </>
  );
};

export default Environment;

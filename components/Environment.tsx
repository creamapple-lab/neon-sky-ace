
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, TextureLoader, RepeatWrapping, DoubleSide, Color } from 'three';
import { Stars } from '@react-three/drei';

const Environment: React.FC = () => {
  const gridRef = useRef<Mesh>(null);
  const sunRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (gridRef.current) {
      const material = gridRef.current.material as any;
      material.map.offset.y -= 0.08; // 바닥 움직임 속도
    }

    if (sunRef.current) {
      // 태양의 미세한 맥동 효과
      const s = 1 + Math.sin(t * 0.5) * 0.05;
      sunRef.current.scale.set(s, s, s);
    }
  });

  const gridTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#050010';
    ctx.fillRect(0, 0, size, size);
    
    // 네온 그리드 라인
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, size, size);
    
    // 중앙 글로우 효과
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255, 0, 255, 0.1)');
    grad.addColorStop(1, 'rgba(255, 0, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(40, 40);
    return texture;
  }, []);

  return (
    <>
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      {/* Retro Sun */}
      <mesh ref={sunRef} position={[0, 8, -45]}>
        <circleGeometry args={[15, 64]} />
        <meshBasicMaterial 
          color="#ff2288"
          transparent
          opacity={0.8}
          side={DoubleSide}
        />
        {/* 태양의 수평선 줄무늬 효과를 위한 마스크 대용 (단순 네온 레이어) */}
        <pointLight color="#ff00aa" intensity={10} distance={100} />
      </mesh>

      {/* 지평선 글로우 */}
      <mesh position={[0, -2, -42]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 20]} />
        <meshBasicMaterial color="#ff00ff" transparent opacity={0.2} />
      </mesh>

      {/* Grid Floor */}
      <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          map={gridTexture} 
          emissive="#ff00ff" 
          emissiveIntensity={0.5}
        />
      </mesh>
    </>
  );
};

export default Environment;

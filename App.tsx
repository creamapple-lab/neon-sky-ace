/**
 * Project: Neon Sky Ace | Created by Jay | AI City Builders & Connect AI LAB
 * Features: Mobile Touch, Y-Axis Speed Control, Dynamic Difficulty Scaling
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// --- 게임 엔진 구성 요소 ---

const GameScene = ({ setScore, score, setGameOver, gameOver }) => {
  const playerRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const [enemies, setEnemies] = useState([]);
  const [lasers, setLasers] = useState([]);
  const lastFireTime = useRef(0);

  // 1. 동적 가속도 계산: 화면 위쪽 터치 시 가속 + 점수에 비례한 난이도 상승 [cite: 2026-01-28]
  const gameSpeed = useMemo(() => {
    const baseSpeed = 0.3;
    const userAcceleration = (pointer.current.y + 1) * 0.4; // 위로 갈수록 빨라짐
    const difficultyMultiplier = 1 + (score * 0.01); // 점수 비례 난이도 상승 [cite: 2026-01-28]
    return (baseSpeed + userAcceleration) * difficultyMultiplier;
  }, [pointer.current.y, score]);

  // 2. 통합 포인터 제어 (마우스 & 터치) [cite: 2026-01-28]
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const handleDown = () => { pointer.current.active = true; };
    const handleUp = () => { pointer.current.active = false; };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerdown', handleDown);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handleDown);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  useFrame((state) => {
    if (gameOver) return;

    // 비행기 이동 및 틸팅
    if (playerRef.current) {
      playerRef.current.position.x = THREE.MathUtils.lerp(playerRef.current.position.x, pointer.current.x * 12, 0.1);
      playerRef.current.position.y = THREE.MathUtils.lerp(playerRef.current.position.y, pointer.current.y * 6, 0.1);
      playerRef.current.rotation.z = -playerRef.current.position.x * 0.05;
      playerRef.current.rotation.x = -playerRef.current.position.y * 0.05;
    }

    // 자동 사격 로직 (터치 중일 때) [cite: 2026-01-28]
    if (pointer.current.active && state.clock.elapsedTime - lastFireTime.current > 0.15) {
      const newLaser = {
        id: Math.random(),
        pos: [playerRef.current.position.x, playerRef.current.position.y, -2]
      };
      setLasers(prev => [...prev, newLaser]);
      lastFireTime.current = state.clock.elapsedTime;
    }

    // 적 생성 (난이도에 따라 빈도 조절)
    if (Math.random() < 0.05 + (score * 0.001)) {
      setEnemies(prev => [...prev, {
        id: Math.random(),
        pos: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -100]
      }]);
    }

    // 투사체 및 적 이동
    setLasers(prev => prev.filter(l => l.pos[2] > -100).map(l => ({ ...l, pos: [l.pos[0], l.pos[1], l.pos[2] - 2] })));
    setEnemies(prev => {
      const updated = prev.filter(e => e.pos[2] < 10).map(e => ({ ...e, pos: [e.pos[0], e.pos[1], e.pos[2] + gameSpeed] }));
      
      // 충돌 검사: 적과 비행기 [cite: 2026-01-28]
      updated.forEach(e => {
        const dx = e.pos[0] - playerRef.current.position.x;
        const dy = e.pos[1] - playerRef.current.position.y;
        const dz = e.pos[2] - 0;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 1.5) setGameOver(true);
      });
      return updated;
    });

    // 레이저 충돌 검사
    setLasers(lPrev => {
      let filteredLasers = [...lPrev];
      setEnemies(ePrev => {
        let filteredEnemies = [...ePrev];
        lPrev.forEach(l => {
          ePrev.forEach(e => {
            const dist = Math.sqrt(Math.pow(l.pos[0]-e.pos[0], 2) + Math.pow(l.pos[1]-e.pos[1], 2) + Math.pow(l.pos[2]-e.pos[2], 2));
            if (dist < 2) {
              filteredEnemies = filteredEnemies.filter(ex => ex.id !== e.id);
              filteredLasers = filteredLasers.filter(lx => lx.id !== l.id);
              setScore(s => s + 10);
            }
          });
        });
        return filteredEnemies;
      });
      return filteredLasers;
    });
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={gameSpeed * 2} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#0ff" />
      
      <group ref={playerRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
        </mesh>
      </group>

      {enemies.map(e => (
        <mesh key={e.id} position={e.pos as any}>
          <boxGeometry args={[1.5, 1.5, 1.5]} />
          <meshStandardMaterial color="#ff0044" emissive="#ff0044" emissiveIntensity={2} />
        </mesh>
      ))}

      {lasers.map(l => (
        <mesh key={l.id} position={l.pos as any}>
          <cylinderGeometry args={[0.05, 0.05, 1]} />
          <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={5} />
        </mesh>
      ))}

      <gridHelper args={[100, 50, 0xff00ff, 0x440044]} rotation={[0, 0, 0]} position={[0, -10, 0]} />
    </>
  );
};

export default function App() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden', touchAction: 'none' }}>
      <Canvas>
        <GameScene setScore={setScore} score={score} setGameOver={setGameOver} gameOver={gameOver} />
      </Canvas>
      
      <div style={{ position: 'absolute', top: 30, left: 30, color: '#0ff', fontSize: '28px', fontWeight: 'bold', fontFamily: 'Orbitron' }}>
        SCORE: {score}
      </div>

      {gameOver && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <h1 style={{ color: '#ff0044', fontSize: '64px', margin: 0 }}>GAME OVER</h1>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '15px 30px', background: '#0ff', border: 'none', fontSize: '20px', cursor: 'pointer', marginTop: '20px' }}
          >
            RESTART
          </button>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 15, width: '100%', textAlign: 'center', color: 'rgba(0,255,255,0.4)', fontSize: '12px', letterSpacing: '2px' }}>
        © AI City Builders & Connect AI LAB by Jay
      </div>
    </div>
  );
}
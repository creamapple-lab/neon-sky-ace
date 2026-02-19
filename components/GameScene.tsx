
import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group, MathUtils } from 'three';
import Jet from './Jet';
import EnemyManager from './EnemyManager';
import BulletManager from './BulletManager';
import ExplosionManager from './ExplosionManager';
import Environment from './Environment';
import { GameStatus, Bullet, Enemy, Explosion } from '../types';

interface GameSceneProps {
  status: GameStatus;
  speedFactor: number;
  onGameOver: () => void;
  onScore: (amount?: number) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ status, speedFactor, onGameOver, onScore }) => {
  const { pointer, viewport, camera } = useThree();
  const jetRef = useRef<Group>(null);
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  const lastFireTime = useRef(0);
  const lastSpawnTime = useRef(0);
  const shakeRef = useRef(0);

  const fire = useCallback(() => {
    if (!jetRef.current) return;
    const now = Date.now();
    // 난이도가 높을수록 연사 속도도 아주 약간 빨라지게 하여 쾌감을 유지
    const fireRate = 120 / (speedFactor * 0.5 + 0.5);
    if (now - lastFireTime.current < fireRate) return;
    
    lastFireTime.current = now;
    const pos = jetRef.current.position.clone();
    pos.z -= 1.3; 
    
    setBullets((prev) => [
      ...prev,
      { id: Math.random().toString(), position: pos }
    ]);
  }, [speedFactor]);

  const spawnEnemy = useCallback((difficulty: number) => {
    const x = (Math.random() - 0.5) * (viewport.width * 1.8);
    // Y 범위를 살짝 더 분산시킴
    const y = (Math.random() - 0.5) * (viewport.height * 1.2) + 1.5;
    const z = -60;
    
    setEnemies((prev) => [
      ...prev,
      { 
        id: Math.random().toString(), 
        position: new Vector3(x, y, z), 
        // 전체 속도 상수를 speedFactor에 비례하게 조정
        speed: (0.4 + (Math.random() * 0.15) + (difficulty * 0.05)) * speedFactor 
      }
    ]);
  }, [viewport.width, viewport.height, speedFactor]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) {
      if (bullets.length > 0) setBullets([]);
      if (enemies.length > 0) setEnemies([]);
      return;
    }

    const elapsedTime = state.clock.getElapsedTime();
    // 시간이 지날수록 어려워지는 가속도도 speedFactor에 영향받음
    const difficulty = Math.min(elapsedTime / 60, 5) * speedFactor;

    // 카메라 셰이크
    if (shakeRef.current > 0) {
      camera.position.x += (Math.random() - 0.5) * shakeRef.current;
      camera.position.y += (Math.random() - 0.5) * shakeRef.current;
      shakeRef.current *= 0.85;
    } else {
      camera.position.x = MathUtils.lerp(camera.position.x, 0, 0.1);
      camera.position.y = MathUtils.lerp(camera.position.y, 2, 0.1);
    }

    // Jet movement
    if (jetRef.current) {
      const targetX = (pointer.x * viewport.width) / 2;
      const targetY = (pointer.y * viewport.height) / 2 + 1.5; 
      
      const boundX = viewport.width / 2 - 0.8;
      const boundYTop = viewport.height + 0.5;
      const boundYBottom = -1.2;

      jetRef.current.position.x = MathUtils.lerp(
        jetRef.current.position.x, 
        MathUtils.clamp(targetX, -boundX, boundX), 
        0.18
      );
      jetRef.current.position.y = MathUtils.lerp(
        jetRef.current.position.y, 
        MathUtils.clamp(targetY, boundYBottom, boundYTop), 
        0.18
      );
      
      const tiltZ = -(jetRef.current.position.x - targetX) * 0.6;
      const tiltX = (jetRef.current.position.y - targetY) * 0.4;
      jetRef.current.rotation.z = MathUtils.lerp(jetRef.current.rotation.z, tiltZ, 0.1);
      jetRef.current.rotation.x = MathUtils.lerp(jetRef.current.rotation.x, tiltX, 0.1);
    }

    // Enemy Spawning (speedFactor가 낮을수록 생성 간격이 길어짐)
    const spawnInterval = Math.max((1000 / speedFactor) - (difficulty * 100), 300);
    const now = Date.now();
    if (now - lastSpawnTime.current > spawnInterval) {
      spawnEnemy(difficulty);
      lastSpawnTime.current = now;
    }

    // Auto-fire
    fire();

    // Entities Update
    setBullets((prev) => prev
      .map((b) => ({ ...b, position: b.position.clone().add(new Vector3(0, 0, -2.0)) }))
      .filter((b) => b.position.z > -70)
    );

    setEnemies((prev) => prev
      .map((e) => ({ ...e, position: e.position.clone().add(new Vector3(0, 0, e.speed)) }))
      .filter((e) => e.position.z < 20)
    );

    setExplosions((prev) => prev
      .map(exp => ({ ...exp, life: exp.life - delta * 2 }))
      .filter(exp => exp.life > 0)
    );

    // Collision
    setBullets((currentBullets) => {
      let filteredBullets = [...currentBullets];
      let hitEnemyIds: string[] = [];

      currentBullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          if (bullet.position.distanceTo(enemy.position) < 2.2) {
            hitEnemyIds.push(enemy.id);
            filteredBullets = filteredBullets.filter(b => b.id !== bullet.id);
            shakeRef.current = 0.3;
            onScore(150);

            setExplosions(prev => [...prev, {
              id: Math.random().toString(),
              position: enemy.position.clone(),
              life: 1.0,
              particles: Array.from({ length: 8 }).map(() => ({
                position: new Vector3(0, 0, 0),
                velocity: new Vector3((Math.random()-0.5)*8, (Math.random()-0.5)*8, (Math.random()-0.5)*8)
              }))
            }]);
          }
        });
      });

      if (hitEnemyIds.length > 0) {
        setEnemies(prev => prev.filter(e => !hitEnemyIds.includes(e.id)));
      }
      return filteredBullets;
    });

    if (jetRef.current) {
      const playerPos = jetRef.current.position;
      enemies.forEach((enemy) => {
        if (playerPos.distanceTo(enemy.position) < 1.1) {
          onGameOver();
        }
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[0, 5, 5]} intensity={2} color="#ff00ff" />
      
      <Environment speedFactor={speedFactor} />
      
      {status === GameStatus.PLAYING && (
        <>
          <Jet ref={jetRef} />
          <BulletManager bullets={bullets} />
          <EnemyManager enemies={enemies} />
          <ExplosionManager explosions={explosions} />
        </>
      )}
    </>
  );
};

export default GameScene;

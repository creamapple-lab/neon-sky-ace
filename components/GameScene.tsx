
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
  onGameOver: () => void;
  onScore: (amount?: number) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ status, onGameOver, onScore }) => {
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
    if (now - lastFireTime.current < 110) return;
    
    lastFireTime.current = now;
    const pos = jetRef.current.position.clone();
    // 비행기 코 부분(기두)에서 발사되도록 위치 조정 (-1.25 정도가 코 끝)
    pos.z -= 1.3; 
    
    setBullets((prev) => [
      ...prev,
      { id: Math.random().toString(), position: pos }
    ]);
  }, []);

  const spawnEnemy = useCallback((difficulty: number) => {
    // 플레이어의 이동 가로 범위에 맞춤
    const x = (Math.random() - 0.5) * (viewport.width * 1.5);
    // 중요: 플레이어의 상하 이동 범위와 일치하도록 Y축 생성 로직 수정
    const y = (Math.random() - 0.5) * viewport.height + 1.5;
    const z = -60;
    
    setEnemies((prev) => [
      ...prev,
      { 
        id: Math.random().toString(), 
        position: new Vector3(x, y, z), 
        speed: 0.5 + (Math.random() * 0.2) + (difficulty * 0.08) 
      }
    ]);
  }, [viewport.width, viewport.height]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) {
      if (bullets.length > 0) setBullets([]);
      if (enemies.length > 0) setEnemies([]);
      return;
    }

    const elapsedTime = state.clock.getElapsedTime();
    const difficulty = Math.min(elapsedTime / 60, 5);

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
      
      // Banking & Tilting (전방을 향하도록 틸트 감도 조정)
      const tiltZ = -(jetRef.current.position.x - targetX) * 0.6;
      const tiltX = (jetRef.current.position.y - targetY) * 0.4;
      jetRef.current.rotation.z = MathUtils.lerp(jetRef.current.rotation.z, tiltZ, 0.1);
      jetRef.current.rotation.x = MathUtils.lerp(jetRef.current.rotation.x, tiltX, 0.1);
    }

    // Enemy Spawning
    const spawnInterval = Math.max(800 - (difficulty * 120), 300);
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
          if (bullet.position.distanceTo(enemy.position) < 2.0) {
            hitEnemyIds.push(enemy.id);
            filteredBullets = filteredBullets.filter(b => b.id !== bullet.id);
            shakeRef.current = 0.35;
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
      
      <Environment />
      
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

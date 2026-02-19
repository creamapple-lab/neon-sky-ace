
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
    if (now - lastFireTime.current < 120) return;
    
    lastFireTime.current = now;
    const pos = jetRef.current.position.clone();
    pos.z -= 2;
    
    setBullets((prev) => [
      ...prev,
      { id: Math.random().toString(), position: pos }
    ]);
  }, []);

  const spawnEnemy = useCallback((difficulty: number) => {
    const x = (Math.random() - 0.5) * (viewport.width * 1.5);
    const y = (Math.random() - 0.5) * (viewport.height * 1.2) + 3;
    const z = -60;
    
    setEnemies((prev) => [
      ...prev,
      { 
        id: Math.random().toString(), 
        position: new Vector3(x, y, z), 
        speed: 0.45 + (Math.random() * 0.2) + (difficulty * 0.05) 
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
      // 뷰포트 영역 내에서 이동 범위 조정
      // 기존 +3 오프셋을 +1.5로 줄여 기본 위치를 낮춤
      const targetX = (pointer.x * viewport.width) / 2;
      const targetY = (pointer.y * viewport.height) / 2 + 1.5; 
      
      const boundX = viewport.width / 2 - 0.8;
      const boundYTop = viewport.height + 1;
      const boundYBottom = -1.5; // 바닥 그리드 근처까지 내려가도록 허용

      jetRef.current.position.x = MathUtils.lerp(
        jetRef.current.position.x, 
        MathUtils.clamp(targetX, -boundX, boundX), 
        0.15
      );
      jetRef.current.position.y = MathUtils.lerp(
        jetRef.current.position.y, 
        MathUtils.clamp(targetY, boundYBottom, boundYTop), 
        0.15
      );
      
      // Banking & Tilting
      const tiltZ = -(jetRef.current.position.x - targetX) * 0.6;
      const tiltX = (jetRef.current.position.y - targetY) * 0.4;
      jetRef.current.rotation.z = MathUtils.lerp(jetRef.current.rotation.z, tiltZ, 0.1);
      jetRef.current.rotation.x = MathUtils.lerp(jetRef.current.rotation.x, tiltX, 0.1);
    }

    // Enemy Spawning
    const spawnInterval = Math.max(1000 - (difficulty * 150), 350);
    const now = Date.now();
    if (now - lastSpawnTime.current > spawnInterval) {
      spawnEnemy(difficulty);
      lastSpawnTime.current = now;
    }

    // Auto-fire
    fire();

    // Entities Update
    setBullets((prev) => prev
      .map((b) => ({ ...b, position: b.position.clone().add(new Vector3(0, 0, -1.8)) }))
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
            shakeRef.current = 0.4;
            onScore(150);

            setExplosions(prev => [...prev, {
              id: Math.random().toString(),
              position: enemy.position.clone(),
              life: 1.0,
              particles: Array.from({ length: 10 }).map(() => ({
                position: new Vector3(0, 0, 0),
                velocity: new Vector3((Math.random()-0.5)*10, (Math.random()-0.5)*10, (Math.random()-0.5)*10)
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
        // 충돌 판정 범위를 기체 크기 감소에 맞춰 살짝 조정
        if (playerPos.distanceTo(enemy.position) < 1.2) {
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

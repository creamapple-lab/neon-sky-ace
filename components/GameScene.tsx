
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
    // 가로 범위는 시원하게 확보
    const x = (Math.random() - 0.5) * (viewport.width * 1.8);
    
    /**
     * 모바일 HUD 회피 고도 설정:
     * 상단 전광판에 가려지지 않도록 최대 고도를 뷰포트 중앙보다 살짝 위까지만 제한
     */
    const minY = -0.8;
    const maxY = Math.min(viewport.height * 0.25, 3.5); 
    const y = MathUtils.lerp(minY, maxY, Math.random());
    
    const z = -60;
    
    setEnemies((prev) => [
      ...prev,
      { 
        id: Math.random().toString(), 
        position: new Vector3(x, y, z), 
        speed: (0.45 + (Math.random() * 0.2) + (difficulty * 0.06)) * speedFactor 
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
    const difficulty = Math.min(elapsedTime / 60, 5) * speedFactor;

    // 카메라 셰이크 강화
    if (shakeRef.current > 0) {
      camera.position.x += (Math.random() - 0.5) * shakeRef.current;
      camera.position.y += (Math.random() - 0.5) * shakeRef.current;
      shakeRef.current *= 0.9; // 조금 더 길게 유지되도록 감쇄 조절
    } else {
      camera.position.x = MathUtils.lerp(camera.position.x, 0, 0.1);
      camera.position.y = MathUtils.lerp(camera.position.y, 2, 0.1);
    }

    // Jet movement
    if (jetRef.current) {
      const targetX = (pointer.x * viewport.width) / 2;
      const targetY = (pointer.y * viewport.height) / 2 + 1.0; 
      
      const boundX = viewport.width / 2 - 0.8;
      // 비행기도 전광판을 가리지 않게 고도 제한
      const boundYTop = Math.min(viewport.height * 0.3, 4); 
      const boundYBottom = -1.2;

      jetRef.current.position.x = MathUtils.lerp(
        jetRef.current.position.x, 
        MathUtils.clamp(targetX, -boundX, boundX), 
        0.2
      );
      jetRef.current.position.y = MathUtils.lerp(
        jetRef.current.position.y, 
        MathUtils.clamp(targetY, boundYBottom, boundYTop), 
        0.2
      );
      
      const tiltZ = -(jetRef.current.position.x - targetX) * 0.7;
      const tiltX = (jetRef.current.position.y - targetY) * 0.5;
      jetRef.current.rotation.z = MathUtils.lerp(jetRef.current.rotation.z, tiltZ, 0.1);
      jetRef.current.rotation.x = MathUtils.lerp(jetRef.current.rotation.x, tiltX, 0.1);
    }

    const spawnInterval = Math.max((800 / speedFactor) - (difficulty * 120), 300);
    const now = Date.now();
    if (now - lastSpawnTime.current > spawnInterval) {
      spawnEnemy(difficulty);
      lastSpawnTime.current = now;
    }

    fire();

    setBullets((prev) => prev
      .map((b) => ({ ...b, position: b.position.clone().add(new Vector3(0, 0, -2.2)) }))
      .filter((b) => b.position.z > -70)
    );

    setEnemies((prev) => prev
      .map((e) => ({ ...e, position: e.position.clone().add(new Vector3(0, 0, e.speed)) }))
      .filter((e) => e.position.z < 20)
    );

    setExplosions((prev) => prev
      .map(exp => ({ ...exp, life: exp.life - delta * 1.8 })) // 생존 시간 소폭 증가
      .filter(exp => exp.life > 0)
    );

    // Collision
    setBullets((currentBullets) => {
      let filteredBullets = [...currentBullets];
      let hitEnemyIds: string[] = [];

      currentBullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          if (bullet.position.distanceTo(enemy.position) < 2.5) {
            hitEnemyIds.push(enemy.id);
            filteredBullets = filteredBullets.filter(b => b.id !== bullet.id);
            shakeRef.current = 0.45; // 충돌 시 흔들림 강화
            onScore(150);

            // 화려한 폭발 생성: 파편 수 증가 (24개)
            setExplosions(prev => [...prev, {
              id: Math.random().toString(),
              position: enemy.position.clone(),
              life: 1.0,
              particles: Array.from({ length: 24 }).map(() => ({
                position: new Vector3(0, 0, 0),
                // 무작위 속도와 방향으로 비산
                velocity: new Vector3(
                  (Math.random() - 0.5) * 15, 
                  (Math.random() - 0.5) * 15, 
                  (Math.random() - 0.5) * 15
                )
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

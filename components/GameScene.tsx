
import React, { useRef, useState, useCallback, useMemo } from 'react';
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
  const { mouse, viewport, camera } = useThree();
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
    const x = (Math.random() - 0.5) * 25;
    const y = (Math.random() - 0.5) * 12 + 4;
    const z = -60;
    
    setEnemies((prev) => [
      ...prev,
      { 
        id: Math.random().toString(), 
        position: new Vector3(x, y, z), 
        speed: 0.4 + (Math.random() * 0.2) + (difficulty * 0.05) 
      }
    ]);
  }, []);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) {
      if (bullets.length > 0) setBullets([]);
      if (enemies.length > 0) setEnemies([]);
      return;
    }

    const elapsedTime = state.clock.getElapsedTime();
    const difficulty = Math.min(elapsedTime / 60, 5); // 시간에 따른 난이도 상승 (최대 5배)

    // 카메라 셰이크 적용
    if (shakeRef.current > 0) {
      camera.position.x += (Math.random() - 0.5) * shakeRef.current;
      camera.position.y += (Math.random() - 0.5) * shakeRef.current;
      shakeRef.current *= 0.9;
    } else {
      camera.position.x = MathUtils.lerp(camera.position.x, 0, 0.1);
      camera.position.y = MathUtils.lerp(camera.position.y, 2, 0.1);
    }

    // Jet movement
    if (jetRef.current) {
      const targetX = (mouse.x * viewport.width) / 2;
      const targetY = (mouse.y * viewport.height) / 2 + 3;
      
      jetRef.current.position.x = MathUtils.lerp(jetRef.current.position.x, targetX, 0.12);
      jetRef.current.position.y = MathUtils.lerp(jetRef.current.position.y, targetY, 0.12);
      
      // Banking & Pitching
      const tiltZ = -(jetRef.current.position.x - targetX) * 0.8;
      const tiltX = (jetRef.current.position.y - targetY) * 0.4;
      jetRef.current.rotation.z = MathUtils.lerp(jetRef.current.rotation.z, tiltZ, 0.1);
      jetRef.current.rotation.x = MathUtils.lerp(jetRef.current.rotation.x, tiltX, 0.1);
    }

    // Enemy Spawning
    const spawnInterval = Math.max(1000 - (difficulty * 150), 300);
    const now = Date.now();
    if (now - lastSpawnTime.current > spawnInterval) {
      spawnEnemy(difficulty);
      lastSpawnTime.current = now;
    }

    // Shooting - Auto-fire is always active as per game design
    fire();

    // Update Entities
    setBullets((prev) => prev
      .map((b) => ({ ...b, position: b.position.clone().add(new Vector3(0, 0, -1.8)) }))
      .filter((b) => b.position.z > -70)
    );

    setEnemies((prev) => prev
      .map((e) => ({ ...e, position: e.position.clone().add(new Vector3(0, 0, e.speed)) }))
      .filter((e) => e.position.z < 20)
    );

    setExplosions((prev) => prev
      .map(exp => ({ ...exp, life: exp.life - delta * 1.5 }))
      .filter(exp => exp.life > 0)
    );

    // Collision: Bullet vs Enemy
    setBullets((currentBullets) => {
      let filteredBullets = [...currentBullets];
      let hitEnemyIds: string[] = [];

      currentBullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          if (bullet.position.distanceTo(enemy.position) < 1.8) {
            hitEnemyIds.push(enemy.id);
            filteredBullets = filteredBullets.filter(b => b.id !== bullet.id);
            
            shakeRef.current = 0.3;
            onScore(150);

            setExplosions(prev => [...prev, {
              id: Math.random().toString(),
              position: enemy.position.clone(),
              life: 1.0,
              particles: Array.from({ length: 12 }).map(() => ({
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

    // Collision: Player vs Enemy
    if (jetRef.current) {
      const playerPos = jetRef.current.position;
      enemies.forEach((enemy) => {
        if (playerPos.distanceTo(enemy.position) < 1.4) {
          onGameOver();
        }
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
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

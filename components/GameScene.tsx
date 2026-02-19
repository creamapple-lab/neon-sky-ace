
import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group, MathUtils } from 'three';
import Jet from './Jet';
import EnemyManager from './EnemyManager';
import BulletManager from './BulletManager';
import ExplosionManager from './ExplosionManager';
import Environment from './Environment';
import { GameStatus, Bullet, Enemy, Explosion, EnemyType } from '../types';

interface GameSceneProps {
  status: GameStatus;
  speedFactor: number;
  onHit: () => void;
  onScore: (amount: number) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ status, speedFactor, onHit, onScore }) => {
  const { pointer, viewport, camera } = useThree();
  const jetRef = useRef<Group>(null);
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  const lastFireTime = useRef(0);
  const lastSpawnTime = useRef(0);
  const lastHitTime = useRef(0);
  const shakeRef = useRef(0);
  const timeScaleRef = useRef(1.0); 

  const spawnEnemy = useCallback((difficulty: number) => {
    const x = (Math.random() - 0.5) * (viewport.width * 0.85);
    const minY = -0.5;
    const maxY = Math.min(viewport.height * 0.2, 3.0); 
    const y = MathUtils.lerp(minY, maxY, Math.random());
    const z = -60;

    const rand = Math.random();
    let type: EnemyType = 'SCOUT';
    let points = 150;
    let color = '#ff2222'; 
    let speedMult = 1.0;

    if (rand > 0.90) {
      type = 'GOLIATH';
      points = 600;
      color = '#ffff00'; 
      speedMult = 0.5;
    } else if (rand > 0.70) {
      type = 'GHOST';
      points = 450;
      color = '#ffffff'; 
      speedMult = 1.4;
    } else if (rand > 0.45) {
      type = 'STINGER';
      points = 250;
      color = '#00ff44'; 
      speedMult = 1.2;
    } else if (rand > 0.25) {
      type = 'INTERCEPTOR';
      points = 350;
      color = '#aa44ff'; 
      speedMult = 1.1;
    }
    
    setEnemies((prev) => [
      ...prev,
      { id: Math.random().toString(), position: new Vector3(x, y, z), type, points, color, speed: (0.4 + (Math.random() * 0.1) + (difficulty * 0.05)) * speedFactor * speedMult }
    ]);
  }, [viewport.width, viewport.height, speedFactor]);

  const fire = useCallback(() => {
    if (!jetRef.current) return;
    const now = Date.now();
    const fireRate = 120 / (speedFactor * 0.5 + 0.5);
    if (now - lastFireTime.current < fireRate) return;
    
    lastFireTime.current = now;
    const pos = jetRef.current.position.clone();
    pos.z -= 1.3; 
    setBullets((prev) => [...prev, { id: Math.random().toString(), position: pos }]);
  }, [speedFactor]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    timeScaleRef.current = MathUtils.lerp(timeScaleRef.current, 1.0, 0.1);
    const scaledDelta = delta * timeScaleRef.current;
    const difficulty = Math.min(state.clock.elapsedTime / 60, 5) * speedFactor;

    if (shakeRef.current > 0) {
      camera.position.x += (Math.random() - 0.5) * shakeRef.current;
      camera.position.y += (Math.random() - 0.5) * shakeRef.current;
      shakeRef.current *= 0.88;
    } else {
      camera.position.x = MathUtils.lerp(camera.position.x, 0, 0.1);
      camera.position.y = MathUtils.lerp(camera.position.y, 2, 0.1);
    }

    if (jetRef.current) {
      const targetX = (pointer.x * viewport.width) / 2;
      const targetY = (pointer.y * viewport.height) / 2 + 1.0; 
      const boundX = viewport.width / 2 - 0.8;
      const boundYTop = Math.min(viewport.height * 0.3, 4); 
      const boundYBottom = -1.2;

      jetRef.current.position.x = MathUtils.lerp(jetRef.current.position.x, MathUtils.clamp(targetX, -boundX, boundX), 0.2);
      jetRef.current.position.y = MathUtils.lerp(jetRef.current.position.y, MathUtils.clamp(targetY, boundYBottom, boundYTop), 0.2);
      jetRef.current.rotation.z = MathUtils.lerp(jetRef.current.rotation.z, -(jetRef.current.position.x - targetX) * 0.7, 0.1);
      jetRef.current.rotation.x = MathUtils.lerp(jetRef.current.rotation.x, (jetRef.current.position.y - targetY) * 0.5, 0.1);

      const isInvulnerable = Date.now() - lastHitTime.current < 2000;
      jetRef.current.visible = isInvulnerable ? Math.floor(state.clock.elapsedTime * 10) % 2 === 0 : true;
    }

    const spawnInterval = Math.max((800 / speedFactor) - (difficulty * 120), 300);
    const now = Date.now();
    if (now - lastSpawnTime.current > spawnInterval) {
      spawnEnemy(difficulty);
      lastSpawnTime.current = now;
    }

    fire();

    setBullets((prev) => prev.map((b) => ({ ...b, position: b.position.clone().add(new Vector3(0, 0, -2.2 * timeScaleRef.current)) })).filter((b) => b.position.z > -70));
    setEnemies((prev) => prev.map((e) => ({ ...e, position: e.position.clone().add(new Vector3(0, 0, e.speed * timeScaleRef.current)) })).filter((e) => e.position.z < 20));
    setExplosions((prev) => prev.map(exp => ({ ...exp, life: exp.life - scaledDelta * (exp.isMega ? 1.0 : 2.0) })).filter(exp => exp.life > 0));

    setBullets((currentBullets) => {
      let filteredBullets = [...currentBullets];
      let hitEnemyIds: string[] = [];

      currentBullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          const hitRadius = enemy.type === 'GOLIATH' ? 3.5 : 2.5;
          if (bullet.position.distanceTo(enemy.position) < hitRadius) {
            hitEnemyIds.push(enemy.id);
            filteredBullets = filteredBullets.filter(b => b.id !== bullet.id);
            
            const isMega = enemy.type === 'GOLIATH' || enemy.type === 'GHOST';
            timeScaleRef.current = isMega ? 0.03 : 0.15; // 메가는 히트스톱을 더 강하게
            shakeRef.current = enemy.type === 'GOLIATH' ? 3.0 : (enemy.type === 'GHOST' ? 2.0 : 0.6);
            onScore(enemy.points);

            setExplosions(prev => [...prev, {
              id: Math.random().toString(),
              position: enemy.position.clone(),
              color: enemy.color,
              isMega,
              life: 1.0,
              // 메가 폭발 시 파편 250개 생성
              particles: Array.from({ length: isMega ? 250 : 25 }).map(() => ({
                position: new Vector3(0, 0, 0),
                velocity: new Vector3(
                  (Math.random() - 0.5) * (isMega ? 55 : 22), 
                  (Math.random() - 0.5) * (isMega ? 55 : 22), 
                  (Math.random() - 0.5) * (isMega ? 55 : 22)
                )
              }))
            }]);
          }
        });
      });

      if (hitEnemyIds.length > 0) setEnemies(prev => prev.filter(e => !hitEnemyIds.includes(e.id)));
      return filteredBullets;
    });

    if (jetRef.current) {
      const playerPos = jetRef.current.position;
      const isInvulnerable = Date.now() - lastHitTime.current < 2000;
      if (!isInvulnerable) {
        enemies.forEach((enemy) => {
          if (playerPos.distanceTo(enemy.position) < 1.5) {
            onHit();
            lastHitTime.current = Date.now();
            shakeRef.current = 1.5;
            setEnemies(prev => prev.filter(e => e.id !== enemy.id));
          }
        });
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00ffff" />
      <pointLight position={[0, 5, 5]} intensity={2} color="#ff00ff" />
      <Environment speedFactor={speedFactor * timeScaleRef.current} />
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

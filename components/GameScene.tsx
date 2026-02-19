
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
  const visualGroupRef = useRef<Group>(null); 
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  const lastFireTime = useRef(0);
  const lastSpawnTime = useRef(0);
  const lastHitTime = useRef(0);
  
  const shakeIntensity = useRef(0);
  const recoilZ = useRef(0); 
  const timeScaleRef = useRef(1.0); 

  const spawnEnemy = useCallback((difficulty: number) => {
    const x = (Math.random() - 0.5) * (viewport.width * 1.1);
    const y = (Math.random() - 0.5) * (viewport.height * 0.8) + 1.2;
    const z = -80;

    const rand = Math.random();
    let type: EnemyType = 'SCOUT';
    let points = 150;
    let color = '#ff2222'; 
    let speedMult = 1.0;

    if (rand > 0.94) {
      type = 'GOLIATH';
      points = 600;
      color = '#ffff00'; 
      speedMult = 0.4;
    } else if (rand > 0.80) {
      type = 'GHOST';
      points = 450;
      color = '#ffffff'; 
      speedMult = 1.7;
    } else if (rand > 0.60) {
      type = 'STINGER';
      points = 250;
      color = '#00ff44'; 
      speedMult = 1.35;
    }
    
    setEnemies((prev) => [
      ...prev,
      { id: Math.random().toString(), position: new Vector3(x, y, z), type, points, color, speed: (0.48 + (Math.random() * 0.12) + (difficulty * 0.07)) * speedFactor * speedMult }
    ]);
  }, [viewport.width, viewport.height, speedFactor]);

  const fire = useCallback(() => {
    if (!jetRef.current) return;
    const now = Date.now();
    const fireRate = 100 / (speedFactor * 0.4 + 0.6);
    if (now - lastFireTime.current < fireRate) return;
    
    lastFireTime.current = now;
    const pos = jetRef.current.position.clone();
    pos.z -= 1.0; 
    setBullets((prev) => [...prev, { id: Math.random().toString(), position: pos }]);
    
    // 사격 반동을 아주 미세하게 줄여 떨림을 방지 (0.35 -> 0.1)
    // 사격 시 camera shakeIntensity 추가 부분 제거 (매 발사마다 흔들리는 현상 방지)
    recoilZ.current = 0.1; 
  }, [speedFactor]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    timeScaleRef.current = MathUtils.lerp(timeScaleRef.current, 1.0, 0.15);
    const scaledDelta = delta * timeScaleRef.current;
    const difficulty = Math.min(state.clock.elapsedTime / 60, 5) * speedFactor;

    // 1. 카메라 쉐이크 최적화
    // 폭발이나 피격 시에만 흔들리도록 함
    if (shakeIntensity.current > 0.01) {
      camera.position.x = (Math.random() - 0.5) * shakeIntensity.current;
      camera.position.y = 2.5 + (Math.random() - 0.5) * shakeIntensity.current;
    } else {
      camera.position.x = 0;
      camera.position.y = 2.5;
      shakeIntensity.current = 0;
    }
    camera.position.z = 13;
    shakeIntensity.current = MathUtils.lerp(shakeIntensity.current, 0, 0.15);

    // 2. 비행기 조작
    if (jetRef.current && visualGroupRef.current) {
      const targetX = (pointer.x * viewport.width) / 2;
      const targetY = (pointer.y * viewport.height) / 2 + 1.2; 
      
      jetRef.current.position.x = MathUtils.lerp(jetRef.current.position.x, targetX, 0.85);
      jetRef.current.position.y = MathUtils.lerp(jetRef.current.position.y, targetY, 0.85);
      
      // 반동 연출 부드럽게
      visualGroupRef.current.position.z = MathUtils.lerp(visualGroupRef.current.position.z, recoilZ.current, 0.2);
      recoilZ.current = MathUtils.lerp(recoilZ.current, 0, 0.1);

      const dx = targetX - jetRef.current.position.x;
      const dy = targetY - jetRef.current.position.y;
      
      const targetRotZ = Math.abs(dx) > 0.01 ? -dx * 1.5 : 0;
      const targetRotX = Math.abs(dy) > 0.01 ? dy * 0.8 : 0;

      visualGroupRef.current.rotation.z = MathUtils.lerp(visualGroupRef.current.rotation.z, targetRotZ, 0.1);
      visualGroupRef.current.rotation.x = MathUtils.lerp(visualGroupRef.current.rotation.x, targetRotX, 0.1);

      const isInvulnerable = Date.now() - lastHitTime.current < 2000;
      jetRef.current.visible = isInvulnerable ? Math.floor(state.clock.elapsedTime * 10) % 2 === 0 : true;
    }

    const spawnInterval = Math.max((600 / speedFactor) - (difficulty * 120), 200);
    const now = Date.now();
    if (now - lastSpawnTime.current > spawnInterval) {
      spawnEnemy(difficulty);
      lastSpawnTime.current = now;
    }

    fire();

    setBullets((prev) => prev.map((b) => ({ ...b, position: b.position.clone().add(new Vector3(0, 0, -3.2 * timeScaleRef.current)) })).filter((b) => b.position.z > -90));
    setEnemies((prev) => prev.map((e) => ({ ...e, position: e.position.clone().add(new Vector3(0, 0, e.speed * timeScaleRef.current)) })).filter((e) => e.position.z < 30));
    setExplosions((prev) => prev.map(exp => ({ ...exp, life: exp.life - scaledDelta * (exp.isMega ? 1.5 : 2.5) })).filter(exp => exp.life > 0));

    setBullets((currentBullets) => {
      let filteredBullets = [...currentBullets];
      let hitEnemyIds: string[] = [];

      currentBullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          const hitRadius = enemy.type === 'GOLIATH' ? 3.8 : 2.4;
          if (bullet.position.distanceTo(enemy.position) < hitRadius) {
            hitEnemyIds.push(enemy.id);
            filteredBullets = filteredBullets.filter(b => b.id !== bullet.id);
            
            const isMega = enemy.type === 'GOLIATH' || enemy.type === 'GHOST';
            timeScaleRef.current = isMega ? 0.05 : 0.2; 
            shakeIntensity.current += isMega ? 2.5 : 0.5; 
            onScore(enemy.points);

            setExplosions(prev => [...prev, {
              id: Math.random().toString(),
              position: enemy.position.clone(),
              color: enemy.color,
              isMega,
              life: 1.0,
              particles: Array.from({ length: isMega ? 80 : 15 }).map(() => ({
                position: new Vector3(0, 0, 0),
                velocity: new Vector3(
                  (Math.random() - 0.5) * 12, 
                  (Math.random() - 0.5) * 12, 
                  (Math.random() - 0.5) * 12
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
          if (playerPos.distanceTo(enemy.position) < 1.8) {
            onHit();
            lastHitTime.current = Date.now();
            shakeIntensity.current = 2.0;
            setEnemies(prev => prev.filter(e => e.id !== enemy.id));
          }
        });
      }
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#00ffff" />
      <Environment speedFactor={speedFactor * timeScaleRef.current} />
      {status === GameStatus.PLAYING && (
        <>
          <group ref={jetRef}>
            <group ref={visualGroupRef}>
              <Jet />
            </group>
          </group>
          <BulletManager bullets={bullets} />
          <EnemyManager enemies={enemies} />
          <ExplosionManager explosions={explosions} />
        </>
      )}
    </>
  );
};

export default GameScene;

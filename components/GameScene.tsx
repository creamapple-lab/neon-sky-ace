
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
  onScore: () => void;
}

const GameScene: React.FC<GameSceneProps> = ({ status, onGameOver, onScore }) => {
  const { mouse, viewport } = useThree();
  const jetRef = useRef<Group>(null);
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  
  const lastFireTime = useRef(0);
  const lastSpawnTime = useRef(0);

  const fire = useCallback(() => {
    if (!jetRef.current) return;
    const now = Date.now();
    if (now - lastFireTime.current < 150) return;
    
    lastFireTime.current = now;
    const pos = jetRef.current.position.clone();
    pos.z -= 1.5;
    
    setBullets((prev) => [
      ...prev,
      { id: Math.random().toString(), position: pos }
    ]);
  }, []);

  const spawnEnemy = useCallback(() => {
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 10 + 3;
    const z = -50;
    
    setEnemies((prev) => [
      ...prev,
      { id: Math.random().toString(), position: new Vector3(x, y, z), speed: 0.2 + Math.random() * 0.3 }
    ]);
  }, []);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) {
      // Clear game objects if not playing
      if (bullets.length > 0) setBullets([]);
      if (enemies.length > 0) setEnemies([]);
      return;
    }

    // Jet movement
    if (jetRef.current) {
      const targetX = (mouse.x * viewport.width) / 2;
      const targetY = (mouse.y * viewport.height) / 2 + 2;
      
      jetRef.current.position.x = MathUtils.lerp(jetRef.current.position.x, targetX, 0.1);
      jetRef.current.position.y = MathUtils.lerp(jetRef.current.position.y, targetY, 0.1);
      
      // Banking
      const tilt = -(jetRef.current.position.x - targetX) * 0.5;
      jetRef.current.rotation.z = MathUtils.lerp(jetRef.current.rotation.z, tilt, 0.1);
      jetRef.current.rotation.x = MathUtils.lerp(jetRef.current.rotation.x, (jetRef.current.position.y - targetY) * 0.2, 0.1);
    }

    // Auto spawn enemies
    const now = Date.now();
    if (now - lastSpawnTime.current > 1000) {
      spawnEnemy();
      lastSpawnTime.current = now;
    }

    // Auto fire when clicking or held
    if (state.mouse.buttons === 1 || true) { // Set to true for auto-fire behavior
       fire();
    }

    // Update bullets
    setBullets((prev) => {
      const next = prev
        .map((b) => ({ ...b, position: b.position.clone().add(new Vector3(0, 0, -1.2)) }))
        .filter((b) => b.position.z > -60);
      return next;
    });

    // Update enemies
    setEnemies((prev) => {
      const next = prev
        .map((e) => ({ ...e, position: e.position.clone().add(new Vector3(0, 0, e.speed)) }))
        .filter((e) => e.position.z < 15);
      return next;
    });

    // Update explosions
    setExplosions((prev) => prev
      .map(exp => ({ ...exp, life: exp.life - delta }))
      .filter(exp => exp.life > 0)
    );

    // Collision detection: Bullets vs Enemies
    setBullets((currentBullets) => {
      let filteredBullets = [...currentBullets];
      let hitEnemyIds: string[] = [];

      currentBullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          if (bullet.position.distanceTo(enemy.position) < 1.5) {
            hitEnemyIds.push(enemy.id);
            filteredBullets = filteredBullets.filter(b => b.id !== bullet.id);
            
            // Create explosion
            const newExplosion: Explosion = {
              id: Math.random().toString(),
              position: enemy.position.clone(),
              life: 1.0,
              particles: Array.from({ length: 8 }).map(() => ({
                position: new Vector3(0, 0, 0),
                velocity: new Vector3(
                  (Math.random() - 0.5) * 5,
                  (Math.random() - 0.5) * 5,
                  (Math.random() - 0.5) * 5
                )
              }))
            };
            setExplosions(prev => [...prev, newExplosion]);
            onScore();
          }
        });
      });

      if (hitEnemyIds.length > 0) {
        setEnemies(prev => prev.filter(e => !hitEnemyIds.includes(e.id)));
      }

      return filteredBullets;
    });

    // Collision detection: Player vs Enemies
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
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      
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

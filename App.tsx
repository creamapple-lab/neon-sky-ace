
/**
 * Project: Neon Sky Ace | Created by Jay | AI City Builders & Connect AI LAB
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import GameScene from './components/GameScene';
import HUD from './components/HUD';
import { GameStatus } from './types';

export default function App() {
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [speedFactor, setSpeedFactor] = useState(0.85);

  useEffect(() => {
    const saved = localStorage.getItem('neon-sky-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
    
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener('touchmove', preventDefault, { passive: false });
    return () => document.removeEventListener('touchmove', preventDefault);
  }, []);

  const startGame = useCallback((factor: number) => {
    setSpeedFactor(factor);
    setScore(0);
    setLives(3);
    setStatus(GameStatus.PLAYING);
  }, []);

  const handleHit = useCallback(() => {
    setLives((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setStatus(GameStatus.GAMEOVER);
        return 0;
      }
      return next;
    });
  }, []);

  const incrementScore = useCallback((amount: number = 100) => {
    setScore((prev) => {
      const newScore = prev + amount;
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('neon-sky-high-score', newScore.toString());
      }
      return newScore;
    });
  }, [highScore]);

  return (
    <div className="relative w-full h-[100dvh] bg-black overflow-hidden touch-none">
      <Canvas
        shadows
        camera={{ position: [0, 2, 12], fov: 60 }}
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          alpha: false 
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050010']} />
        <fog attach="fog" args={['#200040', 10, 50]} />
        
        <GameScene 
          status={status} 
          speedFactor={speedFactor}
          onHit={handleHit} 
          onScore={incrementScore} 
        />

        <EffectComposer multisampling={0}>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={1.0} 
            radius={0.3} 
          />
          <Noise opacity={0.03} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      <HUD 
        score={score} 
        status={status} 
        lives={lives}
        onStart={startGame} 
        highScore={highScore}
      />
      
      <footer className="absolute bottom-4 w-full text-center pointer-events-none z-10">
        <p className="text-cyan-500/40 text-[8px] sm:text-[10px] tracking-[0.3em] font-mono uppercase">
          © AI CITY BUILDERS & CONNECT AI LAB BY JAY
        </p>
      </footer>
    </div>
  );
}

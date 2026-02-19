
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

  // 로컬 스토리지에서 하이 스코어 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('neon-sky-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const startGame = useCallback(() => {
    setScore(0);
    setStatus(GameStatus.PLAYING);
  }, []);

  const gameOver = useCallback(() => {
    setStatus(GameStatus.GAMEOVER);
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
    <div className="relative w-full h-screen bg-black overflow-hidden touch-none">
      <Canvas
        shadows
        camera={{ position: [0, 2, 12], fov: 60 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#050010']} />
        <fog attach="fog" args={['#200040', 10, 50]} />
        
        <GameScene 
          status={status} 
          onGameOver={gameOver} 
          onScore={incrementScore} 
        />

        {/* Removed disableNormalPass as it is not supported on the EffectComposer component in this version */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4} 
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>

      <HUD 
        score={score} 
        status={status} 
        onStart={startGame} 
        highScore={highScore}
      />
      
      <footer className="absolute bottom-4 w-full text-center pointer-events-none z-10">
        <p className="text-cyan-500/40 text-[10px] tracking-[0.3em] font-mono uppercase">
          © AI CITY BUILDERS & CONNECT AI LAB BY JAY
        </p>
      </footer>
    </div>
  );
}


import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import GameScene from './components/GameScene';
import HUD from './components/HUD';
import { GameStatus } from './types';

/* 
Project: Neon Sky Ace | Created by Jay | AI City Builders & Connect AI LAB 
*/

export default function App() {
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [highScore, setHighScore] = useState(0);

  const startGame = useCallback(() => {
    setScore(0);
    setStatus(GameStatus.PLAYING);
  }, []);

  const gameOver = useCallback(() => {
    setStatus(GameStatus.GAMEOVER);
  }, []);

  const incrementScore = useCallback(() => {
    setScore((prev) => {
      const newScore = prev + 100;
      if (newScore > highScore) setHighScore(newScore);
      return newScore;
    });
  }, [highScore]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        shadows
        gl={{ antialias: false }}
      >
        <color attach="background" args={['#050010']} />
        <fog attach="fog" args={['#200040', 5, 45]} />
        
        <GameScene 
          status={status} 
          onGameOver={gameOver} 
          onScore={incrementScore} 
        />

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.4} />
        </EffectComposer>
      </Canvas>

      <HUD 
        score={score} 
        status={status} 
        onStart={startGame} 
        highScore={highScore}
      />
      
      <footer className="absolute bottom-4 w-full text-center pointer-events-none">
        <p className="text-cyan-500/40 text-[10px] tracking-[0.2em] font-mono">
          © AI CITY BUILDERS & CONNECT AI LAB BY JAY
        </p>
      </footer>
    </div>
  );
}

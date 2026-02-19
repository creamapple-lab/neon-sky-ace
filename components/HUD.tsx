
import React from 'react';
import { GameStatus } from '../types';

interface HUDProps {
  score: number;
  highScore: number;
  status: GameStatus;
  onStart: () => void;
}

const HUD: React.FC<HUDProps> = ({ score, highScore, status, onStart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/50 p-4 rounded-lg">
          <p className="text-cyan-400 text-xs tracking-widest font-bold">SCORE</p>
          <p className="text-white text-3xl font-mono">{score.toString().padStart(6, '0')}</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-pink-500/50 p-4 rounded-lg text-right">
          <p className="text-pink-400 text-xs tracking-widest font-bold">HIGH SCORE</p>
          <p className="text-white text-3xl font-mono">{highScore.toString().padStart(6, '0')}</p>
        </div>
      </div>

      {/* Overlays */}
      {status === GameStatus.START && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60">
          <div className="text-center space-y-6">
            <h1 className="text-7xl font-bold text-white tracking-tighter italic">
              NEON <span className="text-cyan-400">SKY</span> <span className="text-pink-500">ACE</span>
            </h1>
            <p className="text-cyan-200/60 font-mono">STEER WITH MOUSE • ELIMINATE RED THREATS</p>
            <button 
              onClick={onStart}
              className="px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.6)]"
            >
              LAUNCH MISSION
            </button>
          </div>
        </div>
      )}

      {status === GameStatus.GAMEOVER && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-red-900/40 backdrop-blur-sm">
          <div className="text-center space-y-6 bg-black/80 p-12 border-2 border-red-500 rounded-2xl shadow-2xl">
            <h1 className="text-6xl font-bold text-red-500 tracking-tighter">CRITICAL FAILURE</h1>
            <div className="space-y-2">
              <p className="text-white text-lg">FINAL SCORE: <span className="text-red-400 font-mono">{score}</span></p>
            </div>
            <button 
              onClick={onStart}
              className="px-12 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xl rounded-full transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.6)]"
            >
              REDEPLOY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;

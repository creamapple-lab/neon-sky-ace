
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
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="relative group">
          <div className="absolute -inset-1 bg-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-black/60 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-lg">
            <p className="text-cyan-400 text-[10px] tracking-[0.2em] font-bold uppercase opacity-70">Current Score</p>
            <p className="text-white text-4xl font-mono leading-none mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {score.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="relative group text-right">
          <div className="absolute -inset-1 bg-pink-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-black/60 backdrop-blur-xl border border-pink-500/30 px-6 py-3 rounded-lg">
            <p className="text-pink-400 text-[10px] tracking-[0.2em] font-bold uppercase opacity-70">Best Record</p>
            <p className="text-white text-4xl font-mono leading-none mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {highScore.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {status === GameStatus.START && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-[2px]">
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <h1 className="text-7xl sm:text-9xl font-bold text-white tracking-tighter italic leading-none">
                NEON<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">SKY ACE</span>
              </h1>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-white to-pink-500 shadow-[0_0_15px_#fff]"></div>
            </div>
            <p className="text-cyan-200/80 font-mono tracking-widest text-sm uppercase">
              Move to steer • Auto-fire engaged • Survive the red zone
            </p>
            <button 
              onClick={onStart}
              className="group relative px-16 py-5 bg-transparent overflow-hidden rounded-full border-2 border-cyan-400 transition-all hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative text-cyan-400 group-hover:text-white font-bold text-2xl tracking-[0.2em]">INITIATE MISSION</span>
            </button>
          </div>
        </div>
      )}

      {status === GameStatus.GAMEOVER && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-red-950/60 backdrop-blur-md">
          <div className="text-center space-y-8 bg-black/90 p-16 border-2 border-red-500/50 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-in slide-in-from-bottom-10 duration-500">
            <h2 className="text-6xl font-bold text-red-500 tracking-tighter uppercase italic">Mission Terminated</h2>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            <div className="space-y-4">
              <p className="text-white/60 text-sm tracking-widest uppercase">Combat Performance</p>
              <p className="text-white text-6xl font-mono">{score.toLocaleString()}</p>
            </div>
            <button 
              onClick={onStart}
              className="w-full px-12 py-5 bg-red-600 hover:bg-red-500 text-white font-bold text-xl rounded-xl transition-all shadow-[0_10px_30px_rgba(220,38,38,0.4)]"
            >
              REDEPLOY ACE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;

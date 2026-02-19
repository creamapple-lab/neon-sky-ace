
import React from 'react';
import { GameStatus } from '../types';

interface HUDProps {
  score: number;
  highScore: number;
  lives: number;
  status: GameStatus;
  onStart: (speed: number) => void;
}

const HUD: React.FC<HUDProps> = ({ score, highScore, lives, status, onStart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="relative group">
          <div className="absolute -inset-1 bg-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-black/60 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-lg">
            <p className="text-cyan-400 text-[10px] tracking-[0.2em] font-bold uppercase opacity-70">Combat Score</p>
            <p className="text-white text-4xl font-mono leading-none mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {score.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="relative group text-right">
          <div className="absolute -inset-1 bg-pink-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-black/60 backdrop-blur-xl border border-pink-500/30 px-6 py-3 rounded-lg">
            <p className="text-pink-400 text-[10px] tracking-[0.2em] font-bold uppercase opacity-70">World Record</p>
            <p className="text-white text-4xl font-mono leading-none mt-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              {highScore.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Left HUD: Lives */}
      <div className="flex items-end mb-12">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex gap-3 items-center">
          <span className="text-[10px] text-white/50 tracking-widest uppercase font-bold mr-2">Armor</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-sm rotate-45 transition-all duration-300 shadow-[0_0_10px_currentColor] ${
                i < lives ? 'bg-cyan-400 text-cyan-400 scale-100' : 'bg-white/10 text-transparent scale-75 opacity-20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Overlays */}
      {status === GameStatus.START && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm">
          <div className="text-center space-y-10 animate-in fade-in zoom-in duration-500 px-4">
            <div className="relative inline-block">
              <h1 className="text-6xl sm:text-9xl font-bold text-white tracking-tighter italic leading-none">
                NEON<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">SKY ACE</span>
              </h1>
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-white to-pink-500 shadow-[0_0_15px_#fff]"></div>
            </div>
            
            <div className="space-y-6 max-w-md mx-auto">
              <p className="text-cyan-200/80 font-mono tracking-widest text-sm uppercase">
                Select Difficulty Level
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                  onClick={() => onStart(0.65)}
                  className="group relative px-4 py-3 bg-cyan-950/20 border border-cyan-500/50 rounded-lg hover:bg-cyan-500 hover:text-white transition-all overflow-hidden"
                >
                  <span className="relative z-10 font-bold text-sm tracking-widest text-cyan-400 group-hover:text-white">RECRUIT</span>
                </button>
                
                <button 
                  onClick={() => onStart(1.0)}
                  className="group relative px-4 py-3 bg-purple-950/20 border border-purple-500/50 rounded-lg hover:bg-purple-500 hover:text-white transition-all overflow-hidden"
                >
                  <span className="relative z-10 font-bold text-sm tracking-widest text-purple-400 group-hover:text-white">PILOT</span>
                </button>
                
                <button 
                  onClick={() => onStart(1.4)}
                  className="group relative px-4 py-3 bg-pink-950/20 border border-pink-500/50 rounded-lg hover:bg-pink-500 hover:text-white transition-all overflow-hidden"
                >
                  <span className="relative z-10 font-bold text-sm tracking-widest text-pink-400 group-hover:text-white">ACE</span>
                </button>
              </div>
            </div>

            <p className="text-white/40 font-mono text-[10px] tracking-widest uppercase">
              3 Armor Plating Units • Triple Threat System
            </p>
          </div>
        </div>
      )}

      {status === GameStatus.GAMEOVER && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-red-950/80 backdrop-blur-md">
          <div className="text-center space-y-8 bg-black/90 p-10 sm:p-16 border-2 border-red-500/50 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.3)] animate-in slide-in-from-bottom-10 duration-500 max-w-sm w-full mx-4">
            <h2 className="text-4xl sm:text-6xl font-bold text-red-500 tracking-tighter uppercase italic">Terminated</h2>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            <div className="space-y-2">
              <p className="text-white/60 text-[10px] tracking-widest uppercase">Final Combat Score</p>
              <p className="text-white text-5xl font-mono">{score.toLocaleString()}</p>
            </div>
            
            <div className="pt-4">
               <button 
                onClick={() => onStart(1.0)}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all uppercase tracking-[0.2em] shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)]"
              >
                Redeploy
              </button>
              <p className="text-white/30 text-[9px] mt-4 uppercase tracking-widest">Lives Reset to 3</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HUD;

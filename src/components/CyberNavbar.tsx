import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  Bot, 
  Bookmark, 
  Lock, 
  Volume2, 
  VolumeX, 
  Terminal, 
  Activity, 
  ShieldCheck,
  Minimize2,
  Maximize2,
  Layers
} from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

interface CyberNavbarProps {
  currentTab: 'omni' | 'companion' | 'vault';
  onChangeTab: (tab: 'omni' | 'companion' | 'vault') => void;
  onLockSystem: () => void;
  savedIdeasCount: number;
  soundMuted: boolean;
  onToggleSound: () => void;
  isMiniHudActive: boolean;
  onToggleMiniHud: () => void;
}

export const CyberNavbar: React.FC<CyberNavbarProps> = ({
  currentTab,
  onChangeTab,
  onLockSystem,
  savedIdeasCount,
  soundMuted,
  onToggleSound,
  isMiniHudActive,
  onToggleMiniHud,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour12: false }));
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-20 w-full bg-[#03060c]/90 border-b border-cyan-500/30 backdrop-blur-xl px-4 py-3 selection:bg-cyan-500 selection:text-black">
      {/* Top telemetry neon line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee]" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & System Status */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-cyan-950 border border-cyan-400 clip-chamfer-sm flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.5)]">
              <span className="font-cyber text-sm font-bold text-cyan-300">Ψ</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-cyber text-sm md:text-base font-bold text-white tracking-widest text-glow-cyan">
                  SYNAPSE // OMNI-HUD
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <p className="font-terminal text-[10px] text-cyan-400/70 tracking-wider">
                SYS.V4 // NEURAL PROTOCOL CONNECTED
              </p>
            </div>
          </div>

          {/* Telemetry Clock (Mobile inline) */}
          <div className="md:hidden font-terminal text-[11px] text-cyan-300/80">
            {currentTime}
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-black/60 p-1 border border-cyan-500/30 clip-chamfer-sm">
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onChangeTab('omni');
            }}
            className={`px-3.5 py-1.5 font-cyber text-xs flex items-center space-x-1.5 transition-all ${
              currentTab === 'omni'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_#22d3ee]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>OMNI-LENS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onChangeTab('companion');
            }}
            className={`px-3.5 py-1.5 font-cyber text-xs flex items-center space-x-1.5 transition-all ${
              currentTab === 'companion'
                ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_#22d3ee]'
                : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>COMPANION</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onChangeTab('vault');
            }}
            className={`px-3.5 py-1.5 font-cyber text-xs flex items-center space-x-1.5 transition-all relative ${
              currentTab === 'vault'
                ? 'bg-amber-400 text-black font-bold shadow-[0_0_12px_#fbbf24]'
                : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>PROJECT VAULT</span>
            {savedIdeasCount > 0 && (
              <span className="ml-1 text-[10px] bg-amber-950 text-amber-300 border border-amber-400/50 px-1 py-0.2 rounded">
                {savedIdeasCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Telemetry & System Utilities */}
        <div className="flex items-center space-x-3">
          {/* Desktop Time Telemetry */}
          <div className="hidden lg:flex flex-col text-right font-terminal text-[11px] text-cyan-300/80 leading-tight">
            <span>LOC: {currentTime}</span>
            <span className="text-cyan-500/60">{utcTime}</span>
          </div>

          {/* Mini-HUD stay on screen toggle */}
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              onToggleMiniHud();
            }}
            className={`p-1.5 clip-chamfer-sm border transition-all ${
              isMiniHudActive
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_10px_#22d3ee]'
                : 'bg-black/60 border-cyan-500/30 text-cyan-300 hover:text-white'
            }`}
            title="Toggle Floating Always-There Companion Mini-Widget"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1.5 clip-chamfer-sm border transition-all ${
              soundMuted
                ? 'bg-black/60 border-slate-700 text-slate-500'
                : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
            }`}
            title={soundMuted ? 'Unmute Cyber Sound FX' : 'Mute Cyber Sound FX'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Lock System Gate Button */}
          <button
            type="button"
            onClick={() => {
              cyberAudio.playLock();
              onLockSystem();
            }}
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-rose-300 hover:text-white font-cyber text-xs clip-chamfer-sm flex items-center space-x-1.5 transition-all shadow-[0_0_10px_rgba(244,63,94,0.2)]"
            title="Lock AI System (Requires Password to Re-enter)"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">LOCK RIG</span>
          </button>
        </div>
      </div>
    </header>
  );
};

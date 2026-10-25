import React, { useState } from 'react';
import { Bot, Send, Volume2, Maximize2, X, Sparkles, MessageSquare, Zap } from 'lucide-react';
import { CyberCoreVisualizer } from './CyberCoreVisualizer';
import { cyberAudio } from '../utils/cyberAudio';

interface FloatingCompanionWidgetProps {
  onExpandToFull: () => void;
  onCloseMini: () => void;
  activeProjectContext: string;
  selectedVoice: string;
  voiceEnabled: boolean;
}

export const FloatingCompanionWidget: React.FC<FloatingCompanionWidgetProps> = ({
  onExpandToFull,
  onCloseMini,
  activeProjectContext,
  selectedVoice,
  voiceEnabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [bubbleText, setBubbleText] = useState("I'm right here with you! Let me know if you need ideas or quick answers.");

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim() || isThinking) return;

    const query = quickInput;
    setQuickInput('');
    setIsThinking(true);
    cyberAudio.playScannerSweep();

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          mode: 'companion_chat',
          companionPersona: 'friend',
          userProjectContext: activeProjectContext,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setBubbleText(data.text.slice(0, 220) + (data.text.length > 220 ? '...' : ''));
        cyberAudio.playAccessGranted();

        if (voiceEnabled) {
          fetch('/api/gemini/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.text.slice(0, 150), voiceName: selectedVoice }),
          })
            .then((res) => res.json())
            .then((audioData) => {
              if (audioData.audio) {
                new Audio(`data:audio/wav;base64,${audioData.audio}`).play().catch(() => {});
              }
            })
            .catch(() => {});
        }
      }
    } catch {
      cyberAudio.playAccessDenied();
      setBubbleText("Lost neural sync for a second, but I'm still by your side!");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end selection:bg-cyan-500 selection:text-black">
      {/* Speech / Chat popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#060c18]/95 border border-cyan-500/50 clip-chamfer-md shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span className="font-cyber text-xs font-bold text-white tracking-wider">
                SYNAPSE COMPANION HUD
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => {
                  cyberAudio.playHudSummon();
                  onExpandToFull();
                }}
                className="p-1 text-cyan-400 hover:text-white"
                title="Expand to Full Matrix Deck"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-rose-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Speech bubble */}
          <div className="p-3 bg-black/70 border border-cyan-500/30 clip-chamfer-sm text-xs font-tech text-slate-200 mb-3 leading-relaxed max-h-36 overflow-y-auto">
            {bubbleText}
          </div>

          {/* Quick Query Input */}
          <form onSubmit={handleQuickSend} className="flex space-x-1.5">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask anything or bounce an idea..."
              className="flex-1 bg-black/80 border border-cyan-500/40 px-2.5 py-1.5 text-xs font-tech text-white focus:outline-none focus:border-cyan-400 clip-chamfer-sm"
            />
            <button
              type="submit"
              disabled={isThinking || !quickInput.trim()}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-cyber text-xs font-bold clip-chamfer-sm shadow-[0_0_10px_#22d3ee] disabled:opacity-50"
            >
              {isThinking ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}

      {/* Floating Orb Pill */}
      <div className="flex items-center space-x-2 bg-[#050b16]/90 border border-cyan-400/60 p-1.5 pl-2.5 clip-chamfer-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-xl">
        <div
          onClick={() => {
            cyberAudio.playHudSummon();
            setIsOpen(!isOpen);
          }}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <CyberCoreVisualizer
            state={isThinking ? 'thinking' : 'idle'}
            size={42}
          />
          <div className="pr-1">
            <span className="block font-cyber text-[11px] font-bold text-white group-hover:text-cyan-300 transition-colors">
              SYNAPSE AI
            </span>
            <span className="block font-terminal text-[9px] text-emerald-400">
              ALWAYS WITH YOU
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            cyberAudio.playHudSummon();
            onExpandToFull();
          }}
          className="p-1.5 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white clip-chamfer-sm"
          title="Open Full Workspace"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            cyberAudio.playKeyClick();
            onCloseMini();
          }}
          className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400"
          title="Hide Floating Widget"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

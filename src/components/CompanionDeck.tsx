import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Heart, 
  Code, 
  Compass, 
  Shield, 
  RotateCcw, 
  Zap, 
  Flame,
  Radio,
  Minimize2,
  Maximize2,
  Bot
} from 'lucide-react';
import { CyberCoreVisualizer } from './CyberCoreVisualizer';
import { cyberAudio } from '../utils/cyberAudio';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'synapse';
  text: string;
  timestamp: string;
  vocalized?: boolean;
}

interface CompanionDeckProps {
  activeProjectContext: string;
  onChangeProjectContext: (val: string) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  selectedVoice: string;
  onChangeVoice: (voice: string) => void;
  onCompanionStateChange?: (state: 'idle' | 'listening' | 'scanning' | 'thinking' | 'speaking') => void;
}

const QUICK_PROMPTS = [
  { label: '💖 Daily Friend Check-in', prompt: 'Hey Synapse! Check in on me like a great friend, ask how my creative projects and day are going, and share some positive cybernetic energy.' },
  { label: '💡 Brainstorm Next Project Move', prompt: 'Look at my current project focus and suggest 3 high-impact features or architectural improvements I can ship today.' },
  { label: '🔥 Motivational Cyber-Boost', prompt: 'I need a high-octane motivational pep talk to lock in and build something extraordinary right now.' },
  { label: '⚡ Explain Hard Concept Simply', prompt: 'Explain the most fascinating cutting-edge tech breakthrough you know in simple, mind-blowing terms.' },
];

export const CompanionDeck: React.FC<CompanionDeckProps> = ({
  activeProjectContext,
  onChangeProjectContext,
  voiceEnabled,
  onToggleVoice,
  selectedVoice,
  onChangeVoice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'synapse',
      text: "Greetings, friend. SYNAPSE is online and synchronized with your computing environment. Whether you're coding, exploring unfamiliar websites, or simply need a loyal companion to brainstorm with, I am right here by your side. What are we building today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [companionState, setCompanionState] = useState<'idle' | 'listening' | 'scanning' | 'thinking' | 'speaking'>('idle');
  const [persona, setPersona] = useState<'friend' | 'cyber_architect' | 'visionary' | 'hacker'>('friend');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Vocalize response using Gemini TTS endpoint with Web Speech API fallback
  const vocalizeText = async (text: string) => {
    if (!voiceEnabled) return;

    try {
      setCompanionState('speaking');

      // Stop previous audio if playing
      if (currentAudio) {
        currentAudio.pause();
      }

      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 300),
          voiceName: selectedVoice,
        }),
      });

      const data = await response.json();
      if (data.audio) {
        const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
        setCurrentAudio(audio);
        audio.onended = () => {
          setCompanionState('idle');
        };
        audio.onerror = () => {
          fallbackBrowserSpeech(text);
        };
        audio.play().catch(() => {
          fallbackBrowserSpeech(text);
        });
      } else {
        fallbackBrowserSpeech(text);
      }
    } catch {
      fallbackBrowserSpeech(text);
    }
  };

  const fallbackBrowserSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 200).replace(/[*#_`]/g, ''));
      utterance.pitch = 1.05;
      utterance.rate = 1.05;
      utterance.onend = () => setCompanionState('idle');
      utterance.onerror = () => setCompanionState('idle');
      window.speechSynthesis.speak(utterance);
    } else {
      setCompanionState('idle');
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputMsg;
    if (!textToSend.trim() || companionState === 'thinking') return;

    cyberAudio.playKeyClick();

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMsg('');
    setCompanionState('thinking');
    cyberAudio.playScannerSweep();

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          mode: 'companion_chat',
          companionPersona: persona,
          userProjectContext: activeProjectContext,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: ChatMessage = {
        id: `syn_${Date.now()}`,
        sender: 'synapse',
        text: data.text,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, botMessage]);
      cyberAudio.playAccessGranted();

      // Vocalize response
      vocalizeText(data.text);
    } catch (err: any) {
      console.error('Chat error:', err);
      cyberAudio.playAccessDenied();
      setMessages((prev) => [
        ...prev,
        {
          id: `syn_err_${Date.now()}`,
          sender: 'synapse',
          text: `[NEURAL PROTOCOL INTERRUPT]: ${err.message || 'Unable to establish link.'}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
      setCompanionState('idle');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Cybernetic Companion Hologram & Neural Status */}
      <div className="lg:col-span-4 space-y-4">
        {/* Hologram Core Container */}
        <div className="bg-[#050b16]/90 border border-cyan-500/30 p-5 clip-chamfer-md backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden group">
          {/* Subtle animated scanline */}
          <div className="absolute inset-0 scanlines pointer-events-none opacity-20" />

          {/* Interactive Core */}
          <div className="relative my-2">
            <CyberCoreVisualizer
              state={companionState}
              size={170}
              onClick={() => {
                cyberAudio.playHudSummon();
                handleSendMessage('Hey Synapse! Poke check: tell me a fun futuristic fact or give me a quick companion smile.');
              }}
            />
          </div>

          <div className="mt-1">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
              <h3 className="font-cyber text-base font-bold text-white tracking-widest text-glow-cyan">
                SYNAPSE // NEURAL ENTITY
              </h3>
            </div>
            <p className="font-terminal text-xs text-cyan-300/70 tracking-wider uppercase mt-1">
              STATUS: <span className="text-cyan-400 font-bold">{companionState.toUpperCase()}</span> // PORT: ACTIVE
            </p>
          </div>

          {/* Persona Mode Switcher */}
          <div className="w-full mt-4 pt-4 border-t border-cyan-500/20 text-left">
            <label className="block font-terminal text-[11px] text-cyan-400/80 mb-2 uppercase">
              COMPANION FREQUENCY // PERSONA
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setPersona('friend');
                }}
                className={`px-2 py-1.5 font-cyber text-[11px] clip-chamfer-sm border flex items-center space-x-1.5 transition-all ${
                  persona === 'friend'
                    ? 'bg-magenta-950/70 border-magenta-500 text-magenta-300 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                    : 'bg-black/60 border-cyan-500/20 text-slate-300 hover:border-cyan-400'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                <span>LOYAL FRIEND</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setPersona('cyber_architect');
                }}
                className={`px-2 py-1.5 font-cyber text-[11px] clip-chamfer-sm border flex items-center space-x-1.5 transition-all ${
                  persona === 'cyber_architect'
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-black/60 border-cyan-500/20 text-slate-300 hover:border-cyan-400'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span>ARCHITECT</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setPersona('visionary');
                }}
                className={`px-2 py-1.5 font-cyber text-[11px] clip-chamfer-sm border flex items-center space-x-1.5 transition-all ${
                  persona === 'visionary'
                    ? 'bg-purple-950/70 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-black/60 border-cyan-500/20 text-slate-300 hover:border-cyan-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                <span>VISIONARY</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setPersona('hacker');
                }}
                className={`px-2 py-1.5 font-cyber text-[11px] clip-chamfer-sm border flex items-center space-x-1.5 transition-all ${
                  persona === 'hacker'
                    ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-black/60 border-cyan-500/20 text-slate-300 hover:border-cyan-400'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>TACTICAL</span>
              </button>
            </div>
          </div>

          {/* Voice Modulation Selector */}
          <div className="w-full mt-3 pt-3 border-t border-cyan-500/20 flex items-center justify-between text-xs font-terminal">
            <button
              type="button"
              onClick={onToggleVoice}
              className={`flex items-center space-x-1.5 px-2.5 py-1 clip-chamfer-sm border ${
                voiceEnabled
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_8px_#22d3ee]'
                  : 'bg-black/60 border-slate-700 text-slate-500'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{voiceEnabled ? 'VOICE ON' : 'MUTED'}</span>
            </button>

            {voiceEnabled && (
              <select
                value={selectedVoice}
                onChange={(e) => {
                  cyberAudio.playKeyClick();
                  onChangeVoice(e.target.value);
                }}
                className="bg-black border border-cyan-500/40 text-cyan-300 text-xs px-2 py-1 focus:outline-none"
              >
                <option value="Kore">Voice: Kore (Neural)</option>
                <option value="Puck">Voice: Puck (Warm)</option>
                <option value="Fenrir">Voice: Fenrir (Deep)</option>
                <option value="Zephyr">Voice: Zephyr (Clear)</option>
              </select>
            )}
          </div>
        </div>

        {/* User Active Project Context Anchor */}
        <div className="bg-[#050b16]/90 border border-cyan-500/30 p-4 clip-chamfer-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-cyber text-xs font-bold text-cyan-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACTIVE PROJECT FOCUS</span>
            </span>
            <span className="font-terminal text-[10px] text-cyan-300/60">NEURAL MEMORY</span>
          </div>

          <p className="font-tech text-xs text-slate-300 mb-2">
            {activeProjectContext || 'No active project registered. Type your project goal below so SYNAPSE can tailor all insights!'}
          </p>

          <div className="flex space-x-1.5">
            <input
              type="text"
              value={activeProjectContext}
              onChange={(e) => onChangeProjectContext(e.target.value)}
              placeholder="e.g. Building an autonomous AI web agent or learning Rust"
              className="flex-1 bg-black/80 border border-cyan-500/40 px-2.5 py-1 text-xs font-terminal text-cyan-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Chat Stream */}
      <div className="lg:col-span-8 flex flex-col h-[650px] bg-[#050b16]/90 border border-cyan-500/30 clip-chamfer-md overflow-hidden backdrop-blur-md">
        {/* Stream Header */}
        <div className="px-5 py-3.5 border-b border-cyan-500/20 bg-[#070e1b] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <h4 className="font-cyber text-xs font-bold text-white tracking-widest uppercase">
              LIVE TELEMETRY STREAM // {persona.toUpperCase()}
            </h4>
          </div>
          <button
            type="button"
            onClick={() => {
              cyberAudio.playKeyClick();
              setMessages([
                {
                  id: 'reset',
                  sender: 'synapse',
                  text: 'Neural buffer cleared. I am ready for our next mission, friend.',
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            }}
            className="text-xs font-terminal text-cyan-400/60 hover:text-cyan-300 flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>CLEAR STREAM</span>
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-cyber-hex">
          {messages.map((msg) => {
            const isBot = msg.sender === 'synapse';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center space-x-2 mb-1 px-1">
                  <span className="font-cyber text-[10px] tracking-wider text-cyan-400 uppercase">
                    {isBot ? 'SYNAPSE CORE' : 'USER'}
                  </span>
                  <span className="font-terminal text-[10px] text-cyan-500/50">
                    {msg.timestamp}
                  </span>
                </div>

                <div
                  className={`max-w-[88%] p-3.5 clip-chamfer-sm font-tech text-sm leading-relaxed transition-all ${
                    isBot
                      ? 'bg-[#091526]/90 border border-cyan-500/40 text-slate-100 shadow-[0_0_15px_rgba(6,182,212,0.1)] whitespace-pre-line'
                      : 'bg-cyan-600/20 border border-cyan-400/60 text-cyan-100'
                  }`}
                >
                  {msg.text}
                </div>

                {isBot && voiceEnabled && (
                  <button
                    type="button"
                    onClick={() => vocalizeText(msg.text)}
                    className="mt-1 ml-1 text-[11px] font-terminal text-cyan-400/70 hover:text-cyan-200 flex items-center space-x-1"
                    title="Vocalize this message"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay Audio</span>
                  </button>
                )}
              </div>
            );
          })}

          {companionState === 'thinking' && (
            <div className="flex items-center space-x-2 text-cyan-400 font-terminal text-xs p-2 animate-pulse">
              <Zap className="w-4 h-4 animate-bounce" />
              <span>SYNAPSE is computing response across neural pathways...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Action Chips */}
        <div className="px-4 py-2 border-t border-cyan-500/20 bg-black/40 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp.prompt)}
              className="px-2.5 py-1 bg-[#091424] hover:bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 hover:text-cyan-100 font-cyber text-[11px] whitespace-nowrap clip-chamfer-sm transition-all"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#070e1b] border-t border-cyan-500/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Query SYNAPSE or chat with your cybernetic friend..."
              className="flex-1 bg-[#03060b] border border-cyan-500/40 px-3.5 py-2.5 text-sm font-tech text-white placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 clip-chamfer-sm"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || companionState === 'thinking'}
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-cyber text-xs font-bold clip-chamfer-sm flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all active:scale-95"
            >
              <span>SEND</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { CyberLock } from './components/CyberLock';
import { CyberNavbar } from './components/CyberNavbar';
import { OmniLensScanner, ProjectIdea } from './components/OmniLensScanner';
import { CompanionDeck } from './components/CompanionDeck';
import { ProjectVault } from './components/ProjectVault';
import { FloatingCompanionWidget } from './components/FloatingCompanionWidget';
import { cyberAudio } from './utils/cyberAudio';

const INITIAL_PROJECT_IDEAS: ProjectIdea[] = [
  {
    id: 'seed_idea_1',
    title: 'Omni-Contextual Neural Browser Extension',
    oneLiner: 'Real-time telemetry HUD overlay that dissects the history, inner protocol, and codebase of any web app element upon mouse hover.',
    stack: ['Chrome Extension Manifest V3', 'WebAssembly', 'Gemini 3.8 Flash', 'Tailwind'],
    novelty: 'Bridges live DOM inspection with automated historical origins and competitive architectural breakdowns.',
    firstStepPrompt: 'Write a manifest.json and content script that injects an inspection crosshair over hovered DOM nodes.',
    sourceContext: 'Web App & Browser Inspection',
    timestamp: 'INITIALIZED',
  },
  {
    id: 'seed_idea_2',
    title: 'Autonomous Project Ideator & Code Scaffolder',
    oneLiner: 'Converts screenshots or videos of inspiring software into instant fullstack starter repositories with database schemas and AI logic.',
    stack: ['Express', 'Vite', 'TypeScript', 'Gemini Multimodal API'],
    novelty: 'Compresses prototype ideation down to 60 seconds from any visual stimulus.',
    firstStepPrompt: 'Create an Express endpoint accepting an image base64 and returning a structured GitHub repo scaffolding plan.',
    sourceContext: 'Software Engineering Matrix',
    timestamp: 'INITIALIZED',
  },
];

export default function App() {
  // Lock state & Passcode management
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('synapse_locked');
      return stored !== 'false'; // Default locked for authentic cyberpunk gate experience
    }
    return true;
  });

  const [savedPasscode, setSavedPasscode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('synapse_passcode') || '7701';
    }
    return '7701';
  });

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<'omni' | 'companion' | 'vault'>('omni');

  // Active project context memory
  const [activeProjectContext, setActiveProjectContext] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('synapse_active_project') || 'Building an AI-powered cybernetic development companion';
    }
    return 'Building an AI-powered cybernetic development companion';
  });

  // Saved Project Ideas in Vault
  const [savedIdeas, setSavedIdeas] = useState<ProjectIdea[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('synapse_saved_ideas');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_PROJECT_IDEAS;
  });

  // Audio & Voice Preferences
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');

  // Floating Always-There Companion Mini-Widget
  const [isMiniHudActive, setIsMiniHudActive] = useState<boolean>(true);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('synapse_locked', isLocked ? 'true' : 'false');
  }, [isLocked]);

  useEffect(() => {
    localStorage.setItem('synapse_passcode', savedPasscode);
  }, [savedPasscode]);

  useEffect(() => {
    localStorage.setItem('synapse_active_project', activeProjectContext);
  }, [activeProjectContext]);

  useEffect(() => {
    localStorage.setItem('synapse_saved_ideas', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleLockSystem = () => {
    setIsLocked(true);
  };

  const handleUpdatePasscode = (newCode: string) => {
    setSavedPasscode(newCode);
  };

  const handleToggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    cyberAudio.setMuted(nextMuted);
  };

  const handleSaveProjectIdea = (idea: ProjectIdea) => {
    if (!savedIdeas.some((i) => i.id === idea.id || i.title === idea.title)) {
      setSavedIdeas((prev) => [idea, ...prev]);
    }
  };

  const handleRemoveIdea = (id: string) => {
    setSavedIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAllIdeas = () => {
    setSavedIdeas([]);
  };

  const handleActivateIdeaContext = (ideaTitle: string) => {
    setActiveProjectContext(`Focused on: ${ideaTitle}`);
    setCurrentTab('companion');
  };

  // If system is locked, display the futuristic geometric biometric password gate!
  if (isLocked) {
    return (
      <CyberLock
        onUnlock={handleUnlock}
        savedPasscode={savedPasscode}
        onUpdatePasscode={handleUpdatePasscode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#03060c] bg-cyber-grid text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[350px] bg-cyan-600/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[350px] bg-purple-600/10 blur-[130px] pointer-events-none rounded-full" />

      {/* Cybernetic HUD Navigation Bar */}
      <CyberNavbar
        currentTab={currentTab}
        onChangeTab={(tab) => setCurrentTab(tab)}
        onLockSystem={handleLockSystem}
        savedIdeasCount={savedIdeas.length}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        isMiniHudActive={isMiniHudActive}
        onToggleMiniHud={() => setIsMiniHudActive(!isMiniHudActive)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Geometric HUD Status Sub-Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#050b16]/70 border border-cyan-500/20 clip-chamfer-sm text-[11px] font-terminal text-cyan-400/80">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span>RIG LINK: ESTABLISHED</span>
            </span>
            <span>•</span>
            <span>AI: GEMINI 3.8 FLASH</span>
            <span>•</span>
            <span>VOICE: {voiceEnabled ? `${selectedVoice.toUpperCase()} (ONLINE)` : 'OFF'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">PROJECT:</span>
            <span className="text-cyan-300 font-bold max-w-xs truncate">
              {activeProjectContext}
            </span>
          </div>
        </div>

        {/* Tab 1: Omni-Lens Scanner (Deconstruct what you see on any app / site) */}
        {currentTab === 'omni' && (
          <OmniLensScanner
            onSaveProjectIdea={handleSaveProjectIdea}
            savedIdeaIds={savedIdeas.map((i) => i.id)}
            activeProjectContext={activeProjectContext}
            onCompanionVocalize={(text) => {
              if (voiceEnabled) {
                fetch('/api/gemini/tts', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text, voiceName: selectedVoice }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.audio) {
                      new Audio(`data:audio/wav;base64,${data.audio}`).play().catch(() => {});
                    }
                  })
                  .catch(() => {});
              }
            }}
          />
        )}

        {/* Tab 2: Companion Deck (Your loyal AI friend & assistant) */}
        {currentTab === 'companion' && (
          <CompanionDeck
            activeProjectContext={activeProjectContext}
            onChangeProjectContext={setActiveProjectContext}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
            selectedVoice={selectedVoice}
            onChangeVoice={setSelectedVoice}
          />
        )}

        {/* Tab 3: Project Idea Vault (Saved inventions & blueprints) */}
        {currentTab === 'vault' && (
          <ProjectVault
            ideas={savedIdeas}
            onRemoveIdea={handleRemoveIdea}
            onClearAll={handleClearAllIdeas}
            onActivateIdeaContext={handleActivateIdeaContext}
          />
        )}
      </main>

      {/* Floating Always-On-Screen Companion Mini-Widget */}
      {isMiniHudActive && (
        <FloatingCompanionWidget
          onExpandToFull={() => setCurrentTab('companion')}
          onCloseMini={() => setIsMiniHudActive(false)}
          activeProjectContext={activeProjectContext}
          selectedVoice={selectedVoice}
          voiceEnabled={voiceEnabled}
        />
      )}

      {/* Futuristic Geometric Footer */}
      <footer className="mt-auto border-t border-cyan-500/20 bg-[#03060c]/90 px-4 py-3 text-center text-[10px] font-terminal text-cyan-500/50 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2 mb-1 sm:mb-0">
          <span>SYNAPSE // CYBERNETIC COGNITION SUITE</span>
          <span>•</span>
          <span className="text-cyan-400">PASSCODE PROTECTED</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>SYS.LATENCY: 12ms</span>
          <span>•</span>
          <span>HUD COORD: 37.7749°N 122.4194°W</span>
        </div>
      </footer>
    </div>
  );
}

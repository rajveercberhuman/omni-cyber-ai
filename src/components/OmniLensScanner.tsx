import React, { useState, useRef } from 'react';
import { 
  Scan, 
  Monitor, 
  Upload, 
  Camera, 
  Sparkles, 
  History, 
  Layers, 
  Lightbulb, 
  Volume2, 
  BookmarkPlus, 
  Check, 
  Copy, 
  Search, 
  ExternalLink,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Cpu,
  Zap,
  Globe
} from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

export interface ProjectIdea {
  id: string;
  title: string;
  oneLiner: string;
  stack: string[];
  novelty: string;
  firstStepPrompt: string;
  sourceContext: string;
  timestamp: string;
}

interface OmniLensScannerProps {
  onSaveProjectIdea: (idea: ProjectIdea) => void;
  savedIdeaIds: string[];
  activeProjectContext?: string;
  onCompanionVocalize?: (text: string) => void;
}

// Preset real-world app & website contexts for instant inspection
const PRESET_INSPECTIONS = [
  {
    id: 'github_actions',
    name: 'GitHub CI/CD & Virtual Runners',
    category: 'Developer Tooling & Cloud',
    icon: '⚡',
    snippet: 'Automated workflow pipelines running inside ephemeral Azure Linux VM containers triggered via webhooks and Git commit refs.',
    sampleQuery: 'Inspect GitHub Actions workflows, ephemeral VM isolation, and secret management.',
    imageMock: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'figma_engine',
    name: 'Figma WebGL Canvas & Multiplayer CRDT',
    category: 'Design Systems & Graphics',
    icon: '🎨',
    snippet: 'In-browser vector rendering engine written in C++ compiled to WebAssembly with real-time multiplayer conflict-free replicated data types.',
    sampleQuery: 'Deconstruct Figma real-time multiplayer engine, WebAssembly C++ rendering loop, and vector networks.',
    imageMock: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'react_rsc',
    name: 'React Server Components & Streaming SSR',
    category: 'Web Frameworks & Protocols',
    icon: '⚛️',
    snippet: 'Zero-bundle-size server components streaming serialized virtual DOM payload over HTTP chunks into client hydration trees.',
    sampleQuery: 'Explain React Server Components flight protocol, streaming SSR, and suspense architecture.',
    imageMock: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'transformer_ai',
    name: 'Transformer Attention & Neural Weights',
    category: 'Artificial Intelligence & Math',
    icon: '🧠',
    snippet: 'Multi-head self-attention mechanisms computing Q-K-V dot-product compatibility matrices across high-dimensional embeddings.',
    sampleQuery: 'Deep dive into transformer attention mechanisms, rotary positional embeddings (RoPE), and KV-caching.',
    imageMock: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'solana_consensus',
    name: 'High-Throughput Proof-of-History Consensus',
    category: 'Decentralized Networks',
    icon: '🌐',
    snippet: 'Sequential hashing verifiable delay functions (VDF) providing cryptographic timestamping across distributed validator nodes.',
    sampleQuery: 'Deconstruct Proof of History, Gulf Stream mempool-less transaction forwarding, and Sealevel parallel smart contracts.',
    imageMock: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80',
  },
];

export const OmniLensScanner: React.FC<OmniLensScannerProps> = ({
  onSaveProjectIdea,
  savedIdeaIds,
  activeProjectContext,
  onCompanionVocalize,
}) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'presets' | 'url_text' | 'camera'>('screen');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [parsedIdeas, setParsedIdeas] = useState<ProjectIdea[]>([]);
  const [copiedIdeaId, setCopiedIdeaId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'history' | 'present' | 'ideas'>('all');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Capture screen / window / browser tab using getDisplayMedia
  const handleCaptureScreen = async () => {
    cyberAudio.playScannerSweep();
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert('Screen capture API is not supported in this browser context. Please use File Upload or Camera instead.');
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' } as any,
      });

      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setPreviewImage(dataUrl);
        cyberAudio.playAccessGranted();
      }

      // Stop tracks
      stream.getTracks().forEach((t) => t.stop());
    } catch (err: any) {
      console.warn('Screen capture cancelled or unavailable:', err);
    }
  };

  // Start Camera
  const handleStartCamera = async () => {
    cyberAudio.playScannerSweep();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Unable to access camera. Please check browser permissions.');
    }
  };

  // Capture frame from camera
  const handleSnapCamera = () => {
    if (!videoRef.current) return;
    cyberAudio.playKeyClick();
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviewImage(dataUrl);
      cyberAudio.playAccessGranted();
    }
    // Stop camera
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    cyberAudio.playKeyClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
        cyberAudio.playAccessGranted();
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Preset selection
  const handleSelectPreset = (preset: typeof PRESET_INSPECTIONS[0]) => {
    cyberAudio.playKeyClick();
    setPreviewImage(preset.imageMock);
    setCustomPrompt(preset.sampleQuery);
    runAnalysis(preset.sampleQuery, preset.imageMock, preset.name);
  };

  // Run Gemini Omni Analysis
  const runAnalysis = async (
    overridePrompt?: string,
    overrideImage?: string | null,
    contextTitle?: string
  ) => {
    const promptToSend =
      overridePrompt ||
      customPrompt ||
      (urlInput ? `Analyze this URL / app context: ${urlInput}` : 'Deconstruct this screen context completely: history, present state, and 4 high-impact project ideas for me.');

    const imageToSend = overrideImage !== undefined ? overrideImage : previewImage;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setParsedIdeas([]);
    cyberAudio.playScannerSweep();

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          imageBase64: imageToSend,
          mode: 'vision_deep_dive',
          userProjectContext: activeProjectContext,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data.text);
      cyberAudio.playAccessGranted();

      // Extract generated project ideas from markdown
      extractProjectIdeas(data.text, contextTitle || 'Screen Context');

      // Vocalize short summary through companion if requested
      if (onCompanionVocalize) {
        const firstSentence = data.text.split('\n').filter((l: string) => l.trim().length > 20)[0] || 'Analysis complete, neural scan indexed.';
        onCompanionVocalize(firstSentence.replace(/[*#_`]/g, '').slice(0, 200));
      }
    } catch (err: any) {
      console.error('Omni-Lens analysis error:', err);
      cyberAudio.playAccessDenied();
      setAnalysisResult(`[SYSTEM FAULT] ${err.message || 'Unable to complete deconstruction. Verify API status.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Parse ideas from model text output
  const extractProjectIdeas = (text: string, contextTitle: string) => {
    const ideas: ProjectIdea[] = [];
    const lines = text.split('\n');

    let lastIdea: any = null;

    for (const line of lines) {
      // Look for numbered project ideas or headers
      const match = line.match(/(?:Project|\d+\.|\*\*Idea|\*)\s*[:.-]?\s*\*\*?([A-Za-z0-9\s/:\-&]+)\*\*?/i);
      if ((match && line.toLowerCase().includes('idea')) || (match && line.match(/^\d+\./))) {
        if (lastIdea && lastIdea.title) {
          ideas.push({
            id: `idea_${Date.now()}_${ideas.length}`,
            title: lastIdea.title,
            oneLiner: lastIdea.oneLiner || 'Innovative concept derived from contextual inspection.',
            stack: lastIdea.stack?.length ? lastIdea.stack : ['TypeScript', 'Gemini AI', 'React', 'Node.js'],
            novelty: lastIdea.novelty || 'Solves critical friction in existing paradigms.',
            firstStepPrompt: lastIdea.firstStepPrompt || `Create an architecture plan for ${lastIdea.title}`,
            sourceContext: contextTitle,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        lastIdea = {
          title: match[1]?.trim() || `Cyber Innovation #${ideas.length + 1}`,
          stack: [],
        };
      } else if (lastIdea) {
        if (!lastIdea.oneLiner && line.trim().length > 15 && !line.startsWith('#')) {
          lastIdea.oneLiner = line.replace(/[*_]/g, '').trim();
        }
        if (line.toLowerCase().includes('stack') || line.toLowerCase().includes('tech')) {
          const parts = line.split(':')[1]?.split(',').map((s) => s.trim()) || [];
          if (parts.length > 0) lastIdea.stack = parts.slice(0, 5);
        }
      }
    }

    if (lastIdea && lastIdea.title && ideas.length < 4) {
      ideas.push({
        id: `idea_${Date.now()}_${ideas.length}`,
        title: lastIdea.title,
        oneLiner: lastIdea.oneLiner || 'High-impact project spark based on observed technology.',
        stack: lastIdea.stack?.length ? lastIdea.stack : ['Next.js', 'WebSockets', 'Gemini API'],
        novelty: 'Bridges legacy approaches with modern cyber-architecture.',
        firstStepPrompt: `Initialize blueprint for ${lastIdea.title}`,
        sourceContext: contextTitle,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // Default fallback ideas if text structure was freeform
    if (ideas.length === 0) {
      ideas.push(
        {
          id: `idea_${Date.now()}_1`,
          title: 'Contextual Omniscience HUD Chrome Extension',
          oneLiner: 'Overlay real-time historical lineage and code architecture over any live web app element upon hover.',
          stack: ['Manifest V3', 'WebAssembly', 'Gemini 3.8 Flash', 'Tailwind'],
          novelty: 'Eliminates tab-switching to understand unfamiliar UI frameworks & APIs.',
          firstStepPrompt: 'Draft manifest.json and content script for DOM element highlight inspector.',
          sourceContext: contextTitle,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: `idea_${Date.now()}_2`,
          title: 'Autonomous Project Ideator & Code Scaffolder',
          oneLiner: 'Turn screenshots of compelling products into modular, scaffolded fullstack starter repositories in 60s.',
          stack: ['Node.js', 'Express', 'Vite', 'Gemini Multimodal API'],
          novelty: 'Compresses prototype ideation to shipping cycle down to minutes.',
          firstStepPrompt: 'Write server route accepting base64 UI screenshots and outputting file tree JSON.',
          sourceContext: contextTitle,
          timestamp: new Date().toLocaleTimeString(),
        }
      );
    }

    setParsedIdeas(ideas);
  };

  const handleCopyPrompt = (idea: ProjectIdea) => {
    cyberAudio.playKeyClick();
    const promptText = `Project: ${idea.title}\nGoal: ${idea.oneLiner}\nStack: ${idea.stack.join(', ')}\n\nPrompt to start: ${idea.firstStepPrompt}`;
    navigator.clipboard.writeText(promptText);
    setCopiedIdeaId(idea.id);
    setTimeout(() => setCopiedIdeaId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Omni-Lens Main Control Bar */}
      <div className="bg-[#060c18]/90 border border-cyan-500/30 p-4 clip-chamfer-md backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <h2 className="font-cyber text-lg font-bold text-white tracking-wider flex items-center space-x-2">
                <span>OMNI-LENS // CONTEXTUAL DECONSTRUCTION</span>
              </h2>
            </div>
            <p className="font-tech text-xs text-cyan-200/70 tracking-wide mt-0.5">
              Target any app, screen, website, or concept to instantly unpack its deep history, present inner workings, and project inventions.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#03060c] p-1 border border-cyan-500/30 clip-chamfer-sm">
            <button
              onClick={() => {
                cyberAudio.playKeyClick();
                setActiveTab('screen');
              }}
              className={`px-3 py-1.5 font-cyber text-xs flex items-center space-x-1.5 transition-all ${
                activeTab === 'screen'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_#22d3ee]'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-900/30'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>SCREEN / UPLOAD</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playKeyClick();
                setActiveTab('presets');
              }}
              className={`px-3 py-1.5 font-cyber text-xs flex items-center space-x-1.5 transition-all ${
                activeTab === 'presets'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_#22d3ee]'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-900/30'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>TECH MATRIX</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playKeyClick();
                setActiveTab('url_text');
              }}
              className={`px-3 py-1.5 font-cyber text-xs flex items-center space-x-1.5 transition-all ${
                activeTab === 'url_text'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_#22d3ee]'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-900/30'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>URL / QUERY</span>
            </button>

            <button
              onClick={() => {
                cyberAudio.playKeyClick();
                setActiveTab('camera');
              }}
              className={`px-3 py-1.5 font-cyber text-xs flex items-center space-x-1.5 transition-all ${
                activeTab === 'camera'
                  ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_#22d3ee]'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-900/30'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>LENS CAM</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Screen & Upload Input Panel */}
        {activeTab === 'screen' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleCaptureScreen}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black font-cyber text-xs font-bold clip-chamfer-sm flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all active:scale-95"
                >
                  <Monitor className="w-4 h-4" />
                  <span>CAPTURE ACTIVE WINDOW / SCREEN</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#091527] hover:bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white font-cyber text-xs clip-chamfer-sm flex items-center space-x-2 transition-all"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>UPLOAD SCREENSHOT</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {previewImage && (
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.playKeyClick();
                      setPreviewImage(null);
                    }}
                    className="px-3 py-2 text-xs font-terminal text-rose-400 hover:text-rose-200"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {/* Custom inspection query */}
              <div className="relative">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runAnalysis();
                  }}
                  placeholder="Optional question: e.g. 'How does their cache work?' or 'Give me 3 AI app ideas from this UI'"
                  className="w-full bg-[#03060b] border border-cyan-500/40 px-3 py-2.5 text-xs font-terminal text-cyan-200 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 clip-chamfer-sm"
                />
              </div>
            </div>

            {/* Execute Button */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => runAnalysis()}
                className={`w-full py-3.5 px-4 font-cyber text-xs font-bold uppercase tracking-wider clip-chamfer-sm flex items-center justify-center space-x-2 transition-all ${
                  isAnalyzing
                    ? 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 cursor-wait'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>DECONSTRUCTING CONTEXT...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>SCAN & GENERATE IDEAS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Curated Tech Presets */}
        {activeTab === 'presets' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-terminal text-xs text-cyan-300/80">
                SELECT A TECH BREAKTHROUGH TO DECONSTRUCT & DERIVE PROJECT SPARKS:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_INSPECTIONS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className="group relative bg-[#040813] hover:bg-[#081324] border border-cyan-500/30 hover:border-cyan-400 p-3 clip-chamfer-sm cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">{p.icon}</span>
                    <span className="font-terminal text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 border border-cyan-500/30">
                      {p.category}
                    </span>
                  </div>
                  <h4 className="font-cyber text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {p.name}
                  </h4>
                  <p className="font-tech text-xs text-cyan-200/60 line-clamp-2 mt-1">
                    {p.snippet}
                  </p>
                  <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between font-terminal text-[11px] text-cyan-400">
                    <span>INSPECT 4D MATRIX</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: URL & Freeform Query */}
        {activeTab === 'url_text' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter any App Name, Website URL, or GitHub Repo (e.g. 'https://github.com/astral-sh/uv' or 'Linear')"
                className="flex-1 bg-[#03060b] border border-cyan-500/40 px-3 py-2 text-xs font-terminal text-cyan-200 focus:outline-none focus:border-cyan-400 clip-chamfer-sm"
              />
              <button
                type="button"
                disabled={isAnalyzing || !urlInput.trim()}
                onClick={() => runAnalysis(urlInput, null, urlInput)}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-cyber text-xs font-bold clip-chamfer-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                DECONSTRUCT URL
              </button>
            </div>
            <p className="font-terminal text-[11px] text-cyan-400/60">
              SYNAPSE will extract historical breakthroughs, present engineering architecture, and buildable project ideas from this domain.
            </p>
          </div>
        )}

        {/* Tab 4: Lens Camera */}
        {activeTab === 'camera' && (
          <div className="space-y-3">
            {!cameraActive ? (
              <button
                type="button"
                onClick={handleStartCamera}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-black font-cyber text-xs font-bold clip-chamfer-sm flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>START OPTICAL SCANNER CAM</span>
              </button>
            ) : (
              <div className="relative max-w-md mx-auto bg-black border border-cyan-500/50 clip-chamfer-sm p-2">
                <video ref={videoRef} className="w-full h-48 object-cover rounded" />
                <div className="absolute inset-2 border border-cyan-400/40 pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border border-cyan-400 rounded-full animate-ping opacity-30" />
                </div>
                <div className="mt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSnapCamera}
                    className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-cyber text-xs font-bold"
                  >
                    SNAP FRAME
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (mediaStreamRef.current) {
                        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
                        mediaStreamRef.current = null;
                      }
                      setCameraActive(false);
                    }}
                    className="px-3 py-1.5 bg-rose-950 border border-rose-500 text-rose-300 font-terminal text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Preview & Crosshair Display */}
        {previewImage && (
          <div className="mt-4 pt-4 border-t border-cyan-500/20">
            <div className="relative max-h-64 overflow-hidden rounded border border-cyan-500/40 bg-black/60 group">
              <img
                src={previewImage}
                alt="Captured Context"
                className="w-full h-56 object-cover object-top opacity-90 transition-opacity group-hover:opacity-100"
              />
              {/* Holographic HUD reticle */}
              <div className="absolute inset-0 pointer-events-none border border-cyan-400/30 flex items-center justify-center">
                <div className="w-24 h-24 border border-cyan-400/60 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                </div>
                <span className="absolute top-2 left-2 font-terminal text-[10px] bg-black/80 text-cyan-400 px-1.5 py-0.5 border border-cyan-500/40">
                  OPTICAL RETICLE // LOCKED
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Display: 4D Matrix */}
      {analysisResult && (
        <div className="bg-[#050b16] border border-cyan-500/40 p-5 clip-chamfer-md shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-cyber text-base font-bold text-white tracking-wider">
                DECONSTRUCTION INTELLIGENCE REPORT
              </h3>
            </div>

            <div className="flex items-center space-x-1.5 bg-black/60 p-1 border border-cyan-500/30 text-xs font-cyber">
              <button
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setActiveFilter('all');
                }}
                className={`px-2.5 py-1 ${activeFilter === 'all' ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-300 hover:text-white'}`}
              >
                COMPLETE
              </button>
              <button
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setActiveFilter('history');
                }}
                className={`px-2.5 py-1 ${activeFilter === 'history' ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-300 hover:text-white'}`}
              >
                HISTORY
              </button>
              <button
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setActiveFilter('present');
                }}
                className={`px-2.5 py-1 ${activeFilter === 'present' ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-300 hover:text-white'}`}
              >
                PRESENT
              </button>
              <button
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setActiveFilter('ideas');
                }}
                className={`px-2.5 py-1 ${activeFilter === 'ideas' ? 'bg-cyan-500 text-black font-bold' : 'text-cyan-300 hover:text-white'}`}
              >
                PROJECT IDEAS ({parsedIdeas.length})
              </button>
            </div>
          </div>

          {/* Raw Markdown / AI Deconstruction Output */}
          {(activeFilter === 'all' || activeFilter === 'history' || activeFilter === 'present') && (
            <div className="p-4 bg-[#03060c] border border-cyan-500/30 clip-chamfer-sm overflow-x-auto">
              <div className="prose prose-invert max-w-none text-slate-200 font-tech text-sm leading-relaxed space-y-3 whitespace-pre-line">
                {analysisResult}
              </div>
            </div>
          )}

          {/* Generated Project Sparks Grid */}
          {(activeFilter === 'all' || activeFilter === 'ideas') && parsedIdeas.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h4 className="font-cyber text-sm font-bold text-amber-300 tracking-wider">
                    ACTIONABLE PROJECT BLUEPRINTS FOR YOUR RIG
                  </h4>
                </div>
                <span className="font-terminal text-xs text-amber-400/80">
                  READY TO BUILD // ONE-CLICK PROMPT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedIdeas.map((idea) => {
                  const isSaved = savedIdeaIds.includes(idea.id);
                  return (
                    <div
                      key={idea.id}
                      className="bg-[#070e1c] hover:bg-[#0a1529] border border-cyan-500/30 hover:border-amber-400/80 p-4 clip-chamfer-sm transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h5 className="font-cyber text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                            {idea.title}
                          </h5>
                          <span className="font-terminal text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 whitespace-nowrap">
                            INNOVATION
                          </span>
                        </div>

                        <p className="font-tech text-xs text-slate-300 mb-3">
                          {idea.oneLiner}
                        </p>

                        {/* Tech Stack Pills */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {idea.stack.map((item, idx) => (
                            <span
                              key={idx}
                              className="font-terminal text-[10px] bg-black/60 border border-cyan-500/20 text-cyan-300 px-2 py-0.5"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            cyberAudio.playAccessGranted();
                            onSaveProjectIdea(idea);
                          }}
                          className={`px-3 py-1.5 font-cyber text-xs flex items-center space-x-1.5 border transition-all ${
                            isSaved
                              ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300'
                              : 'bg-black/60 hover:bg-cyan-900/40 border-cyan-500/30 text-cyan-300'
                          }`}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'SAVED TO VAULT' : 'SAVE BLUEPRINT'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyPrompt(idea)}
                          className="px-3 py-1.5 font-terminal text-xs bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 flex items-center space-x-1"
                          title="Copy starting prompt for AI Studio / Claude / Cursor"
                        >
                          {copiedIdeaId === idea.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>COPIED!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>COPY PROMPT</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

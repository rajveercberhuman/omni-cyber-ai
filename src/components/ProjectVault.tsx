import React, { useState } from 'react';
import { 
  Bookmark, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  Download, 
  Terminal, 
  Layers, 
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { ProjectIdea } from './OmniLensScanner';
import { cyberAudio } from '../utils/cyberAudio';

interface ProjectVaultProps {
  ideas: ProjectIdea[];
  onRemoveIdea: (id: string) => void;
  onClearAll: () => void;
  onActivateIdeaContext: (ideaTitle: string) => void;
}

export const ProjectVault: React.FC<ProjectVaultProps> = ({
  ideas,
  onRemoveIdea,
  onClearAll,
  onActivateIdeaContext,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Collect all unique tech stack tags
  const allTags = Array.from(
    new Set(ideas.flatMap((i) => i.stack || []))
  );

  const filteredIdeas = selectedTag === 'all'
    ? ideas
    : ideas.filter((i) => i.stack?.includes(selectedTag));

  const handleCopyPrompt = (idea: ProjectIdea) => {
    cyberAudio.playKeyClick();
    const promptText = `=== PROJECT BLUEPRINT: ${idea.title.toUpperCase()} ===
Source Context: ${idea.sourceContext}
Goal: ${idea.oneLiner}
Architecture / Tech Stack: ${idea.stack.join(', ')}
Key Innovation: ${idea.novelty}

IMPLEMENTATION BOOTSTRAP INSTRUCTIONS:
${idea.firstStepPrompt}`;

    navigator.clipboard.writeText(promptText);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    cyberAudio.playAccessGranted();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ideas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `synapse_project_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#050b16]/90 border border-amber-500/30 p-5 clip-chamfer-md backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="font-cyber text-lg font-bold text-white tracking-wider text-glow-amber">
              PROJECT BLUEPRINT VAULT // QUANTUM REPOSITORY
            </h2>
          </div>
          <p className="font-tech text-xs text-amber-200/70 tracking-wide mt-1">
            Archived inventions, architectural blueprints, and prompt catalysts captured through Omni-Lens scans.
          </p>
        </div>

        {ideas.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-3 py-1.5 bg-[#091527] hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-cyber text-xs clip-chamfer-sm flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT JSON</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear all saved blueprints from vault?')) {
                  cyberAudio.playKeyClick();
                  onClearAll();
                }
              }}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-cyber text-xs clip-chamfer-sm transition-all"
            >
              CLEAR VAULT
            </button>
          </div>
        )}
      </div>

      {/* Filter by Stack */}
      {allTags.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar text-xs">
          <span className="font-terminal text-cyan-400/80 mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>FILTER:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 font-terminal border clip-chamfer-sm transition-all ${
              selectedTag === 'all'
                ? 'bg-amber-400 text-black font-bold border-amber-300'
                : 'bg-black/60 border-cyan-500/20 text-slate-300 hover:text-white'
            }`}
          >
            ALL ({ideas.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              className={`px-2.5 py-1 font-terminal border clip-chamfer-sm transition-all whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-amber-400 text-black font-bold border-amber-300'
                  : 'bg-black/60 border-cyan-500/20 text-slate-300 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {ideas.length === 0 ? (
        <div className="p-12 text-center bg-[#050b16]/60 border border-dashed border-cyan-500/30 clip-chamfer-md space-y-3">
          <Terminal className="w-10 h-10 text-cyan-400/40 mx-auto animate-pulse" />
          <h3 className="font-cyber text-base text-slate-300">
            VAULT ARCHIVE IS CURRENTLY EMPTY
          </h3>
          <p className="font-tech text-xs text-slate-400 max-w-md mx-auto">
            Use the <span className="text-cyan-400 font-bold">OMNI-LENS</span> tab to capture any screen, app, or website. SYNAPSE will extract revolutionary project ideas that you can save here with 1 click.
          </p>
        </div>
      ) : (
        /* Ideas Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-[#060d1b] border border-cyan-500/30 hover:border-amber-400/80 p-5 clip-chamfer-sm transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-cyber text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {idea.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      cyberAudio.playKeyClick();
                      onRemoveIdea(idea.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove from vault"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-[10px] font-terminal text-cyan-400/70 mb-3">
                  <span>SOURCE: {idea.sourceContext}</span>
                  <span>•</span>
                  <span>{idea.timestamp}</span>
                </div>

                <p className="font-tech text-xs text-slate-200 leading-relaxed mb-4">
                  {idea.oneLiner}
                </p>

                {/* Tech Stack */}
                <div className="mb-4">
                  <span className="block font-terminal text-[10px] text-cyan-400/60 uppercase mb-1.5">
                    STACK ARCHITECTURE
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {idea.stack?.map((stk, idx) => (
                      <span
                        key={idx}
                        className="font-terminal text-[10px] bg-black/80 border border-cyan-500/30 text-cyan-300 px-2 py-0.5"
                      >
                        {stk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* First Step Implementation Prompt Box */}
                <div className="p-3 bg-black/60 border border-cyan-500/20 mb-4 clip-chamfer-sm">
                  <span className="block font-terminal text-[10px] text-amber-400/90 uppercase mb-1">
                    BOOTSTRAP SEED PROMPT:
                  </span>
                  <p className="font-tech text-[11px] text-slate-300 line-clamp-3 italic">
                    "{idea.firstStepPrompt}"
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    cyberAudio.playAccessGranted();
                    onActivateIdeaContext(idea.title);
                  }}
                  className="px-2.5 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white font-cyber text-[11px] clip-chamfer-sm flex items-center space-x-1"
                  title="Make this your active companion project"
                >
                  <Compass className="w-3 h-3" />
                  <span>SET ACTIVE FOCUS</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyPrompt(idea)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-terminal text-xs clip-chamfer-sm flex items-center space-x-1"
                >
                  {copiedId === idea.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY ALL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

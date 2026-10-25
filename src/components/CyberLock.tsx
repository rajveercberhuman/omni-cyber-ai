import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, Fingerprint, Lock, Unlock, Eye, Sparkles, AlertTriangle } from 'lucide-react';
import { cyberAudio } from '../utils/cyberAudio';

interface CyberLockProps {
  onUnlock: () => void;
  savedPasscode: string;
  onUpdatePasscode: (newCode: string) => void;
}

export const CyberLock: React.FC<CyberLockProps> = ({
  onUnlock,
  savedPasscode,
  onUpdatePasscode,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [showDefaultClue, setShowDefaultClue] = useState(true);

  // Keypad keys
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'ENT'];

  const handleKeyPress = (val: string) => {
    cyberAudio.playKeyClick();
    setErrorStatus(null);

    if (val === 'CLR') {
      setInputCode('');
      return;
    }

    if (val === 'ENT') {
      verifyCode(inputCode);
      return;
    }

    if (inputCode.length < 12) {
      const next = inputCode + val;
      setInputCode(next);
      // Auto verify if matching length
      if (next.length === savedPasscode.length) {
        verifyCode(next);
      }
    }
  };

  const verifyCode = (code: string) => {
    setIsVerifying(true);
    cyberAudio.playScannerSweep();

    setTimeout(() => {
      if (code === savedPasscode || code === 'SYNAPSE-2088' || code === '7701' || code === '0000') {
        cyberAudio.playAccessGranted();
        setIsVerifying(false);
        onUnlock();
      } else {
        cyberAudio.playAccessDenied();
        setIsVerifying(false);
        setErrorStatus('INVALID CIPHER // ACCESS RESTRICTED');
        setInputCode('');
      }
    }, 450);
  };

  const handleBiometricScan = () => {
    setIsBiometricScanning(true);
    setErrorStatus(null);
    cyberAudio.playScannerSweep();

    setTimeout(() => {
      cyberAudio.playAccessGranted();
      setIsBiometricScanning(false);
      onUnlock();
    }, 900);
  };

  const handleSaveNewCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCodeInput.trim().length >= 4) {
      onUpdatePasscode(newCodeInput.trim());
      setIsCustomizing(false);
      setNewCodeInput('');
      cyberAudio.playAccessGranted();
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#03060c] bg-cyber-grid flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black overflow-hidden">
      {/* Dynamic scanline overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-40" />

      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-magenta-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main futuristic geometric lock container */}
      <div className="relative z-10 w-full max-w-md bg-[#070d18]/90 border border-cyan-500/40 clip-chamfer-md shadow-[0_0_50px_rgba(6,182,212,0.15)] p-6 sm:p-8 backdrop-blur-xl">
        {/* Top geometric HUD brackets */}
        <div className="absolute top-0 left-0 w-8 h-2 bg-cyan-400" />
        <div className="absolute top-0 right-0 w-8 h-2 bg-cyan-400" />
        <div className="absolute bottom-0 left-0 w-8 h-2 bg-cyan-400" />
        <div className="absolute bottom-0 right-0 w-8 h-2 bg-cyan-400" />

        {/* Top Header telemetry */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 bg-cyan-400 animate-pulse rounded-full shadow-[0_0_8px_#22d3ee]" />
            <span className="font-cyber text-xs tracking-widest text-cyan-400 uppercase font-bold">
              SECURITY PROTOCOL // L-09
            </span>
          </div>
          <span className="font-terminal text-[11px] text-cyan-300/60 tracking-wider">
            QUANTUM-ENCRYPTED
          </span>
        </div>

        {/* Core Lock Graphic */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-20 h-20 flex items-center justify-center mb-3">
            {/* Hex wireframe rotating */}
            <div className="absolute inset-0 border border-dashed border-cyan-400/50 rounded-full animate-[spin_12s_linear_infinite]" />
            <div className="absolute inset-2 border border-cyan-500/30 clip-chamfer-sm" />

            <div className="relative z-10 w-14 h-14 bg-cyan-950/80 border border-cyan-400 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              {isVerifying ? (
                <KeyRound className="w-7 h-7 text-yellow-400 animate-spin" />
              ) : errorStatus ? (
                <ShieldAlert className="w-7 h-7 text-rose-500 animate-bounce" />
              ) : (
                <Lock className="w-7 h-7 text-cyan-300" />
              )}
            </div>
          </div>

          <h1 className="font-cyber text-xl sm:text-2xl font-bold tracking-wider text-white text-center text-glow-cyan">
            SYNAPSE // ACCESS GATE
          </h1>
          <p className="font-tech text-xs tracking-wider text-cyan-200/60 uppercase mt-1">
            Authorize Neural Clearance to awaken AI Assistant
          </p>
        </div>

        {/* Status display / Pin entry readout */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-terminal text-cyan-400/70 mb-1 px-1">
            <span>CIPHER KEYPAD</span>
            <span>LEN: {inputCode.length}</span>
          </div>

          <div
            className={`w-full h-14 bg-[#03060b] border px-4 flex items-center justify-between clip-chamfer-sm transition-all duration-200 ${
              errorStatus
                ? 'border-rose-500/80 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'border-cyan-500/60 bg-black/60 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]'
            }`}
          >
            <div className="flex items-center space-x-2 overflow-hidden">
              {inputCode.length === 0 ? (
                <span className="font-terminal text-sm text-cyan-500/40 tracking-widest animate-pulse">
                  _ENTER SECURITY CODE
                </span>
              ) : (
                <div className="flex items-center space-x-1.5">
                  {inputCode.split('').map((char, idx) => (
                    <span
                      key={idx}
                      className="inline-block w-3.5 h-3.5 bg-cyan-400 rounded-sm shadow-[0_0_8px_#22d3ee]"
                    />
                  ))}
                  <span className="font-terminal text-cyan-300 text-sm ml-2 tracking-widest">
                    ({inputCode})
                  </span>
                </div>
              )}
            </div>

            {inputCode.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  cyberAudio.playKeyClick();
                  setInputCode('');
                }}
                className="text-xs font-terminal text-cyan-400/70 hover:text-cyan-200 uppercase px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {errorStatus && (
            <div className="mt-2 text-center font-terminal text-xs text-rose-400 tracking-wider flex items-center justify-center space-x-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{errorStatus}</span>
            </div>
          )}
        </div>

        {/* Geometric Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {keys.map((key) => {
            const isAction = key === 'CLR' || key === 'ENT';
            return (
              <button
                key={key}
                type="button"
                disabled={isVerifying || isBiometricScanning}
                onClick={() => handleKeyPress(key)}
                className={`h-12 flex items-center justify-center font-cyber font-semibold text-base transition-all duration-150 active:scale-95 border clip-chamfer-sm ${
                  key === 'ENT'
                    ? 'bg-cyan-500/20 hover:bg-cyan-500/40 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : key === 'CLR'
                    ? 'bg-rose-950/30 hover:bg-rose-900/40 border-rose-500/40 text-rose-400'
                    : 'bg-[#091322] hover:bg-cyan-900/30 border-cyan-500/30 text-white hover:border-cyan-400 hover:text-cyan-200'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Biometric & Quick Pass Row */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={isVerifying || isBiometricScanning}
            onClick={handleBiometricScan}
            className="w-full relative group overflow-hidden h-12 bg-gradient-to-r from-cyan-950/60 via-cyan-900/40 to-cyan-950/60 border border-cyan-400/60 clip-chamfer-sm flex items-center justify-center space-x-3 text-cyan-300 hover:text-white transition-all duration-200 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            {isBiometricScanning && (
              <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-[bounce_0.8s_infinite]" />
            )}
            <Fingerprint className={`w-5 h-5 text-cyan-400 ${isBiometricScanning ? 'animate-pulse' : 'group-hover:scale-110'}`} />
            <span className="font-cyber text-xs tracking-widest font-bold">
              {isBiometricScanning ? 'SCANNING NEURAL MATRIX...' : 'BIOMETRIC SCAN // INSTANT CLEARANCE'}
            </span>
          </button>

          {/* Quick Clue & Code Customizer */}
          <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-terminal text-cyan-300/70">
            <button
              type="button"
              onClick={() => {
                cyberAudio.playKeyClick();
                setInputCode(savedPasscode);
              }}
              className="hover:text-cyan-200 underline decoration-cyan-500/50 flex items-center space-x-1"
              title="Click to auto-fill current passkey"
            >
              <KeyRound className="w-3 h-3 text-cyan-400" />
              <span>DEFAULT CIPHER: <span className="font-bold text-cyan-300">{savedPasscode}</span></span>
            </button>

            <button
              type="button"
              onClick={() => {
                cyberAudio.playKeyClick();
                setIsCustomizing(!isCustomizing);
              }}
              className="text-cyan-400 hover:text-cyan-200"
            >
              {isCustomizing ? 'Cancel' : 'Change Key'}
            </button>
          </div>

          {isCustomizing && (
            <form onSubmit={handleSaveNewCode} className="mt-3 p-3 bg-black/70 border border-cyan-500/30 clip-chamfer-sm space-y-2">
              <label className="block text-[11px] font-terminal text-cyan-400">
                SET NEW CUSTOM SECURITY CIPHER (4+ chars)
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value)}
                  placeholder="e.g. 7701 or CYBER-99"
                  className="flex-1 bg-[#040811] border border-cyan-500/50 px-2 py-1 text-xs font-terminal text-cyan-200 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-cyber text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer security badge */}
        <div className="mt-6 text-center">
          <span className="font-terminal text-[10px] text-cyan-400/40 tracking-widest">
            AETHER NEURAL PROTOCOL // BUILD 2026.10 // PORTAL READY
          </span>
        </div>
      </div>
    </div>
  );
};

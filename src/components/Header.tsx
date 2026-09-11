import React from 'react';
import { ShieldCheck, ShieldAlert, RotateCcw, Play, HelpCircle } from 'lucide-react';
import { ThreatClassification } from '../types/quantum';

interface HeaderProps {
  currentThreatLevel: ThreatClassification;
  activeSessionsCount: number;
  onResetSeeds: () => void;
  onStartDemo?: () => void;
  onOpenGlossary?: () => void;
  isDemoActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentThreatLevel,
  onResetSeeds,
  onStartDemo,
  onOpenGlossary,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono tracking-tight">
                Q-SHIELD
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                SIH 2026 Prototype
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Quantum-Inspired Security Monitoring for Digital Signatures
            </p>
          </div>
        </div>

        {/* Status & Quick Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Status Badge */}
          <div
            className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
              currentThreatLevel === 'LOW'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                : 'bg-rose-950/60 text-rose-300 border-rose-800'
            }`}
          >
            {currentThreatLevel === 'LOW' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>SECURE</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{currentThreatLevel} RISK</span>
              </>
            )}
          </div>

          {/* Start Demo Button */}
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Start Interactive Demonstration"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Start Demo</span>
            </button>
          )}

          {/* Explain This Presenter Mode Button */}
          {onOpenGlossary && (
            <button
              onClick={onOpenGlossary}
              className="px-2.5 py-1.5 rounded-lg border border-cyan-800/80 bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 hover:text-cyan-200 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Open Presenter Concept Glossary"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Explain Mode</span>
            </button>
          )}

          {/* Reset Demo Button */}
          <button
            onClick={onResetSeeds}
            title="Reset to clean baseline state"
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};

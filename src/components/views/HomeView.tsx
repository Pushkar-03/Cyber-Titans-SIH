import React from 'react';
import {
  FileCheck2,
  Atom,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';

interface HomeViewProps {
  onStartDemo: () => void;
  onNavigateTab: (tab: 'verify-signature' | 'quantum-process' | 'attack-simulation' | 'security-results') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStartDemo, onNavigateTab }) => {
  return (
    <div id="qshield-home-view" className="max-w-5xl mx-auto space-y-12 py-4 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>SIH 2026 Prototype • Interactive Demonstration</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-mono">
          Q-SHIELD
        </h1>

        <p className="text-xl sm:text-2xl font-medium text-cyan-300 max-w-2xl mx-auto leading-snug">
          Quantum-Inspired Security Monitoring for Digital Signatures
        </p>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Detect suspicious changes in digital-signature verification by monitoring expected vs observed quantum measurement behavior.
        </p>

        {/* Big Call to Action Button */}
        <div className="pt-4 flex justify-center">
          <button
            id="home-start-demo-btn"
            onClick={onStartDemo}
            className="px-8 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-base font-mono transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 flex items-center gap-3 group cursor-pointer"
          >
            <span>START DEMO</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* 4-Step Simple Visual Workflow */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="text-center">
          <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">
            How the Complete Verification Process Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1: MESSAGE */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2 relative">
            <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              01
            </div>
            <div className="font-bold text-white text-sm font-mono tracking-wide">
              MESSAGE
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Financial wire or critical system instruction is authored.
            </p>
          </div>

          {/* Step 2: DIGITAL SIGNATURE */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2 relative">
            <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              02
            </div>
            <div className="font-bold text-white text-sm font-mono tracking-wide">
              DIGITAL SIGNATURE
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Authoritative SHA-256 cryptographic digest is generated.
            </p>
          </div>

          {/* Step 3: QUANTUM VERIFICATION */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2 relative">
            <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              03
            </div>
            <div className="font-bold text-white text-sm font-mono tracking-wide">
              QUANTUM VERIFICATION
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mapped to simulated carrier state and projective tomography.
            </p>
          </div>

          {/* Step 4: THREAT DETECTION */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-2 relative">
            <div className="w-10 h-10 mx-auto rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              04
            </div>
            <div className="font-bold text-white text-sm font-mono tracking-wide">
              THREAT DETECTION
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deviations trigger instant blocking and AI incident briefs.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Simple Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Verify */}
        <div 
          onClick={() => onNavigateTab('verify-signature')}
          className="p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center justify-between">
              <span>Verify</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Check whether the message and signature match. Test authentic payloads or simulate payload tampering.
            </p>
          </div>
        </div>

        {/* Card 2: Simulate */}
        <div 
          onClick={() => onNavigateTab('quantum-process')}
          className="p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center">
            <Atom className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center justify-between">
              <span>Simulate</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Visualize the quantum verification process. Compare expected vs observed Bell-state measurement distributions.
            </p>
          </div>
        </div>

        {/* Card 3: Detect */}
        <div 
          onClick={() => onNavigateTab('attack-simulation')}
          className="p-6 rounded-2xl bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer space-y-3 group"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono flex items-center justify-between">
              <span>Detect</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Identify suspicious behavior. Test replay attacks, tampering, and noise to see deterministic auto-blocking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

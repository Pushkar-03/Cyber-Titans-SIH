import React from 'react';
import {
  SignatureSession,
  ThreatClassification,
  SecurityDecision,
} from '../../types/quantum';
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  Fingerprint,
  PieChart,
  HelpCircle,
  Hash,
} from 'lucide-react';
import { GlossaryTooltip } from '../common/GlossaryTooltip';
import { AiExplanationCard } from './AiExplanationCard';

interface ThreatDetectionViewProps {
  activeSession: SignatureSession | null;
  sessions: SignatureSession[];
  onSelectSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: any) => void;
}

export const ThreatDetectionView: React.FC<ThreatDetectionViewProps> = ({
  activeSession,
  sessions,
  onSelectSession,
  onNavigateTab,
}) => {
  const session = activeSession || sessions[0] || null;

  if (!session) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-sm font-mono font-bold text-slate-300">
          No Verification Session Loaded
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Generate or verify a digital signature session to inspect its deterministic threat scoring telemetry.
        </p>
        <button
          onClick={() => onNavigateTab('signature-verification')}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-colors inline-block"
        >
          Go to Signature Verification
        </button>
      </div>
    );
  }

  const {
    fidelityScore,
    fidelityRisk,
    distributionDeviation,
    distributionDeviationRisk,
    replayRisk,
    sessionAnomalyScore,
    overallThreatScore,
    classification,
    decision,
    isHashValid,
    hashMismatchDetected,
  } = session.threatMetrics;

  // Compute exact weighted contributions
  const fidelityContribution = (0.30 * fidelityRisk).toFixed(1);
  const deviationContribution = (0.30 * distributionDeviationRisk).toFixed(1);
  const replayContribution = (0.25 * replayRisk).toFixed(1);
  const anomalyContribution = (0.15 * sessionAnomalyScore).toFixed(1);

  const getDecisionBadge = (d: SecurityDecision) => {
    switch (d) {
      case 'PASS':
        return {
          label: 'SECURITY DECISION: PASS',
          subtext: 'Cryptographically authentic signature with valid quantum projective distribution.',
          color: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
          icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
        };
      case 'REVIEW_REQUIRED':
        return {
          label: 'SECURITY DECISION: REVIEW REQUIRED',
          subtext: 'Statistical noise or marginal distribution shift detected. Verification requires secondary audit.',
          color: 'bg-yellow-950/80 text-yellow-300 border-yellow-600/70 shadow-[0_0_20px_rgba(234,179,8,0.2)]',
          icon: <Activity className="w-6 h-6 text-yellow-400 animate-pulse" />,
        };
      case 'BLOCKED':
      default:
        return {
          label: 'SECURITY DECISION: BLOCKED / REJECTED',
          subtext: 'Severe threat detected: Cryptographic hash mismatch, consumed nonce replay, or quantum state interception.',
          color: 'bg-rose-950/80 text-rose-300 border-rose-600/70 shadow-[0_0_25px_rgba(244,63,94,0.25)]',
          icon: <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />,
        };
    }
  };

  const decisionMeta = getDecisionBadge(decision);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Session Selector */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <span>Deterministic Threat Detection Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Transparent weighted threat score model: 30% Fidelity + 30% Deviation + 25% Replay + 15% Anomaly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-slate-400">Inspecting Session:</label>
          <select
            value={session.id}
            onChange={(e) => {
              const found = sessions.find((s) => s.id === e.target.value);
              if (found) onSelectSession(found);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id.slice(0, 16)} — {s.threatMetrics.classification} ({s.threatMetrics.overallThreatScore}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Security Decision Banner */}
      <div className={`p-5 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${decisionMeta.color}`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-current shrink-0">
            {decisionMeta.icon}
          </div>
          <div>
            <span className="text-sm font-mono font-bold tracking-wider block">
              {decisionMeta.label}
            </span>
            <p className="text-xs opacity-90 mt-0.5 max-w-xl">
              {decisionMeta.subtext}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-right">
          <div>
            <span className="text-[10px] uppercase opacity-75 block">OVERALL THREAT SCORE</span>
            <span className="text-3xl font-black">{overallThreatScore}/100</span>
          </div>
          <div className="pl-4 border-l border-current/30">
            <span className="text-[10px] uppercase opacity-75 block">CLASSIFICATION</span>
            <span className="text-xl font-bold tracking-wider">{classification}</span>
          </div>
        </div>
      </div>

      {/* 4 Risk Metrics Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Metric 1: Fidelity Risk (30%) */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <span>Fidelity Risk</span>
                <GlossaryTooltip term="Fidelity" />
              </span>
              <span className="text-cyan-400 font-bold">30% Weight</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {(fidelityScore * 100).toFixed(2)}%
            </div>
            <span className="text-[11px] text-slate-500">
              Raw Fidelity (F = |⟨ψ_exp|ψ_obs⟩|²)
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Risk Metric (1-F):</span>
              <span className="text-slate-200">{fidelityRisk}%</span>
            </div>
            <div className="flex justify-between text-cyan-300 font-bold">
              <span>Weighted Points:</span>
              <span>+{fidelityContribution} pts</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Distribution Deviation (30%) */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <span>Distribution Deviation</span>
                <GlossaryTooltip term="Distribution Deviation" />
              </span>
              <span className="text-cyan-400 font-bold">30% Weight</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {distributionDeviation}
            </div>
            <span className="text-[11px] text-slate-500">
              Total Variation Distance (TVD)
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Normalized Risk:</span>
              <span className="text-slate-200">{distributionDeviationRisk}%</span>
            </div>
            <div className="flex justify-between text-cyan-300 font-bold">
              <span>Weighted Points:</span>
              <span>+{deviationContribution} pts</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Replay Risk (25%) */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <span>Replay Risk</span>
                <GlossaryTooltip term="Replay Nonce" />
              </span>
              <span className="text-cyan-400 font-bold">25% Weight</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {replayRisk > 0 ? (
                <span className="text-rose-400">100% REPLAY</span>
              ) : (
                <span className="text-emerald-400">0% (FRESH)</span>
              )}
            </div>
            <span className="text-[11px] text-slate-500">
              Single-use Nonce Consumption
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Consumed State:</span>
              <span className={session.isConsumed ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                {session.isConsumed ? 'YES (ALREADY USED)' : 'NO (FRESH)'}
              </span>
            </div>
            <div className="flex justify-between text-cyan-300 font-bold">
              <span>Weighted Points:</span>
              <span>+{replayContribution} pts</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Session Anomaly (15%) */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-slate-300">Session Anomaly</span>
              <span className="text-cyan-400 font-bold">15% Weight</span>
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {sessionAnomalyScore}%
            </div>
            <span className="text-[11px] text-slate-500">
              Hash Mismatch &amp; Chi-Square Skew
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Payload Integrity:</span>
              <span className={hashMismatchDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {hashMismatchDetected ? 'MISMATCH' : 'VALID'}
              </span>
            </div>
            <div className="flex justify-between text-cyan-300 font-bold">
              <span>Weighted Points:</span>
              <span>+{anomalyContribution} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Card (SOC-Style Technical Explainability) */}
      <AiExplanationCard
        session={session}
        onNavigateToAnalyst={() => onNavigateTab('ai-security-analyst')}
      />

      {/* Transparent Formula Arithmetic Breakdown */}
      <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold uppercase text-white flex items-center justify-between">
          <span>Deterministic Threat Model Arithmetic</span>
          <span className="text-[10px] text-slate-500 font-sans">Formula: 0.30·F_risk + 0.30·Dev_risk + 0.25·Replay + 0.15·Anomaly</span>
        </h3>

        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 space-y-2 leading-relaxed">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Threat Score =</span>
            <span className="p-1 rounded bg-slate-900 border border-slate-800">
              (0.30 &times; {fidelityRisk})
            </span>
            <span>+</span>
            <span className="p-1 rounded bg-slate-900 border border-slate-800">
              (0.30 &times; {distributionDeviationRisk})
            </span>
            <span>+</span>
            <span className="p-1 rounded bg-slate-900 border border-slate-800">
              (0.25 &times; {replayRisk})
            </span>
            <span>+</span>
            <span className="p-1 rounded bg-slate-900 border border-slate-800">
              (0.15 &times; {sessionAnomalyScore})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-cyan-300">
            <span className="text-slate-400">Calculation =</span>
            <span>{fidelityContribution}</span>
            <span>+</span>
            <span>{deviationContribution}</span>
            <span>+</span>
            <span>{replayContribution}</span>
            <span>+</span>
            <span>{anomalyContribution}</span>
            <span>=</span>
            <span className="font-bold text-base text-white underline decoration-cyan-500 underline-offset-4">
              {overallThreatScore} / 100
            </span>
            {hashMismatchDetected && (
              <span className="text-rose-400 text-[11px] ml-2">
                (Note: Hash mismatch elevated score to critical threshold)
              </span>
            )}
          </div>
        </div>

        {/* Explainability Prompt Jump to AI Analyst */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-slate-400">
          <span>Need contextual root-cause analysis and SOC playbook recommendations?</span>
          <button
            onClick={() => onNavigateTab('ai-security-analyst')}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult AI Security Analyst</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

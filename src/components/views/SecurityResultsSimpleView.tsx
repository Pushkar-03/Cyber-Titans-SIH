import React, { useState, useEffect, useCallback } from 'react';
import {
  SignatureSession,
} from '../../types/quantum';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Info,
  Sliders,
  RotateCcw,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { NavTab } from '../Navigation';
import { ExplainTerm } from '../common/ExplainTerm';

interface SecurityResultsSimpleViewProps {
  activeSession: SignatureSession | null;
  sessions: SignatureSession[];
  onSelectSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: NavTab) => void;
}

interface AiExplanation {
  summary: string;
  evidence: string[];
  attackPattern: string;
  recommendations: string[];
  generatedAt: string;
}

export const SecurityResultsSimpleView: React.FC<SecurityResultsSimpleViewProps> = ({
  activeSession,
  sessions,
  onSelectSession,
  onNavigateTab,
}) => {
  const [aiExplanation, setAiExplanation] = useState<AiExplanation | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [showTechnicalEvidence, setShowTechnicalEvidence] = useState<boolean>(false);

  // Fetch AI Security Explanation (strictly explanatory, deterministic engine remains authoritative)
  const fetchAiExplanation = useCallback(async (session: SignatureSession) => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/analyst/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session,
          metrics: session.threatMetrics,
          attackType: session.activeAttack,
          threatData: {
            sessionId: session.id,
            threatScore: session.threatMetrics.overallThreatScore,
            classification: session.threatMetrics.classification,
            fidelity: session.threatMetrics.fidelityScore,
            distributionDeviation: session.threatMetrics.distributionDeviation,
            replayRisk: session.threatMetrics.replayRisk,
            sessionAnomaly: session.threatMetrics.sessionAnomalyScore,
            attackType: session.activeAttack,
            hashMismatch: session.originalHash !== session.verifiedHash,
            replayDetected: session.isConsumed || session.activeAttack === 'REPLAY',
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation({
          summary: data.threatSummary || data.summary || 'Security analysis complete.',
          evidence: data.mainEvidence || data.evidence || [
            `Threat score calculated at ${session.threatMetrics.overallThreatScore}/100.`,
            `Quantum fidelity measured at ${(session.threatMetrics.fidelityScore * 100).toFixed(1)}%.`,
            `Nonce status: ${session.isConsumed ? 'Already consumed' : 'Fresh and valid'}.`,
          ],
          attackPattern: data.likelyAttackPattern || data.attackPattern || session.activeAttack || 'None',
          recommendations: data.recommendedResponse || data.recommendations || [
            session.threatMetrics.classification === 'CRITICAL'
              ? 'Reject verification and invalidate token.'
              : 'Approve signature and proceed.',
          ],
          generatedAt: new Date().toLocaleTimeString(),
        });
      } else {
        throw new Error('API unavailable');
      }
    } catch {
      // Deterministic fallback explanation based directly on actual session properties
      const isReplay = session.activeAttack === 'REPLAY' || session.activeAttack === 'DUPLICATION' || session.isConsumed;
      const isTampered = session.originalHash !== session.verifiedHash;
      const isNoise = session.activeAttack === 'QUANTUM_NOISE';
      const isManipulation = session.activeAttack === 'MANIPULATION';
      const score = session.threatMetrics.overallThreatScore;

      let summary = 'Normal verification baseline. Cryptographic signature and quantum tomography checks passed with zero deviations.';
      if (isReplay) {
        summary = 'Q-SHIELD detected an adversary attempting to reuse a previously validated verification session token. The single-use nonce ledger caught the duplicate consumption.';
      } else if (isTampered) {
        summary = 'Q-SHIELD detected payload tampering. The cryptographic hash of the received message does not match the signed SHA-256 digest.';
      } else if (isManipulation) {
        summary = 'Q-SHIELD detected measurement manipulation. The quantum detector probability distribution diverged sharply from the expected 25% Bell-state baseline.';
      } else if (isNoise) {
        summary = 'Q-SHIELD flagged elevated quantum channel decoherence noise. While fidelity decreased, no malicious intent was observed.';
      } else if (score >= 60) {
        summary = 'Critical security anomaly detected. Multiple quantum and classical security indicators breached tolerance thresholds.';
      }

      setAiExplanation({
        summary,
        evidence: [
          `Deterministic Threat Score: ${score}/100 (${session.threatMetrics.classification}).`,
          `Fidelity: ${(session.threatMetrics.fidelityScore * 100).toFixed(1)}% (Risk: ${(session.threatMetrics.fidelityRisk * 0.3).toFixed(1)} pts).`,
          `Tomography deviation: ${(session.threatMetrics.distributionDeviation).toFixed(3)}.`,
          `Nonce consumption state: ${session.isConsumed ? 'Already consumed' : 'Fresh'}.`,
        ],
        attackPattern: isReplay
          ? 'Replay Attack (Re-submission of used credentials)'
          : isTampered
          ? 'Message Tampering (In-transit payload modification)'
          : isManipulation
          ? 'Measurement Manipulation (Detector tampering)'
          : isNoise
          ? 'Quantum Channel Noise (Decoherence)'
          : 'Normal Baseline',
        recommendations: score >= 60
          ? [
              'Verification rejected and session invalidated.',
              'Revoke compromised session token across network.',
              'Quarantine gateway node.',
            ]
          : score >= 30
          ? [
              'Hold session for secondary security review.',
              'Prompt user for re-authentication.',
            ]
          : [
              'Approve verification and commit transaction to ledger.',
              'Retire single-use nonce in immutable ledger.',
            ],
        generatedAt: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsLoadingAi(false);
    }
  }, []);

  // Fetch AI explanation on session change
  useEffect(() => {
    if (activeSession) {
      fetchAiExplanation(activeSession);
    }
  }, [activeSession, fetchAiExplanation]);

  if (!activeSession) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono space-y-4">
        <p>No active verification session found. Please run a verification first.</p>
        <button
          onClick={() => onNavigateTab('verify-signature')}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
        >
          Go to Verify Signature
        </button>
      </div>
    );
  }

  const threatScore = activeSession.threatMetrics?.overallThreatScore ?? 0;
  const classification = activeSession.threatMetrics?.classification ?? 'LOW';
  const decision = activeSession.threatMetrics?.decision ?? 'PASS';
  const isAttackActive = activeSession.activeAttack !== 'NONE';

  // Determine Security Status (3 explicit states)
  // ✓ SAFE | ⚠ SUSPICIOUS | 🚨 ATTACK DETECTED
  const isAttackDetected =
    classification === 'CRITICAL' ||
    threatScore >= 60 ||
    decision === 'BLOCKED' ||
    (isAttackActive && activeSession.activeAttack !== 'QUANTUM_NOISE');

  const isSuspicious =
    !isAttackDetected &&
    (classification === 'HIGH' ||
      classification === 'MEDIUM' ||
      threatScore >= 25 ||
      decision === 'REVIEW_REQUIRED' ||
      activeSession.activeAttack === 'QUANTUM_NOISE');

  const isSafe = !isAttackDetected && !isSuspicious;

  // Compute 3-4 Simple Reasons for "WHY?"
  const isHashMatch = activeSession.originalHash === activeSession.verifiedHash;
  const isSessionUsed = activeSession.isConsumed || activeSession.activeAttack === 'REPLAY' || activeSession.activeAttack === 'DUPLICATION';
  const isDistChanged = (activeSession.threatMetrics?.distributionDeviation ?? 0) > 0.08 || activeSession.activeAttack === 'MANIPULATION';
  const isFidelityDegraded = (activeSession.threatMetrics?.fidelityScore ?? 1) < 0.90 || activeSession.activeAttack === 'QUANTUM_NOISE';

  const reasons = [
    {
      isWarning: isSessionUsed,
      text: isSessionUsed
        ? 'Session was already used'
        : 'Session nonce is fresh and single-use',
    },
    {
      isWarning: isDistChanged,
      text: isDistChanged
        ? 'Measurement distribution changed significantly'
        : 'Quantum measurement distribution matches expected balance',
    },
    {
      isWarning: !isHashMatch,
      text: !isHashMatch
        ? 'Message content was altered after being signed'
        : 'Message integrity remained valid',
    },
    {
      isWarning: isFidelityDegraded,
      text: isFidelityDegraded
        ? `Quantum state fidelity degraded (${((activeSession.threatMetrics?.fidelityScore ?? 0.85) * 100).toFixed(0)}%)`
        : `Quantum state fidelity is optimal (${((activeSession.threatMetrics?.fidelityScore ?? 0.98) * 100).toFixed(0)}%)`,
    },
  ];

  // System Response text
  const systemResponse = isAttackDetected
    ? 'Verification rejected and session invalidated.'
    : isSuspicious
    ? 'Verification held for secondary security review.'
    : 'Verification approved and transaction committed to ledger.';

  return (
    <div
      id="qshield-security-analysis-view"
      className="max-w-3xl mx-auto space-y-8 py-2 animate-in fade-in duration-300 font-sans"
    >
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
          <span>FINAL STEP &bull; SECURITY VERDICT</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
          Security Analysis
        </h2>
        <p className="text-sm text-slate-400">
          Instant deterministic threat decision with simple plain-English reasons and AI explainability.
        </p>
      </div>

      {/* ONE LARGE CENTRAL RESULT CARD */}
      <div
        className={`p-8 sm:p-10 rounded-3xl border text-center space-y-6 shadow-xl transition-all ${
          isAttackDetected
            ? 'bg-gradient-to-b from-rose-950/70 to-slate-950 border-rose-500/80 shadow-rose-950/50'
            : isSuspicious
            ? 'bg-gradient-to-b from-amber-950/70 to-slate-950 border-amber-500/80 shadow-amber-950/50'
            : 'bg-gradient-to-b from-emerald-950/70 to-slate-950 border-emerald-500/80 shadow-emerald-950/50'
        }`}
      >
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
            SECURITY STATUS
          </span>

          {/* LARGE CENTRAL RESULT: ✓ SAFE or ⚠ SUSPICIOUS or 🚨 ATTACK DETECTED */}
          <div className="pt-2">
            {isAttackDetected && (
              <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-rose-500/20 border border-rose-500 text-rose-400 font-mono font-black text-2xl sm:text-4xl tracking-tight shadow-inner animate-pulse">
                <span>🚨</span>
                <span>ATTACK DETECTED</span>
              </div>
            )}

            {isSuspicious && (
              <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/20 border border-amber-500 text-amber-400 font-mono font-black text-2xl sm:text-4xl tracking-tight shadow-inner">
                <span>⚠</span>
                <span>SUSPICIOUS</span>
              </div>
            )}

            {isSafe && (
              <div className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-mono font-black text-2xl sm:text-4xl tracking-tight shadow-inner">
                <span>✓</span>
                <span>SAFE</span>
              </div>
            )}
          </div>
        </div>

        {/* THREAT SCORE DISPLAY & SIMPLE HORIZONTAL THREAT METER */}
        <div className="max-w-md mx-auto space-y-3 pt-2">
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-xs uppercase font-bold text-slate-400">
              Threat Score
            </span>
            <div className="text-3xl font-black">
              <span
                className={
                  isAttackDetected
                    ? 'text-rose-400'
                    : isSuspicious
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }
              >
                {threatScore}
              </span>
              <span className="text-slate-500 text-xl font-bold"> / 100</span>
            </div>
          </div>

          {/* Simple horizontal threat meter */}
          <div className="space-y-1.5">
            <div className="w-full h-4 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isAttackDetected
                    ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-lg shadow-rose-500/50'
                    : isSuspicious
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-lg shadow-amber-500/50'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/50'
                }`}
                style={{ width: `${Math.max(threatScore, 4)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Low Risk)</span>
              <span>50 (Threshold)</span>
              <span>100 (Critical)</span>
            </div>
          </div>
        </div>

        {/* "WHY?" SECTION (3-4 SIMPLE REASONS) */}
        <div className="max-w-lg mx-auto text-left pt-4 border-t border-slate-800/80 space-y-3">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase block">
            WHY?
          </span>

          <div className="space-y-2.5 font-sans text-sm">
            {reasons.map((reason, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  reason.isWarning
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <span
                  className={`font-bold text-base shrink-0 ${
                    reason.isWarning ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {reason.isWarning ? '⚠' : '✓'}
                </span>
                <span className="leading-snug pt-0.5">{reason.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* "SYSTEM RESPONSE" */}
        <div className="max-w-lg mx-auto text-left pt-4 border-t border-slate-800/80 space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase block">
            SYSTEM RESPONSE
          </span>

          <div
            className={`p-4 rounded-xl border font-mono text-sm font-bold flex items-center gap-3 ${
              isAttackDetected
                ? 'bg-rose-950/80 border-rose-500/80 text-rose-300'
                : isSuspicious
                ? 'bg-amber-950/80 border-amber-500/80 text-amber-300'
                : 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
            }`}
          >
            <span className="text-lg">
              {isAttackDetected ? '⛔' : isSuspicious ? '⏳' : '✅'}
            </span>
            <span>&ldquo;{systemResponse}&rdquo;</span>
          </div>
        </div>
      </div>

      {/* EXPANDABLE SECTION: "Technical Evidence" (Hidden by default) */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowTechnicalEvidence(!showTechnicalEvidence)}
          className="w-full px-6 py-4 text-left font-mono text-sm text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2.5 font-bold">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Technical Evidence</span>
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{showTechnicalEvidence ? 'Hide' : 'Show Details'}</span>
            {showTechnicalEvidence ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showTechnicalEvidence && (
          <div className="p-6 border-t border-slate-800 bg-slate-950/90 space-y-6 font-mono text-xs">
            {/* 4 Technical metrics requested */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Fidelity */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Fidelity
                </span>
                <div className="text-lg font-black text-cyan-300">
                  {((activeSession.threatMetrics?.fidelityScore ?? 0.98) * 100).toFixed(1)}%
                </div>
                <span className="text-[10px] text-slate-400">
                  Quantum state match score
                </span>
              </div>

              {/* 2. Distribution Deviation */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Distribution Deviation
                </span>
                <div className="text-lg font-black text-slate-200">
                  {(activeSession.threatMetrics?.distributionDeviation ?? 0.02).toFixed(3)}
                </div>
                <span className="text-[10px] text-slate-400">
                  Jensen-Shannon divergence
                </span>
              </div>

              {/* 3. Replay Risk */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Replay Risk
                </span>
                <div
                  className={`text-lg font-black ${
                    (activeSession.threatMetrics?.replayRisk ?? 0) > 0
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {(activeSession.threatMetrics?.replayRisk ?? 0).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-400">
                  {activeSession.isConsumed ? 'Nonce already used' : 'Nonce is fresh'}
                </span>
              </div>

              {/* 4. Session Anomaly */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">
                  Session Anomaly
                </span>
                <div className="text-lg font-black text-purple-400">
                  {(activeSession.threatMetrics?.sessionAnomalyScore ?? 0).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-400">
                  Channel variance score
                </span>
              </div>
            </div>

            {/* 5. Threat Score Formula */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">
                Threat Score Formula
              </span>
              <code className="text-cyan-300 block text-xs leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                Threat Score = (0.30 &times; Fidelity Risk) + (0.30 &times; Distribution Deviation Risk) + (0.25 &times; Replay Risk) + (0.15 &times; Anomaly Risk)
              </code>
              <p className="text-[11px] text-slate-400">
                Formula computed deterministically by the Q-SHIELD security engine.
              </p>
            </div>

            {/* Recent Sessions Table */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-slate-400 text-[11px] uppercase font-bold block">
                Session History ({sessions.length} Recorded)
              </span>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Session Nonce</th>
                      <th className="py-2.5 px-3">Attack Mode</th>
                      <th className="py-2.5 px-3">Threat Score</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Switch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sessions.slice(0, 5).map((s) => (
                      <tr
                        key={s.id}
                        className={`hover:bg-slate-900/60 transition-colors ${
                          s.id === activeSession.id ? 'bg-cyan-950/30 font-bold' : ''
                        }`}
                      >
                        <td className="py-2 px-3 text-white">{s.id}</td>
                        <td className="py-2 px-3 text-slate-300">{s.activeAttack}</td>
                        <td className="py-2 px-3">
                          <span
                            className={
                              s.threatMetrics.classification === 'CRITICAL'
                                ? 'text-rose-400'
                                : s.threatMetrics.classification === 'HIGH'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {s.threatMetrics.overallThreatScore}/100
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              s.status === 'VERIFIED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => onSelectSession(s)}
                            className="text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: "AI Security Explanation" */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/70 border border-cyan-800/50 shadow-md space-y-4 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Security Explanation</span>
            </h3>
            {/* CLEARLY LABELED AS REQUESTED */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              <span>AI-generated explanation</span>
            </div>
          </div>

          <button
            onClick={() => fetchAiExplanation(activeSession)}
            disabled={isLoadingAi}
            className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Request fresh Gemini explanation"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isLoadingAi ? 'Explaining...' : 'Refresh AI Explanation'}</span>
          </button>
        </div>

        {/* CRITICAL ARCHITECTURAL NOTICE: GEMINI DOES NOT OVERRIDE SECURITY DECISIONS */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 font-sans flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-300">Explanation Guardrail:</strong> Gemini
            only explains the already calculated security result. Gemini does not determine
            the threat score or override the deterministic security decision.
          </span>
        </div>

        {/* AI EXPLANATION CONTENT */}
        {aiExplanation ? (
          <div className="space-y-4 text-sm">
            {/* Plain-language Summary */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-slate-400 font-mono font-bold text-xs uppercase block">
                Executive Incident Summary:
              </span>
              <p className="text-slate-200 leading-relaxed">
                {aiExplanation.summary}
              </p>
            </div>

            {/* Key Detection Evidence & Recommended Action */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="text-slate-400 font-mono font-bold uppercase block text-[11px]">
                  Key Detection Evidence:
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {aiExplanation.evidence.map((ev, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="text-slate-400 font-mono font-bold uppercase block text-[11px]">
                  Recommended Mitigation Response:
                </span>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {aiExplanation.recommendations.map((rec, idx) => (
                    <li key={idx} className="leading-relaxed text-cyan-300">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500 font-mono text-xs">
            Loading AI explanation...
          </div>
        )}
      </div>

      {/* BOTTOM ACTIONS: Try Attack Simulation or Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onNavigateTab('attack-simulation')}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Test Another Attack Scenario</span>
        </button>

        <button
          onClick={() => onNavigateTab('verify-signature')}
          className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
        >
          <span>Verify New Document</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

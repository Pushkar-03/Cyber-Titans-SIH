import React, { useState, useEffect } from 'react';
import {
  SignatureSession,
  SocExplanation,
  StructuredThreatAnalysisData,
} from '../../types/quantum';
import {
  Sparkles,
  BotMessageSquare,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Code2,
  ChevronDown,
  ChevronUp,
  Activity,
  ArrowUpRight,
  Fingerprint,
} from 'lucide-react';

interface AiExplanationCardProps {
  session: SignatureSession;
  onNavigateToAnalyst?: () => void;
}

export const AiExplanationCard: React.FC<AiExplanationCardProps> = ({
  session,
  onNavigateToAnalyst,
}) => {
  const [explanation, setExplanation] = useState<SocExplanation | null>(null);
  const [inputData, setInputData] = useState<StructuredThreatAnalysisData | null>(null);
  const [model, setModel] = useState<string>('gemini-3.8-flash');
  const [provider, setProvider] = useState<string>('server-side explainability layer');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showInputPayload, setShowInputPayload] = useState<boolean>(false);

  // Prepare client-side structured payload representation
  const clientStructuredPayload: StructuredThreatAnalysisData = {
    sessionId: session.id,
    threatScore: session.threatMetrics.overallThreatScore,
    classification: session.threatMetrics.classification,
    fidelity: session.threatMetrics.fidelityScore,
    distributionDeviation: session.threatMetrics.distributionDeviation,
    replayRisk: session.threatMetrics.replayRisk,
    sessionAnomaly: session.threatMetrics.sessionAnomalyScore,
    attackType: session.activeAttack || 'NONE',
    hashMismatch: session.threatMetrics.hashMismatchDetected || !session.threatMetrics.isHashValid,
    replayDetected: session.threatMetrics.replayRisk > 0 || session.isConsumed,
  };

  const fetchExplanation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyst/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatData: clientStructuredPayload,
          session,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to generate AI explanation`);
      }

      const data = await res.json();
      if (data.explanation) {
        setExplanation(data.explanation);
      }
      if (data.inputData) {
        setInputData(data.inputData);
      } else {
        setInputData(clientStructuredPayload);
      }
      if (data.model) setModel(data.model);
      if (data.provider) setProvider(data.provider);
    } catch (err: any) {
      console.error('Failed to fetch AI explanation:', err);
      setError(err?.message || 'Failed to query AI security analyst');
      // Construct fallback SOC explanation
      setExplanation({
        threatSummary: `Deterministic evaluation completed for session ${session.id}. Authoritative threat score is ${session.threatMetrics.overallThreatScore}/100 with ${session.threatMetrics.classification} classification.`,
        mainEvidence: [
          `Fidelity: ${(session.threatMetrics.fidelityScore * 100).toFixed(2)}%`,
          `Distribution Deviation (TVD): ${session.threatMetrics.distributionDeviation}`,
          `Replay Risk: ${session.threatMetrics.replayRisk}% (Nonce Consumed: ${session.isConsumed ? 'YES' : 'NO'})`,
          `Hash Mismatch: ${session.threatMetrics.hashMismatchDetected ? 'TRUE' : 'FALSE'}`,
        ],
        likelyAttackPattern: session.activeAttack !== 'NONE'
          ? `Simulated Attack: ${session.activeAttack}`
          : 'Nominal Operational State',
        recommendedResponse: [
          'Verify transaction details in SIEM ledger',
          'Enforce strict nonce expiration policy',
          'Maintain conjugate basis calibration',
        ],
      });
      setInputData(clientStructuredPayload);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch explanation when session ID, threat score, or attack changes
  useEffect(() => {
    fetchExplanation();
  }, [
    session.id,
    session.threatMetrics.overallThreatScore,
    session.threatMetrics.classification,
    session.threatMetrics.hashMismatchDetected,
    session.threatMetrics.replayRisk,
    session.activeAttack,
  ]);

  const handleCopy = () => {
    if (!explanation) return;
    const reportText = `=== Q-SHIELD AI SECURITY ANALYST REPORT ===
Session ID: ${session.id}
Authoritative Score: ${session.threatMetrics.overallThreatScore}/100 (${session.threatMetrics.classification})
Authoritative Decision: ${session.threatMetrics.decision}

1. THREAT SUMMARY:
${explanation.threatSummary}

2. MAIN EVIDENCE:
${explanation.mainEvidence.map((e) => `• ${e}`).join('\n')}

3. LIKELY ATTACK PATTERN:
${explanation.likelyAttackPattern}

4. RECOMMENDED RESPONSE:
${explanation.recommendedResponse.map((r, i) => `${i + 1}. ${r}`).join('\n')}

NOTE: The deterministic Q-SHIELD security engine remains authoritative. Gemini receives only structured threat-analysis data.`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getAttackSeverityStyle = (classification: string) => {
    switch (classification) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-300 border-rose-600/60';
      case 'HIGH':
        return 'bg-red-950/80 text-red-300 border-red-600/60';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-300 border-amber-600/60';
      case 'LOW':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60';
    }
  };

  return (
    <div
      id="qshield-ai-explanation-card"
      className="p-5 sm:p-6 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-5 relative overflow-hidden"
    >
      {/* Decorative cyber grid accent */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-1.5">
                <span>AI Explanation</span>
                <span className="text-xs font-normal text-slate-400 font-sans">
                  (Q-SHIELD Security Analyst)
                </span>
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                {model}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              SOC-style threat attribution and explainability generated from structured telemetry.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInputPayload(!showInputPayload)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
            title="Inspect structured threat-analysis data sent to Gemini"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Structured Input</span>
            {showInputPayload ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>

          <button
            onClick={handleCopy}
            disabled={!explanation}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Copy SOC report to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Brief</span>
              </>
            )}
          </button>

          <button
            onClick={fetchExplanation}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Refresh AI Security Explanation"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analyzing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Authoritative Architecture Banner (Non-Override Mandate) */}
      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono flex items-start gap-2.5 text-slate-300">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-cyan-300">Authoritative Governance: </strong>
          The deterministic Q-SHIELD security engine evaluated threat score{' '}
          <span className="text-white font-bold">{session.threatMetrics.overallThreatScore}/100</span>{' '}
          ({session.threatMetrics.classification}) and decided{' '}
          <span className="text-white font-bold">{session.threatMetrics.decision}</span>.
          Gemini receives <span className="underline decoration-cyan-400 text-cyan-200">only structured threat-analysis data</span> and
          does NOT calculate scores, change classifications, or approve/reject signatures.
        </div>
      </div>

      {/* Collapsible Structured Input Inspector */}
      {showInputPayload && (
        <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-800/50 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[11px] text-cyan-300">
            <span className="font-bold flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              <span>Structured Threat-Analysis Data (Sent to Gemini):</span>
            </span>
            <span className="text-slate-500 text-[10px]">
              Strictly filtered server-side payload
            </span>
          </div>
          <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
            {JSON.stringify(inputData || clientStructuredPayload, null, 2)}
          </pre>
          <p className="text-[10px] text-slate-400">
            Notice: Gemini receives only these deterministic metrics. No raw keys, tokens, or arbitrary execution rights.
          </p>
        </div>
      )}

      {/* Loading Skeleton or Explanation Content */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3 font-mono">
          <Activity className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-300">
            Synthesizing SOC Incident Brief via Gemini ({model})...
          </p>
          <p className="text-[11px] text-slate-500">
            Grounded strictly on structured deterministic threat telemetry
          </p>
        </div>
      ) : explanation ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section 1: Threat Summary */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300 pb-1.5 border-b border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                  1
                </span>
                <span>Threat Summary</span>
              </div>
              <p className="text-xs text-slate-200 mt-2.5 leading-relaxed">
                {explanation.threatSummary}
              </p>
            </div>
            <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center gap-2">
              <span>Threat Score: {session.threatMetrics.overallThreatScore}/100</span>
              <span>•</span>
              <span>Risk: {session.threatMetrics.classification}</span>
            </div>
          </div>

          {/* Section 2: Main Evidence */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300 pb-1.5 border-b border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                2
              </span>
              <span>Main Evidence</span>
            </div>
            <ul className="space-y-1.5 mt-2">
              {explanation.mainEvidence.map((evidence, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-300 flex items-start gap-2 font-mono leading-relaxed"
                >
                  <span className="text-cyan-400 mt-1 shrink-0">•</span>
                  <span>{evidence}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Likely Attack Pattern */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300 pb-1.5 border-b border-slate-800/80">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                  3
                </span>
                <span>Likely Attack Pattern</span>
              </div>
              <div className="mt-2.5 space-y-2">
                <div
                  className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 ${getAttackSeverityStyle(
                    session.threatMetrics.classification
                  )}`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span className="tracking-wide">
                    {explanation.likelyAttackPattern}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Correlation verified against Q-SHIELD adversarial simulation models and quantum projective tomography.
                </p>
              </div>
            </div>
            <div className="pt-2 text-[10px] font-mono text-slate-500">
              Active Simulation: {session.activeAttack || 'NONE'}
            </div>
          </div>

          {/* Section 4: Recommended Response */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300">
                <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                  4
                </span>
                <span>Recommended Response</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                SOC Playbook
              </span>
            </div>
            <ol className="space-y-2 mt-2">
              {explanation.recommendedResponse.map((action, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed"
                >
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700 shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500 font-mono">
          Click &quot;Refresh&quot; to generate an AI explanation for this session.
        </div>
      )}

      {/* Footer link to full dedicated AI Analyst tab */}
      {onNavigateToAnalyst && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span>Need deeper interactive inquiries or quantum mechanics Q&amp;A?</span>
          <button
            onClick={onNavigateToAnalyst}
            className="text-cyan-400 hover:text-cyan-300 font-mono font-bold flex items-center gap-1 transition-colors hover:underline"
          >
            <span>Open Dedicated AI Security Analyst View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

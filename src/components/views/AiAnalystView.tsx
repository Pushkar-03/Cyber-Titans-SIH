import React, { useState, useEffect } from 'react';
import { SignatureSession, SocExplanation, StructuredThreatAnalysisData } from '../../types/quantum';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  RotateCcw,
  Code2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GlossaryTooltip } from '../common/GlossaryTooltip';

interface AiAnalystViewProps {
  activeSession: SignatureSession | null;
  sessions: SignatureSession[];
  onSelectSession: (session: SignatureSession) => void;
}

const PRESET_QUESTIONS = [
  {
    label: 'Root Cause Breakdown',
    prompt: 'Provide a structured SOC incident brief explaining why this session was assigned its specific threat score and classification.',
  },
  {
    label: 'Deviation vs Tampering',
    prompt: 'Why does statistical distribution deviation in Bell-state measurements indicate physical or cryptographic tampering?',
  },
  {
    label: 'SOC Containment Playbook',
    prompt: 'What containment, mitigation, and key rotation actions should a SOC Tier-2 analyst execute for this session?',
  },
  {
    label: 'Quantum Mechanics Explained',
    prompt: 'Explain how Bell-state entanglement and Pauli correction (X/Z feedforward) protect against signature cloning.',
  },
];

export const AiAnalystView: React.FC<AiAnalystViewProps> = ({
  activeSession,
  sessions,
  onSelectSession,
}) => {
  const session = activeSession || sessions[0] || null;

  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [structuredExplanation, setStructuredExplanation] = useState<SocExplanation | null>(null);
  const [inputData, setInputData] = useState<StructuredThreatAnalysisData | null>(null);
  const [showInputPayload, setShowInputPayload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>('gemini-3.8-flash');

  // Trigger default root cause analysis if no response yet
  useEffect(() => {
    if (session && !response && !isLoading) {
      handleQueryAnalyst();
    }
  }, [session?.id, session?.threatMetrics?.overallThreatScore]);

  const handleQueryAnalyst = async (customPrompt?: string) => {
    if (!session) return;
    const queryText = customPrompt || prompt;

    setIsLoading(true);
    setResponse(null);

    const structuredPayload: StructuredThreatAnalysisData = {
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

    try {
      const res = await fetch('/api/analyst/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatData: structuredPayload,
          session,
          customPrompt: queryText,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.explanation && typeof data.explanation === 'object') {
        setStructuredExplanation(data.explanation);
      }
      if (data.inputData) {
        setInputData(data.inputData);
      } else {
        setInputData(structuredPayload);
      }
      if (data.explanationMarkdown) {
        setResponse(data.explanationMarkdown);
      } else if (typeof data.explanation === 'string') {
        setResponse(data.explanation);
      } else if (data.explanation) {
        setResponse(
          `### 1. Threat Summary\n${data.explanation.threatSummary}\n\n### 2. Main Evidence\n${data.explanation.mainEvidence?.map((e: string) => `• ${e}`).join('\n')}\n\n### 3. Likely Attack Pattern\n**${data.explanation.likelyAttackPattern}**\n\n### 4. Recommended Response\n${data.explanation.recommendedResponse?.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}`
        );
      }
      if (data.model) setModelUsed(data.model);
    } catch (err: any) {
      // Fallback deterministic analysis if backend call fails
      const fallbackExplanation: SocExplanation = {
        threatSummary: `Deterministic evaluation completed for session ${session.id}. Calculated threat score is ${session.threatMetrics.overallThreatScore}/100 (${session.threatMetrics.classification} Risk).`,
        mainEvidence: [
          `Quantum State Fidelity: ${(session.threatMetrics.fidelityScore * 100).toFixed(1)}%`,
          `Total Variation Distance: ${session.threatMetrics.distributionDeviation}`,
          `Nonce Replay State: ${session.threatMetrics.replayRisk > 0 ? 'CRITICAL (Already Consumed)' : 'FRESH (Single-Use)'}`,
          `Payload Hash Integrity: ${session.threatMetrics.isHashValid ? 'MATCH' : 'MISMATCH'}`,
        ],
        likelyAttackPattern: session.activeAttack !== 'NONE'
          ? `Simulated Attack: ${session.activeAttack}`
          : 'Normal Statistical Distribution',
        recommendedResponse: [
          session.threatMetrics.decision === 'PASS'
            ? 'Proceed with transaction authorization and consume session nonce.'
            : 'Quarantine transaction and alert SOC team of integrity failure.',
          'Log full projective distribution parameters to security SIEM.',
        ],
      };

      setStructuredExplanation(fallbackExplanation);
      setInputData(structuredPayload);
      setResponse(
        `### 1. Threat Summary\n${fallbackExplanation.threatSummary}\n\n### 2. Main Evidence\n${fallbackExplanation.mainEvidence.map((e) => `• ${e}`).join('\n')}\n\n### 3. Likely Attack Pattern\n**${fallbackExplanation.likelyAttackPattern}**\n\n### 4. Recommended Response\n${fallbackExplanation.recommendedResponse.map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Strict Technical Positioning */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
              AI EXPLAINABILITY LAYER
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Model: {modelUsed} (Server-Side Proxy)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <BotMessageSquare className="w-5 h-5 text-cyan-400" />
            <span>AI Security Analyst &amp; SOC Advisor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Translates deterministic quantum statistical metrics and cryptographic hashes into plain cybersecurity incident briefs.
          </p>
        </div>

        {/* Technical Positioning Disclaimer Badge */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 max-w-xs">
          <strong className="text-cyan-400 block text-[10px] uppercase">
            Architectural Positioning Note
          </strong>
          Gemini does NOT compute security decisions; the deterministic engine calculates all metrics. Gemini provides explanation and advisory recommendations.
        </div>
      </div>

      {/* Session Context Bar & Presets */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Session:</span>
            {session ? (
              <select
                value={session.id}
                onChange={(e) => {
                  const found = sessions.find((s) => s.id === e.target.value);
                  if (found) onSelectSession(found);
                }}
                className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id.slice(0, 16)} — {s.threatMetrics.classification} ({s.threatMetrics.overallThreatScore}/100)
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-slate-500">No session available</span>
            )}
          </div>

          {session && (
            <div className="flex items-center gap-3 text-[11px]">
              <span>
                Fidelity:{' '}
                <strong className="text-cyan-300">
                  {(session.threatMetrics.fidelityScore * 100).toFixed(1)}%
                </strong>
              </span>
              <span>
                TVD:{' '}
                <strong className="text-cyan-300">
                  {session.threatMetrics.distributionDeviation}
                </strong>
              </span>
              <span>
                Score:{' '}
                <strong
                  className={
                    session.threatMetrics.overallThreatScore > 60
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }
                >
                  {session.threatMetrics.overallThreatScore}/100
                </strong>
              </span>
            </div>
          )}
        </div>

        {/* Preset Question Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-500">Quick Analysis Prompts:</span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleQueryAnalyst(q.prompt)}
              disabled={isLoading || !session}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 text-xs font-mono border border-slate-700 transition-colors disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: AI Response Markdown Box */}
      <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-white">
              Generated Threat Intelligence Brief
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInputPayload(!showInputPayload)}
              className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Inspect structured threat-analysis data sent to Gemini"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showInputPayload ? 'Hide Telemetry' : 'Inspect Input Data'}</span>
            </button>

            {response && (
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Report</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Structured Input Inspector */}
        {showInputPayload && (
          <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-800/50 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-cyan-300">
              <span className="font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>Structured Threat-Analysis Data (Server to Gemini Only):</span>
              </span>
              <span className="text-slate-500 text-[10px]">
                Deterministic Q-SHIELD metrics
              </span>
            </div>
            <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto leading-relaxed">
              {JSON.stringify(inputData, null, 2)}
            </pre>
            <p className="text-[10px] text-slate-400">
              Mandate: Gemini receives only this structured threat-analysis data. Scores and decisions remain authoritative.
            </p>
          </div>
        )}

        {/* Response display */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3 font-mono text-xs text-slate-400">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-slate-300">
              Querying Gemini Explainability Engine ({modelUsed})...
            </p>
            <p className="text-[11px] text-slate-500">
              Correlating Bell-state measurement projections with SOC incident taxonomy
            </p>
          </div>
        ) : response ? (
          <div className="markdown-body text-slate-200 text-xs leading-relaxed space-y-3 max-w-none">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        ) : (
          <div className="py-12 text-center font-mono text-xs text-slate-500">
            Select a quick prompt or type a question below to consult the AI Security Analyst.
          </div>
        )}

        {/* Custom Question Input Box */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQueryAnalyst();
            }}
            placeholder="Ask a technical question about quantum measurement, Bell states, or attack containment..."
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleQueryAnalyst()}
            disabled={isLoading || !prompt.trim() || !session}
            className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask Analyst</span>
          </button>
        </div>
      </div>
    </div>
  );
};

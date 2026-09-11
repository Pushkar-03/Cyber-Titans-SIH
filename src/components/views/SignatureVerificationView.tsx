import React, { useState, useEffect } from 'react';
import {
  SignatureSession,
  QuantumStateVector,
  MeasurementDistribution,
  PauliCorrection,
} from '../../types/quantum';
import {
  computeSHA256,
  generateSessionId,
  generateTransactionId,
  generateDigitalSignature,
} from '../../utils/crypto';
import {
  generateQuantumState,
  generateTeleportationStages,
  computePauliCorrection,
  simulateMeasurementDistribution,
} from '../../utils/quantumEngine';
import { evaluateThreatMetrics } from '../../utils/threatEngine';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  FileText,
  Hash,
  Cpu,
  RotateCw,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  HelpCircle,
  Binary,
  Layers,
} from 'lucide-react';
import { GlossaryTooltip } from '../common/GlossaryTooltip';

interface SignatureVerificationViewProps {
  activeSession: SignatureSession | null;
  onSaveSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: any) => void;
}

const SAMPLE_PRESETS = [
  {
    title: 'High-Value Wire Transfer',
    message: 'INTERBANK_SWIFT: $1,250,000 USD -> ACCT_ID_FED_NODE_882 // AUTH_TOKEN_HIGH',
  },
  {
    title: 'Critical Grid Breaker Override',
    message: 'GRID_SCADA_EXEC: TRIP_SUBSTATION_BREAKER_SEC_07 // TIMELOCK: 1725710000',
  },
  {
    title: 'Satellite Uplink Telemetry',
    message: 'ORBITAL_PROPULSION_VECTOR: DELTA_V_0.124_MS // AXIS: [0.707, 0.0, 0.707]',
  },
];

export const SignatureVerificationView: React.FC<SignatureVerificationViewProps> = ({
  activeSession,
  onSaveSession,
  onNavigateTab,
}) => {
  const [transactionId, setTransactionId] = useState(
    activeSession?.transactionId || generateTransactionId()
  );
  const [message, setMessage] = useState(
    activeSession?.message || SAMPLE_PRESETS[0].message
  );

  // Stored state for current session
  const [session, setSession] = useState<SignatureSession | null>(activeSession);
  const [liveHash, setLiveHash] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Compute live SHA-256 as message changes
  useEffect(() => {
    let isMounted = true;
    computeSHA256(message).then((h) => {
      if (isMounted) setLiveHash(h);
    });
    return () => {
      isMounted = false;
    };
  }, [message]);

  // Check if current message has drifted from the signed hash (Tamper Detection)
  const isMessageTampered = session && session.originalHash !== liveHash;

  // 1. Generate Signature & Quantum Session
  const handleGenerateSignature = async () => {
    setIsGenerating(true);
    setVerificationFeedback(null);

    const hash = await computeSHA256(message);
    const newSessionId = generateSessionId();
    const signatureToken = generateDigitalSignature(hash);
    const quantumState = generateQuantumState(hash);
    const teleportationStages = generateTeleportationStages(quantumState);
    const pauliCorrection = computePauliCorrection(hash);
    const measurementDist = simulateMeasurementDistribution(hash, 'NONE');

    const threatMetrics = evaluateThreatMetrics({
      measurementDist,
      originalHash: hash,
      currentMessageHash: hash,
      isSessionConsumed: false,
      attackType: 'NONE',
    });

    const newSession: SignatureSession = {
      id: newSessionId,
      transactionId,
      timestamp: new Date().toISOString(),
      message,
      originalHash: hash,
      verifiedHash: hash,
      signatureToken,
      quantumState,
      teleportationStages,
      pauliCorrection,
      measurementDist,
      threatMetrics,
      activeAttack: 'NONE',
      status: 'VERIFIED',
      isConsumed: false,
      sourceIp: '127.0.0.1 (Local Edge Verifier)',
      nodeLocation: 'Delhi Hub Quantum Gate Alpha',
      authLevel: 'CRITICAL_INFRASTRUCTURE',
    };

    setTimeout(() => {
      setSession(newSession);
      onSaveSession(newSession);
      setIsGenerating(false);
      setVerificationFeedback('Signature generated with quantum carrier state. Ready for verification.');
    }, 350);
  };

  // 2. Verify Signature
  const handleVerifySignature = async () => {
    if (!session) return;
    setIsVerifying(true);

    const currentHash = await computeSHA256(message);
    const hashMatches = currentHash === session.originalHash;

    // Recalculate metrics deterministically
    const threatMetrics = evaluateThreatMetrics({
      measurementDist: session.measurementDist,
      originalHash: session.originalHash,
      currentMessageHash: currentHash,
      isSessionConsumed: session.isConsumed,
      attackType: session.activeAttack,
    });

    const updatedSession: SignatureSession = {
      ...session,
      verifiedHash: currentHash,
      threatMetrics,
      status: threatMetrics.decision === 'PASS' 
        ? 'VERIFIED' 
        : threatMetrics.decision === 'REVIEW_REQUIRED' 
        ? 'FLAGGED' 
        : 'REJECTED',
    };

    setTimeout(() => {
      setSession(updatedSession);
      onSaveSession(updatedSession);
      setIsVerifying(false);
      if (!hashMatches) {
        setVerificationFeedback('CRITICAL: Message integrity check FAILED. Cryptographic hash mismatch detected.');
      } else if (threatMetrics.decision === 'PASS') {
        setVerificationFeedback('PASS: Signature cryptographically verified and quantum distribution matches expected Bell projections.');
      } else {
        setVerificationFeedback(`WARNING: Verification completed with status: ${threatMetrics.decision} (${threatMetrics.classification} Risk).`);
      }
    }, 400);
  };

  const handleResetTx = () => {
    setTransactionId(generateTransactionId());
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>Digital Signature Verification Gateway</span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SIMULATED ABSTRACTION
            </span>
            <span className="text-xs text-cyan-400/90 font-mono">
              Quantum computation simulated for prototype demonstration.
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Combines NIST-standard cryptographic hashing (SHA-256) with quantum-inspired teleportation state verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Sample Presets:</span>
          {SAMPLE_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setMessage(p.message)}
              className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Preset {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Left, Quantum State Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Message & Transaction Form */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>Transaction Identifier</span>
              </label>
              <button
                onClick={handleResetTx}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>Regenerate ID</span>
              </button>
            </div>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="TX-SIH-XXXXX"
            />

            {/* Message Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Message Payload to Sign</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">
                  {message.length} Characters
                </span>
              </div>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-lg text-sm font-mono text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
                placeholder="Enter payload string..."
              />
            </div>

            {/* Live SHA-256 Display */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-cyan-400" />
                  <span>Computed SHA-256 Digest:</span>
                </span>
                {session && (
                  <span className={isMessageTampered ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {isMessageTampered ? 'MISMATCH (Tampered)' : 'MATCHES SIGNED HASH'}
                  </span>
                )}
              </div>
              <div className="text-xs font-mono text-slate-300 break-all select-all">
                {liveHash || 'Calculating...'}
              </div>
            </div>

            {/* Tampering Warning Banner */}
            {isMessageTampered && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-pulse">
                <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-mono block">LIVE PAYLOAD MISMATCH DETECTED</strong>
                  The message text has been edited after signature creation. The original signed hash was:
                  <span className="font-mono block text-[11px] text-rose-300 break-all mt-0.5">
                    {session?.originalHash}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleGenerateSignature}
                disabled={isGenerating || !message.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.25)] disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isGenerating ? 'Computing Quantum State...' : '1. Generate Signature & State'}</span>
              </button>

              <button
                onClick={handleVerifySignature}
                disabled={isVerifying || !session}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isVerifying ? 'Verifying Distribution...' : '2. Verify Signature'}</span>
              </button>
            </div>

            {/* Verification Status Feedback Alert */}
            {verificationFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-mono border flex items-center gap-2 ${
                  verificationFeedback.includes('CRITICAL') || isMessageTampered
                    ? 'bg-rose-950/60 text-rose-200 border-rose-800'
                    : verificationFeedback.includes('WARNING')
                    ? 'bg-yellow-950/60 text-yellow-200 border-yellow-800'
                    : 'bg-emerald-950/60 text-emerald-200 border-emerald-800'
                }`}
              >
                {verificationFeedback.includes('CRITICAL') || isMessageTampered ? (
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{verificationFeedback}</span>
              </div>
            )}
          </div>

          {/* Quick Jump Options */}
          {session && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-400">Current Session: {session.id.slice(0, 16)}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab('threat-detection')}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[11px] border border-slate-700 transition-colors"
                >
                  Analyze Threats &rarr;
                </button>
                <button
                  onClick={() => onNavigateTab('attack-simulator')}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-mono text-[11px] border border-slate-700 transition-colors"
                >
                  Test Attacks &rarr;
                </button>
                <button
                  onClick={() => onNavigateTab('ai-security-analyst')}
                  className="px-2.5 py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 font-mono text-[11px] border border-cyan-800/80 transition-colors"
                >
                  Ask AI Analyst &rarr;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Quantum Carrier State & Verification Metadata (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {session ? (
            <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Quantum Telemetry Metadata</span>
                </h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                  SIMULATED
                </span>
              </div>

              {/* Quantum State Vector Display */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Injected Carrier State:</span>
                  <GlossaryTooltip term="Fidelity" />
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-cyan-900/40 font-mono text-xs text-cyan-300">
                  {session.quantumState.label}
                </div>

                {/* Bloch Coordinates */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">THETA (θ)</span>
                    <span className="text-slate-200 font-bold">{session.quantumState.theta}°</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">PHI (φ)</span>
                    <span className="text-slate-200 font-bold">{session.quantumState.phi}°</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">BLOCH [X,Y,Z]</span>
                    <span className="text-slate-200 font-bold">
                      {session.quantumState.blochCoordinates.z}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pauli Correction Syndrome */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Feed-Forward Syndrome:</span>
                  <GlossaryTooltip term="Pauli Correction" />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-300">
                    Bits: (m₁={session.pauliCorrection.m1}, m₂={session.pauliCorrection.m2})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    Gate: {session.pauliCorrection.appliedGate}
                  </span>
                </div>
              </div>

              {/* Statistical Measurement Summary */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Measurement Probabilities:</span>
                  <GlossaryTooltip term="Distribution Deviation" />
                </div>
                <div className="grid grid-cols-4 gap-1.5 font-mono text-center text-xs">
                  {session.measurementDist.histogram.map((h) => (
                    <div
                      key={h.state}
                      className="p-2 rounded bg-slate-950 border border-slate-800 flex flex-col items-center"
                    >
                      <span className="text-[10px] text-slate-400">|{h.state}⟩</span>
                      <span className="font-bold text-cyan-300">
                        {(h.observedProbability * 100).toFixed(1)}%
                      </span>
                      <span className="text-[9px] text-slate-500">Exp: 25%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Engine Evaluation */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Deterministic Threat Score:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      session.threatMetrics.classification === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : session.threatMetrics.classification === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : session.threatMetrics.classification === 'MEDIUM'
                        ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}
                  >
                    {session.threatMetrics.overallThreatScore}/100 ({session.threatMetrics.classification})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                  <div>
                    Fidelity:{' '}
                    <strong className="text-slate-200">
                      {(session.threatMetrics.fidelityScore * 100).toFixed(2)}%
                    </strong>
                  </div>
                  <div>
                    Deviation TVD:{' '}
                    <strong className="text-slate-200">
                      {session.threatMetrics.distributionDeviation}
                    </strong>
                  </div>
                  <div>
                    Replay Nonce:{' '}
                    <strong className={session.threatMetrics.replayRisk > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {session.threatMetrics.replayRisk > 0 ? 'REPLAY DETECTED' : 'CLEAN'}
                    </strong>
                  </div>
                  <div>
                    Decision:{' '}
                    <strong
                      className={
                        session.threatMetrics.decision === 'PASS'
                          ? 'text-emerald-400'
                          : session.threatMetrics.decision === 'REVIEW_REQUIRED'
                          ? 'text-yellow-400'
                          : 'text-rose-400'
                      }
                    >
                      {session.threatMetrics.decision}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
              <Binary className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-mono font-bold text-slate-300">
                No Active Quantum Session
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Fill in the transaction form and click "Generate Signature &amp; State" to initialize the simulated quantum verification carrier.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

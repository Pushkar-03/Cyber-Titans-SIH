import React, { useState, useMemo, useEffect } from 'react';
import {
  SignatureSession,
  AttackType,
  MeasurementDistribution,
} from '../../types/quantum';
import {
  simulateMeasurementDistribution,
  calculateFidelity,
} from '../../utils/quantumEngine';
import { evaluateThreatMetrics } from '../../utils/threatEngine';
import { computeSHA256 } from '../../utils/crypto';
import { sessionStore } from '../../services/sessionStore';
import {
  Flame,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Radio,
  FileCode,
  Layers,
  ArrowRight,
  AlertOctagon,
  Sparkles,
  Sliders,
  Copy,
  CheckCircle2,
  XCircle,
  Activity,
  Repeat,
  FileWarning,
  Binary,
  Cpu,
  RefreshCw,
  Server,
} from 'lucide-react';
import { GlossaryTooltip } from '../common/GlossaryTooltip';

interface AttackSimulatorViewProps {
  activeSession: SignatureSession | null;
  onUpdateSession: (updatedSession: SignatureSession) => void;
  onNavigateTab: (tab: any) => void;
}

interface AttackMeta {
  type: AttackType;
  title: string;
  badge: string;
  shortDesc: string;
  mechanism: string;
  expectedOutcome: string;
  color: string;
}

const ATTACKS: AttackMeta[] = [
  {
    type: 'REPLAY',
    title: '1. Replay Attack',
    badge: 'NONCE REUSE',
    shortDesc: 'Adversary intercepts a previously authenticated quantum signature ticket and re-submits it.',
    mechanism: 'The engine queries the single-use nonce ledger. The consumed session ID triggers 100% Replay Risk.',
    expectedOutcome: 'Replay risk becomes critical (100%) and the session is rejected.',
    color: 'border-rose-500/60 bg-rose-950/30 text-rose-300 hover:border-rose-400',
  },
  {
    type: 'TAMPERING',
    title: '2. Signature Tampering',
    badge: 'CRYPTOGRAPHIC INTEGRITY',
    shortDesc: 'Adversary modifies the payload message after quantum signature token generation.',
    mechanism: 'SHA-256 digest recalculation diverges from the signed digest. Cryptographic integrity collapses.',
    expectedOutcome: 'SHA-256 hash mismatch and immediate signature rejection.',
    color: 'border-red-500/60 bg-red-950/30 text-red-300 hover:border-red-400',
  },
  {
    type: 'MANIPULATION',
    title: '3. Measurement Manipulation',
    badge: 'DETECTOR SKEW',
    shortDesc: 'Adversary tampers with the single-photon avalanche detectors (SPAD) or forces basis collapse.',
    mechanism: 'Projective probabilities shift away from nominal Bell-state expectations, spiking JSD divergence.',
    expectedOutcome: 'Distribution deviation increases and threat score increases.',
    color: 'border-amber-500/60 bg-amber-950/30 text-amber-300 hover:border-amber-400',
  },
  {
    type: 'QUANTUM_NOISE',
    title: '4. Quantum Noise',
    badge: 'DECOHERENCE CHANNEL',
    shortDesc: 'Simulates physical quantum channel noise, thermal drift, and fiber attenuation from 0% to 30%.',
    mechanism: 'Applies depolarizing channel mixing that diffuses state fidelity and increases statistical spread.',
    expectedOutcome: 'Configurable noise shifts distribution; elevates threat to MEDIUM / REVIEW_REQUIRED.',
    color: 'border-yellow-500/60 bg-yellow-950/30 text-yellow-300 hover:border-yellow-400',
  },
  {
    type: 'DUPLICATION',
    title: '5. Session Duplication',
    badge: 'RACE CONDITION',
    shortDesc: 'Adversary attempts to submit the identical verification session multiple times across gateways.',
    mechanism: 'Concurrent gateway submission ledger flags duplicate nonce contention and concurrent replay.',
    expectedOutcome: 'Duplicate session detection and rejection with duplicate submission counter.',
    color: 'border-purple-500/60 bg-purple-950/30 text-purple-300 hover:border-purple-400',
  },
];

interface SubmissionLogItem {
  id: number;
  timestamp: string;
  gateway: string;
  attemptNumber: number;
  status: number;
  message: string;
  isDuplicate: boolean;
}

export const AttackSimulatorView: React.FC<AttackSimulatorViewProps> = ({
  activeSession,
  onUpdateSession,
  onNavigateTab,
}) => {
  // Selected simulation tab
  const [selectedAttackTab, setSelectedAttackTab] = useState<AttackType>(
    activeSession?.activeAttack && activeSession.activeAttack !== 'NONE'
      ? activeSession.activeAttack
      : 'REPLAY'
  );

  // Status message / audit log
  const [simulationLog, setSimulationLog] = useState<string | null>(null);

  // --- Attack 2: Tampering state ---
  const [tamperedText, setTamperedText] = useState<string>(
    activeSession?.message || 'CRITICAL_COMMAND: AUTHORIZE_DISPATCH'
  );
  const [liveTamperedHash, setLiveTamperedHash] = useState<string>(
    activeSession?.verifiedHash || activeSession?.originalHash || ''
  );
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // --- Attack 3: Measurement Manipulation state ---
  const [manipulatedProbabilities, setManipulatedProbabilities] = useState<{
    '00': number;
    '01': number;
    '10': number;
    '11': number;
  }>({
    '00': 0.58,
    '01': 0.08,
    '10': 0.28,
    '11': 0.06,
  });

  // --- Attack 4: Quantum Noise state (0% to 30%) ---
  const [noisePercentage, setNoisePercentage] = useState<number>(15);

  // --- Attack 5: Session Duplication state ---
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionLogItem[]>([
    {
      id: 1,
      timestamp: 'Initial Registration',
      gateway: 'Gateway-Alpha (Primary)',
      attemptNumber: 1,
      status: 200,
      message: 'Initial session ticket authorized and recorded in ledger.',
      isDuplicate: false,
    },
  ]);

  // Sync state when activeSession changes
  useEffect(() => {
    if (activeSession) {
      if (activeSession.activeAttack && activeSession.activeAttack !== 'NONE') {
        setSelectedAttackTab(activeSession.activeAttack);
      }
      setTamperedText(activeSession.message);
      setLiveTamperedHash(activeSession.verifiedHash);
    }
  }, [activeSession?.id]);

  // Update live hash when tamperedText changes
  useEffect(() => {
    let isMounted = true;
    const calculateHash = async () => {
      setIsHashing(true);
      try {
        const hash = await computeSHA256(tamperedText);
        if (isMounted) {
          setLiveTamperedHash(hash);
        }
      } catch (err) {
        console.error('Hash calculation error:', err);
      } finally {
        if (isMounted) setIsHashing(false);
      }
    };
    calculateHash();
    return () => {
      isMounted = false;
    };
  }, [tamperedText]);

  // Nominal baseline calculation for comparative display
  const baseline = useMemo(() => {
    if (!activeSession) return null;
    const baselineDist = simulateMeasurementDistribution(activeSession.originalHash, 'NONE', 0);
    const baselineFidelity = calculateFidelity(baselineDist);
    const baselineThreatMetrics = evaluateThreatMetrics({
      measurementDist: baselineDist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: false,
      attackType: 'NONE',
    });
    return {
      distribution: baselineDist,
      fidelity: baselineFidelity,
      threatMetrics: baselineThreatMetrics,
    };
  }, [activeSession?.originalHash]);

  if (!activeSession || !baseline) {
    return (
      <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
        <Flame className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-sm font-mono font-bold text-slate-300">
          No Verification Session Loaded
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Generate or verify a digital signature session before executing adversarial simulations.
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

  // Helper to commit state update to both local session and sessionStore
  const commitSessionUpdate = (updated: SignatureSession, logMessage: string) => {
    sessionStore.updateSession(updated);
    onUpdateSession(updated);
    setSimulationLog(logMessage);
  };

  // --- ATTACK 1: REPLAY ATTACK ---
  const handleLaunchReplayAttack = () => {
    // 1. Mark session as consumed in nonce ledger
    sessionStore.markNonceConsumed(activeSession.id);

    // Distribution remains statistically authentic, but replay risk is triggered
    const dist = simulateMeasurementDistribution(activeSession.originalHash, 'REPLAY');
    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: true,
      attackType: 'REPLAY',
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      isConsumed: true,
      activeAttack: 'REPLAY',
      measurementDist: dist,
      threatMetrics,
      status: 'REJECTED',
    };

    commitSessionUpdate(
      updatedSession,
      `[REPLAY ATTACK LAUNCHED] Session ID ${activeSession.id} re-submitted after prior consumption. Replay risk surged to 100% (CRITICAL). Session REJECTED.`
    );
  };

  const handleResetReplay = () => {
    sessionStore.clearConsumedNonce(activeSession.id);
    const dist = simulateMeasurementDistribution(activeSession.originalHash, 'NONE');
    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: false,
      attackType: 'NONE',
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      isConsumed: false,
      activeAttack: 'NONE',
      measurementDist: dist,
      threatMetrics,
      status: 'VERIFIED',
    };

    commitSessionUpdate(
      updatedSession,
      `[NONCE RESTORED] Session ID ${activeSession.id} cleared from consumed ledger. Single-use ticket marked FRESH.`
    );
  };

  // --- ATTACK 2: SIGNATURE TAMPERING ---
  const handleApplyTamperedMessage = async (customMessage?: string) => {
    const msg = customMessage !== undefined ? customMessage : tamperedText;
    const computedHash = await computeSHA256(msg);
    setTamperedText(msg);
    setLiveTamperedHash(computedHash);

    const isMatch = computedHash.toLowerCase() === activeSession.originalHash.toLowerCase();
    const attackType: AttackType = isMatch ? 'NONE' : 'TAMPERING';
    const dist = simulateMeasurementDistribution(activeSession.originalHash, attackType);

    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: computedHash,
      isSessionConsumed: activeSession.isConsumed,
      attackType,
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      verifiedHash: computedHash,
      activeAttack: attackType,
      measurementDist: dist,
      threatMetrics,
      status: isMatch ? 'VERIFIED' : 'REJECTED',
    };

    commitSessionUpdate(
      updatedSession,
      isMatch
        ? `[MESSAGE RESTORED] Payload restored to original text. SHA-256 match confirmed.`
        : `[TAMPERING INJECTED] Message modified post-signature. SHA-256 mismatch detected: expected ${activeSession.originalHash.slice(0, 12)}... vs observed ${computedHash.slice(0, 12)}... Session REJECTED.`
    );
  };

  const handleRestoreOriginalMessage = () => {
    handleApplyTamperedMessage(activeSession.message);
  };

  // --- ATTACK 3: MEASUREMENT MANIPULATION ---
  const handleApplyMeasurementManipulation = (
    customProbs?: { '00': number; '01': number; '10': number; '11': number }
  ) => {
    const probs = customProbs || manipulatedProbabilities;
    setManipulatedProbabilities(probs);

    const dist = simulateMeasurementDistribution(
      activeSession.originalHash,
      'MANIPULATION',
      0.15,
      probs
    );

    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: activeSession.isConsumed,
      attackType: 'MANIPULATION',
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      activeAttack: 'MANIPULATION',
      measurementDist: dist,
      threatMetrics,
      status: threatMetrics.decision === 'PASS' ? 'VERIFIED' : 'REJECTED',
    };

    commitSessionUpdate(
      updatedSession,
      `[MEASUREMENT MANIPULATION] Detector projective distribution biased: |00⟩=${(probs['00'] * 100).toFixed(1)}%, |01⟩=${(probs['01'] * 100).toFixed(1)}%, |10⟩=${(probs['10'] * 100).toFixed(1)}%, |11⟩=${(probs['11'] * 100).toFixed(1)}%. JSD deviation surged to ${threatMetrics.distributionDeviation}. Threat score: ${threatMetrics.overallThreatScore}/100.`
    );
  };

  const handleResetMeasurementManipulation = () => {
    const balancedProbs = { '00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25 };
    setManipulatedProbabilities(balancedProbs);

    const dist = simulateMeasurementDistribution(
      activeSession.originalHash,
      'NONE',
      0,
      balancedProbs
    );

    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: activeSession.isConsumed,
      attackType: 'NONE',
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      activeAttack: 'NONE',
      measurementDist: dist,
      threatMetrics,
      status: 'VERIFIED',
    };

    commitSessionUpdate(
      updatedSession,
      `[MEASUREMENT RESTORED] Detectors recalibrated to nominal Bell-state reference (25% per state).`
    );
  };

  // --- ATTACK 4: QUANTUM NOISE (0% to 30%) ---
  const handleApplyQuantumNoise = (noiseVal: number) => {
    setNoisePercentage(noiseVal);

    const isClean = noiseVal === 0;
    const attackType: AttackType = isClean ? 'NONE' : 'QUANTUM_NOISE';
    const dist = simulateMeasurementDistribution(
      activeSession.originalHash,
      attackType,
      noiseVal / 100
    );

    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: activeSession.isConsumed,
      attackType,
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      activeAttack: attackType,
      measurementDist: dist,
      threatMetrics,
      status:
        threatMetrics.decision === 'PASS'
          ? 'VERIFIED'
          : threatMetrics.decision === 'REVIEW_REQUIRED'
          ? 'FLAGGED'
          : 'REJECTED',
    };

    commitSessionUpdate(
      updatedSession,
      `[QUANTUM NOISE: ${noiseVal}%] Depolarizing channel noise applied. Fidelity: ${(threatMetrics.fidelityScore * 100).toFixed(2)}%, JSD: ${threatMetrics.distributionDeviation}. Threat score: ${threatMetrics.overallThreatScore}/100 (${threatMetrics.decision}).`
    );
  };

  // --- ATTACK 5: SESSION DUPLICATION ---
  const handleSubmitDuplicateSession = () => {
    // Record submission attempt in session store
    const { submissionCount, isDuplicate } = sessionStore.recordSubmission(activeSession.id);

    const newLogItem: SubmissionLogItem = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      gateway: submissionCount % 2 === 0 ? 'Gateway-Beta (Edge Node)' : 'Gateway-Alpha (Primary)',
      attemptNumber: submissionCount,
      status: isDuplicate ? 409 : 200,
      message: isDuplicate
        ? `HTTP 409 CONFLICT: Duplicate session detected! Nonce collision for ${activeSession.id}.`
        : `HTTP 200 OK: Initial session registration authorized. Nonce locked to distributed ledger.`,
      isDuplicate,
    };

    setSubmissionHistory((prev) => [newLogItem, ...prev]);

    // Update session state
    const dist = simulateMeasurementDistribution(
      activeSession.originalHash,
      isDuplicate ? 'DUPLICATION' : 'NONE'
    );

    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: true,
      attackType: isDuplicate ? 'DUPLICATION' : 'NONE',
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      isConsumed: true,
      activeAttack: isDuplicate ? 'DUPLICATION' : 'NONE',
      measurementDist: dist,
      threatMetrics,
      status: isDuplicate ? 'REJECTED' : 'VERIFIED',
    };

    commitSessionUpdate(
      updatedSession,
      isDuplicate
        ? `[DUPLICATE SESSION REJECTED] Submission attempt #${submissionCount} for session ${activeSession.id} intercepted. Nonce collision error. Decision: BLOCKED.`
        : `[SESSION REGISTERED] Submission attempt #${submissionCount} registered successfully.`
    );
  };

  const handleResetDuplicationCounter = () => {
    sessionStore.resetSubmissions(activeSession.id);
    setSubmissionHistory([
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        gateway: 'Gateway-Alpha (Primary)',
        attemptNumber: 1,
        status: 200,
        message: 'Ledger reset. Session nonce refreshed.',
        isDuplicate: false,
      },
    ]);

    const dist = simulateMeasurementDistribution(activeSession.originalHash, 'NONE');
    const threatMetrics = evaluateThreatMetrics({
      measurementDist: dist,
      originalHash: activeSession.originalHash,
      currentMessageHash: activeSession.originalHash,
      isSessionConsumed: false,
      attackType: 'NONE',
    });

    const updatedSession: SignatureSession = {
      ...activeSession,
      isConsumed: false,
      activeAttack: 'NONE',
      measurementDist: dist,
      threatMetrics,
      status: 'VERIFIED',
    };

    commitSessionUpdate(
      updatedSession,
      `[DUPLICATION RESET] Nonce ledger cleared for session ${activeSession.id}. Submission counter reset to 1.`
    );
  };

  // Format decision badge
  const renderDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'PASS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            PASS (AUTHORIZED)
          </span>
        );
      case 'REVIEW_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-yellow-950/80 text-yellow-300 border border-yellow-500/50 animate-pulse">
            <Activity className="w-3.5 h-3.5 text-yellow-400" />
            REVIEW REQUIRED
          </span>
        );
      case 'BLOCKED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-950/80 text-rose-300 border border-rose-500/50">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            BLOCKED (REJECTED)
          </span>
        );
    }
  };

  // Find active attack definition
  const currentAttackDef = ATTACKS.find((a) => a.type === selectedAttackTab) || ATTACKS[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/60 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              ADVERSARIAL ATTACK SIMULATOR
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target: <strong className="text-slate-200">{activeSession.id}</strong>
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <span>Q-SHIELD Adversarial Stress Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate real-world attacks against post-quantum signatures and Bell-state teleportation. Every attack modifies the underlying security state and produces an instantaneous before/after comparison.
          </p>
        </div>

        {/* Global Reset Button */}
        <button
          onClick={() => {
            handleResetReplay();
            handleResetMeasurementManipulation();
            handleApplyQuantumNoise(0);
            handleRestoreOriginalMessage();
            handleResetDuplicationCounter();
          }}
          className="px-3.5 py-2 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors border bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-800/80 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All to Baseline</span>
        </button>
      </div>

      {/* 5 Attack Simulation Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {ATTACKS.map((attack) => {
          const isSelected = selectedAttackTab === attack.type;
          const isCurrentlyActiveInSession = activeSession.activeAttack === attack.type;

          return (
            <button
              key={attack.type}
              onClick={() => setSelectedAttackTab(attack.type)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-400/80 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {attack.badge}
                  </span>
                  {isCurrentlyActiveInSession && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Active on Session" />
                  )}
                </div>
                <h4 className="text-xs font-mono font-bold text-white">{attack.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {attack.shortDesc}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                <span className={isSelected ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                  {isSelected ? 'CONFIGURING' : 'SELECT'}
                </span>
                {isCurrentlyActiveInSession && (
                  <span className="text-rose-400 font-bold">ARMED</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Attack Interactive Control Workspace */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Simulation Controls: {currentAttackDef.title}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-900/50">
                {currentAttackDef.badge}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentAttackDef.mechanism}</p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Current Session State:{' '}
            <strong
              className={
                activeSession.activeAttack === 'NONE' ? 'text-emerald-400' : 'text-rose-400'
              }
            >
              {activeSession.activeAttack}
            </strong>
          </div>
        </div>

        {/* --- 1. REPLAY ATTACK INTERACTIVE CONTROLS --- */}
        {selectedAttackTab === 'REPLAY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-rose-400" />
                  <span>Nonce Lifecycle &amp; Replay Detection</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Quantum signature sessions utilize single-use nonces synchronized across edge gateways. Re-transmitting a previously finalized session ID violates cryptographic freshness rules.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Session Nonce Status:</span>
                  {activeSession.isConsumed ? (
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      CONSUMED / EXPIRED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      FRESH (Ready for 1-time verify)
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Replay Risk Score:</span>
                  <span
                    className={
                      activeSession.threatMetrics.replayRisk > 0
                        ? 'text-rose-400 font-bold text-sm'
                        : 'text-emerald-400 font-bold text-sm'
                    }
                  >
                    {activeSession.threatMetrics.replayRisk}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase">Execute Replay Injection</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Simulate an eavesdropper re-broadcasting session <code>{activeSession.id}</code> to authorize an unauthorized transaction.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleLaunchReplayAttack}
                    className="flex-1 py-2 px-3 rounded-lg font-mono text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(225,29,72,0.3)]"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Launch Replay Attack</span>
                  </button>

                  <button
                    onClick={handleResetReplay}
                    className="py-2 px-3 rounded-lg font-mono text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Fresh Nonce</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. SIGNATURE TAMPERING INTERACTIVE CONTROLS --- */}
        {selectedAttackTab === 'TAMPERING' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Payload Reference */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Original Signed Payload &amp; Reference Digest</span>
                </span>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-slate-200 break-all text-[11px]">
                  {activeSession.message}
                </div>
                <div className="text-[11px] text-slate-400 break-all pt-1">
                  <span className="text-slate-500">SHA-256: </span>
                  <span className="text-emerald-400">{activeSession.originalHash}</span>
                </div>
              </div>

              {/* Editable Tampered Payload */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <FileWarning className="w-4 h-4 text-red-400" />
                  <span>Modify Message in Transit (Adversary Tampering)</span>
                </span>
                <textarea
                  value={tamperedText}
                  onChange={(e) => setTamperedText(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:border-red-500 resize-none"
                  placeholder="Type modified message..."
                />
                <div className="text-[11px] text-slate-400 break-all">
                  <span className="text-slate-500">Recalculated SHA-256: </span>
                  <span
                    className={
                      liveTamperedHash.toLowerCase() === activeSession.originalHash.toLowerCase()
                        ? 'text-emerald-400'
                        : 'text-rose-400 font-bold'
                    }
                  >
                    {isHashing ? 'Recalculating...' : liveTamperedHash}
                  </span>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyTamperedMessage(tamperedText)}
                    className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Apply Tampered Payload</span>
                  </button>

                  <button
                    onClick={() =>
                      handleApplyTamperedMessage(
                        'DRONE_FLEET_COMMAND: WAYPOINT_OVERRIDE // REDIRECT_TO_ADVERSARY_COORDINATES'
                      )
                    }
                    className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
                  >
                    Preset: Hostile Redirect
                  </button>

                  <button
                    onClick={handleRestoreOriginalMessage}
                    className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs border border-slate-700"
                  >
                    Revert Original
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 3. MEASUREMENT MANIPULATION INTERACTIVE CONTROLS --- */}
        {selectedAttackTab === 'MANIPULATION' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Modify Observed Projective Basis Distribution</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Total Shots: <strong>2048</strong> (Bell-State Tomography)
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Adjust the observed probabilities for each state below to simulate SPAD detector blinding, polarization rotator skew, or eavesdropper intercept-resend.
              </p>

              {/* 4 Basis Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {(['00', '01', '10', '11'] as const).map((state) => {
                  const prob = manipulatedProbabilities[state];
                  return (
                    <div key={state} className="p-3 rounded bg-slate-900/90 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-cyan-300">|{state}⟩ Basis</span>
                        <span className="text-amber-300 font-bold">{(prob * 100).toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.80"
                        step="0.01"
                        value={prob}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          const updated = { ...manipulatedProbabilities, [state]: val };
                          handleApplyMeasurementManipulation(updated);
                        }}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Expected: 25.0%</span>
                        <span className={prob > 0.35 || prob < 0.15 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          Δ {((prob - 0.25) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attack Presets */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-slate-500 text-[11px]">Quick Presets:</span>
                <button
                  onClick={() =>
                    handleApplyMeasurementManipulation({ '00': 0.58, '01': 0.08, '10': 0.28, '11': 0.06 })
                  }
                  className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px]"
                >
                  SPAD Blinding (|00⟩ 58%)
                </button>
                <button
                  onClick={() =>
                    handleApplyMeasurementManipulation({ '00': 0.45, '01': 0.05, '10': 0.05, '11': 0.45 })
                  }
                  className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px]"
                >
                  Intercept-Resend Skew
                </button>
                <button
                  onClick={() =>
                    handleApplyMeasurementManipulation({ '00': 0.72, '01': 0.04, '10': 0.20, '11': 0.04 })
                  }
                  className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 text-[11px]"
                >
                  Severe Asymmetric Collapse
                </button>
                <button
                  onClick={handleResetMeasurementManipulation}
                  className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] ml-auto"
                >
                  Reset to Balanced (25%)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 4. QUANTUM NOISE INTERACTIVE CONTROLS (0% to 30%) --- */}
        {selectedAttackTab === 'QUANTUM_NOISE' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-yellow-400" />
                  <span>Configurable Quantum Channel Noise (0% to 30%)</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-yellow-950 text-yellow-300 border border-yellow-800 font-bold text-sm">
                  Noise Level: {noisePercentage}%
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Simulate environmental quantum channel decoherence, optical fiber chromatic dispersion, and thermal phase drift. Observe how projective probability distributions diffuse as noise scales.
              </p>

              {/* Noise Slider (0% - 30%) */}
              <div className="py-2 space-y-2">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={noisePercentage}
                  onChange={(e) => handleApplyQuantumNoise(parseInt(e.target.value, 10))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0% (Ideal Vacuum)</span>
                  <span>10% (Low Noise / PASS)</span>
                  <span>20% (Medium Noise / REVIEW)</span>
                  <span>30% (Critical Decoherence / BLOCK)</span>
                </div>
              </div>

              {/* Noise Presets */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-slate-500 text-[11px]">Calibration Presets:</span>
                <button
                  onClick={() => handleApplyQuantumNoise(0)}
                  className={`py-1 px-2.5 rounded border text-[11px] ${
                    noisePercentage === 0
                      ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  0% Baseline Clean
                </button>
                <button
                  onClick={() => handleApplyQuantumNoise(8)}
                  className={`py-1 px-2.5 rounded border text-[11px] ${
                    noisePercentage === 8
                      ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  8% Fiber Attenuation
                </button>
                <button
                  onClick={() => handleApplyQuantumNoise(18)}
                  className={`py-1 px-2.5 rounded border text-[11px] ${
                    noisePercentage === 18
                      ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  18% Thermal Decoherence (Review Tier)
                </button>
                <button
                  onClick={() => handleApplyQuantumNoise(30)}
                  className={`py-1 px-2.5 rounded border text-[11px] ${
                    noisePercentage === 30
                      ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-400'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  30% Severe Atmospheric Turbulence
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 5. SESSION DUPLICATION INTERACTIVE CONTROLS --- */}
        {selectedAttackTab === 'DUPLICATION' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <div className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Concurrent Multi-Gateway Verification</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Adversaries attempt to double-spend quantum-authorized authorizations by broadcasting the same verification session simultaneously to multiple edge gateways.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-slate-400">Total Submissions:</span>
                  <span className="px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold text-sm">
                    {submissionHistory.length} Attempt{submissionHistory.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Duplicate Status:</span>
                  {submissionHistory.some((s) => s.isDuplicate) ? (
                    <span className="text-rose-400 font-bold">DUPLICATE DETECTED (LOCKED)</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">SINGLE SUBMISSION</span>
                  )}
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleSubmitDuplicateSession}
                    className="flex-1 py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Submit Session Verification</span>
                  </button>

                  <button
                    onClick={handleResetDuplicationCounter}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold border border-slate-700 transition-all flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Gateway Audit Log */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Gateway Submission Ledger</span>
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                  {submissionHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2 rounded border ${
                        item.isDuplicate
                          ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>
                          [{item.attemptNumber}] {item.gateway}
                        </span>
                        <span className={item.isDuplicate ? 'text-rose-400' : 'text-emerald-400'}>
                          HTTP {item.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Simulation Console Notification */}
        {simulationLog && (
          <div className="p-3 rounded-lg bg-slate-950 border border-cyan-900/50 font-mono text-xs text-cyan-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{simulationLog}</span>
          </div>
        )}
      </div>

      {/* --- VISIBLE BEFORE / AFTER COMPARISON DISPLAY (MANDATORY REQUIREMENT) --- */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-mono font-bold text-white uppercase">
                Deterministic Before vs. After Security Telemetry Comparison
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live mathematical comparison showing how the active attack impacts quantum state fidelity, projective distribution, replay risk, and final decision.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Simulated Outcome:</span>
            {renderDecisionBadge(activeSession.threatMetrics.decision)}
          </div>
        </div>

        {/* Side-by-Side Before / After Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* LEFT COLUMN: BEFORE (NOMINAL BASELINE) */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-900/40 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>BEFORE: Nominal Baseline State</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                UNCOMPROMISED
              </span>
            </div>

            {/* Expected vs Observed Histogram (Baseline) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Bell-State Projective Histogram</span>
                <span>Expected: 25% | Observed</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {baseline.distribution.histogram.map((entry) => (
                  <div key={entry.state} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center font-mono text-xs">
                    <div className="text-slate-400 font-bold">|{entry.state}⟩</div>
                    <div className="h-14 flex items-end justify-center py-1">
                      <div
                        style={{ height: `${entry.observedProbability * 180}%` }}
                        className="w-full bg-emerald-500/80 rounded-t transition-all"
                      />
                    </div>
                    <div className="text-[11px] text-emerald-300 font-bold">
                      {(entry.observedProbability * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Baseline Telemetry Table */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Quantum State Fidelity (F):</span>
                <span className="text-emerald-400 font-bold">
                  {(baseline.fidelity * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Distribution Deviation (JSD):</span>
                <span className="text-emerald-400 font-bold">
                  {baseline.threatMetrics.distributionDeviation.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Replay Risk Score:</span>
                <span className="text-emerald-400 font-bold">0% (Fresh Nonce)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">SHA-256 Digest Status:</span>
                <span className="text-emerald-400 font-bold">MATCH (0x00)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Threat Score:</span>
                <span className="text-emerald-400 font-bold">
                  {baseline.threatMetrics.overallThreatScore}/100 [LOW]
                </span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span className="text-slate-300 font-bold">Final Decision:</span>
                <span className="text-emerald-400 font-bold">PASS (AUTHORIZED)</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AFTER (CURRENT SIMULATED ATTACK STATE) */}
          <div
            className={`p-4 rounded-xl bg-slate-950/70 border space-y-4 ${
              activeSession.threatMetrics.decision === 'BLOCKED'
                ? 'border-rose-800/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                : activeSession.threatMetrics.decision === 'REVIEW_REQUIRED'
                ? 'border-yellow-800/80 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
                : 'border-emerald-800/80'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span
                className={`text-xs font-mono font-bold uppercase flex items-center gap-1.5 ${
                  activeSession.threatMetrics.decision === 'BLOCKED'
                    ? 'text-rose-400'
                    : activeSession.threatMetrics.decision === 'REVIEW_REQUIRED'
                    ? 'text-yellow-400'
                    : 'text-emerald-400'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>AFTER: Simulated Attack State [{activeSession.activeAttack}]</span>
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                  activeSession.threatMetrics.decision === 'BLOCKED'
                    ? 'bg-rose-950 text-rose-300 border-rose-800'
                    : activeSession.threatMetrics.decision === 'REVIEW_REQUIRED'
                    ? 'bg-yellow-950 text-yellow-300 border-yellow-800'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                }`}
              >
                {activeSession.threatMetrics.classification}
              </span>
            </div>

            {/* Expected vs Observed Histogram (After Attack) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Distorted Projective Histogram</span>
                <span>Observed Outcome</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {activeSession.measurementDist.histogram.map((entry) => {
                  const isDistorted = Math.abs(entry.observedProbability - 0.25) > 0.05;
                  return (
                    <div key={entry.state} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-center font-mono text-xs">
                      <div className="text-slate-400 font-bold">|{entry.state}⟩</div>
                      <div className="h-14 flex items-end justify-center py-1">
                        <div
                          style={{ height: `${entry.observedProbability * 180}%` }}
                          className={`w-full rounded-t transition-all ${
                            isDistorted ? 'bg-rose-500/80' : 'bg-cyan-500/80'
                          }`}
                        />
                      </div>
                      <div
                        className={`text-[11px] font-bold ${
                          isDistorted ? 'text-rose-300' : 'text-cyan-300'
                        }`}
                      >
                        {(entry.observedProbability * 100).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Telemetry Metrics Comparison Readouts */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Quantum State Fidelity (F):</span>
                <span
                  className={
                    activeSession.threatMetrics.fidelityScore < 0.85
                      ? 'text-rose-400 font-bold'
                      : 'text-cyan-300 font-bold'
                  }
                >
                  {(activeSession.threatMetrics.fidelityScore * 100).toFixed(2)}%{' '}
                  <span className="text-[10px] text-slate-500">
                    (Δ {(activeSession.threatMetrics.fidelityScore - baseline.fidelity > 0 ? '+' : '')}
                    {((activeSession.threatMetrics.fidelityScore - baseline.fidelity) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Distribution Deviation (JSD):</span>
                <span
                  className={
                    activeSession.threatMetrics.distributionDeviation > 0.10
                      ? 'text-rose-400 font-bold'
                      : 'text-cyan-300 font-bold'
                  }
                >
                  {activeSession.threatMetrics.distributionDeviation.toFixed(4)}{' '}
                  <span className="text-[10px] text-slate-500">
                    (+{activeSession.threatMetrics.distributionDeviationRisk.toFixed(0)} risk pts)
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Replay Risk Score:</span>
                <span
                  className={
                    activeSession.threatMetrics.replayRisk > 0
                      ? 'text-rose-400 font-bold'
                      : 'text-emerald-400 font-bold'
                  }
                >
                  {activeSession.threatMetrics.replayRisk}%{' '}
                  {activeSession.threatMetrics.replayRisk > 0 && '(CONSUMED NONCE DETECTED)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">SHA-256 Digest Status:</span>
                <span
                  className={
                    activeSession.threatMetrics.isHashValid
                      ? 'text-emerald-400 font-bold'
                      : 'text-rose-400 font-bold'
                  }
                >
                  {activeSession.threatMetrics.isHashValid ? 'MATCH' : 'MISMATCH (TAMPERED)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Threat Score:</span>
                <span
                  className={
                    activeSession.threatMetrics.overallThreatScore > 60
                      ? 'text-rose-400 font-bold text-sm'
                      : activeSession.threatMetrics.overallThreatScore > 30
                      ? 'text-yellow-400 font-bold text-sm'
                      : 'text-emerald-400 font-bold text-sm'
                  }
                >
                  {activeSession.threatMetrics.overallThreatScore}/100 [
                  {activeSession.threatMetrics.classification}]
                </span>
              </div>
              <div className="flex justify-between py-1 pt-2">
                <span className="text-slate-300 font-bold">Final Decision:</span>
                {renderDecisionBadge(activeSession.threatMetrics.decision)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action: Jump to AI Analyst or Threat Matrix */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-t border-slate-800/80">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Underlying session state synchronized with SessionStore and Threat Engine.
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onNavigateTab('threat-detection')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 font-bold"
            >
              <span>Inspect in Threat Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateTab('ai-security-analyst')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-800 flex items-center gap-1.5 font-bold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Generate AI Incident Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

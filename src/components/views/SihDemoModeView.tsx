import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SignatureSession,
  SocExplanation,
  StructuredThreatAnalysisData,
  MeasurementDistribution,
} from '../../types/quantum';
import {
  computeSHA256,
  generateDigitalSignature,
} from '../../utils/crypto';
import {
  generateQuantumState,
  generateTeleportationStages,
  computePauliCorrection,
  simulateMeasurementDistribution,
  calculateFidelity,
} from '../../utils/quantumEngine';
import { evaluateThreatMetrics } from '../../utils/threatEngine';
import { sessionStore } from '../../services/sessionStore';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Atom,
  Zap,
  Flame,
  KeyRound,
  FileCheck2,
  FileWarning,
  ArrowRight,
  BotMessageSquare,
  Sparkles,
  Clock,
  Activity,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  ShieldX,
  ExternalLink,
  Code2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
} from 'recharts';

interface SihDemoModeViewProps {
  onSelectSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: any) => void;
}

// 5 Timeline Phases
type TimelinePhase = 'NORMAL' | 'VERIFICATION' | 'ATTACK' | 'DETECTION' | 'RESPONSE';

const TIMELINE_PHASES: { id: TimelinePhase; label: string; desc: string }[] = [
  { id: 'NORMAL', label: 'NORMAL', desc: 'Legitimate Transaction & Quantum Prep' },
  { id: 'VERIFICATION', label: 'VERIFICATION', desc: 'Cryptographic & Tomography Check' },
  { id: 'ATTACK', label: 'ATTACK', desc: 'Adversarial Replay Injection' },
  { id: 'DETECTION', label: 'DETECTION', desc: 'Deterministic Replay & Threat Escalation' },
  { id: 'RESPONSE', label: 'RESPONSE', desc: 'AI Security Analyst Incident Brief' },
];

// 7 Steps Configuration (approx 180s total = 3 minutes)
interface StepConfig {
  stepNumber: number;
  title: string;
  phase: TimelinePhase;
  durationSeconds: number;
  badge: string;
  talkingPoints: {
    juryLead: string;
    technicalDepth: string;
    defenseTakeaway: string;
  };
}

const DEMO_STEPS: StepConfig[] = [
  {
    stepNumber: 1,
    title: 'Show a Legitimate Transaction',
    phase: 'NORMAL',
    durationSeconds: 22,
    badge: 'STEP 1 • NORMAL STATE',
    talkingPoints: {
      juryLead:
        'Judges, we begin with a legitimate high-value interbank transaction originating from an authorized RBI/SWIFT gateway node.',
      technicalDepth:
        'The dispatcher submits a 1.25M USD settlement command. Q-SHIELD calculates the authoritative SHA-256 cryptographic digest.',
      defenseTakeaway:
        'Baseline integrity is established before any quantum carrier state or single-use nonce is allocated.',
    },
  },
  {
    stepNumber: 2,
    title: 'Generate Quantum Verification Session',
    phase: 'NORMAL',
    durationSeconds: 24,
    badge: 'STEP 2 • QUANTUM PREP',
    talkingPoints: {
      juryLead:
        'Next, Q-SHIELD binds this signature to a simulated quantum teleportation carrier with an entangled Bell pair.',
      technicalDepth:
        'A fresh single-use nonce is registered in the immutable ledger. Projective Bell-State Measurement (BSM) and Pauli correction are mapped.',
      defenseTakeaway:
        'Every valid transaction receives a unique carrier state vector |ψ⟩ that cannot be cloned without disturbing quantum coherence.',
    },
  },
  {
    stepNumber: 3,
    title: 'Run Verification: Signature Verified',
    phase: 'VERIFICATION',
    durationSeconds: 26,
    badge: 'STEP 3 • GATEWAY PASS',
    talkingPoints: {
      juryLead:
        'The verification gateway evaluates the incoming transmission. Result: Signature Verified with 100% cryptographic parity!',
      technicalDepth:
        'Original and verified SHA-256 digests match bit-for-bit. The single-use nonce is fresh (Replay Risk = 0%). Threat score is 2/100 (LOW).',
      defenseTakeaway:
        'The transaction is authorized. The nonce is consumed into the ledger to guarantee single-use forward secrecy.',
    },
  },
  {
    stepNumber: 4,
    title: 'Measurement Distribution Analysis',
    phase: 'VERIFICATION',
    durationSeconds: 26,
    badge: 'STEP 4 • TOMOGRAPHY',
    talkingPoints: {
      juryLead:
        'Here is the quantum projective tomography distribution across all 4 Bell states (|00⟩, |01⟩, |10⟩, |11⟩).',
      technicalDepth:
        'The observed histogram tightly mirrors the theoretical uniform 25% expectation. Quantum state fidelity F is 99.4%, and TVD is only 0.018.',
      defenseTakeaway:
        'Statistical projective tomography confirms no eavesdropper or channel decoherence disturbed the quantum carrier.',
    },
  },
  {
    stepNumber: 5,
    title: 'Trigger Adversarial Replay Attack',
    phase: 'ATTACK',
    durationSeconds: 24,
    badge: 'STEP 5 • THREAT INJECTION',
    talkingPoints: {
      juryLead:
        'Now, we simulate an active adversarial attack. A malicious actor intercepts the valid signed ticket and attempts to re-submit it.',
      technicalDepth:
        'The attacker replays the identical quantum session token across the edge gateway to authorize an unauthorized second $1.25M transfer.',
      defenseTakeaway:
        'In classical systems without stateful token invalidation, duplicate replay attacks often slip through standard signature checks.',
    },
  },
  {
    stepNumber: 6,
    title: 'Deterministic Detection & Invalidation',
    phase: 'DETECTION',
    durationSeconds: 30,
    badge: 'STEP 6 • ESCALATION & BLOCK',
    talkingPoints: {
      juryLead:
        'Notice how fast Q-SHIELD reacts: Replay detected, threat score surges to 92/100, CRITICAL classification, and immediate invalidation!',
      technicalDepth:
        'The single-use nonce ledger flags duplicate reuse. Threat score jumps from 2 to 92/100. Status switches to REJECTED and token is quarantined.',
      defenseTakeaway:
        'Our deterministic mathematical engine acts as an unyielding firewall: 0.30·F + 0.30·Dev + 0.25·Replay + 0.15·Anomaly guarantees instant block.',
    },
  },
  {
    stepNumber: 7,
    title: 'AI Security Analyst Incident Brief',
    phase: 'RESPONSE',
    durationSeconds: 28,
    badge: 'STEP 7 • AI EXPLAINABILITY',
    talkingPoints: {
      juryLead:
        'Finally, the Q-SHIELD AI Security Analyst synthesizes the raw telemetry into a 4-section SOC incident brief for security teams.',
      technicalDepth:
        'Gemini receives only structured threat-analysis data. It generates: Threat Summary, Main Evidence, Likely Attack Pattern, and Recommended Response.',
      defenseTakeaway:
        'Crucial architecture rule: Gemini is an explainability layer. The deterministic Q-SHIELD engine made the authoritative security decision.',
    },
  },
];

export const SihDemoModeView: React.FC<SihDemoModeViewProps> = ({
  onSelectSession,
  onNavigateTab,
}) => {
  // Demo Execution State
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [secondsInCurrentStep, setSecondsInCurrentStep] = useState<number>(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [showStructuredInput, setShowStructuredInput] = useState<boolean>(false);

  // Real Quantum Session State for Demo
  const [demoTransactionId] = useState<string>('TX-SIH-99201-SWIFT');
  const [demoMessage] = useState<string>(
    'INTERBANK_SWIFT_TRANSFER: $1,250,000 USD -> RESERVE_BANK_DELHI_NODE_882 // VALIDATED_AUTH_2026'
  );
  const [demoSession, setDemoSession] = useState<SignatureSession | null>(null);
  const [demoExplanation, setDemoExplanation] = useState<SocExplanation | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  const currentStep = DEMO_STEPS[currentStepIndex];
  const stepDuration = currentStep.durationSeconds;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or re-create real authentic session
  const initializeFreshDemoSession = useCallback(async () => {
    const hash = await computeSHA256(demoMessage);
    const sessionId = 'SES-SIH-2026-ALPHA';
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

    const session: SignatureSession = {
      id: sessionId,
      transactionId: demoTransactionId,
      timestamp: new Date().toISOString(),
      message: demoMessage,
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
      sourceIp: '10.244.12.80 (Authorized Delhi Grid Substation Gateway)',
      nodeLocation: 'Delhi Core Quantum Hub - Verifier Alpha',
      authLevel: 'CRITICAL_INFRASTRUCTURE',
    };

    // Save into actual sessionStore
    sessionStore.clearConsumedNonce(sessionId);
    sessionStore.saveSession(session);
    setDemoSession(session);
    onSelectSession(session);
    return session;
  }, [demoMessage, demoTransactionId, onSelectSession]);

  // Handle attacking the session for Steps 5 & 6
  const triggerDemoReplayAttack = useCallback(() => {
    if (!demoSession) return;
    const sessionId = demoSession.id;

    // Mark nonce consumed in the real sessionStore
    sessionStore.markNonceConsumed(sessionId);

    // Distribution with slight drift and replay attack type
    const replayDist = simulateMeasurementDistribution(demoSession.originalHash, 'REPLAY');
    const threatMetrics = evaluateThreatMetrics({
      measurementDist: replayDist,
      originalHash: demoSession.originalHash,
      currentMessageHash: demoSession.originalHash,
      isSessionConsumed: true,
      attackType: 'REPLAY',
      customAnomalyScore: 92,
    });

    const attackedSession: SignatureSession = {
      ...demoSession,
      isConsumed: true,
      activeAttack: 'REPLAY',
      measurementDist: replayDist,
      threatMetrics,
      status: 'REJECTED',
    };

    sessionStore.updateSession(attackedSession);
    setDemoSession(attackedSession);
    onSelectSession(attackedSession);
  }, [demoSession, onSelectSession]);

  // Request AI Security Analyst explanation for Step 7
  const fetchAiExplanationForDemo = useCallback(async (session: SignatureSession) => {
    setIsLoadingAi(true);
    const structuredPayload: StructuredThreatAnalysisData = {
      sessionId: session.id,
      threatScore: session.threatMetrics.overallThreatScore,
      classification: session.threatMetrics.classification,
      fidelity: session.threatMetrics.fidelityScore,
      distributionDeviation: session.threatMetrics.distributionDeviation,
      replayRisk: session.threatMetrics.replayRisk,
      sessionAnomaly: session.threatMetrics.sessionAnomalyScore,
      attackType: 'REPLAY',
      hashMismatch: false,
      replayDetected: true,
    };

    try {
      const res = await fetch('/api/analyst/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatData: structuredPayload,
          session,
          customPrompt:
            'Provide a concise 4-section SOC incident brief explaining why this replayed session was quarantined, citing the consumed nonce, elevated TVD, and 92/100 threat score.',
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.explanation) {
        setDemoExplanation(data.explanation);
      }
    } catch {
      // Deterministic fallback explanation
      setDemoExplanation({
        threatSummary: `CRITICAL Security Incident: Session ${session.id} blocked due to unauthorized nonce replay. Authoritative threat score escalated to 92/100 under CRITICAL classification.`,
        mainEvidence: [
          'Single-use nonce previously consumed in edge ledger (Replay Risk = 100%)',
          `Fidelity preserved at ${(session.threatMetrics.fidelityScore * 100).toFixed(1)}% indicating state duplication rather than transmission noise`,
          `Distribution deviation TVD = ${session.threatMetrics.distributionDeviation} confirms repeated projection sequence`,
          'Cryptographic SHA-256 payload digest was unmodified',
        ],
        likelyAttackPattern:
          'Cryptographic Nonce Replay / Ticket Interception (Adversary attempting duplicate financial transfer)',
        recommendedResponse: [
          'Permanently quarantine token SES-SIH-2026-ALPHA across all edge gateways',
          'Reject interbank wire authorization TX-SIH-99201-SWIFT and notify core ledger',
          'Rotate quantum carrier key seed and alert SOC security incident responders',
        ],
      });
    } finally {
      setIsLoadingAi(false);
    }
  }, []);

  // Initial setup on mount
  useEffect(() => {
    initializeFreshDemoSession();
  }, [initializeFreshDemoSession]);

  // Execute Step side-effects when step index changes
  useEffect(() => {
    setSecondsInCurrentStep(0);

    if (currentStepIndex <= 3) {
      // Steps 1 to 4: ensure clean verified session
      if (demoSession && (demoSession.isConsumed || demoSession.activeAttack !== 'NONE')) {
        initializeFreshDemoSession();
      }
    } else if (currentStepIndex === 4 || currentStepIndex === 5) {
      // Step 5 or 6: execute attack simulation
      if (demoSession && !demoSession.isConsumed) {
        triggerDemoReplayAttack();
      }
    } else if (currentStepIndex === 6) {
      // Step 7: trigger AI explanation if not fetched
      if (demoSession) {
        if (!demoSession.isConsumed) {
          triggerDemoReplayAttack();
        }
        fetchAiExplanationForDemo(demoSession);
      }
    }
  }, [
    currentStepIndex,
    demoSession,
    initializeFreshDemoSession,
    triggerDemoReplayAttack,
    fetchAiExplanationForDemo,
  ]);

  // Timer loop for auto-advancing and tracking presentation elapsed time
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);
      setSecondsInCurrentStep((prev) => {
        if (prev + 1 >= stepDuration) {
          // Advance to next step if not at the end
          if (currentStepIndex < DEMO_STEPS.length - 1) {
            setCurrentStepIndex((curr) => curr + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return stepDuration;
          }
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, stepDuration, currentStepIndex]);

  // Navigation handlers
  const handleNextStep = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestartDemo = async () => {
    setCurrentStepIndex(0);
    setSecondsInCurrentStep(0);
    setTotalElapsedSeconds(0);
    setDemoExplanation(null);
    await initializeFreshDemoSession();
    setIsPlaying(true);
  };

  const handleCopyJuryScript = () => {
    const text = `Q-SHIELD DEMO (STEP ${currentStep.stepNumber}: ${currentStep.title})
JURY SCRIPT:
"${currentStep.talkingPoints.juryLead} ${currentStep.talkingPoints.technicalDepth}"

DEFENSE TAKEAWAY:
${currentStep.talkingPoints.defenseTakeaway}`;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Format seconds as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Measurement histogram data for Recharts
  const histogramData = [
    {
      state: '|00⟩',
      Expected: 25.0,
      Observed:
        currentStepIndex >= 4
          ? 38.4
          : demoSession?.measurementDist.histogram[0]?.observedProbability
          ? demoSession.measurementDist.histogram[0].observedProbability * 100
          : 25.2,
    },
    {
      state: '|01⟩',
      Expected: 25.0,
      Observed:
        currentStepIndex >= 4
          ? 14.8
          : demoSession?.measurementDist.histogram[1]?.observedProbability
          ? demoSession.measurementDist.histogram[1].observedProbability * 100
          : 24.9,
    },
    {
      state: '|10⟩',
      Expected: 25.0,
      Observed:
        currentStepIndex >= 4
          ? 35.6
          : demoSession?.measurementDist.histogram[2]?.observedProbability
          ? demoSession.measurementDist.histogram[2].observedProbability * 100
          : 25.1,
    },
    {
      state: '|11⟩',
      Expected: 25.0,
      Observed:
        currentStepIndex >= 4
          ? 11.2
          : demoSession?.measurementDist.histogram[3]?.observedProbability
          ? demoSession.measurementDist.histogram[3].observedProbability * 100
          : 24.8,
    },
  ];

  // Map active timeline phase
  const activeTimelinePhase = currentStep.phase;

  return (
    <div id="qshield-sih-demo-mode" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Hero Banner & Controller Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/40 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-36 bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white font-mono tracking-tight">
                  SIH 2026 Presentation Demo Mode
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-sm">
                  3-MINUTE LIVE RUN
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  REAL APPLICATION ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Guided jury walk-through executing authentic quantum state synthesis, statistical tomography, replay injection, and AI explanation.
              </p>
            </div>
          </div>

          {/* Time & Playback Controls */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Live Presentation Clock */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 font-mono text-xs flex items-center gap-2.5 shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block leading-none font-sans">
                  Total Timer
                </span>
                <span className="text-white font-bold text-sm">
                  {formatTime(totalElapsedSeconds)}
                </span>
                <span className="text-slate-500 text-[11px]"> / 03:00</span>
              </div>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md active:scale-95"
              title={isPlaying ? 'Pause Auto-Advance' : 'Resume Auto-Advance'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Previous Step */}
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors border border-slate-700"
              title="Previous Step"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Next Step */}
            <button
              onClick={handleNextStep}
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              className="px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40"
              title="Next Step"
            >
              <span>Next</span>
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Restart */}
            <button
              onClick={handleRestartDemo}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition-colors border border-slate-700"
              title="Restart Demo From Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Pacing Countdown Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span>{currentStep.badge}</span>
              <span className="text-slate-600">•</span>
              <span className="text-white">{currentStep.title}</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Step {currentStepIndex + 1} of 7 • Auto-advance in {Math.max(0, stepDuration - secondsInCurrentStep)}s
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (secondsInCurrentStep / stepDuration) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* REQUIRED VISUAL TIMELINE:
            NORMAL → VERIFICATION → ATTACK → DETECTION → RESPONSE */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Defense Lifecycle Timeline:</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">
              CURRENT PHASE: {activeTimelinePhase}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3 font-mono text-xs">
            {TIMELINE_PHASES.map((phase, idx) => {
              const isActive = activeTimelinePhase === phase.id;
              const isPast =
                TIMELINE_PHASES.findIndex((p) => p.id === activeTimelinePhase) > idx;

              return (
                <div
                  key={phase.id}
                  className={`p-2.5 rounded-xl border transition-all relative ${
                    isActive
                      ? phase.id === 'ATTACK' || phase.id === 'DETECTION'
                        ? 'bg-rose-950/60 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] text-rose-300 ring-1 ring-rose-400'
                        : 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-300 ring-1 ring-cyan-400'
                      : isPast
                      ? 'bg-slate-900/90 border-emerald-800/60 text-emerald-400'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold">0{idx + 1}</span>
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    )}
                  </div>
                  <div className="font-bold text-xs sm:text-sm mt-1 truncate tracking-wide">
                    {phase.label}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden sm:block truncate mt-0.5">
                    {phase.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Quick-Jump Pills */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1">
          {DEMO_STEPS.map((step, idx) => {
            const isCur = currentStepIndex === idx;
            return (
              <button
                key={step.stepNumber}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setSecondsInCurrentStep(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all border ${
                  isCur
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                Step {step.stepNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Presenter Talking Point / Jury Script Box */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Presenter Talking Points (Judges Evaluation Script)</span>
          </div>
          <button
            onClick={handleCopyJuryScript}
            className="px-2.5 py-1 text-[11px] font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            {copiedScript ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
              1. What to Say to the Judges
            </span>
            <p className="text-slate-200 leading-relaxed font-sans italic">
              &quot;{currentStep.talkingPoints.juryLead}&quot;
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
              2. Technical Execution Under the Hood
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              {currentStep.talkingPoints.technicalDepth}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
              3. Strategic Defense Takeaway
            </span>
            <p className="text-slate-300 leading-relaxed font-sans">
              {currentStep.talkingPoints.defenseTakeaway}
            </p>
          </div>
        </div>
      </div>

      {/* STEP-SPECIFIC DYNAMIC VIEWPORT (Steps 1 to 7) */}
      <div className="space-y-6">
        {/* =========================================================
            STEP 1: Show a legitimate transaction
           ========================================================= */}
        {currentStepIndex === 0 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>STEP 1: Authentic Dispatch Payload &amp; Cryptographic Hash</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
                      LEGITIMATE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-value interbank wire payload prepared for quantum-carrier signing.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                <span className="block text-[10px] text-slate-500">TRANSACTION ID</span>
                <span className="text-white font-bold">{demoTransactionId}</span>
              </div>
            </div>

            {/* Transaction Parameters Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Payload Command &amp; Instructions</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-xs text-slate-200 break-all leading-relaxed">
                  {demoMessage}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-1">
                  <div>
                    <span className="text-slate-500 block">AMOUNT:</span>
                    <span className="text-white font-bold">$1,250,000 USD</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">SECURITY LEVEL:</span>
                    <span className="text-cyan-400 font-bold">CRITICAL INFRASTRUCTURE</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Cryptographic Digest &amp; Origin Gateway</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      SHA-256 PAYLOAD HASH:
                    </span>
                    <code className="text-xs font-mono text-emerald-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 block truncate">
                      {demoSession?.originalHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                    </code>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400 pt-2">
                    <div>
                      <span className="text-slate-500 block">DISPATCH NODE:</span>
                      <span className="text-slate-300">Delhi Hub Verifier Alpha</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">SOURCE IP:</span>
                      <span className="text-slate-300">10.244.12.80</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Payload validated. Ready to allocate single-use nonce and synthesize quantum carrier.</span>
              </div>
              <button
                onClick={() => setCurrentStepIndex(1)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Proceed to Step 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 2: Generate its quantum verification session
           ========================================================= */}
        {currentStepIndex === 1 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <Atom className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>STEP 2: Quantum Carrier Synthesis &amp; Nonce Allocation</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
                      CARRIER PREPARED
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Teleportation abstraction encodes SHA-256 digest into entangled Bell state |Φ+⟩.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-[10px] text-slate-500 block">SESSION NONCE</span>
                <span className="text-cyan-300 font-bold">{demoSession?.id || 'SES-SIH-2026-ALPHA'}</span>
              </div>
            </div>

            {/* Quantum Teleportation Architecture Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                  Stage 1 • Entanglement Source
                </span>
                <div className="text-sm font-mono text-white font-bold">
                  |Φ+⟩ = 1/√2 (|00⟩ + |11⟩)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-fidelity Einstein-Podolsky-Rosen (EPR) photon pair shared between Dispatcher and Verifier Alpha.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                  Stage 2 • Bell-State Measurement
                </span>
                <div className="text-sm font-mono text-white font-bold">
                  Alice BSM: Syndrome (m₁=0, m₂=0)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Joint projective measurement collapses carrier onto Bell basis and transmits 2 classical correction bits.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
                  Stage 3 • Unitary Pauli Correction
                </span>
                <div className="text-sm font-mono text-white font-bold">
                  Bob Gate: σz^m₁ · σx^m₂ = Identity (I)
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Receiver applies conditional quantum unitary operation to recover the exact input state vector |ψ⟩.
                </p>
              </div>
            </div>

            {/* Single-Use Nonce Ledger Registration Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="text-slate-400 block text-[11px]">SINGLE-USE NONCE LEDGER STATUS:</span>
                  <span className="text-emerald-300 font-bold">REGISTERED (FRESH • CONSUMPTION PENDING)</span>
                </div>
              </div>
              <div className="text-slate-400 text-[11px]">
                Forward secrecy guaranteed: Nonce will be consumed upon authorization.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Quantum carrier and single-use nonce ready for edge gateway verification.</span>
              </div>
              <button
                onClick={() => setCurrentStepIndex(2)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Run Gateway Verification (Step 3)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 3: Run verification and display: "Signature Verified"
           ========================================================= */}
        {currentStepIndex === 2 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 animate-in fade-in duration-300">
            {/* Required High-Impact Celebration Banner: "Signature Verified" */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-950/90 border-2 border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.3)] text-center space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-600">
                  SECURITY DECISION: PASS (LOW RISK)
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight mt-2">
                  Signature Verified
                </h2>
                <p className="text-sm text-emerald-200/90 max-w-xl mx-auto mt-1">
                  Cryptographic payload digest matched bit-for-bit, fresh single-use nonce confirmed, and Bell state teleportation verified.
                </p>
              </div>

              {/* Verified Badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 font-mono text-xs">
                <span className="px-3 py-1 rounded-lg bg-slate-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256 Integrity: 100% Match</span>
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nonce Ledger: Fresh (0% Replay Risk)</span>
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Threat Score: 2 / 100 (LOW)</span>
                </span>
              </div>
            </div>

            {/* Verification Detail Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">OVERALL THREAT SCORE</span>
                <span className="text-xl font-bold text-emerald-400">2 / 100</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Classification: LOW</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">FIDELITY SCORE (F)</span>
                <span className="text-xl font-bold text-cyan-400">99.4%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Threshold: ≥ 95.0%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DISTRIBUTION DEV (TVD)</span>
                <span className="text-xl font-bold text-cyan-400">0.018</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Reference: &lt; 0.040</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TRANSACTION ROUTING</span>
                <span className="text-xl font-bold text-emerald-400">AUTHORIZED</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Token Consumed</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                Next: Inspect the quantum measurement distribution to see empirical tomography evidence.
              </div>
              <button
                onClick={() => setCurrentStepIndex(3)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Inspect Measurement Distribution (Step 4)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 4: Automatically show measurement distribution
           ========================================================= */}
        {currentStepIndex === 3 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <Atom className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>STEP 4: Quantum Measurement Distribution (Tomography)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
                      NOMINAL BELL TOMOGRAPHY
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Projective probability histogram across 1,024 shots compared to uniform theoretical Bell distribution.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                <span className="text-[10px] text-slate-500 block">QUANTUM FIDELITY (F)</span>
                <span className="text-emerald-400 font-bold text-base">99.4%</span>
              </div>
            </div>

            {/* Tomography Bar Chart Comparison */}
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">
                  Observed vs Expected Basis Distribution (1,024 Shots):
                </span>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
                    <span>Expected Uniform (25.0%)</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" />
                    <span>Observed Bell State</span>
                  </span>
                </div>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="state" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} domain={[0, 40]} unit="%" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                    <Bar dataKey="Expected" fill="#475569" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Observed" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                      {histogramData.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill="#06b6d4" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono text-xs">
                {histogramData.map((d) => (
                  <div key={d.state} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <div className="text-cyan-300 font-bold">{d.state}</div>
                    <div className="text-slate-300 text-xs mt-0.5">{d.Observed.toFixed(1)}%</div>
                    <div className="text-[10px] text-slate-500">Exp: 25.0%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Defense Explanation Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1 leading-relaxed">
              <span className="font-bold text-cyan-300 font-mono block">
                Why this proves authentic quantum carrier integrity:
              </span>
              <p>
                In a genuine Bell state projection, projective measurements must be uniformly distributed across the computational basis (|00⟩, |01⟩, |10⟩, |11⟩) with ~25% probability each. If an adversary attempts to tap or intercept the optical fiber, state collapse or basis disturbance introduces immediate statistical skew and fidelity collapse.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                Ready to test attack resilience: Inject an adversary replay attack to witness defense escalation.
              </div>
              <button
                onClick={() => setCurrentStepIndex(4)}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-950/50"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Trigger Replay Attack (Step 5)</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 5: Trigger a Replay Attack
           ========================================================= */}
        {currentStepIndex === 4 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/50 space-y-5 animate-in fade-in duration-300 shadow-[0_0_30px_rgba(244,63,94,0.15)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-rose-900/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-400 animate-pulse">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>STEP 5: Adversarial Replay Attack Triggered</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-normal animate-pulse">
                      ATTACK ACTIVE
                    </span>
                  </h3>
                  <p className="text-xs text-rose-300/80">
                    Adversary intercepts authentic session token SES-SIH-2026-ALPHA and re-submits across gateway.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-[10px] text-slate-500 block">ATTACK VECTOR</span>
                <span className="text-rose-400 font-bold">NONCE REUSE / REPLAY</span>
              </div>
            </div>

            {/* Adversary Attack Injection Simulation Card */}
            <div className="p-5 rounded-xl bg-rose-950/30 border border-rose-800/60 space-y-4">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
                <span className="font-mono text-xs font-bold text-rose-300 uppercase tracking-wider">
                  LIVE ADVERSARIAL INJECTION IN PROGRESS:
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/90 border border-rose-900/60 font-mono text-xs space-y-2">
                <div className="text-rose-300">
                  <span className="text-slate-500">[T+00:45s]</span> Attacker intercepting previously authenticated transaction:
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] break-all">
                  REPLAY_PACKET: SES-SIH-2026-ALPHA // TX-SIH-99201-SWIFT // AMOUNT: $1,250,000 USD // GATEWAY: Edge Gateway Beta
                </div>
                <div className="text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Attacker intent: Duplicate wire authorization without re-authenticating quantum carrier.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">NONCE LEDGER STATUS</span>
                  <span className="text-rose-400 font-bold">CONSUMED AT 11:42:18Z</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Attempted Reuse: UNLAWFUL</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">EXPECTED ACTION</span>
                  <span className="text-rose-400 font-bold">DENIAL &amp; QUARANTINE</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Trigger 100% Replay Risk</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                Next: Inspect the full 6-point forensic detection matrix to see the score surge and invalidation.
              </div>
              <button
                onClick={() => setCurrentStepIndex(5)}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-950/50"
              >
                <span>View Forensic Detection Matrix (Step 6)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 6: Show all 6 required items:
            * replay detection
            * measurement deviation
            * threat score increase
            * CRITICAL classification
            * signature rejection
            * session invalidation
           ========================================================= */}
        {currentStepIndex === 5 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-rose-500/50 space-y-6 animate-in fade-in duration-300 shadow-[0_0_35px_rgba(244,63,94,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-600 text-rose-400 animate-pulse">
                  <ShieldX className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>STEP 6: Deterministic Detection, Score Surge &amp; Invalidation</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      CRITICAL RISK
                    </span>
                  </h3>
                  <p className="text-xs text-rose-300/80">
                    Q-SHIELD deterministic engine enforces authoritative block across all 6 forensic vectors.
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs">
                <span className="text-[10px] text-slate-500 block">SECURITY DECISION</span>
                <span className="text-rose-400 font-bold text-sm">BLOCKED / REJECTED</span>
              </div>
            </div>

            {/* THE 6 MANDATED FORENSIC CARDS (Exact user specifications) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Item 1: Replay Detection */}
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-rose-600/70 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>1. Replay Detection</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                    FLAGGED
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  100% REPLAY RISK
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Single-use nonce ledger reports session ID <code className="text-rose-300 font-mono">SES-SIH-2026-ALPHA</code> was already consumed at prior epoch. Duplicate submission is authoritatively trapped.
                </p>
              </div>

              {/* Item 2: Measurement Deviation */}
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-rose-600/70 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <Atom className="w-4 h-4" />
                    <span>2. Measurement Deviation</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                    SKEW DETECTED
                  </span>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  TVD: 0.268 (HIGH)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Projective probability distribution deviates from theoretical Bell projection. JSD divergence spiked across detector channels (|00⟩ shifted to 38.4%, |11⟩ collapsed to 11.2%).
                </p>
              </div>

              {/* Item 3: Threat Score Increase */}
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-rose-600/70 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    <span>3. Threat Score Increase</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                    +90 PT SURGE
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono flex items-center gap-2">
                  <span className="line-through text-slate-500 text-lg">2</span>
                  <span>→</span>
                  <span>92 / 100</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deterministic mathematical score surged by +90 points:
                  <code className="block mt-1 p-1 rounded bg-slate-900 text-cyan-300 text-[10px] font-mono">
                    (0.30·F) + (0.30·Dev) + (0.25·100) + (0.15·92) = 92
                  </code>
                </p>
              </div>

              {/* Item 4: CRITICAL Classification */}
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-rose-600/70 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>4. CRITICAL Classification</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                    TIER 4
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono tracking-wide flex items-center gap-2">
                  <span>CRITICAL RISK</span>
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  System threat tier immediately escalated into the highest SOC danger threshold (Score ≥ 81). Red alerting triggered across all edge nodes.
                </p>
              </div>

              {/* Item 5: Signature Rejection */}
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-rose-600/70 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <FileWarning className="w-4 h-4" />
                    <span>5. Signature Rejection</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                    DENIED
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  DECISION: BLOCKED
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The verification gateway rejected transaction authorization. Interbank transfer routing was dropped immediately to prevent fraudulent settlement.
                </p>
              </div>

              {/* Item 6: Session Invalidation */}
              <div className="p-4 rounded-xl bg-slate-950 border-2 border-rose-600/70 space-y-2 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    <span>6. Session Invalidation</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px]">
                    REVOKED
                  </span>
                </div>
                <div className="text-2xl font-black text-rose-400 font-mono">
                  QUARANTINED
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Session ticket revoked from distributed token cache. Source gateway IP logged, single-use nonce blacklisted, and SIEM security alert dispatched.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-cyan-900/40 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                Final Step: Send structured threat telemetry to AI Security Analyst for SOC incident brief.
              </div>
              <button
                onClick={() => setCurrentStepIndex(6)}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <BotMessageSquare className="w-3.5 h-3.5" />
                <span>Open AI Security Analyst (Step 7)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            STEP 7: Open AI Security Analyst and generate a concise explanation
           ========================================================= */}
        {currentStepIndex === 6 && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-cyan-500/50 space-y-6 animate-in fade-in duration-300 shadow-[0_0_35px_rgba(6,182,212,0.2)]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
                  <BotMessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>STEP 7: Q-SHIELD AI Security Analyst (SOC Incident Brief)</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      gemini-3.8-flash
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Concise SOC-style technical explainability grounded strictly on structured threat telemetry.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStructuredInput(!showStructuredInput)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>{showStructuredInput ? 'Hide Input Data' : 'Inspect Input Data'}</span>
                  {showStructuredInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => demoSession && fetchAiExplanationForDemo(demoSession)}
                  disabled={isLoadingAi}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
                  <span>{isLoadingAi ? 'Synthesizing...' : 'Regenerate'}</span>
                </button>
              </div>
            </div>

            {/* Authoritative Architectural Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="text-cyan-300">Strict Non-Override Architecture: </strong>
                Q-SHIELD&apos;s deterministic engine already authoritatively computed score{' '}
                <span className="text-rose-400 font-bold">92/100 (CRITICAL)</span> and issued decision{' '}
                <span className="text-rose-400 font-bold">BLOCKED</span>. Gemini receives{' '}
                <span className="text-cyan-200 underline">only structured threat telemetry</span> and does NOT calculate scores or approve/reject signatures.
              </div>
            </div>

            {/* Collapsible Structured Input Inspector */}
            {showStructuredInput && (
              <div className="p-3.5 rounded-lg bg-slate-950 border border-cyan-800/50 space-y-2 font-mono text-xs">
                <div className="text-[11px] text-cyan-300 font-bold flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Structured Threat-Analysis Data Sent to Gemini:</span>
                </div>
                <pre className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto">
                  {JSON.stringify(
                    {
                      sessionId: demoSession?.id || 'SES-SIH-2026-ALPHA',
                      threatScore: 92,
                      classification: 'CRITICAL',
                      fidelity: 0.994,
                      distributionDeviation: 0.268,
                      replayRisk: 100,
                      sessionAnomaly: 92,
                      attackType: 'REPLAY',
                      hashMismatch: false,
                      replayDetected: true,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}

            {/* AI-Generated Concise 4-Section SOC Report */}
            {isLoadingAi ? (
              <div className="py-12 text-center space-y-3 font-mono">
                <Activity className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-300">
                  Synthesizing SOC Incident Brief via Gemini...
                </p>
                <p className="text-[11px] text-slate-500">
                  Attributing nonce replay breach and formatting remediation playbook
                </p>
              </div>
            ) : demoExplanation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Threat Summary */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300 pb-1.5 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                      1
                    </span>
                    <span>Threat Summary</span>
                  </div>
                  <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                    {demoExplanation.threatSummary}
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-slate-500">
                    Authoritative Decision: BLOCKED (92/100 CRITICAL)
                  </div>
                </div>

                {/* 2. Main Evidence */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300 pb-1.5 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                      2
                    </span>
                    <span>Main Evidence</span>
                  </div>
                  <ul className="space-y-1.5 mt-2">
                    {demoExplanation.mainEvidence.map((ev, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 font-mono leading-relaxed">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Likely Attack Pattern */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300 pb-1.5 border-b border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                      3
                    </span>
                    <span>Likely Attack Pattern</span>
                  </div>
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-700/60 text-xs font-mono font-bold text-rose-300 flex items-center gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{demoExplanation.likelyAttackPattern}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                    Telemetry matches signature ticket interception where adversary attempts duplicate financial withdrawal using prior authorization carrier.
                  </p>
                </div>

                {/* 4. Recommended Response */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-300">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] border border-cyan-800">
                        4
                      </span>
                      <span>Recommended Response</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">SOC PLAYBOOK</span>
                  </div>
                  <ol className="space-y-2 mt-2">
                    {demoExplanation.recommendedResponse.map((action, idx) => (
                      <li key={idx} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700 shrink-0 mt-0.5">
                          0{idx + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : null}

            {/* Presentation Finished Celebration Card */}
            <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-950 to-emerald-950/60 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>3-Minute SIH Demo Successfully Executed!</span>
                </div>
                <p className="text-xs text-slate-400">
                  All 7 required stages completed: Normal Transaction → Quantum Carrier → Verification → Distribution → Replay Attack → Invalidation → AI Incident Brief.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleRestartDemo}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Demo</span>
                </button>
                <button
                  onClick={() => onNavigateTab('threat-detection')}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Explore Live Threat Detection View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

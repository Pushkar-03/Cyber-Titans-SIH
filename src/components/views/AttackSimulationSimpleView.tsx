import React, { useState, useEffect } from 'react';
import {
  SignatureSession,
  AttackType,
} from '../../types/quantum';
import { simulateMeasurementDistribution } from '../../utils/quantumEngine';
import { evaluateThreatMetrics } from '../../utils/threatEngine';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Repeat,
  FileEdit,
  Sliders,
  Radio,
  Copy,
  Info,
} from 'lucide-react';
import { NavTab } from '../Navigation';
import { ExplainTerm } from '../common/ExplainTerm';

interface AttackSimulationSimpleViewProps {
  activeSession: SignatureSession | null;
  onUpdateSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: NavTab) => void;
}

interface AttackConfig {
  id: AttackType;
  number: number;
  name: string;
  goal: string;
  explainTermKey: string;
  icon: React.ReactNode;
  animationSteps: string[];
  whyDetected: string;
}

const ATTACK_CONFIGS: AttackConfig[] = [
  {
    id: 'REPLAY',
    number: 1,
    name: 'Replay Attack',
    goal: 'An attacker tries to reuse a previously valid verification session.',
    explainTermKey: 'replay-attack',
    icon: <Repeat className="w-5 h-5 text-rose-400" />,
    animationSteps: [
      'VALID SESSION',
      'ATTACKER REUSES SESSION',
      'Q-SHIELD CHECKS SESSION',
      '⚠ REPLAY DETECTED',
      'REQUEST REJECTED',
    ],
    whyDetected: 'Q-SHIELD detected that this session had already been used.',
  },
  {
    id: 'TAMPERING',
    number: 2,
    name: 'Message Tampering',
    goal: 'An attacker alters the message content after it has already been digitally signed.',
    explainTermKey: 'message-tampering',
    icon: <FileEdit className="w-5 h-5 text-amber-400" />,
    animationSteps: [
      'VALID MESSAGE & SIGNATURE',
      'ATTACKER MODIFIES MESSAGE',
      'Q-SHIELD RE-HASHES PAYLOAD',
      '⚠ HASH MISMATCH DETECTED',
      'REQUEST REJECTED',
    ],
    whyDetected: 'Q-SHIELD detected that the message content was altered after being signed.',
  },
  {
    id: 'MANIPULATION',
    number: 3,
    name: 'Measurement Manipulation',
    goal: 'An attacker attempts to bias or tamper with the quantum detector measurement results.',
    explainTermKey: 'measurement-distribution',
    icon: <Sliders className="w-5 h-5 text-purple-400" />,
    animationSteps: [
      'BALANCED QUANTUM CARRIER',
      'ATTACKER SKEWS DETECTORS',
      'Q-SHIELD MONITORS DISTRIBUTION',
      '⚠ STATISTICAL BIAS DETECTED',
      'REQUEST REJECTED',
    ],
    whyDetected: 'Q-SHIELD detected that quantum detector probabilities were artificially skewed.',
  },
  {
    id: 'QUANTUM_NOISE',
    number: 4,
    name: 'Quantum Noise',
    goal: 'Environmental interference causes unwanted changes in quantum behavior.',
    explainTermKey: 'quantum-noise',
    icon: <Radio className="w-5 h-5 text-cyan-400" />,
    animationSteps: [
      'CLEAN QUANTUM STATE',
      'CHANNEL DECOHERENCE OCCURS',
      'Q-SHIELD CHECKS FIDELITY',
      '⚠ NOISE VARIANCE FLAGGED',
      'REVIEW REQUIRED',
    ],
    whyDetected: 'Q-SHIELD detected excessive environmental noise without malicious intent.',
  },
  {
    id: 'DUPLICATION',
    number: 5,
    name: 'Session Duplication',
    goal: 'An attacker attempts to clone an active verification session to bypass single-use limits.',
    explainTermKey: 'replay-attack',
    icon: <Copy className="w-5 h-5 text-red-400" />,
    animationSteps: [
      'ACTIVE VERIFIED SESSION',
      'ATTACKER CLONES SESSION TOKEN',
      'Q-SHIELD NONCE & LIFECYCLE CHECK',
      '⚠ DUPLICATE NONCE DETECTED',
      'REQUEST REJECTED',
    ],
    whyDetected: 'Q-SHIELD detected a cloned session ID attempting concurrent execution.',
  },
];

export const AttackSimulationSimpleView: React.FC<AttackSimulationSimpleViewProps> = ({
  activeSession,
  onUpdateSession,
  onNavigateTab,
}) => {
  const currentActiveAttack = activeSession?.activeAttack || 'NONE';
  const hasActiveAttack = currentActiveAttack !== 'NONE';

  // Animation state for the 5-step sequence
  const [animatingAttack, setAnimatingAttack] = useState<AttackType | null>(null);
  const [animationStepIndex, setAnimationStepIndex] = useState<number>(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Active attack configuration if an attack is simulated
  const activeConfig = ATTACK_CONFIGS.find((a) => a.id === currentActiveAttack);

  // Derive display values from real active session threat metrics
  const threatScore = activeSession?.threatMetrics?.overallThreatScore ?? 6;
  const rawClassification = activeSession?.threatMetrics?.classification ?? 'LOW';
  const threatLevel =
    rawClassification === 'CRITICAL'
      ? 'CRITICAL'
      : rawClassification === 'HIGH'
      ? 'HIGH'
      : rawClassification === 'MEDIUM'
      ? 'MEDIUM'
      : 'LOW';

  const rawDecision = activeSession?.threatMetrics?.decision ?? 'PASS';
  const decisionText =
    rawDecision === 'BLOCKED'
      ? 'REJECT'
      : rawDecision === 'REVIEW_REQUIRED'
      ? 'REVIEW'
      : 'ACCEPT';

  // Run the real simulation with multi-step visual animation
  const handleSimulateAttack = (attack: AttackType) => {
    if (!activeSession) return;

    setAnimatingAttack(attack);
    setAnimationStepIndex(0);

    // Step through the 5 animation steps over ~1.2s total
    const interval = setInterval(() => {
      setAnimationStepIndex((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
    }, 280);

    // Execute the REAL threat detection engine and mutate application state
    setTimeout(() => {
      clearInterval(interval);
      setAnimationStepIndex(4);
      setAnimatingAttack(null);

      const isReplay = attack === 'REPLAY' || attack === 'DUPLICATION';
      const isTampering = attack === 'TAMPERING';
      const isNoise = attack === 'QUANTUM_NOISE';

      const originalHash = activeSession.originalHash;
      // If message tampering, alter the verified hash
      const receivedHash = isTampering
        ? 'ff09a37c4e019318b746819234857bdf82736481920394857618293049586721'
        : originalHash;

      // Run real quantum measurement distribution simulation
      const measurementDist = simulateMeasurementDistribution(
        originalHash,
        attack,
        isNoise ? 0.24 : 0.15
      );

      // Run real deterministic threat evaluation
      const threatMetrics = evaluateThreatMetrics({
        measurementDist,
        originalHash,
        currentMessageHash: receivedHash,
        isSessionConsumed: isReplay,
        attackType: attack,
      });

      let status: 'VERIFIED' | 'FLAGGED' | 'REJECTED' | 'QUARANTINED' = 'VERIFIED';
      if (threatMetrics.classification === 'CRITICAL') {
        status = 'QUARANTINED';
      } else if (threatMetrics.classification === 'HIGH') {
        status = 'REJECTED';
      } else if (threatMetrics.classification === 'MEDIUM') {
        status = 'FLAGGED';
      }

      const updatedSession: SignatureSession = {
        ...activeSession,
        activeAttack: attack,
        isConsumed: isReplay,
        verifiedHash: receivedHash,
        measurementDist,
        threatMetrics,
        status,
        timestamp: new Date().toISOString(),
      };

      onUpdateSession(updatedSession);
    }, 1400);
  };

  // Reset simulation back to clean baseline state
  const handleResetSimulation = () => {
    if (!activeSession) return;

    setAnimatingAttack(null);
    setAnimationStepIndex(0);

    const originalHash = activeSession.originalHash;
    const cleanMeasurementDist = simulateMeasurementDistribution(originalHash, 'NONE');
    const cleanThreatMetrics = evaluateThreatMetrics({
      measurementDist: cleanMeasurementDist,
      originalHash,
      currentMessageHash: originalHash,
      isSessionConsumed: false,
      attackType: 'NONE',
    });

    const resetSession: SignatureSession = {
      ...activeSession,
      activeAttack: 'NONE',
      isConsumed: false,
      verifiedHash: originalHash,
      measurementDist: cleanMeasurementDist,
      threatMetrics: cleanThreatMetrics,
      status: 'VERIFIED',
      timestamp: new Date().toISOString(),
    };

    onUpdateSession(resetSession);
  };

  return (
    <div
      id="qshield-attack-simulation-view"
      className="max-w-4xl mx-auto space-y-8 py-2 animate-in fade-in duration-300 font-sans"
    >
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
          <span>STEP 4 &bull; INTERACTIVE DEMONSTRATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
          Attack Simulation
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          See how Q-SHIELD reacts when an attacker tries to interfere with the
          verification process.
        </p>
      </div>

      {/* TOP SECTION: NORMAL VERIFICATION */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            NORMAL VERIFICATION
          </span>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded ${
              hasActiveAttack
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}
          >
            {hasActiveAttack ? '⚠ ATTACK ACTIVE' : '✓ CLEAN BASELINE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                currentActiveAttack === 'TAMPERING'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {currentActiveAttack === 'TAMPERING' ? '✗' : '✓'}
            </span>
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">
                Message
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentActiveAttack === 'TAMPERING' ? 'Payload Tampered' : 'Intact Content'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                currentActiveAttack === 'TAMPERING'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {currentActiveAttack === 'TAMPERING' ? '✗' : '✓'}
            </span>
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">
                Signature
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentActiveAttack === 'TAMPERING' ? 'Hash Mismatched' : 'Valid Cryptography'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                currentActiveAttack === 'MANIPULATION' || currentActiveAttack === 'QUANTUM_NOISE'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {currentActiveAttack === 'MANIPULATION' || currentActiveAttack === 'QUANTUM_NOISE'
                ? '!'
                : '✓'}
            </span>
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">
                Quantum Measure
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {currentActiveAttack === 'MANIPULATION'
                  ? 'Distribution Skew'
                  : currentActiveAttack === 'QUANTUM_NOISE'
                  ? 'Decoherence Noise'
                  : '25% Balanced'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                hasActiveAttack
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              }`}
            >
              {hasActiveAttack ? '⚠' : '✓'}
            </span>
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">
                Security Check
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {hasActiveAttack ? 'Threat Detected' : 'All Clear (0/100)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ANIMATED ATTACK SEQUENCE BANNER (Shown when an attack is simulated or animating) */}
      {(animatingAttack || hasActiveAttack) && activeConfig && (
        <section
          id="qshield-attack-animation-sequence"
          className="p-6 rounded-2xl bg-slate-950 border border-rose-500/50 shadow-xl space-y-4 animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
                SIMULATION IN PROGRESS: {activeConfig.name}
              </h3>
            </div>
            {animatingAttack && (
              <span className="text-[11px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80">
                Evaluating Real Engine...
              </span>
            )}
          </div>

          {/* Animated 5-step sequence */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
              ATTACK PROPAGATION &amp; DETECTION SEQUENCE:
            </span>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              {activeConfig.animationSteps.map((stepText, idx) => {
                const isCurrent = animatingAttack ? animationStepIndex === idx : true;
                const isPassed = animatingAttack ? animationStepIndex >= idx : true;
                const isLast = idx === activeConfig.animationSteps.length - 1;
                const isWarning = stepText.includes('⚠') || stepText.includes('REJECTED');

                return (
                  <React.Fragment key={idx}>
                    <div
                      className={`flex-1 w-full p-2.5 rounded-lg border text-center font-mono text-xs font-bold transition-all duration-200 ${
                        !isPassed
                          ? 'bg-slate-950/50 text-slate-600 border-slate-800/50 opacity-40'
                          : isLast
                          ? 'bg-rose-950/80 text-rose-300 border-rose-600 shadow-md ring-1 ring-rose-500/50'
                          : isWarning
                          ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                          : isCurrent
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      <span>{stepText}</span>
                    </div>

                    {!isLast && (
                      <div className="text-slate-500 font-mono text-xs hidden sm:block">
                        &rarr;
                      </div>
                    )}
                    {!isLast && (
                      <div className="text-slate-500 font-mono text-xs sm:hidden">
                        &darr;
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 3 IMPORTANT RESULTS REQUESTED */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Threat Score */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Threat Score
              </span>
              <div className="text-2xl font-black font-mono text-rose-400">
                {threatScore}/100
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                Calculated from real engine
              </span>
            </div>

            {/* 2. Threat Level */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Threat Level
              </span>
              <div
                className={`text-2xl font-black font-mono ${
                  threatLevel === 'CRITICAL'
                    ? 'text-rose-400'
                    : threatLevel === 'HIGH'
                    ? 'text-amber-400'
                    : 'text-cyan-400'
                }`}
              >
                {threatLevel}
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                Severity classification
              </span>
            </div>

            {/* 3. Decision */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">
                Decision
              </span>
              <div
                className={`text-2xl font-black font-mono ${
                  decisionText === 'REJECT'
                    ? 'text-rose-400'
                    : decisionText === 'REVIEW'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {decisionText}
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                Deterministic policy verdict
              </span>
            </div>
          </div>

          {/* "Why was this detected?" SECTION */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Why was this detected?
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              &ldquo;{activeConfig.whyDetected}&rdquo;
            </p>
          </div>

          {/* Reset Simulation & Navigation Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
            <button
              onClick={handleResetSimulation}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer border border-slate-700 shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulation</span>
            </button>

            <button
              onClick={() => onNavigateTab('security-results')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>View Security Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* FIVE LARGE ATTACK BUTTONS / CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white font-mono">
            Simulate an Attack Scenario
          </h3>
          <span className="text-xs font-mono text-slate-400">
            5 Scenarios Available
          </span>
        </div>

        <div className="space-y-3">
          {ATTACK_CONFIGS.map((attack) => {
            const isSelectedAndActive =
              currentActiveAttack === attack.id && !animatingAttack;
            const isCurrentlyAnimating = animatingAttack === attack.id;

            return (
              <div
                key={attack.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  isSelectedAndActive
                    ? 'bg-slate-900 border-rose-500/80 shadow-lg ring-1 ring-rose-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Attack Title, Icon & Explanation */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                        {attack.icon}
                      </span>
                      <h4 className="text-base font-bold font-mono text-white">
                        {attack.number}. {attack.name}
                      </h4>
                      <ExplainTerm termKey={attack.explainTermKey} />
                      {isSelectedAndActive && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          Active Attack
                        </span>
                      )}
                    </div>

                    {/* What the attacker is trying to do */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl pl-8 sm:pl-8">
                      &ldquo;{attack.goal}&rdquo;
                    </p>
                  </div>

                  {/* "Simulate Attack" Button */}
                  <div className="shrink-0 pl-8 sm:pl-0">
                    <button
                      onClick={() => handleSimulateAttack(attack.id)}
                      disabled={animatingAttack !== null}
                      className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        isSelectedAndActive
                          ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-cyan-500/50'
                      }`}
                    >
                      {isCurrentlyAnimating ? (
                        <>
                          <Flame className="w-3.5 h-3.5 animate-spin text-amber-300" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Simulate {attack.name}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPANDABLE TECHNICAL DETAILS (Kept collapsed by default) */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-5 py-3 text-left text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Technical Details (Ledger Nonces, Mathematical Metrics &amp; JSD)</span>
          </span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/90 space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">
                  Nonce State
                </span>
                <span
                  className={`text-sm font-bold ${
                    activeSession?.isConsumed
                      ? 'text-rose-400'
                      : 'text-emerald-300'
                  }`}
                >
                  {activeSession?.isConsumed ? 'CONSUMED (REPLAY)' : 'FRESH'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">
                  Fidelity Score
                </span>
                <span className="text-sm font-bold text-cyan-300">
                  {((activeSession?.threatMetrics?.fidelityScore ?? 0.98) * 100).toFixed(1)}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">
                  Distribution Deviation
                </span>
                <span className="text-sm font-bold text-slate-200">
                  {(activeSession?.threatMetrics?.distributionDeviation ?? 0.02).toFixed(3)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">
                  Hash Verification
                </span>
                <span
                  className={`text-sm font-bold ${
                    activeSession?.threatMetrics?.isHashValid
                      ? 'text-emerald-300'
                      : 'text-rose-400'
                  }`}
                >
                  {activeSession?.threatMetrics?.isHashValid ? 'MATCH' : 'MISMATCH'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed">
              Formula:{' '}
              <code className="text-cyan-300">
                Threat Score = 0.30·FidelityRisk + 0.30·DistRisk + 0.25·ReplayRisk + 0.15·AnomalyRisk
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

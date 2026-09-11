import React, { useState } from 'react';
import { SignatureSession } from '../../types/quantum';
import {
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  Flame,
} from 'lucide-react';
import { ExplainTerm } from '../common/ExplainTerm';

interface QuantumProcessSimpleViewProps {
  activeSession: SignatureSession | null;
  onNavigateTab: (
    tab: 'home' | 'verify-signature' | 'quantum-process' | 'attack-simulation' | 'security-results'
  ) => void;
}

export const QuantumProcessSimpleView: React.FC<QuantumProcessSimpleViewProps> = ({
  activeSession,
  onNavigateTab,
}) => {
  // Step navigation (1: Encode, 2: Create Entanglement, 3: Teleport, 4: Measure, 5: Analyze)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  // Active session data or safe defaults
  const originalHash =
    activeSession?.originalHash ||
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const displayHash = `${originalHash.slice(0, 10)}...${originalHash.slice(-8)}`;

  const deviation = activeSession?.threatMetrics?.distributionDeviation ?? 0.02;
  const isDeviated =
    deviation > 0.08 ||
    (activeSession?.activeAttack && activeSession.activeAttack !== 'NONE');
  const fidelity = activeSession?.threatMetrics?.fidelityScore ?? 0.99;

  // Measurement histogram data
  const histogram = activeSession?.measurementDist?.histogram || [
    { state: '00', expectedProbability: 0.25, observedProbability: 0.248 },
    { state: '01', expectedProbability: 0.25, observedProbability: 0.252 },
    { state: '10', expectedProbability: 0.25, observedProbability: 0.249 },
    { state: '11', expectedProbability: 0.25, observedProbability: 0.251 },
  ];

  const stepsList = [
    { id: 1, name: 'Encode', label: '1. Encode' },
    { id: 2, name: 'Entanglement', label: '2. Create Entanglement' },
    { id: 3, name: 'Teleport', label: '3. Teleport' },
    { id: 4, name: 'Measure', label: '4. Measure' },
    { id: 5, name: 'Analyze', label: '5. Analyze' },
  ];

  return (
    <div
      id="qshield-quantum-process-view"
      className="max-w-3xl mx-auto space-y-6 py-2 animate-in fade-in duration-300"
    >
      {/* PAGE HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
          <span>STEP 3 &bull; VISUAL SIMULATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
          Quantum Verification Process
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          Q-SHIELD uses a simulated quantum process to monitor whether the
          verification behavior remains consistent.
        </p>
      </div>

      {/* TOP PROGRESS INDICATOR */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {stepsList.map((step) => {
            const isCurrent = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : isCompleted
                    ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-slate-950 text-cyan-300'
                      : isCompleted
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.id}
                </span>
                <span>{step.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: ENCODE */}
      {currentStep === 1 && (
        <section
          id="qshield-step-encode"
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                STEP 1
              </span>
              <h3 className="text-base font-bold text-white font-mono">
                ENCODE
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">1 of 5</span>
          </div>

          {/* Simple Visual Flow: Message Hash -> Quantum State */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              {/* Message Hash Box */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto min-w-[200px] text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Input
                </span>
                <span className="text-sm font-bold font-mono text-cyan-300 block mt-0.5">
                  Message Hash
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-1 block truncate">
                  {displayHash}
                </span>
              </div>

              {/* Arrow */}
              <div className="text-cyan-400 font-mono text-lg font-bold">
                <ArrowRight className="w-5 h-5 hidden sm:block" />
                <span className="sm:hidden">&darr;</span>
              </div>

              {/* Quantum State Box */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/80 w-full sm:w-auto min-w-[200px] text-center">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                  Carrier
                </span>
                <span className="text-sm font-bold font-mono text-white block mt-0.5">
                  Quantum State
                </span>
                <span className="text-xs font-mono text-cyan-300 mt-1 block">
                  |ψ⟩ = α|0⟩ + β|1⟩
                </span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed">
              The message hash is converted into a small quantum-state
              representation for our simulation.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed">
              Think of a qubit as the quantum version of a bit. Unlike a normal
              bit, it can represent a combination of states before measurement.
            </p>
          </div>

          {/* Simple Visual Qubit Wire */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-mono text-slate-400 font-semibold block">
              VISUAL QUBIT CARRIER
            </span>

            <div className="flex items-center gap-3 font-mono text-sm">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                |0⟩
              </span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-slate-700 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 text-[10px] text-cyan-300 border border-cyan-800/80">
                  Superposition State: |+⟩
                </span>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
                |1⟩
              </span>
            </div>
          </div>

          {/* Educational "What does this mean?" */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <ExplainTerm termKey="qubit" />
            <ExplainTerm termKey="superposition" />
          </div>

          {/* Next Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Next: Create Entanglement</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: CREATE ENTANGLEMENT */}
      {currentStep === 2 && (
        <section
          id="qshield-step-entanglement"
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                STEP 2
              </span>
              <h3 className="text-base font-bold text-white font-mono">
                CREATE ENTANGLEMENT
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">2 of 5</span>
          </div>

          {/* Visual Connected Quantum Nodes */}
          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800/80 text-center space-y-4">
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase">
              Entangled Qubits
            </span>

            <div className="flex items-center justify-center gap-4 sm:gap-8 pt-2">
              {/* Node A */}
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-center w-28 sm:w-32 shadow-sm">
                <span className="text-[10px] font-mono text-slate-400 block">Sender Node</span>
                <span className="text-base font-bold font-mono text-cyan-300 mt-1 block">
                  Qubit A
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                  Alice
                </span>
              </div>

              {/* Entangled Connection Link */}
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-mono text-cyan-400 font-bold px-2 py-1 rounded bg-slate-900 border border-cyan-800/80 animate-pulse">
                  &harr;
                </span>
                <span className="text-[10px] font-mono text-slate-400 mt-1 hidden sm:block">
                  Bell Pair |Φ⁺⟩
                </span>
              </div>

              {/* Node B */}
              <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 text-center w-28 sm:w-32 shadow-sm">
                <span className="text-[10px] font-mono text-slate-400 block">Receiver Node</span>
                <span className="text-base font-bold font-mono text-cyan-300 mt-1 block">
                  Qubit B
                </span>
                <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                  Bob
                </span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              Entanglement creates a strong relationship between two quantum
              states.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              When two qubits are entangled, their properties become linked. Even
              if they are physically separated across a network, what happens to
              Qubit A directly influences the measurement observed at Qubit B.
            </p>
          </div>

          {/* Educational "What does this mean?" */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <ExplainTerm termKey="entanglement" />
            <ExplainTerm termKey="bell-state" />
            <ExplainTerm termKey="cnot" />
          </div>

          {/* Nav Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Encode</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Next: Teleport</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: TELEPORT */}
      {currentStep === 3 && (
        <section
          id="qshield-step-teleport"
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                STEP 3
              </span>
              <h3 className="text-base font-bold text-white font-mono">
                TELEPORT
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">3 of 5</span>
          </div>

          {/* Simple Animated Diagram */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <span className="text-xs font-mono text-slate-400 font-semibold block mb-2">
              TELEPORTATION FLOW
            </span>

            <div className="max-w-md mx-auto space-y-1.5 text-xs font-mono">
              {/* Stage 1: Input State */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-bold">Input State</span>
                </div>
                <span className="text-[11px] text-slate-400">Message State (|ψ⟩)</span>
              </div>

              <div className="flex justify-center text-slate-600 text-[10px]">&darr;</div>

              {/* Stage 2: Alice */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="font-bold">Alice (Sender)</span>
                </div>
                <span className="text-[11px] text-slate-400">Bell Measurement</span>
              </div>

              <div className="flex justify-center text-slate-600 text-[10px]">&darr;</div>

              {/* Stage 3: Entangled Pair */}
              <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/70 text-cyan-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-bold">Entangled Pair</span>
                </div>
                <span className="text-[11px] text-cyan-300">Shared Resource</span>
              </div>

              <div className="flex justify-center text-slate-600 text-[10px]">&darr;</div>

              {/* Stage 4: Classical Information */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-bold">Classical Information</span>
                </div>
                <span className="text-[11px] text-amber-300">2 Classical Bits</span>
              </div>

              <div className="flex justify-center text-slate-600 text-[10px]">&darr;</div>

              {/* Stage 5: Bob */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold">Bob (Receiver)</span>
                </div>
                <span className="text-[11px] text-slate-400">Pauli Unitary Correction</span>
              </div>

              <div className="flex justify-center text-slate-600 text-[10px]">&darr;</div>

              {/* Stage 6: Recovered State */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/70 text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold">Recovered State</span>
                </div>
                <span className="text-[11px] text-emerald-300">Identical to Input State</span>
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              Quantum teleportation transfers the state information using
              entanglement and classical information. No physical object is
              transported.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Because of the laws of quantum mechanics, attempting to intercept
              or clone the state destroys the entanglement, leaving detectable
              statistical footprints.
            </p>
          </div>

          {/* Educational "What does this mean?" */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <ExplainTerm termKey="quantum-teleportation" />
            <ExplainTerm termKey="quantum-gate" />
            <ExplainTerm termKey="hadamard-gate" />
            <ExplainTerm termKey="pauli-correction" />
          </div>

          {/* Nav Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Entanglement</span>
            </button>

            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Next: Measure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 4: MEASURE */}
      {currentStep === 4 && (
        <section
          id="qshield-step-measure"
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                STEP 4
              </span>
              <h3 className="text-base font-bold text-white font-mono">
                MEASURE
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">4 of 5</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-mono">
              Expected Result versus Observed Result
            </h4>
            <p className="text-xs text-slate-400">
              Under normal, untampered conditions, projective measurements across
              the 4 states balance near 25% each.
            </p>
          </div>

          {/* Simple Visual Bar Comparison Chart */}
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4 font-mono text-xs">
            {/* Expected Result */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-400 font-bold">
                <span>Expected Result (Clean Baseline)</span>
                <span className="text-[11px] text-cyan-400">25.0% each</span>
              </div>

              {histogram.map((item) => (
                <div key={`exp-${item.state}`} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>State |{item.state}⟩</span>
                    <span>{(item.expectedProbability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-slate-600 rounded-full"
                      style={{ width: `${item.expectedProbability * 200}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800/80 pt-3 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-300">Observed Result (Live Transaction)</span>
                <span
                  className={`text-[11px] ${
                    isDeviated ? 'text-rose-400 font-bold' : 'text-emerald-400'
                  }`}
                >
                  {isDeviated ? 'Statistical Skew Detected' : 'Normal Variance'}
                </span>
              </div>

              {histogram.map((item) => (
                <div key={`obs-${item.state}`} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>State |{item.state}⟩</span>
                    <span
                      className={
                        isDeviated ? 'text-rose-300 font-bold' : 'text-cyan-300'
                      }
                    >
                      {(item.observedProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDeviated ? 'bg-rose-500' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${item.observedProbability * 200}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plain-English Takeaway */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              Real systems naturally contain small variations. Q-SHIELD checks
              whether the observed behavior is unusually different from the
              expected behavior.
            </p>
          </div>

          {/* Educational "What does this mean?" */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <ExplainTerm termKey="measurement" />
            <ExplainTerm termKey="measurement-distribution" />
            <ExplainTerm termKey="fidelity" />
            <ExplainTerm termKey="jensen-shannon-divergence" />
          </div>

          {/* Nav Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Teleport</span>
            </button>

            <button
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Next: Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 5: ANALYZE */}
      {currentStep === 5 && (
        <section
          id="qshield-step-analyze"
          className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                STEP 5
              </span>
              <h3 className="text-base font-bold text-white font-mono">
                ANALYZE
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">5 of 5</span>
          </div>

          {/* Analysis Banner: Normal behavior vs Suspicious behavior */}
          {!isDeviated ? (
            <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      VERDICT: PASS
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Fidelity {(fidelity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white font-mono">
                    ✓ Normal behavior
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    All measurement probabilities fall within acceptable random
                    tolerances. No eavesdropping, replay attempt, or payload
                    tampering was detected during verification.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-rose-950/40 border border-rose-500/60 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      VERDICT: ALERT
                    </span>
                    <span className="text-xs font-mono text-rose-300">
                      Distribution Skew {deviation.toFixed(3)}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white font-mono">
                    ⚠ Suspicious behavior
                  </h4>
                  <p className="text-xs text-rose-200 leading-relaxed max-w-xl">
                    Measurement probabilities differ significantly from the expected
                    quantum distribution. This signature transaction has been
                    flagged for security quarantine.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Educational "What does this mean?" */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <ExplainTerm termKey="threat-score" />
            <ExplainTerm termKey="measurement-distribution" />
          </div>

          {/* Primary Action Button: "Continue to Security Results" */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back: Measure</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigateTab('attack-simulation')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Attacks</span>
              </button>

              <button
                id="btn-continue-to-security-results"
                onClick={() => onNavigateTab('security-results')}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <span>Continue to Security Results</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* EXPANDABLE "VIEW TECHNICAL DETAILS" (Kept collapsed by default) */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full px-5 py-3 text-left text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Technical Details (Formulas, Bloch Vector &amp; Matrices)</span>
          </span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-5 border-t border-slate-800 bg-slate-950/90 space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">
                  Quantum Fidelity (F)
                </span>
                <span className="text-base font-bold text-cyan-300">
                  {(fidelity * 100).toFixed(1)}%
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Formula: F = |⟨ψ_in|ψ_out⟩|²
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">
                  Total Variation Distance (TVD)
                </span>
                <span
                  className={`text-base font-bold ${
                    deviation > 0.08 ? 'text-rose-400' : 'text-emerald-300'
                  }`}
                >
                  {deviation.toFixed(3)}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Formula: δ(P, Q) = ½ ∑ |P(x) - Q(x)|
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block uppercase">
                  Pauli Unitary Gate
                </span>
                <span className="text-base font-bold text-slate-200">
                  {activeSession?.pauliCorrection?.appliedGate || 'I (Identity)'}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Correction: {activeSession?.pauliCorrection?.formula || 'Z^0 · X^0'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="text-slate-500 block mb-1 uppercase">
                State Vector Representation:
              </span>
              <code className="text-cyan-300">
                |ψ⟩ = (
                {activeSession?.quantumState?.alpha?.real?.toFixed(2) || '0.71'} +{' '}
                {activeSession?.quantumState?.alpha?.imag?.toFixed(2) || '0.00'}
                i)|0⟩ + (
                {activeSession?.quantumState?.beta?.real?.toFixed(2) || '0.71'} +{' '}
                {activeSession?.quantumState?.beta?.imag?.toFixed(2) || '0.00'}
                i)|1⟩
              </code>
            </div>

            {/* Quantum Gates Explanations Reference */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">
                Quantum Operations &amp; Gates Glossary
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <ExplainTerm termKey="quantum-gate" label="Quantum Gate" />
                <ExplainTerm termKey="hadamard-gate" label="Hadamard Gate" />
                <ExplainTerm termKey="x-gate" label="X Gate" />
                <ExplainTerm termKey="z-gate" label="Z Gate" />
                <ExplainTerm termKey="cnot" label="CNOT Gate" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

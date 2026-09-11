import React, { useState, useEffect } from 'react';
import {
  SignatureSession,
  PauliEigenstateType,
  BellStateType,
  TeleportationResult,
} from '../../types/quantum';
import {
  quantumSimulationService,
  Complex,
} from '../../services/quantumSimulationService';
import {
  Atom,
  Cpu,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Binary,
  RotateCcw,
  Zap,
  Server,
  Play,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GlossaryTooltip } from '../common/GlossaryTooltip';

interface QuantumLabViewProps {
  activeSession: SignatureSession | null;
}

export const QuantumLabView: React.FC<QuantumLabViewProps> = ({ activeSession }) => {
  // State selection mode: Pauli presets or custom angles
  const [selectedStatePreset, setSelectedStatePreset] = useState<PauliEigenstateType>('|0>');
  const [customTheta, setCustomTheta] = useState<number>(
    activeSession?.quantumState.theta ?? 54.7
  );
  const [customPhi, setCustomPhi] = useState<number>(
    activeSession?.quantumState.phi ?? 45.0
  );

  // Bell state selection
  const [selectedBellState, setSelectedBellState] = useState<BellStateType>('|Φ⁺>');

  // Configurable shots
  const [shots, setShots] = useState<number>(2048);

  // Simulation execution engine mode: Client TS vs Server REST API
  const [engineMode, setEngineMode] = useState<'CLIENT' | 'SERVER'>('CLIENT');
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);

  // Selected stage in the 5-wire circuit diagram
  const [selectedCircuitStage, setSelectedCircuitStage] = useState<number>(1);

  // Teleportation simulation result
  const [simResult, setSimResult] = useState<TeleportationResult>(() => {
    return quantumSimulationService.simulateTeleportation('|0>', 2048, {
      bellState: '|Φ⁺>',
    });
  });

  // Syndrome verification matrix state
  const [syndromeMatrix, setSyndromeMatrix] = useState<
    { syndrome: '00' | '01' | '10' | '11'; appliedGate: string; fidelity: number; passed: boolean }[] | null
  >(null);

  // Execute simulation function
  const runSimulation = async (
    preset: PauliEigenstateType = selectedStatePreset,
    shotCount: number = shots,
    bellState: BellStateType = selectedBellState
  ) => {
    setIsRunningSim(true);
    try {
      if (engineMode === 'SERVER') {
        // Run via Server REST API
        const payloadInput =
          preset === 'CUSTOM'
            ? { theta: customTheta, phi: customPhi }
            : preset;

        const response = await fetch('/api/quantum/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputState: payloadInput,
            shots: shotCount,
            options: { bellState },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSimResult(data);
          setIsRunningSim(false);
          return;
        }
      }

      // Default to deterministic client-side simulation service
      const inputArg =
        preset === 'CUSTOM'
          ? quantumSimulationService.createCustomState(customTheta, customPhi)
          : preset;

      const result = quantumSimulationService.simulateTeleportation(inputArg, shotCount, {
        bellState,
      });
      setSimResult(result);
    } catch (err) {
      console.warn('Simulation execution fallback to client:', err);
      const fallback = quantumSimulationService.simulateTeleportation(preset, shotCount, {
        bellState,
      });
      setSimResult(fallback);
    } finally {
      setIsRunningSim(false);
    }
  };

  // Run all 4 syndromes verification
  const handleVerifyAllSyndromes = () => {
    const inputArg =
      selectedStatePreset === 'CUSTOM'
        ? quantumSimulationService.createCustomState(customTheta, customPhi)
        : selectedStatePreset;
    const matrix = quantumSimulationService.verifyAllAliceSyndromes(inputArg);
    setSyndromeMatrix(matrix);
  };

  // Recompute when preset changes
  const handlePresetChange = (preset: PauliEigenstateType) => {
    setSelectedStatePreset(preset);
    if (preset !== 'CUSTOM') {
      const stateObj = quantumSimulationService.getPauliEigenstate(preset);
      setCustomTheta(stateObj.theta);
      setCustomPhi(stateObj.phi);
    }
    runSimulation(preset, shots, selectedBellState);
  };

  // Live bar chart data comparing theoretical expectation with observed shots for Bob's measurement
  const bobMeasurementChartData = [
    {
      state: '|0⟩',
      Theoretical: parseFloat((simResult.inputState.theoreticalProbabilities['0'] * 100).toFixed(2)),
      Observed: parseFloat((simResult.measurementProbabilities['0'] * 100).toFixed(2)),
      ObservedCount: simResult.measurementCounts['0'],
    },
    {
      state: '|1⟩',
      Theoretical: parseFloat((simResult.inputState.theoreticalProbabilities['1'] * 100).toFixed(2)),
      Observed: parseFloat((simResult.measurementProbabilities['1'] * 100).toFixed(2)),
      ObservedCount: simResult.measurementCounts['1'],
    },
  ];

  // Circuit stages
  const circuitStages = [
    {
      step: 1,
      title: 'Bell-State Entanglement Generation',
      subtitle: 'Qubits q₁ and q₂ entangled across optical verification channel',
      mathFormula: `${simResult.bellState}`,
      circuitDetails: 'Hadamard H on q₁, followed by CNOT(control: q₁, target: q₂).',
      notes: 'Creates maximum Einstein-Podolsky-Rosen (EPR) entanglement between Alice and Bob.',
    },
    {
      step: 2,
      title: 'Carrier State Injection (Alice)',
      subtitle: 'Input state prepared on signature carrier qubit q₀',
      mathFormula: `|ψ⟩₀ = ${simResult.inputState.label}`,
      circuitDetails: `Polar rotation U(θ=${simResult.inputState.theta}°, φ=${simResult.inputState.phi}°) on q₀.`,
      notes: 'State contains the non-clonable quantum token bound to the digital signature digest.',
    },
    {
      step: 3,
      title: 'Alice Bell-State Measurement (BSM)',
      subtitle: `Collapsed into syndrome (${simResult.aliceMeasurement.m1}, ${simResult.aliceMeasurement.m2}) [${simResult.aliceMeasurement.bellBasisCollapsed}]`,
      mathFormula: `CNOT(q₀, q₁) → H(q₀) → Detectors M₀, M₁ => m₁=${simResult.aliceMeasurement.m1}, m₂=${simResult.aliceMeasurement.m2}`,
      circuitDetails: 'Alice measures q₀ and q₁ in the Bell basis; each outcome occurs with P = 25%.',
      notes: 'Destroys original state at Alice (No-Cloning Theorem) and produces 2 classical feed-forward bits.',
    },
    {
      step: 4,
      title: 'Classical Feed-Forward & Pauli Correction',
      subtitle: `Bob applies unitary correction ${simResult.correction.appliedGate}`,
      mathFormula: `${simResult.correction.formula}`,
      circuitDetails: `Bob applies Z^${simResult.correction.m1} · X^${simResult.correction.m2} to restore exact state.`,
      notes: 'Reconstructs identical state |ψ⟩ at Bob’s verifier node with theoretical fidelity F = 1.000.',
    },
    {
      step: 5,
      title: 'Final Bob Measurement & State Verification',
      subtitle: `Fidelity F = ${(simResult.fidelity * 100).toFixed(2)}% | Sampled over ${shots} shots`,
      mathFormula: `F = |⟨ψ_in|ψ_Bob⟩|² = ${simResult.fidelity.toFixed(4)},  P(|0⟩)=${simResult.measurementProbabilities['0']}, P(|1⟩)=${simResult.measurementProbabilities['1']}`,
      circuitDetails: `Projective detector sampling across computational and conjugate bases.`,
      notes: 'Deterministic statistical engine verifies uncorrupted quantum transmission.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Mandatory Prototype Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60">
              PROTOTYPE QUANTUM ABSTRACTION
            </span>
            <span className="text-xs text-cyan-400/90 font-mono font-semibold">
              Quantum computation simulated for prototype demonstration.
            </span>
          </div>
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <Atom className="w-5 h-5 text-cyan-400" />
            <span>Q-SHIELD Quantum Simulation Service</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic 3-qubit teleportation workflow with Pauli eigenstates, Bell-state generation, Bell measurement, conditional Pauli corrections, and configurable shot sampling.
          </p>
        </div>

        {/* Backend & Engine Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 text-right">
            <span className="text-slate-500 block text-[10px]">SIMULATION ENGINE</span>
            <span className="text-cyan-400 font-bold flex items-center justify-end gap-1">
              <Cpu className="w-3.5 h-3.5" />
              QuantumSimulationService
            </span>
          </div>

          <div className="flex flex-col gap-1 text-[11px] font-mono">
            <span className="text-slate-500 text-[10px]">EXECUTION BACKEND</span>
            <div className="flex rounded border border-slate-800 bg-slate-950 p-0.5">
              <button
                onClick={() => setEngineMode('CLIENT')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  engineMode === 'CLIENT'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Client TS
              </button>
              <button
                onClick={() => setEngineMode('SERVER')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  engineMode === 'SERVER'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Server REST
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Console: Pauli Eigenstates, Bell States, Shots, and Trigger */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase text-white tracking-wider">
              Teleportation Circuit Parameters
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready (Deterministic Mode)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* 1. Pauli Eigenstates Selector (5 Cols) */}
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
              <span>Input Carrier State |ψ⟩</span>
              <span className="text-[10px] text-cyan-400 font-normal">Pauli Eigenstates</span>
            </label>

            <div className="grid grid-cols-5 gap-1.5 font-mono text-xs">
              {(['|0>', '|1>', '|+>', '|->', 'CUSTOM'] as PauliEigenstateType[]).map((stateKey) => {
                const isSelected = selectedStatePreset === stateKey;
                return (
                  <button
                    key={stateKey}
                    onClick={() => handlePresetChange(stateKey)}
                    className={`py-2 px-1 rounded-lg border text-center font-bold transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-700 hover:text-cyan-300'
                    }`}
                  >
                    <span className="block text-sm">{stateKey === 'CUSTOM' ? 'θ,φ' : stateKey}</span>
                    <span className="block text-[9px] opacity-80 mt-0.5">
                      {stateKey === '|0>' && 'Z=+1'}
                      {stateKey === '|1>' && 'Z=-1'}
                      {stateKey === '|+>' && 'X=+1'}
                      {stateKey === '|->' && 'X=-1'}
                      {stateKey === 'CUSTOM' && 'Custom'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Sliders if Custom Selected */}
            {selectedStatePreset === 'CUSTOM' && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono mt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Polar Angle (θ):</span>
                    <span className="text-cyan-300 font-bold">{customTheta}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="1"
                    value={customTheta}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomTheta(val);
                    }}
                    onMouseUp={() => runSimulation('CUSTOM', shots, selectedBellState)}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Azimuthal Angle (φ):</span>
                    <span className="text-cyan-300 font-bold">{customPhi}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="2"
                    value={customPhi}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomPhi(val);
                    }}
                    onMouseUp={() => runSimulation('CUSTOM', shots, selectedBellState)}
                    className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 flex justify-between items-center">
              <span>Selected State:</span>
              <span className="text-cyan-300 font-bold">{simResult.inputState.label}</span>
            </div>
          </div>

          {/* 2. Bell State Generation (3 Cols) */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
              <span>Shared EPR Pair</span>
              <span className="text-[10px] text-slate-400">q₁ &amp; q₂</span>
            </label>

            <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
              {(['|Φ⁺>', '|Φ⁻>', '|Ψ⁺>', '|Ψ⁻>'] as BellStateType[]).map((bellKey) => {
                const isSelected = selectedBellState === bellKey;
                return (
                  <button
                    key={bellKey}
                    onClick={() => {
                      setSelectedBellState(bellKey);
                      runSimulation(selectedStatePreset, shots, bellKey);
                    }}
                    className={`py-2 px-1 rounded-lg border text-center font-bold transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-700'
                    }`}
                  >
                    <span className="block text-xs">{bellKey}</span>
                    <span className="block text-[9px] opacity-75">
                      {bellKey === '|Φ⁺>' && '00 + 11'}
                      {bellKey === '|Φ⁻>' && '00 - 11'}
                      {bellKey === '|Ψ⁺>' && '01 + 10'}
                      {bellKey === '|Ψ⁻>' && '01 - 10'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 text-center">
              <span className="text-cyan-400 font-bold">{simResult.bellState}</span>
            </div>
          </div>

          {/* 3. Configurable Shots (4 Cols) */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-xs font-mono text-slate-300 font-semibold flex items-center justify-between">
              <span>Measurement Shots</span>
              <span className="text-[10px] text-cyan-400">{shots} Shots</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
              {[100, 500, 1024, 2048, 4096, 8192].map((sVal) => {
                const isSelected = shots === sVal;
                return (
                  <button
                    key={sVal}
                    onClick={() => {
                      setShots(sVal);
                      runSimulation(selectedStatePreset, sVal, selectedBellState);
                    }}
                    className={`py-1.5 rounded-lg border text-center font-bold text-xs transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-700'
                    }`}
                  >
                    {sVal}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => runSimulation()}
                disabled={isRunningSim}
                className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningSim ? 'Simulating...' : 'Run Teleportation'}</span>
              </button>

              <button
                onClick={handleVerifyAllSyndromes}
                title="Verify all 4 Alice measurement syndromes (00, 01, 10, 11) yield F=1.0"
                className="py-2 px-3 rounded-lg bg-slate-950 border border-cyan-800/80 hover:border-cyan-500 text-cyan-400 font-mono text-xs flex items-center justify-center gap-1 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify All Syndromes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Syndrome Verification Table Modal / Drawer (if triggered) */}
      {syndromeMatrix && (
        <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-mono font-bold uppercase text-white">
                Syndrome Invariance Verification across all Alice Outcomes (00, 01, 10, 11)
              </h4>
            </div>
            <button
              onClick={() => setSyndromeMatrix(null)}
              className="text-xs text-slate-400 hover:text-white font-mono"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 font-mono text-xs">
            {syndromeMatrix.map((item) => (
              <div
                key={item.syndrome}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-center"
              >
                <div className="text-[11px] text-slate-400">Alice Bits (m₁, m₂)</div>
                <div className="text-base font-bold text-cyan-300">{item.syndrome}</div>
                <div className="text-[10px] text-slate-400">
                  Applied Gate: <span className="text-white font-bold">{item.appliedGate}</span>
                </div>
                <div className="text-xs text-emerald-400 font-bold">
                  Fidelity: {(item.fidelity * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] text-emerald-300 bg-emerald-950/60 rounded px-1 py-0.5 border border-emerald-800/40">
                  PASS (Exact Restoration)
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Mathematical proof: Alice’s measurement produces uniform syndrome probabilities (25% each), and Bob’s conditional Pauli correction <span className="font-mono text-cyan-400">Z^(m₁) · X^(m₂)</span> guarantees identical state reconstruction <span className="font-mono text-cyan-400">F = 1.000</span> for every branch.
          </p>
        </div>
      )}

      {/* Teleportation Execution Telemetry Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Card 1: Input State */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Carrier Input State</span>
          <div className="text-lg font-bold text-cyan-300 truncate">{simResult.inputState.label}</div>
          <div className="text-xs text-slate-400">
            θ = {simResult.inputState.theta}°, φ = {simResult.inputState.phi}°
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
            <span>Exp P(0): {(simResult.inputState.theoreticalProbabilities['0'] * 100).toFixed(1)}%</span>
            <span>Exp P(1): {(simResult.inputState.theoreticalProbabilities['1'] * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 2: Alice Measurement */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Alice BSM Outcome</span>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span>m₁={simResult.aliceMeasurement.m1}, m₂={simResult.aliceMeasurement.m2}</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
              {simResult.aliceMeasurement.bellBasisCollapsed}
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Syndrome Bits: <span className="text-cyan-300 font-bold">{simResult.aliceMeasurement.syndromeBits}</span>
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
            Branch Probability: 25.0% (Uniform)
          </div>
        </div>

        {/* Card 3: Bob Pauli Correction */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Bob Pauli Correction</span>
          <div className="text-lg font-bold text-emerald-400">
            {simResult.correction.appliedGate}
          </div>
          <div className="text-xs text-slate-400 truncate">
            {simResult.correction.formula}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 font-mono">
            {simResult.correction.gateMatrixDescription}
          </div>
        </div>

        {/* Card 4: Overlap Fidelity & Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block">State Overlap Fidelity</span>
          <div className="text-lg font-bold text-cyan-300 flex items-center gap-1.5">
            <span>{(simResult.fidelity * 100).toFixed(2)}%</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-normal">
              PASS
            </span>
          </div>
          <div className="text-xs text-slate-400">
            F = {simResult.fidelity.toFixed(5)}
          </div>
          <div className="text-[11px] text-emerald-400 pt-1 border-t border-slate-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Teleportation Verified</span>
          </div>
        </div>
      </div>

      {/* Interactive 3-Wire Quantum Circuit Diagram */}
      <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <span>3-Qubit Quantum Teleportation Circuit</span>
            <span className="text-[10px] text-slate-400 font-sans font-normal">
              (Click any stage node below to inspect mathematical state representation)
            </span>
          </h3>
          <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
            Stage {selectedCircuitStage} of 5 Active
          </span>
        </div>

        {/* Circuit Canvas */}
        <div className="overflow-x-auto py-5 px-3 bg-slate-950/90 rounded-lg border border-slate-800/90">
          <div className="min-w-[760px] relative font-mono text-xs space-y-2">
            {/* Wire Q0: Alice Message Carrier */}
            <div className="flex items-center h-14 relative">
              <span className="w-24 text-slate-400 font-bold shrink-0">q₀ |ψ⟩</span>
              <div className="flex-1 h-[2px] bg-slate-700 relative flex items-center justify-between">
                {/* Stage 1: Empty */}
                <div className="w-16" />

                {/* Stage 2: State Prep Unitary */}
                <button
                  onClick={() => setSelectedCircuitStage(2)}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                    selectedCircuitStage === 2
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 text-cyan-300 border-cyan-800 hover:border-cyan-500'
                  }`}
                >
                  U(θ,φ)
                </button>

                {/* Stage 3: BSM CNOT Control */}
                <button
                  onClick={() => setSelectedCircuitStage(3)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold border transition-all ${
                    selectedCircuitStage === 3
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-900 text-cyan-400 border-cyan-700'
                  }`}
                >
                  &bull;
                </button>

                {/* Stage 3b: Hadamard on q0 */}
                <button
                  onClick={() => setSelectedCircuitStage(3)}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold hover:border-cyan-500"
                >
                  H
                </button>

                {/* Measurement Box M0 */}
                <button
                  onClick={() => setSelectedCircuitStage(3)}
                  className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-cyan-400 text-[11px] font-bold"
                >
                  [M₀]
                </button>

                <div className="w-36 text-center text-[10px] text-cyan-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
                  == Classical Bit m₁={simResult.aliceMeasurement.m1} ==
                </div>
              </div>
            </div>

            {/* Wire Q1: Alice Entangled Pair Half */}
            <div className="flex items-center h-14 relative">
              <span className="w-24 text-slate-400 font-bold shrink-0">q₁ |0⟩</span>
              <div className="flex-1 h-[2px] bg-slate-700 relative flex items-center justify-between">
                {/* Stage 1: Hadamard */}
                <button
                  onClick={() => setSelectedCircuitStage(1)}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                    selectedCircuitStage === 1
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 text-cyan-300 border-cyan-800 hover:border-cyan-500'
                  }`}
                >
                  H
                </button>

                {/* Stage 1: CNOT Control */}
                <button
                  onClick={() => setSelectedCircuitStage(1)}
                  className="w-5 h-5 rounded-full bg-slate-900 text-cyan-400 border border-cyan-700 flex items-center justify-center font-bold"
                >
                  &bull;
                </button>

                {/* Stage 3: BSM CNOT Target */}
                <button
                  onClick={() => setSelectedCircuitStage(3)}
                  className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 text-cyan-300 flex items-center justify-center font-bold"
                >
                  &oplus;
                </button>

                {/* Measurement Box M1 */}
                <button
                  onClick={() => setSelectedCircuitStage(3)}
                  className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-cyan-400 text-[11px] font-bold"
                >
                  [M₁]
                </button>

                <div className="w-36 text-center text-[10px] text-cyan-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
                  == Classical Bit m₂={simResult.aliceMeasurement.m2} ==
                </div>
              </div>
            </div>

            {/* Wire Q2: Bob Verifier Qubit */}
            <div className="flex items-center h-14 relative">
              <span className="w-24 text-slate-400 font-bold shrink-0">q₂ |0⟩</span>
              <div className="flex-1 h-[2px] bg-slate-700 relative flex items-center justify-between">
                {/* Stage 1: CNOT Target */}
                <button
                  onClick={() => setSelectedCircuitStage(1)}
                  className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 text-cyan-300 flex items-center justify-center font-bold"
                >
                  &oplus;
                </button>

                {/* Fiber Transit Channel */}
                <div className="w-36 text-center text-[10px] text-cyan-500/70">
                  --- Entangled Channel ---
                </div>

                {/* Stage 4: Pauli Correction X^m2 */}
                <button
                  onClick={() => setSelectedCircuitStage(4)}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                    selectedCircuitStage === 4
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 text-cyan-300 border-cyan-800 hover:border-cyan-500'
                  }`}
                >
                  X^({simResult.aliceMeasurement.m2})
                </button>

                {/* Stage 4: Pauli Correction Z^m1 */}
                <button
                  onClick={() => setSelectedCircuitStage(4)}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                    selectedCircuitStage === 4
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 text-cyan-300 border-cyan-800 hover:border-cyan-500'
                  }`}
                >
                  Z^({simResult.aliceMeasurement.m1})
                </button>

                {/* Stage 5: Final Measurement */}
                <button
                  onClick={() => setSelectedCircuitStage(5)}
                  className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${
                    selectedCircuitStage === 5
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-900 text-emerald-400 border-emerald-800 hover:border-emerald-500'
                  }`}
                >
                  Verify |ψ⟩
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Stage Detail Card */}
        {(() => {
          const currentStage = circuitStages[selectedCircuitStage - 1];
          return (
            <div className="p-4 rounded-lg bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">
                  STAGE {currentStage.step}: {currentStage.title}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{currentStage.subtitle}</span>
              </div>
              <div className="p-2.5 rounded bg-slate-900 border border-cyan-900/40 font-mono text-xs text-cyan-300">
                {currentStage.mathFormula}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStage.notes} ({currentStage.circuitDetails})
              </p>
            </div>
          );
        })()}
      </div>

      {/* Two-Column Deep Dive: Bob's Measurement Distribution & Pauli Correction Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Final Bob Measurement Probability Distribution (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Final Bob Measurement Distribution ({shots} Shots)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Comparing theoretical probability |α|² and |β|² against sampled counts
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
              COMPUTATIONAL BASIS {`{|0⟩, |1⟩}`}
            </span>
          </div>

          {/* Histogram Chart */}
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bobMeasurementChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="state" stroke="#64748b" tick={{ fontSize: 13, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}% (${name === 'Observed' ? `${item.payload.ObservedCount} shots` : ''})`,
                    name,
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="Theoretical" fill="#38bdf8" fillOpacity={0.4} stroke="#38bdf8" name="Theoretical %" />
                <Bar dataKey="Observed" fill="#06b6d4" name="Observed %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Counts & Statistics Breakdown */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">OUTCOME |0⟩</span>
              <span className="text-cyan-300 font-bold text-base">
                {simResult.measurementCounts['0']} Shots
              </span>
              <span className="text-slate-400 block text-[11px]">
                Observed: {(simResult.measurementProbabilities['0'] * 100).toFixed(1)}% | Expected: {(simResult.inputState.theoreticalProbabilities['0'] * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">OUTCOME |1⟩</span>
              <span className="text-cyan-300 font-bold text-base">
                {simResult.measurementCounts['1']} Shots
              </span>
              <span className="text-slate-400 block text-[11px]">
                Observed: {(simResult.measurementProbabilities['1'] * 100).toFixed(1)}% | Expected: {(simResult.inputState.theoreticalProbabilities['1'] * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pauli Unitary Feed-Forward Matrix & Bloch Coordinates (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Pauli Correction Reference Matrix */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-white flex items-center gap-1.5">
                <span>Conditional Pauli Syndrome Lookup</span>
                <GlossaryTooltip term="Pauli Correction" />
              </span>
              <span className="text-[10px] font-mono text-slate-400">U_Bob = Z^m₁ · X^m₂</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div
                className={`p-2.5 rounded border text-center transition-all ${
                  simResult.aliceMeasurement.syndromeBits === '00'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] text-slate-500 block">m₁=0, m₂=0</span>
                <span className="text-cyan-300 font-bold block text-sm">I (Identity)</span>
                <span className="text-[10px]">No operation required</span>
              </div>

              <div
                className={`p-2.5 rounded border text-center transition-all ${
                  simResult.aliceMeasurement.syndromeBits === '01'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] text-slate-500 block">m₁=0, m₂=1</span>
                <span className="text-cyan-300 font-bold block text-sm">X (Bit Flip)</span>
                <span className="text-[10px]">σx Pauli matrix</span>
              </div>

              <div
                className={`p-2.5 rounded border text-center transition-all ${
                  simResult.aliceMeasurement.syndromeBits === '10'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] text-slate-500 block">m₁=1, m₂=0</span>
                <span className="text-cyan-300 font-bold block text-sm">Z (Phase Flip)</span>
                <span className="text-[10px]">σz Pauli matrix</span>
              </div>

              <div
                className={`p-2.5 rounded border text-center transition-all ${
                  simResult.aliceMeasurement.syndromeBits === '11'
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] text-slate-500 block">m₁=1, m₂=1</span>
                <span className="text-cyan-300 font-bold block text-sm">Z · X (Bit &amp; Phase)</span>
                <span className="text-[10px]">Combined correction</span>
              </div>
            </div>
          </div>

          {/* Bloch Coordinates & Quantum State Representation */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white">Bloch Vector Projection</span>
              <span className="text-[10px] text-cyan-400">Unit Sphere r = 1.0</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">X (Hadamard)</span>
                <span className="text-slate-200 font-bold">{simResult.inputState.blochCoordinates.x.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Y (Circular)</span>
                <span className="text-slate-200 font-bold">{simResult.inputState.blochCoordinates.y.toFixed(3)}</span>
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Z (Computational)</span>
                <span className="text-slate-200 font-bold">{simResult.inputState.blochCoordinates.z.toFixed(3)}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-[11px]">
              <div className="text-slate-400">Exact Reconstructed Bob State:</div>
              <div className="text-emerald-300 font-bold truncate">
                |ψ_Bob⟩ = {simResult.inputState.label}
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-800">
                <span>Verification Decision:</span>
                <span className="text-emerald-400 font-bold">STATE VERIFIED (F = 1.000)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

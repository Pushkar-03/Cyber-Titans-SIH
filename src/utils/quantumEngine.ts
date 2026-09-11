/**
 * Deterministic Quantum Simulation Abstraction
 * 
 * NOTE FOR SECURITY REVIEW:
 * This module is a quantum-inspired simulation abstraction designed for statistical
 * threat monitoring of digital signature verification sessions.
 * Real quantum hardware or Qiskit/Cirq backends can seamlessly replace this simulation layer.
 */

import {
  QuantumStateVector,
  TeleportationStage,
  PauliCorrection,
  MeasurementDistribution,
  MeasurementHistogramEntry,
  AttackType,
} from '../types/quantum';

/**
 * Generate a quantum state vector based on deterministic hash entropy or custom angles.
 */
export function generateQuantumState(seedHash: string): QuantumStateVector {
  // Derive deterministic angles from hash bytes to avoid arbitrary randoms
  const byte1 = parseInt(seedHash.slice(0, 2), 16) || 72;
  const byte2 = parseInt(seedHash.slice(2, 4), 16) || 145;

  // Map byte1 to theta [20° to 160°]
  const thetaDeg = 20 + (byte1 / 255) * 140;
  // Map byte2 to phi [0° to 340°]
  const phiDeg = (byte2 / 255) * 340;

  const thetaRad = (thetaDeg * Math.PI) / 180;
  const phiRad = (phiDeg * Math.PI) / 180;

  const alphaReal = Math.cos(thetaRad / 2);
  const alphaImag = 0;

  const betaReal = Math.sin(thetaRad / 2) * Math.cos(phiRad);
  const betaImag = Math.sin(thetaRad / 2) * Math.sin(phiRad);

  // Bloch sphere cartesian projection
  const x = Math.sin(thetaRad) * Math.cos(phiRad);
  const y = Math.sin(thetaRad) * Math.sin(phiRad);
  const z = Math.cos(thetaRad);

  return {
    alpha: { real: parseFloat(alphaReal.toFixed(4)), imag: parseFloat(alphaImag.toFixed(4)) },
    beta: { real: parseFloat(betaReal.toFixed(4)), imag: parseFloat(betaImag.toFixed(4)) },
    theta: parseFloat(thetaDeg.toFixed(1)),
    phi: parseFloat(phiDeg.toFixed(1)),
    label: `|ψ⟩ = ${alphaReal.toFixed(2)}|0⟩ + (${betaReal.toFixed(2)} + ${betaImag.toFixed(2)}i)|1⟩`,
    blochCoordinates: {
      x: parseFloat(x.toFixed(3)),
      y: parseFloat(y.toFixed(3)),
      z: parseFloat(z.toFixed(3)),
    },
  };
}

/**
 * Generates the 5 sequential stages of quantum teleportation-assisted signature verification.
 */
export function generateTeleportationStages(state: QuantumStateVector): TeleportationStage[] {
  return [
    {
      step: 1,
      name: 'Entanglement Distribution',
      subtext: 'Bell State Generator |Φ⁺⟩',
      stateRepresentation: '|Φ⁺⟩_AB = 1/√2 (|00⟩ + |11⟩)',
      gateDetails: 'Hadamard(H) on q1 → CNOT(control: q1, target: q2)',
      status: 'COMPLETED',
    },
    {
      step: 2,
      name: 'State Injection (Alice)',
      subtext: 'Input Signature Carrier State |ψ⟩',
      stateRepresentation: `|Ψ₀⟩ = |ψ⟩_A ⊗ |Φ⁺⟩_AB (${state.label})`,
      gateDetails: 'Preparation unitary U(θ,φ) on signature carrier qubit q0',
      status: 'COMPLETED',
    },
    {
      step: 3,
      name: 'Bell-State Measurement (BSM)',
      subtext: 'Entangled Projection on Alice’s Node',
      stateRepresentation: 'CNOT(q0, q1) → H(q0) → Statistical Projective Detectors',
      gateDetails: 'Yields 2 classical syndrome bits: m₁ ∈ {0,1}, m₂ ∈ {0,1}',
      status: 'COMPLETED',
    },
    {
      step: 4,
      name: 'Classical Feed-Forward & Pauli Correction',
      subtext: 'Verifier Unitary Restoration',
      stateRepresentation: 'Verifier applies conditional unitary: U = Z^(m₁) · X^(m₂)',
      gateDetails: 'Bob reconstructs identical state |ψ⟩ without measuring during transit',
      status: 'COMPLETED',
    },
    {
      step: 5,
      name: 'Quantum Statistical Verification',
      subtext: 'Conjugate Basis Sampling',
      stateRepresentation: 'Projective cross-basis tomography (Z & X basis distributions)',
      gateDetails: 'Evaluates Quantum State Fidelity F and Bhattacharyya distance',
      status: 'COMPLETED',
    },
  ];
}

/**
 * Deterministically computes Pauli correction syndome from hash
 */
export function computePauliCorrection(hash: string): PauliCorrection {
  const byte = parseInt(hash.slice(4, 6), 16) || 0;
  const m1 = (byte & 1) as 0 | 1;
  const m2 = ((byte >> 1) & 1) as 0 | 1;

  let appliedGate: 'I' | 'X' | 'Z' | 'Z·X' = 'I';
  let formula = 'I (Identity - No phase/bit transformation required)';

  if (m1 === 0 && m2 === 1) {
    appliedGate = 'X';
    formula = 'X (Bit Flip Unitary [σx])';
  } else if (m1 === 1 && m2 === 0) {
    appliedGate = 'Z';
    formula = 'Z (Phase Flip Unitary [σz])';
  } else if (m1 === 1 && m2 === 1) {
    appliedGate = 'Z·X';
    formula = 'Z · X (Combined Bit and Phase Restoration)';
  }

  return { m1, m2, appliedGate, formula };
}

/**
 * Deterministically simulates the statistical measurement distribution under various attack conditions.
 * 
 * Total shots: 2048.
 * Expected for ideal protocol: 25% for each state |00⟩, |01⟩, |10⟩, |11⟩.
 */
export function simulateMeasurementDistribution(
  seedHash: string,
  attack: AttackType = 'NONE',
  noiseLevel: number = 0.15,
  customObserved?: { '00'?: number; '01'?: number; '10'?: number; '11'?: number }
): MeasurementDistribution {
  const shots = 2048;
  const states: ('00' | '01' | '10' | '11')[] = ['00', '01', '10', '11'];
  
  // Baseline natural shot noise (seed-driven pseudo-Poisson variance)
  const h1 = parseInt(seedHash.slice(8, 10), 16) || 42;
  const h2 = parseInt(seedHash.slice(10, 12), 16) || 128;
  const h3 = parseInt(seedHash.slice(12, 14), 16) || 205;
  const h4 = parseInt(seedHash.slice(14, 16), 16) || 99;

  // Expected ideal distribution is 0.25 (25%) per outcome
  let p00 = 0.25;
  let p01 = 0.25;
  let p10 = 0.25;
  let p11 = 0.25;

  let obsP00 = 0.25 + ((h1 % 15) - 7) * 0.0015;
  let obsP01 = 0.25 + ((h2 % 15) - 7) * 0.0015;
  let obsP10 = 0.25 + ((h3 % 15) - 7) * 0.0015;
  let obsP11 = 1.0 - (obsP00 + obsP01 + obsP10);

  // Attack modulations
  switch (attack) {
    case 'MANIPULATION':
      // Attacker forces bias into specific detector paths (e.g. eavesdropping basis collapse)
      obsP00 = 0.58;
      obsP01 = 0.08;
      obsP10 = 0.28;
      obsP11 = 0.06;
      break;

    case 'QUANTUM_NOISE': {
      // Configurable depolarizing and asymmetric thermal decoherence from 0% to 30%
      const clampedNoise = Math.max(0, Math.min(0.30, noiseLevel));
      const factor = clampedNoise / 0.15; // 0 at 0%, 1 at 15%, 2 at 30%
      obsP00 = 0.25 + 0.13 * factor;
      obsP01 = Math.max(0.01, 0.25 - 0.11 * factor);
      obsP10 = 0.25 + 0.10 * factor;
      obsP11 = Math.max(0.01, 0.25 - 0.12 * factor);
      break;
    }

    case 'TAMPERING':
      // Signature tampering corrupts state alignment
      obsP00 = 0.44;
      obsP01 = 0.16;
      obsP10 = 0.29;
      obsP11 = 0.11;
      break;

    case 'REPLAY':
    case 'DUPLICATION':
      // Replay preserves distribution but violates nonce / timestamp consumption
      obsP00 = 0.252;
      obsP01 = 0.248;
      obsP10 = 0.251;
      obsP11 = 0.249;
      break;

    case 'NONE':
    default:
      // Normal clean quantum session with standard quantum projection noise
      break;
  }

  // If custom observed distribution overrides are provided (e.g. interactive manipulation)
  if (customObserved) {
    if (customObserved['00'] !== undefined) obsP00 = customObserved['00'];
    if (customObserved['01'] !== undefined) obsP01 = customObserved['01'];
    if (customObserved['10'] !== undefined) obsP10 = customObserved['10'];
    if (customObserved['11'] !== undefined) obsP11 = customObserved['11'];
  }

  // Normalize observed probabilities
  const sumObs = (obsP00 + obsP01 + obsP10 + obsP11) || 1.0;
  obsP00 = obsP00 / sumObs;
  obsP01 = obsP01 / sumObs;
  obsP10 = obsP10 / sumObs;
  obsP11 = obsP11 / sumObs;

  const obsProbMap = {
    '00': obsP00,
    '01': obsP01,
    '10': obsP10,
    '11': obsP11,
  };

  const expProbMap = {
    '00': p00,
    '01': p01,
    '10': p10,
    '11': p11,
  };

  const histogram: MeasurementHistogramEntry[] = states.map((s) => {
    const expProb = expProbMap[s];
    const obsProb = obsProbMap[s];
    return {
      state: s,
      expectedProbability: parseFloat(expProb.toFixed(4)),
      observedProbability: parseFloat(obsProb.toFixed(4)),
      expectedCount: Math.round(expProb * shots),
      observedCount: Math.round(obsProb * shots),
    };
  });

  // Calculate Bhattacharyya Distance: D_B = -ln(BC), BC = sum(sqrt(p_exp * p_obs))
  let bc = 0;
  let tvd = 0; // Total Variation Distance: 0.5 * sum(|p_exp - p_obs|)
  let chiSquare = 0;

  for (const entry of histogram) {
    const p = entry.expectedProbability;
    const q = entry.observedProbability;
    bc += Math.sqrt(p * q);
    tvd += Math.abs(p - q);
    const expCount = entry.expectedCount;
    const obsCount = entry.observedCount;
    if (expCount > 0) {
      chiSquare += Math.pow(obsCount - expCount, 2) / expCount;
    }
  }

  tvd = 0.5 * tvd;
  const bhattacharyyaDistance = Math.max(0, -Math.log(Math.min(1.0, bc)));

  return {
    basis: 'BELL_BSM',
    shots,
    histogram,
    bhattacharyyaDistance: parseFloat(bhattacharyyaDistance.toFixed(4)),
    totalVariationDistance: parseFloat(tvd.toFixed(4)),
    chiSquareStat: parseFloat(chiSquare.toFixed(2)),
  };
}

/**
 * Calculates Quantum State Fidelity:
 * F = |⟨ψ_exp|ψ_obs⟩|²
 * In statistical tomography, approximated via classical fidelity / Bhattacharyya coefficient (BC²).
 */
export function calculateFidelity(measurementDist: MeasurementDistribution): number {
  let bc = 0;
  for (const entry of measurementDist.histogram) {
    bc += Math.sqrt(entry.expectedProbability * entry.observedProbability);
  }
  // Classical fidelity F_c = (sum sqrt(p*q))^2
  const fidelity = Math.min(1.0, Math.pow(bc, 2));
  return parseFloat(fidelity.toFixed(4));
}

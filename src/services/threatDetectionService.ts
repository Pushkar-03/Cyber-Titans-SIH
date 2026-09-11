/**
 * Q-SHIELD Deterministic Threat Detection Engine
 * 
 * Implements authoritative mathematical threat scoring across:
 * 1. Distribution Deviation via Jensen-Shannon Divergence (JSD)
 * 2. Quantum State Fidelity Risk
 * 3. Replay Nonce & Lifecycle Risk
 * 4. Session Anomaly Risk (Message Digest Integrity & Telemetry)
 * 
 * Mathematical Formulation:
 * Threat Score = 0.30 * Fidelity Risk +
 *                0.30 * Distribution Risk +
 *                0.25 * Replay Risk +
 *                0.15 * Session Anomaly Risk
 * 
 * Normalized strictly to [0, 100].
 * 
 * Classification Boundaries:
 *   LOW:      0 – 30
 *   MEDIUM:  31 – 60
 *   HIGH:    61 – 80
 *   CRITICAL: 81 – 100
 * 
 * NOTE: This engine is strictly deterministic. External AI/LLM layers (such as Gemini)
 * provide advisory explainability only and are forbidden from calculating or overriding
 * these metrics.
 */

export type DistributionInput =
  | Record<string, number>
  | number[]
  | { histogram: Array<{ state: string; expectedProbability?: number; observedProbability?: number }> };

export interface SessionMetadataInput {
  timestamp?: string | number;
  sourceIp?: string;
  nodeLocation?: string;
  nodeId?: string;
  clientUserAgent?: string;
  latencyMs?: number;
  suspiciousFlags?: string[];
  authLevel?: 'STANDARD' | 'ELEVATED' | 'CRITICAL_INFRASTRUCTURE' | string;
  attackType?: string;
  customAnomalyScore?: number;
  isNonceConsumed?: boolean;
  [key: string]: any;
}

export type ReplayStatusInput =
  | boolean
  | { isReplay: boolean; detectedAt?: string; epochCount?: number; [key: string]: any };

export type MessageHashComparisonInput =
  | boolean
  | {
      expectedHash?: string;
      observedHash?: string;
      originalHash?: string;
      currentMessageHash?: string;
      isMatch?: boolean;
      [key: string]: any;
    };

export interface ThreatEvaluationInputs {
  expectedMeasurementDistribution: DistributionInput;
  observedMeasurementDistribution: DistributionInput;
  fidelity: number;
  sessionMetadata?: SessionMetadataInput;
  replayStatus: ReplayStatusInput;
  messageHashComparison: MessageHashComparisonInput;
}

export type ThreatClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SecurityDecision = 'PASS' | 'REVIEW_REQUIRED' | 'BLOCKED';

export interface ThreatDetectionResult {
  threatScore: number;
  classification: ThreatClassification;
  fidelity: number;
  distributionDeviation: number; // Jensen-Shannon Divergence [0.0, 1.0]
  replayRisk: number;            // [0, 100]
  sessionAnomaly: number;        // [0, 100]
  reasons: string[];
  recommendedAction: string;

  // Compatibility & Granular Details:
  fidelityRisk: number;          // [0, 100]
  distributionRisk: number;      // [0, 100]
  sessionAnomalyRisk: number;    // [0, 100]
  decision: SecurityDecision;
  isHashValid: boolean;
  hashMismatchDetected: boolean;
}

/**
 * Normalizes input distribution into a Map<string, number> where sum(values) == 1.0.
 */
export function normalizeDistribution(
  input: DistributionInput,
  preferredField: 'expectedProbability' | 'observedProbability' = 'observedProbability'
): Map<string, number> {
  const map = new Map<string, number>();

  if (!input) {
    return map;
  }

  // Handle histogram array from quantum measurement distribution
  if (typeof input === 'object' && 'histogram' in input && Array.isArray((input as any).histogram)) {
    const hist = (input as any).histogram;
    for (const item of hist) {
      if (item && item.state) {
        const val =
          preferredField === 'expectedProbability'
            ? (item.expectedProbability ?? item.observedProbability ?? 0)
            : (item.observedProbability ?? item.expectedProbability ?? 0);
        map.set(item.state, Math.max(0, Number(val) || 0));
      }
    }
  } else if (Array.isArray(input)) {
    // Array of numbers
    input.forEach((val, idx) => {
      map.set(String(idx), Math.max(0, Number(val) || 0));
    });
  } else if (typeof input === 'object') {
    // Key-value map (e.g. { '00': 0.25, '01': 0.25, ... } or counts { '0': 1024, '1': 1024 })
    for (const [k, val] of Object.entries(input)) {
      if (typeof val === 'number' || !isNaN(Number(val))) {
        map.set(k, Math.max(0, Number(val) || 0));
      }
    }
  }

  // Normalize so probabilities sum to 1.0
  let total = 0;
  for (const v of map.values()) {
    total += v;
  }

  if (total > 0) {
    for (const [k, v] of map.entries()) {
      map.set(k, v / total);
    }
  } else if (map.size > 0) {
    const uniform = 1.0 / map.size;
    for (const k of map.keys()) {
      map.set(k, uniform);
    }
  }

  return map;
}

/**
 * Calculates Jensen-Shannon Divergence (JSD) between two probability distributions.
 * JSD(P || Q) = 0.5 * D_KL(P || M) + 0.5 * D_KL(Q || M)
 * where M = 0.5 * (P + Q)
 * 
 * Using base-2 logarithm, JSD is strictly bounded in [0.0, 1.0].
 */
export function calculateJensenShannonDivergence(
  expectedDist: DistributionInput,
  observedDist: DistributionInput
): number {
  const pMap = normalizeDistribution(expectedDist, 'expectedProbability');
  const qMap = normalizeDistribution(observedDist, 'observedProbability');

  const allKeys = Array.from(new Set([...pMap.keys(), ...qMap.keys()]));
  if (allKeys.length === 0) return 0;

  let kl_p_m = 0;
  let kl_q_m = 0;

  for (const k of allKeys) {
    const p = pMap.get(k) ?? 0;
    const q = qMap.get(k) ?? 0;
    const m = 0.5 * (p + q);

    if (m > 0) {
      if (p > 0) {
        kl_p_m += p * Math.log2(p / m);
      }
      if (q > 0) {
        kl_q_m += q * Math.log2(q / m);
      }
    }
  }

  const jsd = 0.5 * (kl_p_m + kl_q_m);
  // Bounded strictly in [0.0, 1.0]
  return Math.min(1.0, Math.max(0.0, parseFloat(jsd.toFixed(6))));
}

/**
 * Evaluates Fidelity Risk [0, 100].
 * In quantum state tomography and teleportation, F = 1.0 indicates perfect state fidelity (0 risk).
 * The classical threshold without entanglement is F = 2/3 (~0.667).
 * States with F <= 0.65 indicate complete decoherence, intercept-resend, or basis corruption.
 */
export function calculateFidelityRisk(fidelity: number): number {
  const clampedFidelity = Math.min(1.0, Math.max(0.0, fidelity));
  // Scaled against the classical entanglement limit threshold (0.35 below 1.0)
  const risk = ((1.0 - clampedFidelity) / 0.35) * 100;
  return Math.min(100, Math.max(0, parseFloat(risk.toFixed(1))));
}

/**
 * Evaluates Distribution Deviation Risk [0, 100] from Jensen-Shannon Divergence.
 * Shot noise produces JSD < 0.015.
 * High noise produces JSD ~ 0.04 - 0.08.
 * Measurement manipulation or beam splitting produces JSD >= 0.18 - 0.25+.
 */
export function calculateDistributionRisk(jsd: number): number {
  const clampedJsd = Math.min(1.0, Math.max(0.0, jsd));
  // A JSD >= 0.25 corresponds to 100% distribution risk
  const risk = (clampedJsd / 0.25) * 100;
  return Math.min(100, Math.max(0, parseFloat(risk.toFixed(1))));
}

/**
 * Evaluates Replay Risk [0, 100].
 * Binary risk: 100 if nonce consumed or replay flagged; 0 otherwise.
 */
export function calculateReplayRisk(replayStatus: ReplayStatusInput): number {
  if (typeof replayStatus === 'boolean') {
    return replayStatus ? 100 : 0;
  }
  if (replayStatus && typeof replayStatus === 'object') {
    return Boolean(replayStatus.isReplay) ? 100 : 0;
  }
  return 0;
}

/**
 * Evaluates Message Hash Integrity.
 * Returns true if hashes match (or if boolean comparison is true).
 */
export function evaluateMessageHashMatch(comparison: MessageHashComparisonInput): boolean {
  if (typeof comparison === 'boolean') {
    return comparison;
  }
  if (comparison && typeof comparison === 'object') {
    if (typeof comparison.isMatch === 'boolean') {
      return comparison.isMatch;
    }
    const expected = comparison.expectedHash ?? comparison.originalHash;
    const observed = comparison.observedHash ?? comparison.currentMessageHash;
    if (expected && observed) {
      return expected.trim().toLowerCase() === observed.trim().toLowerCase();
    }
  }
  return true;
}

/**
 * Evaluates Session Anomaly Risk [0, 100].
 * Integrates message hash integrity, replay status, timing/latency, and metadata flags.
 */
export function calculateSessionAnomalyRisk(
  isHashValid: boolean,
  isReplay: boolean,
  metadata?: SessionMetadataInput
): number {
  let anomaly = 6.0; // Ambient quantum telemetry & network clock jitter baseline

  if (!isHashValid) {
    // Cryptographic hash mismatch is a severe cryptographic integrity violation
    anomaly = Math.max(anomaly, 95.0);
  }

  if (isReplay) {
    anomaly = Math.max(anomaly, 85.0);
  }

  if (metadata) {
    if (metadata.customAnomalyScore !== undefined && typeof metadata.customAnomalyScore === 'number') {
      anomaly = Math.max(anomaly, metadata.customAnomalyScore);
    }
    if (Array.isArray(metadata.suspiciousFlags) && metadata.suspiciousFlags.length > 0) {
      anomaly = Math.min(100, anomaly + metadata.suspiciousFlags.length * 20.0);
    }
    if (metadata.latencyMs && metadata.latencyMs > 4000) {
      anomaly = Math.min(100, anomaly + 15.0);
    }
    if (metadata.attackType === 'TAMPERING') {
      anomaly = Math.max(anomaly, 95.0);
    } else if (metadata.attackType === 'MANIPULATION') {
      anomaly = Math.max(anomaly, 75.0);
    } else if (metadata.attackType === 'QUANTUM_NOISE') {
      anomaly = Math.max(anomaly, 65.0);
    } else if (metadata.attackType === 'REPLAY' || metadata.attackType === 'DUPLICATION') {
      anomaly = Math.max(anomaly, 90.0);
    }
  }

  return Math.min(100, Math.max(0, parseFloat(anomaly.toFixed(1))));
}

/**
 * Classifies Threat Score into standard SOC tiers:
 *   LOW:      0 – 30
 *   MEDIUM:  31 – 60
 *   HIGH:    61 – 80
 *   CRITICAL: 81 – 100
 */
export function classifyThreatScore(score: number): ThreatClassification {
  if (score <= 30) return 'LOW';
  if (score <= 60) return 'MEDIUM';
  if (score <= 80) return 'HIGH';
  return 'CRITICAL';
}

/**
 * Authoritative Threat Detection Service
 */
export class ThreatDetectionService {
  /**
   * Primary deterministic threat evaluation method.
   */
  evaluateThreat(inputs: ThreatEvaluationInputs): ThreatDetectionResult {
    const {
      expectedMeasurementDistribution,
      observedMeasurementDistribution,
      fidelity,
      sessionMetadata,
      replayStatus,
      messageHashComparison,
    } = inputs;

    // 1. Distribution Deviation via Jensen-Shannon Divergence
    const distributionDeviation = calculateJensenShannonDivergence(
      expectedMeasurementDistribution,
      observedMeasurementDistribution
    );
    const distributionRisk = calculateDistributionRisk(distributionDeviation);

    // 2. Fidelity Risk
    const fidelityRisk = calculateFidelityRisk(fidelity);

    // 3. Replay Risk
    const replayRisk = calculateReplayRisk(replayStatus);
    const isReplay = replayRisk === 100;

    // 4. Message Hash Comparison & Session Anomaly Risk
    const isHashValid = evaluateMessageHashMatch(messageHashComparison);
    const sessionAnomaly = calculateSessionAnomalyRisk(isHashValid, isReplay, sessionMetadata);

    // 5. Overall Threat Score:
    // Threat Score = 0.30 * Fidelity Risk +
    //                0.30 * Distribution Risk +
    //                0.25 * Replay Risk +
    //                0.15 * Session Anomaly Risk
    const rawScore =
      0.30 * fidelityRisk +
      0.30 * distributionRisk +
      0.25 * replayRisk +
      0.15 * sessionAnomaly;

    // Normalize strictly to 0–100
    const threatScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Classification
    const classification = classifyThreatScore(threatScore);

    // Decision Logic
    let decision: SecurityDecision = 'PASS';
    if (classification === 'CRITICAL' || classification === 'HIGH' || !isHashValid || isReplay) {
      decision = 'BLOCKED';
    } else if (classification === 'MEDIUM') {
      decision = 'REVIEW_REQUIRED';
    } else {
      decision = 'PASS';
    }

    // Explanatory Reasons
    const reasons: string[] = [];
    if (!isHashValid) {
      reasons.push('Cryptographic hash mismatch: SHA-256 digest does not match verified payload.');
    }
    if (isReplay) {
      reasons.push('Replay attack detected: Session nonce previously consumed or expired.');
    }
    if (fidelityRisk > 35) {
      reasons.push(
        `Quantum state fidelity degraded to ${(fidelity * 100).toFixed(2)}% (Fidelity Risk: ${fidelityRisk.toFixed(1)}%). State overlap below coherence threshold.`
      );
    }
    if (distributionRisk > 25) {
      reasons.push(
        `Measurement distribution shifted (JSD = ${distributionDeviation.toFixed(4)}, Distribution Risk: ${distributionRisk.toFixed(1)}%).`
      );
    }
    if (sessionAnomaly > 30 && isHashValid && !isReplay) {
      reasons.push(`Elevated session anomaly risk (${sessionAnomaly.toFixed(1)}%) based on detector/network telemetry.`);
    }
    if (reasons.length === 0) {
      reasons.push('All quantum projective distributions, state fidelity, and cryptographic hashes within nominal tolerances.');
    }

    // Recommended Action
    let recommendedAction: string;
    switch (classification) {
      case 'CRITICAL':
        recommendedAction = 'TERMINATE_SESSION_AND_ALERT_SOC';
        break;
      case 'HIGH':
        recommendedAction = 'BLOCK_SIGNATURE_AND_QUARANTINE';
        break;
      case 'MEDIUM':
        recommendedAction = 'FLAG_FOR_AUDIT_AND_RETRY_QKD';
        break;
      case 'LOW':
      default:
        recommendedAction = 'ACCEPT_SIGNATURE';
        break;
    }

    return {
      threatScore,
      classification,
      fidelity: parseFloat(fidelity.toFixed(4)),
      distributionDeviation,
      replayRisk,
      sessionAnomaly,
      reasons,
      recommendedAction,

      // Complementary metrics for compatibility
      fidelityRisk,
      distributionRisk,
      sessionAnomalyRisk: sessionAnomaly,
      decision,
      isHashValid,
      hashMismatchDetected: !isHashValid,
    };
  }

  /**
   * Helper to compute Jensen-Shannon Divergence directly.
   */
  calculateJSD(expected: DistributionInput, observed: DistributionInput): number {
    return calculateJensenShannonDivergence(expected, observed);
  }
}

export const threatDetectionService = new ThreatDetectionService();

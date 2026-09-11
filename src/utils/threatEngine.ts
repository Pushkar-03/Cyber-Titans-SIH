/**
 * Deterministic Threat Scoring Engine
 * 
 * Formula:
 * Threat Score = (30% * Fidelity Risk) + 
 *                (30% * Distribution Deviation Risk) + 
 *                (25% * Replay Risk) + 
 *                (15% * Session Anomaly Risk)
 * 
 * Classification:
 *   0  - 30  = LOW
 *   31 - 60  = MEDIUM
 *   61 - 80  = HIGH
 *   81 - 100 = CRITICAL
 */

import {
  MeasurementDistribution,
  ThreatMetrics,
  AttackType,
} from '../types/quantum';
import { calculateFidelity } from './quantumEngine';
import { threatDetectionService } from '../services/threatDetectionService';

export interface ThreatEvaluationInput {
  measurementDist: MeasurementDistribution;
  originalHash: string;
  currentMessageHash: string;
  isSessionConsumed: boolean;
  attackType?: AttackType;
  customAnomalyScore?: number;
}

export function evaluateThreatMetrics(input: ThreatEvaluationInput): ThreatMetrics {
  const {
    measurementDist,
    originalHash,
    currentMessageHash,
    isSessionConsumed,
    attackType = 'NONE',
    customAnomalyScore,
  } = input;

  const fidelity = calculateFidelity(measurementDist);

  // Map histogram to expected and observed distributions
  const expectedDist: Record<string, number> = {};
  const observedDist: Record<string, number> = {};
  for (const item of measurementDist.histogram) {
    expectedDist[item.state] = item.expectedProbability;
    observedDist[item.state] = item.observedProbability;
  }

  const result = threatDetectionService.evaluateThreat({
    expectedMeasurementDistribution: expectedDist,
    observedMeasurementDistribution: observedDist,
    fidelity,
    sessionMetadata: {
      attackType,
      customAnomalyScore,
      isNonceConsumed: isSessionConsumed,
    },
    replayStatus: isSessionConsumed || attackType === 'REPLAY' || attackType === 'DUPLICATION',
    messageHashComparison: {
      expectedHash: originalHash,
      observedHash: currentMessageHash,
      isMatch: originalHash.toLowerCase() === currentMessageHash.toLowerCase(),
    },
  });

  return {
    fidelityScore: result.fidelity,
    fidelityRisk: result.fidelityRisk,
    distributionDeviation: result.distributionDeviation,
    distributionDeviationRisk: result.distributionRisk,
    replayRisk: result.replayRisk,
    sessionAnomalyScore: result.sessionAnomaly,
    overallThreatScore: result.threatScore,
    classification: result.classification,
    decision: result.decision,
    isHashValid: result.isHashValid,
    hashMismatchDetected: result.hashMismatchDetected,
  };
}


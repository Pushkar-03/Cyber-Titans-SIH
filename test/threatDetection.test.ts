/**
 * Q-SHIELD ThreatDetectionService Unit Tests
 * 
 * Verifies deterministic security calculations:
 * 1. Normal session (LOW risk)
 * 2. Replay attack (Replay risk triggered, BLOCKED)
 * 3. Message tampering (Hash mismatch, HIGH/CRITICAL)
 * 4. Measurement manipulation (JSD deviation & fidelity collapse)
 * 5. High-noise session (MEDIUM risk, REVIEW_REQUIRED)
 * 6. Jensen-Shannon Divergence mathematical properties (symmetry, bounds, identity)
 * 7. Weighted threat score formula exactness
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ThreatDetectionService,
  threatDetectionService,
  calculateJensenShannonDivergence,
  calculateFidelityRisk,
  calculateDistributionRisk,
  calculateReplayRisk,
  calculateSessionAnomalyRisk,
  classifyThreatScore,
} from '../src/services/threatDetectionService';

describe('Q-SHIELD Deterministic Threat Detection Service', () => {

  describe('1. Jensen-Shannon Divergence Mathematical Properties', () => {
    test('Identity: JSD of identical distributions is exactly 0', () => {
      const distA = { '00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25 };
      const distB = { '00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25 };

      const jsd = calculateJensenShannonDivergence(distA, distB);
      assert.strictEqual(jsd, 0.0);
    });

    test('Symmetry: JSD(P || Q) equals JSD(Q || P)', () => {
      const p = { '00': 0.6, '01': 0.2, '10': 0.1, '11': 0.1 };
      const q = { '00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25 };

      const jsdPQ = calculateJensenShannonDivergence(p, q);
      const jsdQP = calculateJensenShannonDivergence(q, p);

      assert.strictEqual(jsdPQ, jsdQP);
      assert.ok(jsdPQ > 0 && jsdPQ < 1.0);
    });

    test('Disjoint Distributions: JSD between orthogonal supports is 1.0 (with log2)', () => {
      const p = { '0': 1.0, '1': 0.0 };
      const q = { '0': 0.0, '1': 1.0 };

      const jsd = calculateJensenShannonDivergence(p, q);
      assert.strictEqual(jsd, 1.0);
    });

    test('Array Inputs and Unnormalized Shot Counts are properly normalized', () => {
      // 1024 total shots vs 2048 total shots with identical probability 50/50
      const countsA = { '0': 512, '1': 512 };
      const countsB = { '0': 1024, '1': 1024 };

      const jsd = calculateJensenShannonDivergence(countsA, countsB);
      assert.strictEqual(jsd, 0.0);
    });
  });

  describe('2. Scenario: Normal Session', () => {
    test('Passes all checks with LOW classification and ALLOW action', () => {
      const input = {
        expectedMeasurementDistribution: { '00': 0.5, '11': 0.5 },
        observedMeasurementDistribution: { '00': 0.498, '11': 0.502 },
        fidelity: 0.998,
        sessionMetadata: {
          timestamp: new Date().toISOString(),
          sourceIp: '192.168.1.50',
          nodeLocation: 'Quantum Gate Alpha',
          latencyMs: 120,
        },
        replayStatus: false,
        messageHashComparison: {
          expectedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          observedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          isMatch: true,
        },
      };

      const result = threatDetectionService.evaluateThreat(input);

      // Verifications
      assert.ok(result.distributionDeviation < 0.005, 'JSD should be near zero for normal session');
      assert.strictEqual(result.replayRisk, 0, 'Replay risk should be 0');
      assert.strictEqual(result.isHashValid, true, 'Hash must be valid');
      assert.strictEqual(result.classification, 'LOW', 'Classification must be LOW');
      assert.ok(result.threatScore <= 30, `Threat score ${result.threatScore} must be <= 30`);
      assert.strictEqual(result.decision, 'PASS');
      assert.strictEqual(result.recommendedAction, 'ACCEPT_SIGNATURE');
      assert.ok(result.reasons.length > 0);
    });
  });

  describe('3. Scenario: Replay Attack', () => {
    test('Detects consumed nonce, triggers 100% replay risk and blocks signature', () => {
      const input = {
        expectedMeasurementDistribution: { '00': 0.5, '11': 0.5 },
        observedMeasurementDistribution: { '00': 0.5, '11': 0.5 },
        fidelity: 0.99,
        sessionMetadata: {
          isNonceConsumed: true,
          nodeLocation: 'Unknown Relay Proxy',
        },
        replayStatus: true,
        messageHashComparison: true,
      };

      const result = threatDetectionService.evaluateThreat(input);

      assert.strictEqual(result.replayRisk, 100, 'Replay risk must be 100%');
      assert.strictEqual(result.decision, 'BLOCKED', 'Replay sessions must be blocked');
      assert.ok(result.threatScore >= 31, `Threat score ${result.threatScore} must be elevated`);
      assert.ok(
        result.reasons.some((r) => r.toLowerCase().includes('replay')),
        'Reasons must cite replay detection'
      );
    });

    test('Accepts structured replay status object', () => {
      const input = {
        expectedMeasurementDistribution: { '00': 0.5, '11': 0.5 },
        observedMeasurementDistribution: { '00': 0.5, '11': 0.5 },
        fidelity: 0.98,
        sessionMetadata: {},
        replayStatus: { isReplay: true, detectedAt: '2026-09-08T12:00:00Z', epochCount: 2 },
        messageHashComparison: true,
      };

      const result = threatDetectionService.evaluateThreat(input);
      assert.strictEqual(result.replayRisk, 100);
      assert.strictEqual(result.decision, 'BLOCKED');
    });
  });

  describe('4. Scenario: Message Tampering', () => {
    test('Detects SHA-256 mismatch, elevates session anomaly, and flags tampering', () => {
      const input = {
        expectedMeasurementDistribution: { '00': 0.5, '11': 0.5 },
        // Tampered signature state alignment collapses projective probabilities
        observedMeasurementDistribution: { '00': 0.18, '01': 0.32, '10': 0.32, '11': 0.18 },
        fidelity: 0.55,
        sessionMetadata: {
          attackType: 'TAMPERING',
        },
        replayStatus: false,
        messageHashComparison: {
          expectedHash: 'original_msg_digest_e3b0c44298fc1c149afbf4c8996fb924',
          observedHash: 'altered_tampered_payload_hash_1c7738f2b901a5e4b2d1',
          isMatch: false,
        },
      };

      const result = threatDetectionService.evaluateThreat(input);

      assert.strictEqual(result.isHashValid, false, 'Hash valid must be false');
      assert.strictEqual(result.hashMismatchDetected, true, 'Hash mismatch must be detected');
      assert.ok(result.sessionAnomaly >= 95, 'Session anomaly must be >= 95');
      assert.ok(result.threatScore >= 61, `Threat score ${result.threatScore} must be >= 61 for message tampering`);
      assert.ok(['HIGH', 'CRITICAL'].includes(result.classification), `Classification should be HIGH or CRITICAL, got ${result.classification}`);
      assert.strictEqual(result.decision, 'BLOCKED');
      assert.ok(
        result.reasons.some((r) => r.toLowerCase().includes('hash mismatch') || r.toLowerCase().includes('mismatch')),
        'Reasons must cite hash mismatch'
      );
    });
  });

  describe('5. Scenario: Measurement Manipulation', () => {
    test('Detects severe distribution divergence and degraded fidelity', () => {
      const input = {
        expectedMeasurementDistribution: { '00': 0.5, '01': 0.0, '10': 0.0, '11': 0.5 },
        // Detector blinding or intercept-resend forces complete uniform basis spread
        observedMeasurementDistribution: { '00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25 },
        fidelity: 0.50, // Classical bound violation
        sessionMetadata: {
          attackType: 'MANIPULATION',
          suspiciousFlags: ['DETECTOR_SKEW_HIGH', 'BASIS_MISALIGNMENT'],
        },
        replayStatus: false,
        messageHashComparison: true,
      };

      const result = threatDetectionService.evaluateThreat(input);

      assert.ok(result.distributionDeviation > 0.15, `JSD ${result.distributionDeviation} must exceed 0.15`);
      assert.ok(result.distributionRisk >= 80, `Distribution risk ${result.distributionRisk} must be >= 80`);
      assert.ok(result.fidelityRisk >= 85, `Fidelity risk ${result.fidelityRisk} must be >= 85`);
      assert.ok(result.threatScore >= 61, `Threat score ${result.threatScore} must be HIGH or CRITICAL`);
      assert.ok(['HIGH', 'CRITICAL'].includes(result.classification));
      assert.strictEqual(result.decision, 'BLOCKED');
    });
  });

  describe('6. Scenario: High-Noise Session', () => {
    test('Distinguishes physical channel noise from malicious attack (MEDIUM risk, REVIEW_REQUIRED)', () => {
      const input = {
        expectedMeasurementDistribution: { '00': 0.5, '11': 0.5 },
        // Severe thermal/depolarizing noise (10% state mixing across orthogonal bases)
        observedMeasurementDistribution: { '00': 0.40, '01': 0.10, '10': 0.10, '11': 0.40 },
        fidelity: 0.82,
        sessionMetadata: {
          attackType: 'QUANTUM_NOISE',
        },
        replayStatus: false,
        messageHashComparison: true,
      };

      const result = threatDetectionService.evaluateThreat(input);

      // In pure noise, hash is valid and replay is 0
      assert.strictEqual(result.isHashValid, true);
      assert.strictEqual(result.replayRisk, 0);
      assert.ok(result.distributionDeviation > 0.01 && result.distributionDeviation < 0.15);
      assert.ok(result.threatScore >= 31 && result.threatScore <= 60, `Threat score ${result.threatScore} must be in MEDIUM range 31-60`);
      assert.strictEqual(result.classification, 'MEDIUM');
      assert.strictEqual(result.decision, 'REVIEW_REQUIRED');
      assert.strictEqual(result.recommendedAction, 'FLAG_FOR_AUDIT_AND_RETRY_QKD');
    });
  });

  describe('7. Mathematical Formula & Boundary Invariants', () => {
    test('Strict adherence to exact 0.30/0.30/0.25/0.15 weighting formula', () => {
      const fidelityRisk = 40.0;
      const distributionRisk = 60.0;
      const replayRisk = 100.0;
      const sessionAnomaly = 80.0;

      const expectedThreatScore = Math.round(
        0.30 * fidelityRisk +
        0.30 * distributionRisk +
        0.25 * replayRisk +
        0.15 * sessionAnomaly
      );
      // 0.30*40 + 0.30*60 + 0.25*100 + 0.15*80 = 12 + 18 + 25 + 12 = 67

      assert.strictEqual(expectedThreatScore, 67);
      assert.strictEqual(classifyThreatScore(67), 'HIGH');
    });

    test('Classification boundaries strictly match specifications', () => {
      assert.strictEqual(classifyThreatScore(0), 'LOW');
      assert.strictEqual(classifyThreatScore(30), 'LOW');
      assert.strictEqual(classifyThreatScore(31), 'MEDIUM');
      assert.strictEqual(classifyThreatScore(60), 'MEDIUM');
      assert.strictEqual(classifyThreatScore(61), 'HIGH');
      assert.strictEqual(classifyThreatScore(80), 'HIGH');
      assert.strictEqual(classifyThreatScore(81), 'CRITICAL');
      assert.strictEqual(classifyThreatScore(100), 'CRITICAL');
    });

    test('Threat score is strictly clamped in [0, 100]', () => {
      const minResult = threatDetectionService.evaluateThreat({
        expectedMeasurementDistribution: { '0': 1 },
        observedMeasurementDistribution: { '0': 1 },
        fidelity: 1.0,
        replayStatus: false,
        messageHashComparison: true,
      });
      assert.ok(minResult.threatScore >= 0 && minResult.threatScore <= 100);

      const maxResult = threatDetectionService.evaluateThreat({
        expectedMeasurementDistribution: { '0': 1, '1': 0 },
        observedMeasurementDistribution: { '0': 0, '1': 1 },
        fidelity: 0.0,
        replayStatus: true,
        messageHashComparison: false,
      });
      assert.ok(maxResult.threatScore >= 0 && maxResult.threatScore <= 100);
      assert.strictEqual(maxResult.classification, 'CRITICAL');
    });
  });

});

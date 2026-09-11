/**
 * Firestore-Ready Session Data Repository
 * 
 * Implements an adaptable repository pattern with local persistence,
 * in-memory cache, and pluggable Firestore adapter interface.
 */

import { SignatureSession, SOCEvent } from '../types/quantum';
import { generateQuantumState, generateTeleportationStages, computePauliCorrection, simulateMeasurementDistribution } from '../utils/quantumEngine';
import { evaluateThreatMetrics } from '../utils/threatEngine';

export interface ISessionRepository {
  getAll(): Promise<SignatureSession[]>;
  getById(id: string): Promise<SignatureSession | null>;
  save(session: SignatureSession): Promise<SignatureSession>;
  consumeSession(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

// Initial demo seed dataset clearly marked as benchmark/seed records
const SEED_SESSIONS: SignatureSession[] = [
  {
    id: 'QS-2026-9A1F-7C3D01',
    transactionId: 'TX-SIH-92041',
    timestamp: '2026-09-07T11:42:18Z',
    message: 'INTERBANK_SWIFT_TRANSFER: $2,500,000 USD -> FED_RESERVE_NODE_04',
    originalHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    verifiedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    signatureToken: 'QRES-DILITHIUM:E3B0C44298FC1C14::9AFBF4C8996FB924::VERIFIED',
    quantumState: generateQuantumState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
    teleportationStages: generateTeleportationStages(generateQuantumState('e3b0c442')),
    pauliCorrection: computePauliCorrection('e3b0c44298fc1c14'),
    measurementDist: simulateMeasurementDistribution('e3b0c442', 'NONE'),
    threatMetrics: {
      fidelityScore: 0.9842,
      fidelityRisk: 1.6,
      distributionDeviation: 0.024,
      distributionDeviationRisk: 6.8,
      replayRisk: 0,
      sessionAnomalyScore: 9.2,
      overallThreatScore: 6,
      classification: 'LOW',
      decision: 'PASS',
      isHashValid: true,
      hashMismatchDetected: false,
    },
    activeAttack: 'NONE',
    status: 'VERIFIED',
    isConsumed: false,
    sourceIp: '192.168.1.104',
    nodeLocation: 'Quantum Gate Alpha (Delhi Hub)',
    authLevel: 'CRITICAL_INFRASTRUCTURE',
  },
  {
    id: 'QS-2026-4B82-E019A2',
    transactionId: 'TX-SIH-88192',
    timestamp: '2026-09-07T11:25:04Z',
    message: 'SMART_GRID_TELEMETRY: SUBSTATION_09_BREAKER_TRIP_AUTHORIZATION',
    originalHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    verifiedHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    signatureToken: 'QRES-DILITHIUM:A591A6D40BF42040::4A011733CFB7B190::REPLAY_FLAGGED',
    quantumState: generateQuantumState('a591a6d40bf42040'),
    teleportationStages: generateTeleportationStages(generateQuantumState('a591a6d4')),
    pauliCorrection: computePauliCorrection('a591a6d40bf42040'),
    measurementDist: simulateMeasurementDistribution('a591a6d4', 'REPLAY'),
    threatMetrics: {
      fidelityScore: 0.9780,
      fidelityRisk: 2.2,
      distributionDeviation: 0.021,
      distributionDeviationRisk: 6.0,
      replayRisk: 100,
      sessionAnomalyScore: 88.0,
      overallThreatScore: 91,
      classification: 'CRITICAL',
      decision: 'BLOCKED',
      isHashValid: true,
      hashMismatchDetected: false,
    },
    activeAttack: 'REPLAY',
    status: 'REJECTED',
    isConsumed: true,
    sourceIp: '203.0.113.88',
    nodeLocation: 'External Gateway (Adversary Proxied)',
    authLevel: 'CRITICAL_INFRASTRUCTURE',
  },
  {
    id: 'QS-2026-1C77-38F2B9',
    transactionId: 'TX-SIH-66520',
    timestamp: '2026-09-07T10:58:30Z',
    message: 'DRONE_FLEET_COMMAND: WAYPOINT_OVERRIDE // SECTOR_BRAVO',
    originalHash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    verifiedHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', // Tampered!
    signatureToken: 'QRES-DILITHIUM:2C26B46B68FFC68F::F99B453C1D304134::TAMPERED',
    quantumState: generateQuantumState('2c26b46b68ffc68f'),
    teleportationStages: generateTeleportationStages(generateQuantumState('2c26b46b')),
    pauliCorrection: computePauliCorrection('2c26b46b'),
    measurementDist: simulateMeasurementDistribution('2c26b46b', 'TAMPERING'),
    threatMetrics: {
      fidelityScore: 0.8120,
      fidelityRisk: 18.8,
      distributionDeviation: 0.225,
      distributionDeviationRisk: 64.3,
      replayRisk: 0,
      sessionAnomalyScore: 95.0,
      overallThreatScore: 89,
      classification: 'CRITICAL',
      decision: 'BLOCKED',
      isHashValid: false,
      hashMismatchDetected: true,
    },
    activeAttack: 'TAMPERING',
    status: 'QUARANTINED',
    isConsumed: false,
    sourceIp: '198.51.100.42',
    nodeLocation: 'Border Defense Tactical Node',
    authLevel: 'ELEVATED',
  },
  {
    id: 'QS-2026-7D39-01C54E',
    transactionId: 'TX-SIH-44109',
    timestamp: '2026-09-07T10:14:12Z',
    message: 'HEALTHCARE_RECORDS_CONSORTIUM: PATIENT_GENOMIC_VAULT_DECRYPT',
    originalHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    verifiedHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    signatureToken: 'QRES-DILITHIUM:5E884898DA280471::51D0E56F8DC62927::VERIFIED',
    quantumState: generateQuantumState('5e884898da280471'),
    teleportationStages: generateTeleportationStages(generateQuantumState('5e884898')),
    pauliCorrection: computePauliCorrection('5e884898'),
    measurementDist: simulateMeasurementDistribution('5e884898', 'QUANTUM_NOISE'),
    threatMetrics: {
      fidelityScore: 0.8840,
      fidelityRisk: 11.6,
      distributionDeviation: 0.168,
      distributionDeviationRisk: 48.0,
      replayRisk: 0,
      sessionAnomalyScore: 42.0,
      overallThreatScore: 48,
      classification: 'MEDIUM',
      decision: 'REVIEW_REQUIRED',
      isHashValid: true,
      hashMismatchDetected: false,
    },
    activeAttack: 'QUANTUM_NOISE',
    status: 'FLAGGED',
    isConsumed: false,
    sourceIp: '172.16.0.55',
    nodeLocation: 'Fiber Repeater Node 03 (Atmospheric Noise)',
    authLevel: 'STANDARD',
  },
  {
    id: 'QS-2026-3E44-998BA0',
    transactionId: 'TX-SIH-12903',
    timestamp: '2026-09-07T09:48:22Z',
    message: 'ORBITAL_SATELLITE_UPLINK: ATTITUDE_CONTROL_VECTOR_PACKET',
    originalHash: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
    verifiedHash: 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9',
    signatureToken: 'QRES-DILITHIUM:FCDE2B2EDBA56BF4::08601FB721FE9B5C::INTERCEPT_SPIKE',
    quantumState: generateQuantumState('fcde2b2edba56bf4'),
    teleportationStages: generateTeleportationStages(generateQuantumState('fcde2b2e')),
    pauliCorrection: computePauliCorrection('fcde2b2e'),
    measurementDist: simulateMeasurementDistribution('fcde2b2e', 'MANIPULATION'),
    threatMetrics: {
      fidelityScore: 0.6850,
      fidelityRisk: 31.5,
      distributionDeviation: 0.320,
      distributionDeviationRisk: 91.4,
      replayRisk: 0,
      sessionAnomalyScore: 75.0,
      overallThreatScore: 78,
      classification: 'HIGH',
      decision: 'BLOCKED',
      isHashValid: true,
      hashMismatchDetected: false,
    },
    activeAttack: 'MANIPULATION',
    status: 'REJECTED',
    isConsumed: false,
    sourceIp: '198.51.100.190',
    nodeLocation: 'Deep Space Receiver (Signal Interference)',
    authLevel: 'ELEVATED',
  }
];

const REPO_STORAGE_KEY = 'q_shield_sessions_v1';

class HybridSessionRepository implements ISessionRepository {
  private sessions: Map<string, SignatureSession> = new Map();
  private consumedNonces: Set<string> = new Set();
  private submissionCounts: Map<string, number> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // Load seeds
    for (const s of SEED_SESSIONS) {
      this.sessions.set(s.id, s);
      if (s.isConsumed) {
        this.consumedNonces.add(s.id);
      }
    }

    // Try loading from localStorage in browser context
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(REPO_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as SignatureSession[];
          for (const s of parsed) {
            this.sessions.set(s.id, s);
            if (s.isConsumed) {
              this.consumedNonces.add(s.id);
            }
          }
        }
      } catch (err) {
        console.warn('Could not read session storage', err);
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const list = Array.from(this.sessions.values());
        window.localStorage.setItem(REPO_STORAGE_KEY, JSON.stringify(list));
      } catch (err) {
        console.warn('Could not persist sessions', err);
      }
    }
  }

  async getAll(): Promise<SignatureSession[]> {
    return this.getAllSessions();
  }

  getAllSessions(): SignatureSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getAllEvents(): SOCEvent[] {
    return INITIAL_SOC_EVENTS;
  }

  saveSession(session: SignatureSession): SignatureSession {
    this.sessions.set(session.id, session);
    if (session.isConsumed) {
      this.consumedNonces.add(session.id);
    }
    this.persist();
    return session;
  }

  updateSession(session: SignatureSession): SignatureSession {
    return this.saveSession(session);
  }

  async getById(id: string): Promise<SignatureSession | null> {
    return this.sessions.get(id) || null;
  }

  async save(session: SignatureSession): Promise<SignatureSession> {
    return this.saveSession(session);
  }

  async consumeSession(id: string): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    // Check if already consumed (Replay detection)
    if (this.consumedNonces.has(id)) {
      return false; // Replay triggered!
    }

    this.consumedNonces.add(id);
    session.isConsumed = true;
    this.sessions.set(id, session);
    this.persist();
    return true;
  }

  async isNonceConsumed(id: string): Promise<boolean> {
    return this.consumedNonces.has(id);
  }

  markNonceConsumed(id: string): void {
    this.consumedNonces.add(id);
    const session = this.sessions.get(id);
    if (session) {
      session.isConsumed = true;
      this.sessions.set(id, session);
      this.persist();
    }
  }

  clearConsumedNonce(id: string): void {
    this.consumedNonces.delete(id);
    const session = this.sessions.get(id);
    if (session) {
      session.isConsumed = false;
      this.sessions.set(id, session);
      this.persist();
    }
  }

  recordSubmission(id: string): { submissionCount: number; isDuplicate: boolean; isConsumed: boolean } {
    const current = this.submissionCounts.get(id) || 0;
    const count = current + 1;
    this.submissionCounts.set(id, count);

    const isConsumed = this.consumedNonces.has(id);
    const isDuplicate = count > 1 || isConsumed;

    this.consumedNonces.add(id);
    const session = this.sessions.get(id);
    if (session) {
      session.isConsumed = true;
      this.sessions.set(id, session);
      this.persist();
    }

    return { submissionCount: count, isDuplicate, isConsumed };
  }

  getSubmissionCount(id: string): number {
    return this.submissionCounts.get(id) || 0;
  }

  resetSubmissions(id?: string) {
    if (id) {
      this.submissionCounts.delete(id);
      this.consumedNonces.delete(id);
      const session = this.sessions.get(id);
      if (session) {
        session.isConsumed = false;
        this.sessions.set(id, session);
        this.persist();
      }
    } else {
      this.submissionCounts.clear();
      this.consumedNonces.clear();
    }
  }

  async delete(id: string): Promise<boolean> {
    const res = this.sessions.delete(id);
    this.consumedNonces.delete(id);
    this.persist();
    return res;
  }

  // Reset to seeds if user requests clean slate
  resetToSeeds() {
    this.sessions.clear();
    this.consumedNonces.clear();
    for (const s of SEED_SESSIONS) {
      this.sessions.set(s.id, s);
      if (s.isConsumed) this.consumedNonces.add(s.id);
    }
    this.persist();
  }
}

export const sessionStore = new HybridSessionRepository();

// Telemetry & Event stream for SOC Dashboard
export const INITIAL_SOC_EVENTS: SOCEvent[] = [
  {
    id: 'EVT-901',
    timestamp: 'Just now',
    sessionId: 'QS-2026-9A1F-7C3D01',
    eventType: 'SIGNATURE_VERIFIED',
    severity: 'INFO',
    description: 'Quantum state fidelity 98.4% verified against reference density matrix.',
    sourceNode: 'Delhi-Alpha',
  },
  {
    id: 'EVT-900',
    timestamp: '18m ago',
    sessionId: 'QS-2026-4B82-E019A2',
    eventType: 'REPLAY_PREVENTED',
    severity: 'CRITICAL',
    description: 'Replay attempt blocked: Nonce already consumed in prior epoch.',
    sourceNode: 'Adversary-Proxy',
  },
  {
    id: 'EVT-899',
    timestamp: '44m ago',
    sessionId: 'QS-2026-1C77-38F2B9',
    eventType: 'TAMPER_DETECTED',
    severity: 'CRITICAL',
    description: 'Cryptographic hash mismatch: Message payload altered post-signing.',
    sourceNode: 'Border-Def-Node',
  },
  {
    id: 'EVT-898',
    timestamp: '1h 12m ago',
    sessionId: 'QS-2026-7D39-01C54E',
    eventType: 'ANOMALY_FLAGGED',
    severity: 'WARNING',
    description: 'Total variation distance 0.168 exceeded standard calibration threshold.',
    sourceNode: 'Repeater-03',
  },
];

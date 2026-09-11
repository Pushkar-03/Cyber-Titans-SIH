export type AttackType = 
  | 'NONE'
  | 'REPLAY' 
  | 'TAMPERING' 
  | 'MANIPULATION' 
  | 'QUANTUM_NOISE' 
  | 'DUPLICATION';

export type ThreatClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SecurityDecision = 'PASS' | 'REVIEW_REQUIRED' | 'BLOCKED';

export type SessionStatus = 'VERIFIED' | 'FLAGGED' | 'REJECTED' | 'QUARANTINED';

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface QuantumStateVector {
  alpha: ComplexNumber;
  beta: ComplexNumber;
  theta: number; // degrees 0-180
  phi: number;   // degrees 0-360
  label: string;
  blochCoordinates: {
    x: number;
    y: number;
    z: number;
  };
}

export interface TeleportationStage {
  step: number;
  name: string;
  subtext: string;
  stateRepresentation: string;
  gateDetails: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

export interface PauliCorrection {
  m1: 0 | 1;
  m2: 0 | 1;
  appliedGate: 'I' | 'X' | 'Z' | 'Z·X';
  formula: string;
}

export interface MeasurementHistogramEntry {
  state: '00' | '01' | '10' | '11';
  expectedProbability: number;
  observedProbability: number;
  expectedCount: number;
  observedCount: number;
}

export interface MeasurementDistribution {
  basis: 'COMPUTATIONAL_Z' | 'HADAMARD_X' | 'BELL_BSM';
  shots: number;
  histogram: MeasurementHistogramEntry[];
  bhattacharyyaDistance: number;
  totalVariationDistance: number;
  chiSquareStat: number;
}

export interface ThreatMetrics {
  fidelityScore: number;            // 0.00 - 1.00
  fidelityRisk: number;             // 0 - 100
  distributionDeviation: number;    // 0.00 - 1.00
  distributionDeviationRisk: number;// 0 - 100
  replayRisk: number;               // 0 - 100 (0 or 100)
  sessionAnomalyScore: number;      // 0 - 100
  overallThreatScore: number;       // 0 - 100 (30% + 30% + 25% + 15%)
  classification: ThreatClassification;
  decision: SecurityDecision;
  isHashValid: boolean;
  hashMismatchDetected: boolean;
}

export interface SignatureSession {
  id: string;
  transactionId: string;
  timestamp: string;
  message: string;
  originalHash: string;
  verifiedHash: string;
  signatureToken: string;
  quantumState: QuantumStateVector;
  teleportationStages: TeleportationStage[];
  pauliCorrection: PauliCorrection;
  measurementDist: MeasurementDistribution;
  threatMetrics: ThreatMetrics;
  activeAttack: AttackType;
  status: SessionStatus;
  isConsumed: boolean;
  sourceIp: string;
  nodeLocation: string;
  authLevel: 'STANDARD' | 'ELEVATED' | 'CRITICAL_INFRASTRUCTURE';
}

export interface StructuredThreatAnalysisData {
  sessionId: string;
  threatScore: number;
  classification: ThreatClassification;
  fidelity: number;
  distributionDeviation: number;
  replayRisk: number;
  sessionAnomaly: number;
  attackType: string;
  hashMismatch: boolean;
  replayDetected: boolean;
}

export interface SocExplanation {
  threatSummary: string;
  mainEvidence: string[];
  likelyAttackPattern: string;
  recommendedResponse: string[];
}

export interface AiSecurityExplanationResponse {
  explanation: SocExplanation;
  explanationMarkdown?: string;
  inputData: StructuredThreatAnalysisData;
  authoritativeDecision: {
    sessionId: string;
    threatScore: number;
    classification: ThreatClassification;
    engine: string;
    isAuthoritative: boolean;
  };
  model: string;
  provider: string;
}

export interface AiAnalystReport {
  sessionId: string;
  generatedAt: string;
  summary: string;
  threatLevel: ThreatClassification;
  decision: SecurityDecision;
  contributingMetrics: {
    metric: string;
    value: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    analysis: string;
  }[];
  likelyAttackVector: string;
  confidenceScore: number;
  recommendedMitigations: string[];
  forensicTrace: string;
  disclaimer: string;
}

export interface SOCEvent {
  id: string;
  timestamp: string;
  sessionId: string;
  eventType: 'SIGNATURE_VERIFIED' | 'TAMPER_DETECTED' | 'REPLAY_PREVENTED' | 'ANOMALY_FLAGGED' | 'SYSTEM_BASELINE';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  description: string;
  sourceNode: string;
}

export type PauliEigenstateType = '|0>' | '|1>' | '|+>' | '|->' | 'CUSTOM';
export type BellStateType = '|Φ⁺>' | '|Φ⁻>' | '|Ψ⁺>' | '|Ψ⁻>';

export interface QuantumInputState {
  label: string;
  amplitudes: {
    alpha: ComplexNumber;
    beta: ComplexNumber;
  };
  theta: number;
  phi: number;
  blochCoordinates: {
    x: number;
    y: number;
    z: number;
  };
  theoreticalProbabilities: {
    '0': number;
    '1': number;
  };
}

export interface AliceMeasurementOutcome {
  m1: 0 | 1;
  m2: 0 | 1;
  syndromeBits: '00' | '01' | '10' | '11';
  bellBasisCollapsed: string;
  probability: number;
}

export interface PauliCorrectionResult {
  m1: 0 | 1;
  m2: 0 | 1;
  appliedGate: 'I' | 'X' | 'Z' | 'Z·X';
  formula: string;
  gateMatrixDescription: string;
}

export interface TeleportationResult {
  inputState: QuantumInputState;
  bellState: string;
  aliceMeasurement: AliceMeasurementOutcome;
  correction: PauliCorrectionResult;
  measurementCounts: {
    '0': number;
    '1': number;
  };
  measurementProbabilities: {
    '0': number;
    '1': number;
  };
  fidelity: number;
  success: boolean;
  circuitStages?: {
    step: number;
    name: string;
    description: string;
    stateVectorStr: string;
  }[];
  bobReconstructedState?: {
    label: string;
    amplitudes: {
      alpha: ComplexNumber;
      beta: ComplexNumber;
    };
    blochCoordinates: {
      x: number;
      y: number;
      z: number;
    };
  };
}

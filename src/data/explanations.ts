export interface ConceptExplanation {
  id: string;
  term: string;
  category: 'quantum' | 'crypto' | 'attack' | 'metric';
  shortExplanation: string;
  bulletTakeaway?: string;
}

export const CONCEPT_EXPLANATIONS: Record<string, ConceptExplanation> = {
  qubit: {
    id: 'qubit',
    term: 'Qubit',
    category: 'quantum',
    shortExplanation:
      'A qubit is the basic unit of quantum information. A normal bit is either 0 or 1, while a qubit can exist in a combination of states before measurement.',
    bulletTakeaway: 'Quantum version of a binary bit (can hold 0, 1, or both).',
  },
  superposition: {
    id: 'superposition',
    term: 'Superposition',
    category: 'quantum',
    shortExplanation:
      'A qubit can be in a combination of both 0 and 1 at the same time until it is measured.',
    bulletTakeaway: 'Existing in multiple states simultaneously until observed.',
  },
  'quantum-gate': {
    id: 'quantum-gate',
    term: 'Quantum Gate',
    category: 'quantum',
    shortExplanation:
      'An operation that changes the state of a qubit, similar to a logic gate in a normal computer.',
    bulletTakeaway: 'Basic building block of quantum circuits (like AND/OR in classical logic).',
  },
  'hadamard-gate': {
    id: 'hadamard-gate',
    term: 'Hadamard Gate',
    category: 'quantum',
    shortExplanation:
      'A quantum gate that puts a qubit into an equal combination (superposition) of 0 and 1.',
    bulletTakeaway: 'Transforms a definite |0⟩ or |1⟩ into an equal 50/50 superposition.',
  },
  'x-gate': {
    id: 'x-gate',
    term: 'X Gate',
    category: 'quantum',
    shortExplanation:
      'The quantum equivalent of a NOT gate. It flips a qubit from 0 to 1, or from 1 to 0.',
    bulletTakeaway: 'Flips |0⟩ to |1⟩ and |1⟩ to |0⟩ (quantum bit flip).',
  },
  'z-gate': {
    id: 'z-gate',
    term: 'Z Gate',
    category: 'quantum',
    shortExplanation:
      'A quantum phase-flip gate that changes the phase of state 1 without changing 0.',
    bulletTakeaway: 'Leaves |0⟩ alone and inverts the sign of |1⟩.',
  },
  cnot: {
    id: 'cnot',
    term: 'CNOT',
    category: 'quantum',
    shortExplanation:
      'Controlled-NOT gate. It flips a second qubit only if the first qubit is 1, creating entanglement.',
    bulletTakeaway: '2-qubit gate essential for creating Bell state pairs.',
  },
  entanglement: {
    id: 'entanglement',
    term: 'Entanglement',
    category: 'quantum',
    shortExplanation:
      'Two qubits can become strongly connected so that their measurement results are correlated.',
    bulletTakeaway: 'Measuring one qubit immediately dictates the state of the other.',
  },
  'bell-state': {
    id: 'bell-state',
    term: 'Bell State',
    category: 'quantum',
    shortExplanation:
      'A pair of maximally entangled qubits. Measuring one qubit instantly reveals the state of the other.',
    bulletTakeaway: 'The four fundamental entangled states (|Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, |Ψ⁻⟩).',
  },
  'quantum-teleportation': {
    id: 'quantum-teleportation',
    term: 'Quantum Teleportation',
    category: 'quantum',
    shortExplanation:
      'Transferring the quantum state of a qubit to another location using entanglement and classical communication without moving physical matter.',
    bulletTakeaway: 'Moves quantum state information instantly without cloning or moving particles.',
  },
  measurement: {
    id: 'measurement',
    term: 'Measurement',
    category: 'quantum',
    shortExplanation:
      'When we measure a qubit, we get a normal classical result such as 0 or 1.',
    bulletTakeaway: 'Collapses the fragile superposition into a definite classical value.',
  },
  'measurement-distribution': {
    id: 'measurement-distribution',
    term: 'Measurement Distribution',
    category: 'quantum',
    shortExplanation:
      'The statistical spread of measurement results across multiple runs. In Q-SHIELD, each state should appear roughly 25% of the time.',
    bulletTakeaway: 'Even 25% balance indicates an authentic, untampered quantum carrier.',
  },
  fidelity: {
    id: 'fidelity',
    term: 'Fidelity',
    category: 'metric',
    shortExplanation:
      'Fidelity tells us how closely the observed quantum state matches the expected state.',
    bulletTakeaway: '100% means perfect match; drops below 90% indicate noise or interference.',
  },
  'jensen-shannon-divergence': {
    id: 'jensen-shannon-divergence',
    term: 'Jensen-Shannon Divergence',
    category: 'metric',
    shortExplanation:
      'A mathematical measurement of how much the observed probability distribution differs from what was expected.',
    bulletTakeaway: 'Measures probability difference. Zero means identical distributions.',
  },
  'replay-attack': {
    id: 'replay-attack',
    term: 'Replay Attack',
    category: 'attack',
    shortExplanation:
      'An attacker tries to reuse an old valid verification request.',
    bulletTakeaway: 'Intercepting and resending genuine credentials. Prevented by single-use nonces.',
  },
  'message-tampering': {
    id: 'message-tampering',
    term: 'Message Tampering',
    category: 'attack',
    shortExplanation:
      'An adversary modifies the transaction data in transit, which causes the cryptographic hash and quantum carrier to mismatch.',
    bulletTakeaway: 'Modifying bytes (e.g. changing ₹5,000 to ₹50,000) breaks hash verification.',
  },
  'quantum-noise': {
    id: 'quantum-noise',
    term: 'Quantum Noise',
    category: 'attack',
    shortExplanation:
      'Small unwanted changes in quantum behavior. Noise does not automatically mean an attack.',
    bulletTakeaway: 'Environmental fluctuations (thermal, optical) that create mild deviation.',
  },
  'threat-score': {
    id: 'threat-score',
    term: 'Threat Score',
    category: 'metric',
    shortExplanation:
      'A calculated 0 to 100 rating combining quantum fidelity, distribution deviation, nonce freshness, and behavioral anomalies.',
    bulletTakeaway: '0–25 is Secure; 26–50 Medium; 51–75 High; 76–100 Critical Risk.',
  },
  'sha-256': {
    id: 'sha-256',
    term: 'SHA-256 Hash',
    category: 'crypto',
    shortExplanation:
      'A mathematical one-way function that turns any message into a unique 256-bit fingerprint. Even changing a single comma completely changes the hash.',
    bulletTakeaway: 'Deterministic cryptographic digest verifying message integrity.',
  },
  'digital-signature': {
    id: 'digital-signature',
    term: 'Digital Signature',
    category: 'crypto',
    shortExplanation:
      'A cryptographic token proving that a message was sent by the authentic sender and has not been altered in transit.',
    bulletTakeaway: 'Electronic equivalent of a notarized physical signature.',
  },
  'pauli-correction': {
    id: 'pauli-correction',
    term: 'Pauli Correction',
    category: 'quantum',
    shortExplanation:
      'A standard quantum operation (X, Z, or Y gate) used by the receiver to restore the exact original quantum state.',
    bulletTakeaway: 'Unitary transformation finishing the teleportation protocol.',
  },
};

export const getExplanation = (termKey: string): ConceptExplanation => {
  const normalized = termKey.toLowerCase().replace(/[\s_]+/g, '-');
  return (
    CONCEPT_EXPLANATIONS[normalized] || {
      id: normalized,
      term: termKey,
      category: 'quantum',
      shortExplanation: `Explanation for ${termKey} in Q-SHIELD.`,
    }
  );
};

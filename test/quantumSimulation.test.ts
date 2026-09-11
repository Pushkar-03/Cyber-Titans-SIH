/**
 * Unit Tests for Q-SHIELD Quantum Simulation Service
 * 
 * Verifies correctness of:
 * 1. Pauli eigenstates |0>, |1>, |+>, |->
 * 2. Bell-state generation (|Φ⁺>, |Φ⁻>, |Ψ⁺>, |Ψ⁻>)
 * 3. Three-qubit quantum teleportation workflow
 * 4. Alice Bell measurement & classical syndrome bits (m1, m2)
 * 5. Conditional Pauli X/Z corrections
 * 6. Final Bob measurement & probability distributions
 * 7. Configurable number of shots
 * 8. Mathematical state fidelity F = 1.0
 */

import assert from 'node:assert';
import test, { describe, it } from 'node:test';
import { quantumSimulationService, Complex } from '../src/services/quantumSimulationService';

describe('QuantumSimulationService Unit Tests', () => {

  describe('1. Pauli Eigenstates', () => {
    it('should generate exact Pauli |0> eigenstate', () => {
      const state = quantumSimulationService.getPauliEigenstate('|0>');
      assert.strictEqual(state.label, '|0⟩');
      assert.strictEqual(state.amplitudes.alpha.real, 1);
      assert.strictEqual(state.amplitudes.alpha.imag, 0);
      assert.strictEqual(state.amplitudes.beta.real, 0);
      assert.strictEqual(state.amplitudes.beta.imag, 0);
      assert.strictEqual(state.theoreticalProbabilities['0'], 1.0);
      assert.strictEqual(state.theoreticalProbabilities['1'], 0.0);
      assert.deepStrictEqual(state.blochCoordinates, { x: 0, y: 0, z: 1 });
    });

    it('should generate exact Pauli |1> eigenstate', () => {
      const state = quantumSimulationService.getPauliEigenstate('|1>');
      assert.strictEqual(state.label, '|1⟩');
      assert.strictEqual(state.amplitudes.alpha.real, 0);
      assert.strictEqual(state.amplitudes.alpha.imag, 0);
      assert.strictEqual(state.amplitudes.beta.real, 1);
      assert.strictEqual(state.amplitudes.beta.imag, 0);
      assert.strictEqual(state.theoreticalProbabilities['0'], 0.0);
      assert.strictEqual(state.theoreticalProbabilities['1'], 1.0);
      assert.deepStrictEqual(state.blochCoordinates, { x: 0, y: 0, z: -1 });
    });

    it('should generate exact Pauli |+> eigenstate (Hadamard basis)', () => {
      const state = quantumSimulationService.getPauliEigenstate('|+>');
      assert.strictEqual(state.label, '|+⟩');
      const expectedAmp = 1 / Math.SQRT2;
      assert.ok(Math.abs(state.amplitudes.alpha.real - expectedAmp) < 1e-6);
      assert.ok(Math.abs(state.amplitudes.beta.real - expectedAmp) < 1e-6);
      assert.strictEqual(state.theoreticalProbabilities['0'], 0.5);
      assert.strictEqual(state.theoreticalProbabilities['1'], 0.5);
      assert.deepStrictEqual(state.blochCoordinates, { x: 1, y: 0, z: 0 });
    });

    it('should generate exact Pauli |-> eigenstate (Hadamard basis)', () => {
      const state = quantumSimulationService.getPauliEigenstate('|->');
      assert.strictEqual(state.label, '|-⟩');
      const expectedAmp = 1 / Math.SQRT2;
      assert.ok(Math.abs(state.amplitudes.alpha.real - expectedAmp) < 1e-6);
      assert.ok(Math.abs(state.amplitudes.beta.real - (-expectedAmp)) < 1e-6);
      assert.strictEqual(state.theoreticalProbabilities['0'], 0.5);
      assert.strictEqual(state.theoreticalProbabilities['1'], 0.5);
      assert.deepStrictEqual(state.blochCoordinates, { x: -1, y: 0, z: 0 });
    });
  });

  describe('2. Bell-State Generation', () => {
    it('should generate canonical Bell state |Φ⁺>', () => {
      const bell = quantumSimulationService.getBellState('|Φ⁺>');
      assert.strictEqual(bell.name, '|Φ⁺>');
      assert.ok(bell.formula.includes('|00⟩ + |11⟩'));
    });

    it('should generate all 4 Bell states correctly', () => {
      const phiMinus = quantumSimulationService.getBellState('|Φ⁻>');
      const psiPlus = quantumSimulationService.getBellState('|Ψ⁺>');
      const psiMinus = quantumSimulationService.getBellState('|Ψ⁻>');

      assert.ok(phiMinus.formula.includes('|00⟩ - |11⟩'));
      assert.ok(psiPlus.formula.includes('|01⟩ + |10⟩'));
      assert.ok(psiMinus.formula.includes('|01⟩ - |10⟩'));
    });
  });

  describe('3. Teleportation Protocol & Pauli Corrections across all 4 syndromes', () => {
    it('should achieve F = 1.0 for syndrome 00 (Identity correction)', () => {
      const result = quantumSimulationService.simulateTeleportation('|0>', 1000, {
        fixedMeasurement: { m1: 0, m2: 0 },
      });
      assert.strictEqual(result.aliceMeasurement.m1, 0);
      assert.strictEqual(result.aliceMeasurement.m2, 0);
      assert.strictEqual(result.correction.appliedGate, 'I');
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
    });

    it('should achieve F = 1.0 for syndrome 01 (Pauli X bit-flip correction)', () => {
      const result = quantumSimulationService.simulateTeleportation('|0>', 1000, {
        fixedMeasurement: { m1: 0, m2: 1 },
      });
      assert.strictEqual(result.aliceMeasurement.m1, 0);
      assert.strictEqual(result.aliceMeasurement.m2, 1);
      assert.strictEqual(result.correction.appliedGate, 'X');
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
    });

    it('should achieve F = 1.0 for syndrome 10 (Pauli Z phase-flip correction)', () => {
      const result = quantumSimulationService.simulateTeleportation('|+>', 1000, {
        fixedMeasurement: { m1: 1, m2: 0 },
      });
      assert.strictEqual(result.aliceMeasurement.m1, 1);
      assert.strictEqual(result.aliceMeasurement.m2, 0);
      assert.strictEqual(result.correction.appliedGate, 'Z');
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
    });

    it('should achieve F = 1.0 for syndrome 11 (Pauli Z·X combined correction)', () => {
      const result = quantumSimulationService.simulateTeleportation('|1>', 1000, {
        fixedMeasurement: { m1: 1, m2: 1 },
      });
      assert.strictEqual(result.aliceMeasurement.m1, 1);
      assert.strictEqual(result.aliceMeasurement.m2, 1);
      assert.strictEqual(result.correction.appliedGate, 'Z·X');
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
    });
  });

  describe('4. Teleportation of all 4 Pauli Eigenstates', () => {
    it('should successfully teleport |0> with deterministic Bob measurement 100% |0>', () => {
      const shots = 2000;
      const result = quantumSimulationService.simulateTeleportation('|0>', shots);
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.measurementCounts['0'], shots);
      assert.strictEqual(result.measurementCounts['1'], 0);
      assert.strictEqual(result.measurementProbabilities['0'], 1.0);
      assert.strictEqual(result.measurementProbabilities['1'], 0.0);
    });

    it('should successfully teleport |1> with deterministic Bob measurement 100% |1>', () => {
      const shots = 2000;
      const result = quantumSimulationService.simulateTeleportation('|1>', shots);
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.measurementCounts['0'], 0);
      assert.strictEqual(result.measurementCounts['1'], shots);
      assert.strictEqual(result.measurementProbabilities['0'], 0.0);
      assert.strictEqual(result.measurementProbabilities['1'], 1.0);
    });

    it('should successfully teleport |+> with 50/50 measurement distribution', () => {
      const shots = 2048;
      const result = quantumSimulationService.simulateTeleportation('|+>', shots);
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.measurementCounts['0'], 1024);
      assert.strictEqual(result.measurementCounts['1'], 1024);
      assert.strictEqual(result.measurementProbabilities['0'], 0.5);
      assert.strictEqual(result.measurementProbabilities['1'], 0.5);
    });

    it('should successfully teleport |-> with 50/50 measurement distribution', () => {
      const shots = 1000;
      const result = quantumSimulationService.simulateTeleportation('|->', shots);
      assert.strictEqual(result.fidelity, 1.0);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.measurementCounts['0'], 500);
      assert.strictEqual(result.measurementCounts['1'], 500);
      assert.strictEqual(result.measurementProbabilities['0'], 0.5);
      assert.strictEqual(result.measurementProbabilities['1'], 0.5);
    });
  });

  describe('5. API Contract & Output Schema Compliance', () => {
    it('should return exact schema requested by user specifications', () => {
      const result = quantumSimulationService.simulateTeleportation('|0>', 512);

      // Verify all top-level keys required by prompt
      assert.ok('inputState' in result, 'Must contain inputState');
      assert.ok('bellState' in result, 'Must contain bellState');
      assert.ok('aliceMeasurement' in result, 'Must contain aliceMeasurement');
      assert.ok('correction' in result, 'Must contain correction');
      assert.ok('measurementCounts' in result, 'Must contain measurementCounts');
      assert.ok('measurementProbabilities' in result, 'Must contain measurementProbabilities');
      assert.ok('fidelity' in result, 'Must contain fidelity');
      assert.ok('success' in result, 'Must contain success');

      // Verify types
      assert.strictEqual(typeof result.fidelity, 'number');
      assert.strictEqual(typeof result.success, 'boolean');
      assert.strictEqual(typeof result.bellState, 'string');
      assert.strictEqual(typeof result.measurementCounts['0'], 'number');
      assert.strictEqual(typeof result.measurementCounts['1'], 'number');
      assert.strictEqual(result.measurementCounts['0'] + result.measurementCounts['1'], 512);
    });
  });

  describe('6. Configurable Shots & Arbitrary Superposition States', () => {
    it('should correctly scale to arbitrary shot counts', () => {
      const testShots = [100, 250, 4096, 10000];
      for (const shots of testShots) {
        const result = quantumSimulationService.simulateTeleportation({ theta: 60, phi: 45 }, shots);
        const total = result.measurementCounts['0'] + result.measurementCounts['1'];
        assert.strictEqual(total, shots);
        assert.strictEqual(result.fidelity, 1.0);
      }
    });

    it('should correctly compute probability distribution for custom state (theta=60°, P0=cos^2(30°)=0.75)', () => {
      const shots = 10000;
      const result = quantumSimulationService.simulateTeleportation({ theta: 60, phi: 0 }, shots);
      // cos^2(30°) = 0.75
      assert.strictEqual(result.inputState.theoreticalProbabilities['0'], 0.75);
      assert.strictEqual(result.measurementCounts['0'], 7500);
      assert.strictEqual(result.measurementCounts['1'], 2500);
    });
  });

});

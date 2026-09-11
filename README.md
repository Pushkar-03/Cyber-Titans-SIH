# ⚛️ Q-SHIELD

### Quantum-Inspired Statistical Threat Detection for Secure Digital Signature Verification

> **From verifying whether a signature is valid to monitoring whether the entire verification behaviour is trustworthy.**

[![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-blue)](#)
[![Quantum](https://img.shields.io/badge/Quantum-Simulation-purple)](#)
[![Security](https://img.shields.io/badge/Cybersecurity-Threat%20Detection-red)](#)
[![AI](https://img.shields.io/badge/AI-Gemini-orange)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

---

## 🚨 The Problem

Digital signatures provide a strong mechanism for verifying **message integrity and authenticity**.

A conventional verification system generally answers:

> **"Is this signature valid?"**

However, a valid signature alone does not necessarily provide complete visibility into the behaviour surrounding a verification session.

Modern attacks can involve:

- 🔁 Replay of previously valid sessions
- 📝 Message tampering
- 🧩 Session duplication
- 📊 Abnormal verification behaviour
- 🌐 Manipulation of observed data
- ⚠️ Unexpected system/noise conditions

This creates an opportunity for an additional security-monitoring layer that asks a second question:

> **"Does this verification session behave like a legitimate session?"**

---

# 💡 Our Solution

**Q-SHIELD** is a quantum-inspired statistical threat-detection framework designed to augment conventional digital-signature verification.

Instead of replacing established cryptographic mechanisms, Q-SHIELD adds a behavioural monitoring layer based on:

- Quantum-state simulation
- Bell-state entanglement
- Quantum teleportation
- Pauli corrections
- Repeated quantum measurements
- Measurement probability distributions
- Statistical divergence
- Fidelity analysis
- Replay detection
- Session anomaly detection
- Threat scoring
- Explainable AI

The system combines these signals to produce an interpretable security decision.

---

# 🎯 Core Idea

The central hypothesis behind Q-SHIELD is:

> **Legitimate verification sessions should exhibit statistically consistent behaviour. Significant unexplained deviations can be treated as security signals and investigated alongside classical security indicators.**

The system therefore compares:

```text
Expected Verification Behaviour
              ↓
        Quantum Simulation
              ↓
        Repeated Measurements
              ↓
       Observed Distribution
              ↓
        Statistical Comparison
              ↓
         Security Signals
              ↓
          Threat Score
```

---

# 🔬 Why "Quantum-Inspired"?

Q-SHIELD does **not** claim that quantum computing automatically makes digital signatures secure.

The current prototype uses **quantum simulation** to demonstrate quantum states, entanglement, teleportation and measurement behaviour.

The quantum layer is treated as an additional source of statistical features.

Therefore:

> **Q-SHIELD is a quantum-inspired security-monitoring framework, not a replacement for digital-signature algorithms and not a production quantum cryptographic protocol.**

This distinction is fundamental to the project's technical design.

---

# 🧠 How Q-SHIELD Works

```text
                         Q-SHIELD
                            │
                            ▼
                     ┌─────────────┐
                     │   MESSAGE   │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │   SHA-256   │
                     │    HASH     │
                     └──────┬──────┘
                            │
                            ▼
                  ┌────────────────────┐
                  │ DIGITAL SIGNATURE  │
                  │    VERIFICATION    │
                  └──────────┬─────────┘
                             │
             ┌───────────────┴────────────────┐
             │                                │
             ▼                                ▼
   ┌──────────────────┐            ┌──────────────────┐
   │ CLASSICAL        │            │ QUANTUM          │
   │ SECURITY         │            │ SIMULATION       │
   │                  │            │                  │
   │ • Integrity      │            │ • Qubits         │
   │ • Replay         │            │ • Bell States    │
   │ • Session        │            │ • Teleportation  │
   │ • Tampering      │            │ • Measurement    │
   └────────┬─────────┘            └────────┬─────────┘
            │                               │
            │                               ▼
            │                     ┌──────────────────┐
            │                     │ MEASUREMENT      │
            │                     │ DISTRIBUTION     │
            │                     └────────┬─────────┘
            │                              │
            └──────────────┬───────────────┘
                           ▼
                  ┌─────────────────────┐
                  │ STATISTICAL ENGINE  │
                  │                     │
                  │ • Fidelity          │
                  │ • Divergence        │
                  │ • Distribution      │
                  │ • Anomaly Detection │
                  └──────────┬──────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ THREAT ENGINE   │
                    │                 │
                    │ Threat Score    │
                    │ 0 ───────── 100 │
                    └────────┬────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │ SECURITY DECISION     │
                 │                       │
                 │ ✓ ACCEPT              │
                 │ ⚠ REVIEW              │
                 │ 🚨 REJECT             │
                 └──────────┬────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │ GEMINI AI       │
                   │ SECURITY        │
                   │ EXPLANATION     │
                   └─────────────────┘
```

---

# ⚛️ Quantum Layer

The prototype demonstrates a simplified quantum verification workflow.

## 1. Qubit

A qubit is the basic unit of quantum information.

Unlike a classical bit, represented by either:

```text
0
```

or:

```text
1
```

a qubit can be represented as a quantum state:

\[
|\psi\rangle = \alpha|0\rangle + \beta|1\rangle
\]

---

## 2. Quantum Gates

The simulation uses fundamental quantum operations including:

- Hadamard (H)
- Pauli-X
- Pauli-Z
- CNOT

These operations are used to prepare and manipulate quantum states.

---

## 3. Bell State

The system creates an entangled pair using a Bell-state circuit.

One example is:

\[
|\Phi^+\rangle =
\frac{|00\rangle + |11\rangle}{\sqrt{2}}
\]

---

## 4. Quantum Teleportation

The prototype demonstrates a three-qubit teleportation process:

```text
Input Qubit
     │
     ▼
Bell Pair
     │
     ▼
Entanglement
     │
     ▼
Alice Measurement
     │
     ▼
Classical Bits
     │
     ▼
Pauli Correction
     │
     ▼
Bob's Reconstructed State
```

The system then performs repeated measurements.

---

# 📊 Statistical Threat Detection

Quantum measurements are probabilistic.

Therefore, the system does not rely on a single measurement.

Instead, it performs multiple circuit executions ("shots") and obtains a probability distribution.

Example:

```text
Expected

00 ████████████████████ 50%
11 ████████████████████ 50%
```

Observed:

```text
00 ██████████████████   47%
11 ████████████████████ 53%
```

Small deviations can occur naturally.

Q-SHIELD therefore evaluates the **magnitude and significance of the deviation** rather than treating every difference as an attack.

---

# 📐 Security Features

Q-SHIELD can combine several security signals.

### Classical Signals

| Feature | Purpose |
|---|---|
| Message Hash | Detect message modification |
| Signature Status | Verify authenticity/integrity |
| Session ID | Track verification sessions |
| Nonce | Prevent reuse |
| Timestamp | Validate session freshness |
| Replay Check | Detect reused requests |
| Session Anomaly | Detect unusual session behaviour |

### Quantum-Inspired Signals

| Feature | Purpose |
|---|---|
| Measurement Distribution | Capture quantum simulation behaviour |
| Fidelity | Compare expected and observed quantum states |
| Statistical Divergence | Quantify distribution differences |
| Noise Response | Analyze behaviour under simulated noise |

---

# 🚨 Attack Simulation

Q-SHIELD provides controlled demonstrations of several attack scenarios.

## 🔁 Replay Attack

An attacker attempts to reuse an already valid verification session.

```text
VALID SESSION
      ↓
CAPTURED
      ↓
REUSED
      ↓
SESSION CHECK
      ↓
🚨 REPLAY DETECTED
      ↓
REJECT
```

---

## 📝 Message Tampering

```text
Original:
Transfer ₹5,000

        ↓ ATTACK

Modified:
Transfer ₹50,000

        ↓

SHA-256 Mismatch

        ↓

🚨 TAMPERING DETECTED
```

---

## 📊 Measurement Manipulation

The expected measurement distribution is compared with an altered observed distribution.

```text
EXPECTED
     ↓
Measurement Distribution
     ↓
       COMPARE
     ↑
OBSERVED
     ↓
Statistical Deviation
     ↓
Risk Signal
```

---

## 🌐 Quantum Noise

Controlled noise can be introduced into the simulated circuit.

The system studies:

```text
Noise Level
     ↓
Measurement Change
     ↓
Distribution Deviation
     ↓
False Positive Behaviour
```

Importantly:

> **Noise is not automatically considered an attack.**

This allows the prototype to study the difference between normal system variation and suspicious behaviour.

---

# 🧮 Threat Score

The prototype combines security signals into a normalized score:

```text
              THREAT SCORE

Fidelity Risk             ─┐
Distribution Deviation    ─┤
Replay Risk               ─┼──→ 0–100
Session Anomaly           ─┘
```

Initial prototype weighting:

```text
30%  Fidelity Risk
30%  Distribution Deviation
25%  Replay Risk
15%  Session Anomaly
```

Example classification:

| Score | Level | Response |
|---:|---|---|
| 0–30 | 🟢 LOW | Accept |
| 31–60 | 🟡 MEDIUM | Review |
| 61–80 | 🟠 HIGH | Alert |
| 81–100 | 🔴 CRITICAL | Reject / Invalidate |

> These weights and thresholds are prototype parameters and should be validated experimentally rather than treated as universally optimal.

---

# 🤖 Explainable AI

Q-SHIELD integrates **Google Gemini** as an explanation layer.

The deterministic security engine first calculates:

```text
Threat Score
Replay Risk
Distribution Deviation
Fidelity
Session Anomaly
Attack Type
```

Only then does Gemini generate a human-readable explanation.

Example:

```text
🚨 CRITICAL SECURITY EVENT

Threat Score: 91/100

Reason:
The verification session was previously consumed,
indicating a likely replay attempt.

Additional Evidence:
• High replay risk
• Abnormal measurement distribution
• Session freshness failure

Recommended Response:
Reject the verification request and invalidate
the associated session.
```

### Important Architecture Principle

```text
SECURITY ENGINE
      ↓
MAKES DECISION
      ↓
GEMINI
      ↓
EXPLAINS DECISION
```

Gemini does **not** independently determine the threat score.

---

# 🏗️ System Architecture

```text
┌────────────────────────────────────────────┐
│                FRONTEND                    │
│                                            │
│ React + TypeScript + Tailwind              │
│                                            │
│ • Verification UI                          │
│ • Quantum Visualization                    │
│ • Attack Simulator                         │
│ • Threat Dashboard                         │
└────────────────────┬───────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────┐
│              BACKEND API                   │
│                                            │
│ Node.js + Express                          │
└───────────────┬────────────────────────────┘
                │
       ┌────────┴────────┐
       ▼                 ▼
┌─────────────┐   ┌─────────────────┐
│ CLASSICAL   │   │ QUANTUM ENGINE  │
│ SECURITY    │   │                 │
│             │   │ Qiskit / Aer   │
│ SHA-256     │   │ Circuit Sim.    │
│ Replay      │   │ Bell States     │
│ Sessions    │   │ Teleportation   │
│ Integrity   │   │ Measurements    │
└──────┬──────┘   └────────┬────────┘
       │                   │
       └─────────┬─────────┘
                 ▼
        ┌──────────────────┐
        │ STATISTICAL      │
        │ ENGINE           │
        │                  │
        │ Fidelity         │
        │ Divergence       │
        │ Anomaly Score    │
        └────────┬─────────┘
                 ▼
        ┌──────────────────┐
        │ THREAT ENGINE    │
        │                  │
        │ Score + Decision │
        └────────┬─────────┘
                 ▼
        ┌──────────────────┐
        │ DATABASE         │
        │                  │
        │ Sessions         │
        │ Events           │
        │ Results          │
        └────────┬─────────┘
                 ▼
        ┌──────────────────┐
        │ GEMINI AI        │
        │                  │
        │ Explanation      │
        └──────────────────┘
```

---

# 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts

### Backend

- Node.js
- Express

### Quantum

- Qiskit
- Qiskit Aer
- Quantum circuit simulation

### Statistical Analysis

- Python
- NumPy
- SciPy

### Database

- Firebase / Firestore

### AI

- Google Gemini API

### Deployment

- Google AI Studio
- Cloud deployment environment

---

# 🖥️ Prototype Workflow

The prototype is designed as an easy-to-understand interactive demonstration.

```text
START DEMO
    ↓
ENTER MESSAGE
    ↓
GENERATE / VERIFY SIGNATURE
    ↓
QUANTUM PROCESS
    ↓
BELL STATE
    ↓
TELEPORTATION
    ↓
MEASUREMENT
    ↓
STATISTICAL ANALYSIS
    ↓
THREAT SCORE
    ↓
SECURITY DECISION
    ↓
AI EXPLANATION
```

---

# 🎮 Demo Mode

Q-SHIELD includes a guided demonstration designed for presentations.

### Scenario 1 — Legitimate Session

```text
Message
 ↓
Signature Valid
 ↓
Quantum Process Normal
 ↓
Expected ≈ Observed
 ↓
LOW RISK
 ↓
✓ ACCEPT
```

### Scenario 2 — Replay Attack

```text
Previously Valid Session
 ↓
Attacker Reuses It
 ↓
Replay Check
 ↓
🚨 REPLAY DETECTED
 ↓
HIGH RISK
 ↓
✕ REJECT
```

This allows the complete security workflow to be demonstrated in approximately 2–3 minutes.

---

# 📚 Research Direction

Q-SHIELD is also designed as a research prototype.

The primary research question is:

> **Can quantum-inspired measurement statistics, when combined with classical digital-signature and session-security signals, provide useful additional information for detecting anomalous verification behaviour?**

Potential research areas include:

- Quantum-inspired anomaly detection
- Statistical analysis of quantum measurements
- Hybrid classical–quantum security monitoring
- Noise-aware anomaly detection
- Behavioural cybersecurity
- Explainable AI for security operations

---

# 🧪 Planned Evaluation

The system should be evaluated against multiple scenarios:

1. Legitimate sessions
2. Replay attacks
3. Message tampering
4. Measurement manipulation
5. Quantum noise
6. Combined attacks

And compared against:

### Baseline A

Classical security checks only.

### Baseline B

Quantum-inspired statistical features only.

### Baseline C

Full Q-SHIELD hybrid model.

Evaluation metrics:

- Accuracy
- Precision
- Recall
- F1-score
- False Positive Rate
- False Negative Rate
- ROC-AUC / PR-AUC where appropriate
- Detection latency
- Computational overhead

---

# 🔬 Research Integrity

Q-SHIELD intentionally avoids making unsupported claims.

The project does **not** claim:

❌ Quantum computing automatically makes digital signatures secure.

❌ Every measurement deviation indicates an attack.

❌ The prototype replaces RSA/ECDSA/EdDSA or post-quantum signatures.

❌ Simulated qubits are equivalent to physical quantum hardware.

❌ Gemini provides the cryptographic security decision.

Instead, Q-SHIELD investigates whether **quantum-inspired statistical signals can add measurable value to security monitoring.**

---

# 🚀 Future Scope

### 1. Real Quantum Hardware

Replace the simulator with real quantum hardware.

### 2. Post-Quantum Cryptography

Integrate NIST-standardized post-quantum cryptographic algorithms.

### 3. Adaptive Baselines

Learn legitimate measurement distributions automatically.

### 4. Advanced Anomaly Detection

Investigate:

- Isolation Forest
- One-Class SVM
- Autoencoders
- Bayesian detection
- Change-point detection

### 5. Real-Time Monitoring

Extend Q-SHIELD into a continuous security monitoring platform.

### 6. Hardware Noise Modelling

Evaluate the framework under real hardware noise characteristics.

### 7. Federated Security Monitoring

Explore privacy-preserving distributed anomaly detection.

---

# 👥 Team Roles

Suggested project responsibilities:

| Role | Responsibility |
|---|---|
| Quantum Engineer | Quantum circuits & simulation |
| Security Engineer | Signatures, sessions & attack modelling |
| Data/ML Engineer | Statistical analysis & threat scoring |
| Backend Engineer | APIs & data pipeline |
| Frontend Engineer | Dashboard & visualization |
| AI Engineer | Gemini explanation layer |
| Research Lead | Literature review & experimental validation |

---

# 📂 Project Structure

```text
q-shield/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── charts/
│   └── services/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   └── middleware/
│
├── quantum/
│   ├── circuits/
│   ├── teleportation/
│   ├── bell_states/
│   └── measurement/
│
├── security/
│   ├── hashing/
│   ├── signatures/
│   ├── replay/
│   └── sessions/
│
├── analytics/
│   ├── fidelity/
│   ├── divergence/
│   ├── anomaly/
│   └── scoring/
│
├── ai/
│   └── gemini/
│
├── database/
│
├── docs/
│   ├── architecture/
│   ├── research/
│   └── diagrams/
│
└── README.md
```

---

# ⚡ Quick Start

## Prerequisites

Install:

- Node.js
- Python 3.x
- Git

Clone the repository:

```bash
git clone https://github.com/<YOUR-USERNAME>/q-shield.git

cd q-shield
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

Install backend dependencies:

```bash
cd ../backend
npm install
```

Install Python dependencies:

```bash
pip install qiskit qiskit-aer numpy scipy
```

Configure environment variables:

```env
GEMINI_API_KEY=your_api_key
```

Run the application:

```bash
npm run dev
```

---

# 🔐 Security Notice

Q-SHIELD is an academic and hackathon prototype.

Do not use the prototype as a replacement for production cryptographic infrastructure.

Never commit:

- API keys
- private keys
- credentials
- authentication tokens
- sensitive datasets

Use synthetic data for attack simulations.

---

# 📖 Documentation

Project documentation should include:

- System Architecture
- Quantum Circuit Design
- Threat Model
- Statistical Methodology
- Experimental Methodology
- API Documentation
- Research Paper
- SIH Presentation

---

# 🏆 Smart India Hackathon

**Project:** Q-SHIELD  
**Event:** Smart India Hackathon 2026  
**Domain:** Cybersecurity / Quantum-Inspired Security / AI

### Our Vision

> **Build a security-monitoring layer that doesn't just ask whether a digital signature is valid—but whether the verification process itself can be trusted.**

---

## ⭐ If you find Q-SHIELD interesting

Star the repository and follow the project as we continue developing the prototype.

---

### Disclaimer

Q-SHIELD is a research and educational prototype. Quantum operations in the current implementation are simulated on classical computing infrastructure. The project does not claim to provide unconditional security or replace established cryptographic standards.

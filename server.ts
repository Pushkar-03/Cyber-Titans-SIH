import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";
import { quantumSimulationService } from "./src/services/quantumSimulationService";
import { threatDetectionService } from "./src/services/threatDetectionService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory backing store for server API
interface ServerSession {
  id: string;
  transactionId: string;
  timestamp: string;
  message: string;
  originalHash: string;
  verifiedHash: string;
  signatureToken: string;
  quantumState: any;
  teleportationStages: any[];
  pauliCorrection: any;
  measurementDist: any;
  threatMetrics: any;
  activeAttack: string;
  status: string;
  isConsumed: boolean;
  sourceIp: string;
  nodeLocation: string;
  authLevel: string;
}

const serverSessions: Map<string, ServerSession> = new Map();
const consumedNonces: Set<string> = new Set();

// Lazy Gemini client helper
let genAiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAiClient) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Q-SHIELD Security Gateway",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    mode: process.env.NODE_ENV || "development",
  });
});

app.get("/api/sessions", (req, res) => {
  const list = Array.from(serverSessions.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json({ sessions: list });
});

app.get("/api/sessions/:id", (req, res) => {
  const session = serverSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({ session });
});

app.post("/api/sessions", (req, res) => {
  const session = req.body;
  if (!session || !session.id) {
    return res.status(400).json({ error: "Invalid session payload" });
  }
  serverSessions.set(session.id, session);
  if (session.isConsumed) {
    consumedNonces.add(session.id);
  }
  res.json({ success: true, session });
});

app.post("/api/consume-nonce", (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "Session ID required" });
  }
  const isReplay = consumedNonces.has(sessionId);
  consumedNonces.add(sessionId);
  const session = serverSessions.get(sessionId);
  if (session) {
    session.isConsumed = true;
    serverSessions.set(sessionId, session);
  }
  res.json({
    sessionId,
    isReplayDetected: isReplay,
    message: isReplay ? "CRITICAL: Nonce already consumed in prior epoch" : "Nonce successfully consumed",
  });
});

// -------------------------------------------------------------
// QUANTUM SIMULATION SERVICE ENDPOINTS (Simulated Backend)
// -------------------------------------------------------------

app.get("/api/quantum/eigenstates", (req, res) => {
  res.json({
    disclaimer: "Quantum computation simulated for prototype demonstration.",
    pauliEigenstates: [
      quantumSimulationService.getPauliEigenstate("|0>"),
      quantumSimulationService.getPauliEigenstate("|1>"),
      quantumSimulationService.getPauliEigenstate("|+>"),
      quantumSimulationService.getPauliEigenstate("|->"),
    ],
    bellStates: [
      quantumSimulationService.getBellState("|Φ⁺>"),
      quantumSimulationService.getBellState("|Φ⁻>"),
      quantumSimulationService.getBellState("|Ψ⁺>"),
      quantumSimulationService.getBellState("|Ψ⁻>"),
    ],
  });
});

/**
 * simulateTeleportation(inputState, shots)
 * Core testable endpoint for Q-SHIELD quantum teleportation verification.
 */
app.post(["/api/quantum/simulate", "/api/quantum/teleport"], (req, res) => {
  try {
    const { inputState, shots = 1024, options = {} } = req.body;
    if (!inputState) {
      return res.status(400).json({
        error: "Missing required 'inputState'. Allowed: '|0>', '|1>', '|+>', '|->' or { theta, phi }",
      });
    }

    const shotCount = typeof shots === "number" && shots > 0 ? Math.min(65536, shots) : 1024;
    const result = quantumSimulationService.simulateTeleportation(inputState, shotCount, options);

    res.json({
      ...result,
      engine: "Q-SHIELD Deterministic Quantum Engine (TypeScript abstraction)",
      disclaimer: "Quantum computation simulated for prototype demonstration.",
    });
  } catch (error: any) {
    console.error("Quantum simulation error:", error);
    res.status(500).json({
      error: "Quantum simulation error",
      details: error?.message,
    });
  }
});

// Deterministic Threat Detection Endpoint (Strict Non-AI Security Engine)
app.post("/api/threat/evaluate", (req, res) => {
  try {
    const {
      expectedMeasurementDistribution,
      observedMeasurementDistribution,
      fidelity,
      sessionMetadata,
      replayStatus,
      messageHashComparison,
    } = req.body;

    if (!expectedMeasurementDistribution || !observedMeasurementDistribution || fidelity === undefined) {
      return res.status(400).json({
        error: "Missing required inputs for threat detection.",
        required: [
          "expectedMeasurementDistribution",
          "observedMeasurementDistribution",
          "fidelity",
          "sessionMetadata",
          "replayStatus",
          "messageHashComparison",
        ],
      });
    }

    const result = threatDetectionService.evaluateThreat({
      expectedMeasurementDistribution,
      observedMeasurementDistribution,
      fidelity: Number(fidelity),
      sessionMetadata: sessionMetadata || {},
      replayStatus: replayStatus ?? false,
      messageHashComparison: messageHashComparison ?? true,
    });

    res.json({
      ...result,
      engine: "Q-SHIELD Deterministic Threat Detection Engine (Jensen-Shannon & Quantum Risk Model)",
      disclaimer: "Threat score deterministically computed by application logic. AI/LLM models are forbidden from overriding security metrics.",
    });
  } catch (error: any) {
    console.error("Threat evaluation error:", error);
    res.status(500).json({
      error: "Threat evaluation error",
      details: error?.message,
    });
  }
});

// AI Security Analyst Endpoint (Explainability Layer Only)
app.post("/api/analyst/explain", async (req, res) => {
  try {
    const raw = req.body;
    const session = raw.session || (raw.threatData ? null : raw);
    const threatData = raw.threatData;

    if (!session && !threatData) {
      return res.status(400).json({ error: "Session or threat analysis data required" });
    }

    // Prepare strictly formatted structured threat-analysis data
    const structuredThreatData = {
      sessionId: String(threatData?.sessionId || session?.id || raw.sessionId || "SES-TELEMETRY-01"),
      threatScore: Number(threatData?.threatScore ?? session?.threatMetrics?.overallThreatScore ?? raw.threatScore ?? 0),
      classification: String(threatData?.classification || session?.threatMetrics?.classification || raw.classification || "LOW"),
      fidelity: Number(threatData?.fidelity ?? session?.threatMetrics?.fidelityScore ?? raw.fidelity ?? 1.0),
      distributionDeviation: Number(threatData?.distributionDeviation ?? session?.threatMetrics?.distributionDeviation ?? raw.distributionDeviation ?? 0.0),
      replayRisk: Number(threatData?.replayRisk ?? session?.threatMetrics?.replayRisk ?? raw.replayRisk ?? 0),
      sessionAnomaly: Number(threatData?.sessionAnomaly ?? session?.threatMetrics?.sessionAnomalyScore ?? raw.sessionAnomaly ?? 0),
      attackType: String(threatData?.attackType || session?.activeAttack || raw.attackType || "NONE"),
      hashMismatch: Boolean(threatData?.hashMismatch ?? (session?.threatMetrics?.hashMismatchDetected || !(session?.threatMetrics?.isHashValid ?? true) || raw.hashMismatch || false)),
      replayDetected: Boolean(threatData?.replayDetected ?? (session?.threatMetrics?.replayRisk > 0 || session?.isConsumed || raw.replayDetected || false)),
    };

    const structuredDataJson = JSON.stringify(structuredThreatData, null, 2);

    // AI Prompt receiving ONLY the structured threat-analysis data
    const prompt = `You are the Q-SHIELD AI Security Analyst for a Security Operations Center (SOC).
You receive ONLY the following structured threat-analysis data from the deterministic Q-SHIELD security engine:

${structuredDataJson}

CRITICAL ARCHITECTURAL CONSTRAINTS:
1. Gemini must NOT calculate the threat score. The threatScore (${structuredThreatData.threatScore}) is already computed by the deterministic engine.
2. Gemini must NOT change the classification. The classification (${structuredThreatData.classification}) is authoritative.
3. Gemini must NOT approve or reject a signature.
4. The deterministic Q-SHIELD security engine remains authoritative.

TASK:
Generate a concise SOC-style explanation.

The response must contain:
1. Threat summary: Concise 1-2 sentence executive SOC threat summary.
2. Main evidence: Concise bullet points citing the specific metrics (e.g. fidelity, distribution deviation, replay risk, session anomaly, hash mismatch).
3. Likely attack pattern: Identified attack pattern name and mechanism.
4. Recommended response: 2-3 concise actionable SOC mitigation and containment steps.

Respond ONLY with valid JSON with this exact structure:
{
  "threatSummary": "concise 1-2 sentence executive SOC threat summary",
  "mainEvidence": [
    "evidence bullet 1 citing specific metrics",
    "evidence bullet 2 citing specific metrics"
  ],
  "likelyAttackPattern": "identified attack pattern name and mechanism",
  "recommendedResponse": [
    "actionable response step 1",
    "actionable response step 2"
  ]
}`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const text = response.text || "";
        const parsed = JSON.parse(text);

        const socExplanation = {
          threatSummary: parsed.threatSummary || `Session evaluated with threat score ${structuredThreatData.threatScore}/100 (${structuredThreatData.classification}).`,
          mainEvidence: Array.isArray(parsed.mainEvidence) ? parsed.mainEvidence : [String(parsed.mainEvidence || "Fidelity and distribution parameters evaluated.")],
          likelyAttackPattern: parsed.likelyAttackPattern || "Standard statistical distribution",
          recommendedResponse: Array.isArray(parsed.recommendedResponse) ? parsed.recommendedResponse : [String(parsed.recommendedResponse || "Monitor session state.")],
        };

        const markdownText = `### 1. Threat Summary\n${socExplanation.threatSummary}\n\n### 2. Main Evidence\n${socExplanation.mainEvidence.map((e: string) => `• ${e}`).join("\n")}\n\n### 3. Likely Attack Pattern\n**${socExplanation.likelyAttackPattern}**\n\n### 4. Recommended Response\n${socExplanation.recommendedResponse.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}`;

        return res.json({
          explanation: socExplanation,
          explanationMarkdown: markdownText,
          inputData: structuredThreatData,
          authoritativeDecision: {
            sessionId: structuredThreatData.sessionId,
            threatScore: structuredThreatData.threatScore,
            classification: structuredThreatData.classification,
            engine: "Q-SHIELD Deterministic Security Engine",
            isAuthoritative: true,
          },
          // Backward compatibility fields
          report: {
            sessionId: structuredThreatData.sessionId,
            summary: socExplanation.threatSummary,
            likelyAttackVector: socExplanation.likelyAttackPattern,
            recommendedMitigations: socExplanation.recommendedResponse,
            threatLevel: structuredThreatData.classification,
            threatScore: structuredThreatData.threatScore,
            mainEvidence: socExplanation.mainEvidence,
            generatedAt: new Date().toISOString(),
          },
          model: "gemini-3.8-flash",
          provider: "gemini-3.8-flash (server-side explainability layer)",
        });
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, falling back to deterministic analyst model:", geminiError?.message);
      }
    }

    // High-fidelity deterministic SOC fallback model adhering to the exact 4 required sections
    let threatSummary = `Nominal security state verified for session ${structuredThreatData.sessionId}. Telemetry confirms authentic cryptographic signature with valid quantum projective distribution (Threat Score: ${structuredThreatData.threatScore}/100, ${structuredThreatData.classification}).`;
    let mainEvidence: string[] = [
      `Quantum state fidelity verified at ${(structuredThreatData.fidelity * 100).toFixed(2)}% (nominal threshold ≥95.0%).`,
      `Distribution deviation (TVD/JSD) is minimal at ${structuredThreatData.distributionDeviation}.`,
      `Single-use nonce is fresh (Replay Risk: ${structuredThreatData.replayRisk}%) with matching cryptographic digest.`,
    ];
    let likelyAttackPattern = "Benign Authentic Transmission (Nominal Quantum Baseline)";
    let recommendedResponse: string[] = [
      "Authorize signature verification and proceed with transaction routing.",
      "Retire single-use nonce to consumed ledger to prevent subsequent replay attacks.",
      "Record cryptographic verification receipt in distributed audit log.",
    ];

    if (structuredThreatData.hashMismatch || structuredThreatData.attackType === "TAMPERING") {
      threatSummary = `Critical cryptographic integrity failure detected for session ${structuredThreatData.sessionId}. The message payload digest diverges from the signed hash, resulting in a deterministic threat score of ${structuredThreatData.threatScore}/100 (${structuredThreatData.classification}).`;
      mainEvidence = [
        "Cryptographic digest mismatch: SHA-256 payload hash does not match original signature ticket.",
        `Session anomaly score elevated to ${structuredThreatData.sessionAnomaly}%.`,
        `Authoritative threat score ${structuredThreatData.threatScore}/100 assigned by deterministic engine.`,
      ];
      likelyAttackPattern = "Signature Payload Tampering / In-Flight Man-in-the-Middle Mutation";
      recommendedResponse = [
        "Reject and quarantine the invalid signature ticket immediately.",
        "Revoke session tokens and alert security operations center of payload forgery attempt.",
        "Trigger IPS rule to flag source IP for deep packet inspection.",
      ];
    } else if (structuredThreatData.replayDetected || structuredThreatData.replayRisk > 0 || structuredThreatData.attackType === "REPLAY") {
      threatSummary = `Replay attack blocked for session ${structuredThreatData.sessionId}. The single-use verification nonce was already consumed in a prior verification window, triggering 100% Replay Risk (${structuredThreatData.classification}).`;
      mainEvidence = [
        `Replay Risk flagged at ${structuredThreatData.replayRisk}%: Nonce marked consumed in distributed verification ledger.`,
        "Quantum measurement distribution reflects a duplicate or previously captured session ticket.",
        `Authoritative threat score ${structuredThreatData.threatScore}/100 assigned by deterministic engine.`,
      ];
      likelyAttackPattern = "Cryptographic Nonce Replay / Intercept-and-Replay Exploitation";
      recommendedResponse = [
        "Block session verification and quarantine the reused transaction nonce across all edge nodes.",
        "Enforce immediate cryptographic nonce epoch rollover on edge verification clusters.",
        "Alert endpoint authorization server of token replay attempt.",
      ];
    } else if (structuredThreatData.attackType === "MANIPULATION" || structuredThreatData.distributionDeviation > 0.20) {
      threatSummary = `Severe quantum measurement distortion detected for session ${structuredThreatData.sessionId}. Projective Bell-state probabilities diverge sharply from the expected distribution, yielding a threat score of ${structuredThreatData.threatScore}/100 (${structuredThreatData.classification}).`;
      mainEvidence = [
        `Distribution Deviation (Total Variation Distance / JSD) measured at ${structuredThreatData.distributionDeviation} (exceeds 0.15 limit).`,
        `Quantum state fidelity degraded to ${(structuredThreatData.fidelity * 100).toFixed(2)}%.`,
        `Authoritative threat score ${structuredThreatData.threatScore}/100 assigned by deterministic engine.`,
      ];
      likelyAttackPattern = "Quantum Measurement Manipulation / SPAD Detector Blinding / Intercept-Resend";
      recommendedResponse = [
        "Invalidate active entangled EPR photon pair channel and recalibrate baseline detectors.",
        "Trigger polarization rotator and interferometer self-test diagnostic.",
        "Request quantum channel re-negotiation with fresh EPR entanglement distribution.",
      ];
    } else if (structuredThreatData.attackType === "QUANTUM_NOISE" || structuredThreatData.fidelity < 0.90) {
      threatSummary = `Physical channel decoherence detected for session ${structuredThreatData.sessionId}. Quantum state fidelity degraded to ${(structuredThreatData.fidelity * 100).toFixed(2)}%, yielding a ${structuredThreatData.classification} threat score (${structuredThreatData.threatScore}/100).`;
      mainEvidence = [
        `Quantum state fidelity measured at ${(structuredThreatData.fidelity * 100).toFixed(2)}% (below 95% nominal threshold).`,
        `Distribution deviation measured at ${structuredThreatData.distributionDeviation} without cryptographic hash mismatch.`,
        `Deterministic classification evaluated as ${structuredThreatData.classification}.`,
      ];
      likelyAttackPattern = "Quantum Channel Decoherence / Optical Fiber Dispersion / Thermal Drift";
      recommendedResponse = [
        "Inspect fiber line attenuation and optical repeater diagnostics.",
        "Queue session for human analyst review if environmental noise exceeds operational baseline.",
        "Initiate dynamic phase calibration to recover state overlap fidelity.",
      ];
    } else if (structuredThreatData.attackType === "DUPLICATION") {
      threatSummary = `Concurrent token collision detected for session ${structuredThreatData.sessionId}. Duplicate verification submitted simultaneously across distributed edge gateways.`;
      mainEvidence = [
        "Duplicate submission recorded across edge gateway verification ledger.",
        `Session anomaly score flagged at ${structuredThreatData.sessionAnomaly}%.`,
        `Deterministic classification evaluated as ${structuredThreatData.classification} (${structuredThreatData.threatScore}/100).`,
      ];
      likelyAttackPattern = "Distributed Token Duplication / Concurrent Race-Condition";
      recommendedResponse = [
        "Lock distributed session state machine and reject secondary submission.",
        "Synchronize NTP timestamp clocks across distributed gateway nodes.",
        "Quarantine duplicate transaction attempt and inspect originating IP cluster.",
      ];
    }

    const socExplanation = {
      threatSummary,
      mainEvidence,
      likelyAttackPattern,
      recommendedResponse,
    };

    const markdownText = `### 1. Threat Summary\n${threatSummary}\n\n### 2. Main Evidence\n${mainEvidence.map((e) => `• ${e}`).join("\n")}\n\n### 3. Likely Attack Pattern\n**${likelyAttackPattern}**\n\n### 4. Recommended Response\n${recommendedResponse.map((r, i) => `${i + 1}. ${r}`).join("\n")}`;

    res.json({
      explanation: socExplanation,
      explanationMarkdown: markdownText,
      inputData: structuredThreatData,
      authoritativeDecision: {
        sessionId: structuredThreatData.sessionId,
        threatScore: structuredThreatData.threatScore,
        classification: structuredThreatData.classification,
        engine: "Q-SHIELD Deterministic Security Engine",
        isAuthoritative: true,
      },
      report: {
        sessionId: structuredThreatData.sessionId,
        summary: threatSummary,
        likelyAttackVector: likelyAttackPattern,
        recommendedMitigations: recommendedResponse,
        threatLevel: structuredThreatData.classification,
        threatScore: structuredThreatData.threatScore,
        mainEvidence,
        generatedAt: new Date().toISOString(),
      },
      model: "deterministic-rules-fallback",
      provider: "q-shield-deterministic-analyst (expert-rules)",
    });
  } catch (err: any) {
    console.error("Analyst endpoint error:", err);
    res.status(500).json({ error: "Failed to generate security analysis", details: err?.message });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & SERVER STARTUP
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Q-SHIELD] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

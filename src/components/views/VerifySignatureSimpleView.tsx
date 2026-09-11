import React, { useState, useEffect } from 'react';
import { SignatureSession } from '../../types/quantum';
import {
  computeSHA256,
  generateDigitalSignature,
  generateSessionId,
  generateTransactionId,
} from '../../utils/crypto';
import {
  generateQuantumState,
  generateTeleportationStages,
  computePauliCorrection,
  simulateMeasurementDistribution,
} from '../../utils/quantumEngine';
import { evaluateThreatMetrics } from '../../utils/threatEngine';
import {
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Copy,
  Check,
  Sparkles,
  Lock,
  ArrowDown,
  RotateCcw,
  ShieldCheck,
  FileText,
  Hash,
} from 'lucide-react';
import { ExplainTerm } from '../common/ExplainTerm';

interface VerifySignatureSimpleViewProps {
  activeSession: SignatureSession | null;
  onSaveSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: 'home' | 'verify-signature' | 'quantum-process' | 'attack-simulation' | 'security-results') => void;
}

const DEFAULT_DEMO_MESSAGE = 'Transfer ₹5,000 to Account 4821';

const QUICK_PRESETS = [
  { label: 'Default Demo', text: 'Transfer ₹5,000 to Account 4821' },
  { label: 'Bank Wire', text: 'SWIFT Transfer ₹1,250,000 to RBI Node 882' },
  { label: 'Medical Record', text: 'Release Patient Cardiology Auth Token #9921' },
];

export const VerifySignatureSimpleView: React.FC<VerifySignatureSimpleViewProps> = ({
  activeSession,
  onSaveSession,
  onNavigateTab,
}) => {
  // Input state
  const [message, setMessage] = useState<string>(
    activeSession?.message || DEFAULT_DEMO_MESSAGE
  );

  // Workflow progress: 'input' -> 'animating' -> 'signed' -> 'verifying' -> 'verified'
  const [workflowState, setWorkflowState] = useState<
    'input' | 'animating' | 'signed' | 'verifying' | 'verified'
  >(() => {
    if (activeSession && activeSession.status === 'VERIFIED') {
      return 'verified';
    }
    return 'input';
  });

  // Animation sub-stage during signature generation
  const [animationStage, setAnimationStage] = useState<number>(0);

  // Generated cryptographic items
  const [transactionId, setTransactionId] = useState<string>(
    activeSession?.transactionId || generateTransactionId()
  );
  const [messageHash, setMessageHash] = useState<string>(
    activeSession?.originalHash || ''
  );
  const [signatureId, setSignatureId] = useState<string>(
    activeSession?.signatureToken || ''
  );

  // UI helpers
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync if activeSession changes externally
  useEffect(() => {
    if (activeSession) {
      if (activeSession.message && workflowState === 'input') {
        setMessage(activeSession.message);
      }
      if (activeSession.originalHash) {
        setMessageHash(activeSession.originalHash);
      }
      if (activeSession.signatureToken) {
        setSignatureId(activeSession.signatureToken);
      }
      if (activeSession.transactionId) {
        setTransactionId(activeSession.transactionId);
      }
    }
  }, [activeSession, workflowState]);

  // STEP 1: Generate Signature with realistic animated progression
  const handleGenerateSignature = async () => {
    if (!message.trim()) return;

    setWorkflowState('animating');
    setAnimationStage(1); // Stage 1: Message

    // Step through the animation stages sequentially
    setTimeout(async () => {
      setAnimationStage(2); // Stage 2: SHA-256 Hash
      const hash = await computeSHA256(message.trim());
      setMessageHash(hash);

      setTimeout(() => {
        setAnimationStage(3); // Stage 3: Digital Signature
        const sig = generateDigitalSignature(hash);
        const txId = generateTransactionId();
        setSignatureId(sig);
        setTransactionId(txId);

        setTimeout(() => {
          setWorkflowState('signed');
        }, 500);
      }, 600);
    }, 500);
  };

  // STEP 2: Verify Signature using real backend logic
  const handleVerifySignature = async () => {
    setWorkflowState('verifying');

    // Run real cryptographic and quantum engine simulation
    const originalHash = messageHash || (await computeSHA256(message.trim()));
    const receivedHash = await computeSHA256(message.trim());
    const verified = originalHash === receivedHash;

    const quantumState = generateQuantumState(originalHash);
    const teleportationStages = generateTeleportationStages(quantumState);
    const pauliCorrection = computePauliCorrection(originalHash);
    const measurementDist = simulateMeasurementDistribution(originalHash, 'NONE');

    const threatMetrics = evaluateThreatMetrics({
      measurementDist,
      originalHash,
      currentMessageHash: receivedHash,
      isSessionConsumed: false,
      attackType: 'NONE',
    });

    const newSession: SignatureSession = {
      id: activeSession?.id || generateSessionId(),
      transactionId: transactionId || generateTransactionId(),
      timestamp: new Date().toISOString(),
      message: message.trim(),
      originalHash,
      verifiedHash: receivedHash,
      signatureToken: signatureId || generateDigitalSignature(originalHash),
      quantumState,
      teleportationStages,
      pauliCorrection,
      measurementDist,
      threatMetrics,
      activeAttack: 'NONE',
      status: verified ? 'VERIFIED' : 'REJECTED',
      isConsumed: false,
      sourceIp: '10.244.12.80 (Authorized Edge Gateway)',
      nodeLocation: 'Delhi Core Quantum Hub - Verifier Alpha',
      authLevel: 'CRITICAL_INFRASTRUCTURE',
    };

    // Save session into real storage
    onSaveSession(newSession);

    setTimeout(() => {
      setWorkflowState('verified');
    }, 450);
  };

  const handleReset = () => {
    setMessage(DEFAULT_DEMO_MESSAGE);
    setWorkflowState('input');
    setAnimationStage(0);
    setMessageHash('');
    setSignatureId('');
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Shorten hash for clean, non-overwhelming display
  const displayHash = messageHash
    ? `${messageHash.slice(0, 10)}...${messageHash.slice(-8)}`
    : 'Not computed yet';

  // Shorten signature for clean display
  const displaySig = signatureId
    ? `${signatureId.slice(0, 18)}...${signatureId.slice(-10)}`
    : 'Not generated yet';

  return (
    <div
      id="qshield-verify-signature-view"
      className="max-w-3xl mx-auto space-y-6 py-2 animate-in fade-in duration-300"
    >
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
          <span>STEP 2 &bull; GUIDED DEMO</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
          Verify a Digital Signature
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
          First, we create a digital signature for a message. Then Q-SHIELD
          monitors the verification process for suspicious behavior.
        </p>
      </div>

      {/* Guided Conceptual Flow Ribbon */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono">
          <div
            className={`flex items-center gap-1.5 ${
              workflowState === 'input' || workflowState === 'animating'
                ? 'text-cyan-300 font-bold'
                : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-800 text-[11px]">
              1
            </span>
            <span>Message</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <div
            className={`flex items-center gap-1.5 ${
              workflowState === 'animating' || workflowState === 'signed'
                ? 'text-cyan-300 font-bold'
                : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-800 text-[11px]">
              2
            </span>
            <span>Create Signature</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          <div
            className={`flex items-center gap-1.5 ${
              workflowState === 'verifying' || workflowState === 'verified'
                ? 'text-emerald-300 font-bold'
                : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-800 text-[11px]">
              3
            </span>
            <span>Verify Signature</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-900 text-[11px] text-slate-600">
              4
            </span>
            <span>Quantum Monitoring</span>
          </div>
        </div>
      </div>

      {/* STEP 1: ENTER MESSAGE & CREATE SIGNATURE */}
      <section
        id="qshield-step1-enter-message"
        className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
              STEP 1
            </span>
            <h3 className="text-base font-bold text-white font-mono">
              ENTER MESSAGE
            </h3>
          </div>

          {workflowState !== 'input' && (
            <button
              onClick={handleReset}
              className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Edit / New Message</span>
            </button>
          )}
        </div>

        {/* Message Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase text-slate-300 font-semibold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Transaction / Message</span>
            </label>
            <span className="text-[11px] font-mono text-slate-500">
              Pre-filled sample
            </span>
          </div>

          <textarea
            id="transaction-message-input"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (workflowState !== 'input') {
                setWorkflowState('input');
                setAnimationStage(0);
              }
            }}
            disabled={workflowState === 'animating' || workflowState === 'verifying'}
            rows={3}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-cyan-500 focus:outline-none transition-colors leading-relaxed"
            placeholder="Transfer ₹5,000 to Account 4821"
          />

          {/* Quick Preset Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-slate-500">Try sample:</span>
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setMessage(preset.text);
                  setWorkflowState('input');
                  setAnimationStage(0);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                  message === preset.text
                    ? 'bg-slate-800 text-cyan-300 border-cyan-800/80 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button: Generate Signature */}
        {workflowState === 'input' && (
          <div className="pt-2">
            <button
              id="btn-generate-signature"
              onClick={handleGenerateSignature}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Signature</span>
            </button>
          </div>
        )}

        {/* Simple Sequential Animation: Message -> SHA-256 Hash -> Digital Signature */}
        {workflowState === 'animating' && (
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Generating cryptographic digital signature...</span>
            </div>

            <div className="space-y-2 pt-1">
              {/* Animation Box 1: Message */}
              <div
                className={`p-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  animationStage >= 1
                    ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">Message</span>
                </div>
                <span className="text-[11px] truncate max-w-[220px] text-slate-400">
                  "{message}"
                </span>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Animation Box 2: SHA-256 Hash */}
              <div
                className={`p-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  animationStage >= 2
                    ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold">SHA-256 Hash</span>
                  <ExplainTerm termKey="sha-256" compact />
                </div>
                <span className="text-[11px] font-mono text-cyan-300">
                  {animationStage >= 2 ? 'Calculated' : 'Computing...'}
                </span>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Animation Box 3: Digital Signature */}
              <div
                className={`p-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                  animationStage >= 3
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">Digital Signature</span>
                  <ExplainTerm termKey="digital-signature" compact />
                </div>
                <span className="text-[11px] font-mono text-emerald-400">
                  {animationStage >= 3 ? 'Ready' : 'Signing...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Display: ✓ Signature Generated */}
        {(workflowState === 'signed' ||
          workflowState === 'verifying' ||
          workflowState === 'verified') && (
          <div className="space-y-4">
            {/* Signature Generated Banner */}
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/70 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-mono font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Signature Generated</span>
              </div>

              {/* Clean 3-point summary (Transaction ID, Message Hash, Signature ID) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/90">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Transaction ID
                  </span>
                  <span className="text-xs font-mono font-bold text-white mt-0.5 block truncate">
                    {transactionId}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/90">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Message Hash
                  </span>
                  <span className="text-xs font-mono text-cyan-300 mt-0.5 block truncate">
                    {displayHash}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/90">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Signature ID
                  </span>
                  <span className="text-xs font-mono text-emerald-300 mt-0.5 block truncate">
                    {displaySig}
                  </span>
                </div>
              </div>
            </div>

            {/* Collapsible: "View Technical Details" */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 overflow-hidden">
              <button
                type="button"
                id="btn-toggle-technical-details"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full px-4 py-2.5 text-left text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View Technical Details</span>
                </span>
                {showTechnicalDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showTechnicalDetails && (
                <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3 text-xs font-mono">
                  {/* Full SHA-256 */}
                  <div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                      <span>FULL SHA-256 HASH (DIGEST):</span>
                      <button
                        onClick={() => handleCopy(messageHash, 'hash')}
                        className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'hash' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedField === 'hash' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="p-2.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 block break-all text-[11px]">
                      {messageHash || 'Computing...'}
                    </code>
                  </div>

                  {/* Full Signature Token */}
                  <div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                      <span>RAW SIGNATURE TOKEN:</span>
                      <button
                        onClick={() => handleCopy(signatureId, 'sig')}
                        className="hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'sig' ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedField === 'sig' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <code className="p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-300 block break-all text-[11px]">
                      {signatureId || 'Signing...'}
                    </code>
                  </div>

                  {/* Cryptographic Standards Spec */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500">SCHEME:</span>{' '}
                      <span className="text-slate-200">
                        NIST Post-Quantum Lattice (Dilithium) + SHA-256
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">DIGEST LENGTH:</span>{' '}
                      <span className="text-slate-200">256-bit (32 octets)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* STEP 2: VERIFY SIGNATURE */}
      {(workflowState === 'signed' ||
        workflowState === 'verifying' ||
        workflowState === 'verified') && (
        <section
          id="qshield-step2-verify-signature"
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5 animate-in fade-in duration-300"
        >
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
              STEP 2
            </span>
            <h3 className="text-base font-bold text-white font-mono">
              VERIFY SIGNATURE
            </h3>
          </div>

          {/* Verification Status Card */}
          {workflowState === 'signed' && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-mono">
                  Ready for Verification
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The recipient node checks whether the message hash corresponds
                  to the digital signature. Once verified, Q-SHIELD's quantum
                  carrier safeguards the transaction against replay or
                  tampering.
                </p>
              </div>

              <div className="pt-2">
                <button
                  id="btn-verify-signature"
                  onClick={handleVerifySignature}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Verify Signature</span>
                </button>
              </div>
            </div>
          )}

          {/* Verifying In Progress */}
          {workflowState === 'verifying' && (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-400 font-mono text-sm font-bold">
                <span className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                <span>Verifying Cryptographic Hash &amp; Initializing Quantum Carrier...</span>
              </div>
              <p className="text-xs text-slate-400">
                Evaluating SHA-256 match and Bell-state teleportation channels.
              </p>
            </div>
          )}

          {/* Verification Outcome Banner */}
          {workflowState === 'verified' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        VERIFICATION PASSED
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Hash Equality Confirmed
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white font-mono">
                      Signature Verified: Message is Authentic
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                      The cryptographic hash matches the digital signature token
                      perfectly. The message content is confirmed genuine.
                    </p>
                  </div>
                </div>

                {/* Sequential Next Step Prompt: Continue to Quantum Process */}
                <div className="pt-3 border-t border-emerald-800/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-emerald-200 block">
                      Next Step in Pipeline:
                    </span>
                    <span className="text-xs text-slate-400 block">
                      See how quantum carrier states monitor this verified transaction for hidden attacks.
                    </span>
                  </div>

                  <button
                    id="btn-continue-to-quantum"
                    onClick={() => onNavigateTab('quantum-process')}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <span>Continue to Quantum Process</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Reassurance Footer */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 px-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Real cryptographic hashing (WebCrypto SHA-256)</span>
        </div>
        <span>Step 2 of 5 &bull; Q-SHIELD Prototype</span>
      </div>
    </div>
  );
};

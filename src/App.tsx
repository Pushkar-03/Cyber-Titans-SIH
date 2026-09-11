import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { HomeView } from './components/views/HomeView';
import { VerifySignatureSimpleView } from './components/views/VerifySignatureSimpleView';
import { QuantumProcessSimpleView } from './components/views/QuantumProcessSimpleView';
import { AttackSimulationSimpleView } from './components/views/AttackSimulationSimpleView';
import { SecurityResultsSimpleView } from './components/views/SecurityResultsSimpleView';
import { sessionStore } from './services/sessionStore';
import { SignatureSession, ThreatClassification } from './types/quantum';
import { ShieldCheck, Cpu } from 'lucide-react';
import { PresenterGlossaryModal } from './components/common/PresenterGlossaryModal';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [sessions, setSessions] = useState<SignatureSession[]>(() =>
    sessionStore.getAllSessions()
  );
  const [activeSession, setActiveSession] = useState<SignatureSession | null>(
    () => sessions[0] || null
  );

  // Sync state if store updates
  const refreshFromStore = () => {
    const updated = sessionStore.getAllSessions();
    setSessions(updated);
    if (activeSession) {
      const found = updated.find((s) => s.id === activeSession.id);
      if (found) setActiveSession(found);
      else setActiveSession(updated[0] || null);
    } else {
      setActiveSession(updated[0] || null);
    }
  };

  const handleSaveSession = (newSession: SignatureSession) => {
    sessionStore.saveSession(newSession);
    setActiveSession(newSession);
    refreshFromStore();
  };

  const handleUpdateSession = (updatedSession: SignatureSession) => {
    sessionStore.updateSession(updatedSession);
    setActiveSession(updatedSession);
    refreshFromStore();
  };

  const handleResetSeeds = () => {
    sessionStore.resetToSeeds();
    const fresh = sessionStore.getAllSessions();
    setSessions(fresh);
    setActiveSession(fresh[0] || null);
    setActiveTab('home');
  };

  // Determine aggregate system threat level
  let currentThreatLevel: ThreatClassification = 'LOW';
  if (sessions.some((s) => s.threatMetrics.classification === 'CRITICAL')) {
    currentThreatLevel = 'CRITICAL';
  } else if (sessions.some((s) => s.threatMetrics.classification === 'HIGH')) {
    currentThreatLevel = 'HIGH';
  } else if (sessions.some((s) => s.threatMetrics.classification === 'MEDIUM')) {
    currentThreatLevel = 'MEDIUM';
  }

  const suspiciousCount = sessions.filter(
    (s) => s.status === 'FLAGGED' || s.status === 'REJECTED' || s.status === 'QUARANTINED'
  ).length;

  const isAttackSimActive = activeSession ? activeSession.activeAttack !== 'NONE' : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Streamlined Header */}
      <Header
        currentThreatLevel={currentThreatLevel}
        activeSessionsCount={sessions.length}
        onResetSeeds={handleResetSeeds}
        onStartDemo={() => setActiveTab('verify-signature')}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
      />

      {/* 5-Section Primary Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        suspiciousCount={suspiciousCount}
        attackActive={isAttackSimActive}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'home' && (
          <HomeView
            onStartDemo={() => setActiveTab('verify-signature')}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'verify-signature' && (
          <VerifySignatureSimpleView
            activeSession={activeSession}
            onSaveSession={handleSaveSession}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'quantum-process' && (
          <QuantumProcessSimpleView
            activeSession={activeSession}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'attack-simulation' && (
          <AttackSimulationSimpleView
            activeSession={activeSession}
            onUpdateSession={handleUpdateSession}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'security-results' && (
          <SecurityResultsSimpleView
            activeSession={activeSession}
            sessions={sessions}
            onSelectSession={setActiveSession}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      {/* Presenter Explain This Glossary Modal */}
      <PresenterGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Clean, Simple Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 px-4 sm:px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-bold">Q-SHIELD</span>
            <span>&bull;</span>
            <span>SIH 2026 Interactive Security Prototype</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Deterministic Threat Engine with Gemini AI Explainability</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

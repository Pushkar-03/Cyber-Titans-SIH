import React from 'react';
import {
  SignatureSession,
  SOCEvent,
  ThreatClassification,
} from '../../types/quantum';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Radio,
  Server,
  Play,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { GlossaryTooltip } from '../common/GlossaryTooltip';

interface DashboardViewProps {
  sessions: SignatureSession[];
  events: SOCEvent[];
  onSelectSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: any) => void;
}

const ATTACK_COLORS: Record<string, string> = {
  NONE: '#06b6d4',
  REPLAY: '#f43f5e',
  TAMPERING: '#e11d48',
  MANIPULATION: '#f59e0b',
  QUANTUM_NOISE: '#eab308',
  DUPLICATION: '#a855f7',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  events,
  onSelectSession,
  onNavigateTab,
}) => {
  const totalSessions = sessions.length;
  const verifiedCount = sessions.filter((s) => s.status === 'VERIFIED').length;
  const suspiciousCount = sessions.filter((s) => s.status === 'FLAGGED').length;
  const detectedAttacks = sessions.filter(
    (s) => s.status === 'REJECTED' || s.status === 'QUARANTINED' || s.threatMetrics.overallThreatScore > 60
  ).length;

  const verifiedPercent = totalSessions > 0 ? Math.round((verifiedCount / totalSessions) * 100) : 0;

  // Most critical session for quick reference
  const latestSession = sessions[0] || null;

  // Chart data 1: Latest or average measurement distribution
  const measurementData = latestSession?.measurementDist.histogram.map((item) => ({
    state: `|${item.state}⟩`,
    Expected: item.expectedProbability * 100,
    Observed: item.observedProbability * 100,
  })) || [
    { state: '|00⟩', Expected: 25, Observed: 25.4 },
    { state: '|01⟩', Expected: 25, Observed: 24.8 },
    { state: '|10⟩', Expected: 25, Observed: 25.1 },
    { state: '|11⟩', Expected: 25, Observed: 24.7 },
  ];

  // Chart data 2: Threat score trend across recent sessions
  const trendData = [...sessions]
    .reverse()
    .slice(-10)
    .map((s, idx) => ({
      index: `#${idx + 1}`,
      sessionId: s.id.slice(0, 12),
      threatScore: s.threatMetrics.overallThreatScore,
      fidelity: Math.round(s.threatMetrics.fidelityScore * 100),
    }));

  // Chart data 3: Attack type distribution
  const attackCounts: Record<string, number> = {
    NONE: 0,
    REPLAY: 0,
    TAMPERING: 0,
    MANIPULATION: 0,
    QUANTUM_NOISE: 0,
    DUPLICATION: 0,
  };
  sessions.forEach((s) => {
    attackCounts[s.activeAttack] = (attackCounts[s.activeAttack] || 0) + 1;
  });

  const attackPieData = Object.entries(attackCounts)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      name: type === 'NONE' ? 'Clean / Authentic' : type.replace('_', ' '),
      value: count,
      key: type,
    }));

  // Current system threat level
  let currentThreatLevel: ThreatClassification = 'LOW';
  if (sessions.some((s) => s.threatMetrics.classification === 'CRITICAL')) {
    currentThreatLevel = 'CRITICAL';
  } else if (sessions.some((s) => s.threatMetrics.classification === 'HIGH')) {
    currentThreatLevel = 'HIGH';
  } else if (sessions.some((s) => s.threatMetrics.classification === 'MEDIUM')) {
    currentThreatLevel = 'MEDIUM';
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Status & Positioning */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-cyan-400 uppercase">
                Active Telemetry Stream // Epoch 2026.3
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Quantum Signature Monitoring Center
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                PROTOTYPE
              </span>
              <span className="text-xs text-cyan-400/90 font-mono">
                Quantum computation simulated for prototype demonstration.
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously comparing expected Bell-state projections against reconstructed detector outcomes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('sih-demo')}
              className="px-3.5 py-2 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start 3-Min SIH Demo</span>
            </button>
            <button
              onClick={() => onNavigateTab('signature-verification')}
              className="px-3.5 py-2 text-xs font-mono font-medium rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Verify Signature</span>
            </button>
            <button
              onClick={() => onNavigateTab('attack-simulator')}
              className="px-3.5 py-2 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Attack</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Sessions</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{totalSessions}</span>
            <span className="text-[11px] font-mono text-cyan-400">Active Nonces</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>SHA-256 + Q-Entropy</span>
            <span className="text-slate-500">100% Tracked</span>
          </div>
        </div>

        {/* Verified Signatures */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Verified Signatures</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{verifiedCount}</span>
            <span className="text-[11px] font-mono text-emerald-400/80">({verifiedPercent}%)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Deterministic Pass</span>
            <span className="text-emerald-400 font-mono">F &ge; 0.95</span>
          </div>
        </div>

        {/* Suspicious Sessions */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Suspicious Sessions</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-400">{suspiciousCount}</span>
            <span className="text-[11px] font-mono text-amber-400/80">Flagged</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Noise / Shift</span>
            <span className="text-amber-400 font-mono">Score 31-60</span>
          </div>
        </div>

        {/* Detected Attacks */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Detected Attacks</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{detectedAttacks}</span>
            <span className="text-[11px] font-mono text-rose-400/80">Blocked</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Tamper &bull; Replay</span>
            <span className="text-rose-400 font-mono">Score &gt; 60</span>
          </div>
        </div>
      </div>

      {/* Two-Column Middle Section: Measurement Distribution & Threat Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Measurement Distribution Chart */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                  <span>Measurement Distribution</span>
                  <GlossaryTooltip
                    term="Distribution Deviation"
                    definition="Compares theoretical Bell-state projective probabilities (25% each) with actual observed detector counts."
                  />
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                2048 SHOTS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active Session ({latestSession ? latestSession.id.slice(0, 15) : 'Baseline'}): Expected vs Observed counts in Bell basis.
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={measurementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="state" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="%" domain={[0, 70]} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Expected" fill="#38bdf8" fillOpacity={0.4} stroke="#38bdf8" radius={[4, 4, 0, 0]} name="Expected (25%)" />
                <Bar dataKey="Observed" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Observed %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>
              Total Variation Distance (TVD):{' '}
              <strong className="text-cyan-300">
                {latestSession?.measurementDist.totalVariationDistance ?? 0.02}
              </strong>
            </span>
            <button
              onClick={() => onNavigateTab('quantum-lab')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Explore Quantum Circuit</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Threat Score Trend */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <span>Threat Score Chronological Trend</span>
                <TrendingUp className="w-4 h-4 text-cyan-400" />
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                LAST 10 SESSIONS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-metric weighted evaluation (Fidelity, TVD, Nonce Replay, and Hash Anomaly).
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="index" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value}/100`, 'Threat Score']}
                />
                <Area
                  type="monotone"
                  dataKey="threatScore"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#threatGradient)"
                  name="Threat Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> &le;30 Low
              <span className="w-2 h-2 rounded-full bg-yellow-400" /> 31-60 Med
              <span className="w-2 h-2 rounded-full bg-rose-400" /> &gt;60 High/Crit
            </span>
            <button
              onClick={() => onNavigateTab('threat-detection')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Threat Engine</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Attack Distribution & Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Type Distribution */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800">
          <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
            <span>Attack Vector Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Proportion of monitored security scenarios.
          </p>

          <div className="h-56 mt-2 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attackPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {attackPieData.map((entry) => (
                    <Cell key={`cell-${entry.key}`} fill={ATTACK_COLORS[entry.key] || '#64748b'} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Security Events (Span 2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                <span>Recent Security Incidents &amp; Verifications</span>
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
                LIVE AUDIT TRAIL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic events emitted by quantum state tomographer and hash validator.
            </p>
          </div>

          <div className="mt-3 divide-y divide-slate-800/80 overflow-y-auto max-h-56">
            {events.map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      evt.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : evt.severity === 'WARNING'
                        ? 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {evt.eventType.replace('_', ' ')}
                  </span>
                  <div>
                    <p className="text-slate-200 font-medium">{evt.description}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-0.5">
                      <span>Node: {evt.sourceNode}</span>
                      <span>&bull;</span>
                      <span>Session: {evt.sessionId.slice(0, 14)}...</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500 shrink-0">{evt.timestamp}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">SIEM Integrations: Splunk / Elastic / Syslog RFC 5424</span>
            <button
              onClick={() => onNavigateTab('security-sessions')}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View All Sessions ({sessions.length})</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

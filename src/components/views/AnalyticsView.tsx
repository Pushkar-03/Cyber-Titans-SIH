import React, { useState } from 'react';
import { SignatureSession } from '../../types/quantum';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Zap,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { GlossaryTooltip } from '../common/GlossaryTooltip';

interface AnalyticsViewProps {
  sessions: SignatureSession[];
}

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: '#10b981',
  FLAGGED: '#eab308',
  REJECTED: '#f43f5e',
  QUARANTINED: '#a855f7',
};

const ATTACK_BAR_COLORS: Record<string, string> = {
  REPLAY: '#f43f5e',
  TAMPERING: '#e11d48',
  MANIPULATION: '#f59e0b',
  QUANTUM_NOISE: '#eab308',
  DUPLICATION: '#a855f7',
  NONE: '#06b6d4',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ sessions }) => {
  const [rangeFilter, setRangeFilter] = useState<'ALL' | 'LAST_10'>('ALL');

  const displayedSessions = rangeFilter === 'LAST_10' ? sessions.slice(0, 10) : sessions;

  // 1. Chart 1: Threat Score Chronological Trend
  const threatScoreTrend = [...displayedSessions]
    .reverse()
    .map((s, idx) => ({
      index: `#${idx + 1}`,
      sessionId: s.id.slice(0, 10),
      threatScore: s.threatMetrics.overallThreatScore,
      fidelity: Math.round(s.threatMetrics.fidelityScore * 100),
      deviation: Math.round(s.threatMetrics.distributionDeviation * 100),
    }));

  // 2. Chart 2: Attack Frequency
  const attackCounts: Record<string, number> = {
    REPLAY: 0,
    TAMPERING: 0,
    MANIPULATION: 0,
    QUANTUM_NOISE: 0,
    DUPLICATION: 0,
  };
  sessions.forEach((s) => {
    if (s.activeAttack !== 'NONE' && attackCounts[s.activeAttack] !== undefined) {
      attackCounts[s.activeAttack] += 1;
    }
  });
  const attackBarData = Object.entries(attackCounts).map(([type, count]) => ({
    type: type.replace('_', ' '),
    rawType: type,
    Incidents: count,
  }));

  // 3. Chart 3: Verification Success vs Failure Breakdown
  const statusCounts: Record<string, number> = {
    VERIFIED: 0,
    FLAGGED: 0,
    REJECTED: 0,
    QUARANTINED: 0,
  };
  sessions.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });
  const statusPieData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
    }));

  // 4. Chart 4: Fidelity vs Distribution Deviation Correlation Scatter
  const correlationData = sessions.map((s) => ({
    fidelity: parseFloat((s.threatMetrics.fidelityScore * 100).toFixed(1)),
    deviation: parseFloat((s.threatMetrics.distributionDeviation * 100).toFixed(1)),
    threatScore: s.threatMetrics.overallThreatScore,
    name: s.id.slice(0, 8),
    attack: s.activeAttack,
  }));

  // Summary Metrics
  const avgFidelity = (
    sessions.reduce((acc, s) => acc + s.threatMetrics.fidelityScore, 0) / (sessions.length || 1)
  ) * 100;

  const avgThreatScore = Math.round(
    sessions.reduce((acc, s) => acc + s.threatMetrics.overallThreatScore, 0) / (sessions.length || 1)
  );

  const totalVerified = sessions.filter((s) => s.status === 'VERIFIED').length;
  const verificationRate = sessions.length > 0 ? Math.round((totalVerified / sessions.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>SOC Telemetry &amp; Statistical Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Macro statistical trends, cross-basis correlation, and adversarial attack vector frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Time Filter:</span>
          <button
            onClick={() => setRangeFilter('ALL')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              rangeFilter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setRangeFilter('LAST_10')}
            className={`px-3 py-1 rounded-lg border transition-colors ${
              rangeFilter === 'LAST_10'
                ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Recent 10
          </button>
        </div>
      </div>

      {/* 4 Macro Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Pass Verification Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {verificationRate}%
          </div>
          <span className="text-[10px] text-slate-500">
            {totalVerified} of {sessions.length} sessions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Mean Quantum Fidelity</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 mt-2">
            {avgFidelity.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">Target threshold &ge; 95.0%</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Mean Threat Score</span>
            <Activity className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {avgThreatScore}/100
          </div>
          <span className="text-[10px] text-slate-500">Weighted statistical risk</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-slate-400 text-xs flex justify-between">
            <span>Adversarial Events</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {sessions.filter((s) => s.activeAttack !== 'NONE').length}
          </div>
          <span className="text-[10px] text-slate-500">Simulated attacks intercepted</span>
        </div>
      </div>

      {/* Grid: 4 Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Threat Score Over Time */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              <span>Threat Score Over Time</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Evolution of overall threat score across recorded verification sessions.
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={threatScoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Line
                  type="monotone"
                  dataKey="threatScore"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ fill: '#f43f5e', r: 3 }}
                  name="Threat Score (0-100)"
                />
                <Line
                  type="monotone"
                  dataKey="fidelity"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Fidelity %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attack Frequency by Vector */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              <span>Attack Frequency by Vector</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Incidents grouped by adversarial mechanism.
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attackBarData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="type" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Incidents" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {attackBarData.map((entry) => (
                    <Cell key={entry.rawType} fill={ATTACK_BAR_COLORS[entry.rawType] || '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Verification Success vs Failure */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              <span>Verification Status Distribution</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Proportion of Verified, Flagged, Rejected, and Quarantined transactions.
            </p>
          </div>

          <div className="h-64 mt-4 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#64748b'} />
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

        {/* Chart 4: Fidelity vs Deviation Correlation */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center justify-between">
              <span>Fidelity vs. Distribution Deviation Correlation</span>
              <GlossaryTooltip term="Total Variation Distance (TVD)" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Authentic sessions cluster at high fidelity (&gt;95%) and low TVD (&lt;5%). Tampering creates high deviation outliers.
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="deviation"
                  name="TVD %"
                  unit="%"
                  stroke="#64748b"
                  domain={[0, 40]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis
                  type="number"
                  dataKey="fidelity"
                  name="Fidelity %"
                  unit="%"
                  stroke="#64748b"
                  domain={[60, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <RechartsTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Scatter name="Sessions" data={correlationData} fill="#06b6d4" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  SignatureSession,
  ThreatClassification,
  SessionStatus,
} from '../../types/quantum';
import {
  Layers,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Activity,
  AlertOctagon,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';
import { GlossaryTooltip } from '../common/GlossaryTooltip';

interface SecuritySessionsViewProps {
  sessions: SignatureSession[];
  onSelectSession: (session: SignatureSession) => void;
  onNavigateTab: (tab: any) => void;
}

export const SecuritySessionsView: React.FC<SecuritySessionsViewProps> = ({
  sessions,
  onSelectSession,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectModalSession, setInspectModalSession] = useState<SignatureSession | null>(null);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.originalHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      classificationFilter === 'ALL' || s.threatMetrics.classification === classificationFilter;

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `q-shield-audit-trail-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'FLAGGED':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800';
      case 'REJECTED':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'QUARANTINED':
      default:
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
    }
  };

  const getClassBadge = (cls: ThreatClassification) => {
    switch (cls) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-800 font-bold';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-800 font-bold';
      case 'MEDIUM':
        return 'bg-yellow-950 text-yellow-300 border-yellow-800';
      case 'LOW':
      default:
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Audit Controls */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Cryptographic &amp; Quantum Session Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of all verification sessions, projective measurements, and deterministic threat verdicts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SIEM Log (JSON)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Session ID, Hash, TX ID, or Message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Risk:</span>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Risks</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="FLAGGED">FLAGGED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="QUARANTINED">QUARANTINED</option>
            </select>
          </div>

          <span className="text-slate-500 text-[11px]">
            Showing {filteredSessions.length} of {sessions.length}
          </span>
        </div>
      </div>

      {/* Main Sessions Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Session ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Message Hash (SHA-256)</th>
                <th className="p-3">Fidelity</th>
                <th className="p-3">Deviation (TVD)</th>
                <th className="p-3">Replay Risk</th>
                <th className="p-3">Threat Score</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-slate-300">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No sessions match the selected search query or risk filters.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-900/80 transition-colors group cursor-pointer"
                    onClick={() => setInspectModalSession(s)}
                  >
                    {/* Session ID */}
                    <td className="p-3 text-cyan-300 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{s.id.slice(0, 16)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(s.id, s.id);
                          }}
                          className="text-slate-500 hover:text-slate-300 transition-colors"
                          title="Copy Full Session ID"
                        >
                          {copiedId === s.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {new Date(s.timestamp).toLocaleTimeString()}
                    </td>

                    {/* Message Hash */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className="text-slate-400 group-hover:text-slate-200"
                        title={s.originalHash}
                      >
                        {s.originalHash.slice(0, 10)}...{s.originalHash.slice(-6)}
                      </span>
                    </td>

                    {/* Fidelity */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={
                          s.threatMetrics.fidelityScore >= 0.95
                            ? 'text-emerald-400'
                            : s.threatMetrics.fidelityScore >= 0.85
                            ? 'text-yellow-400'
                            : 'text-rose-400 font-bold'
                        }
                      >
                        {(s.threatMetrics.fidelityScore * 100).toFixed(1)}%
                      </span>
                    </td>

                    {/* Distribution Deviation */}
                    <td className="p-3 whitespace-nowrap text-slate-300">
                      {s.threatMetrics.distributionDeviation}
                    </td>

                    {/* Replay Risk */}
                    <td className="p-3 whitespace-nowrap">
                      {s.threatMetrics.replayRisk > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                          REPLAY (100%)
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px]">FRESH (0%)</span>
                      )}
                    </td>

                    {/* Threat Score */}
                    <td className="p-3 whitespace-nowrap font-bold text-white">
                      {s.threatMetrics.overallThreatScore}/100
                    </td>

                    {/* Classification */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] border ${getClassBadge(
                          s.threatMetrics.classification
                        )}`}
                      >
                        {s.threatMetrics.classification}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] border font-bold ${getStatusBadge(
                          s.status
                        )}`}
                      >
                        {s.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession(s);
                          onNavigateTab('threat-detection');
                        }}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                        title="Inspect in Threat Detection"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Inspection Modal */}
      {inspectModalSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative font-mono text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">
                  Session Detail: {inspectModalSession.id}
                </h3>
              </div>
              <button
                onClick={() => setInspectModalSession(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-500 text-[10px] block">MESSAGE PAYLOAD</span>
                <p className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-200 break-words font-sans text-xs">
                  {inspectModalSession.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TRANSACTION ID</span>
                  <span className="text-white font-bold">{inspectModalSession.transactionId}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">TIMESTAMP (UTC)</span>
                  <span className="text-white">{inspectModalSession.timestamp}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 text-[10px] block">ORIGINAL SHA-256 HASH</span>
                <span className="text-cyan-300 break-all">{inspectModalSession.originalHash}</span>
              </div>

              {/* Threat Engine Breakdown */}
              <div className="p-3 rounded bg-slate-950 border border-cyan-900/50 space-y-2">
                <div className="flex justify-between items-center text-slate-300 font-bold">
                  <span>Deterministic Score:</span>
                  <span className="text-white font-bold text-sm">
                    {inspectModalSession.threatMetrics.overallThreatScore}/100 [
                    {inspectModalSession.threatMetrics.classification}]
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>Fidelity: {(inspectModalSession.threatMetrics.fidelityScore * 100).toFixed(2)}%</div>
                  <div>TVD Deviation: {inspectModalSession.threatMetrics.distributionDeviation}</div>
                  <div>Replay Risk: {inspectModalSession.threatMetrics.replayRisk}%</div>
                  <div>Anomaly Score: {inspectModalSession.threatMetrics.sessionAnomalyScore}%</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  onSelectSession(inspectModalSession);
                  setInspectModalSession(null);
                  onNavigateTab('threat-detection');
                }}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
              >
                Inspect Threat Engine &rarr;
              </button>

              <button
                onClick={() => {
                  onSelectSession(inspectModalSession);
                  setInspectModalSession(null);
                  onNavigateTab('ai-security-analyst');
                }}
                className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain with Gemini AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

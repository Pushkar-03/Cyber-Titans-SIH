import React, { useState } from 'react';
import { CONCEPT_EXPLANATIONS, ConceptExplanation } from '../../data/explanations';
import { X, Search, Sparkles, BookOpen, Atom, ShieldAlert, Cpu } from 'lucide-react';

interface PresenterGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTerm?: string;
}

export const PresenterGlossaryModal: React.FC<PresenterGlossaryModalProps> = ({
  isOpen,
  onClose,
  initialTerm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const list: ConceptExplanation[] = Object.values(CONCEPT_EXPLANATIONS);

  const filtered = list.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortExplanation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono text-white">
                  &ldquo;Explain This&rdquo; Presenter Guide
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Instant Local Explanations
                </span>
              </div>
              <p className="text-xs text-slate-400">
                5–10 second non-technical explanations for presentation and judging.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/30 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search technical terms (e.g. Qubit, Bell State, Replay)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 text-[11px] font-mono">
            {[
              { id: 'all', label: 'All' },
              { id: 'quantum', label: 'Quantum' },
              { id: 'attack', label: 'Attacks' },
              { id: 'metric', label: 'Metrics' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-800 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Term Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              No matching terms found for &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <h4 className="text-sm font-bold font-mono text-white">
                      {item.term}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 uppercase">
                    {item.category}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  &ldquo;{item.shortExplanation}&rdquo;
                </p>

                {item.bulletTakeaway && (
                  <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-mono pt-1">
                    <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{item.bulletTakeaway}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>Deterministic Local Definitions &bull; 0ms Latency</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

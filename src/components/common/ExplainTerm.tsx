import React, { useState, useRef, useEffect } from 'react';
import { getExplanation, ConceptExplanation } from '../../data/explanations';
import { HelpCircle, X, Sparkles, BookOpen } from 'lucide-react';

interface ExplainTermProps {
  termKey: string;
  label?: string; // Optional custom button label, defaults to "ⓘ What does this mean?"
  compact?: boolean; // If true, shows just ⓘ icon
  inline?: boolean;
  className?: string;
}

export const ExplainTerm: React.FC<ExplainTermProps> = ({
  termKey,
  label,
  compact = false,
  inline = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const explanation: ConceptExplanation = getExplanation(termKey);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span
      ref={popoverRef}
      className={`relative ${inline ? 'inline-flex items-center' : 'block'} ${className}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title={`Explain: ${explanation.term}`}
        aria-label={`Explain ${explanation.term}`}
        className={`inline-flex items-center gap-1 text-[11px] font-mono transition-all cursor-pointer select-none rounded-lg ${
          compact
            ? 'p-1 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300'
            : 'px-2 py-0.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-slate-700/80 hover:border-cyan-500/50 shadow-sm'
        }`}
      >
        <HelpCircle className="w-3 h-3 text-cyan-400 shrink-0" />
        {!compact && (
          <span className="whitespace-nowrap font-medium">
            {label || 'ⓘ What does this mean?'}
          </span>
        )}
      </button>

      {/* Explanation Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={explanation.term}
          className="absolute z-50 left-0 sm:left-auto sm:right-0 top-full mt-1.5 w-72 sm:w-80 p-3.5 rounded-xl bg-slate-950 border border-cyan-500/50 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 text-left font-sans"
        >
          {/* Header with Term and Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                {explanation.term}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-0.5 rounded hover:bg-slate-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Short 5-10 second Explanation */}
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            &ldquo;{explanation.shortExplanation}&rdquo;
          </p>

          {/* Quick takeaway bullet if present */}
          {explanation.bulletTakeaway && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-[11px] text-cyan-300/90 font-mono">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
              <span>{explanation.bulletTakeaway}</span>
            </div>
          )}
        </div>
      )}
    </span>
  );
};

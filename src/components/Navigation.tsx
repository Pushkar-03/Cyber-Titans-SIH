import React from 'react';
import {
  Home,
  FileCheck2,
  Atom,
  Flame,
  ShieldCheck,
} from 'lucide-react';

export type NavTab = 
  | 'home'
  | 'verify-signature'
  | 'quantum-process'
  | 'attack-simulation'
  | 'security-results';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  suspiciousCount?: number;
  attackActive?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  suspiciousCount = 0,
  attackActive = false,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'home',
      label: '1. Home',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'verify-signature',
      label: '2. Verify Signature',
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      id: 'quantum-process',
      label: '3. Quantum Process',
      icon: <Atom className="w-4 h-4" />,
    },
    {
      id: 'attack-simulation',
      label: '4. Attack Simulation',
      icon: <Flame className="w-4 h-4" />,
      badge: attackActive ? 'ACTIVE' : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
    },
    {
      id: 'security-results',
      label: '5. Security Analysis',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: suspiciousCount > 0 ? `${suspiciousCount} Alerts` : undefined,
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-800',
    },
  ];

  return (
    <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur sticky top-[65px] z-30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex space-x-2 overflow-x-auto py-2.5 scrollbar-none justify-start sm:justify-center">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium rounded-xl whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                      tab.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

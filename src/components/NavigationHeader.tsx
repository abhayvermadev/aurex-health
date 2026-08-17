import React from 'react';
import { CountryData } from '../types';
import {
  Activity,
  ChevronLeft,
  Cpu,
  Pill,
  BedDouble,
  Truck,
  Radio,
  LayoutDashboard,
  Sparkles,
  Globe,
  ShieldCheck,
} from 'lucide-react';

interface NavigationHeaderProps {
  currentCountry: CountryData;
  allCountries: CountryData[];
  onSelectCountry: (countryId: string) => void;
  activeView: 'home' | 'medicines' | 'beds' | 'redistribution' | 'outbreak' | 'brics';
  onNavigateView: (view: 'home' | 'medicines' | 'beds' | 'redistribution' | 'outbreak' | 'brics') => void;
  isFederatedSyncing: boolean;
  onTriggerFederatedSync: () => void;
  federatedEpoch: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentCountry,
  activeView,
  onNavigateView,
  isFederatedSyncing,
  onTriggerFederatedSync,
  federatedEpoch,
}) => {
  const navItems = [
    { id: 'home', label: 'National Overview', icon: LayoutDashboard, badge: 'Overview' },
    { id: 'medicines', label: 'Medicine Stock & AI Forecast', icon: Pill, badge: 'Stockouts' },
    { id: 'beds', label: 'Bed & Staff Triage', icon: BedDouble, badge: 'Rosters' },
    { id: 'redistribution', label: 'Redistribution Hub', icon: Truck, badge: 'Logistics' },
    { id: 'outbreak', label: 'Outbreak Surveillance', icon: Radio, badge: 'Alerts' },
    { id: 'brics', label: 'BRICS Cross-Border Grid', icon: Globe, badge: 'Privacy AI' },
  ] as const;

  return (
    <header className="bg-white border-b-2 border-slate-200 text-slate-900 sticky top-0 z-50 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            {activeView !== 'home' && (
              <button
                id="btn-back-home"
                onClick={() => onNavigateView('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-300 cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4 text-indigo-600" />
                <span>Overview</span>
              </button>
            )}

            <div
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => onNavigateView('home')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">
                    PulseIndia
                  </span>
                  <span className="text-[11px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                    NHM & ABDM AI GRID
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  National Primary Health Centre (PHC) & CHC Supply Chain Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* National Badge */}
            <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs">
              <span className="text-lg leading-none">🇮🇳</span>
              <span className="font-bold text-slate-800 hidden sm:inline">India National Grid</span>
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {/* Federated Learning Epoch Button */}
            <button
              id="btn-federated-sync"
              onClick={onTriggerFederatedSync}
              disabled={isFederatedSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-xs text-indigo-800 font-bold transition-all cursor-pointer shadow-xs"
              title="Privacy-Preserving Federated Model Sync"
            >
              <Cpu className={`w-4 h-4 ${isFederatedSyncing ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
              <span className="hidden md:inline font-mono">Sync Epoch #{federatedEpoch}</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlighted Clean Minimalist Navigation Grid (All Options Always Visible) */}
      <div className="border-t border-slate-200 bg-slate-50/80 py-2.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <nav
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onNavigateView(item.id)}
                  className={`group relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl text-left transition-all duration-150 cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/25'
                      : 'bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-[13px] font-bold tracking-tight truncate leading-tight">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded leading-tight ${
                          isActive
                            ? 'bg-white/20 text-indigo-100'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

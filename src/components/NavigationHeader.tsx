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
    { id: 'home', label: 'National Overview', icon: LayoutDashboard },
    { id: 'medicines', label: 'Medicine Stock & AI Forecast', icon: Pill, badge: 'Stockouts' },
    { id: 'beds', label: 'Bed & Staff Triage', icon: BedDouble, badge: 'Rosters' },
    { id: 'redistribution', label: 'Redistribution Hub', icon: Truck, badge: 'Live Logistics' },
    { id: 'outbreak', label: 'Outbreak Surveillance', icon: Radio, badge: 'Alerts' },
    { id: 'brics', label: 'BRICS Cross-Border Grid', icon: Globe, badge: 'Privacy AI' },
  ] as const;

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-50 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            {activeView !== 'home' && (
              <button
                id="btn-back-home"
                onClick={() => onNavigateView('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Overview</span>
              </button>
            )}

            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => onNavigateView('home')}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-slate-900">
                    PulseIndia
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    NHM & ABDM AI Grid
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  National Primary Health Centre (PHC) & CHC Supply Chain Intelligence
                </p>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* National Badge */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-base leading-none">🇮🇳</span>
              <span className="font-semibold text-slate-800 hidden sm:inline">India National Grid</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            {/* Federated Learning Epoch Button */}
            <button
              id="btn-federated-sync"
              onClick={onTriggerFederatedSync}
              disabled={isFederatedSyncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs text-indigo-700 font-semibold transition-colors cursor-pointer"
              title="Privacy-Preserving Federated Model Sync"
            >
              <Cpu className={`w-3.5 h-3.5 ${isFederatedSyncing ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
              <span className="hidden md:inline font-mono">Sync Epoch #{federatedEpoch}</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto scrollbar-none" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onNavigateView(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/90'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

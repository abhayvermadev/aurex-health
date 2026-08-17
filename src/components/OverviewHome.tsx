import React, { useState } from 'react';
import { CountryData, StateData, Facility } from '../types';
import { FacilityReportModal } from './FacilityReportModal';
import {
  Pill,
  BedDouble,
  Truck,
  Radio,
  ArrowRight,
  Activity,
  AlertTriangle,
  Users,
  ShieldCheck,
  Globe,
  Sparkles,
  TrendingUp,
  Search,
  CheckCircle2,
  RefreshCw,
  Building2,
  MapPin,
  Flame,
  Zap,
} from 'lucide-react';

interface OverviewHomeProps {
  currentCountry: CountryData;
  onNavigate: (view: 'medicines' | 'beds' | 'redistribution' | 'outbreak' | 'brics', stateId?: string, districtId?: string, facilityId?: string) => void;
  onOpenDelegateBriefing: () => void;
  onSimulateSurge?: () => void;
  onSimulateRestock?: () => void;
}

export const OverviewHome: React.FC<OverviewHomeProps> = ({
  currentCountry,
  onNavigate,
  onOpenDelegateBriefing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSimulationToast, setActiveSimulationToast] = useState<string | null>(null);
  const [selectedFacilityForReport, setSelectedFacilityForReport] = useState<Facility | null>(null);

  // Aggregate stats across India
  const totalStates = currentCountry.states.length;
  const totalFacilities = currentCountry.states.reduce((acc, s) => acc + s.totalFacilities, 0);
  const activeStockouts = currentCountry.states.reduce((acc, s) => acc + s.activeStockoutAlerts, 0);
  const activeBedAlerts = currentCountry.states.reduce((acc, s) => acc + s.activeBedAlerts, 0);

  // Filter facilities / districts / medicines across all states for Global Search
  const searchResults = searchQuery.trim() === '' ? [] : (() => {
    const query = searchQuery.toLowerCase();
    const results: Array<{
      type: 'STATE' | 'DISTRICT' | 'FACILITY' | 'MEDICINE';
      stateId: string;
      stateName: string;
      districtId?: string;
      districtName?: string;
      facilityId?: string;
      facilityName?: string;
      title: string;
      subtitle: string;
      badge: string;
      badgeColor: string;
      targetView: 'medicines' | 'beds' | 'redistribution' | 'outbreak';
    }> = [];

    currentCountry.states.forEach((state) => {
      if (state.name.toLowerCase().includes(query)) {
        results.push({
          type: 'STATE',
          stateId: state.id,
          stateName: state.name,
          title: `${state.name} State Grid`,
          subtitle: `${state.totalDistricts} Districts • ${state.activeStockoutAlerts} Stockout Alerts`,
          badge: 'State',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          targetView: 'medicines',
        });
      }

      state.districts.forEach((district) => {
        if (district.name.toLowerCase().includes(query)) {
          results.push({
            type: 'DISTRICT',
            stateId: state.id,
            stateName: state.name,
            districtId: district.id,
            districtName: district.name,
            title: `${district.name} (${state.name})`,
            subtitle: `${district.facilities.length} Mapped PHCs/CHCs • ${district.isSurplus ? 'Surplus Depot' : 'Deficit Grid'}`,
            badge: 'District',
            badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            targetView: 'medicines',
          });
        }

        district.facilities.forEach((facility) => {
          if (facility.name.toLowerCase().includes(query) || facility.inchargeDoctor.toLowerCase().includes(query)) {
            results.push({
              type: 'FACILITY',
              stateId: state.id,
              stateName: state.name,
              districtId: district.id,
              districtName: district.name,
              facilityId: facility.id,
              facilityName: facility.name,
              title: `${facility.name}`,
              subtitle: `${facility.districtName}, ${state.name} • ${facility.inchargeDoctor}`,
              badge: facility.type,
              badgeColor: facility.medicineAlert ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200',
              targetView: 'medicines',
            });
          }

          facility.medicines.forEach((med) => {
            if (med.name.toLowerCase().includes(query) || med.category.toLowerCase().includes(query) || med.essentialDrugListCode.toLowerCase().includes(query)) {
              results.push({
                type: 'MEDICINE',
                stateId: state.id,
                stateName: state.name,
                districtId: district.id,
                districtName: district.name,
                facilityId: facility.id,
                facilityName: facility.name,
                title: `${med.name} (${med.essentialDrugListCode})`,
                subtitle: `At ${facility.name} • Stock: ${med.currentStock} ${med.unit} (${med.daysOfSupplyRemaining} days left)`,
                badge: med.status,
                badgeColor: med.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                targetView: 'medicines',
              });
            }
          });
        });
      });
    });

    return results.slice(0, 8);
  })();

  const triggerSimulation = (type: 'surge' | 'restock' | 'biometric') => {
    if (type === 'surge') {
      setActiveSimulationToast('⚡ Simulated Monsoon Epidemic Surge (+28% patient footfall & accelerated IV fluid burn rate across Western & Northern Ghats).');
    } else if (type === 'restock') {
      setActiveSimulationToast('📦 Simulated Central Medical Depot Restock (+15,000 IV Fluids, +8,000 Amoxicillin dispatched to deficit districts).');
    } else {
      setActiveSimulationToast('🏥 Biometric Duty Attendance Roster synchronized for 1,840 PHCs & CHCs (96.4% on-duty compliance).');
    }
    setTimeout(() => setActiveSimulationToast(null), 4500);
  };

  return (
    <div className="space-y-8">
      {/* Simulation Notification Toast */}
      {activeSimulationToast && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-xl shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-medium">{activeSimulationToast}</span>
          </div>
          <button
            onClick={() => setActiveSimulationToast(null)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-2 py-0.5 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. National Program Status Ribbon */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇮🇳</span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                India National Health Supply & Surveillance Grid
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              National Health Mission (NHM) & Ayushman Bharat Digital Mission (ABDM) — Real-time telemetry, predictive stockout early warnings, and automated cross-district resource redistribution across Primary Health Centres (PHCs) and Community Health Centres (CHCs).
            </p>
          </div>

          {/* Quick Delegate Briefing CTA */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-delegate-briefing"
              onClick={onOpenDelegateBriefing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>National Program Executive Briefing</span>
            </button>
          </div>
        </div>

        {/* Global Facility & Medicine Search Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search any Indian State, District, PHC/CHC (e.g. 'Pune', 'Gorakhpur', 'Khed Shivapur', 'Bhathat') or Medicine (e.g. 'Saline', 'Oxytocin', 'ASV')..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100 overflow-hidden z-20 relative">
              <div className="px-3.5 py-1.5 bg-slate-50 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Matching Search Results ({searchResults.length})
              </div>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onNavigate(item.targetView, item.stateId, item.districtId, item.facilityId);
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2.5 hover:bg-indigo-50/50 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-Time Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Monitored Facilities</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
              {totalFacilities.toLocaleString()}+
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3" /> Across {totalStates} Major States
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Critical Stockout Alerts</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-rose-600 mt-1 block">
              {activeStockouts} Alerts
            </span>
            <span className="text-[10px] text-rose-600 font-medium flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" /> &lt;48h Reserve Breached
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Bed & Staff Stress</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 mt-1 block">
              {activeBedAlerts} Centers
            </span>
            <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Triage Surge Points
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-500 font-medium block">Inter-District Balance</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-700 mt-1 block">
              4 Active Fleets
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" /> Cold-Chain Telemetry Active
            </span>
          </div>
        </div>

        {/* Live Simulation Action Buttons Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Live Scenario Simulation Controls:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerSimulation('surge')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Flame className="w-3 h-3 text-rose-600" />
              <span>Simulate Monsoon Surge</span>
            </button>
            <button
              onClick={() => triggerSimulation('restock')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Simulate Depot Restock</span>
            </button>
            <button
              onClick={() => triggerSimulation('biometric')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3 text-slate-600" />
              <span>Biometric Duty Roster Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive State Surveillance Console (Click any Indian state to drill down) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>All 36 States & UTs Health Surveillance & Rapid Inspection</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any Indian state or union territory below to inspect its districts, PHC facilities, medicine warehouses, and bed triage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 max-h-[520px] overflow-y-auto pr-1">
          {currentCountry.states.map((st) => {
            const hasStockout = st.activeStockoutAlerts > 0;
            const hasBedAlert = st.activeBedAlerts > 0;
            return (
              <div
                key={st.id}
                id={`state-card-${st.id}`}
                onClick={() => onNavigate('medicines', st.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  hasStockout
                    ? 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-md'
                    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-sm font-bold text-slate-800">{st.name}</h3>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {st.totalDistricts} Dist
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">Capital: {st.capital}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Stockouts:</span>
                    <span className={`font-mono font-bold ${hasStockout ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {hasStockout ? `${st.activeStockoutAlerts} Critical` : '✓ Adequate'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Bed Stress:</span>
                    <span className={`font-mono font-bold ${hasBedAlert ? 'text-amber-600' : 'text-slate-600'}`}>
                      {hasBedAlert ? `${st.activeBedAlerts} Alert` : 'Normal'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
                  <span>Inspect PHCs & CHCs</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. BRICS Cross-Border Health Grid & Privacy Guard Section */}
      <div
        id="box-brics-crossborder"
        onClick={() => onNavigate('brics')}
        className="group relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg hover:shadow-xl border border-indigo-500/30 hover:border-indigo-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5 text-lg">
                <span>🇮🇳</span>
                <span>🇧🇷</span>
                <span>🇿🇦</span>
                <span>🇨🇳</span>
                <span>🇷🇺</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero Raw-Data Sharing (DPDP 🇮🇳 • LGPD 🇧🇷 • POPIA 🇿🇦)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                20% Cross-Border Criteria
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors flex items-center gap-2">
              <span>BRICS Cross-Border Health Grid & Privacy-Preserving AI</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-indigo-200">Sovereign Architecture</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed max-w-4xl">
              Demonstrates realistic multi-nation operability across BRICS health systems (India's NHM, Brazil's SUS, South Africa's NHI, China's NHC, Russia's Minzdrav). Employs WHO ATC medicine standardization, Differential Privacy federated learning (ε=0.5), and zero-knowledge proofs for humanitarian aid without leaking any patient or clinic data.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Data Sovereignty</span>
              <span className="font-semibold text-emerald-400 font-mono">0 Bytes Exported</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Privacy Bound</span>
              <span className="font-semibold text-indigo-300 font-mono">ε = 0.5 (DP-SGD)</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Medicine Standard</span>
              <span className="font-semibold text-blue-300 font-mono">WHO INN / ATC Codes</span>
            </div>
            <div className="bg-white/5 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <span className="text-slate-400 block text-[10px]">Mutual Aid Corridor</span>
              <span className="font-semibold text-amber-300 font-mono">zk-SNARK Verified</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-indigo-300 group-hover:translate-x-1 transition-transform">
          <span>Explore BRICS Multi-Nation Architecture & Privacy Guarantees</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Facility Audit & Performance Report Modal */}
      {selectedFacilityForReport && (
        <FacilityReportModal
          facility={selectedFacilityForReport}
          onClose={() => setSelectedFacilityForReport(null)}
          onInitiateRestock={() => {
            setSelectedFacilityForReport(null);
            onNavigate('redistribution');
          }}
        />
      )}
    </div>
  );
};

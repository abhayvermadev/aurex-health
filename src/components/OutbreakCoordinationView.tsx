import React, { useState } from 'react';
import { OutbreakAlert, StateData } from '../types';
import {
  ShieldAlert,
  Flame,
  Radio,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Users,
  Pill,
  Clock,
  Activity,
  Globe,
  Share2,
  Zap,
} from 'lucide-react';

interface OutbreakCoordinationViewProps {
  initialOutbreaks: OutbreakAlert[];
  states: StateData[];
}

export const OutbreakCoordinationView: React.FC<OutbreakCoordinationViewProps> = ({
  initialOutbreaks,
  states,
}) => {
  const [outbreaks, setOutbreaks] = useState<OutbreakAlert[]>(initialOutbreaks);
  const [selectedOutbreakId, setSelectedOutbreakId] = useState<string>(
    initialOutbreaks[0]?.id || ''
  );

  // Scenario Simulator Form state
  const [customDisease, setCustomDisease] = useState('Monsoon Vector-Borne Spike (Dengue & Chikungunya)');
  const [customState, setCustomState] = useState('Maharashtra');
  const [customDistrict, setCustomDistrict] = useState('Pune District');
  const [customPopulation, setCustomPopulation] = useState(140000);
  const [customCases, setCustomCases] = useState(380);
  const [customSymptoms, setCustomSymptoms] = useState('High intermittent fever, severe retro-orbital headache, thrombocytopenia');

  // AI Incident Commander State
  const [isSimulating, setIsSimulating] = useState(false);
  const [commanderResponse, setCommanderResponse] = useState<any>(null);

  const selectedAlert = outbreaks.find((o) => o.id === selectedOutbreakId) || outbreaks[0];

  const handleRunIncidentSimulation = async () => {
    setIsSimulating(true);
    try {
      const response = await fetch('/api/ai/outbreak-commander', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outbreakType: customDisease,
          state: customState,
          district: customDistrict,
          affectedPopulation: customPopulation,
          reportedCases: customCases,
          primarySymptoms: customSymptoms,
        }),
      });
      const data = await response.json();
      setCommanderResponse(data);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900">
              Predictive Outbreak Surveillance & Emergency Coordination Grid
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time syndromic early-warning algorithms, surge stockout mitigation, and BRICS federated epidemic intelligence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Active Hotspots Tracked</span>
            <span className="text-rose-600 font-mono font-bold">{outbreaks.length} Critical Clusters</span>
          </div>
        </div>
      </div>

      {/* 2. Active Outbreak Alerts Carousel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {outbreaks.map((alert) => {
          const isSelected = selectedOutbreakId === alert.id;
          const isCritical = alert.severity === 'CRITICAL';

          return (
            <div
              key={alert.id}
              onClick={() => setSelectedOutbreakId(alert.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {alert.severity} SURGE
                </span>
                <span className="text-[11px] font-mono text-slate-500 font-medium">
                  Reproductive R₀: {alert.reproductiveRateEst}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">
                {alert.diseaseName}
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                {alert.districtName}, {alert.stateName}
              </p>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">7-Day Cases</span>
                  <span className="font-bold text-slate-900">+{alert.casesLast7Days}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Stock Multiplier</span>
                  <span className="font-bold text-amber-600">{alert.surgeMultiplier}x surge</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed Selected Outbreak Incident Panel */}
      {selectedAlert && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900">{selectedAlert.diseaseName}</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cluster epicentre: {selectedAlert.districtName} ({selectedAlert.affectedFacilityNames.join(', ')})
              </p>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Protocol: {selectedAlert.emergencyActionStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Required Emergency Supplies */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-2">
                Critical Supply Stockout Risk
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedAlert.criticalMedicineNeeds.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold"
                  >
                    ⚠️ {item}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-3">
                Pre-emptive buffer reserve locks activated to avoid district-wide stock depletion.
              </p>
            </div>

            {/* BRICS Federated Learning Insight */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
                  BRICS Federated Epidemiological Insight
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedAlert.federatedInsightSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Gemini AI Live Outbreak Incident Commander Simulator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Gemini AI 72-Hour Emergency Surge Coordinator
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Model: Gemini 3.7 Flash Incident Engine
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          Simulate syndromic anomalies, flash floods, or localized epidemic clusters to generate an automated 72-hour supply chain & medical staff surge protocol.
        </p>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label htmlFor="outbreak-type-input" className="block text-xs font-medium text-slate-500 mb-1">
              Outbreak Threat / Syndrome
            </label>
            <input
              id="outbreak-type-input"
              type="text"
              value={customDisease}
              onChange={(e) => setCustomDisease(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="outbreak-district-input" className="block text-xs font-medium text-slate-500 mb-1">
              Affected District & State
            </label>
            <input
              id="outbreak-district-input"
              type="text"
              value={`${customDistrict}, ${customState}`}
              onChange={(e) => setCustomDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="outbreak-cases-input" className="block text-xs font-medium text-slate-500 mb-1">
              48h Reported Cases
            </label>
            <input
              id="outbreak-cases-input"
              type="number"
              value={customCases}
              onChange={(e) => setCustomCases(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="outbreak-symptoms-input" className="block text-xs font-medium text-slate-500 mb-1">
              Primary Syndromic Signals
            </label>
            <input
              id="outbreak-symptoms-input"
              type="text"
              value={customSymptoms}
              onChange={(e) => setCustomSymptoms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          id="btn-simulate-surge"
          onClick={handleRunIncidentSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Zap className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
          <span>{isSimulating ? 'Synthesizing Incident Protocol...' : 'Run Gemini AI Surge Incident Protocol'}</span>
        </button>

        {/* AI Commander Simulation Output */}
        {commanderResponse && (
          <div className="mt-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
                  {commanderResponse.severityRating || 'TIER-2 HIGH ALERT'}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {commanderResponse.outbreakTitle}
                </h4>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 font-medium">
                <span>Est R₀: {commanderResponse.reproductiveRateEst}</span>
                <span>• Peak in ~{commanderResponse.projectedPeakDays} Days</span>
              </div>
            </div>

            {/* Recommended 72h Action Checklist */}
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-2">
                Emergency 72-Hour Response Directives:
              </span>
              <div className="space-y-2">
                {commanderResponse.recommendedActions?.map((action: string, i: number) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-2 text-slate-800 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stockout Risk Matrix */}
            {commanderResponse.stockoutRiskList && (
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-2">
                  Immediate Medicine Stockout Risk:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {commanderResponse.stockoutRiskList.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="bg-white p-3.5 rounded-xl border border-rose-200 font-mono text-[11px] shadow-xs"
                    >
                      <span className="font-semibold text-slate-900 font-sans block truncate">
                        {item.item}
                      </span>
                      <div className="flex justify-between text-slate-500 mt-1.5">
                        <span>Demand Multiplier:</span>
                        <span className="font-bold text-amber-600">{item.expectedDemandMultiplier}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 mt-0.5">
                        <span>Days Until Depleted:</span>
                        <span className="font-bold text-rose-600">{item.daysUntilExhaustion} Days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Federated Learning Insight */}
            {commanderResponse.federatedInsight && (
              <div className="bg-white p-3.5 rounded-xl border border-indigo-200 text-[11px] text-indigo-900 flex items-start gap-2 shadow-xs">
                <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>{commanderResponse.federatedInsight}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

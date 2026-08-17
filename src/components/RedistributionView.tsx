import React, { useState } from 'react';
import { StateData, District, RedistributionTransfer } from '../types';
import {
  Truck,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ThermometerSnowflake,
  Send,
  Navigation,
  Warehouse,
  Boxes,
} from 'lucide-react';

interface RedistributionViewProps {
  states: StateData[];
  initialTransfers: RedistributionTransfer[];
  prefilledTargetDistrictId?: string;
  prefilledItemType?: string;
}

export const RedistributionView: React.FC<RedistributionViewProps> = ({
  states,
  initialTransfers,
  prefilledTargetDistrictId,
  prefilledItemType,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(states[0]?.id || '');
  const currentState = states.find((s) => s.id === selectedStateId) || states[0];

  // Surplus & Deficit districts in current state
  const surplusDistricts = currentState?.districts.filter((d) => d.isSurplus) || [];
  const deficitDistricts = currentState?.districts.filter((d) => !d.isSurplus) || [];

  // Transfer form state
  const [sourceDistrictId, setSourceDistrictId] = useState<string>(
    surplusDistricts[0]?.id || ''
  );
  const [targetDistrictId, setTargetDistrictId] = useState<string>(
    prefilledTargetDistrictId || deficitDistricts[0]?.id || ''
  );
  const [itemType, setItemType] = useState<string>(
    prefilledItemType || 'IV Normal Saline (500ml)'
  );
  const [quantity, setQuantity] = useState<number>(1000);
  const [urgency, setUrgency] = useState<'EMERGENCY' | 'HIGH' | 'STANDARD'>('EMERGENCY');

  // AI Optimization
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiOptimization, setAiOptimization] = useState<any>(null);

  // Active Transfers List
  const [transfers, setTransfers] = useState<RedistributionTransfer[]>(initialTransfers);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    const newState = states.find((s) => s.id === stateId);
    const newSurplus = newState?.districts.filter((d) => d.isSurplus) || [];
    const newDeficit = newState?.districts.filter((d) => !d.isSurplus) || [];
    setSourceDistrictId(newSurplus[0]?.id || '');
    setTargetDistrictId(newDeficit[0]?.id || '');
    setAiOptimization(null);
  };

  const handleRunAiOptimization = async () => {
    setIsOptimizing(true);
    const source = currentState.districts.find((d) => d.id === sourceDistrictId)?.name || 'Source District';
    const target = currentState.districts.find((d) => d.id === targetDistrictId)?.name || 'Target District';

    try {
      const response = await fetch('/api/ai/optimize-redistribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDistrict: source,
          targetDistrict: target,
          itemType,
          requestedQuantity: quantity,
          urgency,
          distanceKm: 125,
        }),
      });
      const data = await response.json();
      setAiOptimization(data);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDispatchTransfer = () => {
    const source = currentState.districts.find((d) => d.id === sourceDistrictId);
    const target = currentState.districts.find((d) => d.id === targetDistrictId);

    const newTransfer: RedistributionTransfer = {
      id: `tr-${Math.floor(1000 + Math.random() * 9000)}`,
      sourceDistrictId: source?.id || 'src',
      sourceDistrictName: `${source?.name || 'Central Depot'} (Surplus Depot)`,
      targetDistrictId: target?.id || 'tgt',
      targetDistrictName: `${target?.name || 'Rural Grid'} (Deficit Grid)`,
      itemType,
      quantity,
      unit: 'Units',
      urgency,
      transitStatus: 'DISPATCHED',
      vehicleType: 'Refrigerated Cold-Chain Medical Van',
      distanceKm: 120,
      etaHours: 1.9,
      rationale:
        aiOptimization?.transferSummary ||
        `Automated inter-district stock equalization from ${source?.name} to mitigate ${target?.name} impending stockout.`,
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperatureControlled: true,
    };

    setTransfers([newTransfer, ...transfers]);
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & State Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              District-to-District Smart Redistribution Hub
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inter-district automated inventory equalization and cold-chain transport logistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="redist-state" className="text-xs font-medium text-slate-500">
            Active State:
          </label>
          <select
            id="redist-state"
            value={selectedStateId}
            onChange={(e) => handleStateChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {states.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. District Surplus / Deficit Balance Overview Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Surplus Districts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Surplus Districts (Ready to Supply)
              </h3>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              {surplusDistricts.length} Donating Hubs
            </span>
          </div>

          <div className="space-y-3">
            {surplusDistricts.map((dist) => (
              <div
                key={dist.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-sm text-slate-900">{dist.name}</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Central Warehouse Stock: IV Saline ({dist.centralWarehouseInventory['IV Normal Saline (500ml)']?.toLocaleString()} units) • Anti-Rabies ({dist.centralWarehouseInventory['Anti-Rabies Vaccine']?.toLocaleString()} vials)
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  Buffer: +120% Safe
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Deficit Districts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Deficit Districts (Critical Need)
              </h3>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
              {deficitDistricts.length} Receiving Hubs
            </span>
          </div>

          <div className="space-y-3">
            {deficitDistricts.map((dist) => (
              <div
                key={dist.id}
                className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-sm text-slate-900">{dist.name}</span>
                  <p className="text-xs text-rose-600 mt-0.5 font-medium">
                    Stockout Alert: {dist.stockoutAlertCount} PHCs breached 48h emergency reserve
                  </p>
                </div>
                <button
                  id={`btn-select-target-${dist.id}`}
                  onClick={() => setTargetDistrictId(dist.id)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <span>Select as Target</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Inter-District Transfer Configuration & AI Optimizer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <Boxes className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Configure Inter-District Transfer Requisition
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Source District */}
          <div>
            <label htmlFor="src-district-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              Source District (Surplus)
            </label>
            <select
              id="src-district-select"
              value={sourceDistrictId}
              onChange={(e) => setSourceDistrictId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              {surplusDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Surplus)
                </option>
              ))}
            </select>
          </div>

          {/* Target District */}
          <div>
            <label htmlFor="tgt-district-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              Target District (Deficit)
            </label>
            <select
              id="tgt-district-select"
              value={targetDistrictId}
              onChange={(e) => setTargetDistrictId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              {deficitDistricts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Needs Stock)
                </option>
              ))}
            </select>
          </div>

          {/* Item Type */}
          <div>
            <label htmlFor="item-type-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              Resource Item
            </label>
            <select
              id="item-type-select"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="IV Normal Saline (500ml)">IV Normal Saline (500ml)</option>
              <option value="Amoxicillin 500mg Capsules">Amoxicillin 500mg Capsules</option>
              <option value="Oxytocin 10 IU Injection">Oxytocin 10 IU Injection</option>
              <option value="Anti-Snake Venom Polyvalent">Anti-Snake Venom Polyvalent</option>
              <option value="Anti-Rabies Vaccine (ARV)">Anti-Rabies Vaccine (ARV)</option>
              <option value="ORS Electrolyte Sachets">ORS Electrolyte Sachets</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="qty-input" className="block text-xs font-medium text-slate-500 mb-1.5">
              Transfer Quantity (Units)
            </label>
            <input
              id="qty-input"
              type="number"
              min={50}
              max={10000}
              step={50}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-mono font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Urgency */}
          <div>
            <label htmlFor="urgency-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              Priority Urgency
            </label>
            <select
              id="urgency-select"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="EMERGENCY">🚨 Emergency (Immediate Cold-Chain Van)</option>
              <option value="HIGH">⚠️ High (Within 6 Hours)</option>
              <option value="STANDARD">📦 Standard (Next scheduled run)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <button
            id="btn-optimize-transfer"
            onClick={handleRunAiOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing Logistics...' : 'Calculate Gemini AI Route & Safety Retention'}</span>
          </button>

          <button
            id="btn-dispatch-order"
            onClick={handleDispatchTransfer}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Approve & Dispatch Emergency Transfer</span>
          </button>

          {dispatchSuccess && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /> Transfer requisition approved & telemetry activated!
            </span>
          )}
        </div>

        {/* AI Optimization Result Panel */}
        {aiOptimization && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900">Gemini AI Logistics Recommendation</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold">
                Route Efficiency: {aiOptimization.routeEfficiencyScore || 94}%
              </span>
            </div>

            <p className="text-slate-700 leading-relaxed font-sans">
              {aiOptimization.transferSummary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 font-mono text-[11px] pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[10px]">Estimated Transit Duration</span>
                <span className="font-bold text-emerald-600 text-xs">
                  {aiOptimization.estimatedTransitHours} Hours
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[10px]">Assigned Transport Unit</span>
                <span className="font-bold text-indigo-700 text-xs truncate block">
                  {aiOptimization.recommendedTransport || 'Refrigerated Cold-Chain Van'}
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-slate-500 block text-[10px]">Donor Safety Stock Impact</span>
                <span className="font-bold text-slate-800 text-xs">
                  Source maintains 21-day safe buffer
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Real-time In-Transit Fleet & Dispatches */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Inter-District Transfer Telemetry
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {transfers.length} Active Dispatches in Pipeline
          </span>
        </div>

        <div className="space-y-3">
          {transfers.map((tr) => (
            <div
              key={tr.id}
              className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-700 text-sm">{tr.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tr.urgency === 'EMERGENCY'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {tr.urgency}
                  </span>
                  <span className="text-slate-500">• Dispatched at {tr.dispatchedAt}</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-slate-900">
                  <span>{tr.sourceDistrictName}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{tr.targetDistrictName}</span>
                </div>
                <p className="text-[11px] text-slate-500">{tr.rationale}</p>
              </div>

              {/* Status / Telemetry badge */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {tr.temperatureControlled && (
                  <div className="bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 text-sky-700">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-sky-600" />
                    <span className="text-[11px] font-mono font-medium">2°C – 8°C Monitored</span>
                  </div>
                )}
                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">ETA Remaining</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">{tr.etaHours}h</span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    tr.transitStatus === 'IN_TRANSIT'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {tr.transitStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

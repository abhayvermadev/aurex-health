import React, { useState } from 'react';
import { StateData, District, Facility, MedicineStock } from '../types';
import { FacilityReportModal } from './FacilityReportModal';
import {
  Pill,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Package,
  Calendar,
  Phone,
  User,
  ArrowRight,
  ShieldAlert,
  Layers,
  Truck,
  Plus,
  Minus,
  Filter,
  Warehouse,
  Flame,
  FileText,
  MapPin,
  Building2,
} from 'lucide-react';

interface MedicineStockViewProps {
  states: StateData[];
  initialStateId?: string;
  initialDistrictId?: string;
  initialFacilityId?: string;
  onTriggerRedistribution: (targetDistrictId: string, itemType: string) => void;
}

export const MedicineStockView: React.FC<MedicineStockViewProps> = ({
  states,
  initialStateId,
  initialDistrictId,
  initialFacilityId,
  onTriggerRedistribution,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(initialStateId || states[0]?.id || '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    initialDistrictId || states[0]?.districts[0]?.id || ''
  );
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(initialFacilityId || '');
  const [selectedFacilityForReport, setSelectedFacilityForReport] = useState<Facility | null>(null);

  // Category and Status filters
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Dynamic local medicine state for interactivity (restock / consume)
  const [facilityMedicinesMap, setFacilityMedicinesMap] = useState<Record<string, MedicineStock[]>>({});

  // AI Forecast state
  const [isForecasting, setIsForecasting] = useState(false);
  const [aiForecastResult, setAiForecastResult] = useState<any>(null);
  const [forecastSeason, setForecastSeason] = useState<string>('Monsoon Vector & Waterborne Surge Period');

  const currentState = states.find((s) => s.id === selectedStateId) || states[0];
  const currentDistrict = currentState?.districts.find((d) => d.id === selectedDistrictId);
  const currentFacility = currentDistrict?.facilities.find((f) => f.id === selectedFacilityId);

  // Handle state change
  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    const targetState = states.find((s) => s.id === stateId);
    setSelectedDistrictId(targetState?.districts[0]?.id || '');
    setSelectedFacilityId('');
    setAiForecastResult(null);
  };

  // Handle district change
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedFacilityId('');
    setAiForecastResult(null);
  };

  // Handle facility selection
  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setAiForecastResult(null);
  };

  // Get live medicines for facility
  const getMedicinesForFacility = (fac: Facility) => {
    return facilityMedicinesMap[fac.id] || fac.medicines;
  };

  // Interactive Stock Simulation: Consume or Refill
  const handleModifyStock = (facilityId: string, medicineId: string, delta: number) => {
    setFacilityMedicinesMap((prev) => {
      const currentList = prev[facilityId] || currentFacility?.medicines || [];
      const updated = currentList.map((m) => {
        if (m.id === medicineId) {
          const newStock = Math.max(0, m.currentStock + delta);
          const newDays = Math.round((newStock / Math.max(1, m.dailyBurnRate)) * 10) / 10;
          let newStatus = m.status;
          if (newDays < 2) newStatus = 'CRITICAL';
          else if (newDays < 7) newStatus = 'WARNING';
          else if (newDays > 30) newStatus = 'OVERSTOCKED';
          else newStatus = 'OPTIMAL';

          return {
            ...m,
            currentStock: newStock,
            daysOfSupplyRemaining: newDays,
            status: newStatus,
          };
        }
        return m;
      });
      return { ...prev, [facilityId]: updated };
    });
  };

  // Trigger Gemini AI Demand Forecast
  const handleRunAiForecast = async () => {
    if (!currentFacility) return;
    setIsForecasting(true);
    const activeMeds = getMedicinesForFacility(currentFacility);

    try {
      const response = await fetch('/api/ai/forecast-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phcName: currentFacility.name,
          district: currentDistrict?.name,
          state: currentState?.name,
          medicines: activeMeds,
          footfallTrend: `Current daily footfall is ${currentFacility.dailyFootfall} OPD patients (+24% seasonal surge in gastro and viral fever cases)`,
          season: forecastSeason,
        }),
      });
      const data = await response.json();
      setAiForecastResult(data);
    } catch (err) {
      console.error('Forecast error:', err);
    } finally {
      setIsForecasting(false);
    }
  };

  const activeMedicines = currentFacility ? getMedicinesForFacility(currentFacility) : [];
  const filteredMedicines = activeMedicines.filter((m) => {
    const matchesCategory = categoryFilter === 'ALL' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesCategory && matchesStatus;
  });

  // Collect all critical facilities in current state for quick inspection
  const allFacilitiesInState: Array<{ district: District; facility: Facility }> = [];
  currentState?.districts.forEach((d) => {
    d.facilities.forEach((f) => {
      allFacilitiesInState.push({ district: d, facility: f });
    });
  });

  return (
    <div className="space-y-6">
      {/* 1. Drill-Down Filter Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Surveillance Drilldown Selector
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            Active Grid: {currentState.name} ({allFacilitiesInState.length} Facilities Monitored)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* State Dropdown */}
          <div>
            <label htmlFor="state-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              1. Select State / Province
            </label>
            <select
              id="state-select"
              value={selectedStateId}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.activeStockoutAlerts} Stockout Alerts)
                </option>
              ))}
            </select>
          </div>

          {/* District Dropdown */}
          <div>
            <label htmlFor="district-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              2. Select District
            </label>
            <select
              id="district-select"
              value={selectedDistrictId}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="">-- All Districts (State Level) --</option>
              {currentState?.districts.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name} {dist.stockoutAlertCount > 0 ? `(${dist.stockoutAlertCount} Alert)` : '✓ Adequate'}
                </option>
              ))}
            </select>
          </div>

          {/* PHC / CHC Dropdown */}
          <div>
            <label htmlFor="facility-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              3. Select PHC / CHC Center
            </label>
            <select
              id="facility-select"
              value={selectedFacilityId}
              disabled={!currentDistrict}
              onChange={(e) => handleFacilityChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">
                {currentDistrict
                  ? '-- Choose PHC / CHC Center --'
                  : '-- Select District First --'}
              </option>
              {currentDistrict?.facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  [{fac.type}] {fac.name} {fac.medicineAlert ? `⚠️ (${fac.medicineSeverity})` : '✓'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conditional View: If Facility is selected, show Facility Detail FIRST, followed by District Warehouse Buffer. Otherwise show Warehouse Buffer + Facility Grid */}
      {currentFacility ? (
        <div className="space-y-6">
          {/* 1. Particular PHC / CHC Detail & Medicine Stock Surveillance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      currentFacility.type === 'CHC'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    }`}
                  >
                    {currentFacility.type} Facility
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{currentFacility.name}</h2>
                  {currentFacility.medicineAlert && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold animate-pulse">
                      Stockout Alert: {currentFacility.medicineSeverity}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedFacilityForReport(currentFacility)}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Full Facility Report</span>
                  </button>
                  <button
                    onClick={() => handleFacilityChange('')}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    ← Back to {currentDistrict?.name || 'District'} Grid
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  District: {currentDistrict?.name} • Pin: {currentFacility.pinCode} • Catchment Population: {currentFacility.catchmentPopulation.toLocaleString()}
                </p>
              </div>

              {/* Incharge & Footfall Stats */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">Medical Officer In-Charge</span>
                    <span className="font-medium text-slate-800">{currentFacility.inchargeDoctor}</span>
                  </div>
                </div>
                <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <span className="text-slate-500 block text-[10px]">Daily Patient Footfall</span>
                    <span className="font-medium text-slate-800">{currentFacility.dailyFootfall} OPD Visits/Day</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medicine Inventory Grid */}
            <div className="mt-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Essential Medicine Inventory & Days of Supply (DOS)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-run-ai-forecast"
                    onClick={handleRunAiForecast}
                    disabled={isForecasting}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isForecasting ? 'animate-spin' : ''}`} />
                    <span>{isForecasting ? 'Calculating AI Forecast...' : 'Run Gemini AI 30-Day Forecast'}</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-100 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filters:
                </span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Emergency IV">Emergency IV</option>
                  <option value="Antibiotics">Antibiotics</option>
                  <option value="Maternal Health">Maternal Health</option>
                  <option value="Vaccines">Vaccines</option>
                  <option value="Pain & Fever">Pain & Fever</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CRITICAL">Critical (&lt;2 Days)</option>
                  <option value="WARNING">Warning (&lt;7 Days)</option>
                  <option value="OPTIMAL">Optimal Buffer</option>
                  <option value="OVERSTOCKED">Overstocked</option>
                </select>
              </div>

              {/* Medicine Stock Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-3.5">Medicine Name & EDL Code</th>
                      <th className="py-3 px-3.5">Category</th>
                      <th className="py-3 px-3.5">Current Stock</th>
                      <th className="py-3 px-3.5">Daily Burn Rate</th>
                      <th className="py-3 px-3.5">Days of Supply (DOS)</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 text-right">Interactive Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMedicines.map((med) => {
                      const isCritical = med.status === 'CRITICAL';
                      const isWarning = med.status === 'WARNING';

                      return (
                        <tr
                          key={med.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isCritical ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="py-3 px-3.5">
                            <div className="font-semibold text-slate-900">{med.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {med.essentialDrugListCode} • Exp: {med.batchExpiry}
                            </div>
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 font-medium">
                            {med.category}
                          </td>
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-800">
                            {med.currentStock.toLocaleString()} {med.unit}
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 font-mono">
                            ~{med.dailyBurnRate} {med.unit}/day
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                                isCritical
                                  ? 'bg-rose-100 text-rose-800'
                                  : isWarning
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {med.daysOfSupplyRemaining} Days
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                isCritical
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isWarning
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {med.status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Simulate Consume */}
                              <button
                                onClick={() => handleModifyStock(currentFacility.id, med.id, -15)}
                                title="Simulate Daily Patient Consumption (-15 units)"
                                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer text-[10px] font-bold px-1.5"
                              >
                                -15
                              </button>
                              {/* Simulate Restock */}
                              <button
                                onClick={() => handleModifyStock(currentFacility.id, med.id, 100)}
                                title="Log Emergency Buffer Delivery (+100 units)"
                                className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 cursor-pointer text-[10px] font-bold px-1.5"
                              >
                                +100
                              </button>
                              {/* Request Transfer */}
                              <button
                                onClick={() =>
                                  onTriggerRedistribution(
                                    currentDistrict?.id || '',
                                    med.name
                                  )
                                }
                                title="Request Inter-District Transfer"
                                className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold border border-indigo-200 cursor-pointer"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Transfer</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* AI Demand Forecast Output Card (if generated) */}
          {aiForecastResult && (
            <div className="bg-white border border-indigo-200 rounded-2xl p-5 sm:p-6 shadow-md animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                    Gemini AI 30-Day Demand & Stockout Forecast
                  </h3>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Confidence: 94.2%
                  </span>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    aiForecastResult.riskLevel === 'CRITICAL'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  Risk Assessment: {aiForecastResult.riskLevel}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                {aiForecastResult.forecastSummary}
              </p>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-4">
                <span className="text-[11px] uppercase font-bold text-indigo-700 block mb-1">
                  Actionable Reorder Recommendation
                </span>
                <p className="text-xs text-slate-800 font-mono">
                  {aiForecastResult.recommendedAction}
                </p>
              </div>

              {aiForecastResult.predictions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {aiForecastResult.predictions.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs"
                    >
                      <span className="font-semibold text-slate-900 block truncate">{p.name}</span>
                      <div className="flex justify-between text-slate-500 mt-1.5">
                        <span>Projected Stockout:</span>
                        <span className="font-mono text-rose-600 font-bold">
                          {p.projectedStockoutDays} Days
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500 mt-0.5">
                        <span>Safety Deficit:</span>
                        <span className="font-mono text-amber-600 font-semibold">
                          +{p.safetyStockShortfall} units needed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Below: District Central Medical Warehouse Buffer */}
          {currentDistrict && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    {currentDistrict.name} District Central Medical Warehouse Buffer
                  </h2>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border self-start sm:self-auto ${
                    currentDistrict.isSurplus
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {currentDistrict.isSurplus ? '✓ Surplus District Depot' : '⚠️ Deficit Buffer District'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3.5">
                Central depot buffer reserve at {currentDistrict.headquarters} warehouse for rapid inter-facility restocking across {currentDistrict.name}.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
                {Object.entries(currentDistrict.centralWarehouseInventory).map(([item, qty]) => (
                  <div key={item} className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-600 font-semibold block leading-tight mb-1.5">{item}</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-slate-800">
                      {qty.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">units</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* When NO facility is selected: Show Warehouse Buffer FIRST, then PHC & CHC Facility Grid */
        <div className="space-y-6">
          {/* 1. District Central Medical Warehouse Buffer */}
          {currentDistrict && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    {currentDistrict.name} District Central Medical Warehouse Buffer
                  </h2>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border self-start sm:self-auto ${
                    currentDistrict.isSurplus
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {currentDistrict.isSurplus ? '✓ Surplus District Depot' : '⚠️ Deficit Buffer District'}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3.5">
                Central depot buffer reserve at {currentDistrict.headquarters} warehouse for rapid inter-facility restocking across {currentDistrict.name}.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
                {Object.entries(currentDistrict.centralWarehouseInventory).map(([item, qty]) => (
                  <div key={item} className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 flex flex-col justify-between">
                    <span className="text-[11px] text-slate-600 font-semibold block leading-tight mb-1.5">{item}</span>
                    <span className="text-sm sm:text-base font-bold font-mono text-slate-800">
                      {qty.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">units</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. District — PHC & CHC Facility Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>
                    {selectedDistrictId && currentDistrict
                      ? `${currentDistrict.name} District — PHC & CHC Facility Grid`
                      : `${currentState.name} — District Logistics & Warehouse Hubs`}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDistrictId && currentDistrict
                    ? `Showing all ${currentDistrict.facilities.length} primary health centers and community health centers in ${currentDistrict.name}. Click any facility to inspect stock & generate AI forecasts.`
                    : `Select a district below or use the selector bar above to inspect local facility inventory.`}
                </p>
              </div>

              {selectedDistrictId && (
                <button
                  onClick={() => handleDistrictChange('')}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                >
                  ← View All {currentState.name} Districts
                </button>
              )}
            </div>

            {/* If District selected, show its facilities */}
            {selectedDistrictId && currentDistrict ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {currentDistrict.facilities.map((fac) => {
                  const isSelected = selectedFacilityId === fac.id;
                  const criticalCount = fac.medicines.filter((m) => m.status === 'CRITICAL').length;
                  return (
                    <div
                      key={fac.id}
                      id={`facility-card-${fac.id}`}
                      onClick={() => handleFacilityChange(fac.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                          : fac.medicineAlert
                          ? 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-sm'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              fac.type === 'CHC'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            }`}
                          >
                            {fac.type}
                          </span>
                          {fac.medicineAlert ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              <span>{fac.medicineSeverity} Stockout</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Adequate</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{fac.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{fac.inchargeDoctor}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{fac.contactPhone}</span>
                        </p>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Critical Drugs:</span>
                            <span className={`font-mono font-bold ${criticalCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                              {criticalCount} items &lt;48h
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Total Catalog:</span>
                            <span className="font-mono font-bold text-slate-700">{fac.medicines.length} Essential Meds</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFacilityForReport(fac);
                          }}
                          className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Full Audit</span>
                        </button>
                        <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-indigo-700' : 'text-indigo-600'}`}>
                          <span>{isSelected ? 'Active Selection' : 'Inspect Stock'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Show all Districts in State */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {currentState.districts.map((dist) => {
                  const hasAlert = dist.stockoutAlertCount > 0;
                  return (
                    <div
                      key={dist.id}
                      id={`district-card-${dist.id}`}
                      onClick={() => handleDistrictChange(dist.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        hasAlert
                          ? 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-sm'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800">{dist.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              dist.isSurplus
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {dist.isSurplus ? 'Surplus Depot' : 'Deficit Grid'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mb-3">HQ: {dist.headquarters}</p>

                        <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Monitored Facilities:</span>
                            <span className="font-mono font-bold text-slate-800">{dist.facilities.length} PHCs & CHCs</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Stockout Alerts:</span>
                            <span className={`font-mono font-bold ${hasAlert ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {hasAlert ? `${dist.stockoutAlertCount} Critical` : '✓ Adequate'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Central Depot:</span>
                            <span className="font-medium text-slate-700 truncate max-w-[150px]">{dist.centralWarehouseName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                        <span>Inspect District Facilities</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Facility Full Audit Report Modal */}
      {selectedFacilityForReport && (
        <FacilityReportModal
          facility={selectedFacilityForReport}
          onClose={() => setSelectedFacilityForReport(null)}
          onInitiateRestock={(targetDistId, medName) => {
            setSelectedFacilityForReport(null);
            onTriggerRedistribution(targetDistId, medName);
          }}
        />
      )}
    </div>
  );
};

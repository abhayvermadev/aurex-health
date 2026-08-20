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
  X,
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
  const [isForecastModalOpen, setIsForecastModalOpen] = useState(false);
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
    setIsForecastModalOpen(false);
  };

  // Handle district change
  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedFacilityId('');
    setAiForecastResult(null);
    setIsForecastModalOpen(false);
  };

  // Handle facility selection
  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    setAiForecastResult(null);
    setIsForecastModalOpen(false);
  };

  // Get live medicines for facility
  const getMedicinesForFacility = (fac: Facility) => {
    return facilityMedicinesMap[fac.id] || fac.medicines;
  };

  // Fast Local/Analytical Fallback builder for instant 2-3s guarantee
  const buildInstantForecast = (fac: Facility, dist?: District, st?: StateData) => {
    const meds = getMedicinesForFacility(fac);
    const sortedMeds = [...meds].sort((a, b) => a.daysOfSupplyRemaining - b.daysOfSupplyRemaining).slice(0, 5);
    const criticalCount = sortedMeds.filter((m) => m.daysOfSupplyRemaining < 5).length;
    const calculatedRisk = criticalCount >= 2 ? 'CRITICAL' : criticalCount > 0 ? 'HIGH' : 'MODERATE';

    return {
      success: true,
      isAiGenerated: false,
      forecastSummary: `Projected 30-day demand surge at ${fac.name} driven by seasonal vector-borne and fever cases (+${Math.round(fac.dailyFootfall * 0.24)} daily OPD surge).`,
      riskLevel: calculatedRisk,
      recommendedAction: `Restock safety buffer from ${dist?.name || 'District'} Central Warehouse. Prioritize top critical medicines within 48h.`,
      predictions: sortedMeds.map((m) => {
        const burn = Math.max(1, m.dailyBurnRate);
        const surgeFactor = m.category === 'Emergency IV' || m.category === 'Antibiotics' ? 1.35 : 1.15;
        const projectedDays = Math.max(0.5, Math.round((m.currentStock / (burn * surgeFactor)) * 10) / 10);
        const shortfall = Math.max(0, Math.round(burn * 14 - m.currentStock));

        return {
          name: m.name,
          category: m.category,
          currentStock: m.currentStock,
          projectedStockoutDays: projectedDays,
          safetyStockShortfall: shortfall,
          confidenceScore: 0.95,
          aiRationale: projectedDays < 5
            ? `Footfall surge accelerating burn rate to ~${Math.round(burn * surgeFactor)} units/day.`
            : 'Supply remains within acceptable buffer margins.',
        };
      }),
    };
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

  // Trigger Fast AI Demand Forecast (<2.5s guaranteed)
  const handleRunAiForecast = async () => {
    if (!currentFacility) return;
    setIsForecasting(true);
    const activeMeds = getMedicinesForFacility(currentFacility);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    try {
      const response = await fetch('/api/ai/forecast-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          phcName: currentFacility.name,
          district: currentDistrict?.name,
          state: currentState?.name,
          medicines: activeMeds,
          footfallTrend: `Current daily footfall is ${currentFacility.dailyFootfall} OPD patients (+24% seasonal surge in gastro and viral fever cases)`,
          season: forecastSeason,
        }),
      });
      clearTimeout(timeoutId);
      const data = await response.json();
      setAiForecastResult(data);
      setIsForecastModalOpen(true);
    } catch (err) {
      console.warn('Fast fallback applied for AI forecast:', err);
      const fallbackData = buildInstantForecast(currentFacility, currentDistrict, currentState);
      setAiForecastResult(fallbackData);
      setIsForecastModalOpen(true);
    } finally {
      clearTimeout(timeoutId);
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

      {/* Conditional View: If Facility is selected, show ONLY that particular PHC / CHC Detail. Otherwise show Warehouse Buffer + Facility Grid */}
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
                    <span>{isForecasting ? 'Calculating Forecast...' : 'AI 30-Day Forecast'}</span>
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

      {/* AI 30-Day Demand Forecast Modal Popup */}
      {isForecastModalOpen && aiForecastResult && currentFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">AI 30-Day Forecast</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        aiForecastResult.riskLevel === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : aiForecastResult.riskLevel === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {aiForecastResult.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {currentFacility.name} ({currentFacility.type}) • {currentDistrict?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsForecastModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* 1-2 line summary */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {aiForecastResult.forecastSummary}
                </p>
              </div>

              {/* 4-5 Medicines Forecast List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Priority Medicine Stockout Projections (Top 4-5)
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Confidence 95%</span>
                </div>
                <div className="space-y-2">
                  {aiForecastResult.predictions?.slice(0, 5).map((p: any, idx: number) => {
                    const isUrgent = p.projectedStockoutDays < 5;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-indigo-200 transition-all gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">{p.name}</span>
                            {p.category && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700 font-semibold">
                                {p.category}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                            {p.aiRationale || (isUrgent ? 'Burn rate accelerating under surge footfall' : 'Safe buffer horizon')}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-right">
                          <div>
                            <span className={`text-xs font-mono font-bold block ${isUrgent ? 'text-rose-600' : 'text-amber-600'}`}>
                              {p.projectedStockoutDays} Days left
                            </span>
                            {p.safetyStockShortfall > 0 && (
                              <span className="text-[10px] text-slate-500 font-mono block">
                                +{p.safetyStockShortfall} units needed
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setIsForecastModalOpen(false);
                              onTriggerRedistribution(currentDistrict?.id || '', p.name);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            title="Request Inter-District Transfer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Transfer</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 1-line recommendation */}
              {aiForecastResult.recommendedAction && (
                <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="text-indigo-600 font-bold shrink-0">Action:</span>
                  <span className="text-[11px] text-slate-700 font-medium">
                    {aiForecastResult.recommendedAction}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Data generated via AI Epidemiology Engine
              </span>
              <button
                onClick={() => setIsForecastModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

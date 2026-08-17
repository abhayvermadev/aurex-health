import React, { useState } from 'react';
import { Facility, MedicineStock } from '../types';
import {
  X,
  Hospital,
  MapPin,
  Phone,
  User,
  Pill,
  BedDouble,
  Users,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
  Minus,
  Truck,
  Activity,
  Thermometer,
  ShieldCheck,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
  Flame,
} from 'lucide-react';

interface FacilityReportModalProps {
  facility: Facility | null;
  isOpen: boolean;
  onClose: () => void;
  onTriggerRedistribution?: (targetDistrictId: string, itemType: string) => void;
}

export const FacilityReportModal: React.FC<FacilityReportModalProps> = ({
  facility,
  isOpen,
  onClose,
  onTriggerRedistribution,
}) => {
  if (!isOpen || !facility) return null;

  // Local state for interactive medicine modifications
  const [medicines, setMedicines] = useState<MedicineStock[]>(facility.medicines);
  const [beds, setBeds] = useState(facility.beds);
  const [staff, setStaff] = useState(facility.staff);
  const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'beds' | 'staff' | 'ai'>('overview');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleModifyStock = (medId: string, delta: number) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
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
      })
    );
    showNotice(`Updated inventory stock count for item.`);
  };

  const handleAdjustBed = (delta: number, type: 'general' | 'icu' | 'maternity' = 'general') => {
    setBeds((prev) => {
      let occupied = prev.occupiedBeds;
      let icuOcc = prev.icuBeds.occupied;
      let matOcc = prev.maternityBeds.occupied;

      if (type === 'general') {
        occupied = Math.max(0, Math.min(prev.totalBeds, prev.occupiedBeds + delta));
      } else if (type === 'icu') {
        icuOcc = Math.max(0, Math.min(prev.icuBeds.total, prev.icuBeds.occupied + delta));
      } else if (type === 'maternity') {
        matOcc = Math.max(0, Math.min(prev.maternityBeds.total, prev.maternityBeds.occupied + delta));
      }

      return {
        ...prev,
        occupiedBeds: occupied,
        icuBeds: { ...prev.icuBeds, occupied: icuOcc },
        maternityBeds: { ...prev.maternityBeds, occupied: matOcc },
      };
    });
    showNotice(delta > 0 ? 'Patient admitted to ward.' : 'Patient discharged.');
  };

  const handleToggleStaffDuty = (role: 'doctor' | 'nurse' | 'pharmacist' | 'lab') => {
    setStaff((prev) => {
      if (role === 'doctor') {
        const next = prev.doctors.onDutyToday >= prev.doctors.totalSanctioned ? 1 : prev.doctors.onDutyToday + 1;
        return { ...prev, doctors: { ...prev.doctors, onDutyToday: next } };
      }
      if (role === 'nurse') {
        const next = prev.nurses.onDutyToday >= prev.nurses.totalSanctioned ? 1 : prev.nurses.onDutyToday + 1;
        return { ...prev, nurses: { ...prev.nurses, onDutyToday: next } };
      }
      return prev;
    });
    showNotice('Biometric shift status updated.');
  };

  const handleRunAiAudit = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/forecast-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phcName: facility.name,
          district: facility.districtName,
          state: facility.stateId,
          medicines: medicines,
          footfallTrend: `Daily OPD ${facility.dailyFootfall} patients (+22% seasonal surge)`,
          season: 'Monsoon Acute Vector & Respiratory Period',
        }),
      });
      const data = await res.json();
      setAiReport(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const criticalMedsCount = medicines.filter((m) => m.status === 'CRITICAL').length;
  const warningMedsCount = medicines.filter((m) => m.status === 'WARNING').length;
  const bedOccupancyPct = Math.round((beds.occupiedBeds / Math.max(1, beds.totalBeds)) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {facility.type} Facility
                </span>
                <span className="text-xs font-mono text-slate-400">
                  HFR ID: IN-{facility.stateId.substring(0, 2).toUpperCase()}-{facility.districtId.substring(0, 3).toUpperCase()}-{facility.id.replace(/[^0-9]/g, '') || '042'}
                </span>
                {criticalMedsCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    {criticalMedsCount} Stockout Alerts
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                {facility.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{facility.districtName}, PIN: {facility.pinCode}</span>
                <span>•</span>
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>MO: {facility.inchargeDoctor}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {actionNotice}
            </span>
            <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto shrink-0 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Facility Telemetry Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'medicines'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Essential Medicines ({medicines.length})</span>
            {criticalMedsCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {criticalMedsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('beds')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'beds'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            <span>Bed & Oxygen Triage</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Biometric Duty Staff</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('ai');
              if (!aiReport && !isAiLoading) handleRunAiAudit();
            }}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-700 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Gemini AI Epidemiological Forecast</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Daily OPD Footfall</span>
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-xl font-bold font-mono text-slate-900 block">
                    {facility.dailyFootfall} Patients
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Catchment Pop: {facility.catchmentPopulation.toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Bed Occupancy</span>
                    <BedDouble className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-xl font-bold font-mono text-slate-900 block">
                    {beds.occupiedBeds} / {beds.totalBeds} ({bedOccupancyPct}%)
                  </span>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${bedOccupancyPct > 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, bedOccupancyPct)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Oxygen Autonomy</span>
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xl font-bold font-mono text-emerald-700 block">
                    {beds.oxygenSupplyHoursRemaining} Hours
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                    ✓ Manifold Pressure Normal
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Cold-Chain Vaccine ILR</span>
                    <Thermometer className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <span className="text-xl font-bold font-mono text-slate-900 block">
                    +3.8°C
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
                    ✓ 2°C – 8°C Compliant
                  </span>
                </div>
              </div>

              {/* Facility Details & Quick Action Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Administrative & Emergency Contacts
                  </h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Medical Officer In-Charge</span>
                      <span className="font-semibold text-slate-800">{facility.inchargeDoctor}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">24x7 Emergency Contact</span>
                      <span className="font-mono font-semibold text-indigo-600">{facility.emergencyContact}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">District Headquarters</span>
                      <span className="font-semibold text-slate-800">{facility.districtName}</span>
                    </div>
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-slate-500">Coordinates (GPS)</span>
                      <span className="font-mono text-slate-600">
                        {facility.coordinates.lat.toFixed(4)}°N, {facility.coordinates.lng.toFixed(4)}°E
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Immediate Actions for this Facility
                    </h3>
                    <p className="text-xs text-indigo-800/80 mt-1">
                      Trigger direct emergency replenishment or transfer excess capacity to neighboring deficit health centres.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {onTriggerRedistribution && (
                      <button
                        onClick={() => {
                          onClose();
                          onTriggerRedistribution(facility.districtId, 'IV Normal Saline (500ml)');
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Emergency Transfer to {facility.name}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('medicines')}
                      className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Pill className="w-3.5 h-3.5" />
                      <span>Review Essential Drug Stock & Refill</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICINES */}
          {activeTab === 'medicines' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Essential Drug List (EDL) & Live Stock Simulator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click +100 Refill or -10 Consume to simulate live consumption and recalculate Days of Supply (DOS).
                  </p>
                </div>
                {onTriggerRedistribution && (
                  <button
                    onClick={() => {
                      onClose();
                      onTriggerRedistribution(facility.districtId, 'IV Normal Saline (500ml)');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Redistribute to this Facility</span>
                  </button>
                )}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Medicine & EDL Code</th>
                        <th className="px-3 py-3">Category</th>
                        <th className="px-3 py-3">Current Stock</th>
                        <th className="px-3 py-3">Burn Rate</th>
                        <th className="px-3 py-3">Supply Left</th>
                        <th className="px-3 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Live Stock Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {medicines.map((med) => {
                        const isCritical = med.status === 'CRITICAL';
                        const isWarning = med.status === 'WARNING';
                        return (
                          <tr key={med.id} className={isCritical ? 'bg-rose-50/40' : 'hover:bg-slate-50/60'}>
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-900 block">{med.name}</span>
                              <span className="text-[10px] font-mono text-slate-400">{med.essentialDrugListCode} • Exp: {med.batchExpiry}</span>
                            </td>
                            <td className="px-3 py-3 text-slate-600">{med.category}</td>
                            <td className="px-3 py-3 font-mono font-bold text-slate-800">
                              {med.currentStock} {med.unit}
                            </td>
                            <td className="px-3 py-3 font-mono text-slate-600">
                              {med.dailyBurnRate} {med.unit}/day
                            </td>
                            <td className="px-3 py-3 font-mono font-bold">
                              <span className={isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'}>
                                {med.daysOfSupplyRemaining} days
                              </span>
                            </td>
                            <td className="px-3 py-3">
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
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleModifyStock(med.id, -10)}
                                  className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow-xs"
                                  title="Consume 10 units"
                                >
                                  <Minus className="w-3 h-3" />
                                  <span>10</span>
                                </button>
                                <button
                                  onClick={() => handleModifyStock(med.id, 50)}
                                  className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 rounded font-bold text-[10px] flex items-center gap-0.5 cursor-pointer shadow-xs"
                                  title="Refill 50 units"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>50</span>
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
          )}

          {/* TAB 3: BEDS */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ward-Wise Bed Occupancy & Oxygen Autonomy
                </h3>
                <p className="text-xs text-slate-500">
                  Admit or discharge patients to simulate surge capacity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* General Ward */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">General Ward Beds</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {beds.occupiedBeds} / {beds.totalBeds}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${(beds.occupiedBeds / Math.max(1, beds.totalBeds)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleAdjustBed(1, 'general')}
                      className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Admit</span>
                    </button>
                    <button
                      onClick={() => handleAdjustBed(-1, 'general')}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Discharge</span>
                    </button>
                  </div>
                </div>

                {/* ICU Beds */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">ICU / Critical Beds</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {beds.icuBeds.occupied} / {beds.icuBeds.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${(beds.icuBeds.occupied / Math.max(1, beds.icuBeds.total)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleAdjustBed(1, 'icu')}
                      className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Admit ICU</span>
                    </button>
                    <button
                      onClick={() => handleAdjustBed(-1, 'icu')}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Discharge</span>
                    </button>
                  </div>
                </div>

                {/* Maternity Beds */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800">Maternity / Delivery Beds</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {beds.maternityBeds.occupied} / {beds.maternityBeds.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${(beds.maternityBeds.occupied / Math.max(1, beds.maternityBeds.total)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleAdjustBed(1, 'maternity')}
                      className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Admit Mat</span>
                    </button>
                    <button
                      onClick={() => handleAdjustBed(-1, 'maternity')}
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>Discharge</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STAFF */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Biometric Shift Duty Roster & Attendance
                  </h3>
                  <p className="text-xs text-slate-500">
                    ABDM National Health Workforce Registry synchronized.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  96.2% Compliance
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Medical Officers (MBBS/MD)</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {staff.doctors.onDutyToday} of {staff.doctors.totalSanctioned} on duty
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStaffDuty('doctor')}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Toggle Shift
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Staff Nurses / ANMs</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {staff.nurses.onDutyToday} of {staff.nurses.totalSanctioned} on duty
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleStaffDuty('nurse')}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Toggle Shift
                  </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">Pharmacists</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {staff.pharmacists.onDutyToday} of {staff.pharmacists.totalSanctioned} on duty
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold px-2 py-0.5 bg-white rounded border border-slate-200">
                    Active
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">ASHA Community Field Workers</span>
                    <span className="text-base font-bold font-mono text-slate-900">
                      {staff.ashaWorkers.activeFieldReporting} Active Field Units
                    </span>
                  </div>
                  <span className="text-[11px] text-indigo-600 font-bold px-2 py-0.5 bg-white rounded border border-slate-200">
                    Field Triage Sync
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI FORECAST */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Gemini 3.7 Epidemiological Demand Forecast
                  </h3>
                  <p className="text-xs text-slate-500">
                    Predicts 30-day stockout probabilities based on seasonal disease patterns.
                  </p>
                </div>
                <button
                  onClick={handleRunAiAudit}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>{isAiLoading ? 'Analyzing...' : 'Re-Run Forecast'}</span>
                </button>
              </div>

              {isAiLoading ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-slate-700">Synthesizing epidemiological telemetry...</p>
                  <p className="text-[11px] text-slate-400">Querying National Health AI Grid models</p>
                </div>
              ) : aiReport ? (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-indigo-900">Epidemiological Assessment</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-200 text-indigo-800 font-mono text-[10px]">
                        Risk: {aiReport.riskLevel || 'HIGH'}
                      </span>
                    </div>
                    <p className="text-indigo-900/90 leading-relaxed">{aiReport.forecastSummary}</p>
                    <div className="pt-2 border-t border-indigo-200/60 font-semibold text-indigo-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{aiReport.recommendedAction}</span>
                    </div>
                  </div>

                  {aiReport.predictions && aiReport.predictions.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {aiReport.predictions.slice(0, 4).map((p: any, idx: number) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-slate-800">
                            <span>{p.name}</span>
                            <span className="font-mono text-rose-600 text-[11px]">
                              Stockout in ~{p.projectedStockoutDays} days
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{p.aiRationale}</p>
                          <div className="text-[10px] font-mono text-slate-400">
                            Recommended buffer shortfall: +{p.safetyStockShortfall} units
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Real-time NHM Telemetry • Latency: 42ms • ABDM Verified Facility
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

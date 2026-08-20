import React, { useState } from 'react';
import { StateData, District, Facility } from '../types';
import { FacilityReportModal } from './FacilityReportModal';
import {
  BedDouble,
  Users,
  AlertTriangle,
  CheckCircle2,
  Activity,
  HeartPulse,
  Baby,
  Wind,
  ShieldCheck,
  Sparkles,
  Layers,
  Clock,
  Fingerprint,
  Plus,
  Minus,
  ArrowRight,
  UserCheck,
  Building2,
  RefreshCw,
  FileText,
  MapPin,
} from 'lucide-react';

interface BedStaffViewProps {
  states: StateData[];
  initialStateId?: string;
  initialDistrictId?: string;
  initialFacilityId?: string;
}

export const BedStaffView: React.FC<BedStaffViewProps> = ({
  states,
  initialStateId,
  initialDistrictId,
  initialFacilityId,
}) => {
  const [selectedStateId, setSelectedStateId] = useState<string>(initialStateId || states[0]?.id || '');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId || '');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(initialFacilityId || '');
  const [selectedFacilityForReport, setSelectedFacilityForReport] = useState<Facility | null>(null);

  // Local state for interactive bed capacity and staff attendance
  const [bedOverrides, setBedOverrides] = useState<Record<string, { occupied: number; icuOccupied: number; maternityOccupied: number }>>({});
  const [staffOverrides, setStaffOverrides] = useState<Record<string, { doctorsOnDuty: number; syncTime: string }>>({});

  const currentState = states.find((s) => s.id === selectedStateId) || states[0];
  const currentDistrict = currentState?.districts.find((d) => d.id === selectedDistrictId);
  const currentFacility = currentDistrict?.facilities.find((f) => f.id === selectedFacilityId);

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    setSelectedDistrictId('');
    setSelectedFacilityId('');
  };

  const handleDistrictChange = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedFacilityId('');
  };

  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
  };

  // Interactive bed occupancy adjustments
  const handleAdjustBed = (facId: string, delta: number, type: 'general' | 'icu' | 'maternity' = 'general') => {
    if (!currentFacility) return;
    setBedOverrides((prev) => {
      const current = prev[facId] || {
        occupied: currentFacility.beds.occupiedBeds,
        icuOccupied: currentFacility.beds.icuBeds.occupied,
        maternityOccupied: currentFacility.beds.maternityBeds.occupied,
      };

      let newOccupied = current.occupied;
      let newIcu = current.icuOccupied;
      let newMat = current.maternityOccupied;

      if (type === 'general') {
        newOccupied = Math.max(0, Math.min(currentFacility.beds.totalBeds, current.occupied + delta));
      } else if (type === 'icu') {
        newIcu = Math.max(0, Math.min(currentFacility.beds.icuBeds.total, current.icuOccupied + delta));
      } else if (type === 'maternity') {
        newMat = Math.max(0, Math.min(currentFacility.beds.maternityBeds.total, current.maternityOccupied + delta));
      }

      return {
        ...prev,
        [facId]: { occupied: newOccupied, icuOccupied: newIcu, maternityOccupied: newMat },
      };
    });
  };

  // Toggle Doctor on duty
  const handleToggleDoctorDuty = (facId: string) => {
    if (!currentFacility) return;
    setStaffOverrides((prev) => {
      const current = prev[facId] || {
        doctorsOnDuty: currentFacility.staff.doctors.onDutyToday,
        syncTime: 'Just now',
      };
      const total = currentFacility.staff.doctors.totalSanctioned;
      const nextDuty = current.doctorsOnDuty >= total ? Math.max(1, total - 1) : total;
      return {
        ...prev,
        [facId]: { doctorsOnDuty: nextDuty, syncTime: 'Updated just now' },
      };
    });
  };

  // All facilities in state for list view
  const allFacilitiesInState: Array<{ district: District; facility: Facility }> = [];
  currentState?.districts.forEach((d) => {
    d.facilities.forEach((f) => {
      allFacilitiesInState.push({ district: d, facility: f });
    });
  });

  const liveBedData = currentFacility
    ? bedOverrides[currentFacility.id] || {
        occupied: currentFacility.beds.occupiedBeds,
        icuOccupied: currentFacility.beds.icuBeds.occupied,
        maternityOccupied: currentFacility.beds.maternityBeds.occupied,
      }
    : null;

  const liveStaffData = currentFacility
    ? staffOverrides[currentFacility.id] || {
        doctorsOnDuty: currentFacility.staff.doctors.onDutyToday,
        syncTime: currentFacility.lastUpdated,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* 1. Selector Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Clinical Bed & Staff Attendance Selector
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            Active State: {currentState.name} ({currentState.activeBedAlerts} Bed Overload Alerts)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label htmlFor="bed-state-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              1. Select State / Province
            </label>
            <select
              id="bed-state-select"
              value={selectedStateId}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.activeBedAlerts} Bed/Staff Pressure Alerts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bed-district-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              2. Select District
            </label>
            <select
              id="bed-district-select"
              value={selectedDistrictId}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
            >
              <option value="">-- All Districts (State Map & Triage View) --</option>
              {currentState?.districts.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name} {dist.bedStressCount > 0 ? `(${dist.bedStressCount} Overload Alert)` : '✓ Available'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bed-facility-select" className="block text-xs font-medium text-slate-500 mb-1.5">
              3. Select PHC / CHC Facility
            </label>
            <select
              id="bed-facility-select"
              value={selectedFacilityId}
              disabled={!currentDistrict}
              onChange={(e) => handleFacilityChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="">
                {currentDistrict
                  ? '-- Choose PHC / CHC (or click node on map) --'
                  : '-- Select District First --'}
              </option>
              {currentDistrict?.facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  [{fac.type}] {fac.name} {fac.bedAlert ? `⚠️ (Bed Overload)` : '✓'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. District & Facility Bed Triage Directory (Only shown when NO facility is selected) */}
      {!currentFacility && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>
                {selectedDistrictId && currentDistrict
                  ? `${currentDistrict.name} — PHC/CHC Bed & Staff Directory`
                  : `${currentState.name} — District Bed Capacity & Staff Rosters`}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {selectedDistrictId && currentDistrict
                ? `Inspect real-time bed occupancy, ICU reserve, oxygen supply, and biometric doctor duty attendance in ${currentDistrict.name}.`
                : `Select a district below to inspect individual clinic bed availability and staff attendance.`}
            </p>
          </div>

          {selectedDistrictId && (
            <button
              onClick={() => handleDistrictChange('')}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
            >
              ← Back to All {currentState.name} Districts
            </button>
          )}
        </div>

        {/* If District selected, show its facilities */}
        {selectedDistrictId && currentDistrict ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {currentDistrict.facilities.map((fac) => {
              const isSelected = selectedFacilityId === fac.id;
              const totalBeds = fac.beds?.totalBeds || 0;
              const occupiedBeds = fac.beds?.occupiedBeds || 0;
              const freeBeds = Math.max(0, totalBeds - occupiedBeds);
              const bedRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
              const icuOccupied = fac.beds?.icuBeds?.occupied || 0;
              const icuTotal = fac.beds?.icuBeds?.total || 0;
              const oxygenHours = fac.beds?.oxygenSupplyHoursRemaining || 0;
              const doctorsOnDuty = fac.staff?.doctors?.onDutyToday || 0;
              const doctorsTotal = fac.staff?.doctors?.totalSanctioned || 0;

              return (
                <div
                  key={fac.id}
                  id={`bed-facility-card-${fac.id}`}
                  onClick={() => handleFacilityChange(fac.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                      : fac.bedAlert
                      ? 'bg-white border-rose-200 hover:border-rose-400 hover:shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {fac.type}
                      </span>
                      {fac.bedAlert ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{fac.bedSeverity} Pressure</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>{freeBeds} Beds Free</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{fac.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Lead: {fac.inchargeDoctor}</p>

                    {/* Bed occupancy bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Bed Occupancy:</span>
                        <span className={`font-mono font-bold ${bedRate > 85 ? 'text-rose-600' : 'text-slate-700'}`}>
                          {bedRate}% ({freeBeds} / {totalBeds} free)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            bedRate > 90 ? 'bg-rose-500' : bedRate > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(bedRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-3 gap-1.5 text-center text-xs">
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-[10px] text-slate-400 block">ICU Beds</span>
                        <span className="font-bold text-slate-700">{icuOccupied}/{icuTotal}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-[10px] text-slate-400 block">O₂ Supply</span>
                        <span className="font-bold text-slate-700">{oxygenHours}h</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-[10px] text-slate-400 block">MD Duty</span>
                        <span className="font-bold text-emerald-600">{doctorsOnDuty}/{doctorsTotal}</span>
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
                      <span>Facility Audit</span>
                    </button>
                    <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-indigo-700' : 'text-indigo-600'}`}>
                      <span>{isSelected ? 'Active Selection' : 'Inspect Triage'}</span>
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
              const hasAlert = dist.bedStressCount > 0;
              return (
                <div
                  key={dist.id}
                  id={`bed-district-card-${dist.id}`}
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
                          hasAlert
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {hasAlert ? `${dist.bedStressCount} Overload Alert` : '✓ Capacity Stable'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3">HQ: {dist.headquarters}</p>

                    <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Monitored Facilities:</span>
                        <span className="font-mono font-bold text-slate-800">{dist.facilities.length} PHCs & CHCs</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Surplus Status:</span>
                        <span className="font-medium text-slate-700">{dist.isSurplus ? 'Surplus Reserve Depot' : 'Rural Deficit Network'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600">
                    <span>Inspect District Triage & Roster</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* State Clinical Centers Overview if no district is selected */}
      {!selectedDistrictId && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {currentState.name} Clinical Centers & Bed Stress Points ({allFacilitiesInState.length} Facilities)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any facility to view bed allocation, admit/discharge patients, and review biometric staff duty attendance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allFacilitiesInState.map(({ district, facility }) => {
              const isAlert = facility.bedAlert;
              return (
                <div
                  key={facility.id}
                  onClick={() => {
                    setSelectedDistrictId(district.id);
                    setSelectedFacilityId(facility.id);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isAlert
                      ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400 hover:shadow-md'
                      : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {facility.type}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-700">
                      {facility.beds.occupiedBeds}/{facility.beds.totalBeds} Beds ({Math.round((facility.beds.occupiedBeds / facility.beds.totalBeds) * 100)}%)
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{facility.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {district.name} • {facility.inchargeDoctor}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-600">
                    <span>Inspect Triage & Roster</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )}

      {/* 3. Facility Detail: Bed Availability & Staff Biometric Grid (Shown ONLY when facility is selected) */}
      {currentFacility && liveBedData && liveStaffData && (
        <div className="space-y-6">
          {/* Top Status Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <button
                    onClick={() => handleFacilityChange('')}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200 transition-colors cursor-pointer"
                  >
                    ← Back to {currentDistrict ? `${currentDistrict.name} Directory` : 'District Directory'}
                  </button>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {currentFacility.type}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{currentFacility.name}</h2>
                  {currentFacility.bedAlert && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold animate-pulse">
                      Triage Alert: {currentFacility.bedSeverity} Pressure
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedFacilityForReport(currentFacility)}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Full Facility Report</span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  District: {currentDistrict?.name} • Pin: {currentFacility.pinCode} • Emergency Duty Doctor: {currentFacility.inchargeDoctor}
                </p>
              </div>

              {/* Quick Bed Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAdjustBed(currentFacility.id, 1, 'general')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Admit Patient</span>
                </button>
                <button
                  onClick={() => handleAdjustBed(currentFacility.id, -1, 'general')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 border border-slate-200 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Discharge</span>
                </button>
              </div>
            </div>

            {/* Bed Capacity Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-5">
              {/* Total Beds */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">Total Beds Occupied</span>
                  <BedDouble className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {liveBedData.occupied} / {currentFacility.beds.totalBeds}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      liveBedData.occupied / currentFacility.beds.totalBeds > 0.85 ? 'bg-rose-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, (liveBedData.occupied / currentFacility.beds.totalBeds) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* ICU Beds */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">ICU / Critical Beds</span>
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {liveBedData.icuOccupied} / {currentFacility.beds.icuBeds.total}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${
                        currentFacility.beds.icuBeds.total > 0
                          ? (liveBedData.icuOccupied / currentFacility.beds.icuBeds.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Maternity Beds */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">Maternity / Delivery</span>
                  <Baby className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {liveBedData.maternityOccupied} / {currentFacility.beds.maternityBeds.total}
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{
                      width: `${
                        currentFacility.beds.maternityBeds.total > 0
                          ? (liveBedData.maternityOccupied / currentFacility.beds.maternityBeds.total) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Oxygen Autonomy */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-medium">O₂ Supply Autonomy</span>
                  <Wind className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {currentFacility.beds.oxygenSupplyHoursRemaining} Hours
                </div>
                <span className="text-[10px] text-emerald-600 font-medium block mt-1">
                  {currentFacility.beds.ventilatorsAvailable} of {currentFacility.beds.ventilatorsTotal} Ventilators Free
                </span>
              </div>
            </div>
          </div>

          {/* Biometric Staff Attendance Roster */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Biometric Duty Roster & Medical Personnel Attendance
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Sync: {liveStaffData.syncTime}</span>
                <button
                  onClick={() => handleToggleDoctorDuty(currentFacility.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Toggle Duty Roster</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Doctors */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Doctors (MBBS/MD)</span>
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {liveStaffData.doctorsOnDuty} / {currentFacility.staff.doctors.totalSanctioned} Present
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {currentFacility.staff.doctors.totalSanctioned - liveStaffData.doctorsOnDuty} on approved leave
                </span>
              </div>

              {/* Nurses */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Staff Nurses (GNM)</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {currentFacility.staff.nurses.onDutyToday} / {currentFacility.staff.nurses.totalSanctioned} Present
                </div>
                <span className="text-[11px] text-slate-500 block mt-1">
                  {currentFacility.staff.nurses.onLeave} on leave
                </span>
              </div>

              {/* Pharmacists & Lab Techs */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">Pharmacists & Techs</span>
                  <Activity className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {currentFacility.staff.pharmacists.onDutyToday + currentFacility.staff.labTechs.onDutyToday} /{' '}
                  {currentFacility.staff.pharmacists.totalSanctioned + currentFacility.staff.labTechs.totalSanctioned} Present
                </div>
                <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                  Lab diagnostics active
                </span>
              </div>

              {/* ASHA Field Force */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-700">ASHA Health Workers</span>
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold font-mono text-slate-900">
                  {currentFacility.staff.ashaWorkers.activeFieldReporting} /{' '}
                  {currentFacility.staff.ashaWorkers.assignedAreaCount} Reporting
                </div>
                <span className="text-[11px] text-indigo-600 font-medium block mt-1">
                  Door-to-door syndromic active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Facility Full Audit Report Modal */}
      {selectedFacilityForReport && (
        <FacilityReportModal
          facility={selectedFacilityForReport}
          onClose={() => setSelectedFacilityForReport(null)}
        />
      )}
    </div>
  );
};

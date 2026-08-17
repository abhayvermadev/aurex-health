import React from 'react';
import { District, Facility, StateData } from '../types';
import { RealLeafletMap } from './RealLeafletMap';

interface DistrictMapProps {
  district: District;
  stateName?: string;
  selectedFacilityId: string | null;
  onSelectFacility: (facilityId: string) => void;
  onOpenFacilityReport?: (facility: Facility) => void;
  mode: 'medicines' | 'beds';
}

export const DistrictMap: React.FC<DistrictMapProps> = ({
  district,
  stateName,
  selectedFacilityId,
  onSelectFacility,
  onOpenFacilityReport,
  mode,
}) => {
  // Format state title cleanly
  const resolvedStateName =
    stateName ||
    (district.stateId
      ? district.stateId
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : '');

  const syntheticState: StateData = {
    id: district.stateId,
    name: resolvedStateName,
    countryId: 'india',
    countryName: 'India',
    capital: 'State Capital',
    totalDistricts: 1,
    totalFacilities: district.facilities.length,
    activeStockoutAlerts: district.stockoutAlertCount,
    activeBedAlerts: district.bedStressCount,
    districts: [district],
  };

  return (
    <RealLeafletMap
      level="district"
      states={[syntheticState]}
      selectedStateId={district.stateId}
      selectedDistrictId={district.id}
      selectedFacilityId={selectedFacilityId}
      onSelectFacility={onSelectFacility}
      onOpenFacilityReport={onOpenFacilityReport}
      mode={mode}
      title={`${district.name} District ${resolvedStateName ? `(${resolvedStateName})` : ''} — PHC & CHC Real Geographic Map`}
      subtitle="Click any PHC or CHC on the map to inspect its live medicine stock, bed triage, and duty doctor reports"
    />
  );
};

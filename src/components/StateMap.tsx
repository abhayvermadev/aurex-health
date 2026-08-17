import React from 'react';
import { StateData } from '../types';
import { RealLeafletMap } from './RealLeafletMap';

interface StateMapProps {
  stateData: StateData;
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string) => void;
  mode: 'medicines' | 'beds';
}

export const StateMap: React.FC<StateMapProps> = ({
  stateData,
  selectedDistrictId,
  onSelectDistrict,
  mode,
}) => {
  return (
    <RealLeafletMap
      level="state"
      states={[stateData]}
      selectedStateId={stateData.id}
      selectedDistrictId={selectedDistrictId}
      onSelectDistrict={onSelectDistrict}
      mode={mode}
      title={`${stateData.name} State — Sub-District Telemetry & Warehouse Map`}
      subtitle={`Click any district marker on the map of ${stateData.name} to zoom into its Primary & Community Health Centres`}
    />
  );
};

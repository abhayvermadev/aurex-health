import React from 'react';
import { StateData } from '../types';
import { RealLeafletMap } from './RealLeafletMap';

interface NationalIndiaMapProps {
  states: StateData[];
  selectedStateId: string | null;
  onSelectState: (stateId: string) => void;
}

export const NationalIndiaMap: React.FC<NationalIndiaMapProps> = ({
  states,
  selectedStateId,
  onSelectState,
}) => {
  return (
    <RealLeafletMap
      level="national"
      states={states}
      selectedStateId={selectedStateId}
      onSelectState={onSelectState}
      mode="medicines"
      title="All-India 36 States & UTs Real Health Telemetry Map"
      subtitle="Click any state or UT pin on the map of India to drill down into districts, primary health centres, and warehouses"
    />
  );
};

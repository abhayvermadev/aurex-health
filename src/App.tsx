/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HEALTH_DATA_STORE, INITIAL_REDISTRIBUTIONS, INITIAL_OUTBREAK_ALERTS } from './data/healthData';
import { NavigationHeader } from './components/NavigationHeader';
import { OverviewHome } from './components/OverviewHome';
import { MedicineStockView } from './components/MedicineStockView';
import { BedStaffView } from './components/BedStaffView';
import { RedistributionView } from './components/RedistributionView';
import { OutbreakCoordinationView } from './components/OutbreakCoordinationView';
import { BricsCrossBorderView } from './components/BricsCrossBorderView';
import { DelegateBriefingModal } from './components/DelegateBriefingModal';

export default function App() {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('india');
  const [activeView, setActiveView] = useState<'home' | 'medicines' | 'beds' | 'redistribution' | 'outbreak' | 'brics'>('home');

  // Navigation targets from Search or State Cards
  const [targetStateId, setTargetStateId] = useState<string | undefined>(undefined);
  const [targetDistrictId, setTargetDistrictId] = useState<string | undefined>(undefined);
  const [targetFacilityId, setTargetFacilityId] = useState<string | undefined>(undefined);

  // Prefill states when triggering redistribution from medicine stock view
  const [redistTargetDistrictId, setRedistTargetDistrictId] = useState<string>('');
  const [redistItemType, setRedistItemType] = useState<string>('');

  // Federated learning status
  const [federatedEpoch, setFederatedEpoch] = useState<number>(48);
  const [isFederatedSyncing, setIsFederatedSyncing] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Delegate Briefing Modal
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);

  const currentCountry =
    HEALTH_DATA_STORE.find((c) => c.id === selectedCountryId) || HEALTH_DATA_STORE[0];

  const handleNavigateFromHome = (
    view: 'medicines' | 'beds' | 'redistribution' | 'outbreak' | 'brics',
    stateId?: string,
    districtId?: string,
    facilityId?: string
  ) => {
    setTargetStateId(stateId);
    setTargetDistrictId(districtId);
    setTargetFacilityId(facilityId);
    setActiveView(view);
  };

  const handleTriggerRedistribution = (targetDistrictId: string, itemType: string) => {
    setRedistTargetDistrictId(targetDistrictId);
    setRedistItemType(itemType);
    setActiveView('redistribution');
  };

  const handleTriggerFederatedSync = async () => {
    setIsFederatedSyncing(true);
    try {
      const res = await fetch('/api/ai/federated-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: currentCountry.code, localTrainingRounds: 140 }),
      });
      const data = await res.json();
      setFederatedEpoch((prev) => prev + 1);
      setSyncToastMessage(
        `✓ BRICS Global Model Epoch #${federatedEpoch + 1} synchronized via Differential Privacy (ε = 0.85).`
      );
      setTimeout(() => setSyncToastMessage(null), 4500);
    } catch (err) {
      console.error('Federated sync error:', err);
    } finally {
      setIsFederatedSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <NavigationHeader
        currentCountry={currentCountry}
        allCountries={HEALTH_DATA_STORE}
        onSelectCountry={setSelectedCountryId}
        activeView={activeView}
        onNavigateView={(view) => {
          setTargetStateId(undefined);
          setTargetDistrictId(undefined);
          setTargetFacilityId(undefined);
          setActiveView(view);
        }}
        isFederatedSyncing={isFederatedSyncing}
        onTriggerFederatedSync={handleTriggerFederatedSync}
        federatedEpoch={federatedEpoch}
      />

      {/* Floating Sync Notification Toast */}
      {syncToastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-white border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <span>{syncToastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeView === 'home' && (
          <OverviewHome
            currentCountry={currentCountry}
            onNavigate={handleNavigateFromHome}
            onOpenDelegateBriefing={() => setIsBriefingOpen(true)}
          />
        )}

        {activeView === 'medicines' && (
          <MedicineStockView
            states={currentCountry.states}
            initialStateId={targetStateId}
            initialDistrictId={targetDistrictId}
            initialFacilityId={targetFacilityId}
            onTriggerRedistribution={handleTriggerRedistribution}
          />
        )}

        {activeView === 'beds' && (
          <BedStaffView
            states={currentCountry.states}
            initialStateId={targetStateId}
            initialDistrictId={targetDistrictId}
            initialFacilityId={targetFacilityId}
          />
        )}

        {activeView === 'redistribution' && (
          <RedistributionView
            states={currentCountry.states}
            initialTransfers={INITIAL_REDISTRIBUTIONS}
            prefilledTargetDistrictId={redistTargetDistrictId}
            prefilledItemType={redistItemType}
          />
        )}

        {activeView === 'outbreak' && (
          <OutbreakCoordinationView
            initialOutbreaks={INITIAL_OUTBREAK_ALERTS}
            states={currentCountry.states}
          />
        )}

        {activeView === 'brics' && (
          <BricsCrossBorderView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">PulseIndia • National Health Mission (NHM) & ABDM Federated AI Grid</span>
          <span className="font-mono text-[11px] text-slate-400">Primary Health Centre (PHC) & CHC Observability</span>
        </div>
      </footer>

      {/* 5-Min Executive Briefing Modal */}
      <DelegateBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import {
  BRICS_PARTNER_COUNTRIES,
  WHO_ATC_DRUG_HARMONIZATION,
  INITIAL_FEDERATED_LOGS,
  INITIAL_ZK_PROPOSALS,
} from '../data/bricsData';
import { BricsCountryProfile, WhoAtcMapping, FederatedGradientSyncLog, ZkAssistanceProposal } from '../types';
import {
  Globe2,
  ShieldCheck,
  Lock,
  Cpu,
  RefreshCw,
  FileCheck2,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Pill,
  Sparkles,
  Plane,
  EyeOff,
  Scale,
  Database,
  Building2,
  Hospital,
} from 'lucide-react';

interface BricsCrossBorderViewProps {
  onTriggerNationalNavigation?: (countryId: string) => void;
}

export const BricsCrossBorderView: React.FC<BricsCrossBorderViewProps> = () => {
  const [selectedCountryId, setSelectedCountryId] = useState<string>('india');
  const [selectedAtcCode, setSelectedAtcCode] = useState<string>('B05CB01');
  const [federatedLogs, setFederatedLogs] = useState<FederatedGradientSyncLog[]>(INITIAL_FEDERATED_LOGS);
  const [zkProposals, setZkProposals] = useState<ZkAssistanceProposal[]>(INITIAL_ZK_PROPOSALS);
  const [isSyncingGradients, setIsSyncingGradients] = useState<boolean>(false);
  const [isGeneratingZkProof, setIsGeneratingZkProof] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const selectedCountry =
    BRICS_PARTNER_COUNTRIES.find((c) => c.id === selectedCountryId) || BRICS_PARTNER_COUNTRIES[0];

  const selectedDrug =
    WHO_ATC_DRUG_HARMONIZATION.find((d) => d.atcCode === selectedAtcCode) ||
    WHO_ATC_DRUG_HARMONIZATION[0];

  // Trigger simulated zero-leakage federated learning gradient synchronization
  const handleTriggerPrivacyGradientSync = () => {
    setIsSyncingGradients(true);
    setSyncFeedback('Initiating Secure Multi-Party Computation (SMPC)... Injecting ε-DP noise (ε=0.5)...');

    setTimeout(() => {
      const newLog: FederatedGradientSyncLog = {
        id: `fed-epoch-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        modelName: 'BRICS-Harmonized-Critical-Buffer-NeuralNet-v5',
        contributingNodes: [
          'NHM ABDM (India)',
          'SUS DATASUS (Brazil)',
          'NDoH (South Africa)',
          'NHC (China)',
          'Minzdrav (Russia)',
        ],
        epsilonPrivacyLoss: 0.45,
        gradientTensorNorm: 0.0028,
        rawRecordsTransferred: 0,
        epidemiologicalGain:
          'Aggregated 5 sovereign health systems weight tensors. Improved tropical and rural stockout prediction accuracy by +14.2% with ZERO citizen health record exposure.',
      };

      setFederatedLogs([newLog, ...federatedLogs]);
      setIsSyncingGradients(false);
      setSyncFeedback('✓ Global Federated Weights Synchronized. 0 raw data bytes transferred across borders.');
      setTimeout(() => setSyncFeedback(null), 5000);
    }, 1800);
  };

  // Trigger simulated zk-SNARK humanitarian relief verification
  const handleTriggerZkProofVerification = () => {
    setIsGeneratingZkProof(true);
    setTimeout(() => {
      const newProposal: ZkAssistanceProposal = {
        id: `zk-aid-${Date.now().toString().slice(-3)}`,
        donorCountry: 'South Africa (National Depot Network)',
        donorFlag: '🇿🇦',
        recipientCountry: 'India (Monsoon High-Vulnerability PHCs)',
        recipientFlag: '🇮🇳',
        itemAtcCode: 'H01BB02',
        itemName: 'Oxytocin 10 IU Injection (Cold-Chain)',
        quantityRequested: 4000,
        zkProofStatus: 'VERIFIED_WITHOUT_DATA_LEAK',
        zkProofHash: `0x${Math.random().toString(16).substring(2, 12)}...zkSNARK(Surplus_Attestation_Certified)`,
        transitHoursEst: 32,
        safetyReservePreserved: true,
      };

      setZkProposals([newProposal, ...zkProposals]);
      setIsGeneratingZkProof(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Sovereign Privacy Enclave Guarantee */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    BRICS Cross-Border Health Grid & Privacy-Preserving AI
                  </h1>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Zero Raw-Data Sharing Policy
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Multi-nation primary healthcare telemetry, WHO ATC medicine harmonization, and federated intelligence across BRICS member states
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerPrivacyGradientSync}
              disabled={isSyncingGradients}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingGradients ? 'animate-spin' : ''}`} />
              <span>{isSyncingGradients ? 'Computing SMPC Weights...' : 'Sync Privacy-Preserved Gradients'}</span>
            </button>
          </div>
        </div>

        {/* Live Feedback Toast if active */}
        {syncFeedback && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* 4 Sovereign Enclave Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Raw Patient Data Exported</span>
              <EyeOff className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600">0 Bytes</div>
            <div className="text-[11px] text-slate-500 mt-1">100% in-country sovereign enclaves</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Differential Privacy Guarantee</span>
              <Lock className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-600">ε = 0.5 (Strict)</div>
            <div className="text-[11px] text-slate-500 mt-1">Laplacian noise injected on gradients</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Inter-Nation Cryptography</span>
              <Cpu className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">SMPC & zk-SNARKs</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Homomorphic weight aggregation</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Regulatory Sovereignty</span>
              <Scale className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-xs font-bold text-slate-900 mt-1">DPDP 🇮🇳 • LGPD 🇧🇷 • POPIA 🇿🇦</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">✓ Full Statutory Compliance</div>
          </div>
        </div>
      </div>

      {/* 2. BRICS Sovereign Health Authority Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-wide">
              BRICS Sovereign Health Authority Enclaves
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any BRICS nation to inspect its national health architecture, primary care unit taxonomy, and isolated data boundaries
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">5 Sovereign Member States</span>
        </div>

        {/* Country Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {BRICS_PARTNER_COUNTRIES.map((country) => {
            const isSelected = selectedCountryId === country.id;
            return (
              <button
                key={country.id}
                onClick={() => setSelectedCountryId(country.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{country.flagEmoji}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {country.code}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{country.name}</div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{country.healthAuthority.split('&')[0]}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Country Profile Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedCountry.flagEmoji}</span>
                <span className="text-sm font-bold text-slate-900">{selectedCountry.name} Health Framework</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-medium">
                  {selectedCountry.dataSovereigntyStatus}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Governing Authority: <span className="text-slate-900">{selectedCountry.healthAuthority}</span>
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[11px] text-slate-500 block">Sovereign Privacy Legislation</span>
              <span className="text-xs font-bold text-slate-900">{selectedCountry.privacyAct}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Primary Clinic Unit Taxonomy:</span>
              <span className="font-semibold text-slate-800">{selectedCountry.primaryClinicType}</span>
              <span className="text-[11px] text-slate-400 block font-mono">
                {selectedCountry.totalPrimaryUnits.toLocaleString()} Registered Nodes
              </span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Emergency / Referral Center:</span>
              <span className="font-semibold text-slate-800">{selectedCountry.emergencyUnitType}</span>
            </div>

            <div>
              <span className="text-slate-500 block text-[11px]">Key Epidemic Surveillance Vectors:</span>
              <span className="font-semibold text-indigo-700">
                {selectedCountry.keySurveillanceVectors.join(' • ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. WHO INN/ATC Universal Medicine Harmonizer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 tracking-wide">
                WHO ATC / INN Universal Medicine Harmonization Engine
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standardizes national Essential Drug Lists (EDL / RENAME / EML) into open WHO Anatomical Therapeutic Chemical classifications
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-medium border border-indigo-200">
            WHO EML 23rd Edition Standard
          </span>
        </div>

        {/* Drug Selection Pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {WHO_ATC_DRUG_HARMONIZATION.map((drug) => {
            const isSelected = selectedAtcCode === drug.atcCode;
            return (
              <button
                key={drug.atcCode}
                onClick={() => setSelectedAtcCode(drug.atcCode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="font-mono text-[10px] opacity-80">{drug.atcCode}</span>
                <span>{drug.whoName.split(' ')[0]} {drug.whoName.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Drug Mapping Matrix */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                  ATC: {selectedDrug.atcCode}
                </span>
                <span className="text-sm font-bold text-slate-900">{selectedDrug.whoName}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Therapeutic Class: <span className="font-medium text-slate-800">{selectedDrug.therapeuticClass}</span> • Form: {selectedDrug.dosageForm}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Cross-Border Interchangeability:</span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {selectedDrug.interchangeabilityScore}% Equivalent
              </span>
            </div>
          </div>

          {/* National Nomenclature Across All 5 BRICS Countries */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <span>🇮🇳</span>
                <span>India (NHM National Formulary)</span>
              </div>
              <p className="text-slate-700 font-medium">{selectedDrug.nationalNames.india}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <span>🇧🇷</span>
                <span>Brazil (RENAME SUS / Farmácia Popular)</span>
              </div>
              <p className="text-slate-700 font-medium">{selectedDrug.nationalNames.brazil}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <span>🇿🇦</span>
                <span>South Africa (EML Adult/Paediatric NDoH)</span>
              </div>
              <p className="text-slate-700 font-medium">{selectedDrug.nationalNames.southAfrica}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <span>🇨🇳</span>
                <span>China (National Essential Drug List NEDL)</span>
              </div>
              <p className="text-slate-700 font-medium">{selectedDrug.nationalNames.china}</p>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <span>🇷🇺</span>
                <span>Russia (VED / ЖНВЛП Minzdrav List)</span>
              </div>
              <p className="text-slate-700 font-medium">{selectedDrug.nationalNames.russia}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Zero-Knowledge Humanitarian Assistance Corridor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Zero-Knowledge Proofs for Emergency Humanitarian Aid */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                    Zero-Knowledge Mutual Assistance Corridor
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cryptographically proves partner nation surplus without revealing total strategic national stockpiles or depot locations
                </p>
              </div>

              <button
                onClick={handleTriggerZkProofVerification}
                disabled={isGeneratingZkProof}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isGeneratingZkProof ? 'Computing Proof...' : 'Generate zk-SNARK'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {zkProposals.map((prop) => (
                <div key={prop.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span>{prop.donorFlag} {prop.donorCountry.split('(')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.recipientFlag} {prop.recipientCountry.split('(')[0]}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                      zk-SNARK Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span>{prop.itemName} ({prop.quantityRequested.toLocaleString()} units)</span>
                    <span className="font-mono text-slate-500">ETA: {prop.transitHoursEst} hrs</span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="truncate max-w-[220px]">{prop.zkProofHash}</span>
                    <span className="text-emerald-600 font-bold">✓ Domestic Reserve Protected</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Zero-Knowledge Proof ensures zero commercial espionage or strategic security leaks.</span>
          </div>
        </div>

        {/* Right: Federated Learning Gradient Sync Audit Trail */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                    Cross-Border Federated Model Gradient Logs
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure Multi-Party Computation (SMPC) epoch history with mathematical privacy bounds
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                0 Records Leaked
              </span>
            </div>

            <div className="space-y-3">
              {federatedLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-bold text-slate-900">{log.modelName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 mb-1.5 font-mono">
                    Contributing Enclaves: <span className="font-medium text-slate-800">{log.contributingNodes.join(' • ')}</span>
                  </div>

                  <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-100 text-[11px]">
                    {log.epidemiologicalGain}
                  </p>

                  <div className="mt-2 pt-1 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Privacy Loss: ε={log.epsilonPrivacyLoss}</span>
                    <span>Tensor Norm: {log.gradientTensorNorm}</span>
                    <span className="text-emerald-700 font-bold">Raw Records: {log.rawRecordsTransferred}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Compliant with WHO International Health Regulations (IHR 2005) digital standards.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

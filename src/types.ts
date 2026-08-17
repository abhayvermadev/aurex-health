export type SeverityLevel = 'CRITICAL' | 'WARNING' | 'NORMAL';

export interface MedicineStock {
  id: string;
  name: string;
  category: 'Antibiotics' | 'Emergency IV' | 'Maternal Health' | 'Chronic Care' | 'Vector-Borne' | 'Vaccines' | 'Pain & Fever';
  currentStock: number;
  minSafetyStock: number;
  maxCapacity: number;
  unit: string;
  dailyBurnRate: number;
  daysOfSupplyRemaining: number;
  batchExpiry: string;
  status: 'CRITICAL' | 'WARNING' | 'OPTIMAL' | 'OVERSTOCKED';
  essentialDrugListCode: string;
}

export interface BedCapacity {
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: { total: number; occupied: number };
  generalBeds: { total: number; occupied: number };
  maternityBeds: { total: number; occupied: number };
  isolationBeds: { total: number; occupied: number };
  oxygenSupplyHoursRemaining: number;
  ventilatorsAvailable: number;
  ventilatorsTotal: number;
}

export interface StaffCategory {
  totalSanctioned: number;
  onDutyToday: number;
  onLeave: number;
}

export interface StaffAttendance {
  doctors: StaffCategory;
  nurses: StaffCategory;
  pharmacists: StaffCategory;
  labTechs: StaffCategory;
  ashaWorkers: { assignedAreaCount: number; activeFieldReporting: number };
  biometricSyncStatus: 'ONLINE' | 'OFFLINE_SYNC_PENDING';
  shiftComplianceScore: number; // e.g. 92%
}

export interface Facility {
  id: string;
  name: string;
  type: 'PHC' | 'CHC';
  districtId: string;
  districtName: string;
  stateId: string;
  pinCode: string;
  coordinates: {
    x: number; // relative SVG percentage (0-100)
    y: number; // relative SVG percentage (0-100)
    lat: number;
    lng: number;
  };
  medicineAlert: boolean;
  medicineSeverity: SeverityLevel;
  bedAlert: boolean;
  bedSeverity: SeverityLevel;
  staffAlert: boolean;
  medicines: MedicineStock[];
  beds: BedCapacity;
  staff: StaffAttendance;
  dailyFootfall: number;
  catchmentPopulation: number;
  lastUpdated: string;
  inchargeDoctor: string;
  emergencyContact: string;
}

export interface District {
  id: string;
  name: string;
  stateId: string;
  totalPhcs: number;
  totalChcs: number;
  stockoutAlertCount: number;
  bedStressCount: number;
  centralWarehouseInventory: Record<string, number>;
  mapCoordinates: {
    x: number; // SVG center point (0-100)
    y: number;
    svgPath?: string;
  };
  facilities: Facility[];
  isSurplus?: boolean;
}

export interface StateData {
  id: string;
  name: string;
  countryId: string;
  countryName: string;
  capital: string;
  totalDistricts: number;
  totalFacilities: number;
  activeStockoutAlerts: number;
  activeBedAlerts: number;
  districts: District[];
}

export interface CountryData {
  id: string;
  name: string;
  code: string;
  flagEmoji: string;
  healthProgramName: string;
  states: StateData[];
}

export interface RedistributionTransfer {
  id: string;
  sourceDistrictId: string;
  sourceDistrictName: string;
  targetDistrictId: string;
  targetDistrictName: string;
  itemType: string;
  quantity: number;
  unit: string;
  urgency: 'HIGH' | 'EMERGENCY' | 'STANDARD';
  transitStatus: 'PENDING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED';
  vehicleType: string;
  distanceKm: number;
  etaHours: number;
  rationale: string;
  dispatchedAt: string;
  temperatureControlled: boolean;
}

export interface OutbreakAlert {
  id: string;
  diseaseName: string;
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  affectedFacilityNames: string[];
  severity: 'CRITICAL' | 'HIGH' | 'WATCH';
  reportedDate: string;
  casesLast7Days: number;
  reproductiveRateEst: number;
  surgeMultiplier: number;
  criticalMedicineNeeds: string[];
  emergencyActionStatus: 'ACTIVE_RESPONSE' | 'CONTAINMENT_PHASE' | 'ASSESSMENT_TRIGGERED';
  federatedInsightSummary: string;
}

export interface BricsCountryProfile {
  id: string;
  name: string;
  code: string;
  flagEmoji: string;
  healthAuthority: string;
  primaryClinicType: string;
  emergencyUnitType: string;
  privacyAct: string;
  dataSovereigntyStatus: 'SOVEREIGN_ENCLAVE_ACTIVE' | 'ISOLATED';
  totalPrimaryUnits: number;
  differentialPrivacyEpsilon: number; // e.g. 0.5
  activeFederatedModels: string[];
  keySurveillanceVectors: string[];
}

export interface WhoAtcMapping {
  atcCode: string;
  whoName: string;
  therapeuticClass: string;
  dosageForm: string;
  nationalNames: {
    india: string;
    brazil: string;
    southAfrica: string;
    russia: string;
    china: string;
  };
  interchangeabilityScore: number; // e.g. 99%
}

export interface FederatedGradientSyncLog {
  id: string;
  timestamp: string;
  modelName: string;
  contributingNodes: string[];
  epsilonPrivacyLoss: number;
  gradientTensorNorm: number;
  rawRecordsTransferred: 0; // Mathematically 0
  epidemiologicalGain: string;
}

export interface ZkAssistanceProposal {
  id: string;
  donorCountry: string;
  donorFlag: string;
  recipientCountry: string;
  recipientFlag: string;
  itemAtcCode: string;
  itemName: string;
  quantityRequested: number;
  zkProofStatus: 'VERIFIED_WITHOUT_DATA_LEAK' | 'COMPUTING_PROOF';
  zkProofHash: string;
  transitHoursEst: number;
  safetyReservePreserved: boolean;
}


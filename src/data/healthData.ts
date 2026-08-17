import { CountryData, StateData, District, Facility, MedicineStock, RedistributionTransfer, OutbreakAlert } from '../types';

// Standard Essential Drug List Generator
function createStandardEdl(seed: number, isCritical: boolean = false): MedicineStock[] {
  return [
    {
      id: `med-iv-${seed}-1`,
      name: 'IV Normal Saline (500ml)',
      category: 'Emergency IV',
      currentStock: isCritical ? 35 : 320,
      minSafetyStock: 200,
      maxCapacity: 600,
      unit: 'Bottles',
      dailyBurnRate: 28,
      daysOfSupplyRemaining: isCritical ? 1.2 : 11.4,
      batchExpiry: '2027-05-15',
      status: isCritical ? 'CRITICAL' : 'OPTIMAL',
      essentialDrugListCode: 'EDL-IV-01',
    },
    {
      id: `med-ab-${seed}-2`,
      name: 'Amoxicillin 500mg Capsules',
      category: 'Antibiotics',
      currentStock: isCritical ? 90 : 540,
      minSafetyStock: 400,
      maxCapacity: 1200,
      unit: 'Strips (10s)',
      dailyBurnRate: 52,
      daysOfSupplyRemaining: isCritical ? 1.7 : 10.3,
      batchExpiry: '2026-11-20',
      status: isCritical ? 'CRITICAL' : 'OPTIMAL',
      essentialDrugListCode: 'EDL-AB-04',
    },
    {
      id: `med-ors-${seed}-3`,
      name: 'ORS Electrolyte Sachets',
      category: 'Emergency IV',
      currentStock: 480,
      minSafetyStock: 250,
      maxCapacity: 1500,
      unit: 'Packets',
      dailyBurnRate: 36,
      daysOfSupplyRemaining: 13.3,
      batchExpiry: '2028-02-10',
      status: 'OPTIMAL',
      essentialDrugListCode: 'EDL-OR-02',
    },
    {
      id: `med-oxy-${seed}-4`,
      name: 'Oxytocin 10 IU Injection',
      category: 'Maternal Health',
      currentStock: isCritical ? 14 : 95,
      minSafetyStock: 60,
      maxCapacity: 250,
      unit: 'Ampoules',
      dailyBurnRate: 8,
      daysOfSupplyRemaining: isCritical ? 1.7 : 11.8,
      batchExpiry: '2026-10-15',
      status: isCritical ? 'CRITICAL' : 'OPTIMAL',
      essentialDrugListCode: 'EDL-MH-08',
    },
    {
      id: `med-asv-${seed}-5`,
      name: 'Anti-Snake Venom (ASV) Polyvalent',
      category: 'Emergency IV',
      currentStock: isCritical ? 2 : 18,
      minSafetyStock: 10,
      maxCapacity: 50,
      unit: 'Vials',
      dailyBurnRate: 1.5,
      daysOfSupplyRemaining: isCritical ? 1.3 : 12.0,
      batchExpiry: '2027-08-30',
      status: isCritical ? 'CRITICAL' : 'OPTIMAL',
      essentialDrugListCode: 'EDL-EM-12',
    },
    {
      id: `med-arv-${seed}-6`,
      name: 'Anti-Rabies Vaccine (ARV)',
      category: 'Vaccines',
      currentStock: 28,
      minSafetyStock: 20,
      maxCapacity: 100,
      unit: 'Vials',
      dailyBurnRate: 2.2,
      daysOfSupplyRemaining: 12.7,
      batchExpiry: '2026-12-31',
      status: 'OPTIMAL',
      essentialDrugListCode: 'EDL-VC-03',
    },
    {
      id: `med-pcm-${seed}-7`,
      name: 'Paracetamol 650mg Tablets',
      category: 'Pain & Fever',
      currentStock: 1400,
      minSafetyStock: 800,
      maxCapacity: 4000,
      unit: 'Tablets',
      dailyBurnRate: 95,
      daysOfSupplyRemaining: 14.7,
      batchExpiry: '2027-09-15',
      status: 'OPTIMAL',
      essentialDrugListCode: 'EDL-PF-01',
    },
    {
      id: `med-zinc-${seed}-8`,
      name: 'Zinc Sulphate 20mg Dispersible',
      category: 'Maternal Health',
      currentStock: 520,
      minSafetyStock: 300,
      maxCapacity: 1500,
      unit: 'Tablets',
      dailyBurnRate: 24,
      daysOfSupplyRemaining: 21.6,
      batchExpiry: '2027-03-25',
      status: 'OPTIMAL',
      essentialDrugListCode: 'EDL-MH-05',
    },
  ];
}

// Helper to build district facilities with 3-4 PHCs/CHCs each
function buildDistrict(
  stateId: string,
  stateName: string,
  districtId: string,
  districtName: string,
  x: number,
  y: number,
  facilityNames: Array<{ name: string; type: 'PHC' | 'CHC'; doctor: string; isAlert?: boolean; x: number; y: number; lat: number; lng: number }>,
  isSurplus: boolean = false
): District {
  let stockoutAlertCount = 0;
  let bedStressCount = 0;

  const facilities: Facility[] = facilityNames.map((item, idx) => {
    const seed = idx + Math.round(x * 10 + y * 5);
    const hasMedAlert = item.isAlert ?? (idx === 0 && !isSurplus);
    const hasBedAlert = (idx === 1 && !isSurplus);

    if (hasMedAlert) stockoutAlertCount++;
    if (hasBedAlert) bedStressCount++;

    return {
      id: `${districtId}-${item.type.toLowerCase()}-${idx + 1}`,
      name: `${item.name} ${item.type === 'PHC' ? 'Primary Health Centre' : 'Community Health Centre'}`,
      type: item.type,
      districtId,
      districtName,
      stateId,
      pinCode: `${100000 + Math.floor(Math.random() * 800000)}`,
      coordinates: {
        x: item.x,
        y: item.y,
        lat: item.lat,
        lng: item.lng,
      },
      medicineAlert: hasMedAlert,
      medicineSeverity: hasMedAlert ? 'CRITICAL' : 'NORMAL',
      bedAlert: hasBedAlert,
      bedSeverity: hasBedAlert ? 'WARNING' : 'NORMAL',
      staffAlert: false,
      dailyFootfall: item.type === 'CHC' ? 240 + idx * 25 : 120 + idx * 15,
      catchmentPopulation: item.type === 'CHC' ? 85000 + idx * 10000 : 26000 + idx * 4000,
      lastUpdated: '12 mins ago',
      inchargeDoctor: item.doctor,
      emergencyContact: `+91 98${Math.floor(10000000 + Math.random() * 89999999)}`,
      medicines: createStandardEdl(seed, hasMedAlert),
      beds: {
        totalBeds: item.type === 'CHC' ? 30 : 10,
        occupiedBeds: item.type === 'CHC' ? (hasBedAlert ? 28 : 18) : (hasBedAlert ? 9 : 4),
        icuBeds: { total: item.type === 'CHC' ? 6 : 2, occupied: hasBedAlert ? 5 : 1 },
        generalBeds: { total: item.type === 'CHC' ? 18 : 6, occupied: hasBedAlert ? 17 : 3 },
        maternityBeds: { total: item.type === 'CHC' ? 6 : 2, occupied: 2 },
        isolationBeds: { total: 4, occupied: 1 },
        oxygenSupplyHoursRemaining: hasBedAlert ? 18 : 72,
        ventilatorsAvailable: item.type === 'CHC' ? 2 : 1,
        ventilatorsTotal: item.type === 'CHC' ? 3 : 1,
      },
      staff: {
        doctors: { totalSanctioned: item.type === 'CHC' ? 4 : 2, onDutyToday: item.type === 'CHC' ? 3 : 2, onLeave: 0 },
        nurses: { totalSanctioned: item.type === 'CHC' ? 8 : 4, onDutyToday: item.type === 'CHC' ? 7 : 3, onLeave: 1 },
        pharmacists: { totalSanctioned: 2, onDutyToday: 2, onLeave: 0 },
        labTechs: { totalSanctioned: 2, onDutyToday: 2, onLeave: 0 },
        ashaWorkers: { assignedAreaCount: item.type === 'CHC' ? 45 : 18, activeFieldReporting: item.type === 'CHC' ? 42 : 17 },
        biometricSyncStatus: 'ONLINE',
        shiftComplianceScore: 96,
      },
    };
  });

  return {
    id: districtId,
    name: `${districtName} District`,
    stateId,
    totalPhcs: facilities.filter((f) => f.type === 'PHC').length * 12,
    totalChcs: facilities.filter((f) => f.type === 'CHC').length * 4,
    stockoutAlertCount,
    bedStressCount,
    isSurplus,
    centralWarehouseInventory: {
      'IV Normal Saline (500ml)': isSurplus ? 8500 : 920,
      'Amoxicillin 500mg': isSurplus ? 12000 : 1800,
      'ORS Electrolyte Sachets': isSurplus ? 25000 : 4500,
      'Oxytocin Inj (10 IU)': isSurplus ? 2200 : 250,
      'Anti-Rabies Vaccine (ARV)': isSurplus ? 950 : 120,
      'Anti-Snake Venom (ASV)': isSurplus ? 320 : 35,
      'Paracetamol 650mg': isSurplus ? 45000 : 9000,
      'Zinc Sulphate 20mg': isSurplus ? 18000 : 3200,
    },
    mapCoordinates: { x, y },
    facilities,
  };
}

// 1. MAHARASHTRA
const maharashtraDistricts: District[] = [
  buildDistrict('maharashtra', 'Maharashtra', 'pune', 'Pune', 38, 52, [
    { name: 'Khed Shivapur', type: 'PHC', doctor: 'Dr. Sunita Deshmukh (MBBS, DGO)', isAlert: true, x: 26, y: 35, lat: 18.349, lng: 73.844 },
    { name: 'Manchar', type: 'CHC', doctor: 'Dr. Rahul Patil (MD, Medicine)', isAlert: false, x: 55, y: 28, lat: 19.006, lng: 73.942 },
    { name: 'Saswad', type: 'PHC', doctor: 'Dr. Priya Shinde (MBBS)', isAlert: false, x: 70, y: 62, lat: 18.344, lng: 74.028 },
    { name: 'Shirwal', type: 'PHC', doctor: 'Dr. Anand Kulkarni (MBBS)', isAlert: false, x: 38, y: 78, lat: 18.136, lng: 73.984 },
  ]),
  buildDistrict('maharashtra', 'Maharashtra', 'nagpur', 'Nagpur', 78, 28, [
    { name: 'Kamptee', type: 'CHC', doctor: 'Dr. Sanjay Meshram (MD)', isAlert: false, x: 32, y: 30, lat: 21.223, lng: 79.197 },
    { name: 'Hingna', type: 'PHC', doctor: 'Dr. Kavita Raut (MBBS)', isAlert: false, x: 65, y: 45, lat: 21.066, lng: 78.966 },
    { name: 'Saoner', type: 'PHC', doctor: 'Dr. Nitin Gadge (MBBS)', isAlert: false, x: 45, y: 72, lat: 21.385, lng: 78.918 },
    { name: 'Umred', type: 'CHC', doctor: 'Dr. Archana Wankhede (DGO)', isAlert: false, x: 75, y: 78, lat: 20.854, lng: 79.327 },
  ], true),
  buildDistrict('maharashtra', 'Maharashtra', 'nashik', 'Nashik', 32, 38, [
    { name: 'Dindori', type: 'PHC', doctor: 'Dr. Vikas Bhamre (MBBS)', isAlert: true, x: 30, y: 35, lat: 20.203, lng: 73.834 },
    { name: 'Sinnar', type: 'CHC', doctor: 'Dr. Meena Jagtap (MD)', isAlert: false, x: 62, y: 55, lat: 19.849, lng: 74.004 },
    { name: 'Igatpuri', type: 'PHC', doctor: 'Dr. Rajesh Gaikwad (MBBS)', isAlert: false, x: 25, y: 75, lat: 19.697, lng: 73.562 },
    { name: 'Niphad', type: 'PHC', doctor: 'Dr. Swati Sonawane (MBBS)', isAlert: false, x: 75, y: 35, lat: 20.082, lng: 74.111 },
  ]),
  buildDistrict('maharashtra', 'Maharashtra', 'aurangabad', 'Chhatrapati Sambhajinagar', 48, 45, [
    { name: 'Paithan', type: 'CHC', doctor: 'Dr. Rameshwar Kale (MD)', isAlert: false, x: 45, y: 65, lat: 19.479, lng: 75.385 },
    { name: 'Gangapur', type: 'PHC', doctor: 'Dr. Sneha More (MBBS)', isAlert: false, x: 28, y: 40, lat: 19.702, lng: 75.011 },
    { name: 'Vaijapur', type: 'PHC', doctor: 'Dr. Deepak Jadhav (MBBS)', isAlert: false, x: 68, y: 32, lat: 19.927, lng: 74.729 },
    { name: 'Kannad', type: 'CHC', doctor: 'Dr. Pooja Solanke (DGO)', isAlert: false, x: 40, y: 22, lat: 20.264, lng: 75.132 },
  ]),
];

// 2. UTTAR PRADESH
const uttarPradeshDistricts: District[] = [
  buildDistrict('uttar_pradesh', 'Uttar Pradesh', 'gorakhpur', 'Gorakhpur', 75, 48, [
    { name: 'Bhathat Block', type: 'PHC', doctor: 'Dr. Alok Verma (MD, Community Med)', isAlert: true, x: 30, y: 35, lat: 26.879, lng: 83.476 },
    { name: 'Campierganj', type: 'CHC', doctor: 'Dr. Renu Srivastava (MBBS, DGO)', isAlert: false, x: 55, y: 25, lat: 27.028, lng: 83.277 },
    { name: 'Sahjanwa', type: 'PHC', doctor: 'Dr. Manoj Pandey (MBBS)', isAlert: false, x: 25, y: 70, lat: 26.772, lng: 83.218 },
    { name: 'Bansgaon', type: 'CHC', doctor: 'Dr. K.P. Yadav (MS, General Surgery)', isAlert: false, x: 72, y: 75, lat: 26.559, lng: 83.359 },
  ]),
  buildDistrict('uttar_pradesh', 'Uttar Pradesh', 'lucknow', 'Lucknow', 45, 45, [
    { name: 'Bakshi Ka Talab', type: 'CHC', doctor: 'Dr. Ashish Tripathi (MD)', isAlert: false, x: 42, y: 28, lat: 26.985, lng: 80.923 },
    { name: 'Gosainganj', type: 'PHC', doctor: 'Dr. Neha Mishra (MBBS)', isAlert: false, x: 70, y: 65, lat: 26.775, lng: 81.119 },
    { name: 'Kakori', type: 'PHC', doctor: 'Dr. Imran Khan (MBBS)', isAlert: false, x: 25, y: 48, lat: 26.883, lng: 80.793 },
    { name: 'Mohanlalganj', type: 'CHC', doctor: 'Dr. Sudha Rani (DGO)', isAlert: false, x: 50, y: 78, lat: 26.671, lng: 80.998 },
  ], true),
  buildDistrict('uttar_pradesh', 'Uttar Pradesh', 'varanasi', 'Varanasi', 72, 65, [
    { name: 'Pindra', type: 'CHC', doctor: 'Dr. Vinay Chaubey (MD)', isAlert: true, x: 35, y: 30, lat: 25.485, lng: 82.839 },
    { name: 'Cholapur', type: 'PHC', doctor: 'Dr. Anita Rai (MBBS)', isAlert: false, x: 68, y: 35, lat: 25.437, lng: 83.045 },
    { name: 'Kashi Vidyapeeth Block', type: 'PHC', doctor: 'Dr. Saurabh Dubey (MBBS)', isAlert: false, x: 40, y: 65, lat: 25.318, lng: 82.973 },
    { name: 'Arajiline', type: 'CHC', doctor: 'Dr. Shweta Tiwari (DGO)', isAlert: false, x: 25, y: 75, lat: 25.267, lng: 82.871 },
  ]),
  buildDistrict('uttar_pradesh', 'Uttar Pradesh', 'kanpur_nagar', 'Kanpur Nagar', 40, 52, [
    { name: 'Bilhaur', type: 'CHC', doctor: 'Dr. R.K. Katiyar (MD)', isAlert: false, x: 30, y: 25, lat: 26.848, lng: 80.054 },
    { name: 'Ghatampur', type: 'CHC', doctor: 'Dr. Vandana Shukla (DGO)', isAlert: false, x: 45, y: 75, lat: 26.158, lng: 80.174 },
    { name: 'Kalyanpur', type: 'PHC', doctor: 'Dr. Amit Dixit (MBBS)', isAlert: false, x: 65, y: 40, lat: 26.502, lng: 80.261 },
    { name: 'Sarsaul', type: 'PHC', doctor: 'Dr. Preeti Singh (MBBS)', isAlert: false, x: 75, y: 62, lat: 26.279, lng: 80.528 },
  ]),
];

// 3. KERALA
const keralaDistricts: District[] = [
  buildDistrict('kerala', 'Kerala', 'ernakulam', 'Ernakulam', 48, 55, [
    { name: 'Angamaly', type: 'CHC', doctor: 'Dr. George Thomas (MD, Pulmonology)', isAlert: false, x: 38, y: 25, lat: 10.196, lng: 76.386 },
    { name: 'Piravom', type: 'PHC', doctor: 'Dr. Anju Kurien (MBBS, DCH)', isAlert: false, x: 68, y: 72, lat: 9.871, lng: 76.492 },
    { name: 'Kothamangalam', type: 'CHC', doctor: 'Dr. Mathew Varghese (MS)', isAlert: false, x: 75, y: 42, lat: 10.061, lng: 76.623 },
    { name: 'Vypin Coastal', type: 'PHC', doctor: 'Dr. Latha Menon (MBBS)', isAlert: false, x: 22, y: 50, lat: 10.041, lng: 76.221 },
  ], true),
  buildDistrict('kerala', 'Kerala', 'wayanad', 'Wayanad', 38, 22, [
    { name: 'Meppadi Tribal', type: 'PHC', doctor: 'Dr. Vinod Nambiar (MBBS, DPH)', isAlert: true, x: 50, y: 65, lat: 11.551, lng: 76.126 },
    { name: 'Mananthavady', type: 'CHC', doctor: 'Dr. Sreeja Pillai (MD)', isAlert: false, x: 35, y: 25, lat: 11.802, lng: 76.003 },
    { name: 'Sulthan Bathery', type: 'CHC', doctor: 'Dr. Joseph Paul (MS)', isAlert: false, x: 72, y: 45, lat: 11.664, lng: 76.257 },
    { name: 'Vythiri Hill', type: 'PHC', doctor: 'Dr. Anoop Raj (MBBS)', isAlert: false, x: 30, y: 78, lat: 11.551, lng: 76.042 },
  ]),
  buildDistrict('kerala', 'Kerala', 'thiruvananthapuram', 'Thiruvananthapuram', 55, 88, [
    { name: 'Nedumangad', type: 'CHC', doctor: 'Dr. Radhika Nair (MD)', isAlert: false, x: 50, y: 38, lat: 8.601, lng: 76.999 },
    { name: 'Vizhinjam Coastal', type: 'PHC', doctor: 'Dr. Arun Kumar (MBBS)', isAlert: false, x: 35, y: 72, lat: 8.379, lng: 76.993 },
    { name: 'Neyyattinkara', type: 'CHC', doctor: 'Dr. Deepa Chandran (DGO)', isAlert: false, x: 65, y: 78, lat: 8.403, lng: 77.086 },
    { name: 'Varkala', type: 'PHC', doctor: 'Dr. Gireesh Babu (MBBS)', isAlert: false, x: 25, y: 22, lat: 8.738, lng: 76.716 },
  ]),
];

// 4. RAJASTHAN
const rajasthanDistricts: District[] = [
  buildDistrict('rajasthan', 'Rajasthan', 'jaipur', 'Jaipur', 58, 42, [
    { name: 'Sanganer', type: 'CHC', doctor: 'Dr. Mahaveer Sharma (MD)', isAlert: false, x: 48, y: 55, lat: 26.818, lng: 75.772 },
    { name: 'Chomu', type: 'CHC', doctor: 'Dr. Sunita Gupta (DGO)', isAlert: false, x: 42, y: 25, lat: 27.168, lng: 75.722 },
    { name: 'Jamwa Ramgarh', type: 'PHC', doctor: 'Dr. Rakesh Meena (MBBS)', isAlert: false, x: 72, y: 35, lat: 27.039, lng: 76.012 },
    { name: 'Bassi', type: 'PHC', doctor: 'Dr. Pooja Choudhary (MBBS)', isAlert: false, x: 68, y: 68, lat: 26.838, lng: 76.046 },
  ], true),
  buildDistrict('rajasthan', 'Rajasthan', 'jodhpur', 'Jodhpur', 35, 52, [
    { name: 'Bilara', type: 'CHC', doctor: 'Dr. Hanuman Ram (MD, Med)', isAlert: true, x: 75, y: 55, lat: 26.182, lng: 73.708 },
    { name: 'Bhopalgarh', type: 'PHC', doctor: 'Dr. Suman Gehlot (MBBS)', isAlert: false, x: 65, y: 28, lat: 26.657, lng: 73.551 },
    { name: 'Luni Desert Block', type: 'PHC', doctor: 'Dr. Narendra Bishnoi (MBBS)', isAlert: true, x: 35, y: 72, lat: 26.069, lng: 73.018 },
    { name: 'Osian Rural', type: 'CHC', doctor: 'Dr. Mukesh Bhati (MS)', isAlert: false, x: 30, y: 25, lat: 26.726, lng: 72.908 },
  ]),
  buildDistrict('rajasthan', 'Rajasthan', 'udaipur', 'Udaipur', 42, 78, [
    { name: 'Jhadol Tribal', type: 'PHC', doctor: 'Dr. Tarun Rawat (MBBS)', isAlert: true, x: 28, y: 65, lat: 24.398, lng: 73.479 },
    { name: 'Kherwara', type: 'CHC', doctor: 'Dr. Rekha Damor (DGO)', isAlert: false, x: 45, y: 82, lat: 23.992, lng: 73.595 },
    { name: 'Mavli', type: 'PHC', doctor: 'Dr. Arvind Joshi (MBBS)', isAlert: false, x: 72, y: 32, lat: 24.789, lng: 73.985 },
    { name: 'Salumber', type: 'CHC', doctor: 'Dr. Govind Meena (MS)', isAlert: false, x: 68, y: 75, lat: 24.137, lng: 74.045 },
  ]),
];

export const STATE_GEO_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  maharashtra: { lat: 19.7515, lng: 75.7139, zoom: 7 },
  uttar_pradesh: { lat: 26.8467, lng: 80.9462, zoom: 7 },
  kerala: { lat: 10.8505, lng: 76.2711, zoom: 8 },
  rajasthan: { lat: 27.0238, lng: 74.2179, zoom: 7 },
  tamil_nadu: { lat: 11.1271, lng: 78.6569, zoom: 7 },
  karnataka: { lat: 15.3173, lng: 75.7139, zoom: 7 },
  bihar: { lat: 25.0961, lng: 85.3131, zoom: 7 },
  madhya_pradesh: { lat: 22.9734, lng: 78.6569, zoom: 7 },
  west_bengal: { lat: 22.9868, lng: 87.8550, zoom: 7 },
  gujarat: { lat: 22.2587, lng: 71.1924, zoom: 7 },
  andhra_pradesh: { lat: 15.9129, lng: 79.7400, zoom: 7 },
  telangana: { lat: 18.1124, lng: 79.0193, zoom: 7 },
  punjab: { lat: 31.1471, lng: 75.3412, zoom: 8 },
  haryana: { lat: 29.0588, lng: 76.0856, zoom: 8 },
  odisha: { lat: 20.9517, lng: 85.0985, zoom: 7 },
  assam: { lat: 26.2006, lng: 92.9376, zoom: 7 },
  jharkhand: { lat: 23.6102, lng: 85.2799, zoom: 7 },
  chhattisgarh: { lat: 21.2787, lng: 81.8661, zoom: 7 },
  uttarakhand: { lat: 30.0668, lng: 79.0193, zoom: 8 },
  himachal_pradesh: { lat: 31.1048, lng: 77.1734, zoom: 8 },
  goa: { lat: 15.2993, lng: 74.1240, zoom: 10 },
  tripura: { lat: 23.9408, lng: 91.9882, zoom: 8 },
  meghalaya: { lat: 25.4670, lng: 91.3662, zoom: 8 },
  manipur: { lat: 24.6637, lng: 93.9063, zoom: 8 },
  nagaland: { lat: 26.1584, lng: 94.5624, zoom: 8 },
  mizoram: { lat: 23.1645, lng: 92.9376, zoom: 8 },
  arunachal_pradesh: { lat: 28.2180, lng: 94.7278, zoom: 7 },
  sikkim: { lat: 27.5330, lng: 88.5122, zoom: 9 },
  delhi: { lat: 28.6139, lng: 77.2090, zoom: 10 },
  jammu_and_kashmir: { lat: 33.7782, lng: 76.5762, zoom: 7 },
  ladakh: { lat: 34.1526, lng: 77.5771, zoom: 7 },
  chandigarh: { lat: 30.7333, lng: 76.7794, zoom: 11 },
  puducherry: { lat: 11.9416, lng: 79.8083, zoom: 10 },
  andaman_nicobar: { lat: 11.7401, lng: 92.6586, zoom: 7 },
  dnh_dd: { lat: 20.4283, lng: 72.8397, zoom: 9 },
  lakshadweep: { lat: 10.5667, lng: 72.6417, zoom: 8 },
};

// Helper to generate realistic generic states for the remaining Indian states/UTs
function createGenericIndianState(
  id: string,
  name: string,
  capital: string,
  districtNames: string[],
  seedOffset: number = 10
): StateData {
  const center = STATE_GEO_CENTERS[id] || { lat: 22.0, lng: 78.0, zoom: 7 };

  const districts: District[] = districtNames.map((dName, dIdx) => {
    const dId = `${id}-${dName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const x = 20 + ((dIdx * 33 + seedOffset) % 60);
    const y = 20 + ((dIdx * 27 + seedOffset * 2) % 60);
    const isSurplus = dIdx === 0;

    // Distribute districts geographically around state center
    const angle = (dIdx / Math.max(1, districtNames.length)) * 2 * Math.PI;
    const distOffsetLat = Math.sin(angle) * 0.45;
    const distOffsetLng = Math.cos(angle) * 0.55;
    const districtLat = center.lat + distOffsetLat;
    const districtLng = center.lng + distOffsetLng;

    const facNames = [
      {
        name: `${dName} Central`,
        type: 'CHC' as const,
        doctor: `Dr. Ramesh ${dName.split(' ')[0]} (MD)`,
        isAlert: false,
        x: 30,
        y: 35,
        lat: Number((districtLat + 0.04).toFixed(4)),
        lng: Number((districtLng + 0.03).toFixed(4)),
      },
      {
        name: `${dName} North Block`,
        type: 'PHC' as const,
        doctor: `Dr. Ananya Sharma (MBBS)`,
        isAlert: !isSurplus && dIdx % 2 === 1,
        x: 65,
        y: 30,
        lat: Number((districtLat + 0.08).toFixed(4)),
        lng: Number((districtLng - 0.04).toFixed(4)),
      },
      {
        name: `${dName} South Rural`,
        type: 'PHC' as const,
        doctor: `Dr. Vikram Patel (MBBS, DCH)`,
        isAlert: false,
        x: 45,
        y: 72,
        lat: Number((districtLat - 0.06).toFixed(4)),
        lng: Number((districtLng + 0.05).toFixed(4)),
      },
      {
        name: `${dName} Community Hub`,
        type: 'CHC' as const,
        doctor: `Dr. Sunita Rao (DGO)`,
        isAlert: false,
        x: 75,
        y: 70,
        lat: Number((districtLat - 0.03).toFixed(4)),
        lng: Number((districtLng - 0.06).toFixed(4)),
      },
    ];

    return buildDistrict(id, name, dId, dName, x, y, facNames, isSurplus);
  });

  const totalStockouts = districts.reduce((acc, d) => acc + d.stockoutAlertCount, 0);
  const totalBeds = districts.reduce((acc, d) => acc + d.bedStressCount, 0);

  return {
    id,
    name,
    countryId: 'india',
    countryName: 'India',
    capital,
    totalDistricts: districtNames.length * 6,
    totalFacilities: districtNames.length * 48,
    activeStockoutAlerts: totalStockouts,
    activeBedAlerts: totalBeds,
    districts,
  };
}

// Complete 28 States and 8 UTs of India
export const ALL_INDIAN_STATES: StateData[] = [
  // 1. Maharashtra
  {
    id: 'maharashtra',
    name: 'Maharashtra',
    countryId: 'india',
    countryName: 'India',
    capital: 'Mumbai',
    totalDistricts: 36,
    totalFacilities: 1840,
    activeStockoutAlerts: 4,
    activeBedAlerts: 3,
    districts: maharashtraDistricts,
  },
  // 2. Uttar Pradesh
  {
    id: 'uttar_pradesh',
    name: 'Uttar Pradesh',
    countryId: 'india',
    countryName: 'India',
    capital: 'Lucknow',
    totalDistricts: 75,
    totalFacilities: 3620,
    activeStockoutAlerts: 6,
    activeBedAlerts: 4,
    districts: uttarPradeshDistricts,
  },
  // 3. Kerala
  {
    id: 'kerala',
    name: 'Kerala',
    countryId: 'india',
    countryName: 'India',
    capital: 'Thiruvananthapuram',
    totalDistricts: 14,
    totalFacilities: 940,
    activeStockoutAlerts: 2,
    activeBedAlerts: 1,
    districts: keralaDistricts,
  },
  // 4. Rajasthan
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    countryId: 'india',
    countryName: 'India',
    capital: 'Jaipur',
    totalDistricts: 50,
    totalFacilities: 2180,
    activeStockoutAlerts: 4,
    activeBedAlerts: 3,
    districts: rajasthanDistricts,
  },
  // 5. Tamil Nadu
  createGenericIndianState('tamil_nadu', 'Tamil Nadu', 'Chennai', ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'], 12),
  // 6. Karnataka
  createGenericIndianState('karnataka', 'Karnataka', 'Bengaluru', ['Bengaluru Urban', 'Mysuru', 'Belagavi', 'Dakshina Kannada', 'Kalaburagi'], 15),
  // 7. Bihar
  createGenericIndianState('bihar', 'Bihar', 'Patna', ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'], 18),
  // 8. Madhya Pradesh
  createGenericIndianState('madhya_pradesh', 'Madhya Pradesh', 'Bhopal', ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'], 21),
  // 9. West Bengal
  createGenericIndianState('west_bengal', 'West Bengal', 'Kolkata', ['Kolkata', 'North 24 Parganas', 'Howrah', 'Darjeeling', 'Murshidabad'], 24),
  // 10. Gujarat
  createGenericIndianState('gujarat', 'Gujarat', 'Gandhinagar', ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Kutch'], 27),
  // 11. Andhra Pradesh
  createGenericIndianState('andhra_pradesh', 'Andhra Pradesh', 'Amaravati', ['Visakhapatnam', 'Vijayawada (NTR)', 'Guntur', 'Tirupati', 'Kurnool'], 30),
  // 12. Telangana
  createGenericIndianState('telangana', 'Telangana', 'Hyderabad', ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar'], 33),
  // 13. Punjab
  createGenericIndianState('punjab', 'Punjab', 'Chandigarh', ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'], 36),
  // 14. Haryana
  createGenericIndianState('haryana', 'Haryana', 'Chandigarh', ['Gurugram', 'Faridabad', 'Hisar', 'Karnal', 'Ambala'], 39),
  // 15. Odisha
  createGenericIndianState('odisha', 'Odisha', 'Bhubaneswar', ['Khordha', 'Cuttack', 'Sundargarh', 'Ganjam', 'Sambalpur'], 42),
  // 16. Assam
  createGenericIndianState('assam', 'Assam', 'Dispur', ['Kamrup Metropolitan', 'Dibrugarh', 'Silchar (Cachar)', 'Jorhat', 'Nagaon'], 45),
  // 17. Jharkhand
  createGenericIndianState('jharkhand', 'Jharkhand', 'Ranchi', ['Ranchi', 'East Singhbhum', 'Dhanbad', 'Bokaro', 'Hazaribagh'], 48),
  // 18. Chhattisgarh
  createGenericIndianState('chhattisgarh', 'Chhattisgarh', 'Raipur', ['Raipur', 'Durg', 'Bilaspur', 'Bastar', 'Rajnandgaon'], 51),
  // 19. Uttarakhand
  createGenericIndianState('uttarakhand', 'Uttarakhand', 'Dehradun', ['Dehradun', 'Haridwar', 'Nainital', 'Udham Singh Nagar', 'Almora'], 54),
  // 20. Himachal Pradesh
  createGenericIndianState('himachal_pradesh', 'Himachal Pradesh', 'Shimla', ['Shimla', 'Kangra', 'Mandi', 'Kullu', 'Solan'], 57),
  // 21. Goa
  createGenericIndianState('goa', 'Goa', 'Panaji', ['North Goa', 'South Goa'], 60),
  // 22. Tripura
  createGenericIndianState('tripura', 'Tripura', 'Agartala', ['West Tripura', 'South Tripura', 'Dhalai', 'Gomati'], 63),
  // 23. Meghalaya
  createGenericIndianState('meghalaya', 'Meghalaya', 'Shillong', ['East Khasi Hills', 'West Garo Hills', 'Ri-Bhoi', 'Jaintia Hills'], 66),
  // 24. Manipur
  createGenericIndianState('manipur', 'Manipur', 'Imphal', ['Imphal West', 'Imphal East', 'Churachandpur', 'Thoubal'], 69),
  // 25. Nagaland
  createGenericIndianState('nagaland', 'Nagaland', 'Kohima', ['Kohima', 'Dimapur', 'Mokokchung', 'Mon'], 72),
  // 26. Mizoram
  createGenericIndianState('mizoram', 'Mizoram', 'Aizawl', ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib'], 75),
  // 27. Arunachal Pradesh
  createGenericIndianState('arunachal_pradesh', 'Arunachal Pradesh', 'Itanagar', ['Papum Pare', 'Changlang', 'West Kameng', 'Tawang'], 78),
  // 28. Sikkim
  createGenericIndianState('sikkim', 'Sikkim', 'Gangtok', ['East Sikkim', 'West Sikkim', 'South Sikkim', 'North Sikkim'], 81),

  // UNION TERRITORIES (8 UTs)
  // 29. Delhi (NCT)
  createGenericIndianState('delhi', 'Delhi (NCT)', 'New Delhi', ['New Delhi', 'South Delhi', 'North Delhi', 'West Delhi', 'East Delhi'], 84),
  // 30. Jammu and Kashmir
  createGenericIndianState('jammu_and_kashmir', 'Jammu and Kashmir', 'Srinagar', ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur'], 87),
  // 31. Ladakh
  createGenericIndianState('ladakh', 'Ladakh', 'Leh', ['Leh', 'Kargil'], 90),
  // 32. Chandigarh
  createGenericIndianState('chandigarh', 'Chandigarh (UT)', 'Chandigarh', ['Chandigarh Urban', 'Chandigarh Rural'], 93),
  // 33. Puducherry
  createGenericIndianState('puducherry', 'Puducherry (UT)', 'Puducherry', ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'], 96),
  // 34. Andaman and Nicobar Islands
  createGenericIndianState('andaman_nicobar', 'Andaman and Nicobar Islands', 'Port Blair', ['South Andaman', 'North and Middle Andaman', 'Nicobar'], 99),
  // 35. Dadra and Nagar Haveli and Daman and Diu
  createGenericIndianState('dnh_dd', 'Dadra and Nagar Haveli & Daman and Diu', 'Daman', ['Daman', 'Diu', 'Dadra & Nagar Haveli'], 102),
  // 36. Lakshadweep
  createGenericIndianState('lakshadweep', 'Lakshadweep', 'Kavaratti', ['Kavaratti', 'Agatti', 'Minicoy', 'Andrott'], 105),
];

export const HEALTH_DATA_STORE: CountryData[] = [
  {
    id: 'india',
    name: 'India',
    code: 'IND',
    flagEmoji: '🇮🇳',
    healthProgramName: 'National Health Mission (NHM) & Ayushman Bharat Digital Health Grid',
    states: ALL_INDIAN_STATES,
  },
];

export const INITIAL_REDISTRIBUTIONS: RedistributionTransfer[] = [
  {
    id: 'tr-101',
    sourceDistrictId: 'nagpur',
    sourceDistrictName: 'Nagpur District (Central Depot)',
    targetDistrictId: 'pune',
    targetDistrictName: 'Pune District (Deficit PHCs)',
    itemType: 'IV Normal Saline (500ml)',
    quantity: 1200,
    unit: 'Bottles',
    urgency: 'HIGH',
    transitStatus: 'IN_TRANSIT',
    vehicleType: 'Refrigerated Cold-Chain Van (MH-31-AZ-8841)',
    distanceKm: 710,
    etaHours: 3.5,
    rationale: 'Khed Shivapur and Saswad PHCs breached 48h emergency reserve buffer during monsoon viral spike.',
    dispatchedAt: '2026-08-17 06:30',
    temperatureControlled: true,
  },
  {
    id: 'tr-102',
    sourceDistrictId: 'lucknow',
    sourceDistrictName: 'Lucknow District (State Central Drug Store)',
    targetDistrictId: 'gorakhpur',
    targetDistrictName: 'Gorakhpur District (Surveillance Grid)',
    itemType: 'ORS Electrolyte Sachets & Zinc Tablets',
    quantity: 3500,
    unit: 'Packets',
    urgency: 'HIGH',
    transitStatus: 'IN_TRANSIT',
    vehicleType: 'Dedicated Medical Courier (UP-32-EG-4921)',
    distanceKm: 275,
    etaHours: 1.8,
    rationale: 'Acute waterborne gastroenteritis cases reported across rural Terai belt PHCs.',
    dispatchedAt: '2026-08-17 07:15',
    temperatureControlled: false,
  },
  {
    id: 'tr-103',
    sourceDistrictId: 'jaipur',
    sourceDistrictName: 'Jaipur District (RMSC Warehouse)',
    targetDistrictId: 'jodhpur',
    targetDistrictName: 'Jodhpur District (Western Thar Grid)',
    itemType: 'Anti-Snake Venom (ASV) & Doxycycline',
    quantity: 150,
    unit: 'Vials',
    urgency: 'EMERGENCY',
    transitStatus: 'IN_TRANSIT',
    vehicleType: 'Cold-Chain Mobile Unit (RJ-14-MD-1102)',
    distanceKm: 335,
    etaHours: 2.2,
    rationale: 'Bilara CHC emergency trauma center ran out of ASV stock following seasonal surge.',
    dispatchedAt: '2026-08-17 08:00',
    temperatureControlled: true,
  },
];

export const INITIAL_OUTBREAK_ALERTS: OutbreakAlert[] = [
  {
    id: 'outbreak-101',
    diseaseName: 'Monsoon Dengue / Acute Febrile Illness Surge',
    stateId: 'maharashtra',
    stateName: 'Maharashtra',
    districtId: 'pune',
    districtName: 'Pune District',
    affectedFacilityNames: ['Khed Shivapur PHC', 'Manchar CHC', 'Saswad PHC'],
    severity: 'CRITICAL',
    reportedDate: '2026-08-16',
    casesLast7Days: 318,
    reproductiveRateEst: 1.92,
    surgeMultiplier: 3.4,
    criticalMedicineNeeds: ['IV Normal Saline (500ml)', 'Paracetamol 650mg', 'Platelet Count Reagents', 'NS1 Rapid Antigen Kits'],
    emergencyActionStatus: 'ACTIVE_RESPONSE',
    federatedInsightSummary: 'Syndromic surveillance correlates vector breeding index with rainfall anomalies; predicts 14-day wave peak unless source reduction reaches 85%.',
  },
  {
    id: 'outbreak-102',
    diseaseName: 'Acute Gastroenteritis / Waterborne Diarrhea Cluster',
    stateId: 'uttar_pradesh',
    stateName: 'Uttar Pradesh',
    districtId: 'gorakhpur',
    districtName: 'Gorakhpur District',
    affectedFacilityNames: ['Bhathat Block PHC', 'Campierganj CHC'],
    severity: 'HIGH',
    reportedDate: '2026-08-15',
    casesLast7Days: 194,
    reproductiveRateEst: 1.45,
    surgeMultiplier: 2.7,
    criticalMedicineNeeds: ['ORS Electrolyte Sachets', 'Zinc Sulphate 20mg', 'Ciprofloxacin 500mg', 'IV Ringer Lactate'],
    emergencyActionStatus: 'CONTAINMENT_PHASE',
    federatedInsightSummary: 'Early rehydration protocol deployed via ASHA door-to-door triage: zero severe dehydration fatalities recorded in primary care tier.',
  },
  {
    id: 'outbreak-103',
    diseaseName: 'Scrub Typhus / Vector-Borne Febrile Spike',
    stateId: 'rajasthan',
    stateName: 'Rajasthan',
    districtId: 'jodhpur',
    districtName: 'Jodhpur District',
    affectedFacilityNames: ['Bilara CHC', 'Luni Desert Block PHC'],
    severity: 'HIGH',
    reportedDate: '2026-08-14',
    casesLast7Days: 142,
    reproductiveRateEst: 1.38,
    surgeMultiplier: 2.1,
    criticalMedicineNeeds: ['Doxycycline 100mg Capsules', 'Azithromycin 500mg', 'IV Normal Saline (500ml)'],
    emergencyActionStatus: 'ASSESSMENT_TRIGGERED',
    federatedInsightSummary: 'Early diagnostic testing with IgM ELISA and prompt doxycycline administration established across rural CHC triage rooms.',
  },
];

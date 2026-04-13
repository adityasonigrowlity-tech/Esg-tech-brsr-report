/**
 * Central type definitions and formula engine for BRSR reporting.
 * Covers Principle 3 (Employee Well-being) and Principle 6 (Environment).
 */

// ─── Raw PY Data (user-entered or LLM-extracted) ────────────────────────────

export interface PyData {
  // Q1: Energy — raw inputs
  energy_A: number;       // Electricity from renewable (GJ)
  energy_B: number;       // Fuel from renewable (GJ)
  energy_C: number;       // Other renewable sources (GJ)
  energy_D: number;       // Electricity from non-renewable (GJ)
  energy_E: number;       // Fuel from non-renewable (GJ)
  energy_F: number;       // Other non-renewable sources (GJ)
  Revenue: number;        // Revenue from operations (₹ Cr)
  Production: number;     // Physical output / production (MT)

  // Q1: Energy — formula fields
  RevenuePPP: number;     // Revenue × 10 / 20.66 (M USD)

  // Q3: Water — raw inputs
  water_surface: number;     // Surface water withdrawal (kL)
  water_ground: number;      // Groundwater withdrawal (kL)
  water_thirdparty: number;  // Third party water (kL)
  water_seawater: number;    // Seawater / desalinated (kL)
  water_others: number;      // Others (kL)
  water_consumption: number; // Total volume of water consumption (kL)

  // Q4: Water Discharge — raw inputs (kL)
  wd_surface_notx: number;  // Surface — no treatment
  wd_surface_tx: number;    // Surface — with treatment
  wd_ground_notx: number;   // Groundwater — no treatment
  wd_ground_tx: number;     // Groundwater — with treatment
  wd_sea_notx: number;      // Seawater — no treatment
  wd_sea_tx: number;        // Seawater — with treatment
  wd_third_notx: number;    // Third party — no treatment
  wd_third_tx: number;      // Third party — with treatment
  wd_others_notx: number;   // Others — no treatment
  wd_others_tx: number;     // Others — with treatment

  // Q6: Air Emissions (MT)
  air_nox: number;
  air_sox: number;
  air_pm: number;

  // Q7: GHG Emissions (tCO₂Eq)
  ghg_scope1: number;
  ghg_scope2: number;

  // Q9: Waste — generated (MT)
  waste_A: number;  // Plastic
  waste_B: number;  // E-waste
  waste_C: number;  // Bio-medical
  waste_D: number;  // Construction & demolition
  waste_E: number;  // Battery
  waste_F: number;  // Radioactive
  waste_G: number;  // Other hazardous
  waste_H: number;  // Other non-hazardous

  // Q9: Waste — recovery (MT)
  waste_recycled: number;
  waste_reused: number;
  waste_recovery_other: number;

  // Q9: Waste — disposal (MT)
  waste_incineration: number;
  waste_landfill: number;
  waste_landfill_incineration: number;

  // Narrative Disclosures (Principle 6)
  theory_q1: string;
  theory_q2: string;
  theory_q3: string;
  theory_q4: string;
  theory_q5: string;
  theory_q6: string;
  theory_q7: string;
  theory_q8: string;
  theory_q9: string;
  theory_q10: string;
  theory_q11: string;
  theory_q12: string;
  theory_q13: string;

  // ─── Principle 3: Employee Well-being & Safety ──────────────────────────────
  p3_iso_45001_percent: number;
  p3_fatalities_employees: number;
  p3_fatalities_workers: number;
  p3_ltifr: number;
  p3_assessment_hs_percent: number;
  p3_assessment_wc_percent: number;
  p3_complaints_wc_filed: number;
  p3_complaints_wc_pending: number;
  p3_complaints_hs_filed: number;
  p3_complaints_hs_pending: number;
  p3_ca_hand_injury: string;
  p3_ca_safety_incident: string;
  p3_mechanisms_violence: string;
  p3_sh_complaints: string;
  p3_sh_preventive_measures: string;
  p3_mat_emp: number;
  p3_mat_work: number;
  p3_daycare_emp: number;
  p3_daycare_work: number;
  p3_train_safety_emp: number;
  p3_train_safety_work: number;
  p3_train_skill_emp: number;
  p3_train_skill_work: number;
  p3_hs_committee_emp: number;
  p3_hs_committee_work: number;
  p3_worker_reporting: string;
}

export const DEFAULT_PY_DATA: PyData = {
  energy_A: 0, energy_B: 0, energy_C: 0,
  energy_D: 0, energy_E: 0, energy_F: 0,
  Revenue: 0, Production: 0, RevenuePPP: 0,
  water_surface: 0, water_ground: 0, water_thirdparty: 0,
  water_seawater: 0, water_others: 0, water_consumption: 0,
  wd_surface_notx: 0, wd_surface_tx: 0,
  wd_ground_notx: 0, wd_ground_tx: 0,
  wd_sea_notx: 0, wd_sea_tx: 0,
  wd_third_notx: 0, wd_third_tx: 0,
  wd_others_notx: 0, wd_others_tx: 0,
  air_nox: 0, air_sox: 0, air_pm: 0,
  ghg_scope1: 0, ghg_scope2: 0,
  waste_A: 0, waste_B: 0, waste_C: 0, waste_D: 0,
  waste_E: 0, waste_F: 0, waste_G: 0, waste_H: 0,
  waste_recycled: 0, waste_reused: 0, waste_recovery_other: 0,
  waste_incineration: 0, waste_landfill: 0, waste_landfill_incineration: 0,
  theory_q1: '', theory_q2: '', theory_q3: '', theory_q4: '',
  theory_q5: '', theory_q6: '', theory_q7: '', theory_q8: '', theory_q9: '',
  theory_q10: '', theory_q11: '', theory_q12: '', theory_q13: '',
  p3_iso_45001_percent: 0, p3_fatalities_employees: 0, p3_fatalities_workers: 0,
  p3_ltifr: 0, p3_assessment_hs_percent: 0, p3_assessment_wc_percent: 0,
  p3_complaints_wc_filed: 0, p3_complaints_wc_pending: 0,
  p3_complaints_hs_filed: 0, p3_complaints_hs_pending: 0,
  p3_ca_hand_injury: '',
  p3_ca_safety_incident: '',
  p3_mechanisms_violence: '',
  p3_sh_complaints: '',
  p3_sh_preventive_measures: '',
  p3_mat_emp: 0, p3_mat_work: 0,
  p3_daycare_emp: 0, p3_daycare_work: 0,
  p3_train_safety_emp: 0, p3_train_safety_work: 0,
  p3_train_skill_emp: 0, p3_train_skill_work: 0,
  p3_hs_committee_emp: 0, p3_hs_committee_work: 0,
  p3_worker_reporting: '',
};

// ─── Current-Year Form Data (wizard entries) ─────────────────────────────────

export type BrsrFormData = Record<keyof PyData, string>;

export const DEFAULT_FORM_DATA: BrsrFormData = Object.fromEntries(
  Object.keys(DEFAULT_PY_DATA).map(k => [k, ''])
) as BrsrFormData;

// ─── Derived (formula) calculations ─────────────────────────────────────────

export interface DerivedMetrics {
  // Q1 Energy
  energy_renewable_total: number;    
  energy_nonrenewable_total: number; 
  energy_total: number;              
  energy_intensity_revenue: number;  
  energy_intensity_ppp: number;      
  energy_intensity_production: number; 
  RevenuePPP: number;                

  // Q3 Water
  water_withdrawal_total: number;    
  water_intensity_revenue: number;   
  water_intensity_ppp: number;       
  water_intensity_production: number; 

  // Q4 Water Discharge
  wd_total: number;                  

  // Q7 GHG
  ghg_total: number;                 
  ghg_intensity_revenue: number;     
  ghg_intensity_ppp: number;         
  ghg_intensity_production: number;  

  // Q9 Waste
  waste_total: number;               
  waste_intensity_revenue: number;   
  waste_intensity_ppp: number;       
  waste_intensity_production: number; 
  waste_recovery_total: number;      
  waste_disposal_total: number;      
}

export const PPP_FACTOR = 20.66;

export const roundTo = (v: number, dp: number): number =>
  Math.round(v * Math.pow(10, dp)) / Math.pow(10, dp);

export const safeDivide = (num: number, den: number, dp = 10): number =>
  den > 0 && isFinite(num) && isFinite(den) ? roundTo(num / den, dp) : 0;

export function computeMetrics(
  data: PyData | BrsrFormData,
  revenuePPP?: number
): DerivedMetrics {
  const n = (key: keyof PyData): number => {
    const val = data[key];
    if (typeof val === 'number') return isFinite(val) ? val : 0;
    if (typeof val === 'string') return parseFloat(val.replace(/,/g, '')) || 0;
    return 0;
  };

  const revenue = n('Revenue');
  const ppp = (revenuePPP !== undefined && revenuePPP > 0)
    ? revenuePPP
    : (revenue > 0 ? roundTo((revenue * 10) / PPP_FACTOR, 4) : 0);
  const prod = n('Production');

  // Q1 Energy
  const energyRenew = n('energy_A') + n('energy_B') + n('energy_C');
  const energyNonRenew = n('energy_D') + n('energy_E') + n('energy_F');
  const energyTotal = energyRenew + energyNonRenew;

  // Q3 Water
  const waterWithdrawTotal = 
    n('water_surface') + n('water_ground') + n('water_thirdparty') + 
    n('water_seawater') + n('water_others');
  const waterConsumption = n('water_consumption');

  // Q4 Water Discharge
  const wdTotal = 
    n('wd_surface_notx') + n('wd_surface_tx') + n('wd_ground_notx') + n('wd_ground_tx') + 
    n('wd_sea_notx') + n('wd_sea_tx') + n('wd_third_notx') + n('wd_third_tx') + 
    n('wd_others_notx') + n('wd_others_tx');

  // Q7 GHG
  const ghgTotal = n('ghg_scope1') + n('ghg_scope2');

  // Q9 Waste
  const wasteGenerated = 
    n('waste_A') + n('waste_B') + n('waste_C') + n('waste_D') + 
    n('waste_E') + n('waste_F') + n('waste_G') + n('waste_H');
  const wasteRecoveryTotal = 
    n('waste_recycled') + n('waste_reused') + n('waste_recovery_other');
  const wasteDisposalTotal = 
    n('waste_incineration') + n('waste_landfill') + n('waste_landfill_incineration');

  return {
    energy_renewable_total:     energyRenew,
    energy_nonrenewable_total:  energyNonRenew,
    energy_total:               energyTotal,
    energy_intensity_revenue:   safeDivide(energyTotal, revenue),
    energy_intensity_ppp:       safeDivide(energyTotal, ppp),
    energy_intensity_production: safeDivide(energyTotal, prod),
    RevenuePPP:                 ppp,

    water_withdrawal_total:     waterWithdrawTotal,
    water_intensity_revenue:    safeDivide(waterConsumption, revenue),
    water_intensity_ppp:        safeDivide(waterConsumption, ppp),
    water_intensity_production: safeDivide(waterConsumption, prod),

    wd_total: wdTotal,

    ghg_total:               ghgTotal,
    ghg_intensity_revenue:   safeDivide(ghgTotal, revenue),
    ghg_intensity_ppp:       safeDivide(ghgTotal, ppp),
    ghg_intensity_production: safeDivide(ghgTotal, prod),

    waste_total:               wasteGenerated,
    waste_intensity_revenue:   safeDivide(wasteGenerated, revenue),
    waste_intensity_ppp:       safeDivide(wasteGenerated, ppp),
    waste_intensity_production: safeDivide(wasteGenerated, prod),
    waste_recovery_total:      wasteRecoveryTotal,
    waste_disposal_total:      wasteDisposalTotal,
  };
}

// ─── Step Configuration ───────────────────────────────────────────────────────

export interface StepConfig {
  key: keyof PyData;
  title: string;
  category: string;
  section: string;
  unit: string;
  tip: string;
}

export const STEPS_CONFIG: StepConfig[] = [
  // ─── P3_Q1: Health & Safety Assessments ────────────────────────────────────
  { key: 'p3_iso_45001_percent', section: 'P3_Q1', unit: '%', category: 'Health & Safety', title: '% of sites ISO 45001 certified', tip: 'Percentage of global operational sites certified to ISO 45001.' },
  { key: 'p3_assessment_hs_percent', section: 'P3_Q1', unit: '%', category: 'Assessments', title: 'Health and safety practices assessment', tip: '% of plants/offices assessed for safety.' },
  { key: 'p3_assessment_wc_percent', section: 'P3_Q1', unit: '%', category: 'Assessments', title: 'Working conditions assessment', tip: '% of plants/offices assessed for working conditions.' },

  // ─── P3_Q2: Safety Incidents ────────────────────────────────────────────────
  { key: 'p3_fatalities_employees', section: 'P3_Q2', unit: 'Nos.', category: 'Safety KPIs', title: 'Fatalities (Employees)', tip: 'Number of fatalities among employees.' },
  { key: 'p3_fatalities_workers', section: 'P3_Q2', unit: 'Nos.', category: 'Safety KPIs', title: 'Fatalities (Workers)', tip: 'Number of fatalities among workers.' },
  { key: 'p3_ltifr', section: 'P3_Q2', unit: 'Rate', category: 'Safety KPIs', title: 'LTIFR', tip: 'Lost Time Injury Frequency Rate.' },

  // ─── P3_Q3: Complaints ──────────────────────────────────────────────────────
  { key: 'p3_complaints_wc_filed', section: 'P3_Q3', unit: 'Nos.', category: 'Complaints', title: 'Working Conditions (Filed)', tip: 'Number of complaints filed.' },
  { key: 'p3_complaints_wc_pending', section: 'P3_Q3', unit: 'Nos.', category: 'Complaints', title: 'Working Conditions (Pending)', tip: 'Complaints pending resolution.' },
  { key: 'p3_complaints_hs_filed', section: 'P3_Q3', unit: 'Nos.', category: 'Complaints', title: 'Health & Safety (Filed)', tip: 'Number of complaints filed regarding H&S.' },
  { key: 'p3_complaints_hs_pending', section: 'P3_Q3', unit: 'Nos.', category: 'Complaints', title: 'Health & Safety (Pending)', tip: 'Complaints pending resolution at end of year.' },

  // ─── P3_Q4: Corrective Actions ──────────────────────────────────────────────
  { key: 'p3_ca_hand_injury', section: 'P3_Q4', unit: 'Text', category: 'Corrective Actions', title: 'Hand Injury Risk Mitigation', tip: 'Mitigation measures for significant risks like hand injuries.' },

  // ─── P6_Q1: Energy ───────────────────────────────────────────────────────────
  { key: 'energy_A', section: 'P6_Q1', unit: 'GJ', category: 'renewable sources', title: 'Total electricity consumption (A)', tip: 'Include only electricity verified from renewable grids or green tariffs.' },
  { key: 'energy_B', section: 'P6_Q1', unit: 'GJ', category: 'renewable sources', title: 'Total fuel consumption (B)', tip: 'Includes biofuels and biogas used directly in your operations.' },
  { key: 'energy_C', section: 'P6_Q1', unit: 'GJ', category: 'renewable sources', title: 'Energy through other sources (C)', tip: 'Include solar, wind, and hydro directly produced on-site.' },
  { key: 'energy_D', section: 'P6_Q1', unit: 'GJ', category: 'non-renewable sources', title: 'Total electricity consumption (D)', tip: 'Standard grid electricity from non-renewable sources.' },
  { key: 'energy_E', section: 'P6_Q1', unit: 'GJ', category: 'non-renewable sources', title: 'Total fuel consumption (E)', tip: 'Diesel, petrol, coal, and natural gas.' },
  { key: 'energy_F', section: 'P6_Q1', unit: 'GJ', category: 'non-renewable sources', title: 'Energy through other sources (F)', tip: 'Any other non-renewable energy purchased or generated.' },
  { key: 'Revenue',  section: 'P6_Q1', unit: '₹ Cr', category: 'financials', title: 'Revenue from operations', tip: 'Used to calculate Energy Intensity. Enter in Crores INR.' },
  { key: 'RevenuePPP', section: 'P6_Q1', unit: 'M USD', category: 'financials', title: 'Revenue adjusted for PPP', tip: 'Auto-calculated: Revenue × 10 ÷ 20.66. Required for PPP-adjusted intensity.' },
  { key: 'Production', section: 'P6_Q1', unit: 'MT', category: 'production', title: 'Physical output — Production', tip: 'Used to calculate Energy intensity in terms of physical output.' },

  // ─── P6_Q2: PAT ──────────────────────────────────────────────────────────────
  { key: 'theory_q2', section: 'P6_Q2', unit: 'Text', category: 'theory', title: 'Designated Consumers (DCs)', tip: 'Does the entity have sites identified as DCs under PAT scheme?' },

  // ─── P6_Q3: Water Withdrawal ─────────────────────────────────────────────────
  { key: 'water_surface',     section: 'P6_Q3', unit: 'kL', category: 'water withdrawal', title: '(i) Surface water', tip: 'Total kiloliters withdrawn from rivers, lakes, streams, or any surface body.' },
  { key: 'water_ground',      section: 'P6_Q3', unit: 'kL', category: 'water withdrawal', title: '(ii) Groundwater', tip: 'Water extracted from wells and boreholes.' },
  { key: 'water_thirdparty',  section: 'P6_Q3', unit: 'kL', category: 'water withdrawal', title: '(iii) Third party water (Municipal)', tip: 'Water purchased from municipal or commercial suppliers.' },
  { key: 'water_seawater',    section: 'P6_Q3', unit: 'kL', category: 'water withdrawal', title: '(iv) Seawater / desalinated water', tip: 'Seawater withdrawn or desalinated water used.' },
  { key: 'water_others',      section: 'P6_Q3', unit: 'kL', category: 'water withdrawal', title: '(v) Others', tip: 'Any other source of water not covered above.' },
  { key: 'water_consumption', section: 'P6_Q3', unit: 'kL', category: 'water consumption', title: 'Total volume of water consumption', tip: 'Total water consumed (may differ from withdrawal due to recycling/reuse).' },

  // ─── P6_Q4: Water Discharge ──────────────────────────────────────────────────
  { key: 'wd_surface_notx', section: 'P6_Q4', unit: 'kL', category: 'surface water', title: 'To surface water — no treatment', tip: 'Untreated discharge directly to rivers, lakes, or streams.' },
  { key: 'wd_surface_tx',   section: 'P6_Q4', unit: 'kL', category: 'surface water', title: 'To surface water — with treatment', tip: 'Treated effluent discharged to surface water bodies.' },
  { key: 'wd_ground_notx',  section: 'P6_Q4', unit: 'kL', category: 'groundwater', title: 'To groundwater — no treatment', tip: 'Untreated water discharged to ground (e.g., seepage).' },
  { key: 'wd_ground_tx',    section: 'P6_Q4', unit: 'kL', category: 'groundwater', title: 'To groundwater — with treatment', tip: 'Treated water recharged to ground.' },
  { key: 'wd_sea_notx',     section: 'P6_Q4', unit: 'kL', category: 'seawater', title: 'To seawater — no treatment', tip: 'Untreated discharge to sea.' },
  { key: 'wd_sea_tx',       section: 'P6_Q4', unit: 'kL', category: 'seawater', title: 'To seawater — with treatment', tip: 'Treated effluent discharged to sea.' },
  { key: 'wd_third_notx',   section: 'P6_Q4', unit: 'kL', category: 'third party', title: 'To third parties — no treatment', tip: 'Sent to CETP or other third parties without prior treatment.' },
  { key: 'wd_third_tx',     section: 'P6_Q4', unit: 'kL', category: 'third party', title: 'To third parties — with treatment', tip: 'Pre-treated before sending to third parties.' },
  { key: 'wd_others_notx',  section: 'P6_Q4', unit: 'kL', category: 'others', title: 'Others — no treatment', tip: 'Any other discharge method, untreated.' },
  { key: 'wd_others_tx',    section: 'P6_Q4', unit: 'kL', category: 'others', title: 'Others — with treatment', tip: 'Any other discharge method, treated (e.g., used for irrigation after STP).' },

  // ─── P6_Q5: ZLD ──────────────────────────────────────────────────────────────
  { key: 'theory_q5', section: 'P6_Q5', unit: 'Text', category: 'theory', title: 'Zero Liquid Discharge (ZLD)', tip: 'Details of Zero Liquid Discharge Mechanism if applicable.' },

  // ─── P6_Q6: Air Emissions ───────────────────────────────────────────────────
  { key: 'air_nox', section: 'P6_Q6', unit: 'MT', category: 'air emissions', title: 'NOx emissions', tip: 'Nitrogen oxides emissions in Metric Tons.' },
  { key: 'air_sox', section: 'P6_Q6', unit: 'MT', category: 'air emissions', title: 'SOx emissions', tip: 'Sulfur oxides emissions in Metric Tons.' },
  { key: 'air_pm',  section: 'P6_Q6', unit: 'MT', category: 'air emissions', title: 'Particulate matter emissions', tip: 'PM emissions in Metric Tons.' },

  // ─── P6_Q7: GHG Emissions ───────────────────────────────────────────────────
  { key: 'ghg_scope1', section: 'P6_Q7', unit: 'tCO₂Eq', category: 'GHG emissions', title: 'Total Scope 1 emissions', tip: 'Direct GHG from owned/controlled sources.' },
  { key: 'ghg_scope2', section: 'P6_Q7', unit: 'tCO₂Eq', category: 'GHG emissions', title: 'Total Scope 2 emissions', tip: 'Indirect GHG from purchased electricity.' },

  // ─── P6_Q8: GHG Reduction ───────────────────────────────────────────────────
  { key: 'theory_q8', section: 'P6_Q8', unit: 'Text', category: 'theory', title: 'GHG Reduction Initiatives', tip: 'Projects undertaken to reduce greenhouse gas emissions.' },

  // ─── P6_Q9: Waste ───────────────────────────────────────────────────────────
  { key: 'waste_A', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'Plastic waste (A)', tip: 'Total plastic waste generated.' },
  { key: 'waste_B', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'E-waste (B)', tip: 'Electronic waste.' },
  { key: 'waste_C', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'Bio-medical waste (C)', tip: 'Waste from medical activities.' },
  { key: 'waste_D', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'Construction & demolition waste (D)', tip: 'From building activities.' },
  { key: 'waste_E', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'Battery waste (E)', tip: 'Spent batteries.' },
  { key: 'waste_F', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'Radioactive waste (F)', tip: 'Applicable if entity uses radioactive materials.' },
  { key: 'waste_G', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'Other hazardous waste (G)', tip: 'Used oil, spent chemicals, etc.' },
  { key: 'waste_H', section: 'P6_Q9', unit: 'MT', category: 'waste generated', title: 'Other non-hazardous waste (H)', tip: 'Metal scrap, general solid waste, etc.' },
  { key: 'waste_recycled',        section: 'P6_Q9', unit: 'MT', category: 'waste recovery', title: '(i) Recycled', tip: 'Waste sent to recycling processes.' },
  { key: 'waste_reused',          section: 'P6_Q9', unit: 'MT', category: 'waste recovery', title: '(ii) Re-used', tip: 'Waste repurposed without reprocessing.' },
  { key: 'waste_recovery_other',  section: 'P6_Q9', unit: 'MT', category: 'waste recovery', title: '(iii) Other recovery operations', tip: 'Energy recovery, composting, etc.' },
  { key: 'waste_incineration',           section: 'P6_Q9', unit: 'MT', category: 'waste disposal', title: '(i) Incineration', tip: 'Waste sent for thermal destruction.' },
  { key: 'waste_landfill',               section: 'P6_Q9', unit: 'MT', category: 'waste disposal', title: '(ii) Landfilling', tip: 'Waste disposed in landfills.' },
  { key: 'waste_landfill_incineration',  section: 'P6_Q9', unit: 'MT', category: 'waste disposal', title: '(iii) Other disposal operations', tip: 'Any other disposal method.' },

  // ─── P6_Q10: Waste Practices ─────────────────────────────────────────────────
  { key: 'theory_q10', section: 'P6_Q10', unit: 'Text', category: 'theory', title: 'Waste Management Practices', tip: 'Briefly describe the waste management practices adopted.' },

  // ─── P6_Q11: Sensitive Areas ─────────────────────────────────────────────────
  { key: 'theory_q11', section: 'P6_Q11', unit: 'Text', category: 'theory', title: 'Ecologically Sensitive Areas', tip: 'Operations in/around ecologically sensitive areas.' },

  // ─── P6_Q12: EIA ─────────────────────────────────────────────────────────────
  { key: 'theory_q12', section: 'P6_Q12', unit: 'Text', category: 'theory', title: 'Environmental Impact Assessments', tip: 'Details of environmental impact assessments undertaken.' },

  // ─── P6_Q13: Compliance ──────────────────────────────────────────────────────
  { key: 'theory_q13', section: 'P6_Q13', unit: 'Text', category: 'theory', title: 'Environmental Compliance', tip: 'Is the entity compliant with applicable environmental regulations?' },
];

export const isFormulaKey = (key: keyof PyData): boolean => ['RevenuePPP'].includes(key);

export interface QuestionConfig {
  number: number | string;
  section: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  hasTable: boolean;
  fields: StepConfig[];
  principle?: number;
}

export const QUESTIONS_CONFIG: QuestionConfig[] = [
  // ─── Principle 3 (Sequential Q1-Q4) ─────────────────────────────────────────
  {
    number: 'Q1', section: 'P3_Q1', principle: 3,
    title: 'Assessments for the year (Health & Safety, Working Conditions)',
    description: '% of plants and offices that were assessed by entity or third parties.',
    icon: 'assignment_turned_in', color: 'emerald', hasTable: true, fields: [],
  },
  {
    number: 'Q2', section: 'P3_Q2', principle: 3,
    title: 'Safety Related Incidents (Fatalities and LTIFR)',
    description: 'Number of fatalities and injury frequency rates among employees and workers.',
    icon: 'health_and_safety', color: 'red', hasTable: true, fields: [],
  },
  {
    number: 'Q3', section: 'P3_Q3', principle: 3,
    title: 'Details of complaints made by employees and workers',
    description: 'Complaints regarding working conditions and health & safety.',
    icon: 'forum', color: 'blue', hasTable: true, fields: [],
  },
  {
    number: 'Q4', section: 'P3_Q4', principle: 3,
    title: 'Corrective actions taken to address safety-related incidents',
    description: 'Details of mitigation measures for significant risks like hand injuries.',
    icon: 'build', color: 'orange', hasTable: true, fields: [],
  },
  // ─── Principle 6 (Sequential Q1-Q13) ─────────────────────────────────────────
  {
    number: 'Q1', section: 'P6_Q1', principle: 6,
    title: 'Energy Consumption',
    description: 'Total energy from renewable and non-renewable sources.',
    icon: 'bolt', color: 'emerald', hasTable: true, fields: [],
  },
  {
    number: 'Q2', section: 'P6_Q2', principle: 6,
    title: 'Designated Consumers (PAT Scheme)',
    description: 'Disclosures related to sites identified as designated consumers.',
    icon: 'verified', color: 'slate', hasTable: true, fields: [],
  },
  {
    number: 'Q3', section: 'P6_Q3', principle: 6,
    title: 'Water Disclosures',
    description: 'Volume of water withdrawn by source and total consumption.',
    icon: 'water_drop', color: 'blue', hasTable: true, fields: [],
  },
  {
    number: 'Q4', section: 'P6_Q4', principle: 6,
    title: 'Water Discharge',
    description: 'Water discharge by destination and level of treatment.',
    icon: 'water', color: 'cyan', hasTable: true, fields: [],
  },
  {
    number: 'Q5', section: 'P6_Q5', principle: 6,
    title: 'Zero Liquid Discharge (ZLD)',
    description: 'Implementation and coverage of ZLD mechanism.',
    icon: 'recycling', color: 'slate', hasTable: true, fields: [],
  },
  {
    number: 'Q6', section: 'P6_Q6', principle: 6,
    title: 'Air Emissions',
    description: 'NOx, SOx, and particulate matter emissions.',
    icon: 'cloud', color: 'gray', hasTable: true, fields: [],
  },
  {
    number: 'Q7', section: 'P6_Q7', principle: 6,
    title: 'GHG Emissions',
    description: 'Scope 1 and Scope 2 GHG emissions and intensity.',
    icon: 'co2', color: 'red', hasTable: true, fields: [],
  },
  {
    number: 'Q8', section: 'P6_Q8', principle: 6,
    title: 'GHG Reduction Initiatives',
    description: 'Projects undertaken to reduce greenhouse gas emissions.',
    icon: 'eco', color: 'slate', hasTable: true, fields: [],
  },
  {
    number: 'Q9', section: 'P6_Q9', principle: 6,
    title: 'Waste Management',
    description: 'Total waste generated, recovery, and disposal.',
    icon: 'delete_sweep', color: 'purple', hasTable: true, fields: [],
  },
  {
    number: 'Q10', section: 'P6_Q10', principle: 6,
    title: 'Waste Management Practices',
    description: 'Description of waste and hazardous chemical strategies.',
    icon: 'recycling', color: 'slate', hasTable: true, fields: [],
  },
  {
    number: 'Q11', section: 'P6_Q11', principle: 6,
    title: 'Sensitive Areas',
    description: 'Operations in/around ecologically sensitive areas.',
    icon: 'park', color: 'slate', hasTable: true, fields: [],
  },
  {
    number: 'Q12', section: 'P6_Q12', principle: 6,
    title: 'Environmental Impact Assessments (EIA)',
    description: 'Details of impact assessments for projects.',
    icon: 'assessment', color: 'slate', hasTable: true, fields: [],
  },
  {
    number: 'Q13', section: 'P6_Q13', principle: 6,
    title: 'Environmental Compliance',
    description: 'Compliance with environmental law and regulations.',
    icon: 'gavel', color: 'slate', hasTable: true, fields: [],
  },
].map(q => ({
  ...q,
  fields: STEPS_CONFIG.filter(s => s.section === q.section),
}));

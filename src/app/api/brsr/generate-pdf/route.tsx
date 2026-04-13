import React from 'react';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import type { PyData, BrsrFormData, DerivedMetrics } from '@/features/brsr/types';

export const runtime = 'nodejs';

// ─── Brand colours (Consistent with Review UI) ────────────────────────────────
const C = {
  greenPrimary:   '#004C3F', // Deep professional green
  greenHeader:    '#005B4E',
  greenAccent:    '#00A386',
  greenHighlight: '#F1FAF4', // Narrative answer background
  renewableText:  '#00875A',
  nonRenewText:   '#C1121F',
  subheadBg:      '#F8FAFB',
  border:         '#D1D5DB',
  borderInner:    '#E5E7EB',
  text:           '#111827',
  textMuted:      '#4B5563',
  white:          '#FFFFFF',
  noteBg:         '#FFFBEB',
  noteBorder:     '#F59E0B',
};

const F = { xs: 7, sm: 8.5, base: 9.5, md: 10, lg: 12, xl: 16, xxl: 22 };

const styles = StyleSheet.create({
  page: {
    paddingTop: 48, paddingBottom: 60, paddingHorizontal: 40,
    fontFamily: 'Helvetica', fontSize: F.base, color: C.text, backgroundColor: C.white,
  },
  coverPage: { padding: 0, fontFamily: 'Helvetica', backgroundColor: C.white },

  // Cover
  coverBanner:      { backgroundColor: C.greenPrimary, paddingHorizontal: 48, paddingTop: 64, paddingBottom: 48 },
  coverAccentLine:  { height: 4, backgroundColor: C.greenAccent, marginBottom: 28 },
  coverTitle:       { fontSize: F.xxl + 4, fontFamily: 'Helvetica-Bold', color: C.white, lineHeight: 1.3, letterSpacing: 1.5, textTransform: 'uppercase' },
  coverSubTitle:    { fontSize: F.lg, color: '#90D5B8', marginTop: 12, fontFamily: 'Helvetica' },
  coverMeta:        { fontSize: F.base, color: '#7AB89E', marginTop: 8 },
  coverBody:        { paddingHorizontal: 48, paddingTop: 36 },
  coverInfoBox:     { backgroundColor: C.greenHighlight, borderRadius: 4, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: C.greenPrimary, borderLeftStyle: 'solid' },
  coverInfoLabel:   { fontSize: F.sm, color: C.textMuted, marginBottom: 2 },
  coverInfoValue:   { fontSize: F.base, fontFamily: 'Helvetica-Bold', color: C.text },
  coverGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  coverGridItem:    { width: '47%' },
  coverDivider:     { height: 1, backgroundColor: C.border, marginVertical: 24 },
  coverDisclaimer:  { fontSize: F.xs, color: C.textMuted, lineHeight: 1.5, textAlign: 'justify' },

  // Running header
  runningHeader:     { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', height: 40, paddingHorizontal: 40, borderBottomWidth: 0.5, borderBottomColor: C.border },
  runningHeaderText: { fontSize: F.xs, color: C.greenPrimary, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1 },

  // Footer
  footer:     { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, borderTopWidth: 0.5, borderTopColor: C.border },
  footerText: { fontSize: F.xs - 1, color: C.textMuted, flex: 1 },
  footerPage: { fontSize: F.xs, color: C.textMuted, fontFamily: 'Helvetica-Bold' },

  // Section heading
  sectionBlock:  { marginTop: 24, marginBottom: 12 },
  sectionNumber: { fontSize: F.lg, fontFamily: 'Helvetica-Bold', color: C.greenPrimary },
  sectionTitle:  { fontSize: F.md, fontFamily: 'Helvetica-Bold', color: C.text, lineHeight: 1.4 },

  // Table
  table:  { width: '100%', borderStyle: 'solid', borderWidth: 0.8, borderColor: C.border, overflow: 'hidden' },
  tHead:  { flexDirection: 'row', backgroundColor: C.greenHeader, minHeight: 34 },
  thC1:   { flex: 45, padding: '8 10', justifyContent: 'center' },
  thC2:   { flex: 12, padding: '8 4', justifyContent: 'center', alignItems: 'center', borderLeftWidth: 0.5, borderLeftColor: 'rgba(255,255,255,0.2)' },
  thC3:   { flex: 21.5, padding: '8 10', justifyContent: 'center', alignItems: 'flex-end', borderLeftWidth: 0.5, borderLeftColor: 'rgba(255,255,255,0.2)' },
  thC4:   { flex: 21.5, padding: '8 10', justifyContent: 'center', alignItems: 'flex-end', borderLeftWidth: 0.5, borderLeftColor: 'rgba(255,255,255,0.2)' },
  thText: { fontSize: F.xs + 1, fontFamily: 'Helvetica-Bold', color: C.white, textAlign: 'center' },
  
  subHead:     { flexDirection: 'row', backgroundColor: C.subheadBg, borderTopWidth: 0.5, borderTopColor: C.border, padding: '7 10' },
  subHeadText: { fontSize: F.sm, fontFamily: 'Helvetica-Bold', color: C.greenPrimary, letterSpacing: 0.3 },
  
  rowBase:    { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: C.borderInner, minHeight: 24 },
  rowBaseAlt: { flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: C.borderInner, backgroundColor: '#FAFAFA', minHeight: 24 },
  rowGreen:   { flexDirection: 'row', backgroundColor: C.greenHighlight, borderTopWidth: 1.2, borderTopColor: C.greenAccent, minHeight: 26 },
  rowPink:    { flexDirection: 'row', backgroundColor: '#FFF5F5', borderTopWidth: 1.2, borderTopColor: '#E53E3E', minHeight: 26 },
  rowGrand:   { flexDirection: 'row', backgroundColor: '#F0FDF4', borderTopWidth: 1.8, borderTopColor: C.greenPrimary, minHeight: 28 },
  
  tdC1: { flex: 45, padding: '6 10', justifyContent: 'center' },
  tdC2: { flex: 12, padding: '6 4', justifyContent: 'center', alignItems: 'center' },
  tdC3: { flex: 21.5, padding: '6 10', justifyContent: 'center', alignItems: 'flex-end' },
  tdC4: { flex: 21.5, padding: '6 10', justifyContent: 'center', alignItems: 'flex-end' },
  
  tdText:      { fontSize: F.sm, color: C.text },
  tdTextBold:  { fontSize: F.sm, fontFamily: 'Helvetica-Bold', color: C.text },
  tdTextGreen: { fontSize: F.sm, fontFamily: 'Helvetica-Bold', color: C.greenPrimary },
  tdTextPink:  { fontSize: F.sm, fontFamily: 'Helvetica-Bold', color: C.nonRenewText },
  tdTextUnit:  { fontSize: F.xs, color: C.textMuted },

  // Narrative
  qBlock:       { marginTop: 22 },
  qQuestion:    { fontSize: F.md, fontFamily: 'Helvetica-Bold', color: C.text, marginBottom: 10, lineHeight: 1.4 },
  qAnswer:      { fontSize: F.base, color: C.text, lineHeight: 1.6, backgroundColor: C.greenHighlight, padding: '14 18', borderLeftWidth: 4, borderLeftColor: C.greenPrimary, borderLeftStyle: 'solid' },
  qAnswerEmpty: { fontSize: F.base, color: C.textMuted, fontStyle: 'italic', paddingLeft: 16 },

  // Note block
  noteBlock:  { borderLeftWidth: 3, borderLeftColor: C.noteBorder, padding: '10 16', marginTop: 14, marginBottom: 10 },
  noteText:   { fontSize: F.sm, color: '#92400E', lineHeight: 1.5 },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const n = (v: unknown): number => {
  if (typeof v === 'number') return isFinite(v) ? v : 0;
  if (typeof v === 'string') return parseFloat(v.replace(/,/g, '')) || 0;
  return 0;
};
const fmt    = (v: number, dp = 2) => isFinite(v) && v !== 0 ? v.toFixed(dp) : '0.00';
const locNum = (v: number) => isFinite(v) && v !== 0 ? v.toLocaleString('en-IN') : '0';
const s = (v: unknown): string => (typeof v === 'string' ? v : String(v ?? '')).trim();

// ─── Shared layout components ─────────────────────────────────────────────────
const RunningHeader = ({ section }: { section: string }) => (
  <View style={styles.runningHeader} fixed>
    <Text style={styles.runningHeaderText}>BRSR Report  ·  {section}</Text>
  </View>
);

const PageFooter = () => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      Generated by ESGtech.ai  ·  This report is system-generated
    </Text>
    <Text style={styles.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
  </View>
);

const THead = ({ fyLabel, pyLabel }: { fyLabel: string; pyLabel: string }) => (
  <View style={styles.tHead}>
    <View style={styles.thC1}><Text style={styles.thText}>Parameter</Text></View>
    <View style={styles.thC2}><Text style={[styles.thText, { textAlign: 'center' }]}>Unit</Text></View>
    <View style={styles.thC3}><Text style={[styles.thText, { textAlign: 'right' }]}>{fyLabel}</Text></View>
    <View style={styles.thC4}><Text style={[styles.thText, { textAlign: 'right' }]}>{pyLabel}</Text></View>
  </View>
);

const SubHead = ({ label }: { label: string }) => (
  <View style={styles.subHead}>
    <Text style={styles.subHeadText}>{label}</Text>
  </View>
);

const TRow = ({
  label, unit, fy, py,
  rowStyle, textStyle,
  indent = false,
}: {
  label: string; unit: string; fy: string; py: string;
  rowStyle?: any; textStyle?: any; indent?: boolean;
}) => (
  <View style={rowStyle ?? styles.rowBase} wrap={false}>
    <View style={styles.tdC1}>
      <Text style={[textStyle ?? styles.tdText, indent && { paddingLeft: 8 }]}>{label}</Text>
    </View>
    <View style={styles.tdC2}>
      <Text style={styles.tdTextUnit}>{unit}</Text>
    </View>
    <View style={styles.tdC3}>
      <Text style={textStyle ?? styles.tdText}>{fy}</Text>
    </View>
    <View style={styles.tdC4}>
      <Text style={textStyle ?? styles.tdText}>{py}</Text>
    </View>
  </View>
);

const SectionHeading = ({ num, title, principle }: { num: string; title: string; principle?: number }) => (
  <View style={styles.sectionBlock} wrap={false}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={principle === 3 ? [styles.sectionNumber, { color: '#2563EB' }] : styles.sectionNumber}>{num}.</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  </View>
);

const NarrativeQ = ({ num, question, answer }: { num: string; question: string; answer: string }) => (
  <View style={styles.qBlock} wrap={false}>
    <Text style={styles.qQuestion}>{num}. {question}</Text>
    {answer ? (
      <Text style={styles.qAnswer}>{answer}</Text>
    ) : (
      <Text style={styles.qAnswerEmpty}>  (Not provided)</Text>
    )}
  </View>
);

// ─── Document ─────────────────────────────────────────────────────────────────
interface DocProps {
  fd: BrsrFormData;
  py: PyData;
  fym: DerivedMetrics;
  pym: DerivedMetrics;
}

const BrsrDocument = ({ fd, py, fym, pym }: DocProps) => (
  <Document title="BRSR Final Report" author="ESGtech.ai">
    {/* ═══════════════════════════════════════════════════════════════
        COVER PAGE
    ═══════════════════════════════════════════════════════════════ */}
    <Page size="A4" style={styles.coverPage}>
      <View style={styles.coverBanner}>
        <View style={styles.coverAccentLine} />
        <Text style={styles.coverTitle}>Business Responsibility{'\n'}& Sustainability{'\n'}Report</Text>
        <Text style={styles.coverSubTitle}>Comprehensive Disclosures for Principle 3 and Principle 6</Text>
        <Text style={styles.coverMeta}>Fiscal Year 2024-25</Text>
      </View>

      <View style={styles.coverBody}>
        <View style={styles.coverGrid}>
          {[
            { label: 'Reporting Period', value: 'FY 2024-25' },
            { label: 'Framework', value: 'SEBI BRSR (Core)' },
            { label: 'Principles', value: '3 (Social) & 6 (Environment)' },
            { label: 'Status', value: 'Validated Final Report' },
          ].map(item => (
            <View key={item.label} style={styles.coverGridItem}>
              <View style={styles.coverInfoBox}>
                <Text style={styles.coverInfoLabel}>{item.label}</Text>
                <Text style={styles.coverInfoValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.coverDivider} />

        <Text style={{ fontSize: F.sm, fontFamily: 'Helvetica-Bold', color: C.text, marginBottom: 12 }}>
          Essential Indicators Summary:
        </Text>
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: F.sm, color: C.greenPrimary, fontFamily: 'Helvetica-Bold' }}>Principle 3: Employee Well-being</Text>
          <Text style={{ fontSize: F.xs + 1, color: C.text, marginLeft: 10 }}>• Training, Safety Incidents, and Health & Safety Assessments</Text>
          
          <Text style={{ fontSize: F.sm, color: C.greenPrimary, fontFamily: 'Helvetica-Bold', marginTop: 6 }}>Principle 6: Environmental Stewardship</Text>
          <Text style={{ fontSize: F.xs + 1, color: C.text, marginLeft: 10 }}>• Energy, Water, Emissions, and Waste Management</Text>
        </View>

        <View style={styles.coverDivider} />
        <Text style={styles.coverDisclaimer}>
          This report compiles essential indicators related to employee safety and environmental performance. 
          Performance metrics are compared against the previous financial year to provide a multi-year analysis.
        </Text>
      </View>
    </Page>

    {/* ═══════════════════════════════════════════════════════════════
        PAGE — PRINCIPLE 3: WELL-BEING & SAFETY
    ═══════════════════════════════════════════════════════════════ */}
    <Page size="A4" style={styles.page}>
      <RunningHeader section="Principle 3: Employee Well-being" />
      <View style={{ marginTop: 28 }}>
        
        <SectionHeading principle={3} num="11" title="Assessments for the year (Health & Safety, Working Conditions):" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <TRow label="% of sites ISO 45001 certified" unit="%" fy={fmt(n(fd.p3_iso_45001_percent))} py={fmt(py.p3_iso_45001_percent)} />
          <TRow label="Health and safety practices assessment (%)" unit="%" fy={fmt(n(fd.p3_assessment_hs_percent))} py={fmt(py.p3_assessment_hs_percent)} rowStyle={styles.rowBaseAlt} />
          <TRow label="Working conditions assessment (%)" unit="%" fy={fmt(n(fd.p3_assessment_wc_percent))} py={fmt(py.p3_assessment_wc_percent)} />
        </View>

        <SectionHeading principle={3} num="12" title="Safety Related Incidents (Fatalities and LTIFR):" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <TRow label="Fatalities (Employees)" unit="Nos." fy={locNum(n(fd.p3_fatalities_employees))} py={locNum(py.p3_fatalities_employees)} />
          <TRow label="Fatalities (Workers)" unit="Nos." fy={locNum(n(fd.p3_fatalities_workers))} py={locNum(py.p3_fatalities_workers)} rowStyle={styles.rowBaseAlt} />
          <TRow label="Lost Time Injury Frequency Rate (LTIFR)" unit="Rate" fy={fmt(n(fd.p3_ltifr))} py={fmt(py.p3_ltifr)} rowStyle={styles.rowGrand} textStyle={styles.tdTextGreen} />
        </View>

        <SectionHeading principle={3} num="13" title="Details of complaints made by employees and workers:" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <SubHead label="Working Conditions" />
          <TRow label="Complaints Filed" unit="Nos." fy={locNum(n(fd.p3_complaints_wc_filed))} py={locNum(py.p3_complaints_wc_filed)} indent />
          <TRow label="Complaints Pending" unit="Nos." fy={locNum(n(fd.p3_complaints_wc_pending))} py={locNum(py.p3_complaints_wc_pending)} indent rowStyle={styles.rowBaseAlt} />
          <SubHead label="Health & Safety" />
          <TRow label="Complaints Filed" unit="Nos." fy={locNum(n(fd.p3_complaints_hs_filed))} py={locNum(py.p3_complaints_hs_filed)} indent />
          <TRow label="Complaints Pending" unit="Nos." fy={locNum(n(fd.p3_complaints_hs_pending))} py={locNum(py.p3_complaints_hs_pending)} indent rowStyle={styles.rowBaseAlt} />
        </View>

        <NarrativeQ
          num="15"
          question="Corrective actions taken to address safety-related incidents and significant risks:"
          answer={s(fd.p3_ca_hand_injury)}
        />

        <NarrativeQ
          num="16"
          question="Provide details of any corrective action taken or underway to address safety-related incidents and significant risks:"
          answer={s(fd.p3_ca_safety_incident)}
        />

        <NarrativeQ
          num="17"
          question="Yes/No answer to whether mechanisms in place to prevent/address violence against women:"
          answer={s(fd.p3_mechanisms_violence)}
        />

        <NarrativeQ
          num="18"
          question="Details of complaints on sexual harassment:"
          answer={s(fd.p3_sh_complaints)}
        />

        <NarrativeQ
          num="19"
          question="Preventive measures and corrective actions taken:"
          answer={s(fd.p3_sh_preventive_measures)}
        />
      </View>
      <PageFooter />
    </Page>

    {/* ═══════════════════════════════════════════════════════════════
        PAGE — PRINCIPLE 3: TRAINING & DIVERSITY
    ═══════════════════════════════════════════════════════════════ */}
    <Page size="A4" style={styles.page}>
      <RunningHeader section="Principle 3: Training & Diversity" />
      <View style={{ marginTop: 28 }}>

        <SectionHeading principle={3} num="2" title="Details of Benefits provided to employees:" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <TRow label="Maternity/Paternity Benefits - Employees" unit="Nos." fy={locNum(n(fd.p3_mat_emp))} py={locNum(py.p3_mat_emp)} />
          <TRow label="Maternity/Paternity Benefits - Workers" unit="Nos." fy={locNum(n(fd.p3_mat_work))} py={locNum(py.p3_mat_work)} rowStyle={styles.rowBaseAlt} />
          <TRow label="Day Care Facilities - Employees" unit="Nos." fy={locNum(n(fd.p3_daycare_emp))} py={locNum(py.p3_daycare_emp)} />
          <TRow label="Day Care Facilities - Workers" unit="Nos." fy={locNum(n(fd.p3_daycare_work))} py={locNum(py.p3_daycare_work)} rowStyle={styles.rowBaseAlt} />
        </View>

        <SectionHeading principle={3} num="4" title="Details of training given to employees:" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <SubHead label="Safety Training" />
          <TRow label="Total employees trained on safety" unit="Nos." fy={locNum(n(fd.p3_train_safety_emp))} py={locNum(py.p3_train_safety_emp)} indent />
          <TRow label="Total workers trained on safety" unit="Nos." fy={locNum(n(fd.p3_train_safety_work))} py={locNum(py.p3_train_safety_work)} indent rowStyle={styles.rowBaseAlt} />
          <SubHead label="Skill Development" />
          <TRow label="Employees trained on skills" unit="Nos." fy={locNum(n(fd.p3_train_skill_emp))} py={locNum(py.p3_train_skill_emp)} indent />
          <TRow label="Workers trained on skills" unit="Nos." fy={locNum(n(fd.p3_train_skill_work))} py={locNum(py.p3_train_skill_work)} indent rowStyle={styles.rowBaseAlt} />
        </View>

        <SectionHeading principle={3} num="5" title="Employee Representation in Health & Safety Committees:" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <TRow label="Employees in H&S Committee" unit="Nos." fy={locNum(n(fd.p3_hs_committee_emp))} py={locNum(py.p3_hs_committee_emp)} />
          <TRow label="Workers in H&S Committee" unit="Nos." fy={locNum(n(fd.p3_hs_committee_work))} py={locNum(py.p3_hs_committee_work)} rowStyle={styles.rowBaseAlt} />
        </View>

        <NarrativeQ
          num="20"
          question="Describe mechanism for workers to report health and safety concerns:"
          answer={s(fd.p3_worker_reporting)}
        />
      </View>
      <PageFooter />
    </Page>

    {/* ═══════════════════════════════════════════════════════════════
        PAGE — PRINCIPLE 6: ENERGY
    ═══════════════════════════════════════════════════════════════ */}
    <Page size="A4" style={styles.page}>
      <RunningHeader section="Principle 6: Energy" />
      <View style={{ marginTop: 28 }}>
        <SectionHeading num="1" title="Details of total energy consumption and energy intensity:" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <SubHead label="From renewable sources" />
          <TRow label="Total electricity consumption (A)" unit="GJ" fy={locNum(n(fd.energy_A))} py={locNum(py.energy_A)} indent />
          <TRow label="Total fuel consumption (B)" unit="GJ" fy={locNum(n(fd.energy_B))} py={locNum(py.energy_B)} indent rowStyle={styles.rowBaseAlt} />
          <TRow label="Energy from other sources (C)" unit="GJ" fy={locNum(n(fd.energy_C))} py={locNum(py.energy_C)} indent />
          <TRow label="Total renewable (A+B+C)" unit="GJ" fy={locNum(fym.energy_renewable_total)} py={locNum(pym.energy_renewable_total)} rowStyle={styles.rowGreen} textStyle={styles.tdTextGreen} />
          <SubHead label="From non-renewable sources" />
          <TRow label="Total electricity consumption (D)" unit="GJ" fy={locNum(n(fd.energy_D))} py={locNum(py.energy_D)} indent />
          <TRow label="Total fuel consumption (E)" unit="GJ" fy={locNum(n(fd.energy_E))} py={locNum(py.energy_E)} indent rowStyle={styles.rowBaseAlt} />
          <TRow label="Total non-renewable (D+E+F)" unit="GJ" fy={locNum(fym.energy_nonrenewable_total)} py={locNum(pym.energy_nonrenewable_total)} rowStyle={styles.rowPink} textStyle={styles.tdTextPink} />
          <TRow label="Grand Total Energy Consumed" unit="GJ" fy={locNum(fym.energy_total)} py={locNum(pym.energy_total)} rowStyle={styles.rowGrand} textStyle={styles.tdTextGreen} />
        </View>

        <SectionHeading num="7" title="GHG Emissions (Scope 1 and Scope 2):" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <TRow label="Total Scope 1 emissions" unit="tCO2e" fy={locNum(n(fd.ghg_scope1))} py={locNum(py.ghg_scope1)} />
          <TRow label="Total Scope 2 emissions" unit="tCO2e" fy={locNum(n(fd.ghg_scope2))} py={locNum(py.ghg_scope2)} rowStyle={styles.rowBaseAlt} />
          <TRow label="Total GHG Emissions" unit="tCO2e" fy={locNum(fym.ghg_total)} py={locNum(pym.ghg_total)} rowStyle={styles.rowGrand} textStyle={styles.tdTextGreen} />
        </View>
      </View>
      <PageFooter />
    </Page>

    {/* ═════ Water & Waste Pages (Abbreviated for porting) ═════ */}
    <Page size="A4" style={styles.page}>
      <RunningHeader section="Principle 6: Water & Waste" />
      <View style={{ marginTop: 28 }}>
        <SectionHeading num="3" title="Water Withdrawal & Consumption:" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <TRow label="Total Water Withdrawal" unit="kL" fy={locNum(fym.water_withdrawal_total)} py={locNum(pym.water_withdrawal_total)} />
          <TRow label="Total Water Consumption" unit="kL" fy={locNum(n(fd.water_consumption))} py={locNum(py.water_consumption)} rowStyle={styles.rowGrand} textStyle={styles.tdTextGreen} />
        </View>

        <SectionHeading num="9" title="Waste Management:" />
        <View style={styles.table}>
          <THead fyLabel="FY 2024-25" pyLabel="FY 2023-24" />
          <TRow label="Total Waste Generated" unit="MT" fy={locNum(fym.waste_total)} py={locNum(pym.waste_total)} />
          <TRow label="Total Waste Recovered" unit="MT" fy={locNum(fym.waste_recovery_total)} py={locNum(pym.waste_recovery_total)} rowStyle={styles.rowBaseAlt} />
          <TRow label="Total Waste Disposed" unit="MT" fy={locNum(fym.waste_disposal_total)} py={locNum(pym.waste_disposal_total)} rowStyle={styles.rowBaseAlt} />
        </View>

        <NarrativeQ num="10" question="Waste Management Practices:" answer={s(fd.theory_q10)} />
      </View>
      <PageFooter />
    </Page>
  </Document>
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let data;
    try {
      data = typeof body.contextData === 'string' ? JSON.parse(body.contextData) : body.contextData;
    } catch {
      data = body;
    }

    const { formData, pyData, fyMetrics, pyMetrics } = data;

    const buffer = await renderToBuffer(
      <BrsrDocument fd={formData} py={pyData} fym={fyMetrics} pym={pyMetrics} />
    );

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="BRSR_Full_Report_${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[generate-pdf] Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

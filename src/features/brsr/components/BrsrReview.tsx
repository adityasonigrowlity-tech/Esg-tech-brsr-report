'use client';

import React, { useState } from 'react';
import { PyData, BrsrFormData, DerivedMetrics, QUESTIONS_CONFIG } from '../types';

interface BrsrReviewProps {
  setCurrentView: (v: 'overview' | 'upload' | 'entry' | 'review' | 'excel-review') => void;
  formData: BrsrFormData;
  pyData: PyData;
  fyMetrics: DerivedMetrics;
  pyMetrics: DerivedMetrics;
  setIsReportGenerated?: (v: boolean) => void;
}

const n = (v: string | number) => parseFloat(String(v)) || 0;
const fmt = (v: number, dp = 2) => (isFinite(v) ? v.toFixed(dp) : '0.00');
const loc = (v: number | string) => {
  const num = typeof v === 'string' ? parseFloat(v) : v;
  return isFinite(num) ? num.toLocaleString('en-IN') : '0';
};

export function BrsrReview({ 
  setCurrentView, 
  formData, 
  pyData, 
  fyMetrics, 
  pyMetrics, 
  setIsReportGenerated 
}: BrsrReviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to get question text from config
  const getQ = (section: string) => QUESTIONS_CONFIG.find(q => q.section === section)!;

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/brsr/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: 'brsr-report',
          contextData: JSON.stringify({ formData, pyData, fyMetrics, pyMetrics }),
        }),
      });
      if (!res.ok) throw new Error('Failed to generate report');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BRSR_Report_FY25_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (setIsReportGenerated) setIsReportGenerated(true);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10 pb-32">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Final Report Review</h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Principle 3 (Employee Well-being) & Principle 6 (Environment). 
              Review all disclosures for visual parity with official standards.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('entry')}
              className="px-6 py-3 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-white hover:border-slate-300 transition-all"
            >
              Edit Data
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-3 px-8 py-3 bg-[#004C3F] text-white rounded-2xl font-bold shadow-2xl shadow-emerald-900/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <><span className="material-symbols-outlined animate-spin">autorenew</span> Generating PDF...</>
              ) : (
                <><span className="material-symbols-outlined">description</span> Export Final Report</>
              )}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-8 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Previous Financial Year</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-[#004C3F]"></div>
            <span className="text-xs font-bold text-[#004C3F] uppercase tracking-widest">Current Financial Year</span>
          </div>
        </div>

        <div className="space-y-10">
          
          {/* Section Generator - Sequential numbering per principle */}
          {[
            // Principle 3 (Q1-Q4)
            { key: 'P3_Q1', displayNum: 1 },
            { key: 'P3_Q2', displayNum: 2 },
            { key: 'P3_Q3', displayNum: 3 },
            { key: 'P3_Q4', displayNum: 4 },
            // Principle 6 (Q1-Q13)
            { key: 'P6_Q1', displayNum: 1 },
            { key: 'P6_Q2', displayNum: 2 },
            { key: 'P6_Q3', displayNum: 3 },
            { key: 'P6_Q4', displayNum: 4 },
            { key: 'P6_Q5', displayNum: 5 },
            { key: 'P6_Q6', displayNum: 6 },
            { key: 'P6_Q7', displayNum: 7 },
            { key: 'P6_Q8', displayNum: 8 },
            { key: 'P6_Q9', displayNum: 9 },
            { key: 'P6_Q10', displayNum: 10 },
            { key: 'P6_Q11', displayNum: 11 },
            { key: 'P6_Q12', displayNum: 12 },
            { key: 'P6_Q13', displayNum: 13 },
          ].map(({ key: section, displayNum }) => {
            const q = getQ(section);
            if (!q) return null;
            const isP3 = q.principle === 3;
            
            return (
              <div key={section} className="group">
                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden transition-all group-hover:shadow-xl group-hover:shadow-slate-200/50">
                  {/* Card Header */}
                  <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100 flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#004C3F]">
                      <span className="material-symbols-outlined text-2xl">{q.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[10px] font-black ${isP3 ? 'bg-blue-600' : 'bg-[#004C3F]'} text-white px-2 py-0.5 rounded-sm uppercase tracking-tighter`}>
                          PRINCIPLE {isP3 ? '3' : '6'}
                        </span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">P{q.principle || 6} Q{displayNum}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 leading-relaxed">{q.title}</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8">
                    {/* Quantitative Tables */}
                    {section === 'P6_Q1' && (
                      <div className="space-y-1">
                        <DataRow label="Electricity consumption from renewable sources (A)" pyVal={loc(pyData.energy_A)} fyVal={loc(n(formData.energy_A))} unit="GJ" />
                        <DataRow label="Fuel consumption from renewable sources (B)" pyVal={loc(pyData.energy_B)} fyVal={loc(n(formData.energy_B))} unit="GJ" />
                        <DataRow label="Energy consumption through other renewable sources (C)" pyVal={loc(pyData.energy_C)} fyVal={loc(n(formData.energy_C))} unit="GJ" />
                        <DataRow label="Total energy consumed from renewable sources (A+B+C)" pyVal={loc(pyMetrics.energy_renewable_total)} fyVal={loc(fyMetrics.energy_renewable_total)} unit="GJ" formula />
                        <div className="my-4 h-px bg-slate-100"></div>
                        <DataRow label="Electricity consumption from non-renewable sources (D)" pyVal={loc(pyData.energy_D)} fyVal={loc(n(formData.energy_D))} unit="GJ" />
                        <DataRow label="Fuel consumption from non-renewable sources (E)" pyVal={loc(pyData.energy_E)} fyVal={loc(n(formData.energy_E))} unit="GJ" />
                        <DataRow label="Energy consumption through other non-renewable sources (F)" pyVal={loc(pyData.energy_F)} fyVal={loc(n(formData.energy_F))} unit="GJ" />
                        <DataRow label="Total energy consumed from non-renewable sources (D+E+F)" pyVal={loc(pyMetrics.energy_nonrenewable_total)} fyVal={loc(fyMetrics.energy_nonrenewable_total)} unit="GJ" formula />
                        <div className="my-4 h-px bg-slate-100"></div>
                        <DataRow label="Total energy consumed (A+B+C+D+E+F)" pyVal={loc(pyMetrics.energy_total)} fyVal={loc(fyMetrics.energy_total)} unit="GJ" grand />
                        <div className="pt-6 my-6 border-t border-dashed border-slate-200 space-y-2">
                          <DataRow label="Energy intensity per rupee of turnover" pyVal={fmt(pyMetrics.energy_intensity_revenue, 4)} fyVal={fmt(fyMetrics.energy_intensity_revenue, 4)} unit="GJ/Cr" />
                          <DataRow label="Energy intensity (PPP Adjusted)" pyVal={fmt(pyMetrics.energy_intensity_ppp, 4)} fyVal={fmt(fyMetrics.energy_intensity_ppp, 4)} unit="GJ/M USD" />
                          <DataRow label="Energy intensity in terms of physical output" pyVal={fmt(pyMetrics.energy_intensity_production, 4)} fyVal={fmt(fyMetrics.energy_intensity_production, 4)} unit="GJ/MT" />
                        </div>
                      </div>
                    )}

                    {section === 'P6_Q3' && (
                      <div className="space-y-1">
                        <DataRow label="(i) Surface water" pyVal={loc(pyData.water_surface)} fyVal={loc(n(formData.water_surface))} unit="kL" />
                        <DataRow label="(ii) Groundwater" pyVal={loc(pyData.water_ground)} fyVal={loc(n(formData.water_ground))} unit="kL" />
                        <DataRow label="(iii) Third party water" pyVal={loc(pyData.water_thirdparty)} fyVal={loc(n(formData.water_thirdparty))} unit="kL" />
                        <DataRow label="(iv) Seawater / desalinated" pyVal={loc(pyData.water_seawater)} fyVal={loc(n(formData.water_seawater))} unit="kL" />
                        <DataRow label="(v) Others" pyVal={loc(pyData.water_others)} fyVal={loc(n(formData.water_others))} unit="kL" />
                        <DataRow label="Total Withdrawal" pyVal={loc(pyMetrics.water_withdrawal_total)} fyVal={loc(fyMetrics.water_withdrawal_total)} unit="kL" formula />
                        <DataRow label="Total Water Consumption" pyVal={loc(pyData.water_consumption)} fyVal={loc(n(formData.water_consumption))} unit="kL" grand />
                      </div>
                    )}

                    {section === 'P6_Q4' && (
                      <div className="space-y-1">
                        <DataRow label="Total Water Discharge" pyVal={loc(pyMetrics.wd_total)} fyVal={loc(fyMetrics.wd_total)} unit="kL" grand />
                        <p className="mt-4 text-[11px] text-slate-400 font-bold uppercase tracking-widest pl-4">Breakdown by Level of Treatment</p>
                        <DataRow label="Discharge with No Treatment" pyVal={loc(pyData.wd_surface_notx + pyData.wd_ground_notx + pyData.wd_sea_notx + pyData.wd_third_notx + pyData.wd_others_notx)} fyVal={loc(n(formData.wd_surface_notx) + n(formData.wd_ground_notx) + n(formData.wd_sea_notx) + n(formData.wd_third_notx) + n(formData.wd_others_notx))} unit="kL" />
                        <DataRow label="Discharge with Treatment" pyVal={loc(pyData.wd_surface_tx + pyData.wd_ground_tx + pyData.wd_sea_tx + pyData.wd_third_tx + pyData.wd_others_tx)} fyVal={loc(n(formData.wd_surface_tx) + n(formData.wd_ground_tx) + n(formData.wd_sea_tx) + n(formData.wd_third_tx) + n(formData.wd_others_tx))} unit="kL" />
                      </div>
                    )}

                    {section === 'P3_Q1' && (
                      <div className="space-y-1">
                        <DataRow label="% of sites ISO 45001 certified" pyVal={loc(pyData.p3_iso_45001_percent)} fyVal={loc(formData.p3_iso_45001_percent)} unit="%" />
                        <DataRow label="Health and safety practices assessment" pyVal={loc(pyData.p3_assessment_hs_percent)} fyVal={loc(formData.p3_assessment_hs_percent)} unit="%" />
                        <div className="my-2 h-px bg-slate-50"></div>
                        <DataRow label="Working conditions assessment" pyVal={loc(pyData.p3_assessment_wc_percent)} fyVal={loc(formData.p3_assessment_wc_percent)} unit="%" />
                      </div>
                    )}

                    {section === 'P3_Q2' && (
                      <div className="space-y-1">
                        <DataRow label="Fatalities (Employees)" pyVal={loc(pyData.p3_fatalities_employees)} fyVal={loc(formData.p3_fatalities_employees)} unit="Nos" />
                        <DataRow label="Fatalities (Workers)" pyVal={loc(pyData.p3_fatalities_workers)} fyVal={loc(formData.p3_fatalities_workers)} unit="Nos" />
                        <div className="my-4 h-px bg-slate-100"></div>
                        <DataRow label="LTIFR" pyVal={loc(pyData.p3_ltifr)} fyVal={loc(formData.p3_ltifr)} unit="Rate" grand />
                      </div>
                    )}

                    {section === 'P3_Q3' && (
                      <div className="space-y-1">
                        <DataRow label="Working Conditions (Filed)" pyVal={loc(pyData.p3_complaints_wc_filed)} fyVal={loc(formData.p3_complaints_wc_filed)} unit="Nos" />
                        <DataRow label="Working Conditions (Pending)" pyVal={loc(pyData.p3_complaints_wc_pending)} fyVal={loc(formData.p3_complaints_wc_pending)} unit="Nos" />
                        <div className="my-4 h-px bg-slate-100"></div>
                        <DataRow label="Health & Safety (Filed)" pyVal={loc(pyData.p3_complaints_hs_filed)} fyVal={loc(formData.p3_complaints_hs_filed)} unit="Nos" />
                        <DataRow label="Health & Safety (Pending)" pyVal={loc(pyData.p3_complaints_hs_pending)} fyVal={loc(formData.p3_complaints_hs_pending)} unit="Nos" />
                      </div>
                    )}

                    {section === 'P3_Q4' && (
                      <NarrativeBox text={formData.p3_ca_hand_injury} />
                    )}

                    {section === 'P6_Q7' && (
                      <div className="space-y-1">
                        <DataRow label="Total Scope 1 emissions" pyVal={loc(pyData.ghg_scope1)} fyVal={loc(formData.ghg_scope1)} unit="tCO2Eq" />
                        <DataRow label="Total Scope 2 emissions" pyVal={loc(pyData.ghg_scope2)} fyVal={loc(formData.ghg_scope2)} unit="tCO2Eq" />
                        <DataRow label="Total GHG Emissions" pyVal={loc(pyMetrics.ghg_total)} fyVal={loc(fyMetrics.ghg_total)} unit="tCO2Eq" grand />
                      </div>
                    )}

                    {section === 'P6_Q9' && (
                      <div className="space-y-1">
                        <DataRow label="Total Waste Generated" pyVal={loc(pyMetrics.waste_total)} fyVal={loc(fyMetrics.waste_total)} unit="MT" grand />
                        <div className="my-4 h-px bg-slate-100"></div>
                        <DataRow label="Total Waste Recovery" pyVal={loc(pyMetrics.waste_recovery_total)} fyVal={loc(fyMetrics.waste_recovery_total)} unit="MT" formula />
                        <DataRow label="Total Waste Disposal" pyVal={loc(pyMetrics.waste_disposal_total)} fyVal={loc(fyMetrics.waste_disposal_total)} unit="MT" formula />
                      </div>
                    )}

                    {/* Narrative Support for Principle 6 Indicators */}
                    {['P6_Q2', 'P6_Q5', 'P6_Q6', 'P6_Q8', 'P6_Q10', 'P6_Q11', 'P6_Q12', 'P6_Q13'].includes(section) && (
                      <NarrativeBox text={formData[`theory_q${displayNum}` as keyof BrsrFormData]} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        </div>

        {/* Global Action */}
        <div className="mt-16 flex flex-col items-center">
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="group relative px-14 py-5 bg-[#004C3F] text-white rounded-full font-black text-xl shadow-[0_20px_50px_rgba(0,76,63,0.3)] hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
               {isGenerating ? (
                 <span className="material-symbols-outlined animate-spin text-2xl">autorenew</span>
               ) : (
                 <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">task_alt</span>
               )}
               <span>{isGenerating ? 'Finalizing Filing...' : 'Approve & Create PDF'}</span>
            </div>
          </button>
          <p className="mt-6 text-slate-400 text-sm font-medium">Verify all Principle 3 and Principle 6 indicators before final submission.</p>
        </div>

      </div>
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function DataRow({ label, pyVal, fyVal, unit, formula = false, grand = false }: { label: string; pyVal: string; fyVal: string; unit: string; formula?: boolean; grand?: boolean }) {
  return (
    <div className={`grid grid-cols-12 gap-6 py-3 px-4 rounded-xl transition-all ${grand ? 'bg-[#004C3F]/5 border-l-4 border-[#004C3F]' : formula ? 'bg-slate-50/80 border-l-4 border-slate-200' : 'hover:bg-slate-50/50 underline-offset-4'}`}>
      <div className="col-span-6 flex items-center">
        <span className={`text-[13px] tracking-tight leading-snug ${grand || formula ? 'font-bold text-slate-800' : 'text-slate-600 font-medium'}`}>{label}</span>
      </div>
      <div className="col-span-1 flex items-center justify-center">
        <span className="text-[10px] font-black text-slate-300 uppercase leading-none">{unit}</span>
      </div>
      <div className="col-span-2 flex flex-col items-end justify-center pr-4">
        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-0.5 opacity-60">PY</span>
        <span className={`text-sm tracking-tight ${grand ? 'font-bold text-slate-600' : 'text-slate-500 font-medium'}`}>{pyVal}</span>
      </div>
      <div className="col-span-3 flex flex-col items-end justify-center">
        <span className={`text-[9px] font-black uppercase tracking-tighter mb-0.5 ${grand ? 'text-[#004C3F]' : 'text-slate-700'}`}>FY 24-25</span>
        <span className={`text-[15px] tracking-tight ${grand ? 'font-black text-[#004C3F]' : formula ? 'font-bold text-slate-800' : 'font-bold text-slate-900'}`}>{fyVal}</span>
      </div>
    </div>
  );
}

function NarrativeBox({ text }: { text?: string }) {
  if (!text || text.trim().length === 0) {
    return (
      <div className="flex items-center gap-3 p-6 bg-slate-50 rounded-[1.5rem] border border-dashed border-slate-200 text-slate-400 italic text-sm">
        <span className="material-symbols-outlined text-slate-300">report</span>
        No narrative response provided for this indicator.
      </div>
    );
  }

  return (
    <div className="bg-[#004C3F]/[0.02] rounded-[1.5rem] border-2 border-[#004C3F]/10 border-l-4 border-l-[#004C3F] p-7 shadow-sm">
      <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">{text}</p>
    </div>
  );
}

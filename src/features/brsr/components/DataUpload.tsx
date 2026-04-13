'use client';

import React, { useState, useEffect } from 'react';
import { PyData, DEFAULT_PY_DATA, STEPS_CONFIG, isFormulaKey, PPP_FACTOR } from '../types';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';
type ReportView = 'overview' | 'upload' | 'entry' | 'review' | 'excel-review';

interface DataUploadProps {
  currentView: ReportView;
  setCurrentView: (view: ReportView) => void;
  isUploaded: boolean;
  uploadState: UploadState;
  uploadError: string | null;
  pyData: PyData;
  setPyData: (data: PyData) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** PPP formula for RevenuePPP */
const computeRevenuePPP = (revenue: string): string => {
  const rev = parseFloat(revenue);
  if (!rev || isNaN(rev)) return '0';
  return String(Math.round((rev * 10) / PPP_FACTOR));
};

/** Section metadata for review panel headers */
const SECTIONS: { key: string; label: string; color: string; principle: number }[] = [
  // Principle 3 (sequential Q1-Q4)
  { key: 'P3_Q1', label: 'P3 Q1 — Health & Safety Assessments (%)', color: 'emerald', principle: 3 },
  { key: 'P3_Q2', label: 'P3 Q2 — Safety Incidents (Fatalities/Rate)', color: 'red', principle: 3 },
  { key: 'P3_Q3', label: 'P3 Q3 — Employee Complaints (Count)', color: 'blue', principle: 3 },
  { key: 'P3_Q4', label: 'P3 Q4 — Corrective Actions (Text)', color: 'orange', principle: 3 },
  // Principle 6 (sequential Q1-Q13)
  { key: 'P6_Q1', label: 'P6 Q1 — Energy Consumption (GJ)', color: 'emerald', principle: 6 },
  { key: 'P6_Q2', label: 'P6 Q2 — Designated Consumers (PAT)', color: 'slate', principle: 6 },
  { key: 'P6_Q3', label: 'P6 Q3 — Water Withdrawal (kL)', color: 'blue', principle: 6 },
  { key: 'P6_Q4', label: 'P6 Q4 — Water Discharge (kL)', color: 'cyan', principle: 6 },
  { key: 'P6_Q5', label: 'P6 Q5 — Zero Liquid Discharge', color: 'slate', principle: 6 },
  { key: 'P6_Q6', label: 'P6 Q6 — Air Emissions (MT)', color: 'gray', principle: 6 },
  { key: 'P6_Q7', label: 'P6 Q7 — GHG Emissions (tCO₂Eq)', color: 'red', principle: 6 },
  { key: 'P6_Q8', label: 'P6 Q8 — GHG Reduction Initiatives', color: 'slate', principle: 6 },
  { key: 'P6_Q9', label: 'P6 Q9 — Waste Management (MT)', color: 'purple', principle: 6 },
  { key: 'P6_Q10', label: 'P6 Q10 — Waste Management Practices', color: 'slate', principle: 6 },
  { key: 'P6_Q11', label: 'P6 Q11 — Ecologically Sensitive Areas', color: 'slate', principle: 6 },
  { key: 'P6_Q12', label: 'P6 Q12 — Environmental Impact Assessments', color: 'slate', principle: 6 },
  { key: 'P6_Q13', label: 'P6 Q13 — Environmental Compliance', color: 'slate', principle: 6 },
];

const SECTION_COLOR_MAP: Record<string, string> = {
  emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  blue:    'text-blue-700 bg-blue-50 border-blue-200',
  cyan:    'text-cyan-700 bg-cyan-50 border-cyan-200',
  orange:  'text-orange-700 bg-orange-50 border-orange-200',
  red:     'text-red-700 bg-red-50 border-red-200',
  purple:  'text-purple-700 bg-purple-50 border-purple-200',
  slate:   'text-slate-700 bg-slate-50 border-slate-200',
  gray:    'text-gray-700 bg-gray-50 border-gray-200',
};

export default function DataUpload({
  setCurrentView,
  isUploaded,
  uploadState,
  uploadError,
  pyData,
  setPyData,
  handleFileUpload,
}: DataUploadProps) {
  const isLoading = uploadState === 'uploading';

  type DraftRecord = Record<keyof PyData, string>;

  // Local draft for edits
  const [draft, setDraft] = useState<DraftRecord>(() =>
    Object.fromEntries(
      Object.keys(DEFAULT_PY_DATA).map(k => [k, String(pyData[k as keyof PyData])])
    ) as DraftRecord
  );

  // Sync draft when new PDF data arrives
  useEffect(() => {
    if (uploadState === 'success') {
      const base = Object.fromEntries(
        Object.keys(DEFAULT_PY_DATA).map(k => [k, String(pyData[k as keyof PyData])])
      ) as DraftRecord;

      // Seed RevenuePPP from Revenue
      if (!base.RevenuePPP || base.RevenuePPP === '0') {
        base.RevenuePPP = computeRevenuePPP(base.Revenue);
      }
      setDraft(base);
    }
  }, [uploadState, pyData]);

  // Reactively recompute RevenuePPP when Revenue changes
  useEffect(() => {
    const computed = computeRevenuePPP(draft.Revenue);
    if (draft.RevenuePPP !== computed) {
      setDraft(prev => ({ ...prev, RevenuePPP: computed }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.Revenue]);

  const handleDraftChange = (key: keyof PyData, value: string) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    const committed = Object.fromEntries(
      Object.keys(DEFAULT_PY_DATA).map(k => [
        k, 
        typeof DEFAULT_PY_DATA[k as keyof PyData] === 'number' 
          ? parseFloat(String(draft[k as keyof PyData])) || 0 
          : draft[k as keyof PyData]
      ])
    ) as unknown as PyData;
    setPyData(committed);
    setCurrentView('entry');
  };

  // Build section → fields map
  const sectionedFields = SECTIONS.map(sec => ({
    ...sec,
    fields: STEPS_CONFIG.filter(f => f.section === sec.key),
  }));

  return (
    <div className="flex-1 px-8 py-10 max-w-5xl mx-auto w-full">
      <div className="space-y-10">

        {/* ── STEP 1: Upload ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-[#00a669]/10 text-[#00a669]'}`}>
              {isUploaded ? <span className="material-symbols-outlined text-base">check</span> : '1'}
            </div>
            <div>
              <p className="font-bold text-gray-900">Upload Previous Year BRSR PDF</p>
              <p className="text-xs text-gray-500">
                Our AI extracts Principle 3 & 6 tables — safety, water, GHG, waste, and more.
              </p>
            </div>
            {isUploaded && (
              <label className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-bold cursor-pointer hover:underline">
                <span className="material-symbols-outlined text-base">upload</span>
                Re-upload
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isLoading} />
              </label>
            )}
          </div>

          <label className={`block relative bg-white rounded-2xl p-10 text-center transition-all duration-500 border-2 border-dashed
            ${isLoading ? 'border-emerald-600/60 bg-emerald-50 cursor-wait' : ''}
            ${uploadState === 'success' ? 'border-emerald-400 bg-emerald-50/40' : ''}
            ${uploadState === 'error' ? 'border-red-400 bg-red-50/30 cursor-pointer' : ''}
            ${uploadState === 'idle' ? 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer' : ''}
          `}>
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={isLoading || (uploadState === 'success' && !isUploaded)} />

            <div className="flex flex-col items-center gap-3">
              {isLoading ? (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600">
                  <svg className="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110
                  ${uploadState === 'success' ? 'bg-emerald-100 text-emerald-600' : ''}
                  ${uploadState === 'error' ? 'bg-red-100 text-red-500' : ''}
                  ${uploadState === 'idle' ? 'bg-[#00a669]/10 text-[#00a669]' : ''}
                `}>
                  <span className="material-symbols-outlined text-4xl">
                    {uploadState === 'success' ? 'check_circle' : uploadState === 'error' ? 'error' : 'picture_as_pdf'}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-bold text-gray-900">
                {isLoading ? 'Extracting data from PDF…'
                  : uploadState === 'success' ? 'PDF Processed Successfully'
                  : uploadState === 'error' ? 'Upload Failed — Try Again'
                  : 'Click to Upload Your BRSR PDF Report'}
              </h3>

              {uploadState === 'idle' && (
                <p className="text-gray-500 text-sm">Select the annual BRSR report PDF for the previous financial year.</p>
              )}
              {uploadState === 'success' && (
                <p className="text-emerald-700 text-sm font-medium">All Principle 3 & 6 tables extracted — review and edit below.</p>
              )}
              {uploadState === 'error' && uploadError && (
                <p className="text-red-500 text-sm max-w-md">{uploadError}</p>
              )}
              {isLoading && (
                <p className="text-gray-500 text-sm">AI is reading tables for Principle 3 (Safety) and Principle 6 (Environment)…</p>
              )}

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500 mt-1 font-medium">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Supported format: .pdf (Max 20 MB)</span>
              </div>
            </div>
          </label>
        </div>

        {/* ── STEP 2: Review & Edit PY Data ──────────────────────────── */}
        {uploadState === 'success' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[#00a669]/10 text-[#00a669]">
                2
              </div>
              <div>
                <p className="font-bold text-gray-900">Review & Edit Extracted Previous Year Data</p>
                <p className="text-xs text-gray-500">
                  Verify all Principle 3 & 6 sections. <span className="text-violet-600 font-bold">Purple = auto-calculated</span> · <span className="text-amber-600 font-bold">Amber = not found</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {sectionedFields.map(({ key, label, color, fields }) => {
                const colorClass = SECTION_COLOR_MAP[color] || 'text-gray-700 bg-gray-50 border-gray-200';

                // Group fields by category within each section
                const categories = Array.from(new Set(fields.map(f => f.category)));

                return (
                  <div key={key} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {/* Section header */}
                    <div className={`px-5 py-3 border-b border-gray-100 flex items-center gap-2 ${colorClass}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                    </div>

                    {categories.map(cat => (
                      <div key={cat}>
                        {/* Category sub-header */}
                        <div className="px-5 py-2 bg-gray-50/50 border-b border-gray-100">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{cat}</p>
                        </div>

                        <div className="divide-y divide-gray-50">
                          {fields.filter(f => f.category === cat).map(field => {
                            const rawVal = draft[field.key];
                            const isEmpty = rawVal === '' || rawVal === undefined || rawVal === null;
                            const isFormula = isFormulaKey(field.key);
                            const isText = field.unit === 'Text' || field.unit === '';

                            return (
                              <div key={field.key} className={`flex ${isText ? 'flex-col items-stretch' : 'items-center'} gap-4 px-5 py-4 hover:bg-gray-50/40 transition-colors`}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-gray-700">{field.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-gray-400 font-medium">{field.unit}</p>
                                    {isFormula && (
                                      <span className="text-[9px] font-bold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-md border border-violet-100 uppercase tracking-tighter">
                                        Derived
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className={`flex ${isText ? 'flex-col' : 'items-center'} gap-2 flex-shrink-0`}>
                                  {isFormula ? (
                                    <span className="text-[10px] text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 flex items-center gap-1 w-fit ml-auto">
                                      <span className="material-symbols-outlined text-[12px]">functions</span>
                                      AUTO
                                    </span>
                                  ) : isEmpty ? (
                                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-tight w-fit ml-auto">
                                      {isText ? 'Narrative Not Found' : 'Empty'}
                                    </span>
                                  ) : null}

                                  {isText ? (
                                    <textarea
                                      value={draft[field.key]}
                                      onChange={e => handleDraftChange(field.key, e.target.value)}
                                      rows={3}
                                      className={`w-full md:min-w-[500px] text-left px-4 py-3 rounded-xl text-sm font-medium border transition-colors outline-none
                                        ${isEmpty
                                          ? 'border-amber-100 bg-amber-50/40 text-amber-700 focus:border-[#00a669] focus:bg-white focus:text-gray-900'
                                          : 'border-emerald-100 bg-emerald-50/40 text-emerald-800 focus:border-[#00a669] focus:bg-white focus:text-gray-900'
                                        }
                                      `}
                                      placeholder="Enter extracted narrative here..."
                                    />
                                  ) : (
                                    <input
                                      type="text"
                                      inputMode={isFormula ? undefined : 'decimal'}
                                      value={draft[field.key]}
                                      onChange={e => {
                                        if (!isFormula) {
                                          const raw = e.target.value.replace(/[^0-9.-]/g, '');
                                          handleDraftChange(field.key, raw);
                                        }
                                      }}
                                      readOnly={isFormula}
                                      className={`w-32 text-right px-3 py-2 rounded-xl text-sm font-bold border transition-colors outline-none
                                        ${isFormula
                                          ? 'border-violet-100 bg-violet-50/40 text-violet-700 cursor-default'
                                          : isEmpty
                                          ? 'border-amber-100 bg-amber-50/40 text-amber-700 focus:border-emerald-500 focus:bg-white focus:text-gray-900'
                                          : 'border-emerald-100 bg-emerald-50/40 text-emerald-800 focus:border-emerald-500 focus:bg-white focus:text-gray-900'
                                        }
                                      `}
                                      placeholder="0"
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Confirm CTA */}
            <div className="flex flex-col items-center gap-3 mt-10">
              <button
                onClick={handleConfirm}
                className="px-14 py-4 bg-[#00a669] text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-900/10 hover:scale-[1.03] transition-all hover:bg-[#008f5a]"
              >
                Confirm & Continue to Guided Entry →
              </button>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                You can always re-upload or edit data later.
              </p>
            </div>
          </div>
        )}

        {/* AI note — only show before upload */}
        {uploadState !== 'success' && (
          <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6 shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 mt-0.5 bg-white p-2 rounded-xl shadow-sm">auto_awesome</span>
            <div>
              <p className="font-bold text-gray-900 text-sm mb-1">AI-Powered Extraction — Principle 3 & 6 Tables</p>
              <p className="text-gray-500 text-[13px] leading-relaxed font-medium">
                We parse your PDF and use a large language model to locate all tabular disclosures in
                <span className="font-bold text-emerald-700"> Principle 3</span> (Safety & Well-being) and 
                <span className="font-bold text-emerald-700"> Principle 6</span> (Environment). 
                All <strong>Previous Year (PY)</strong> columns are extracted automatically. 
                Missing values are highlighted in amber for manual correction.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

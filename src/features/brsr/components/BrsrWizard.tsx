'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PyData, BrsrFormData, DerivedMetrics,
  QUESTIONS_CONFIG, QuestionConfig, StepConfig,
  isFormulaKey, computeMetrics, PPP_FACTOR,
} from '../types';

interface BrsrWizardProps {
  setCurrentView: (v: 'overview' | 'upload' | 'entry' | 'review' | 'excel-review') => void;
  isUploaded: boolean;
  pyData: PyData;
  formData: BrsrFormData;
  setFormData: (data: BrsrFormData) => void;
  fyMetrics: DerivedMetrics;
}

// ─── Color helpers (Original MD3 palette) ───────────────────────────────────

const CARD_STYLES: Record<string, { bg: string; border: string; icon: string; badge: string; pill: string }> = {
  emerald: { bg: 'bg-emerald-50',  border: 'border-emerald-200', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', pill: 'bg-emerald-600' },
  blue:    { bg: 'bg-blue-50',     border: 'border-blue-200',    icon: 'text-blue-600',    badge: 'bg-blue-100 text-blue-700',    pill: 'bg-blue-600' },
  cyan:    { bg: 'bg-cyan-50',     border: 'border-cyan-200',    icon: 'text-cyan-600',    badge: 'bg-cyan-100 text-cyan-700',    pill: 'bg-cyan-600' },
  orange:  { bg: 'bg-orange-50',   border: 'border-orange-200',  icon: 'text-orange-600',  badge: 'bg-orange-100 text-orange-700', pill: 'bg-orange-600' },
  red:     { bg: 'bg-red-50',      border: 'border-red-200',     icon: 'text-red-600',     badge: 'bg-red-100 text-red-700',     pill: 'bg-red-600' },
  purple:  { bg: 'bg-purple-50',   border: 'border-purple-200',  icon: 'text-purple-600',  badge: 'bg-purple-100 text-purple-700', pill: 'bg-purple-600' },
  slate:   { bg: 'bg-slate-50',    border: 'border-slate-200',   icon: 'text-slate-400',   badge: 'bg-slate-100 text-slate-500',  pill: 'bg-slate-400' },
};

function getQuestionCompletion(q: QuestionConfig, formData: BrsrFormData): { filled: number; total: number } {
  if (!q.hasTable) return { filled: 0, total: 0 };
  const inputFields = q.fields.filter(f => !isFormulaKey(f.key));
  const filled = inputFields.filter(f => {
    const v = formData[f.key];
    return v !== '' && v !== '0' && v !== undefined;
  }).length;
  return { filled, total: inputFields.length };
}

// ─── QuestionWizard Modal (Original) ────────────────────────────────────────

function QuestionWizard({
  question,
  formData,
  pyData,
  fyMetrics,
  onUpdate,
  onClose,
}: {
  question: QuestionConfig;
  formData: BrsrFormData;
  pyData: PyData;
  fyMetrics: DerivedMetrics;
  onUpdate: (key: keyof PyData, val: string) => void;
  onClose: () => void;
}) {
  const inputFields = question.fields.filter(f => !isFormulaKey(f.key));
  const [localStep, setLocalStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const style = CARD_STYLES[question.color] || CARD_STYLES.slate;

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [localStep]);

  const currentField: StepConfig = question.fields[localStep];
  const isLastStep = localStep === question.fields.length - 1;
  const isFirstStep = localStep === 0;
  const isFormula = isFormulaKey(currentField.key);
  const pyVal = pyData[currentField.key];

  const handlePrev = () => setLocalStep(s => Math.max(0, s - 1));
  const handleNext = () => {
    if (isLastStep) onClose();
    else setLocalStep(s => s + 1);
  };

  const totalSteps = question.fields.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col overflow-hidden" style={{ maxHeight: '95vh' }}>
        {/* Header */}
        <div className={`flex items-center gap-3 px-6 py-4 ${style.bg} border-b ${style.border}`}>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 transition-colors">
            <span className="material-symbols-outlined text-lg text-slate-600">arrow_back</span>
          </button>
          <span className={`material-symbols-outlined text-xl ${style.icon}`}>{question.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">P{question.principle || 6} Q{question.number} — {question.title}</p>
            <p className="text-xs text-slate-500">{localStep + 1} of {totalSteps} fields</p>
          </div>
          <div className="text-xs font-semibold text-slate-500 flex-shrink-0">
            {Math.round(((localStep + 1) / totalSteps) * 100)}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100">
          <div className={`h-full ${style.pill} transition-all duration-500 rounded-r-full`} style={{ width: `${((localStep + 1) / totalSteps) * 100}%` }} />
        </div>

        {/* Main content */}
        <div className="flex-1 px-8 py-8 overflow-y-auto">
          <div className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{currentField.category}</p>
            <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">
              {isFormula
                ? <span>Auto-calculated: <span className={style.icon}>{currentField.title}</span></span>
                : <>Enter <span className={style.icon}>{currentField.title}</span></>
              }
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`rounded-2xl p-5 ${style.bg} border ${style.border}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Previous Year (PY)</p>
                <p className={`text-3xl font-black ${!pyVal || pyVal === 0 ? 'text-slate-300' : 'text-slate-700'}`}>
                  {(!pyVal || pyVal === 0) ? '—' : pyVal.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">{currentField.unit}</p>
              </div>

              <div className={`rounded-2xl p-4 border-2 transition-all ${isFormula ? 'border-violet-200 bg-violet-50/60' : 'border-slate-200 focus-within:border-slate-400 bg-white'}`}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Current Year (FY)</p>
                {isFormula ? (
                  <p className="text-3xl font-black text-violet-700">{formData[currentField.key] || '0'}</p>
                ) : currentField.unit === 'Text' || currentField.unit === '' ? (
                  <textarea
                    rows={4}
                    placeholder="Describe implementation details…"
                    value={formData[currentField.key] ?? ''}
                    onChange={e => onUpdate(currentField.key, e.target.value)}
                    className="w-full text-base font-medium text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-300 resize-none"
                  />
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter value…"
                    value={formData[currentField.key] ?? ''}
                    onChange={e => onUpdate(currentField.key, e.target.value.replace(/[^0-9.-]/g, ''))}
                    onKeyDown={e => { if (e.key === 'Enter') handleNext(); }}
                    className="w-full text-3xl font-black text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-300"
                  />
                )}
                <p className="text-xs text-slate-400 mt-1">{currentField.unit}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">info</span>
              <p className="text-sm text-slate-600 leading-relaxed">{currentField.tip}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button onClick={handlePrev} disabled={isFirstStep} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-semibold text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-all">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Previous
          </button>
          <div className="flex-1" />
          <button onClick={handleNext} className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-white shadow-md transition-all hover:scale-[1.03] ${style.pill}`}>
            {isLastStep ? <><span className="material-symbols-outlined text-base">check</span>Save</> : <>Next<span className="material-symbols-outlined text-base">arrow_forward</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main BrsrWizard (Original GuidedEntry UI) ──────────────────────────────

export function BrsrWizard({
  setCurrentView,
  isUploaded,
  pyData,
  formData,
  setFormData,
}: BrsrWizardProps) {
  const [activePrinciple, setActivePrinciple] = useState<3 | 6>(3);
  const [activeQuestion, setActiveQuestion] = useState<QuestionConfig | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (key: keyof PyData, val: string) => {
    const next = { ...formData, [key]: val };
    if (key === 'Revenue') {
      const rev = parseFloat(val.replace(/,/g, ''));
      next.RevenuePPP = rev > 0 ? String(Math.round((rev * 10) / PPP_FACTOR)) : '0';
    }
    setFormData(next);
  };

  const visibleQuestions = QUESTIONS_CONFIG.filter(q => (q.principle || 6) === activePrinciple);
  const allInputQuestions = visibleQuestions.filter(q => q.hasTable);
  const totalFields = allInputQuestions.reduce((s, q) => s + q.fields.filter(f => !isFormulaKey(f.key)).length, 0);
  const filledFields = allInputQuestions.reduce((s, q) => s + getQuestionCompletion(q, formData).filled, 0);
  const overallPct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  return (
    <div className="flex-1 w-full flex flex-col bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-1">
              {[3, 6].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePrinciple(p as any)}
                  className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                    activePrinciple === p ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Principle {p}
                </button>
              ))}
            </div>
            <h1 className="text-lg font-extrabold text-slate-800">
              {activePrinciple === 3 ? 'Principle 3 — Employee Well-being' : 'Principle 6 — Environment'}
            </h1>
            <p className="text-xs text-slate-500">Essential Indicators · {overallPct}% complete</p>
          </div>
          <button
            onClick={() => setCurrentView('review')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.04] transition-all"
          >
            <span className="material-symbols-outlined text-base">preview</span>
            Review Report
          </button>
        </div>
      </div>

      {/* Excel Panel Reverted */}
      <div className="px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-5xl mx-auto flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-emerald-600 text-lg">table_view</span>
              <h2 className="text-sm font-extrabold text-slate-800">Bulk Entry via Excel</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">Download template, fill FY 2024-25 values, and upload.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => {}} className="px-4 py-2 rounded-full border border-emerald-600 text-emerald-700 font-bold text-xs hover:bg-emerald-50">Download</button>
             <button onClick={() => excelInputRef.current?.click()} className="px-4 py-2 rounded-full bg-emerald-700 text-white font-bold text-xs shadow-md">Upload Excel</button>
             <input ref={excelInputRef} type="file" className="hidden" accept=".xlsx,.xlsm" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 py-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {visibleQuestions.map(q => {
            const style = CARD_STYLES[q.color] || CARD_STYLES.slate;
            const { filled, total } = getQuestionCompletion(q, formData);
            const isComplete = q.hasTable && filled === total && total > 0;
            return (
              <div key={q.section} className={`bg-white rounded-2xl border-2 transition-all p-6 flex flex-col gap-4 ${isComplete ? 'border-emerald-300' : 'border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                    <span className={`material-symbols-outlined text-xl ${style.icon}`}>{q.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${style.icon}`}>P{q.principle || 6} Q{q.number}</p>
                    <h3 className="font-bold text-slate-800 text-sm">{q.title}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">{q.description}</p>
                <button onClick={() => setActiveQuestion(q)} className={`w-full py-2.5 rounded-xl font-bold text-sm text-white shadow-sm ${style.pill}`}>
                  {isComplete ? 'Edit Entry' : 'Enter Data'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {activeQuestion && (
        <QuestionWizard
          question={activeQuestion}
          formData={formData}
          pyData={pyData}
          fyMetrics={computeMetrics(formData)} // Use direct compute for live values
          onUpdate={handleUpdate}
          onClose={() => setActiveQuestion(null)}
        />
      )}
    </div>
  );
}

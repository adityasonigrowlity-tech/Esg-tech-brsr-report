'use client';

import React from 'react';

interface BrsrDashboardProps {
  setCurrentView: (view: 'overview' | 'entry' | 'review' | 'upload' | 'excel-review') => void;
  isUploaded: boolean;
  isReportGenerated: boolean;
  completionPercentage?: number;
}

export function BrsrDashboard({ 
  setCurrentView, 
  isUploaded, 
  isReportGenerated 
}: BrsrDashboardProps) {
  // Logic from original Overview.tsx
  const guidedEntryActive = isUploaded;
  // Note: step and totalSteps are usually passed down or managed in hook. 
  // For the dashboard view, we'll placeholder them or use 0 as it's the overview.
  const step = 1; 
  const totalSteps = 10;
  
  const progressPercentage = isReportGenerated ? 100 : (!isUploaded ? 0 : Math.min(95, Math.round(30 + ((step - 1) / totalSteps) * 70)));
  
  return (
    <div className="flex-1 px-8 py-10 max-w-5xl mx-auto w-full">
      <div className="mb-20">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-label-md font-bold text-primary uppercase tracking-widest text-xs">Setup Progress</span>
            <h1 className="text-3xl font-extrabold text-on-surface mt-1">BRSR Setup</h1>
          </div>
          <span className="text-title-md font-bold text-on-surface">{progressPercentage}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1: Data Upload */}
        <div className={`bg-surface-container-lowest p-8 rounded-2xl border ${isUploaded ? 'border-emerald-500 bg-emerald-50/10' : 'border-outline-variant/30'} flex flex-col gap-4 text-center items-center shadow-sm relative overflow-hidden transition-all duration-300`}>
          {isUploaded && (
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">check</span>
            </div>
          )}
          
          <div className={`w-16 h-16 rounded-full ${isUploaded ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container border border-outline'} flex items-center justify-center`}>
            <span className="material-symbols-outlined text-3xl">upload_file</span>
          </div>
          <h3 className="text-xl font-bold">1. Data Upload</h3>
          <p className="text-sm text-on-surface-variant flex-1">Upload last year&apos;s records to create your baseline metrics.</p>
          <button
            onClick={() => setCurrentView('upload')}
            className={`w-full mt-4 font-bold py-3 rounded-full transition-colors ${isUploaded ? 'bg-surface-container-low text-emerald-800 hover:bg-emerald-100 border border-emerald-200' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
          >
            {isUploaded ? 'Review Data' : 'Start Upload'}
          </button>
        </div>

        {/* Step 2: Guided Entry */}
        <div className={`bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/30 flex flex-col gap-4 text-center items-center shadow-sm relative overflow-hidden transition-all duration-500 ${!guidedEntryActive ? 'opacity-60 cursor-not-allowed grayscale-[50%]' : 'hover:shadow-md'}`}>
          <div className={`w-16 h-16 rounded-full ${!guidedEntryActive ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary'} flex items-center justify-center transition-colors`}>
            <span className="material-symbols-outlined text-3xl">edit_note</span>
          </div>
          <h3 className="text-xl font-bold">2. Guided Entry</h3>
          <p className="text-sm text-on-surface-variant flex-1">Input your new current year disclosures safely with guided assistance.</p>
          <button 
            onClick={() => guidedEntryActive && setCurrentView('entry')}
            disabled={!guidedEntryActive}
            className={`w-full mt-4 font-bold py-3 rounded-full transition-colors ${!guidedEntryActive ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]'}`}
          >
            {!guidedEntryActive ? 'Locked' : 'Start Entry'}
          </button>
        </div>

        {/* Step 3: Final Review */}
        <div className={`bg-surface-container-lowest p-8 rounded-2xl border ${isReportGenerated ? 'border-emerald-500 bg-emerald-50/10' : 'border-outline-variant/30'} relative overflow-hidden flex flex-col gap-4 text-center items-center shadow-sm transition-all duration-500 ${!guidedEntryActive ? 'opacity-60 cursor-not-allowed grayscale-[50%]' : 'hover:shadow-md'}`}>
          {isReportGenerated && (
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <span className="material-symbols-outlined text-xl">check</span>
            </div>
          )}
          <div className={`w-16 h-16 rounded-full ${!guidedEntryActive ? 'bg-slate-100 text-slate-400' : isReportGenerated ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'} flex items-center justify-center transition-colors`}>
            <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
          </div>
          <h3 className="text-xl font-bold">3. Final Review</h3>
          <p className="text-sm text-on-surface-variant flex-1">AI-assisted validation and anomaly detection before export.</p>
          <button 
            onClick={() => guidedEntryActive && setCurrentView('review')}
            disabled={!guidedEntryActive}
            className={`w-full mt-4 font-bold py-3 rounded-full transition-colors ${!guidedEntryActive ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}`}
          >
            {!guidedEntryActive ? 'Locked' : 'Review Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

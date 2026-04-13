'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { BrsrDashboard } from '@/features/brsr/components/BrsrDashboard';
import { BrsrWizard } from '@/features/brsr/components/BrsrWizard';
import { BrsrReview } from '@/features/brsr/components/BrsrReview';
import DataUpload from '@/features/brsr/components/DataUpload';
import { useBrsrState } from '@/features/brsr/hooks/useBrsrState';
import { computeMetrics, PyData } from '@/features/brsr/types';

export default function Home() {
  const [currentView, setCurrentView] = useState<'overview' | 'entry' | 'review' | 'upload' | 'excel-review'>('overview');
  const [selectedYear, setSelectedYear] = useState('FY 2024-25');
  const yearOptions = ['FY 2024-25', 'FY 2023-24', 'FY 2022-23'];

  // Upload state
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Global BRSR state management
  const { 
    pyData, 
    setPyData,
    formData, 
    setFormData, 
    isUploaded, 
    setIsUploaded,
    isReportGenerated,
    setIsReportGenerated
  } = useBrsrState(selectedYear);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadState('uploading');

    try {
      const fd = new FormData();
      fd.append('file', file);

      const response = await fetch('/api/brsr/parse-pdf', {
        method: 'POST',
        body: fd,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? `Server error: ${response.status}`);
      }

      setPyData(result.data as PyData);
      setUploadState('success');
      setIsUploaded(true);
    } catch (err) {
      console.error('[Home] PDF upload error:', err);
      setUploadError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while processing the PDF.'
      );
      setUploadState('error');
    }

    e.target.value = '';
  };

  // Derived metrics
  const pyMetrics = computeMetrics(pyData);
  const fyMetrics = computeMetrics(formData);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* 1. Left Sidebar */}
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Header 
          selectedYear={selectedYear} 
          setSelectedYear={setSelectedYear} 
          yearOptions={yearOptions} 
        />

        {/* Scrollable Content Body */}
        <main className="flex-1 overflow-y-auto w-full relative">
          <div className="w-full">
            {currentView === 'overview' && (
              <BrsrDashboard 
                setCurrentView={setCurrentView} 
                isUploaded={isUploaded} 
                isReportGenerated={isReportGenerated} 
              />
            )}

            {currentView === 'upload' && (
              <DataUpload 
                currentView={currentView}
                setCurrentView={setCurrentView}
                isUploaded={isUploaded}
                uploadState={uploadState}
                uploadError={uploadError}
                pyData={pyData}
                setPyData={setPyData}
                handleFileUpload={handleFileUpload}
              />
            )}

            {currentView === 'entry' && (
              <BrsrWizard 
                setCurrentView={setCurrentView}
                isUploaded={isUploaded}
                pyData={pyData}
                formData={formData}
                setFormData={setFormData}
                fyMetrics={fyMetrics}
              />
            )}

            {currentView === 'review' && (
              <BrsrReview 
                setCurrentView={setCurrentView}
                formData={formData}
                pyData={pyData}
                fyMetrics={fyMetrics}
                pyMetrics={pyMetrics}
                setIsReportGenerated={setIsReportGenerated}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

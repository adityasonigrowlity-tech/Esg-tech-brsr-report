import { useState, useEffect, useCallback } from 'react';
import { 
  PyData, BrsrFormData, 
  DEFAULT_PY_DATA, DEFAULT_FORM_DATA, 
  computeMetrics, PPP_FACTOR 
} from '../types';

export type ReportView = 'overview' | 'upload' | 'entry' | 'review' | 'excel-review';

export function useBrsrState(selectedYear: string) {
  const [currentView, setCurrentView] = useState<ReportView>('overview');
  const [isRestored, setIsRestored] = useState(false);
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  
  const [pyData, setPyData] = useState<PyData>(DEFAULT_PY_DATA);
  const [formData, setFormData] = useState<BrsrFormData>(DEFAULT_FORM_DATA);
  const [isSaving, setIsSaving] = useState(false);

  // Load state from local storage or API
  useEffect(() => {
    const fetchState = async () => {
      setIsRestored(false);
      try {
        const response = await fetch(`/api/brsr/state?year=${encodeURIComponent(selectedYear)}`);
        const json = await response.json();

        if (response.ok && json && !json.empty) {
          setPyData(json.py_data || DEFAULT_PY_DATA);
          setFormData(json.fy_data || DEFAULT_FORM_DATA);
          setIsReportGenerated(!!json.is_report_generated);
          setIsUploaded(!!json.is_uploaded);
        } else {
          // Fallback if no server data found
          setPyData(DEFAULT_PY_DATA);
          setFormData(DEFAULT_FORM_DATA);
          setIsReportGenerated(false);
          setIsUploaded(false);
        }
      } catch (e) {
        console.error('Failed to load BRSR state from server', e);
      } finally {
        setIsRestored(true);
      }
    };
    fetchState();
  }, [selectedYear]);

  // Save state (debounced)
  useEffect(() => {
    if (!isRestored) return;
    
    const saveState = async () => {
      setIsSaving(true);
      try {
        const data = { 
          year: selectedYear,
          pyData, 
          formData, 
          isReportGenerated, 
          isUploaded 
        };
        
        await fetch('/api/brsr/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } catch (e) {
        console.error('Failed to sync BRSR state to server', e);
      } finally {
        setIsSaving(false);
      }
    };

    const timer = setTimeout(saveState, 1000);
    return () => clearTimeout(timer);
  }, [isRestored, pyData, formData, isReportGenerated, selectedYear]);

  // Auto-calculate RevenuePPP
  useEffect(() => {
    const rev = parseFloat(String(formData.Revenue).replace(/,/g, ''));
    const computed = rev > 0 ? String(Math.round((rev * 10) / PPP_FACTOR)) : '';
    if (formData.RevenuePPP !== computed) {
      setFormData(prev => ({ ...prev, RevenuePPP: computed }));
    }
  }, [formData.Revenue]);

  const pyMetrics = computeMetrics(pyData);
  const fyMetrics = computeMetrics(formData, parseFloat(formData.RevenuePPP) || 0);

  const resetState = useCallback(() => {
    setPyData(DEFAULT_PY_DATA);
    setFormData(DEFAULT_FORM_DATA);
    setIsReportGenerated(false);
    setIsUploaded(false);
    setCurrentView('overview');
  }, []);

  return {
    currentView,
    setCurrentView,
    pyData,
    setPyData,
    formData,
    setFormData,
    pyMetrics,
    fyMetrics,
    isReportGenerated,
    setIsReportGenerated,
    isUploaded,
    setIsUploaded,
    isRestored,
    isSaving,
    resetState
  };
}

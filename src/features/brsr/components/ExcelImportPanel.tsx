'use client';

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExcelImportPanelProps {
  setFormData: (data: any) => void;
  setCurrentView: (view: any) => void;
}

export function ExcelImportPanel({ setFormData, setCurrentView }: ExcelImportPanelProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('/api/brsr/download-template');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SEBI_BRSR_Template.xlsm';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Template download failed:', err);
      setErrorMessage('Failed to download template. Please try again.');
      setStatus('error');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setErrorMessage(null);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/brsr/parse-excel', { method: 'POST', body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to parse file');

      setFormData(json.data);
      setCurrentView('excel-review');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing Excel file');
      setStatus('error');
    } finally {
      setStatus('idle');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-xl shadow-emerald-500/5 bg-gradient-to-br from-white to-emerald-50/30 dark:from-zinc-900 dark:to-emerald-950/20">
      <div className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="flex gap-6 items-start">
          <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="size-8" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display text-zinc-900 dark:text-zinc-50">Bulk Import</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Fastest Method</span>
            </div>
            <p className="text-zinc-500 max-w-lg">
              Populate the SEBI-compliant Excel template and upload it to instantly fill all disclosure fields. Perfect for handling large datasets.
            </p>
            
            <AnimatePresence>
              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-red-500 text-sm font-medium pt-2"
                >
                  <AlertCircle className="size-4" />
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Button 
            variant="outline" 
            className="rounded-xl h-12 px-6"
            onClick={handleDownloadTemplate}
          >
            <Download className="size-4 mr-2" />
            Get Template
          </Button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            className="hidden" 
            accept=".xlsx,.xlsm"
          />

          <Button 
            variant="default" 
            className="rounded-xl h-12 px-6 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200"
            disabled={status === 'loading'}
            onClick={() => fileInputRef.current?.click()}
          >
            {status === 'loading' ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Upload className="size-4 mr-2" />
            )}
            Upload Excel
          </Button>
        </div>
      </div>
    </Card>
  );
}

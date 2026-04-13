'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  QuestionConfig, BrsrFormData, PyData, 
  StepConfig, isFormulaKey 
} from '../types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  FunctionSquare,
  History,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuestionModalProps {
  question: QuestionConfig;
  formData: BrsrFormData;
  pyData: PyData;
  onUpdate: (key: any, val: string) => void;
  onClose: () => void;
}

export function QuestionModal({
  question,
  formData,
  pyData,
  onUpdate,
  onClose,
}: QuestionModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  
  const fields = question.fields;
  const currentField = fields[currentStep];
  const isFormula = isFormulaKey(currentField?.key);
  const pyVal = pyData[currentField?.key];
  const isLast = currentStep === fields.length - 1;

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentStep]);

  const handleNext = () => {
    if (isLast) onClose();
    else setCurrentStep(s => s + 1);
  };

  const handlePrev = () => {
    setCurrentStep(s => Math.max(0, s - 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md" 
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
               <span className="text-xs font-bold font-display uppercase">Q{question.number}</span>
             </div>
             <h3 className="font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-[400px]">
               {question.title}
             </h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="size-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-zinc-100 dark:bg-zinc-800">
           <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / fields.length) * 100}%` }}
           />
        </div>

        {/* Step Navigation Tabs */}
        <div className="px-6 py-3 overflow-x-auto border-b border-zinc-50 dark:border-zinc-800 whitespace-nowrap scrollbar-hide flex gap-2">
          {fields.map((f, i) => (
            <button
              key={f.key}
              onClick={() => setCurrentStep(i)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                i === currentStep 
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" 
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 hover:bg-zinc-200"
              )}
            >
              {isFormulaKey(f.key) ? 'Fx' : i + 1}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
           <div className="space-y-2">
             <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{currentField.category}</span>
             <h4 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
               {isFormula ? "Auto-computed Field" : "Data Entry"}
             </h4>
             <p className="text-zinc-500 font-medium">{currentField.title}</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Year Reference */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <History className="size-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Previous Year (PY)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {pyVal?.toLocaleString() || '—'}
                  </span>
                  <span className="text-sm text-zinc-400 font-medium">{currentField.unit}</span>
                </div>
              </div>

              {/* Current Year Input */}
              <div className={cn(
                "p-4 rounded-2xl border-2 transition-all space-y-2",
                isFormula 
                  ? "bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-within:border-emerald-500"
              )}>
                <div className="flex items-center gap-2 text-zinc-400">
                  {isFormula ? <FunctionSquare className="size-3 text-indigo-500" /> : <ChevronRight className="size-3" />}
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    isFormula && "text-indigo-500"
                  )}>
                    {isFormula ? "Formula Result" : "Current Year (FY)"}
                  </span>
                </div>

                {isFormula ? (
                   <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formData[currentField.key] || '0'}
                    </span>
                    <span className="text-sm text-indigo-400 font-medium">{currentField.unit}</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    {currentField.category === 'theory' ? (
                       <textarea
                        ref={inputRef as any}
                        className="w-full bg-transparent border-none focus:ring-0 text-lg font-bold p-0 resize-none h-24"
                        placeholder="Provide narrative..."
                        value={formData[currentField.key] || ''}
                        onChange={(e) => onUpdate(currentField.key, e.target.value)}
                       />
                    ) : (
                      <>
                        <input
                          ref={inputRef as any}
                          type="text"
                          className="w-full bg-transparent border-none focus:ring-0 text-3xl font-bold p-0"
                          placeholder="0.00"
                          value={formData[currentField.key] || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.-]/g, '');
                            onUpdate(currentField.key, val);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        />
                        <span className="text-sm text-zinc-400 font-medium">{currentField.unit}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
           </div>

           {/* Field Tip */}
           <div className="flex gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
             <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                <Info className="size-5" />
             </div>
             <p className="text-sm text-emerald-800 dark:text-emerald-400 leading-relaxed py-1">
               {currentField.tip}
             </p>
           </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
          <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 0}>
            <ChevronLeft className="size-4 mr-2" />
            Previous
          </Button>

          <Button variant="premium" className="px-8" onClick={handleNext}>
            {isLast ? (
              <>
                <Check className="size-4 mr-2" />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight className="size-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

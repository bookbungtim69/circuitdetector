'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Check, AlertCircle, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeySaved: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onApiKeySaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('circuit_detector_gemini_key') || '';
      setApiKey(stored);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const trimmed = apiKey.trim();
      if (trimmed) {
        localStorage.setItem('circuit_detector_gemini_key', trimmed);
      } else {
        localStorage.removeItem('circuit_detector_gemini_key');
      }
      onApiKeySaved(trimmed);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    }
  };

  const handleClear = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('circuit_detector_gemini_key');
      setApiKey('');
      onApiKeySaved('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-800/80 rounded-2xl p-6 shadow-2xl shadow-cyan-950/50">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">ตั้งค่า Gemini API Key</h3>
            <p className="text-xs text-slate-400">สำหรับการวิเคราะห์วงจรด้วย AI Vision</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              คีย์จะถูกจัดเก็บเฉพาะในบราวเซอร์ของคุณ (Local Storage) เท่านั้น
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-start gap-2 text-xs text-slate-300">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                หากยังไม่มี API Key สามารถสร้างได้ฟรีที่ Google AI Studio:
              </span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium hover:underline pl-6"
            >
              รับ Gemini API Key ฟรีทันที <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-950/70 border border-emerald-700/80 rounded-xl text-emerald-300 text-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>บันทึกการตั้งค่าสำเร็จ!</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
            >
              ล้างค่า
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-md shadow-cyan-500/20"
              >
                บันทึกคีย์
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

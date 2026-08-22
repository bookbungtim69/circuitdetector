'use client';

import React from 'react';
import { X, CheckCircle2, AlertOctagon, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { SAMPLE_PRESETS } from '@/lib/circuitRules';

interface SampleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sampleKey: string) => void;
}

export const SampleGalleryModal: React.FC<SampleGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  const samples = [
    {
      key: 'correct',
      title: '1. วงจรต่อถูกต้องสมบูรณ์',
      status: 'PASS',
      statusColor: 'emerald',
      icon: CheckCircle2,
      summary: 'D13 ➔ ตัวต้านทาน 220Ω ➔ ขั้วบวก LED ➔ ขั้วลบ LED ➔ GND',
      tag: 'พร้อมทดสอบไฟกระพริบ',
      accentBorder: 'border-emerald-500/40 hover:border-emerald-400',
      badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    },
    {
      key: 'reversed_polarity',
      title: '2. ต่อหลอด LED สลับขั้ว (Reversed)',
      status: 'FAIL',
      statusColor: 'red',
      icon: AlertOctagon,
      summary: 'ขั้วลบ (Cathode) ต่อรับไฟบวก และ Anode ต่อลงกราวด์ ไดโอดไม่นำกระแส',
      tag: 'ตรวจพบข้อผิดพลาดขั้วหลอด',
      accentBorder: 'border-red-500/40 hover:border-red-400',
      badgeBg: 'bg-red-950/80 text-red-300 border-red-700/60',
    },
    {
      key: 'missing_resistor',
      title: '3. ลืมต่อตัวต้านทาน (Missing Resistor)',
      status: 'WARNING',
      statusColor: 'amber',
      icon: AlertTriangle,
      summary: 'ต่อสายตรงจาก D13 เข้า LED ไม่มีโหลดจำกัดกระแส เสี่ยง LED ขาด',
      tag: 'ตรวจพบความเสี่ยงกระแสเกิน',
      accentBorder: 'border-amber-500/40 hover:border-amber-400',
      badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    },
    {
      key: 'wrong_pin',
      title: '4. เสียบสายสัญญาณผิดพิน (Wrong Pin)',
      status: 'FAIL',
      statusColor: 'red',
      icon: AlertOctagon,
      summary: 'สายไฟเสียบที่พิน RESET/3V3 แทนที่จะเป็น Digital Pin D13 หรือ D2-D12',
      tag: 'ตรวจพบพินไม่ตรงคำสั่ง',
      accentBorder: 'border-red-500/40 hover:border-red-400',
      badgeBg: 'bg-red-950/80 text-red-300 border-red-700/60',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              คลังเคสตัวอย่างสำหรับทดสอบระบบ
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              เลือกจำลองการตรวจสอบวงจรในสถานะต่างๆ ได้ทันที
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {samples.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                onClick={() => {
                  onSelectSample(item.key);
                  onClose();
                }}
                className={`group cursor-pointer p-4 rounded-xl bg-slate-950/70 border ${item.accentBorder} transition-all duration-200 hover:bg-slate-900 hover:scale-[1.02] flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${item.badgeBg}`}>
                      {item.status}
                    </span>
                    <Icon className={`w-4 h-4 text-${item.statusColor}-400`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-1 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {item.summary}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
                  <span className="text-[11px] text-slate-400">{item.tag}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    ทดสอบเคสนี้ <Play className="w-3 h-3 fill-current" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import {
  CircuitAnalysisResult,
  DetectedComponent,
  CircuitChecklistItem,
} from '@/types/circuit';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  Download,
  Layers,
  Wrench,
  ListChecks,
  Sparkles,
} from 'lucide-react';

interface DiagnosticPanelProps {
  result: CircuitAnalysisResult | null;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  isAnalyzing: boolean;
}

export const DiagnosticPanel: React.FC<DiagnosticPanelProps> = ({
  result,
  selectedComponentId,
  onSelectComponent,
  isAnalyzing,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'fix' | 'components'>('checklist');

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-2xl border border-cyan-900/60 text-center min-h-[420px] shadow-xl backdrop-blur-md">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 animate-pulse">
            <Activity className="w-7 h-7 animate-spin" />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1">
          ระบบ AI กำลังวิเคราะห์วงจร...
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          ตรวจจับตำแหน่งขาพิน Arduino Nano, ขั้วของ LED, ตัวต้านทาน และเส้นทางสายไฟ
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800 text-center min-h-[420px] shadow-xl backdrop-blur-md">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Activity className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-300 mb-1">
          พร้อมสำหรับการตรวจสอบวงจร
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          เปิดกล้องเพื่อจับภาพ หรือเลือกทดสอบจากเมนู &ldquo;ตัวอย่างทดสอบ&rdquo; เพื่อเริ่มวิเคราะห์
        </p>
      </div>
    );
  }

  const isPass = result.status === 'CORRECT';
  const isFail = result.status === 'INCORRECT';
  const isWarning = result.status === 'WARNING';

  const downloadReport = () => {
    const reportText = `=== รายงานผลการตรวจสอบวงจร Arduino Nano + LED ===
วันที่และเวลา: ${new Date(result.timestamp).toLocaleString('th-TH')}
สถานะวงจร: ${result.status} (${result.isCorrect ? 'ผ่าน - ต่อถูกต้อง' : 'ไม่ผ่าน - ต่อผิด'})
คะแนนความถูกต้อง: ${result.score}/100

[สรุปผลการวิเคราะห์]
${result.summary}

[รายการตรวจสอบ (Checklist)]
${result.checklist.map((c) => `- [${c.status.toUpperCase()}] ${c.title}: ${c.details} ${c.recommendation ? `(แนะนำ: ${c.recommendation})` : ''}`).join('\n')}

[การเดินสายไฟ (Wire Tracking)]
- สายสัญญาณ: ${result.wireTracking.signalPath}
- สายกราวด์: ${result.wireTracking.gndPath}
- สถานะครบวงจร (Closed Loop): ${result.wireTracking.isClosedLoop ? 'ใช่' : 'ไม่ใช่'}

[คำแนะนำและวิธีแก้ไข]
${result.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `circuit-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-3 bg-slate-900/90 rounded-2xl border border-cyan-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Top Compact Result Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
          isPass
            ? 'bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border-emerald-500/70 glow-green'
            : isFail
            ? 'bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 border-red-500/70 glow-red'
            : 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border-amber-500/70 glow-amber'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                isPass
                  ? 'bg-emerald-900/80 border-emerald-400 text-emerald-300'
                  : isFail
                  ? 'bg-red-900/80 border-red-400 text-red-300'
                  : 'bg-amber-900/80 border-amber-400 text-amber-300'
              }`}
            >
              {isPass ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : isFail ? (
                <XCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                    isPass
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : isFail
                      ? 'bg-red-950 text-red-300 border-red-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}
                >
                  {result.status}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ความแม่นยำ {result.score}%
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                {isPass
                  ? 'วงจรต่อถูกต้อง (PASS)'
                  : isFail
                  ? 'พบข้อผิดพลาดในวงจร (FAIL)'
                  : 'พบจุดเตือนอันตราย (WARNING)'}
              </h2>
            </div>
          </div>
        </div>

        {/* Concise summary text */}
        <p className="mt-2 text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
          {result.summary}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'checklist'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
          <span>รายการตรวจ ({result.checklist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fix')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'fix'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5 text-cyan-400" />
          <span>ขั้นตอนแก้ไข</span>
        </button>

        <button
          onClick={() => setActiveTab('components')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'components'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>ชิ้นส่วน ({result.detectedComponents.length})</span>
        </button>
      </div>

      {/* Tab 1: Checklist Content */}
      {activeTab === 'checklist' && (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {result.checklist.map((item: CircuitChecklistItem) => {
            const isItemPass = item.status === 'pass';
            const isItemFail = item.status === 'fail';
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-colors ${
                  isItemPass
                    ? 'bg-slate-950/70 border-emerald-900/50'
                    : isItemFail
                    ? 'bg-red-950/30 border-red-900/60'
                    : 'bg-amber-950/30 border-amber-900/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isItemPass ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : isItemFail ? (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xs font-bold text-slate-200">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {item.details}
                    </p>
                    {item.recommendation && (
                      <p className="text-[11px] text-amber-300/95 font-medium bg-amber-950/60 px-2 py-1 rounded-md border border-amber-800/40 mt-1">
                        👉 {item.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Action Steps & Wire Path */}
      {activeTab === 'fix' && (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {/* Wire Path Tracing */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>เส้นทางการไหลของกระแสไฟ (Wire Tracing)</span>
            </h4>
            <div className="text-[11px] space-y-1 text-slate-300">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-cyan-400 font-mono font-semibold">Signal: </span>
                <span>{result.wireTracking.signalPath}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-blue-400 font-mono font-semibold">Ground: </span>
                <span>{result.wireTracking.gndPath}</span>
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="p-3 bg-slate-950/90 rounded-xl border border-cyan-900/60 space-y-2">
            <h4 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>ขั้นตอนแก้ไขที่แนะนำ (Action Steps)</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Detected Components List */}
      {activeTab === 'components' && (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          <p className="text-[11px] text-slate-400 mb-1">
            คลิกที่ชิ้นส่วนเพื่อไฮไลต์ตำแหน่งบนภาพ:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {result.detectedComponents.map((comp: DetectedComponent) => {
              const isSelected = selectedComponentId === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => onSelectComponent(isSelected ? null : comp.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/50'
                      : comp.status === 'ok'
                      ? 'bg-slate-950/70 border-emerald-900/40 hover:border-emerald-700'
                      : comp.status === 'error'
                      ? 'bg-slate-950/70 border-red-900/40 hover:border-red-700'
                      : 'bg-slate-950/70 border-amber-900/40 hover:border-amber-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {comp.name}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase shrink-0 ${
                        comp.status === 'ok'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : comp.status === 'error'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    {comp.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Export / Download Report Footer */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
        <button
          onClick={downloadReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 hover:border-cyan-500 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>ดาวน์โหลดรายงาน (Report.txt)</span>
        </button>
      </div>
    </div>
  );
};

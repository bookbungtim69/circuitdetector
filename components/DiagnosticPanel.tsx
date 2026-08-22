'use client';

import React from 'react';
import {
  CircuitAnalysisResult,
  DetectedComponent,
  CircuitChecklistItem,
} from '@/types/circuit';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Cpu,
  Zap,
  Activity,
  ArrowRight,
  Download,
  Share2,
  Sparkles,
  Layers,
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
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/90 rounded-2xl border border-cyan-900/60 text-center min-h-[400px]">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 animate-pulse">
            <Activity className="w-7 h-7 animate-spin" />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1">
          ระบบ AI กำลังประมวลผลและตรวจสอบวงจร...
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          ตรวจจับตำแหน่งขาพิน Arduino Nano, ขั้วของ LED, ตัวต้านทาน และเส้นทางสายไฟ
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-900/80 rounded-2xl border border-slate-800 text-center min-h-[400px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-3">
          <Cpu className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-300 mb-1">
          ยังไม่มีผลการตรวจสอบ
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
          เปิดกล้องหรืออัปโหลดรูปภาพวงจร หรือเลือกจาก &ldquo;ตัวอย่างทดสอบ&rdquo; เพื่อเริ่มการวิเคราะห์
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
    <div className="flex flex-col space-y-5 bg-slate-900/90 rounded-2xl border border-cyan-900/60 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Top Result Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isPass
            ? 'bg-gradient-to-r from-emerald-950/90 to-slate-950 border-emerald-500/70 glow-green'
            : isFail
            ? 'bg-gradient-to-r from-red-950/90 to-slate-950 border-red-500/70 glow-red'
            : 'bg-gradient-to-r from-amber-950/90 to-slate-950 border-amber-500/70 glow-amber'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl border ${
                isPass
                  ? 'bg-emerald-900/80 border-emerald-400 text-emerald-300'
                  : isFail
                  ? 'bg-red-900/80 border-red-400 text-red-300'
                  : 'bg-amber-900/80 border-amber-400 text-amber-300'
              }`}
            >
              {isPass ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : isFail ? (
                <XCircle className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isPass
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : isFail
                      ? 'bg-red-950 text-red-300 border-red-700'
                      : 'bg-amber-950 text-amber-300 border-amber-700'
                  }`}
                >
                  {result.status}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  ความแม่นยำ {result.score}%
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 mt-1">
                {isPass
                  ? 'วงจรต่อถูกต้องสมบูรณ์ (PASS)'
                  : isFail
                  ? 'พบข้อผิดพลาดในวงจร (FAIL)'
                  : 'พบจุดเตือนอันตราย (WARNING)'}
              </h2>
            </div>
          </div>
        </div>

        {/* Summary Description */}
        <p className="mt-3 text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          {result.summary}
        </p>
      </div>

      {/* Verification Checklist */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" />
          รายการตรวจสอบความถูกต้อง (Verification Checklist)
        </h3>
        <div className="space-y-2">
          {result.checklist.map((item: CircuitChecklistItem) => {
            const isItemPass = item.status === 'pass';
            const isItemFail = item.status === 'fail';
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-colors ${
                  isItemPass
                    ? 'bg-slate-950/70 border-emerald-900/50 hover:border-emerald-700/60'
                    : isItemFail
                    ? 'bg-red-950/30 border-red-900/60 hover:border-red-700/80'
                    : 'bg-amber-950/30 border-amber-900/60 hover:border-amber-700/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    {isItemPass ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : isItemFail ? (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.details}
                      </p>
                      {item.recommendation && (
                        <p className="text-[11px] text-amber-300/90 mt-1 font-medium bg-amber-950/50 px-2 py-1 rounded border border-amber-800/40">
                          👉 {item.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wire Tracking Info */}
      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
        <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-cyan-400" />
          เส้นทางการไหลของกระแสไฟ (Wire Path Tracing)
        </h3>
        <div className="text-xs space-y-1.5 text-slate-300">
          <div className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-cyan-400 font-mono shrink-0">Signal:</span>
            <span>{result.wireTracking.signalPath}</span>
          </div>
          <div className="flex items-start gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-blue-400 font-mono shrink-0">Ground:</span>
            <span>{result.wireTracking.gndPath}</span>
          </div>
        </div>
      </div>

      {/* Fix Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="p-4 bg-slate-950/90 rounded-xl border border-cyan-900/60 space-y-2">
          <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            ขั้นตอนและคำแนะนำในการแก้ไข (Action Steps)
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detected Components Tag List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          ชิ้นส่วนที่ตรวจพบ ({result.detectedComponents.length})
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {result.detectedComponents.map((comp: DetectedComponent) => {
            const isSelected = selectedComponentId === comp.id;
            return (
              <button
                key={comp.id}
                onClick={() => onSelectComponent(isSelected ? null : comp.id)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200 font-bold scale-105'
                    : comp.status === 'ok'
                    ? 'bg-slate-950 border-emerald-800/60 text-emerald-300 hover:border-emerald-600'
                    : comp.status === 'error'
                    ? 'bg-slate-950 border-red-800/60 text-red-300 hover:border-red-600'
                    : 'bg-slate-950 border-amber-800/60 text-amber-300 hover:border-amber-600'
                }`}
              >
                {comp.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export / Download Report */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
        <button
          onClick={downloadReport}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 hover:border-cyan-500 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>ดาวน์โหลดรายงานผล (Report.txt)</span>
        </button>
      </div>
    </div>
  );
};

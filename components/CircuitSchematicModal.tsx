'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Info, Cpu, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CircuitSchematicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CircuitSchematicModal: React.FC<CircuitSchematicModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const arduinoCode = `// Arduino Nano + LED Blink Sample Code
const int ledPin = 13; // กำหนดขา Digital Pin 13

void setup() {
  pinMode(ledPin, OUTPUT); // ตั้งค่าให้ขา 13 ทำหน้าที่เป็น OUTPUT
}

void loop() {
  digitalWrite(ledPin, HIGH); // สั่งจ่ายไฟ 5V (LED สว่าง)
  delay(1000);               // รอ 1 วินาที (1000 ms)
  digitalWrite(ledPin, LOW);  // สั่งตัดไฟ 0V (LED ดับ)
  delay(1000);               // รอ 1 วินาที
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(arduinoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">
              แผนผังและคู่มือการต่อวงจร Arduino Nano + LED
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              มาตรฐานการต่อวงจรทดสอบ LED พร้อมตัวต้านทานจำกัดกระแสบน Breadboard
            </p>
          </div>
        </div>

        {/* SVG Interactive Circuit Diagram */}
        <div className="mb-6 p-4 sm:p-6 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden">
          <div className="text-xs font-semibold text-cyan-400 mb-3 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Interactive Wiring Schematic</span>
          </div>

          <div className="w-full flex justify-center items-center py-2">
            <svg
              viewBox="0 0 750 320"
              className="w-full max-w-2xl h-auto drop-shadow-md select-none"
            >
              <defs>
                <linearGradient id="nanoGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#0e7490" />
                </linearGradient>
                <linearGradient id="breadboardGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="ledGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>

              {/* Arduino Nano Board */}
              <rect x="40" y="50" width="160" height="220" rx="10" fill="url(#nanoGrad)" stroke="#22d3ee" strokeWidth="2" />
              <rect x="75" y="35" width="90" height="25" rx="4" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1.5" />
              <text x="120" y="50" fill="#0f172a" fontSize="10" fontWeight="bold" textAnchor="middle">Mini-USB</text>

              <rect x="80" y="100" width="80" height="80" rx="4" fill="#1e293b" stroke="#334155" />
              <text x="120" y="145" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">ATmega328P</text>
              <text x="120" y="240" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">ARDUINO NANO</text>

              {/* Pin Headers Nano */}
              {/* Left Pin D13 */}
              <circle cx="45" cy="180" r="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
              <text x="58" y="184" fill="#fef08a" fontSize="11" fontWeight="bold">D13 (Pin)</text>

              {/* Right Pin GND */}
              <circle cx="195" cy="200" r="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
              <text x="180" y="204" fill="#e0f2fe" fontSize="11" fontWeight="bold" textAnchor="end">GND (Pin)</text>

              {/* Breadboard Body */}
              <rect x="330" y="40" width="370" height="240" rx="12" fill="url(#breadboardGrad)" stroke="#cbd5e1" strokeWidth="2" />
              <text x="515" y="65" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="middle">BREADBOARD (HALF SIZE)</text>

              {/* Breadboard Row Lines */}
              <line x1="360" y1="120" x2="670" y2="120" stroke="#cbd5e1" strokeDasharray="6 6" strokeWidth="1.5" />
              <line x1="360" y1="180" x2="670" y2="180" stroke="#cbd5e1" strokeDasharray="6 6" strokeWidth="1.5" />
              <line x1="360" y1="220" x2="670" y2="220" stroke="#cbd5e1" strokeDasharray="6 6" strokeWidth="1.5" />

              {/* Tie points */}
              <circle cx="390" cy="120" r="4" fill="#64748b" />
              <circle cx="470" cy="120" r="4" fill="#64748b" />
              <circle cx="550" cy="120" r="4" fill="#64748b" />
              <circle cx="550" cy="180" r="4" fill="#64748b" />
              <circle cx="550" cy="220" r="4" fill="#64748b" />

              {/* Resistor Component (220 Ohm) */}
              <path d="M 390 120 L 415 120 L 420 110 L 430 130 L 440 110 L 450 130 L 460 110 L 465 120 L 470 120" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="415" y="108" width="50" height="24" rx="4" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
              {/* Color bands: Red-Red-Brown-Gold */}
              <rect x="422" y="108" width="4" height="24" fill="#dc2626" />
              <rect x="430" y="108" width="4" height="24" fill="#dc2626" />
              <rect x="438" y="108" width="4" height="24" fill="#78350f" />
              <rect x="454" y="108" width="4" height="24" fill="#eab308" />
              <text x="440" y="146" fill="#1e293b" fontSize="10" fontWeight="bold" textAnchor="middle">220Ω</text>

              {/* LED Component */}
              {/* Anode leg */}
              <path d="M 470 120 L 530 120 L 530 145" fill="none" stroke="#64748b" strokeWidth="2.5" />
              {/* Cathode leg */}
              <path d="M 530 175 L 530 220 L 470 220" fill="none" stroke="#64748b" strokeWidth="2.5" />
              {/* LED Bulb */}
              <circle cx="530" cy="160" r="16" fill="url(#ledGrad)" stroke="#f87171" strokeWidth="2" />
              <text x="560" y="152" fill="#ef4444" fontSize="11" fontWeight="bold">Anode (+)</text>
              <text x="560" y="172" fill="#0284c7" fontSize="11" fontWeight="bold">Cathode (-)</text>

              {/* Wires */}
              {/* Signal Wire Red: D13 -> Resistor Node */}
              <path d="M 45 180 C 100 10 320 20 390 120" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <text x="230" y="55" fill="#f87171" fontSize="11" fontWeight="bold">สายสีแดง (Signal D13)</text>

              {/* GND Wire Black: GND -> Breadboard GND Node */}
              <path d="M 195 200 C 260 270 380 270 470 220" fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
              <text x="260" y="275" fill="#38bdf8" fontSize="11" fontWeight="bold">สายสีน้ำเงิน/ดำ (GND)</text>
            </svg>
          </div>
        </div>

        {/* Wiring Checklist Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              ตารางเชื่อมต่อพิน (Pinout Table)
            </h4>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-mono text-cyan-400">Arduino D13</span>
                <span>➔ ตัวต้านทาน 220Ω (ขาที่ 1)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-mono text-amber-400">ตัวต้านทาน (ขาที่ 2)</span>
                <span>➔ ขา Anode (+) ของ LED (ขายาว)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-mono text-emerald-400">ขา Cathode (-) ของ LED</span>
                <span>➔ ขาสั้น / บากเรียบ ➔ สาย GND</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                <span className="font-mono text-blue-400">Arduino GND</span>
                <span>➔ ขั้วลบ (Cathode) ครบวงจร</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              ข้อควรระวังสำคัญ (Best Practices)
            </h4>
            <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-amber-200">ห้ามลืมตัวต้านทาน:</strong> กระแส 5V จาก Arduino จะทำให้หลอด LED ไหม้ทันทีหากไม่มีตัวต้านทาน 220Ω - 1kΩ
              </li>
              <li>
                <strong className="text-amber-200">ตรวจสอบขั้ว LED:</strong> ขั้วบวก (Anode) คือขายาว หรือแผ่นโลหะเล็กด้านในหลอด, ขั้วลบ (Cathode) คือขาสั้น หรือแผ่นธงใหญ่
              </li>
              <li>
                <strong className="text-amber-200">แถวของ Breadboard:</strong> รูเสียบในแนวนอนแถวเดียวกัน (a-b-c-d-e) ต่อถึงกัน อย่าเสียบขาบวกและขาลบลงในแถวเดียวกันเพราะจะเกิดการลัดวงจร
              </li>
            </ul>
          </div>
        </div>

        {/* Arduino Code Snippet */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              โค้ดตัวอย่าง Arduino (.ino) - ทดสอบไฟกระพริบ
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกโค้ด</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800/80">
            {arduinoCode}
          </pre>
        </div>
      </div>
    </div>
  );
};

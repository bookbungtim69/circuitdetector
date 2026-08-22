'use client';

import React, { useState } from 'react';
import { DetectedComponent } from '@/types/circuit';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

interface CircuitCanvasOverlayProps {
  imageSrc: string | null;
  detectedComponents: DetectedComponent[];
  isAnalyzing: boolean;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
}

export const CircuitCanvasOverlay: React.FC<CircuitCanvasOverlayProps> = ({
  imageSrc,
  detectedComponents,
  isAnalyzing,
  selectedComponentId,
  onSelectComponent,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!imageSrc) return null;

  const activeId = selectedComponentId || hoveredId;
  const activeComponent = detectedComponents.find((c) => c.id === activeId);

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center bg-slate-950 overflow-hidden rounded-2xl border border-slate-800">
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt="Circuit Under Test"
        className="w-full h-full object-contain select-none max-h-[550px]"
      />

      {/* Analysis Scanline Animation */}
      {isAnalyzing && (
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="hud-scanline" />
          <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <div className="absolute w-8 h-8 rounded-full bg-cyan-500/30 animate-ping" />
            </div>
            <div className="px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/60 text-cyan-300 text-xs font-mono tracking-wider animate-pulse shadow-lg">
              🔍 AI กำลังวิเคราะห์สายไฟและชิ้นส่วนวงจร...
            </div>
          </div>
        </div>
      )}

      {/* SVG Overlay for Bounding Boxes & Badges */}
      {!isAnalyzing && (
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-auto z-10"
        >
          <defs>
            <filter id="glowOk" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glowErr" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {detectedComponents.map((comp) => {
            if (!comp.box) return null;
            const { ymin, xmin, ymax, xmax } = comp.box;
            const width = Math.max(20, xmax - xmin);
            const height = Math.max(20, ymax - ymin);
            const isHovered = activeId === comp.id;

            let strokeColor = '#10b981'; // green for ok
            let fillColor = 'rgba(16, 185, 129, 0.12)';
            let badgeBg = '#064e3b';
            let badgeTextColor = '#6ee7b7';

            if (comp.status === 'error') {
              strokeColor = '#ef4444'; // red for error
              fillColor = 'rgba(239, 68, 68, 0.2)';
              badgeBg = '#7f1d1d';
              badgeTextColor = '#fca5a5';
            } else if (comp.status === 'warning') {
              strokeColor = '#f59e0b'; // amber
              fillColor = 'rgba(245, 158, 11, 0.18)';
              badgeBg = '#78350f';
              badgeTextColor = '#fcd34d';
            } else if (comp.type === 'arduino_nano') {
              strokeColor = '#06b6d4'; // cyan
              fillColor = 'rgba(6, 182, 212, 0.15)';
              badgeBg = '#164e63';
              badgeTextColor = '#67e8f9';
            }

            return (
              <g
                key={comp.id}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredId(comp.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectComponent(selectedComponentId === comp.id ? null : comp.id)}
              >
                {/* Bounding Box Rectangle */}
                <rect
                  x={xmin}
                  y={ymin}
                  width={width}
                  height={height}
                  rx="12"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHovered ? '4' : '2.5'}
                  strokeDasharray={comp.status === 'error' ? '6 4' : undefined}
                  className="transition-all duration-200"
                  filter={isHovered ? (comp.status === 'error' ? 'url(#glowErr)' : 'url(#glowOk)') : undefined}
                />

                {/* Corner Accents */}
                <path
                  d={`M ${xmin} ${ymin + 20} L ${xmin} ${ymin} L ${xmin + 20} ${ymin}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3.5"
                />
                <path
                  d={`M ${xmax - 20} ${ymin} L ${xmax} ${ymin} L ${xmax} ${ymin + 20}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3.5"
                />
                <path
                  d={`M ${xmin} ${ymax - 20} L ${xmin} ${ymax} L ${xmin + 20} ${ymax}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3.5"
                />
                <path
                  d={`M ${xmax - 20} ${ymax} L ${xmax} ${ymax} L ${xmax} ${ymax - 20}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3.5"
                />

                {/* Label Badge on top of Box */}
                <g transform={`translate(${xmin}, ${Math.max(15, ymin - 28)})`}>
                  <rect
                    x="0"
                    y="0"
                    width={Math.min(300, Math.max(120, comp.name.length * 9.5 + 40))}
                    height="26"
                    rx="6"
                    fill={badgeBg}
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    opacity="0.95"
                  />
                  <text
                    x="12"
                    y="17"
                    fill={badgeTextColor}
                    fontSize="13"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {comp.label || comp.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      )}

      {/* Floating Tooltip details on Active Component */}
      {activeComponent && !isAnalyzing && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs z-30 p-3.5 rounded-xl bg-slate-900/95 border border-cyan-700/80 shadow-2xl backdrop-blur-md text-xs animate-fadeIn">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              {activeComponent.status === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : activeComponent.status === 'error' ? (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="font-bold text-slate-100">{activeComponent.name}</span>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                activeComponent.status === 'ok'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : activeComponent.status === 'error'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {activeComponent.status}
            </span>
          </div>

          <p className="text-slate-300 leading-relaxed">{activeComponent.description}</p>

          {activeComponent.polarity && (
            <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-400">
              <div>
                <span className="text-cyan-400">Anode (+):</span> {activeComponent.polarity.anodeConnectedTo || '-'}
              </div>
              <div>
                <span className="text-blue-400">Cathode (-):</span> {activeComponent.polarity.cathodeConnectedTo || '-'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

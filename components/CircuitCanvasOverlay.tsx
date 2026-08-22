'use client';

import React, { useState, useRef } from 'react';
import { DetectedComponent } from '@/types/circuit';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Sparkles,
} from 'lucide-react';

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
  const [overlayMode, setOverlayMode] = useState<'full' | 'box_only' | 'hidden'>('full');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  if (!imageSrc) return null;

  const activeId = selectedComponentId || hoveredId;
  const activeComponent = detectedComponents.find((c) => c.id === activeId);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(3, +(prev + 0.3).toFixed(1)));
  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(1, +(prev - 0.3).toFixed(1));
      if (next === 1) setPanPos({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanPos({ x: 0, y: 0 });
  };

  // Pan handlers when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="flex flex-col space-y-2">
      {/* Control Toolbar on Top of Canvas */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md text-xs">
        {/* Overlay Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setOverlayMode('full')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              overlayMode === 'full'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="แสดงกรอบและป้ายกำกับ"
          >
            ป้ายกำกับย่อ
          </button>
          <button
            onClick={() => setOverlayMode('box_only')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              overlayMode === 'box_only'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="แสดงเฉพาะเส้นกรอบ ไม่บังภาพ"
          >
            เฉพาะเส้นกรอบ
          </button>
          <button
            onClick={() => setOverlayMode('hidden')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              overlayMode === 'hidden'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="ซ่อนกรอบ ดูภาพจริงชัดเจน"
          >
            <EyeOff className="w-3.5 h-3.5 inline mr-1" />
            ดูภาพจริง
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-900 transition-colors"
            title="ซูมออก"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 text-[11px] font-mono text-cyan-400 min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="p-1 rounded text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-900 transition-colors"
            title="ซูมเข้า"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel > 1 && (
            <button
              onClick={handleResetZoom}
              className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition-colors"
              title="รีเซ็ตขนาด 100%"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Image Viewport Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-full min-h-[380px] max-h-[550px] flex items-center justify-center bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 select-none ${
          zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* Zoomable Container */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${panPos.y / zoomLevel}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Circuit Under Test"
            className="w-full h-full object-contain pointer-events-none max-h-[540px]"
            draggable={false}
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

          {/* SVG Overlay */}
          {!isAnalyzing && overlayMode !== 'hidden' && (
            <svg
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-auto z-10"
            >
              <defs>
                <filter id="glowOk" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowErr" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {detectedComponents.map((comp, idx) => {
                if (!comp.box) return null;
                const { ymin, xmin, ymax, xmax } = comp.box;
                const width = Math.max(15, xmax - xmin);
                const height = Math.max(15, ymax - ymin);
                const isHovered = activeId === comp.id;

                let strokeColor = '#10b981'; // green for ok
                let fillColor = 'rgba(16, 185, 129, 0.08)';
                let badgeBg = '#064e3b';
                let badgeTextColor = '#6ee7b7';
                let iconSymbol = '✓';

                if (comp.status === 'error') {
                  strokeColor = '#ef4444'; // red for error
                  fillColor = 'rgba(239, 68, 68, 0.12)';
                  badgeBg = '#7f1d1d';
                  badgeTextColor = '#fca5a5';
                  iconSymbol = '✕';
                } else if (comp.status === 'warning') {
                  strokeColor = '#f59e0b'; // amber
                  fillColor = 'rgba(245, 158, 11, 0.1)';
                  badgeBg = '#78350f';
                  badgeTextColor = '#fcd34d';
                  iconSymbol = '⚠';
                } else if (comp.type === 'arduino_nano') {
                  strokeColor = '#06b6d4'; // cyan
                  fillColor = 'rgba(6, 182, 212, 0.08)';
                  badgeBg = '#164e63';
                  badgeTextColor = '#67e8f9';
                  iconSymbol = 'μC';
                }

                // Short friendly label
                const shortTitle = comp.label || comp.name.split('(')[0].trim();

                return (
                  <g
                    key={comp.id}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredId(comp.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSelectComponent(selectedComponentId === comp.id ? null : comp.id)}
                  >
                    {/* Bounding Box Rectangle (Thin & Elegant) */}
                    <rect
                      x={xmin}
                      y={ymin}
                      width={width}
                      height={height}
                      rx="8"
                      fill={isHovered ? fillColor.replace('0.08', '0.2').replace('0.12', '0.25') : fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? '3.5' : '2'}
                      strokeDasharray={comp.status === 'error' ? '6 4' : undefined}
                      className="transition-all duration-200"
                      filter={isHovered ? (comp.status === 'error' ? 'url(#glowErr)' : 'url(#glowOk)') : undefined}
                    />

                    {/* Corner Reticle Accents */}
                    <path
                      d={`M ${xmin} ${ymin + 14} L ${xmin} ${ymin} L ${xmin + 14} ${ymin}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                    />
                    <path
                      d={`M ${xmax - 14} ${ymin} L ${xmax} ${ymin} L ${xmax} ${ymin + 14}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                    />
                    <path
                      d={`M ${xmin} ${ymax - 14} L ${xmin} ${ymax} L ${xmin + 14} ${ymax}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                    />
                    <path
                      d={`M ${xmax - 14} ${ymax} L ${xmax} ${ymax} L ${xmax - 14} ${ymax}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                    />

                    {/* Compact Non-Obstructive Badge */}
                    {overlayMode === 'full' && (
                      <g transform={`translate(${xmin}, ${Math.max(12, ymin - 22)})`}>
                        {/* Compact Pill Badge */}
                        <rect
                          x="0"
                          y="0"
                          width={Math.min(180, Math.max(70, shortTitle.length * 7.5 + 24))}
                          height="20"
                          rx="5"
                          fill={badgeBg}
                          stroke={strokeColor}
                          strokeWidth="1"
                          opacity="0.9"
                        />
                        {/* Status Icon */}
                        <text
                          x="7"
                          y="14"
                          fill={badgeTextColor}
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {iconSymbol}
                        </text>
                        {/* Component Name */}
                        <text
                          x="20"
                          y="14"
                          fill={badgeTextColor}
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {shortTitle.length > 18 ? shortTitle.slice(0, 16) + '...' : shortTitle}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Floating Tooltip details on Active Component (Bottom Right) */}
        {activeComponent && !isAnalyzing && (
          <div className="absolute bottom-3 right-3 left-3 sm:left-auto sm:max-w-xs z-30 p-3 rounded-xl bg-slate-900/95 border border-cyan-700/80 shadow-2xl backdrop-blur-md text-xs animate-fadeIn">
            <div className="flex items-start justify-between gap-2 mb-1">
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
              <div className="mt-2 pt-1.5 border-t border-slate-800 text-[11px] space-y-0.5 text-slate-400">
                <div>
                  <span className="text-cyan-400 font-semibold">Anode (+):</span> {activeComponent.polarity.anodeConnectedTo || '-'}
                </div>
                <div>
                  <span className="text-blue-400 font-semibold">Cathode (-):</span> {activeComponent.polarity.cathodeConnectedTo || '-'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

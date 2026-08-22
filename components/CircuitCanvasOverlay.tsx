'use client';

import React, { useState } from 'react';
import { DetectedComponent } from '@/types/circuit';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SplitSquareVertical,
  Image as ImageIcon,
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
  const [viewMode, setViewMode] = useState<'annotated' | 'side_by_side' | 'original'>('annotated');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPos, setPanPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Pan handlers when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panPos.x, y: e.clientY - panPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanPos({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // SVG Annotation renderer (Constrained 100% to Image Surface)
  const renderSvgOverlay = () => {
    return (
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full pointer-events-auto z-10 select-none"
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

        {detectedComponents.map((comp) => {
          if (!comp.box) return null;
          const ymin = Math.max(0, Math.min(990, comp.box.ymin));
          const xmin = Math.max(0, Math.min(990, comp.box.xmin));
          const ymax = Math.max(ymin + 10, Math.min(1000, comp.box.ymax));
          const xmax = Math.max(xmin + 10, Math.min(1000, comp.box.xmax));
          const width = xmax - xmin;
          const height = ymax - ymin;
          const isHovered = activeId === comp.id;

          let strokeColor = '#10b981'; // green for ok
          let fillColor = 'rgba(16, 185, 129, 0.08)';
          let badgeBg = '#064e3b';
          let badgeTextColor = '#6ee7b7';
          let symbol = '✓';

          if (comp.status === 'error') {
            strokeColor = '#ef4444'; // red for error
            fillColor = 'rgba(239, 68, 68, 0.14)';
            badgeBg = '#7f1d1d';
            badgeTextColor = '#fca5a5';
            symbol = '✕';
          } else if (comp.status === 'warning') {
            strokeColor = '#f59e0b'; // amber
            fillColor = 'rgba(245, 158, 11, 0.12)';
            badgeBg = '#78350f';
            badgeTextColor = '#fcd34d';
            symbol = '⚠';
          } else if (comp.type === 'arduino_nano') {
            strokeColor = '#06b6d4'; // cyan
            fillColor = 'rgba(6, 182, 212, 0.08)';
            badgeBg = '#164e63';
            badgeTextColor = '#67e8f9';
            symbol = 'μC';
          }

          return (
            <g
              key={comp.id}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredId(comp.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectComponent(selectedComponentId === comp.id ? null : comp.id)}
            >
              {/* Sleek Box Outline */}
              <rect
                x={xmin}
                y={ymin}
                width={width}
                height={height}
                rx="6"
                fill={isHovered ? fillColor.replace('0.08', '0.22').replace('0.14', '0.28') : fillColor}
                stroke={strokeColor}
                strokeWidth={isHovered ? '3.5' : '2'}
                strokeDasharray={comp.status === 'error' ? '6 4' : undefined}
                className="transition-all duration-200"
                filter={isHovered ? (comp.status === 'error' ? 'url(#glowErr)' : 'url(#glowOk)') : undefined}
              />

              {/* Corner Crosshair Accents */}
              <path
                d={`M ${xmin} ${ymin + 10} L ${xmin} ${ymin} L ${xmin + 10} ${ymin}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
              <path
                d={`M ${xmax - 10} ${ymin} L ${xmax} ${ymin} L ${xmax} ${ymin + 10}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
              <path
                d={`M ${xmin} ${ymax - 10} L ${xmin} ${ymax} L ${xmin + 10} ${ymax}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
              <path
                d={`M ${xmax - 10} ${ymax} L ${xmax} ${ymax} L ${xmax - 10} ${ymax}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
              />

              {/* Minimal Pin Dot Badge */}
              <g transform={`translate(${xmin + 8}, ${ymin + 8})`}>
                <circle cx="0" cy="0" r="8" fill={badgeBg} stroke={strokeColor} strokeWidth="1.5" />
                <text
                  x="0"
                  y="3"
                  fill={badgeTextColor}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {symbol}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex flex-col space-y-2.5">
      {/* Top Toolbar: View Modes & Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md text-xs">
        {/* Mode Switcher (Clean 3 Modes) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('annotated')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === 'annotated'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="ภาพวิเคราะห์ AI พร้อมจุดมาร์กเกอร์"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ภาพวิเคราะห์ AI</span>
          </button>

          <button
            onClick={() => setViewMode('side_by_side')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === 'side_by_side'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="เปรียบเทียบภาพต้นฉบับกับภาพวิเคราะห์ข้างกัน"
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />
            <span>เปรียบเทียบซ้าย-ขวา</span>
          </button>

          <button
            onClick={() => setViewMode('original')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
              viewMode === 'original'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="ดูภาพต้นฉบับที่ถ่ายมาล้วนๆ"
          >
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>ภาพต้นฉบับ</span>
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
          <span className="px-1.5 text-[11px] font-mono text-cyan-400 min-w-[40px] text-center font-bold">
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

      {/* Main Viewport Container */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full min-h-[380px] max-h-[560px] bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 flex items-center justify-center p-2 select-none ${
          zoomLevel > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
        }`}
      >
        {/* MODE 1: SIDE-BY-SIDE (Split Screen 2 Columns) */}
        {viewMode === 'side_by_side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-full items-center justify-center">
            {/* Left Box: Original Image */}
            <div className="relative w-full flex flex-col items-center justify-center bg-slate-900/40 p-2 rounded-xl border border-slate-800">
              <div className="w-full flex justify-between items-center mb-1.5 px-1">
                <span className="text-[10px] font-bold text-slate-400">📷 ภาพต้นฉบับ (Original)</span>
              </div>
              <div className="relative inline-flex items-center justify-center max-w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Original Circuit"
                  className="block max-w-full max-h-[460px] w-auto h-auto object-contain rounded-lg pointer-events-none"
                  style={{
                    transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${panPos.y / zoomLevel}px)`,
                  }}
                />
              </div>
            </div>

            {/* Right Box: Inspected Image with AI Overlay */}
            <div className="relative w-full flex flex-col items-center justify-center bg-slate-900/40 p-2 rounded-xl border border-cyan-900/50">
              <div className="w-full flex justify-between items-center mb-1.5 px-1">
                <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  ภาพตรวจเช็ควงจร (AI Vision)
                </span>
              </div>
              <div
                className="relative inline-flex items-center justify-center max-w-full"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${panPos.y / zoomLevel}px)`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt="Inspected Circuit"
                  className="block max-w-full max-h-[460px] w-auto h-auto object-contain rounded-lg pointer-events-none"
                />
                {!isAnalyzing && renderSvgOverlay()}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2 & 3: ANNOTATED SINGLE VIEW OR ORIGINAL CLEAN VIEW */}
        {(viewMode === 'annotated' || viewMode === 'original') && (
          <div
            className="relative inline-flex items-center justify-center max-w-full transition-transform duration-75 ease-out"
            style={{
              transform: `scale(${zoomLevel}) translate(${panPos.x / zoomLevel}px, ${panPos.y / zoomLevel}px)`,
              transformOrigin: 'center center',
            }}
          >
            {/* Background Image (Tight-fitting block image) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Circuit View"
              className="block max-w-full max-h-[520px] w-auto h-auto object-contain rounded-xl pointer-events-none shadow-2xl"
              draggable={false}
            />

            {/* Analysis Scanline Animation */}
            {isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none z-20 rounded-xl overflow-hidden">
                <div className="hud-scanline" />
                <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                    <div className="absolute w-7 h-7 rounded-full bg-cyan-500/30 animate-ping" />
                  </div>
                  <div className="px-4 py-1 rounded-full bg-slate-900/90 border border-cyan-500/60 text-cyan-300 text-xs font-mono tracking-wider animate-pulse shadow-lg">
                    🔍 AI กำลังวิเคราะห์สายไฟและชิ้นส่วนวงจร...
                  </div>
                </div>
              </div>
            )}

            {/* SVG Overlay (Tightly mapped 1:1 on top of image pixels) */}
            {!isAnalyzing && viewMode === 'annotated' && renderSvgOverlay()}
          </div>
        )}

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

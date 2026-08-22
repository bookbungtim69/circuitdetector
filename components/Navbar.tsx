'use client';

import React from 'react';
import { Cpu, BookOpen, Key, Github, Sparkles, HelpCircle } from 'lucide-react';

interface NavbarProps {
  onOpenSchematic: () => void;
  onOpenSamples: () => void;
  onOpenApiKey: () => void;
  hasCustomApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSchematic,
  onOpenSamples,
  onOpenApiKey,
  hasCustomApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-900/40 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
            <Cpu className="w-6 h-6 animate-pulse text-cyan-200" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                CircuitDetector
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-700/50 rounded-md">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Arduino Nano + LED Circuit Inspection System
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Sample Gallery */}
          <button
            onClick={onOpenSamples}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 text-cyan-300 border border-cyan-800/60 hover:bg-cyan-950/70 hover:border-cyan-500 transition-all shadow-sm"
            title="ดูตัวอย่างการต่อวงจรแบบต่างๆ"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">ตัวอย่างทดสอบ</span>
            <span className="md:hidden">ตัวอย่าง</span>
          </button>

          {/* Circuit Reference Schematic */}
          <button
            onClick={onOpenSchematic}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all shadow-sm"
            title="แผนผังวงจรมาตรฐานและโค้ด Arduino"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">แผนผังวงจร</span>
            <span className="md:hidden">ผังวงจร</span>
          </button>

          {/* API Key Modal Button */}
          <button
            onClick={onOpenApiKey}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              hasCustomApiKey
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/70 hover:bg-emerald-900/60'
                : 'bg-slate-900/90 text-amber-300 border-amber-800/60 hover:bg-amber-950/60'
            }`}
            title="ตั้งค่า Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {hasCustomApiKey ? 'API Key: ใช้งานอยู่' : 'ตั้งค่า API Key'}
            </span>
            <span className="lg:hidden">API</span>
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com/bookbungtim69/circuitdetector.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800 transition-colors"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};

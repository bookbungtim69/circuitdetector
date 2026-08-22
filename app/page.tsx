'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/Navbar';
import { CameraView } from '@/components/CameraView';
import { CircuitCanvasOverlay } from '@/components/CircuitCanvasOverlay';
import { DiagnosticPanel } from '@/components/DiagnosticPanel';
import { CircuitSchematicModal } from '@/components/CircuitSchematicModal';
import { SampleGalleryModal } from '@/components/SampleGalleryModal';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { CircuitAnalysisResult } from '@/types/circuit';
import { SAMPLE_PRESETS } from '@/lib/circuitRules';
import { playSuccessSound, playErrorSound } from '@/lib/soundEffects';
import { Sparkles, HelpCircle, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CircuitAnalysisResult | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // Modals state
  const [isSchematicOpen, setIsSchematicOpen] = useState<boolean>(false);
  const [isSamplesOpen, setIsSamplesOpen] = useState<boolean>(false);
  const [isApiKeyOpen, setIsApiKeyOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('circuit_detector_gemini_key') || '';
      setCustomApiKey(stored);
    }
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCaptureImage = async (base64Image: string) => {
    setCurrentImage(base64Image);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setSelectedComponentId(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': customApiKey,
        },
        body: JSON.stringify({
          image: base64Image,
          apiKey: customApiKey,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const result: CircuitAnalysisResult = json.data;
        setAnalysisResult(result);

        if (result.status === 'CORRECT') {
          playSuccessSound();
          triggerConfetti();
        } else {
          playErrorSound();
        }
      } else {
        if (json.errorCode === 'GEMINI_API_KEY_REQUIRED') {
          setIsApiKeyOpen(true);
          setErrorMessage('กรุณาใส่ Gemini API Key ด้านล่างเพื่อให้ AI Vision เริ่มสแกนและตรวจสอบวงจรจริงของคุณ');
        } else {
          const errText = json.error || json.details || 'เกิดข้อผิดพลาดในการวิเคราะห์';
          setErrorMessage(errText);
        }
        playErrorSound();
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMessage(err?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      playErrorSound();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sampleKey: string) => {
    const sample = SAMPLE_PRESETS[sampleKey];
    if (!sample) return;

    setCurrentImage(sample.imageUrl);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setSelectedComponentId(null);

    setTimeout(() => {
      setAnalysisResult(sample.result);
      setIsAnalyzing(false);

      if (sample.result.status === 'CORRECT') {
        playSuccessSound();
        triggerConfetti();
      } else {
        playErrorSound();
      }
    }, 600);
  };

  const handleClear = () => {
    setCurrentImage(null);
    setAnalysisResult(null);
    setSelectedComponentId(null);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <Navbar
        onOpenSchematic={() => setIsSchematicOpen(true)}
        onOpenSamples={() => setIsSamplesOpen(true)}
        onOpenApiKey={() => setIsApiKeyOpen(true)}
        hasCustomApiKey={!!customApiKey}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Banner / Intro */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-blue-950/40 border border-cyan-800/40 backdrop-blur-md">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200">
              ระบบตรวจจับและตรวจสอบการต่อวงจร Arduino Nano + LED
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              วิเคราะห์สายไฟ, พิน D13/GND, ขั้วบวก/ลบ LED และตัวต้านทาน 220Ω ผ่านกล้องแบบอัจฉริยะ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSamplesOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900/80 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ทดสอบด้วยภาพตัวอย่าง</span>
            </button>
          </div>
        </div>

        {/* Error Alert Message if any */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">เกิดข้อผิดพลาด:</span>
              <p>{errorMessage}</p>
              <p className="text-[11px] text-red-300/80">
                หากใช้การสแกนด้วยกล้องจริง แนะนำให้ตรวจสอบว่าได้ตั้งค่า Gemini API Key ถูกต้อง และรูปภาพมีแสงสว่างเพียงพอ
              </p>
            </div>
          </div>
        )}

        {/* Core Layout: Left Side (Camera / Visual Canvas) & Right Side (Diagnostic Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Camera / Canvas (7 cols on LG) */}
          <div className="lg:col-span-7 space-y-4">
            {currentImage ? (
              <div className="space-y-3">
                <CircuitCanvasOverlay
                  imageSrc={currentImage}
                  detectedComponents={analysisResult?.detectedComponents || []}
                  isAnalyzing={isAnalyzing}
                  selectedComponentId={selectedComponentId}
                  onSelectComponent={setSelectedComponentId}
                />

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
                  <span>💡 เลื่อนเมาส์หรือแตะที่กรอบสีบนภาพ เพื่อดูรายละเอียดชิ้นส่วน</span>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>เริ่มตรวจใหม่</span>
                  </button>
                </div>
              </div>
            ) : (
              <CameraView
                onCaptureImage={handleCaptureImage}
                isAnalyzing={isAnalyzing}
                onClear={handleClear}
                currentImage={currentImage}
              />
            )}
          </div>

          {/* Right Column: Diagnostic & Inspection Panel (5 cols on LG) */}
          <div className="lg:col-span-5">
            <DiagnosticPanel
              result={analysisResult}
              selectedComponentId={selectedComponentId}
              onSelectComponent={setSelectedComponentId}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950/90 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Arduino Nano + LED Circuit Detector &bull; AI Powered Inspection</span>
          <span>Deployable on Vercel &bull; GitHub Repository Ready</span>
        </div>
      </footer>

      {/* Modals */}
      <CircuitSchematicModal
        isOpen={isSchematicOpen}
        onClose={() => setIsSchematicOpen(false)}
      />

      <SampleGalleryModal
        isOpen={isSamplesOpen}
        onClose={() => setIsSamplesOpen(false)}
        onSelectSample={handleSelectSample}
      />

      <ApiKeyModal
        isOpen={isApiKeyOpen}
        onClose={() => setIsApiKeyOpen(false)}
        onApiKeySaved={(key) => setCustomApiKey(key)}
      />
    </div>
  );
}

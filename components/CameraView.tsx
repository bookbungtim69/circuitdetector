'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Upload,
  Zap,
  ZapOff,
  SwitchCamera,
  Crosshair,
  AlertCircle,
  Sparkles,
  Video,
  CheckCircle2,
} from 'lucide-react';
import { playScanSound } from '@/lib/soundEffects';

interface CameraViewProps {
  onCaptureImage: (base64Image: string) => void;
  isAnalyzing: boolean;
  onClear: () => void;
  currentImage: string | null;
}

interface VideoDevice {
  deviceId: string;
  label: string;
}

export const CameraView: React.FC<CameraViewProps> = ({
  onCaptureImage,
  isAnalyzing,
  onClear,
  currentImage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [devices, setDevices] = useState<VideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setIsTorchOn(false);
    setHasTorch(false);
  }, [stream]);

  // Enumerate video devices
  const updateDeviceList = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `กล้องตัวที่ ${index + 1}`,
        }));
      setDevices(videoDevs);

      // If there's a Canon or external camera detected, auto-select it!
      const canonCam = videoDevs.find(
        (d) =>
          d.label.toLowerCase().includes('canon') ||
          d.label.toLowerCase().includes('r50') ||
          d.label.toLowerCase().includes('eos')
      );
      if (canonCam && !selectedDeviceId) {
        setSelectedDeviceId(canonCam.deviceId);
      }
    } catch (e) {
      console.warn('Enumerate devices error:', e);
    }
  }, [selectedDeviceId]);

  // Start camera stream
  const startCamera = useCallback(async (deviceIdToUse?: string) => {
    stopCamera();
    setCameraError(null);

    const devId = deviceIdToUse || selectedDeviceId;

    try {
      const constraints: MediaStreamConstraints = {
        video: devId
          ? {
              deviceId: { exact: devId },
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
            }
          : {
              facingMode: { ideal: facingMode },
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
            },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      // Check flashlight support
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? (track.getCapabilities() as any) : {};
      if (capabilities && capabilities.torch) {
        setHasTorch(true);
      }

      // Update devices labels after permission granted
      updateDeviceList();
    } catch (err: any) {
      console.error('Camera access error:', err);
      let message = 'ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตสิทธิ์การเข้าถึงกล้องในเบราว์เซอร์';
      if (err.name === 'NotAllowedError') {
        message = 'การเข้าถึงกล้องถูกปฏิเสธ (Permission Denied) กรุณาอนุญาตสิทธิ์ใช้งานกล้องในเบราว์เซอร์';
      } else if (err.name === 'NotFoundError') {
        message = 'ไม่พบอุปกรณ์กล้อง หรือกล้องถูกโปรแกรมอื่นใช้งานอยู่';
      } else if (err.name === 'OverconstrainedError') {
        // Fallback to basic constraints if resolution too high
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(fallbackStream);
          setIsCameraActive(true);
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            await videoRef.current.play();
          }
          updateDeviceList();
          return;
        } catch (e) {
          message = 'ไม่สามารถเปิดกล้องด้วยความละเอียดที่กำหนดได้';
        }
      }
      setCameraError(message);
      setIsCameraActive(false);
    }
  }, [facingMode, selectedDeviceId, stopCamera, updateDeviceList]);

  // Switch facing mode (Front / Back)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    if (isCameraActive && !currentImage) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Handle camera device selection
  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    if (isCameraActive) {
      startCamera(newDeviceId);
    }
  };

  // Toggle Torch
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({
        advanced: [{ torch: !isTorchOn }],
      });
      setIsTorchOn(!isTorchOn);
    } catch (e) {
      console.error('Torch error', e);
    }
  };

  // Capture current video frame
  const captureFrame = () => {
    if (!videoRef.current) return;
    playScanSound();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.95);

    stopCamera();
    onCaptureImage(base64);
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, WEBP)');
      return;
    }
    playScanSound();
    stopCamera();
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onCaptureImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const selectedDeviceObj = devices.find((d) => d.deviceId === selectedDeviceId);
  const isCanon = selectedDeviceObj?.label.toLowerCase().includes('canon') || 
                  selectedDeviceObj?.label.toLowerCase().includes('r50') ||
                  selectedDeviceObj?.label.toLowerCase().includes('eos');

  return (
    <div className="relative flex flex-col items-center w-full bg-slate-900/90 rounded-2xl border border-cyan-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Main View Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[500px] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden border-2 transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-800'
        }`}
      >
        {/* Active Live Video Stream */}
        {isCameraActive && !currentImage && (
          <>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover"
            />

            {/* AR Alignment Guide HUD */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
              {/* Top status tag & Camera label */}
              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/60 text-cyan-400 text-xs font-mono backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>LIVE FEED</span>
                  {isCanon && (
                    <span className="ml-1 px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded text-[10px] font-bold">
                      Canon EOS R50 (4K/HD)
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-cyan-300/90 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 backdrop-blur-sm truncate max-w-[200px]">
                  📷 {selectedDeviceObj?.label || (facingMode === 'environment' ? 'กล้องหลัง' : 'กล้องหน้า')}
                </div>
              </div>

              {/* Target Bounding Frame for Circuit & Breadboard */}
              <div className="relative mx-auto w-4/5 h-3/5 border-2 border-dashed border-cyan-400/60 rounded-2xl flex items-center justify-center">
                <Crosshair className="w-10 h-10 text-cyan-400/40 animate-pulse" />
                <div className="absolute top-2 left-3 text-[11px] font-semibold text-cyan-300/90 bg-slate-950/70 px-2 py-0.5 rounded">
                  วาง Arduino Nano + Breadboard ในกรอบนี้
                </div>

                {/* Subzone hints */}
                <div className="absolute bottom-2 right-3 text-[10px] text-slate-300/80 bg-slate-950/70 px-2 py-0.5 rounded">
                  💡 ให้เห็นหัวพิน D13 / GND และขั้ว LED ชัดเจน
                </div>
              </div>

              {/* Bottom hint */}
              <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300">
                  กดปุ่ม &ldquo;จับภาพ & วิเคราะห์วงจร&rdquo; ด้านล่างเมื่อจัดมุมกล้องเรียบร้อย
                </span>
              </div>
            </div>
          </>
        )}

        {/* When Camera is OFF and No Image is Selected */}
        {!isCameraActive && !currentImage && (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-700/60 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/50">
              <Camera className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-slate-100">
                สตรีมภาพจากกล้อง Canon R50 หรือ Webcam
              </h3>
              <p className="text-xs text-slate-400">
                รองรับการตรวจจับผ่านกล้อง Canon EOS R50 (Type-C UVC), เว็บบอร์ด และสมาร์ตโฟน
              </p>
            </div>

            {cameraError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-300 text-xs text-left max-w-md">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{cameraError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startCamera()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4 text-slate-950" />
                <span>เปิดกล้องสด (Live Camera)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 text-xs font-semibold transition-all"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>อัปโหลดรูปภาพ</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons & Device Selector Bar */}
      <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Side: Camera Selector Dropdown / Switch Camera */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {devices.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <Video className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
              >
                <option value="" className="bg-slate-900 text-slate-200">
                  เลือกอุปกรณ์กล้อง...
                </option>
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-slate-900 text-slate-200">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isCameraActive && (
            <>
              {devices.length <= 1 && (
                <button
                  onClick={toggleFacingMode}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500 text-xs text-slate-200 transition-colors"
                  title="สลับกล้องหน้า/กล้องหลัง"
                >
                  <SwitchCamera className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">สลับกล้อง</span>
                </button>
              )}

              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition-colors ${
                    isTorchOn
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                  title="เปิด/ปิดไฟแฟลช"
                >
                  {isTorchOn ? (
                    <>
                      <Zap className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="hidden sm:inline">ปิดไฟฉาย</span>
                    </>
                  ) : (
                    <>
                      <ZapOff className="w-4 h-4 text-slate-400" />
                      <span className="hidden sm:inline">เปิดไฟฉาย</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {currentImage && (
            <button
              onClick={() => {
                onClear();
                startCamera();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-500 text-xs text-cyan-300 transition-colors"
              title="ถ่ายใหม่ หรือเลือกรูปใหม่"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>ถ่ายใหม่ / สแกนใหม่</span>
            </button>
          )}
        </div>

        {/* Right Side: Primary Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {isCameraActive && !currentImage && (
            <button
              onClick={captureFrame}
              disabled={isAnalyzing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Crosshair className="w-4 h-4 text-slate-950" />
              <span>จับภาพ & ตรวจสอบวงจร (Capture)</span>
            </button>
          )}

          {!isCameraActive && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 text-xs text-slate-300 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>เปลี่ยนรูปภาพ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

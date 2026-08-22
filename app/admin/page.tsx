'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Cpu,
  ArrowLeft,
  Settings,
  Database,
  Trash2,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  LogOut,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';
import {
  verifyAdminPin,
  isAdminAuthenticated,
  setAdminSession,
  getAdminSettings,
  saveAdminSettings,
  getInspectionHistory,
  deleteInspectionRecord,
  clearAllInspectionHistory,
  getDashboardStats,
  exportHistoryToCsv,
} from '@/lib/historyStorage';
import { InspectionRecord, AdminSettings, DashboardStats } from '@/types/admin';
import { CircuitCanvasOverlay } from '@/components/CircuitCanvasOverlay';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Admin tabs
  const [activeTab, setActiveTab] = useState<'history' | 'settings'>('history');

  // History state
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);

  // Settings state
  const [settings, setSettings] = useState<AdminSettings>({
    geminiApiKey: '',
    defaultModel: 'gemini-1.5-pro',
    inspectionStrictness: 'high',
    autoSaveHistory: true,
    maxStoredRecords: 100,
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ loading: boolean; success?: boolean; message?: string } | null>(null);

  // Load auth & data on mount
  useEffect(() => {
    const auth = isAdminAuthenticated();
    setIsAuthenticated(auth);
    if (auth) {
      loadData();
    }
  }, []);

  const loadData = () => {
    setRecords(getInspectionHistory());
    setSettings(getAdminSettings());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setAdminSession(true);
      setIsAuthenticated(true);
      setPinError(null);
      setPinInput('');
      loadData();
    } else {
      setPinError('รหัสผ่านไม่ถูกต้อง (PIN ผิด) กรุณาลองใหม่อีกครั้ง');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setAdminSession(false);
    setIsAuthenticated(false);
    setSelectedRecord(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveAdminSettings(settings);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestApiKey = async () => {
    if (!settings.geminiApiKey.trim()) {
      setTestResult({ loading: false, success: false, message: 'กรุณากรอก API Key ก่อนทดสอบ' });
      return;
    }

    setTestResult({ loading: true });
    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${settings.geminiApiKey.trim()}`
      );
      if (resp.ok) {
        const data = await resp.json();
        const modelsCount = data.models?.length || 0;
        setTestResult({
          loading: false,
          success: true,
          message: `เชื่อมต่อสำเร็จ! พบโมเดลที่ใช้งานได้ทั้งหมด ${modelsCount} โมเดล (พร้อมใช้งาน Gemini Pro)`,
        });
      } else {
        const errText = await resp.text();
        setTestResult({
          loading: false,
          success: false,
          message: `API Key ไม่ถูกต้อง (${resp.status}): ${errText.slice(0, 100)}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        loading: false,
        success: false,
        message: `ไม่สามารถเชื่อมต่อได้: ${err?.message || 'Network error'}`,
      });
    }
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('ต้องการลบประวัติการตรวจรายการนี้ใช่หรือไม่?')) {
      deleteInspectionRecord(id);
      loadData();
      if (selectedRecord?.id === id) setSelectedRecord(null);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างประวัติการตรวจทั้งหมด? ข้อมูลจะไม่สามารถกู้คืนได้')) {
      clearAllInspectionHistory();
      loadData();
      setSelectedRecord(null);
    }
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.result.status === statusFilter;
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.result.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(r.timestamp).toLocaleString('th-TH').includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const stats: DashboardStats = getDashboardStats(records);

  // 1. PIN Security Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen circuit-grid-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/95 border border-cyan-800/80 rounded-3xl p-8 shadow-2xl shadow-cyan-950/80 backdrop-blur-xl space-y-6">
          {/* Lock Icon Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/50 shadow-lg shadow-cyan-500/20 text-cyan-400">
              <Lock className="w-8 h-8 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-100">
                ระบบจัดการหลังบ้าน (Admin Portal)
              </h1>
              <p className="text-xs text-slate-400">
                ตั้งค่า Gemini API Key และตรวจสอบประวัติการวิเคราะห์วงจร
              </p>
            </div>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 text-center">
                กรุณาใส่รหัสผ่านความปลอดภัย (PIN)
              </label>
              <div className="relative flex items-center justify-center">
                <input
                  type="password"
                  maxLength={8}
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-48 text-center text-2xl tracking-[0.6em] font-mono py-3 rounded-2xl bg-slate-950 border-2 border-cyan-800/80 text-cyan-300 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                รหัสผ่านเริ่มต้นสำหรับเข้าสู่ระบบคือ: <span className="font-mono text-cyan-400 font-bold">0000</span>
              </p>
            </div>

            {pinError && (
              <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{pinError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>กลับหน้าหลัก</span>
              </Link>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/30 transition-all transform hover:scale-105 active:scale-95"
              >
                <KeyRound className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Admin Dashboard View
  return (
    <div className="min-h-screen circuit-grid-bg text-slate-100 flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-cyan-900/50 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-white transition-colors"
              title="กลับสู่หน้าบ้าน (หน้าตรวจวงจร)"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold hidden sm:inline">หน้าบ้าน (ตรวจวงจร)</span>
            </Link>

            <div className="h-6 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-700/60 text-cyan-400">
                <ShieldCheck className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-100">ระบบหลังบ้าน</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">
                    Admin Portal
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 hidden sm:block">
                  PIN 0000 Authorized Session
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tab Switches */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'history'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>ประวัติการตรวจ ({records.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>ตั้งค่า API Key</span>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800 text-xs font-semibold transition-colors"
              title="ออกจากระบบหลังบ้าน"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออก</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: INSPECTION HISTORY & STATS */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Analytics Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
                <div className="flex justify-between items-center text-slate-400 text-xs mb-1">
                  <span>สแกนทั้งหมด</span>
                  <Database className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                  {stats.totalScans}
                </div>
                <span className="text-[11px] text-slate-500">ครั้งที่ตรวจสอบ</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/50 shadow-lg">
                <div className="flex justify-between items-center text-emerald-400 text-xs mb-1">
                  <span>วงจรต่อถูกต้อง (PASS)</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">
                  {stats.passCount}
                </div>
                <span className="text-[11px] text-slate-500">
                  {stats.totalScans > 0 ? `${Math.round((stats.passCount / stats.totalScans) * 100)}% Pass Rate` : '-'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-900/50 shadow-lg">
                <div className="flex justify-between items-center text-red-400 text-xs mb-1">
                  <span>พบข้อผิดพลาด (FAIL)</span>
                  <XCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-red-300">
                  {stats.failCount}
                </div>
                <span className="text-[11px] text-slate-500">จุดต่อผิด/ขาดวงจร</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-900/50 shadow-lg">
                <div className="flex justify-between items-center text-amber-400 text-xs mb-1">
                  <span>คำเตือน (WARNING)</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                  {stats.warningCount}
                </div>
                <span className="text-[11px] text-slate-500">ความแม่นยำเฉลี่ย {stats.averageScore}%</span>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาตามข้อความสรุป, รหัสสแกน..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">ทุกสถานะ (All)</option>
                  <option value="CORRECT">เฉพาะ PASS (ถูกต้อง)</option>
                  <option value="INCORRECT">เฉพาะ FAIL (ต่อผิด)</option>
                  <option value="WARNING">เฉพาะ WARNING (เตือน)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportHistoryToCsv(records)}
                  disabled={records.length === 0}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 disabled:opacity-40 text-xs font-semibold transition-colors"
                  title="ส่งออกประวัติเป็นไฟล์ CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ส่งออก CSV</span>
                </button>

                <button
                  onClick={handleClearAllHistory}
                  disabled={records.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 hover:border-red-800 disabled:opacity-40 text-xs font-semibold transition-colors"
                  title="ล้างประวัติทั้งหมด"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ล้างประวัติ</span>
                </button>
              </div>
            </div>

            {/* History Table */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <Database className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-sm font-semibold">ยังไม่มีประวัติการสแกนวงจร</p>
                  <p className="text-xs">เมื่อมีการตรวจจับวงจรที่หน้าบ้าน ข้อมูลจะถูกบันทึกมาที่นี่โดยอัตโนมัติ</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4 font-semibold">ภาพถ่าย</th>
                        <th className="py-3.5 px-4 font-semibold">วัน-เวลา</th>
                        <th className="py-3.5 px-4 font-semibold">สถานะวงจร</th>
                        <th className="py-3.5 px-4 font-semibold">คะแนน</th>
                        <th className="py-3.5 px-4 font-semibold">สรุปผลการวิเคราะห์</th>
                        <th className="py-3.5 px-4 font-semibold text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredRecords.map((r) => {
                        const isPass = r.result.status === 'CORRECT';
                        const isFail = r.result.status === 'INCORRECT';
                        return (
                          <tr
                            key={r.id}
                            onClick={() => setSelectedRecord(r)}
                            className="hover:bg-slate-950/60 cursor-pointer transition-colors"
                          >
                            <td className="py-3 px-4">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={r.imageThumbnail}
                                alt="Thumbnail"
                                className="w-14 h-10 object-cover rounded-lg border border-slate-700"
                              />
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                              {new Date(r.timestamp).toLocaleString('th-TH')}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  isPass
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                    : isFail
                                    ? 'bg-red-950 text-red-300 border-red-700'
                                    : 'bg-amber-950 text-amber-300 border-amber-700'
                                }`}
                              >
                                {isPass ? <CheckCircle2 className="w-3 h-3" /> : isFail ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                {r.result.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-200 whitespace-nowrap">
                              {r.result.score}%
                            </td>
                            <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                              {r.result.summary}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedRecord(r)}
                                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-cyan-950 text-cyan-400 border border-slate-800 hover:border-cyan-700 transition-colors"
                                  title="ดูรายละเอียดผลตรวจ"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteRecord(r.id, e)}
                                  className="p-1.5 rounded-lg bg-slate-950 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-800 transition-colors"
                                  title="ลบรายการนี้"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM & GEMINI API KEY SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-800/60 shadow-xl backdrop-blur-md space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
                <div className="p-3 rounded-2xl bg-cyan-950 border border-cyan-700/60 text-cyan-400">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100">
                    การตั้งค่าระบบ & Gemini API Key
                  </h2>
                  <p className="text-xs text-slate-400">
                    กำหนดคีย์ API สำหรับการประมวลผล AI และเลือกโมเดลที่ต้องการ
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* API Key Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-200">
                      Google Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      รับ API Key ฟรี <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={settings.geminiApiKey}
                      onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono pr-20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      {showApiKey ? 'ซ่อน' : 'แสดง'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    🔒 API Key นี้จะถูกใช้ประมวลผลในระบบหน้าบ้านโดยที่ผู้ใช้ทั่วไปไม่เห็นรหัสคีย์
                  </p>
                </div>

                {/* Model Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-200">
                    โมเดล AI Vision เริ่มต้น (Default Model)
                  </label>
                  <select
                    value={settings.defaultModel}
                    onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (แนะนำสำหรับ Deep Circuit Reasoning)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (ความแม่นยำสูงสุด)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (ความเร็วสูง)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (สมดุลความเร็ว)</option>
                  </select>
                </div>

                {/* History settings */}
                <div className="space-y-3 p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">บันทึกประวัติการสแกนอัตโนมัติ</span>
                      <span className="text-[11px] text-slate-400">จัดเก็บภาพและผลตรวจลงในระบบหลังบ้าน</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoSaveHistory}
                      onChange={(e) => setSettings({ ...settings, autoSaveHistory: e.target.checked })}
                      className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Test Connection Button & Status */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleTestApiKey}
                    disabled={testResult?.loading}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-cyan-700/60 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testResult?.loading ? 'animate-spin' : ''}`} />
                    <span>{testResult?.loading ? 'กำลังทดสอบการเชื่อมต่อ...' : 'ทดสอบการเชื่อมต่อ API Key'}</span>
                  </button>

                  {testResult && !testResult.loading && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                        testResult.success
                          ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300'
                          : 'bg-red-950/70 border-red-700 text-red-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>

                {saveSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-300 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>บันทึกการตั้งค่าเรียบร้อยแล้ว! ระบบหน้าบ้านจะใช้งานการตั้งค่านี้ทันที</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all"
                  >
                    บันทึกการตั้งค่า
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* DETAIL MODAL FOR A SELECTED INSPECTION RECORD */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 my-8 space-y-5">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
              <span
                className={`px-3 py-1 text-xs font-extrabold rounded-full border ${
                  selectedRecord.result.status === 'CORRECT'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : selectedRecord.result.status === 'INCORRECT'
                    ? 'bg-red-950 text-red-300 border-red-700'
                    : 'bg-amber-950 text-amber-300 border-amber-700'
                }`}
              >
                {selectedRecord.result.status} ({selectedRecord.result.score}%)
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  รายละเอียดผลการตรวจ: {selectedRecord.id}
                </h3>
                <p className="text-xs text-slate-400">
                  {new Date(selectedRecord.timestamp).toLocaleString('th-TH')}
                </p>
              </div>
            </div>

            {/* Visual Canvas Overlay Preview */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
              <CircuitCanvasOverlay
                imageSrc={selectedRecord.fullImage}
                detectedComponents={selectedRecord.result.detectedComponents}
                isAnalyzing={false}
                selectedComponentId={null}
                onSelectComponent={() => {}}
              />
            </div>

            {/* Summary & Checklist */}
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200">
                <span className="font-bold text-cyan-400 block mb-1">สรุปผลการวิเคราะห์:</span>
                <p>{selectedRecord.result.summary}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedRecord.result.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start gap-2"
                  >
                    {item.status === 'pass' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : item.status === 'fail' ? (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-200">{item.title}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

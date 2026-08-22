import { InspectionRecord, AdminSettings, DashboardStats } from '@/types/admin';
import { CircuitAnalysisResult } from '@/types/circuit';

const STORAGE_KEYS = {
  HISTORY: 'circuit_detector_inspection_history_v1',
  SETTINGS: 'circuit_detector_admin_settings_v1',
  AUTH_TOKEN: 'circuit_detector_admin_session_token',
};

const DEFAULT_SETTINGS: AdminSettings = {
  geminiApiKey: '',
  defaultModel: 'gemini-1.5-pro',
  inspectionStrictness: 'high',
  autoSaveHistory: true,
  maxStoredRecords: 100,
};

// Admin PIN Authentication ("0000")
export function verifyAdminPin(pin: string): boolean {
  return pin.trim() === '0000';
}

export function setAdminSession(isAuthenticated: boolean) {
  if (typeof window === 'undefined') return;
  if (isAuthenticated) {
    sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'authenticated_admin_0000');
  } else {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) === 'authenticated_admin_0000';
}

// Admin Settings
export function getAdminSettings(): AdminSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      // Legacy key fallback
      const oldKey = localStorage.getItem('circuit_detector_gemini_key') || '';
      return { ...DEFAULT_SETTINGS, geminiApiKey: oldKey };
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load admin settings', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = getAdminSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    // Keep sync with legacy key if apiKey changed
    if (settings.geminiApiKey !== undefined) {
      localStorage.setItem('circuit_detector_gemini_key', settings.geminiApiKey);
    }
    return updated;
  } catch (e) {
    console.error('Failed to save admin settings', e);
    return DEFAULT_SETTINGS;
  }
}

// History Records
export function getInspectionHistory(): InspectionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const list: InspectionRecord[] = JSON.parse(raw);
    return list.sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error('Failed to load inspection history', e);
    return [];
  }
}

export function saveInspectionRecord(
  image: string,
  result: CircuitAnalysisResult,
  deviceInfo?: string
): InspectionRecord | null {
  if (typeof window === 'undefined') return null;
  const settings = getAdminSettings();
  if (!settings.autoSaveHistory) return null;

  try {
    const history = getInspectionHistory();
    const newRecord: InspectionRecord = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      imageThumbnail: image, // Store image
      fullImage: image,
      result,
      deviceInfo: deviceInfo || navigator.userAgent.slice(0, 40),
    };

    const updated = [newRecord, ...history].slice(0, settings.maxStoredRecords || 100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return newRecord;
  } catch (e) {
    console.error('Failed to save inspection record', e);
    return null;
  }
}

export function deleteInspectionRecord(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const history = getInspectionHistory();
    const updated = history.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Failed to delete inspection record', e);
    return false;
  }
}

export function clearAllInspectionHistory(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (e) {
    console.error('Failed to clear inspection history', e);
    return false;
  }
}

export function getDashboardStats(records: InspectionRecord[]): DashboardStats {
  const total = records.length;
  if (total === 0) {
    return {
      totalScans: 0,
      passCount: 0,
      failCount: 0,
      warningCount: 0,
      averageScore: 0,
    };
  }

  let pass = 0;
  let fail = 0;
  let warn = 0;
  let totalScore = 0;

  for (const r of records) {
    if (r.result.status === 'CORRECT') pass++;
    else if (r.result.status === 'INCORRECT') fail++;
    else if (r.result.status === 'WARNING') warn++;
    totalScore += r.result.score || 0;
  }

  return {
    totalScans: total,
    passCount: pass,
    failCount: fail,
    warningCount: warn,
    averageScore: Math.round(totalScore / total),
  };
}

// Export History to CSV
export function exportHistoryToCsv(records: InspectionRecord[]): void {
  if (records.length === 0) return;

  const headers = ['ID', 'Timestamp', 'Date', 'Status', 'Score', 'Summary', 'Signal_Pin', 'GND_Pin', 'Resistor_Present', 'LED_Polarity'];
  const rows = records.map((r) => [
    `"${r.id}"`,
    r.timestamp,
    `"${new Date(r.timestamp).toLocaleString('th-TH')}"`,
    `"${r.result.status}"`,
    r.result.score,
    `"${r.result.summary.replace(/"/g, '""')}"`,
    `"${r.result.schematicFeedback?.signalPin || '-'}"`,
    `"${r.result.schematicFeedback?.gndPin || '-'}"`,
    r.result.schematicFeedback?.hasResistor ? 'Yes' : 'No',
    r.result.schematicFeedback?.ledPolarityCorrect ? 'Correct' : 'Reversed',
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `circuit-inspection-history-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

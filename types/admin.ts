import { CircuitAnalysisResult } from './circuit';

export interface InspectionRecord {
  id: string;
  timestamp: number;
  imageThumbnail: string; // Base64 or URL
  fullImage: string;
  result: CircuitAnalysisResult;
  deviceInfo?: string;
}

export interface AdminSettings {
  geminiApiKey: string;
  defaultModel: 'gemini-1.5-pro' | 'gemini-2.5-pro' | 'gemini-1.5-flash' | 'gemini-2.0-flash';
  inspectionStrictness: 'high' | 'standard';
  autoSaveHistory: boolean;
  maxStoredRecords: number;
}

export interface DashboardStats {
  totalScans: number;
  passCount: number;
  failCount: number;
  warningCount: number;
  averageScore: number;
}

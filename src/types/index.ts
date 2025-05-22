export interface Patient {
  id?: string;
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  medicalHistory: string;
  photoUrl?: string;
  audioUrl?: string;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContact {
  id?: string;
  name: string;
  relationship: string;
  phoneNumber: string;
}

export interface StrokeDetectionResult {
  detectionType: 'balance' | 'eye' | 'speech';
  result: 'normal' | 'abnormal' | 'inconclusive';
  timestamp: Date;
  details?: string;
  sensorData?: {
    accelerometer?: number[];
    gyroscope?: number[];
    magnetometer?: number[];
    abnormalReadingsPercentage?: number;
    variability?: {
      acceleration?: number;
      rotation?: number;
      magnetic?: number;
    };
    rawData?: Array<{
      timestamp: number;
      acceleration: { x: number; y: number; z: number; magnitude: number };
      orientation: { alpha: number | null; beta: number | null; gamma: number | null; magnitude: number };
    }>;
    // Add connectionStatus to track if device sensors are connected properly
    connectionStatus?: 'connected' | 'disconnected' | 'error';
  };
}

export interface CombinedAnalysisResult {
  balance?: StrokeDetectionResult;
  eye?: StrokeDetectionResult;
  speech?: StrokeDetectionResult;
  overallResult: 'normal' | 'abnormal' | 'inconclusive';
  riskLevel: 'low' | 'moderate' | 'high';
  timestamp: Date;
  recommendations: string[];
}

// Add a new interface to track app status
export interface AppStatus {
  online: boolean;
  sensorsAvailable: boolean;
  lastSync: Date | null;
  version: string;
  errorLogs: Array<{
    timestamp: Date;
    message: string;
    code?: string;
  }>;
}

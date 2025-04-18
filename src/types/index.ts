
export interface Patient {
  id?: string;
  name: string;
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
}

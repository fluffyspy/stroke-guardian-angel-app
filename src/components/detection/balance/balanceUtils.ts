import { StrokeDetectionResult } from "@/types";
import { detectionAPI, SensorData } from "@/services/apiService";

// Define constants for thresholds and test duration
export const TEST_DURATION = 15; // Test duration in seconds
export const ACCELERATION_THRESHOLD = 2.0; // Threshold for acceleration changes
export const ROTATION_THRESHOLD = 10.0; // Threshold for rotation changes
export const GYROSCOPE_THRESHOLD = 5.0; // Threshold for gyroscope changes

// Define interfaces for sensor data
export interface SensorReading {
  timestamp: number;
  acceleration: { x: number; y: number; z: number; magnitude: number };
  orientation: { alpha: number | null; beta: number | null; gamma: number | null; magnitude: number };
  gyroscope?: { x: number; y: number; z: number; magnitude: number };
  magnetometer?: { x: number; y: number; z: number; magnitude: number };
}

export interface MotionData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface GaitAnalysisResult {
  accelerationChange: number;
  angularTilt: number;
  overallScore: number;
  isAbnormal: boolean;
}

// Helper function to create and download CSV file
export const createAndDownloadCSV = (data: SensorReading[]): string => {
  const csvRows = [];
  const headers = Object.keys(data[0].acceleration).join(',');
  csvRows.push(`Timestamp,Acceleration,${headers},Orientation,Gyroscope,Magnetometer`);

  for (const row of data) {
    const timestamp = row.timestamp;
    const acceleration = Object.values(row.acceleration).join(',');
    const orientation = Object.values(row.orientation).join(',');
    const gyroscope = row.gyroscope ? Object.values(row.gyroscope).join(',') : '';
    const magnetometer = row.magnetometer ? Object.values(row.magnetometer).join(',') : '';
    csvRows.push(`${timestamp},${acceleration},${orientation},${gyroscope},${magnetometer}`);
  }

  return csvRows.join('\n');
};

export const analyzeGaitPattern = (accelData: MotionData[], gyroData: MotionData[]): GaitAnalysisResult => {
  if (accelData.length < 10) {
    console.log('Insufficient acceleration data');
    return { 
      accelerationChange: 0, 
      angularTilt: 0, 
      overallScore: 0, 
      isAbnormal: true 
    };
  }

  // Calculate acceleration change using the research formula
  let totalAccelChange = 0;
  for (let i = 1; i < accelData.length; i++) {
    const dx = accelData[i].x - accelData[i-1].x;
    const dy = accelData[i].y - accelData[i-1].y;
    const change = Math.sqrt(dx * dx + dy * dy);
    totalAccelChange += change;
  }
  const accelerationChange = totalAccelChange / (accelData.length - 1);

  // Calculate angular tilt using the research formula
  let totalAngularTilt = 0;
  if (gyroData.length > 0) {
    const samplingRate = 50; // 50 Hz
    for (const gyroPoint of gyroData) {
      const ax = Math.abs(gyroPoint.x) / samplingRate * (180 / Math.PI);
      const ay = Math.abs(gyroPoint.y) / samplingRate * (180 / Math.PI);
      const az = Math.abs(gyroPoint.z) / samplingRate * (180 / Math.PI);
      totalAngularTilt += ax + ay + az;
    }
  }
  const angularTilt = totalAngularTilt;

  // Calculate overall score
  const overallScore = accelerationChange * 0.6 + angularTilt * 0.4;

  console.log('Analysis:', {
    accelerationChange,
    angularTilt,
    overallScore,
    accelDataLength: accelData.length,
    gyroDataLength: gyroData.length
  });

  // Determine if abnormal (adjusted thresholds for walking test)
  const isAbnormal = accelerationChange > 3.0 || angularTilt > 15.0 || overallScore > 12.0;

  return {
    accelerationChange,
    angularTilt,
    overallScore,
    isAbnormal
  };
};

export const analyzeBalanceData = async (
  accelerometerData: MotionData[],
  gyroscopeData: MotionData[]
): Promise<StrokeDetectionResult> => {
  console.log("Starting balance analysis with:", {
    accelerometerData: accelerometerData.length,
    gyroscopeData: gyroscopeData.length
  });

  const userId = localStorage.getItem("userId");
  
  // First try backend analysis if user is logged in
  if (userId && accelerometerData.length > 0) {
    try {
      const sensorData: SensorData = {
        user_id: userId,
        accel: accelerometerData.map(reading => [reading.x, reading.y, reading.z]),
        gyro: gyroscopeData.map(reading => [reading.x, reading.y, reading.z])
      };

      console.log("Sending sensor data to backend for analysis...");
      
      const backendResult = await detectionAPI.analyzeBalance(sensorData);
      
      console.log("Backend analysis result:", backendResult);
      
      if (backendResult && backendResult.result) {
        return {
          detectionType: 'balance',
          result: backendResult.result,
          timestamp: new Date(),
          details: backendResult.details || "Analysis completed using backend AI model.",
          sensorData: {
            accelerometer: accelerometerData.map(d => d.x),
            gyroscope: gyroscopeData.map(d => d.x),
            connectionStatus: 'connected'
          }
        };
      }
    } catch (error) {
      console.error("Backend analysis failed, falling back to local analysis:", error);
    }
  }

  // Fallback to local gait analysis
  const gaitResult = analyzeGaitPattern(accelerometerData, gyroscopeData);
  
  return {
    detectionType: 'balance',
    result: gaitResult.isAbnormal ? 'abnormal' : 'normal',
    timestamp: new Date(),
    details: `Gait Analysis - Acceleration Change: ${gaitResult.accelerationChange.toFixed(2)}, Angular Tilt: ${gaitResult.angularTilt.toFixed(2)}, Overall Score: ${gaitResult.overallScore.toFixed(2)}`,
    sensorData: {
      accelerometer: accelerometerData.map(d => d.x),
      gyroscope: gyroscopeData.map(d => d.x),
      connectionStatus: 'connected'
    }
  };
};

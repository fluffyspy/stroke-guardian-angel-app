
import { StrokeDetectionResult } from "@/types";

// Constants for balance detection sensitivity
export const ACCELERATION_THRESHOLD = 0.15; // Extremely sensitive (m/s²)
export const ROTATION_THRESHOLD = 1.5;     // Extremely sensitive (degrees/s)
export const ABNORMAL_PERCENTAGE_THRESHOLD = 2; // Very low threshold to flag as abnormal (%)
export const MIN_READINGS_REQUIRED = 5;    // Minimum readings required for valid test
export const TEST_DURATION = 15;           // 15 seconds test duration

export interface SensorReading {
  timestamp: number;
  acceleration: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  orientation: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
    magnitude: number;
  };
}

// Calculate standard deviation as a measure of variability
export const calculateStandardDeviation = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(val => (val - mean) ** 2);
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  
  return Math.sqrt(variance);
};

export const createDetailedExplanation = (
  totalReadings: number,
  abnormalReadings: number,
  abnormalPercentage: number,
  accelerationData: number[],
  rotationData: number[],
  gyroscopeData: number[],
  accelVariability: number,
  rotationVariability: number, 
  magnetoVariability: number,
  balanceResult: 'normal' | 'abnormal'
): string => {
  let detailedExplanation = `Analyzed ${totalReadings} motion readings over 15 seconds.\n`;
  
  if (balanceResult === 'abnormal') {
    detailedExplanation += `${abnormalPercentage.toFixed(1)}% of readings showed balance irregularities.\n`;
    
    const abnormalAccelCount = accelerationData.filter(value => value > ACCELERATION_THRESHOLD).length;
    if (abnormalAccelCount > 0) {
      detailedExplanation += `Detected ${abnormalAccelCount} instances of abnormal acceleration (above ${ACCELERATION_THRESHOLD} m/s²).\n`;
    }
    
    const abnormalRotationCount = [...rotationData, ...gyroscopeData].filter(value => value > ROTATION_THRESHOLD).length;
    if (abnormalRotationCount > 0) {
      detailedExplanation += `Detected ${abnormalRotationCount} instances of abnormal rotation (above ${ROTATION_THRESHOLD}°/s).\n`;
    }
    
    detailedExplanation += `Movement variability: Acceleration (${accelVariability.toFixed(2)} m/s²), `;
    detailedExplanation += `Rotation (${rotationVariability.toFixed(2)}°/s), `;
    detailedExplanation += `Magnetic (${magnetoVariability.toFixed(2)} units).\n`;
    detailedExplanation += `These patterns may indicate balance issues consistent with potential stroke symptoms.`;
  } else {
    detailedExplanation += `Movement patterns appear stable and within normal range.\n`;
    detailedExplanation += `Movement variability: Acceleration (${accelVariability.toFixed(2)} m/s²), `;
    detailedExplanation += `Rotation (${rotationVariability.toFixed(2)}°/s), `;
    detailedExplanation += `Magnetic (${magnetoVariability.toFixed(2)} units).\n`;
    detailedExplanation += `No significant balance irregularities detected.`;
  }
  
  return detailedExplanation;
};

// Create a CSV file from sensor data and trigger download
export const createAndDownloadCSV = (rawSensorData: SensorReading[]): void => {
  // Create CSV header
  let csv = "timestamp,accel_x,accel_y,accel_z,accel_magnitude,orient_alpha,orient_beta,orient_gamma,orient_magnitude\n";
  
  // Add data rows
  rawSensorData.forEach(reading => {
    const row = [
      reading.timestamp,
      reading.acceleration.x,
      reading.acceleration.y,
      reading.acceleration.z,
      reading.acceleration.magnitude,
      reading.orientation.alpha || 0,
      reading.orientation.beta || 0,
      reading.orientation.gamma || 0,
      reading.orientation.magnitude
    ];
    
    csv += row.join(",") + "\n";
  });
  
  return csv;
};

export const analyzeBalanceData = (
  readingsCount: number,
  abnormalReadingsCount: number,
  accelerationData: number[],
  rotationData: number[],
  gyroscopeData: number[],
  magnetometerData: number[],
  rawSensorData: SensorReading[]
): StrokeDetectionResult => {
  // Check if we have enough data
  if (readingsCount < MIN_READINGS_REQUIRED) {
    return {
      detectionType: 'balance',
      result: 'inconclusive',
      timestamp: new Date(),
      details: `Insufficient data: Only ${readingsCount} readings collected, minimum ${MIN_READINGS_REQUIRED} required.`,
      sensorData: {
        accelerometer: accelerationData,
        gyroscope: [...rotationData, ...gyroscopeData],
        magnetometer: magnetometerData,
        abnormalReadingsPercentage: 0,
        variability: {
          acceleration: 0,
          rotation: 0,
          magnetic: 0
        },
        rawData: rawSensorData,
        connectionStatus: 'connected'
      }
    };
  }
  
  // Analyze the collected data with increased sensitivity
  const abnormalReadings = abnormalReadingsCount;
  const abnormalPercentage = (abnormalReadings / readingsCount) * 100;
  
  // Calculate variability in readings (standard deviation)
  const accelVariability = calculateStandardDeviation(accelerationData);
  const rotationVariability = calculateStandardDeviation([...rotationData, ...gyroscopeData]);
  const magnetoVariability = calculateStandardDeviation(magnetometerData);
  
  // Enhanced detection logic with lower thresholds and multiple factors
  const hasAbnormalPercentage = abnormalPercentage > ABNORMAL_PERCENTAGE_THRESHOLD;
  const hasHighAccelVariability = accelVariability > 0.3; // Even more sensitive
  const hasHighRotationVariability = rotationVariability > 3; // Even more sensitive
  const hasHighMagnetoVariability = magnetoVariability > 10; // Even more sensitive
  
  // Force abnormal result if significant movement detected
  const forceAbnormal = abnormalReadings > 3;
  
  // Determine result with improved sensitivity - medical grade
  const balanceResult = (hasAbnormalPercentage || hasHighAccelVariability || 
                        hasHighRotationVariability || hasHighMagnetoVariability || 
                        forceAbnormal) ? 'abnormal' : 'normal';
  
  // Create detailed explanation
  const detailedExplanation = createDetailedExplanation(
    readingsCount,
    abnormalReadings,
    abnormalPercentage,
    accelerationData,
    rotationData,
    gyroscopeData,
    accelVariability,
    rotationVariability,
    magnetoVariability,
    balanceResult
  );
  
  // Return the test result
  return {
    detectionType: 'balance',
    result: balanceResult,
    timestamp: new Date(),
    details: detailedExplanation,
    sensorData: {
      accelerometer: accelerationData,
      gyroscope: [...rotationData, ...gyroscopeData],
      magnetometer: magnetometerData,
      abnormalReadingsPercentage: abnormalPercentage,
      variability: {
        acceleration: accelVariability,
        rotation: rotationVariability,
        magnetic: magnetoVariability
      },
      rawData: rawSensorData,
      connectionStatus: 'connected'
    }
  };
};

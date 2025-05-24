import { StrokeDetectionResult } from "@/types";

// Constants for balance detection sensitivity - adjusted for realistic medical detection
export const ACCELERATION_THRESHOLD = 0.5; // Increased from 0.15 - normal walking has micro-movements
export const ROTATION_THRESHOLD = 8.0;     // Increased from 1.5 - normal holding has small rotations
export const GYROSCOPE_THRESHOLD = 10.0;   // Increased from 2.0 - more realistic for actual balance issues
export const MAGNETOMETER_THRESHOLD = 25;  // Increased from 15 - normal movement variation
export const SWAY_THRESHOLD = 0.8;         // Increased from 0.2 - significant sway detection
export const UNSTABLE_STEP_THRESHOLD = 1.0; // Increased from 0.25 - actual unstable steps
export const ABNORMAL_PERCENTAGE_THRESHOLD = 15; // Increased from 2% to 15% - more realistic
export const MIN_READINGS_REQUIRED = 5;    // Keep same - minimum readings required for valid test
export const TEST_DURATION = 15;           // Keep same - 15 seconds test duration

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
  gyroscope?: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  magnetometer?: {
    x: number;
    y: number;
    z: number;
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

// Detect specific movement patterns
export const detectMovementPatterns = (rawSensorData: SensorReading[]) => {
  let swayForwardBackward = 0;
  let unstableSteps = 0;
  let suddenMovements = 0;
  let linearMovementIssues = 0;

  for (let i = 1; i < rawSensorData.length; i++) {
    const current = rawSensorData[i];
    const previous = rawSensorData[i - 1];

    // Detect forward/backward sway using Y-axis acceleration
    const yAxisChange = Math.abs(current.acceleration.y - previous.acceleration.y);
    if (yAxisChange > SWAY_THRESHOLD) {
      swayForwardBackward++;
    }

    // Detect unstable steps using overall acceleration magnitude changes
    const accelChange = Math.abs(current.acceleration.magnitude - previous.acceleration.magnitude);
    if (accelChange > UNSTABLE_STEP_THRESHOLD) {
      unstableSteps++;
    }

    // Detect sudden movements using gyroscope data (if available)
    if (current.gyroscope && previous.gyroscope) {
      const gyroChange = Math.abs(current.gyroscope.magnitude - previous.gyroscope.magnitude);
      if (gyroChange > GYROSCOPE_THRESHOLD) {
        suddenMovements++;
      }
    }

    // Detect linear movement issues using magnetometer data (if available)
    if (current.magnetometer && previous.magnetometer) {
      const magnetoChange = Math.abs(current.magnetometer.magnitude - previous.magnetometer.magnitude);
      if (magnetoChange > MAGNETOMETER_THRESHOLD) {
        linearMovementIssues++;
      }
    }
  }

  return {
    swayForwardBackward,
    unstableSteps,
    suddenMovements,
    linearMovementIssues
  };
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
  balanceResult: 'normal' | 'abnormal',
  movementPatterns: any
): string => {
  let detailedExplanation = `Analyzed ${totalReadings} motion readings over 15 seconds.\n`;
  
  if (balanceResult === 'abnormal') {
    detailedExplanation += `${abnormalPercentage.toFixed(1)}% of readings showed balance irregularities.\n`;
    
    // Add movement pattern details
    if (movementPatterns.swayForwardBackward > 0) {
      detailedExplanation += `Detected ${movementPatterns.swayForwardBackward} forward/backward sway movements (threshold: ${SWAY_THRESHOLD} m/s²).\n`;
    }
    
    if (movementPatterns.unstableSteps > 0) {
      detailedExplanation += `Detected ${movementPatterns.unstableSteps} unstable steps (threshold: ${UNSTABLE_STEP_THRESHOLD} m/s²).\n`;
    }
    
    if (movementPatterns.suddenMovements > 0) {
      detailedExplanation += `Detected ${movementPatterns.suddenMovements} sudden movements (gyroscope threshold: ${GYROSCOPE_THRESHOLD} rad/s).\n`;
    }
    
    if (movementPatterns.linearMovementIssues > 0) {
      detailedExplanation += `Detected ${movementPatterns.linearMovementIssues} linear movement issues (magnetometer threshold: ${MAGNETOMETER_THRESHOLD} units).\n`;
    }
    
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

// Create a CSV file from sensor data
export const createAndDownloadCSV = (rawSensorData: SensorReading[]): string => {
  // Create CSV header
  let csv = "timestamp,accel_x,accel_y,accel_z,accel_magnitude,orient_alpha,orient_beta,orient_gamma,orient_magnitude,gyro_x,gyro_y,gyro_z,gyro_magnitude,magneto_x,magneto_y,magneto_z,magneto_magnitude\n";
  
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
      reading.orientation.magnitude,
      reading.gyroscope?.x || 0,
      reading.gyroscope?.y || 0,
      reading.gyroscope?.z || 0,
      reading.gyroscope?.magnitude || 0,
      reading.magnetometer?.x || 0,
      reading.magnetometer?.y || 0,
      reading.magnetometer?.z || 0,
      reading.magnetometer?.magnitude || 0
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
  
  // Analyze the collected data with more realistic medical-grade sensitivity
  const abnormalReadings = abnormalReadingsCount;
  const abnormalPercentage = (abnormalReadings / readingsCount) * 100;
  
  // Calculate variability in readings (standard deviation)
  const accelVariability = calculateStandardDeviation(accelerationData);
  const rotationVariability = calculateStandardDeviation([...rotationData, ...gyroscopeData]);
  const magnetoVariability = calculateStandardDeviation(magnetometerData);
  
  // Detect specific movement patterns
  const movementPatterns = detectMovementPatterns(rawSensorData);
  
  // More realistic detection logic - adjusted thresholds for actual balance issues
  const hasAbnormalPercentage = abnormalPercentage > ABNORMAL_PERCENTAGE_THRESHOLD;
  const hasHighAccelVariability = accelVariability > 1.2; // Increased from 0.3 - significant variability
  const hasHighRotationVariability = rotationVariability > 15; // Increased from 3 - significant rotation issues
  const hasHighMagnetoVariability = magnetoVariability > 30; // Increased from 10 - significant magnetic variation
  
  // Check for specific movement pattern issues - more conservative thresholds
  const hasSwayIssues = movementPatterns.swayForwardBackward > 8; // Increased from 2
  const hasUnstableSteps = movementPatterns.unstableSteps > 10; // Increased from 3
  const hasSuddenMovements = movementPatterns.suddenMovements > 6; // Increased from 2
  const hasLinearIssues = movementPatterns.linearMovementIssues > 8; // Increased from 2
  
  // Only flag as abnormal if significant issues detected - removed force abnormal
  const forceAbnormal = abnormalReadings > 20; // Increased from 3 - much higher threshold
  
  // Determine result with improved medical-grade sensitivity
  const balanceResult = (hasAbnormalPercentage || hasHighAccelVariability || 
                        hasHighRotationVariability || hasHighMagnetoVariability || 
                        hasSwayIssues || hasUnstableSteps || hasSuddenMovements ||
                        hasLinearIssues || forceAbnormal) ? 'abnormal' : 'normal';
  
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
    balanceResult,
    movementPatterns
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

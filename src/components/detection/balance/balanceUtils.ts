
import { StrokeDetectionResult } from "@/types";

// Constants for balance detection sensitivity - ADJUSTABLE THRESHOLDS
export const ACCELERATION_THRESHOLD = 1.5; // Reduced for better sensitivity
export const ROTATION_THRESHOLD = 10.0;     // Reduced for better sensitivity
export const GYROSCOPE_THRESHOLD = 15.0;   // Reduced for better sensitivity
export const MAGNETOMETER_THRESHOLD = 30;  // Reduced for better sensitivity
export const SWAY_THRESHOLD = 1.0;         // Reduced for better sensitivity
export const UNSTABLE_STEP_THRESHOLD = 1.5; // Reduced for better sensitivity
export const ABNORMAL_PERCENTAGE_THRESHOLD = 20; // Reduced to 20%
export const MIN_READINGS_REQUIRED = 3;    // Reduced minimum readings required
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
  movementPatterns: any,
  hasValidSensorData: boolean
): string => {
  let detailedExplanation = `Analyzed ${totalReadings} motion readings over 15 seconds.\n`;
  
  // Check if we have valid sensor data
  if (!hasValidSensorData) {
    detailedExplanation += `Warning: Limited sensor data detected. Some readings may be incomplete.\n`;
  }
  
  if (balanceResult === 'abnormal') {
    detailedExplanation += `${abnormalPercentage.toFixed(1)}% of readings showed balance irregularities.\n`;
    
    // Add movement pattern details
    if (movementPatterns.swayForwardBackward > 0) {
      detailedExplanation += `Detected ${movementPatterns.swayForwardBackward} forward/backward sway movements.\n`;
    }
    
    if (movementPatterns.unstableSteps > 0) {
      detailedExplanation += `Detected ${movementPatterns.unstableSteps} unstable steps.\n`;
    }
    
    if (movementPatterns.suddenMovements > 0) {
      detailedExplanation += `Detected ${movementPatterns.suddenMovements} sudden movements.\n`;
    }
    
    if (movementPatterns.linearMovementIssues > 0) {
      detailedExplanation += `Detected ${movementPatterns.linearMovementIssues} linear movement issues.\n`;
    }
    
    const abnormalAccelCount = accelerationData.filter(value => value > ACCELERATION_THRESHOLD).length;
    if (abnormalAccelCount > 0) {
      detailedExplanation += `Detected ${abnormalAccelCount} instances of abnormal acceleration.\n`;
    }
    
    const abnormalRotationCount = [...rotationData, ...gyroscopeData].filter(value => value > ROTATION_THRESHOLD).length;
    if (abnormalRotationCount > 0) {
      detailedExplanation += `Detected ${abnormalRotationCount} instances of abnormal rotation.\n`;
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
  console.log("=== BALANCE DATA ANALYSIS ===");
  console.log("Readings count:", readingsCount);
  console.log("Abnormal readings count:", abnormalReadingsCount);
  console.log("Acceleration data length:", accelerationData.length);
  console.log("Rotation data length:", rotationData.length);
  console.log("Gyroscope data length:", gyroscopeData.length);
  console.log("Magnetometer data length:", magnetometerData.length);
  console.log("Raw sensor data length:", rawSensorData.length);

  // Check if we have enough data
  if (readingsCount < MIN_READINGS_REQUIRED) {
    console.log("Insufficient readings:", readingsCount, "< required:", MIN_READINGS_REQUIRED);
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
  
  // More lenient validation for sensor data - check if we have ANY meaningful data
  const hasValidAccelData = accelerationData.some(val => val > 0.01) && accelerationData.length > 0; // Much lower threshold
  const hasValidRotationData = rotationData.some(val => val > 0.01) && rotationData.length > 0; // Much lower threshold
  const hasValidGyroData = gyroscopeData.some(val => val > 0.01) && gyroscopeData.length > 0; // Much lower threshold
  const hasValidMagnetoData = magnetometerData.some(val => val > 0.01) && magnetometerData.length > 0; // Much lower threshold
  
  // Accept as valid if we have ANY sensor working
  const hasValidSensorData = hasValidAccelData || hasValidRotationData || hasValidGyroData || hasValidMagnetoData;
  
  console.log("Sensor data validation:", {
    hasValidAccelData,
    hasValidRotationData,
    hasValidGyroData,
    hasValidMagnetoData,
    hasValidSensorData,
    accelSample: accelerationData.slice(0, 5),
    rotationSample: rotationData.slice(0, 5),
    gyroSample: gyroscopeData.slice(0, 5),
    magnetoSample: magnetometerData.slice(0, 5)
  });
  
  // If we don't have valid sensor data, return inconclusive
  if (!hasValidSensorData) {
    console.log("No valid sensor data detected");
    return {
      detectionType: 'balance',
      result: 'inconclusive',
      timestamp: new Date(),
      details: `Sensor data appears to be invalid or unavailable. All readings are near zero, which may indicate sensor permission issues or device limitations. Please ensure the device is moved during the test.`,
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
        connectionStatus: 'error'
      }
    };
  }
  
  // Analyze the collected data with more reasonable sensitivity
  const abnormalReadings = abnormalReadingsCount;
  const abnormalPercentage = (abnormalReadings / readingsCount) * 100;
  
  console.log("Analysis metrics:", {
    abnormalReadings,
    abnormalPercentage,
    threshold: ABNORMAL_PERCENTAGE_THRESHOLD
  });
  
  // Calculate variability in readings (standard deviation)
  const accelVariability = calculateStandardDeviation(accelerationData);
  const rotationVariability = calculateStandardDeviation([...rotationData, ...gyroscopeData]);
  const magnetoVariability = calculateStandardDeviation(magnetometerData);
  
  // Detect specific movement patterns
  const movementPatterns = detectMovementPatterns(rawSensorData);
  
  console.log("Movement patterns:", movementPatterns);
  console.log("Variability:", { accelVariability, rotationVariability, magnetoVariability });
  
  // More reasonable detection logic
  const hasAbnormalPercentage = abnormalPercentage > ABNORMAL_PERCENTAGE_THRESHOLD;
  const hasHighAccelVariability = accelVariability > 2.0; // Reasonable threshold
  const hasHighRotationVariability = rotationVariability > 15; // Reasonable threshold  
  const hasHighMagnetoVariability = magnetoVariability > 30; // Reasonable threshold
  
  // Check for specific movement pattern issues with reasonable thresholds
  const hasSwayIssues = movementPatterns.swayForwardBackward > 8;
  const hasUnstableSteps = movementPatterns.unstableSteps > 10;
  const hasSuddenMovements = movementPatterns.suddenMovements > 5;
  const hasLinearIssues = movementPatterns.linearMovementIssues > 8;
  
  console.log("Analysis flags:", {
    hasAbnormalPercentage,
    hasHighAccelVariability,
    hasHighRotationVariability,
    hasHighMagnetoVariability,
    hasSwayIssues,
    hasUnstableSteps,
    hasSuddenMovements,
    hasLinearIssues
  });
  
  // Determine result with reasonable sensitivity
  const balanceResult = (hasAbnormalPercentage || hasHighAccelVariability || 
                        hasHighRotationVariability || hasHighMagnetoVariability || 
                        hasSwayIssues || hasUnstableSteps || hasSuddenMovements ||
                        hasLinearIssues) ? 'abnormal' : 'normal';
  
  console.log("Final balance result:", balanceResult);
  
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
    movementPatterns,
    hasValidSensorData
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

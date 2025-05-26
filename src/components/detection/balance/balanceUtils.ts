import { StrokeDetectionResult } from "@/types";

// Define constants for thresholds and test duration
export const ACCELERATION_THRESHOLD = 15; // Adjust as needed
export const ROTATION_THRESHOLD = 180; // Adjust as needed
export const GYROSCOPE_THRESHOLD = 5; // Adjust as needed
export const TEST_DURATION = 15; // Test duration in seconds
const MIN_REQUIRED_READINGS = 5; // Minimum number of sensor readings required
const ABNORMAL_THRESHOLD_PERCENTAGE = 25; // Percentage of abnormal readings to consider as abnormal

// Define interfaces for sensor data
export interface SensorReading {
  timestamp: number;
  acceleration: { x: number; y: number; z: number; magnitude: number };
  orientation: { alpha: number | null; beta: number | null; gamma: number | null; magnitude: number };
  gyroscope?: { x: number; y: number; z: number; magnitude: number };
  magnetometer?: { x: number; y: number; z: number; magnitude: number };
}

// Helper function to calculate variability (standard deviation)
const calculateVariability = (data: number[]): number => {
  if (data.length === 0) return 0;
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const sumOfSquares = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumOfSquares / data.length);
};

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

import { detectionAPI, SensorData } from "@/services/apiService";

export const analyzeBalanceData = async (
  totalReadings: number,
  abnormalReadings: number,
  accelerationData: number[],
  rotationData: number[],
  gyroscopeData: number[],
  magnetometerData: number[],
  rawSensorData: SensorReading[]
): Promise<StrokeDetectionResult> => {
  console.log("Starting balance analysis with:", {
    totalReadings,
    abnormalReadings,
    accelerationData: accelerationData.length,
    rotationData: rotationData.length,
    gyroscopeData: gyroscopeData.length,
    rawSensorData: rawSensorData.length
  });

  const userId = localStorage.getItem("userId");
  
  if (userId && rawSensorData.length > 0) {
    try {
      const sensorData: SensorData = {
        user_id: userId,
        accel: rawSensorData.map(reading => [
          reading.acceleration.x,
          reading.acceleration.y,
          reading.acceleration.z
        ]),
        gyro: rawSensorData.map(reading => [
          reading.gyroscope?.x || 0,
          reading.gyroscope?.y || 0,
          reading.gyroscope?.z || 0
        ])
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
            accelerometer: accelerationData,
            gyroscope: gyroscopeData,
            magnetometer: magnetometerData,
            abnormalReadingsPercentage: (abnormalReadings / totalReadings) * 100,
            rawData: rawSensorData.map(reading => ({
              timestamp: reading.timestamp,
              acceleration: reading.acceleration,
              orientation: reading.orientation
            })),
            connectionStatus: 'connected'
          }
        };
      }
    } catch (error) {
      console.error("Backend analysis failed, falling back to local analysis:", error);
    }
  }

  let result: 'normal' | 'abnormal' | 'inconclusive' = 'inconclusive';
  let details = '';

  if (totalReadings < MIN_REQUIRED_READINGS) {
    result = 'inconclusive';
    details = `Insufficient data collected. Got ${totalReadings} readings, need at least ${MIN_REQUIRED_READINGS}.\n`;
    details += "Please ensure your device's motion sensors are working and try the test again.";
  } else {
    const abnormalPercentage = (abnormalReadings / totalReadings) * 100;
    
    const accelVariability = calculateVariability(accelerationData);
    const rotationVariability = calculateVariability(rotationData);
    const gyroVariability = calculateVariability(gyroscopeData);
    
    console.log("Analysis metrics:", {
      abnormalPercentage,
      accelVariability,
      rotationVariability,
      gyroVariability
    });
    
    if (abnormalPercentage > ABNORMAL_THRESHOLD_PERCENTAGE) {
      result = 'abnormal';
      details = `High instability detected (${abnormalPercentage.toFixed(1)}% abnormal readings).\n`;
      details += `Motion variability: Acceleration=${accelVariability.toFixed(2)}, Rotation=${rotationVariability.toFixed(2)}, Gyroscope=${gyroVariability.toFixed(2)}`;
    } else if (abnormalPercentage > 10) {
      result = 'abnormal';
      details = `Moderate balance concerns detected (${abnormalPercentage.toFixed(1)}% abnormal readings).\n`;
      details += "Some irregularities in movement patterns observed.";
    } else {
      result = 'normal';
      details = `Balance appears normal (${abnormalPercentage.toFixed(1)}% abnormal readings).\n`;
      details += `Motion patterns are within expected ranges.`;
    }
  }

  return {
    detectionType: 'balance',
    result,
    timestamp: new Date(),
    details,
    sensorData: {
      accelerometer: accelerationData,
      gyroscope: gyroscopeData,
      magnetometer: magnetometerData,
      abnormalReadingsPercentage: totalReadings > 0 ? (abnormalReadings / totalReadings) * 100 : 0,
      variability: {
        acceleration: calculateVariability(accelerationData),
        rotation: calculateVariability(rotationData),
        magnetic: calculateVariability(magnetometerData)
      },
      rawData: rawSensorData.map(reading => ({
        timestamp: reading.timestamp,
        acceleration: reading.acceleration,
        orientation: reading.orientation
      })),
      connectionStatus: 'connected'
    }
  };
};

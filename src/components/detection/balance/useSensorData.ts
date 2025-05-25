import { useState, useEffect, useRef } from 'react';
import { Motion } from '@capacitor/motion';
import { toast } from 'sonner';
import { SensorReading, ACCELERATION_THRESHOLD, ROTATION_THRESHOLD, GYROSCOPE_THRESHOLD } from './balanceUtils';

interface SensorState {
  accelerationData: number[];
  rotationData: number[];
  gyroscopeData: number[];
  magnetometerData: number[];
  rawSensorData: SensorReading[];
  currentAccel: { x: number; y: number; z: number };
  currentRotation: { alpha: number; beta: number; gamma: number };
  currentGyro: { x: number; y: number; z: number };
  currentMagnetometer: { x: number; y: number; z: number };
  debugInfo: {
    totalReadings: number;
    abnormalCount: number;
    lastUpdate: number;
    motionDetected: boolean;
    sensorTypes: string[];
  };
  sensorAvailable: boolean;
}

interface UseSensorDataReturn extends SensorState {
  resetSensorData: () => void;
  readingsCountRef: React.RefObject<number>;
  abnormalReadingsCountRef: React.RefObject<number>;
  hasMotionRef: React.RefObject<boolean>;
  sensorTypesRef: React.RefObject<Set<string>>;
  lastReadingRef: React.RefObject<SensorReading | null>;
}

export const useSensorData = (testStarted: boolean, testCompleted: boolean): UseSensorDataReturn => {
  // State for sensor data
  const [accelerationData, setAccelerationData] = useState<number[]>([]);
  const [rotationData, setRotationData] = useState<number[]>([]);
  const [gyroscopeData, setGyroscopeData] = useState<number[]>([]);
  const [magnetometerData, setMagnetometerData] = useState<number[]>([]);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [rawSensorData, setRawSensorData] = useState<SensorReading[]>([]);
  const [currentAccel, setCurrentAccel] = useState({ x: 0, y: 0, z: 0 });
  const [currentRotation, setCurrentRotation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [currentGyro, setCurrentGyro] = useState({ x: 0, y: 0, z: 0 });
  const [currentMagnetometer, setCurrentMagnetometer] = useState({ x: 0, y: 0, z: 0 });
  
  // Debug state to monitor readings
  const [debugInfo, setDebugInfo] = useState({
    totalReadings: 0,
    abnormalCount: 0,
    lastUpdate: Date.now(),
    motionDetected: false,
    sensorTypes: [] as string[]
  });
  
  // Refs for cleaning up listeners and tracking counts
  const accelListenerRef = useRef<any>(null);
  const orientationListenerRef = useRef<any>(null);
  const readingsCountRef = useRef<number>(0);
  const abnormalReadingsCountRef = useRef<number>(0);
  const hasMotionRef = useRef<boolean>(false);
  const sensorTypesRef = useRef<Set<string>>(new Set());
  const lastReadingRef = useRef<SensorReading | null>(null);
  const previousOrientationRef = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);
  const lastMotionTimeRef = useRef<number>(Date.now());

  // Check for sensor availability
  useEffect(() => {
    const checkSensors = async () => {
      try {
        console.log("Checking sensor availability...");
        
        // Check if Motion API is available
        if (typeof Motion === 'undefined') {
          console.error("Motion API is not available");
          setSensorAvailable(false);
          return;
        }
        
        // Request permissions first
        try {
          const permissions = await Motion.requestPermissions();
          console.log("Motion permissions result:", permissions);
          
          if (!permissions.granted) {
            console.warn("Motion permissions not granted:", permissions);
            setSensorAvailable(false);
            return;
          }
        } catch (permError) {
          console.error("Error requesting motion permissions:", permError);
        }
        
        setSensorAvailable(true);
        sensorTypesRef.current.add('accelerometer');
        sensorTypesRef.current.add('orientation');
        
        setDebugInfo(prev => ({
          ...prev,
          sensorTypes: Array.from(sensorTypesRef.current)
        }));
        
        console.log("Sensors available:", Array.from(sensorTypesRef.current));
      } catch (error) {
        console.error("Error checking sensor availability:", error);
        setSensorAvailable(false);
        toast.error("Failed to access motion sensors. Please check permissions.");
      }
    };
    
    checkSensors();
  }, []);

  // Start collecting sensor data when test starts
  useEffect(() => {
    if (!testStarted || !sensorAvailable || testCompleted) {
      console.log("Not starting sensors - testStarted:", testStarted, "sensorAvailable:", sensorAvailable, "testCompleted:", testCompleted);
      return;
    }
    
    console.log("Starting sensor data collection...");
    
    // Reset counters and data
    readingsCountRef.current = 0;
    abnormalReadingsCountRef.current = 0;
    hasMotionRef.current = false;
    previousOrientationRef.current = null;
    lastMotionTimeRef.current = Date.now();
    
    const startSensors = async () => {
      try {
        console.log("Initializing motion sensors...");
        
        // Start accelerometer readings
        accelListenerRef.current = await Motion.addListener('accel', (event) => {
          const { x, y, z } = event.acceleration;
          const timestamp = Date.now();
          
          // More detailed logging
          console.log(`Raw accel data: x=${x.toFixed(4)}, y=${y.toFixed(4)}, z=${z.toFixed(4)}, timestamp=${timestamp}`);
          
          // Check if we're getting actual motion data
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          console.log(`Acceleration magnitude: ${magnitude.toFixed(4)}`);
          
          // Only consider it valid motion if magnitude is above a very small threshold
          if (magnitude > 0.01) {
            hasMotionRef.current = true;
            lastMotionTimeRef.current = timestamp;
            console.log("Valid motion detected!");
          } else {
            console.warn("Motion reading too small, might be sensor issue");
          }
          
          // Set current values for display
          setCurrentAccel({ x, y, z });
          
          // Store acceleration data - use magnitude
          setAccelerationData(prev => {
            const newData = [...prev, magnitude];
            console.log("Acceleration data length:", newData.length, "Latest value:", magnitude.toFixed(4));
            return newData;
          });
          
          // Increment total readings counter
          readingsCountRef.current += 1;
          
          // Count abnormal readings - only if magnitude is significantly above threshold
          if (magnitude > ACCELERATION_THRESHOLD) {
            abnormalReadingsCountRef.current += 1;
            console.log(`Abnormal acceleration detected: ${magnitude.toFixed(4)}, total abnormal: ${abnormalReadingsCountRef.current}`);
          }
          
          // Update debug info
          setDebugInfo(prev => ({
            ...prev,
            totalReadings: readingsCountRef.current,
            abnormalCount: abnormalReadingsCountRef.current,
            lastUpdate: timestamp,
            motionDetected: hasMotionRef.current
          }));
        });
        
        // Start orientation readings
        orientationListenerRef.current = await Motion.addListener('orientation', (event) => {
          const { alpha, beta, gamma } = event;
          const timestamp = Date.now();
          
          // More detailed logging
          console.log(`Raw orientation: α=${alpha}, β=${beta}, γ=${gamma}, timestamp=${timestamp}`);
          
          hasMotionRef.current = true;
          lastMotionTimeRef.current = timestamp;
          
          // Set current values for display - handle null values properly
          const safeAlpha = alpha ?? 0;
          const safeBeta = beta ?? 0;
          const safeGamma = gamma ?? 0;
          
          setCurrentRotation({ alpha: safeAlpha, beta: safeBeta, gamma: safeGamma });
          
          // Calculate rotation magnitude
          const rotationMagnitude = Math.sqrt(
            safeAlpha * safeAlpha + 
            safeBeta * safeBeta + 
            safeGamma * safeGamma
          );
          
          console.log(`Rotation magnitude: ${rotationMagnitude.toFixed(4)}`);
          
          // Store rotation data
          setRotationData(prev => {
            const newData = [...prev, rotationMagnitude];
            console.log("Rotation data length:", newData.length, "Latest value:", rotationMagnitude.toFixed(4));
            return newData;
          });
          
          // Calculate gyroscope-like data from orientation changes
          if (previousOrientationRef.current) {
            const gyroX = Math.abs(safeBeta - previousOrientationRef.current.beta);
            const gyroY = Math.abs(safeGamma - previousOrientationRef.current.gamma);
            const gyroZ = Math.abs(safeAlpha - previousOrientationRef.current.alpha);
            const gyroMagnitude = Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);
            
            console.log(`Gyroscope magnitude: ${gyroMagnitude.toFixed(4)}`);
            
            // Store gyroscope-like data
            setGyroscopeData(prev => {
              const newData = [...prev, gyroMagnitude];
              console.log("Gyroscope data length:", newData.length, "Latest value:", gyroMagnitude.toFixed(4));
              return newData;
            });
            
            // Update current gyro display values
            setCurrentGyro({ x: gyroX, y: gyroY, z: gyroZ });
            
            // Check for abnormal gyroscope-like readings
            if (gyroMagnitude > GYROSCOPE_THRESHOLD) {
              abnormalReadingsCountRef.current += 1;
              console.log(`Abnormal gyroscope reading: ${gyroMagnitude.toFixed(4)}`);
            }
          }
          
          // Enhanced magnetometer-like data from alpha with more realistic values
          if (alpha !== null && alpha !== undefined) {
            const magnetoX = Math.cos((safeAlpha * Math.PI) / 180) * 100;
            const magnetoY = Math.sin((safeAlpha * Math.PI) / 180) * 100;
            const magnetoZ = safeBeta * 0.5;
            const magnetoMagnitude = Math.sqrt(magnetoX * magnetoX + magnetoY * magnetoY + magnetoZ * magnetoZ);
            
            console.log(`Magnetometer magnitude: ${magnetoMagnitude.toFixed(4)}`);
            
            setMagnetometerData(prev => {
              const newData = [...prev, magnetoMagnitude];
              console.log("Magnetometer data length:", newData.length, "Latest value:", magnetoMagnitude.toFixed(4));
              return newData;
            });
            
            setCurrentMagnetometer({ x: magnetoX, y: magnetoY, z: magnetoZ });
          }
          
          // Store current orientation for next gyro calculation
          previousOrientationRef.current = { alpha: safeAlpha, beta: safeBeta, gamma: safeGamma };
          
          // Check for abnormal rotation - only if significantly above threshold
          if (rotationMagnitude > ROTATION_THRESHOLD) {
            abnormalReadingsCountRef.current += 1;
            console.log(`Abnormal rotation: ${rotationMagnitude.toFixed(4)}`);
          }
          
          // Create comprehensive sensor reading with all data
          const newReading: SensorReading = {
            timestamp,
            acceleration: { 
              x: currentAccel.x, 
              y: currentAccel.y, 
              z: currentAccel.z, 
              magnitude: Math.sqrt(currentAccel.x * currentAccel.x + currentAccel.y * currentAccel.y + currentAccel.z * currentAccel.z)
            },
            orientation: { 
              alpha: safeAlpha, 
              beta: safeBeta, 
              gamma: safeGamma, 
              magnitude: rotationMagnitude 
            },
            gyroscope: previousOrientationRef.current ? {
              x: Math.abs(safeBeta - (previousOrientationRef.current?.beta || 0)),
              y: Math.abs(safeGamma - (previousOrientationRef.current?.gamma || 0)),
              z: Math.abs(safeAlpha - (previousOrientationRef.current?.alpha || 0)),
              magnitude: Math.sqrt(
                Math.pow(Math.abs(safeBeta - (previousOrientationRef.current?.beta || 0)), 2) +
                Math.pow(Math.abs(safeGamma - (previousOrientationRef.current?.gamma || 0)), 2) +
                Math.pow(Math.abs(safeAlpha - (previousOrientationRef.current?.alpha || 0)), 2)
              )
            } : undefined,
            magnetometer: alpha !== null ? {
              x: Math.cos((safeAlpha * Math.PI) / 180) * 100,
              y: Math.sin((safeAlpha * Math.PI) / 180) * 100,
              z: safeBeta * 0.5,
              magnitude: Math.sqrt(
                Math.pow(Math.cos((safeAlpha * Math.PI) / 180) * 100, 2) +
                Math.pow(Math.sin((safeAlpha * Math.PI) / 180) * 100, 2) +
                Math.pow(safeBeta * 0.5, 2)
              )
            } : undefined
          };
          
          lastReadingRef.current = newReading;
          
          // Store the raw data
          setRawSensorData(prev => {
            const newRawData = [...prev, newReading];
            console.log("Raw sensor data length:", newRawData.length);
            return newRawData;
          });
        });
        
        console.log("Motion sensors started successfully");
        toast.success("Motion sensors activated - checking data quality...");
        
        // Set up a data quality check after 3 seconds
        setTimeout(() => {
          if (readingsCountRef.current === 0) {
            console.error("No sensor readings after 3 seconds - sensor may not be working");
            toast.error("No sensor data detected. Please check device permissions and capabilities.");
          } else if (readingsCountRef.current < 10) {
            console.warn("Low sensor reading rate:", readingsCountRef.current);
            toast.warning("Low sensor reading rate detected. Results may be inaccurate.");
          } else {
            console.log("Sensor data quality check passed:", readingsCountRef.current, "readings");
            toast.success("Sensors working properly!");
          }
        }, 3000);
        
      } catch (error) {
        console.error("Error starting sensors:", error);
        toast.error("Failed to start motion sensors: " + error.message);
        setSensorAvailable(false);
      }
    };
    
    startSensors();
    
    // Set up monitoring for data flow
    const monitoringInterval = setInterval(() => {
      const timeSinceLastMotion = Date.now() - lastMotionTimeRef.current;
      console.log(`Monitoring - Time since last motion: ${timeSinceLastMotion}ms, Total readings: ${readingsCountRef.current}, Has motion: ${hasMotionRef.current}`);
      
      if (timeSinceLastMotion > 5000 && testStarted && !testCompleted) {
        console.warn("Motion data stream may be interrupted");
        toast.warning("Motion data stream may be interrupted. Try moving the device.");
      }
      
      // Log current sensor values for debugging
      console.log("Current sensor values:", {
        accel: currentAccel,
        rotation: currentRotation,
        gyro: currentGyro,
        magnetometer: currentMagnetometer
      });
    }, 3000);
    
    return () => {
      console.log("Cleaning up sensor listeners...");
      clearInterval(monitoringInterval);
      
      if (accelListenerRef.current) {
        accelListenerRef.current.remove();
        accelListenerRef.current = null;
      }
      if (orientationListenerRef.current) {
        orientationListenerRef.current.remove();
        orientationListenerRef.current = null;
      }
    };
  }, [testStarted, testCompleted, sensorAvailable]);

  const resetSensorData = () => {
    console.log("Resetting sensor data...");
    setAccelerationData([]);
    setRotationData([]);
    setGyroscopeData([]);
    setMagnetometerData([]);
    setRawSensorData([]);
    setCurrentAccel({ x: 0, y: 0, z: 0 });
    setCurrentRotation({ alpha: 0, beta: 0, gamma: 0 });
    setCurrentGyro({ x: 0, y: 0, z: 0 });
    setCurrentMagnetometer({ x: 0, y: 0, z: 0 });
    lastReadingRef.current = null;
    previousOrientationRef.current = null;
    readingsCountRef.current = 0;
    abnormalReadingsCountRef.current = 0;
    hasMotionRef.current = false;
    lastMotionTimeRef.current = Date.now();
    
    setDebugInfo(prev => ({
      ...prev,
      totalReadings: 0,
      abnormalCount: 0,
      motionDetected: false
    }));
  };

  return {
    accelerationData,
    rotationData,
    gyroscopeData,
    magnetometerData,
    rawSensorData,
    currentAccel,
    currentRotation,
    currentGyro,
    currentMagnetometer,
    debugInfo,
    sensorAvailable,
    resetSensorData,
    readingsCountRef,
    abnormalReadingsCountRef,
    hasMotionRef,
    sensorTypesRef,
    lastReadingRef
  };
};

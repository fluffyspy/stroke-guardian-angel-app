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
  const gyroListenerRef = useRef<any>(null);
  const readingsCountRef = useRef<number>(0);
  const abnormalReadingsCountRef = useRef<number>(0);
  const hasMotionRef = useRef<boolean>(false);
  const sensorTypesRef = useRef<Set<string>>(new Set());
  const lastReadingRef = useRef<SensorReading | null>(null);
  const previousOrientationRef = useRef<{ alpha: number; beta: number; gamma: number } | null>(null);

  // Check for sensor availability with better error handling
  useEffect(() => {
    const checkSensors = async () => {
      let sensorsDetected = false;
      
      try {
        console.log("Checking accelerometer availability...");
        // Test if we can access the accelerometer
        const accelCheck = await Motion.addListener('accel', (event) => {
          console.log("Accelerometer check successful:", event);
          sensorTypesRef.current.add('accelerometer');
          sensorsDetected = true;
          accelCheck.remove();
        });
        
        // Also check orientation sensor
        console.log("Checking orientation sensor availability...");
        const orientCheck = await Motion.addListener('orientation', (event) => {
          console.log("Orientation check successful:", event);
          sensorTypesRef.current.add('orientation');
          sensorsDetected = true;
          orientCheck.remove();
        });
        
        // Try to check gyroscope sensor
        try {
          console.log("Checking gyroscope availability...");
          const gyroCheck = await Motion.addListener('gyroscope', (event) => {
            console.log("Gyroscope check successful:", event);
            sensorTypesRef.current.add('gyroscope');
            sensorsDetected = true;
            gyroCheck.remove();
          });
        } catch (e) {
          console.warn("Gyroscope not available:", e);
        }
        
        // Set a timeout to check if we got any readings
        setTimeout(() => {
          if (!sensorsDetected) {
            console.warn("No sensor readings detected during check");
            toast.warning("Motion sensors not responding. Try restarting your device.");
            setSensorAvailable(false);
          } else {
            console.log(`Available sensors: ${Array.from(sensorTypesRef.current).join(', ')}`);
            setSensorAvailable(true);
            setDebugInfo(prev => ({
              ...prev,
              sensorTypes: Array.from(sensorTypesRef.current)
            }));
          }
        }, 1500);
        
      } catch (error) {
        console.error("Error checking sensor availability:", error);
        setSensorAvailable(false);
        toast.error("Failed to access motion sensors. Please ensure permissions are granted.");
      }
    };
    
    checkSensors();
  }, []);

  // Start collecting sensor data when test starts with higher frequency
  useEffect(() => {
    if (!testStarted || !sensorAvailable) return;
    
    // Reset counters and data
    readingsCountRef.current = 0;
    abnormalReadingsCountRef.current = 0;
    hasMotionRef.current = false;
    previousOrientationRef.current = null;
    
    const startSensors = async () => {
      try {
        console.log("Starting sensors for balance test with medical-grade sensitivity");
        toast.info("Initializing motion detection sensors...");
        
        // Start accelerometer readings with higher frequency
        accelListenerRef.current = await Motion.addListener('accel', (event) => {
          const { x, y, z } = event.acceleration;
          hasMotionRef.current = true; // Mark that we've received sensor data
          
          // Set current values for display
          setCurrentAccel({ x, y, z });
          
          // Calculate magnitude of acceleration vector (removing gravity component)
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          
          console.log(`Acceleration: x=${x.toFixed(4)}, y=${y.toFixed(4)}, z=${z.toFixed(4)}, mag=${magnitude.toFixed(4)}`);
          
          // Store acceleration data
          setAccelerationData(prev => [...prev, magnitude]);
          
          // Increment total readings counter
          readingsCountRef.current += 1;
          
          // Create new reading or update last one
          const newReading: SensorReading = {
            timestamp: Date.now(),
            acceleration: { x, y, z, magnitude },
            orientation: lastReadingRef.current?.orientation || { alpha: null, beta: null, gamma: null, magnitude: 0 },
            gyroscope: lastReadingRef.current?.gyroscope,
            magnetometer: lastReadingRef.current?.magnetometer
          };
          
          // Update the last reading reference
          lastReadingRef.current = newReading;
          
          // Count abnormal readings - extreme sensitivity for medical use
          if (magnitude > ACCELERATION_THRESHOLD) {
            // Increment with higher weight for more significant movements
            const weight = magnitude > ACCELERATION_THRESHOLD * 2 ? 3 : 
                          magnitude > ACCELERATION_THRESHOLD * 1.5 ? 2 : 1;
            abnormalReadingsCountRef.current += weight;
            
            console.log(`Abnormal acceleration! Magnitude: ${magnitude.toFixed(4)}, Weight: ${weight}, Total abnormal: ${abnormalReadingsCountRef.current}`);
          }
          
          // Store the raw data
          setRawSensorData(prev => [...prev, newReading]);
          
          // Update debug info
          setDebugInfo(prev => ({
            totalReadings: readingsCountRef.current,
            abnormalCount: abnormalReadingsCountRef.current,
            lastUpdate: Date.now(),
            motionDetected: true,
            sensorTypes: Array.from(sensorTypesRef.current)
          }));
        });
        
        // Start orientation readings
        orientationListenerRef.current = await Motion.addListener('orientation', (event) => {
          const { alpha, beta, gamma } = event;
          hasMotionRef.current = true; // Mark that we've received sensor data
          
          // Set current values for display
          setCurrentRotation({ alpha: alpha || 0, beta: beta || 0, gamma: gamma || 0 });
          
          // Calculate rotation magnitude
          const rotationMagnitude = Math.sqrt(
            (alpha || 0) * (alpha || 0) + 
            (beta || 0) * (beta || 0) + 
            (gamma || 0) * (gamma || 0)
          );
          
          console.log(`Orientation: α=${alpha?.toFixed(4) || 'null'}, β=${beta?.toFixed(4) || 'null'}, γ=${gamma?.toFixed(4) || 'null'}, mag=${rotationMagnitude.toFixed(4)}`);
          
          // Store rotation data
          setRotationData(prev => [...prev, rotationMagnitude]);
          
          // Calculate gyroscope-like data from orientation changes
          if (previousOrientationRef.current) {
            const gyroX = Math.abs((beta || 0) - previousOrientationRef.current.beta);
            const gyroY = Math.abs((gamma || 0) - previousOrientationRef.current.gamma);
            const gyroZ = Math.abs((alpha || 0) - previousOrientationRef.current.alpha);
            const gyroMagnitude = Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);
            
            // Store gyroscope-like data
            setGyroscopeData(prev => [...prev, gyroMagnitude]);
            
            // Update current gyro display values
            setCurrentGyro({ x: gyroX, y: gyroY, z: gyroZ });
            
            // Check for abnormal gyroscope-like readings
            if (gyroMagnitude > GYROSCOPE_THRESHOLD) {
              const weight = gyroMagnitude > GYROSCOPE_THRESHOLD * 2 ? 3 :
                            gyroMagnitude > GYROSCOPE_THRESHOLD * 1.5 ? 2 : 1;
              abnormalReadingsCountRef.current += weight;
              console.log(`Abnormal gyroscope-like reading! Magnitude: ${gyroMagnitude.toFixed(4)}, Weight: ${weight}`);
            }
          }
          
          // Magnetometer-like data from alpha (compass direction)
          if (alpha !== null) {
            const magnetoX = Math.cos((alpha * Math.PI) / 180);
            const magnetoY = Math.sin((alpha * Math.PI) / 180);
            const magnetoZ = 0;
            const magnetoMagnitude = Math.sqrt(magnetoX * magnetoX + magnetoY * magnetoY);
            
            setMagnetometerData(prev => [...prev, magnetoMagnitude]);
            
            // Update magnetometer current values
            setCurrentMagnetometer({ x: magnetoX, y: magnetoY, z: magnetoZ });
          }
          
          // Update last reading with new orientation data if it exists
          if (lastReadingRef.current) {
            lastReadingRef.current.orientation = {
              alpha, 
              beta, 
              gamma,
              magnitude: rotationMagnitude
            };
            
            // Add gyroscope-like data if we have previous readings
            if (previousOrientationRef.current) {
              const gyroX = Math.abs((beta || 0) - previousOrientationRef.current.beta);
              const gyroY = Math.abs((gamma || 0) - previousOrientationRef.current.gamma);
              const gyroZ = Math.abs((alpha || 0) - previousOrientationRef.current.alpha);
              const gyroMagnitude = Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);
              
              lastReadingRef.current.gyroscope = {
                x: gyroX,
                y: gyroY,
                z: gyroZ,
                magnitude: gyroMagnitude
              };
            }
            
            // Also update magnetometer data from alpha
            if (alpha !== null) {
              const magnetoX = Math.cos((alpha * Math.PI) / 180);
              const magnetoY = Math.sin((alpha * Math.PI) / 180);
              const magnetoMagnitude = Math.sqrt(magnetoX * magnetoX + magnetoY * magnetoY);
              
              lastReadingRef.current.magnetometer = {
                x: magnetoX,
                y: magnetoY,
                z: 0,
                magnitude: magnetoMagnitude
              };
            }
          }
          
          // Store current orientation for next gyro calculation
          previousOrientationRef.current = { alpha: alpha || 0, beta: beta || 0, gamma: gamma || 0 };
          
          // Extreme sensitivity for rotation detection (medical use)
          if (rotationMagnitude > ROTATION_THRESHOLD) {
            // Weight higher rotations more in the abnormal count
            const weight = rotationMagnitude > ROTATION_THRESHOLD * 2 ? 3 :
                          rotationMagnitude > ROTATION_THRESHOLD * 1.5 ? 2 : 1;
            
            abnormalReadingsCountRef.current += weight;
            console.log(`Abnormal rotation! Magnitude: ${rotationMagnitude.toFixed(4)}, Weight: ${weight}, Total abnormal: ${abnormalReadingsCountRef.current}`);
          }
        });
        
        // Try to get gyroscope data if available
        try {
          gyroListenerRef.current = await Motion.addListener('gyroscope', (event) => {
            sensorTypesRef.current.add('gyroscope');
            const { x, y, z } = event;
            
            // Set current values for gyroscope
            setCurrentGyro({ x: x || 0, y: y || 0, z: z || 0 });
            
            // Calculate gyroscope magnitude
            const gyroMagnitude = Math.sqrt(
              (x || 0) * (x || 0) + 
              (y || 0) * (y || 0) + 
              (z || 0) * (z || 0)
            );
            
            console.log(`Gyroscope: x=${x?.toFixed(4) || 'null'}, y=${y?.toFixed(4) || 'null'}, z=${z?.toFixed(4) || 'null'}, mag=${gyroMagnitude.toFixed(4)}`);
            
            // Store gyroscope data
            setGyroscopeData(prev => [...prev, gyroMagnitude]);
            
            // Update last reading with gyroscope data if it exists
            if (lastReadingRef.current) {
              lastReadingRef.current.gyroscope = {
                x, y, z,
                magnitude: gyroMagnitude
              };
            }
            
            // Count abnormal gyroscope readings
            if (gyroMagnitude > ROTATION_THRESHOLD * 0.8) { // Slightly more sensitive for gyro
              const weight = gyroMagnitude > ROTATION_THRESHOLD * 1.6 ? 3 :
                            gyroMagnitude > ROTATION_THRESHOLD * 1.2 ? 2 : 1;
                          
              abnormalReadingsCountRef.current += weight;
              console.log(`Abnormal gyroscope! Magnitude: ${gyroMagnitude.toFixed(4)}, Weight: ${weight}, Total abnormal: ${abnormalReadingsCountRef.current}`);
            }
          });
        } catch (error) {
          console.warn("Gyroscope not available:", error);
        }
        
        // Set up a check to verify we're actually getting sensor data
        setTimeout(() => {
          if (!hasMotionRef.current) {
            console.error("No motion data received after starting test");
            toast.error("No motion data received. Please ensure device motion is not locked.");
          } else {
            toast.success("Motion sensors activated successfully");
          }
        }, 1000);
        
        // Set up continuous checks to ensure motion data keeps flowing
        const dataCheckInterval = setInterval(() => {
          const timeSinceLastUpdate = Date.now() - debugInfo.lastUpdate;
          if (timeSinceLastUpdate > 2000 && testStarted && !testCompleted) {
            console.warn("Motion data stream interrupted");
            toast.warning("Motion data stream interrupted. Keep your phone against your chest.");
          }
        }, 2000);
        
        // Clean up the interval when the test ends
        return () => clearInterval(dataCheckInterval);
        
      } catch (error) {
        console.error("Error starting sensors:", error);
        toast.error("Failed to start motion sensors. Please restart the app.");
      }
    };
    
    const sensorsPromise = startSensors();
    
    return () => {
      // Clean up listeners when component unmounts or test ends
      if (accelListenerRef.current) {
        accelListenerRef.current.remove();
        accelListenerRef.current = null;
      }
      if (orientationListenerRef.current) {
        orientationListenerRef.current.remove();
        orientationListenerRef.current = null;
      }
      if (gyroListenerRef.current) {
        gyroListenerRef.current.remove();
        gyroListenerRef.current = null;
      }
    };
  }, [testStarted, testCompleted, sensorAvailable, debugInfo.lastUpdate]);

  const resetSensorData = () => {
    setAccelerationData([]);
    setRotationData([]);
    setGyroscopeData([]);
    setMagnetometerData([]);
    setRawSensorData([]);
    lastReadingRef.current = null;
    previousOrientationRef.current = null;
    readingsCountRef.current = 0;
    abnormalReadingsCountRef.current = 0;
    hasMotionRef.current = false;
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

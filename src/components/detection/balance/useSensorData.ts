
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
        toast.error("Failed to access motion sensors. Please ensure permissions are granted.");
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
          
          console.log(`Accel data: x=${x.toFixed(3)}, y=${y.toFixed(3)}, z=${z.toFixed(3)}`);
          
          hasMotionRef.current = true;
          lastMotionTimeRef.current = timestamp;
          
          // Set current values for display
          setCurrentAccel({ x, y, z });
          
          // Calculate magnitude of acceleration vector
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          
          // Store acceleration data
          setAccelerationData(prev => {
            const newData = [...prev, magnitude];
            console.log("Acceleration data length:", newData.length);
            return newData;
          });
          
          // Increment total readings counter
          readingsCountRef.current += 1;
          
          // Create new reading
          const newReading: SensorReading = {
            timestamp,
            acceleration: { x, y, z, magnitude },
            orientation: lastReadingRef.current?.orientation || { alpha: 0, beta: 0, gamma: 0, magnitude: 0 },
            gyroscope: lastReadingRef.current?.gyroscope,
            magnetometer: lastReadingRef.current?.magnetometer
          };
          
          lastReadingRef.current = newReading;
          
          // Count abnormal readings
          if (magnitude > ACCELERATION_THRESHOLD) {
            abnormalReadingsCountRef.current += 1;
            console.log(`Abnormal acceleration detected: ${magnitude.toFixed(3)}, total abnormal: ${abnormalReadingsCountRef.current}`);
          }
          
          // Store the raw data
          setRawSensorData(prev => {
            const newRawData = [...prev, newReading];
            console.log("Raw sensor data length:", newRawData.length);
            return newRawData;
          });
          
          // Update debug info
          setDebugInfo(prev => ({
            ...prev,
            totalReadings: readingsCountRef.current,
            abnormalCount: abnormalReadingsCountRef.current,
            lastUpdate: timestamp,
            motionDetected: true
          }));
        });
        
        // Start orientation readings
        orientationListenerRef.current = await Motion.addListener('orientation', (event) => {
          const { alpha, beta, gamma } = event;
          const timestamp = Date.now();
          
          console.log(`Orientation: α=${alpha?.toFixed(1) || 'null'}, β=${beta?.toFixed(1) || 'null'}, γ=${gamma?.toFixed(1) || 'null'}`);
          
          hasMotionRef.current = true;
          lastMotionTimeRef.current = timestamp;
          
          // Set current values for display
          setCurrentRotation({ alpha: alpha || 0, beta: beta || 0, gamma: gamma || 0 });
          
          // Calculate rotation magnitude
          const rotationMagnitude = Math.sqrt(
            (alpha || 0) * (alpha || 0) + 
            (beta || 0) * (beta || 0) + 
            (gamma || 0) * (gamma || 0)
          );
          
          // Store rotation data
          setRotationData(prev => {
            const newData = [...prev, rotationMagnitude];
            console.log("Rotation data length:", newData.length);
            return newData;
          });
          
          // Calculate gyroscope-like data from orientation changes
          if (previousOrientationRef.current) {
            const gyroX = Math.abs((beta || 0) - previousOrientationRef.current.beta);
            const gyroY = Math.abs((gamma || 0) - previousOrientationRef.current.gamma);
            const gyroZ = Math.abs((alpha || 0) - previousOrientationRef.current.alpha);
            const gyroMagnitude = Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);
            
            // Store gyroscope-like data
            setGyroscopeData(prev => {
              const newData = [...prev, gyroMagnitude];
              console.log("Gyroscope data length:", newData.length);
              return newData;
            });
            
            // Update current gyro display values
            setCurrentGyro({ x: gyroX, y: gyroY, z: gyroZ });
            
            // Check for abnormal gyroscope-like readings
            if (gyroMagnitude > GYROSCOPE_THRESHOLD) {
              abnormalReadingsCountRef.current += 1;
              console.log(`Abnormal gyroscope reading: ${gyroMagnitude.toFixed(3)}`);
            }
          }
          
          // Magnetometer-like data from alpha
          if (alpha !== null) {
            const magnetoX = Math.cos((alpha * Math.PI) / 180);
            const magnetoY = Math.sin((alpha * Math.PI) / 180);
            const magnetoMagnitude = Math.sqrt(magnetoX * magnetoX + magnetoY * magnetoY);
            
            setMagnetometerData(prev => {
              const newData = [...prev, magnetoMagnitude];
              console.log("Magnetometer data length:", newData.length);
              return newData;
            });
            
            setCurrentMagnetometer({ x: magnetoX, y: magnetoY, z: 0 });
          }
          
          // Store current orientation for next gyro calculation
          previousOrientationRef.current = { alpha: alpha || 0, beta: beta || 0, gamma: gamma || 0 };
          
          // Check for abnormal rotation
          if (rotationMagnitude > ROTATION_THRESHOLD) {
            abnormalReadingsCountRef.current += 1;
            console.log(`Abnormal rotation: ${rotationMagnitude.toFixed(3)}`);
          }
        });
        
        console.log("Motion sensors started successfully");
        toast.success("Motion sensors activated");
        
      } catch (error) {
        console.error("Error starting sensors:", error);
        toast.error("Failed to start motion sensors");
        setSensorAvailable(false);
      }
    };
    
    startSensors();
    
    // Set up monitoring for data flow
    const monitoringInterval = setInterval(() => {
      const timeSinceLastMotion = Date.now() - lastMotionTimeRef.current;
      console.log(`Monitoring - Time since last motion: ${timeSinceLastMotion}ms, Total readings: ${readingsCountRef.current}`);
      
      if (timeSinceLastMotion > 3000 && testStarted && !testCompleted) {
        console.warn("Motion data stream interrupted");
        toast.warning("Motion data stream interrupted. Keep your phone against your chest.");
      }
    }, 2000);
    
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

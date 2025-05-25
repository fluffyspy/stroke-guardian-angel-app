
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
        
        // For Capacitor Motion plugin, permissions are requested automatically
        // when we start listening to events, so we just mark as available
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
          
          // Calculate magnitude
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          
          console.log(`Accel: x=${x.toFixed(3)}, y=${y.toFixed(3)}, z=${z.toFixed(3)}, mag=${magnitude.toFixed(3)}`);
          
          // Consider motion if magnitude is reasonable (including gravity ~9.8)
          if (magnitude > 0.5) { // Much more lenient threshold
            hasMotionRef.current = true;
            lastMotionTimeRef.current = timestamp;
          }
          
          // Set current values for display
          setCurrentAccel({ x, y, z });
          
          // Store acceleration data - use magnitude
          setAccelerationData(prev => {
            const newData = [...prev, magnitude];
            return newData;
          });
          
          // Increment total readings counter
          readingsCountRef.current += 1;
          
          // Count abnormal readings based on deviation from gravity baseline
          const gravityDeviation = Math.abs(magnitude - 9.8); // Deviation from standard gravity
          if (gravityDeviation > ACCELERATION_THRESHOLD) {
            abnormalReadingsCountRef.current += 1;
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
          
          // Store rotation data
          setRotationData(prev => {
            const newData = [...prev, rotationMagnitude];
            return newData;
          });
          
          // Calculate gyroscope-like data from orientation changes
          if (previousOrientationRef.current) {
            const gyroX = Math.abs(safeBeta - previousOrientationRef.current.beta);
            const gyroY = Math.abs(safeGamma - previousOrientationRef.current.gamma);
            const gyroZ = Math.abs(safeAlpha - previousOrientationRef.current.alpha);
            const gyroMagnitude = Math.sqrt(gyroX * gyroX + gyroY * gyroY + gyroZ * gyroZ);
            
            // Store gyroscope-like data
            setGyroscopeData(prev => {
              const newData = [...prev, gyroMagnitude];
              return newData;
            });
            
            // Update current gyro display values
            setCurrentGyro({ x: gyroX, y: gyroY, z: gyroZ });
            
            // Check for abnormal gyroscope-like readings
            if (gyroMagnitude > GYROSCOPE_THRESHOLD) {
              abnormalReadingsCountRef.current += 1;
            }
          }
          
          // Enhanced magnetometer-like data from alpha with more realistic values
          if (alpha !== null && alpha !== undefined) {
            const magnetoX = Math.cos((safeAlpha * Math.PI) / 180) * 50;
            const magnetoY = Math.sin((safeAlpha * Math.PI) / 180) * 50;
            const magnetoZ = safeBeta * 0.3;
            const magnetoMagnitude = Math.sqrt(magnetoX * magnetoX + magnetoY * magnetoY + magnetoZ * magnetoZ);
            
            setMagnetometerData(prev => {
              const newData = [...prev, magnetoMagnitude];
              return newData;
            });
            
            setCurrentMagnetometer({ x: magnetoX, y: magnetoY, z: magnetoZ });
          }
          
          // Store current orientation for next gyro calculation
          previousOrientationRef.current = { alpha: safeAlpha, beta: safeBeta, gamma: safeGamma };
          
          // Check for abnormal rotation
          if (rotationMagnitude > ROTATION_THRESHOLD) {
            abnormalReadingsCountRef.current += 1;
          }
          
          // Create comprehensive sensor reading
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
              x: Math.cos((safeAlpha * Math.PI) / 180) * 50,
              y: Math.sin((safeAlpha * Math.PI) / 180) * 50,
              z: safeBeta * 0.3,
              magnitude: Math.sqrt(
                Math.pow(Math.cos((safeAlpha * Math.PI) / 180) * 50, 2) +
                Math.pow(Math.sin((safeAlpha * Math.PI) / 180) * 50, 2) +
                Math.pow(safeBeta * 0.3, 2)
              )
            } : undefined
          };
          
          lastReadingRef.current = newReading;
          
          // Store the raw data
          setRawSensorData(prev => {
            const newRawData = [...prev, newReading];
            return newRawData;
          });
        });
        
        console.log("Motion sensors started successfully");
        toast.success("Motion sensors activated!");
        
      } catch (error) {
        console.error("Error starting sensors:", error);
        toast.error("Failed to start motion sensors: " + error.message);
        setSensorAvailable(false);
      }
    };
    
    startSensors();
    
    return () => {
      console.log("Cleaning up sensor listeners...");
      
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

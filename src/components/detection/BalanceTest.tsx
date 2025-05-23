import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle, Smartphone, Download } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { Motion } from '@capacitor/motion';
import { toast } from "sonner";

// Even more sensitive threshold values for medical-grade detection
const ACCELERATION_THRESHOLD = 0.15; // Extremely sensitive (m/s²)
const ROTATION_THRESHOLD = 1.5;     // Extremely sensitive (degrees/s)
const ABNORMAL_PERCENTAGE_THRESHOLD = 2; // Very low threshold to flag as abnormal (%)
const MIN_READINGS_REQUIRED = 5;    // Minimum readings required for valid test
const TEST_DURATION = 15;           // 15 seconds test duration

interface SensorReading {
  timestamp: number;
  acceleration: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  rotation: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
    magnitude: number;
  };
  gyroscope?: {
    x: number | null;
    y: number | null;
    z: number | null;
    magnitude: number;
  };
  magnetometer?: {
    x: number | null;
    y: number | null;
    z: number | null;
    magnitude: number;
  };
}

const BalanceTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(TEST_DURATION);
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const [accelerationData, setAccelerationData] = useState<number[]>([]);
  const [rotationData, setRotationData] = useState<number[]>([]);
  const [gyroscopeData, setGyroscopeData] = useState<number[]>([]);
  const [magnetometerData, setMagnetometerData] = useState<number[]>([]);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [instructionsRead, setInstructionsRead] = useState(false);
  const [rawSensorData, setRawSensorData] = useState<SensorReading[]>([]);
  const [currentAccel, setCurrentAccel] = useState({ x: 0, y: 0, z: 0 });
  const [currentRotation, setCurrentRotation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [currentGyro, setCurrentGyro] = useState({ x: 0, y: 0, z: 0 });
  const [currentMagnetometer, setCurrentMagnetometer] = useState({ x: 0, y: 0, z: 0 });
  const [showSensorReadings, setShowSensorReadings] = useState(false);
  
  // Debug state to monitor readings
  const [debugInfo, setDebugInfo] = useState({
    totalReadings: 0,
    abnormalCount: 0,
    lastUpdate: Date.now(),
    motionDetected: false,
    sensorTypes: [] as string[]
  });
  
  // Refs for cleaning up listeners
  const accelListenerRef = useRef<any>(null);
  const orientationListenerRef = useRef<any>(null);
  const gyroListenerRef = useRef<any>(null);
  const readingsCountRef = useRef<number>(0);
  const abnormalReadingsCountRef = useRef<number>(0);
  const hasMotionRef = useRef<boolean>(false);
  const sensorTypesRef = useRef<Set<string>>(new Set());
  const lastReadingRef = useRef<SensorReading | null>(null);

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
            rotation: lastReadingRef.current?.rotation || { alpha: null, beta: null, gamma: null, magnitude: 0 },
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
          
          // Magnetometer-like data from alpha (compass direction)
          if (alpha !== null) {
            setMagnetometerData(prev => [...prev, alpha]);
            
            // Update magnetometer current values
            setCurrentMagnetometer(prev => ({
              ...prev,
              x: Math.cos((alpha * Math.PI) / 180),
              y: Math.sin((alpha * Math.PI) / 180),
              z: 0
            }));
          }
          
          // Update last reading with new orientation data if it exists
          if (lastReadingRef.current) {
            lastReadingRef.current.rotation = {
              alpha, 
              beta, 
              gamma,
              magnitude: rotationMagnitude
            };
            
            // Also update magnetometer data from alpha
            if (alpha !== null) {
              lastReadingRef.current.magnetometer = {
                x: Math.cos((alpha * Math.PI) / 180),
                y: Math.sin((alpha * Math.PI) / 180),
                z: 0,
                magnitude: 1 // Unit vector magnitude
              };
            }
          }
          
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
  }, [testStarted, sensorAvailable, debugInfo.lastUpdate]);

  const startTest = () => {
    if (!sensorAvailable) {
      toast.error("Cannot start test without motion sensors");
      return;
    }
    
    setTestStarted(true);
    setTimer(TEST_DURATION);
    setAccelerationData([]);
    setRotationData([]);
    setGyroscopeData([]);
    setMagnetometerData([]);
    setRawSensorData([]);
    setInstructionsRead(false);
    setShowSensorReadings(false);
    lastReadingRef.current = null;
    
    // Instructions for user
    toast.info("Hold the phone against the center of your chest and walk normally for 15 seconds");
    
    // Start the test timer
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          completeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeTest = () => {
    setTestCompleted(true);
    
    // Stop motion sensors
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
    
    // Ensure we have at least some readings
    const totalReadings = readingsCountRef.current;
    console.log(`Test completed with ${totalReadings} total readings`);
    
    if (totalReadings < MIN_READINGS_REQUIRED) {
      toast.error("Not enough movement data collected. Please try again.");
      setResult({
        detectionType: 'balance',
        result: 'inconclusive',
        timestamp: new Date(),
        details: `Insufficient data: Only ${totalReadings} readings collected, minimum ${MIN_READINGS_REQUIRED} required.`,
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
      });
      return;
    }
    
    // Analyze the collected data with increased sensitivity
    const abnormalReadings = abnormalReadingsCountRef.current;
    const abnormalPercentage = (abnormalReadings / totalReadings) * 100;
    
    console.log(`Abnormal readings: ${abnormalReadings}/${totalReadings} (${abnormalPercentage.toFixed(1)}%)`);
    
    // Calculate variability in readings (standard deviation)
    const accelVariability = calculateStandardDeviation(accelerationData);
    const rotationVariability = calculateStandardDeviation([...rotationData, ...gyroscopeData]);
    const magnetoVariability = calculateStandardDeviation(magnetometerData);
    
    console.log(`Variability: accel=${accelVariability.toFixed(2)}, rotation=${rotationVariability.toFixed(2)}, magneto=${magnetoVariability.toFixed(2)}`);
    
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
    
    console.log(`Test result: ${balanceResult} (abnormal%=${hasAbnormalPercentage}, accelVar=${hasHighAccelVariability}, rotVar=${hasHighRotationVariability}, magVar=${hasHighMagnetoVariability}, force=${forceAbnormal})`);
    
    // Create detailed explanation
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
    
    // Set the test result
    setResult({
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
    });
  };
  
  // Calculate standard deviation as a measure of variability
  const calculateStandardDeviation = (values: number[]): number => {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => (val - mean) ** 2);
    const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    
    return Math.sqrt(variance);
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setTimer(TEST_DURATION);
    setResult(null);
    setAccelerationData([]);
    setRotationData([]);
    setGyroscopeData([]);
    setMagnetometerData([]);
    setRawSensorData([]);
    setInstructionsRead(false);
    setShowSensorReadings(false);
    lastReadingRef.current = null;
  };

  // Create a CSV file from sensor data and trigger download
  const downloadSensorData = () => {
    if (rawSensorData.length === 0) {
      toast.error("No sensor data available to download");
      return;
    }
    
    // Create CSV header with all sensor types
    let csv = "timestamp,accel_x,accel_y,accel_z,accel_magnitude,orient_alpha,orient_beta,orient_gamma,orient_magnitude";
    
    // Add gyroscope headers if we have any gyroscope data
    if (sensorTypesRef.current.has('gyroscope')) {
      csv += ",gyro_x,gyro_y,gyro_z,gyro_magnitude";
    }
    
    // Add magnetometer headers if we have any magnetometer data
    if (magnetometerData.length > 0) {
      csv += ",mag_x,mag_y,mag_z,mag_magnitude";
    }
    
    csv += "\n";
    
    // Add data rows
    rawSensorData.forEach(reading => {
      let row = [
        reading.timestamp,
        reading.acceleration.x,
        reading.acceleration.y,
        reading.acceleration.z,
        reading.acceleration.magnitude,
        reading.rotation.alpha || 0,
        reading.rotation.beta || 0,
        reading.rotation.gamma || 0,
        reading.rotation.magnitude
      ];
      
      // Add gyroscope data if available
      if (sensorTypesRef.current.has('gyroscope')) {
        row = row.concat([
          reading.gyroscope?.x || 0,
          reading.gyroscope?.y || 0, 
          reading.gyroscope?.z || 0,
          reading.gyroscope?.magnitude || 0
        ]);
      }
      
      // Add magnetometer data if available
      if (magnetometerData.length > 0) {
        row = row.concat([
          reading.magnetometer?.x || 0,
          reading.magnetometer?.y || 0,
          reading.magnetometer?.z || 0, 
          reading.magnetometer?.magnitude || 0
        ]);
      }
      
      csv += row.join(",") + "\n";
    });
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `balance-test-data-${new Date().toISOString()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Sensor data downloaded as CSV");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Balance Test</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Stroke Detection - Balance Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!testStarted ? (
            <div className="text-center py-8">
              <Activity className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Balance Test</h2>
              <p className="mb-4 text-gray-600">
                This test uses your phone's motion sensors to check for balance issues. Please ensure:
              </p>
              <ul className="text-left list-disc mb-4 ml-6">
                <li>You are in a safe environment with nothing to trip over</li>
                <li>Someone is nearby to assist if needed</li>
                <li>You have space to walk comfortably</li>
              </ul>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg text-blue-700 text-left">
                <p className="font-medium">Instructions:</p>
                <ol className="list-decimal ml-6 mt-2">
                  <li>Hold your phone firmly against the <strong>center of your chest</strong></li>
                  <li className="mt-1">Keep both hands on the sides of the phone</li>
                  <li className="mt-1">When ready, press "Start Test"</li>
                  <li className="mt-1">Walk normally for 15 seconds</li>
                  <li className="mt-1">Try to move in different ways to test balance detection</li>
                  <li className="mt-1">Stay in place when the timer ends</li>
                  <li className="mt-1">The app will analyze your walking balance</li>
                </ol>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-center mb-4">
                  <Smartphone className="h-16 w-16 text-primary mr-2" />
                  <div className="w-20 h-16 border-2 border-primary rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">CHEST</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <Button 
                  onClick={() => setInstructionsRead(true)}
                  className="mt-4 mb-2"
                  disabled={instructionsRead}
                >
                  {instructionsRead ? "Instructions Read ✓" : "I've Read The Instructions"}
                </Button>
                <Button 
                  onClick={startTest} 
                  className="mt-2" 
                  disabled={!sensorAvailable || !instructionsRead}
                >
                  Start Test
                </Button>
                {!sensorAvailable && (
                  <p className="mt-2 text-red-500">
                    Motion sensors not available on this device. This test requires accelerometer and gyroscope.
                  </p>
                )}
                {sensorAvailable && debugInfo.sensorTypes.length > 0 && (
                  <p className="mt-2 text-green-600 text-xs">
                    Available sensors: {debugInfo.sensorTypes.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative">
                {!testCompleted ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{timer}</div>
                    <p className="text-gray-600">Hold phone against center of chest and walk normally</p>
                    
                    {/* Live sensor readings display with better visualization */}
                    <div className="mt-6 bg-gray-50 p-3 rounded-lg w-full max-w-md mx-auto">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Live Sensor Readings</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded shadow-sm">
                          <div className="font-medium">Acceleration</div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            <div>X: {currentAccel.x.toFixed(2)}</div>
                            <div>Y: {currentAccel.y.toFixed(2)}</div>
                            <div>Z: {currentAccel.z.toFixed(2)}</div>
                          </div>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, Math.sqrt(currentAccel.x**2 + currentAccel.y**2 + currentAccel.z**2) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm">
                          <div className="font-medium">Orientation</div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            <div>α: {currentRotation.alpha.toFixed(0)}°</div>
                            <div>β: {currentRotation.beta.toFixed(0)}°</div>
                            <div>γ: {currentRotation.gamma.toFixed(0)}°</div>
                          </div>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, Math.sqrt(currentRotation.alpha**2 + currentRotation.beta**2 + currentRotation.gamma**2) / 3)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Gyroscope data if available */}
                      {sensorTypesRef.current.has('gyroscope') && (
                        <div className="bg-white p-2 rounded shadow-sm mt-2">
                          <div className="font-medium">Gyroscope</div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            <div>X: {currentGyro.x.toFixed(2)}</div>
                            <div>Y: {currentGyro.y.toFixed(2)}</div>
                            <div>Z: {currentGyro.z.toFixed(2)}</div>
                          </div>
                          <div className="mt-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, Math.sqrt(currentGyro.x**2 + currentGyro.y**2 + currentGyro.z**2) * 10)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {/* Debug info counter */}
                      <div className="mt-2 text-xs text-gray-500">
                        <div>Total readings: {debugInfo.totalReadings}</div>
                        <div>Abnormal movements: {debugInfo.abnormalCount}</div>
                        <div className="text-xs mt-1">
                          <span className={debugInfo.motionDetected ? "text-green-500" : "text-red-500"}>
                            {debugInfo.motionDetected ? "✓ Motion detected" : "✗ No motion detected"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Visual indicators for motion detection */}
                    <div className="mt-4 flex justify-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Movement</div>
                        <div className={`h-4 w-4 rounded-full mx-auto ${
                          accelerationData.length > 0 && 
                          accelerationData[accelerationData.length - 1] > ACCELERATION_THRESHOLD 
                            ? 'bg-yellow-500 animate-ping' 
                            : 'bg-green-500'
                        }`}></div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Balance</div>
                        <div className={`h-4 w-4 rounded-full mx-auto ${
                          (rotationData.length > 0 && 
                          rotationData[rotationData.length - 1] > ROTATION_THRESHOLD) ||
                          (gyroscopeData.length > 0 &&
                          gyroscopeData[gyroscopeData.length - 1] > ROTATION_THRESHOLD)
                            ? 'bg-yellow-500 animate-ping' 
                            : 'bg-green-500'
                        }`}></div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Readings</div>
                        <div className="text-xs font-medium">{readingsCountRef.current}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="text-center p-6 bg-background rounded-lg shadow-lg text-foreground max-w-md w-full">
                      {result?.result === 'normal' ? (
                        <div>
                          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                          <h3 className="text-xl font-bold mb-2">Balance Test Passed</h3>
                          <p>Your balance appears normal.</p>
                          {result?.details && (
                            <div className="mt-2 text-sm text-left overflow-y-auto max-h-36">
                              {result.details.split('\n').map((line, index) => (
                                <p key={index} className="mb-1">{line}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : result?.result === 'abnormal' ? (
                        <div>
                          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                          <h3 className="text-xl font-bold mb-2">Balance Concerns Detected</h3>
                          <p>The test indicates potential balance issues.</p>
                          {result?.details && (
                            <div className="mt-2 text-sm text-left overflow-y-auto max-h-36">
                              {result.details.split('\n').map((line, index) => (
                                <p key={index} className="mb-1">{line}</p>
                              ))}
                            </div>
                          )}
                          <p className="mt-4 text-red-500 font-medium">
                            Please consider seeking medical attention.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                          <h3 className="text-xl font-bold mb-2">Test Inconclusive</h3>
                          <p>Not enough data was collected to make a determination.</p>
                          {result?.details && (
                            <div className="mt-2 text-sm text-left overflow-y-auto max-h-36">
                              {result.details.split('\n').map((line, index) => (
                                <p key={index} className="mb-1">{line}</p>
                              ))}
                            </div>
                          )}
                          <p className="mt-4">
                            Please try again and ensure the phone can detect your movement.
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex items-center" 
                          onClick={() => setShowSensorReadings(!showSensorReadings)}
                        >
                          {showSensorReadings ? "Hide Raw Sensor Data" : "Show Raw Sensor Data"}
                        </Button>
                        
                        {showSensorReadings && (
                          <div className="mt-2 bg-gray-50 p-2 rounded text-xs overflow-y-auto max-h-40 text-left">
                            <h4 className="font-medium mb-1">Sample of collected data:</h4>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                              {rawSensorData.slice(-10).map((reading, idx) => (
                                <div key={idx} className="bg-white p-1 rounded">
                                  <div>Accel: {reading.acceleration.magnitude.toFixed(2)} m/s²</div>
                                  <div>Rotation: {reading.rotation.magnitude.toFixed(2)}°</div>
                                  {reading.gyroscope && (
                                    <div>Gyro: {reading.gyroscope.magnitude.toFixed(2)}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-2">
                              <Button 
                                size="sm"
                                variant="secondary" 
                                className="w-full flex items-center justify-center"
                                onClick={downloadSensorData}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download Complete Data (CSV)
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {!testCompleted && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Time remaining:</span>
                    <span>{timer} seconds</span>
                  </div>
                  <Progress value={((TEST_DURATION - timer) / TEST_DURATION) * 100} />
                </div>
              )}
            </div>
          )}
        </CardContent>
        {testCompleted && (
          <CardFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={resetTest}>
                Restart Test
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BalanceTest;

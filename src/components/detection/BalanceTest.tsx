
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle, Smartphone, Download } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { Motion } from '@capacitor/motion';
import { toast } from "sonner";

// More sensitive threshold values for better detection
const ACCELERATION_THRESHOLD = 1.2; // Reduced from 2.5 for better sensitivity (m/s²)
const ROTATION_THRESHOLD = 15; // Reduced from 30 for better sensitivity (degrees/s)
const TEST_DURATION = 15; // 15 seconds test duration

interface SensorReading {
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

const BalanceTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(TEST_DURATION);
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const [accelerationData, setAccelerationData] = useState<number[]>([]);
  const [rotationData, setRotationData] = useState<number[]>([]);
  const [magnetometerData, setMagnetometerData] = useState<number[]>([]);
  const [sensorAvailable, setSensorAvailable] = useState(true);
  const [instructionsRead, setInstructionsRead] = useState(false);
  const [rawSensorData, setRawSensorData] = useState<SensorReading[]>([]);
  const [currentAccel, setCurrentAccel] = useState({ x: 0, y: 0, z: 0 });
  const [currentOrientation, setCurrentOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [showSensorReadings, setShowSensorReadings] = useState(false);
  
  // Refs for cleaning up listeners
  const accelListenerRef = useRef<any>(null);
  const orientationListenerRef = useRef<any>(null);

  // Check for sensor availability
  useEffect(() => {
    const checkSensors = async () => {
      try {
        // Test if we can access the accelerometer
        const tempListener = await Motion.addListener('accel', () => {});
        if (tempListener) {
          setSensorAvailable(true);
          tempListener.remove();
        }
      } catch (error) {
        console.error("Error checking sensor availability:", error);
        setSensorAvailable(false);
        toast.error("Failed to access motion sensors");
      }
    };
    
    checkSensors();
  }, []);

  // Start collecting sensor data when test starts
  useEffect(() => {
    if (!testStarted || !sensorAvailable) return;
    
    let abnormalReadingsCount = 0;
    let totalReadings = 0;
    const newRawData: SensorReading[] = [];
    
    const startSensors = async () => {
      try {
        // Start accelerometer readings
        accelListenerRef.current = await Motion.addListener('accel', (event) => {
          const { x, y, z } = event.acceleration;
          
          // Set current values for display
          setCurrentAccel({ x, y, z });
          
          // Calculate magnitude of acceleration vector
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          setAccelerationData(prev => [...prev, magnitude]);
          
          // Store raw data
          newRawData.push({
            timestamp: Date.now(),
            acceleration: { x, y, z, magnitude },
            orientation: { ...currentOrientation, magnitude: 0 } // Will be updated by orientation listener
          });
          
          // Count abnormal readings
          totalReadings++;
          if (magnitude > ACCELERATION_THRESHOLD) {
            abnormalReadingsCount++;
          }
          
          // Update raw sensor data state
          setRawSensorData(prev => [...prev, newRawData[newRawData.length - 1]]);
          
          // Debug log
          console.log(`Acceleration: x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)}, mag=${magnitude.toFixed(2)}`);
        });
        
        // Start orientation readings
        orientationListenerRef.current = await Motion.addListener('orientation', (event) => {
          const { alpha, beta, gamma } = event;
          
          // Set current values for display
          setCurrentOrientation({ alpha: alpha || 0, beta: beta || 0, gamma: gamma || 0 });
          
          // Calculate a measure of rotation from orientation values
          const rotationMagnitude = Math.sqrt(
            (alpha || 0) * (alpha || 0) + 
            (beta || 0) * (beta || 0) + 
            (gamma || 0) * (gamma || 0)
          );
          
          setRotationData(prev => [...prev, rotationMagnitude]);
          
          // Add orientation data to the latest reading
          if (newRawData.length > 0) {
            const lastIndex = newRawData.length - 1;
            newRawData[lastIndex].orientation = {
              alpha, 
              beta, 
              gamma,
              magnitude: rotationMagnitude
            };
          }
          
          if (rotationMagnitude > ROTATION_THRESHOLD) {
            abnormalReadingsCount++;
          }
          
          // Store magnetometer-like data
          setMagnetometerData(prev => [...prev, alpha || 0]);
          
          // Debug log
          console.log(`Orientation: α=${alpha?.toFixed(2) || 'null'}, β=${beta?.toFixed(2) || 'null'}, γ=${gamma?.toFixed(2) || 'null'}, mag=${rotationMagnitude.toFixed(2)}`);
        });
      } catch (error) {
        console.error("Error starting sensors:", error);
        toast.error("Failed to start motion sensors");
      }
    };
    
    startSensors();
    
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
    };
  }, [testStarted, sensorAvailable]);

  const startTest = () => {
    if (!sensorAvailable) {
      toast.error("Cannot start test without motion sensors");
      return;
    }
    
    setTestStarted(true);
    setTimer(TEST_DURATION);
    setAccelerationData([]);
    setRotationData([]);
    setMagnetometerData([]);
    setRawSensorData([]);
    
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
    
    // Analyze the collected data
    const abnormalAccelCount = accelerationData.filter(value => value > ACCELERATION_THRESHOLD).length;
    const abnormalRotationCount = rotationData.filter(value => value > ROTATION_THRESHOLD).length;
    
    // Calculate percentage of abnormal readings
    const totalReadings = accelerationData.length + rotationData.length;
    const abnormalReadings = abnormalAccelCount + abnormalRotationCount;
    const abnormalPercentage = totalReadings > 0 ? (abnormalReadings / totalReadings) * 100 : 0;
    
    // Calculate variability in readings (standard deviation)
    const accelVariability = calculateStandardDeviation(accelerationData);
    const rotationVariability = calculateStandardDeviation(rotationData);
    const magnetoVariability = calculateStandardDeviation(magnetometerData);
    
    // Determine result based on threshold (lowered to 15% for better sensitivity)
    const balanceResult = abnormalPercentage > 15 || 
                        accelVariability > 1.0 || 
                        rotationVariability > 10 ? 'abnormal' : 'normal';
    
    // Create detailed explanation
    let detailedExplanation = `Analyzed ${totalReadings} motion readings over 15 seconds.\n`;
    
    if (balanceResult === 'abnormal') {
      detailedExplanation += `${abnormalPercentage.toFixed(1)}% of readings showed balance irregularities.\n`;
      
      if (abnormalAccelCount > 0) {
        detailedExplanation += `Detected ${abnormalAccelCount} instances of abnormal acceleration (above ${ACCELERATION_THRESHOLD} m/s²).\n`;
      }
      
      if (abnormalRotationCount > 0) {
        detailedExplanation += `Detected ${abnormalRotationCount} instances of abnormal rotation (above ${ROTATION_THRESHOLD}°/s).\n`;
      }
      
      detailedExplanation += `Movement variability: Acceleration (${accelVariability.toFixed(2)} m/s²), `;
      detailedExplanation += `Rotation (${rotationVariability.toFixed(2)}°/s).\n`;
      detailedExplanation += `These patterns may indicate balance issues consistent with potential stroke symptoms.`;
    } else {
      detailedExplanation += `Movement patterns appear stable and within normal range.\n`;
      detailedExplanation += `Movement variability: Acceleration (${accelVariability.toFixed(2)} m/s²), `;
      detailedExplanation += `Rotation (${rotationVariability.toFixed(2)}°/s).\n`;
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
        gyroscope: rotationData,
        magnetometer: magnetometerData,
        abnormalReadingsPercentage: abnormalPercentage,
        variability: {
          acceleration: accelVariability,
          rotation: rotationVariability,
          magnetic: magnetoVariability
        }
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
    setMagnetometerData([]);
    setRawSensorData([]);
    setInstructionsRead(false);
    setShowSensorReadings(false);
  };

  // Create a CSV file from sensor data and trigger download
  const downloadSensorData = () => {
    if (rawSensorData.length === 0) {
      toast.error("No sensor data available to download");
      return;
    }
    
    // Create CSV header
    let csv = "timestamp,accel_x,accel_y,accel_z,accel_magnitude,orientation_alpha,orientation_beta,orientation_gamma,orientation_magnitude\n";
    
    // Add data rows
    rawSensorData.forEach(reading => {
      csv += [
        reading.timestamp,
        reading.acceleration.x,
        reading.acceleration.y,
        reading.acceleration.z,
        reading.acceleration.magnitude,
        reading.orientation.alpha || 0,
        reading.orientation.beta || 0,
        reading.orientation.gamma || 0,
        reading.orientation.magnitude
      ].join(",") + "\n";
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
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative">
                {!testCompleted ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{timer}</div>
                    <p className="text-gray-600">Hold phone against center of chest and walk normally</p>
                    
                    {/* Live sensor readings display */}
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
                        </div>
                        <div className="bg-white p-2 rounded shadow-sm">
                          <div className="font-medium">Orientation</div>
                          <div className="grid grid-cols-3 gap-1 mt-1">
                            <div>α: {currentOrientation.alpha.toFixed(2)}</div>
                            <div>β: {currentOrientation.beta.toFixed(2)}</div>
                            <div>γ: {currentOrientation.gamma.toFixed(2)}</div>
                          </div>
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
                          rotationData.length > 0 && 
                          rotationData[rotationData.length - 1] > ROTATION_THRESHOLD 
                            ? 'bg-yellow-500 animate-ping' 
                            : 'bg-green-500'
                        }`}></div>
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
                      ) : (
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
                                  <div>Rotation: {reading.orientation.magnitude.toFixed(2)}°</div>
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


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { Motion } from '@capacitor/motion';
import { toast } from "sonner";

// Updated threshold values and test duration
const ACCELERATION_THRESHOLD = 2.5; // m/s^2
const ROTATION_THRESHOLD = 30; // degrees/s
const TEST_DURATION = 15; // Changed to 15 seconds as per requirement

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

  // Check for sensor availability
  useEffect(() => {
    const checkSensors = async () => {
      try {
        // Instead of using isAvailable, we'll just attempt to add a listener temporarily
        // to check if the sensors work
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
    
    let accelListener: any = null;
    let orientationListener: any = null;
    let abnormalReadingsCount = 0;
    let totalReadings = 0;
    
    const startSensors = async () => {
      try {
        // Start accelerometer readings
        accelListener = await Motion.addListener('accel', (event) => {
          const { x, y, z } = event.acceleration;
          // Calculate magnitude of acceleration vector
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          setAccelerationData(prev => [...prev, magnitude]);
          
          totalReadings++;
          if (magnitude > ACCELERATION_THRESHOLD) {
            abnormalReadingsCount++;
          }
        });
        
        // Start orientation readings (instead of rotation which doesn't exist in Capacitor API)
        orientationListener = await Motion.addListener('orientation', (event) => {
          const { alpha, beta, gamma } = event;
          // Calculate a measure of rotation from orientation values
          const rotationMagnitude = Math.sqrt(
            (alpha || 0) * (alpha || 0) + 
            (beta || 0) * (beta || 0) + 
            (gamma || 0) * (gamma || 0)
          );
          setRotationData(prev => [...prev, rotationMagnitude]);
          
          if (rotationMagnitude > ROTATION_THRESHOLD) {
            abnormalReadingsCount++;
          }
          
          // Store magnetometer-like data (orientation can help approximate this)
          setMagnetometerData(prev => [...prev, alpha || 0]);
        });
      } catch (error) {
        console.error("Error starting sensors:", error);
        toast.error("Failed to start motion sensors");
      }
    };
    
    startSensors();
    
    return () => {
      // Clean up listeners when component unmounts or test ends
      if (accelListener) accelListener.remove();
      if (orientationListener) orientationListener.remove();
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
    
    // Determine result based on threshold (e.g., 20% abnormal readings indicates balance issues)
    const balanceResult = abnormalPercentage > 20 || 
                        accelVariability > 1.5 || 
                        rotationVariability > 15 ? 'abnormal' : 'normal';
    
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
        abnormalReadingsPercentage: abnormalPercentage
      }
    });
    
    // Stop motion sensors
    Motion.removeAllListeners();
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
    setInstructionsRead(false);
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
                    <div className="text-center p-6 bg-background rounded-lg shadow-lg text-foreground">
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

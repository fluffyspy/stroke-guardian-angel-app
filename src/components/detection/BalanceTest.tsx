
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { Motion } from '@capacitor/motion';
import { toast } from "@/components/ui/sonner";

// Threshold values for balance detection
const ACCELERATION_THRESHOLD = 2.5; // m/s^2
const ROTATION_THRESHOLD = 30; // degrees/s

const BalanceTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(10); // Changed to 10 seconds
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const [accelerationData, setAccelerationData] = useState<number[]>([]);
  const [rotationData, setRotationData] = useState<number[]>([]);
  const [sensorAvailable, setSensorAvailable] = useState(true);

  // Check for sensor availability
  useEffect(() => {
    const checkSensors = async () => {
      try {
        const { isAvailable } = await Motion.isAvailable();
        setSensorAvailable(isAvailable);
        
        if (!isAvailable) {
          toast.error("Motion sensors not available on this device");
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
    let rotationListener: any = null;
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
        
        // Start gyroscope readings
        rotationListener = await Motion.addListener('rotation', (event) => {
          const { alpha, beta, gamma } = event.rotationRate;
          // Calculate magnitude of rotation
          const rotationMagnitude = Math.sqrt(alpha * alpha + beta * beta + gamma * gamma);
          setRotationData(prev => [...prev, rotationMagnitude]);
          
          if (rotationMagnitude > ROTATION_THRESHOLD) {
            abnormalReadingsCount++;
          }
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
      if (rotationListener) rotationListener.remove();
    };
  }, [testStarted, sensorAvailable]);

  const startTest = () => {
    if (!sensorAvailable) {
      toast.error("Cannot start test without motion sensors");
      return;
    }
    
    setTestStarted(true);
    setTimer(10);
    setAccelerationData([]);
    setRotationData([]);
    
    // Instructions for user
    toast.info("Hold the phone against your chest and walk normally for 10 seconds");
    
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
    
    // Determine result based on threshold (e.g., 20% abnormal readings indicates balance issues)
    const balanceResult = abnormalPercentage > 20 ? 'abnormal' : 'normal';
    
    // Set the test result
    setResult({
      detectionType: 'balance',
      result: balanceResult,
      timestamp: new Date(),
      details: `Analyzed ${totalReadings} motion readings, ${abnormalPercentage.toFixed(1)}% showed balance irregularities.`
    });
    
    // Stop motion sensors
    Motion.removeAllListeners();
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setTimer(10);
    setResult(null);
    setAccelerationData([]);
    setRotationData([]);
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
                <ul className="text-left list-disc list-inside mt-2">
                  <li>You are in a safe environment with nothing to trip over</li>
                  <li>Someone is nearby to assist if needed</li>
                  <li>You have space to walk comfortably</li>
                </ul>
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg text-blue-700 text-left">
                <p className="font-medium">Instructions:</p>
                <ol className="list-decimal list-inside mt-1">
                  <li>Hold your phone against your chest with both hands</li>
                  <li>When ready, press "Start Test"</li>
                  <li>Walk normally for 10 seconds</li>
                  <li>Stay in place when the timer ends</li>
                  <li>The app will analyze your walking balance</li>
                </ol>
              </div>
              <Button 
                onClick={startTest} 
                className="mt-6" 
                disabled={!sensorAvailable}
              >
                Start Test
              </Button>
              {!sensorAvailable && (
                <p className="mt-2 text-red-500">
                  Motion sensors not available on this device. This test requires accelerometer and gyroscope.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative">
                {!testCompleted ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{timer}</div>
                    <p className="text-gray-600">Hold phone against chest and walk normally</p>
                    
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
                            <p className="mt-2 text-sm text-gray-500">{result.details}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                          <h3 className="text-xl font-bold mb-2">Balance Concerns Detected</h3>
                          <p>The test indicates potential balance issues.</p>
                          {result?.details && (
                            <p className="mt-2 text-sm text-gray-500">{result.details}</p>
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
                  <Progress value={((10 - timer) / 10) * 100} />
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

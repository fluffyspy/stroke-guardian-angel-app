
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Phone, AlertTriangle } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Motion } from '@capacitor/motion';

// Import refactored components and utilities
import { TEST_DURATION, analyzeBalanceData, MotionData, GaitAnalysisResult, analyzeGaitPattern } from "./balance/balanceUtils";

const BalanceTest = () => {
  const navigate = useNavigate();
  const { toast: shadcnToast } = useToast();
  const [isTestActive, setIsTestActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testProgress, setTestProgress] = useState(0);
  const [accelerometerData, setAccelerometerData] = useState<MotionData[]>([]);
  const [gyroscopeData, setGyroscopeData] = useState<MotionData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<GaitAnalysisResult | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  
  // Use ref to store interval ID for proper cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const accelListenerRef = useRef<any>(null);
  const gyroListenerRef = useRef<any>(null);

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopMotionListeners();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isTestActive) {
      startGaitTracking();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown, isTestActive]);

  const stopMotionListeners = async () => {
    try {
      if (accelListenerRef.current) {
        await accelListenerRef.current.remove();
        accelListenerRef.current = null;
      }
      if (gyroListenerRef.current) {
        await gyroListenerRef.current.remove();
        gyroListenerRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping motion listeners:', error);
    }
  };

  const startTest = async () => {
    setIsTestActive(true);
    setCountdown(5);
    setTestProgress(0);
    setAccelerometerData([]);
    setGyroscopeData([]);
    setShowResults(false);
    setShowEmergency(false);
    setTestResult(null);
    setResult(null);
    
    toast("Gait Balance Test Starting - Prepare to walk normally with phone held against chest");
  };

  const startGaitTracking = async () => {
    try {
      setAccelerometerData([]);
      setGyroscopeData([]);

      console.log('Starting motion tracking...');

      // Start accelerometer
      accelListenerRef.current = await Motion.addListener('accel', (event) => {
        const data: MotionData = {
          x: event.acceleration.x,
          y: event.acceleration.y,
          z: event.acceleration.z,
          timestamp: Date.now()
        };
        console.log('Accel data:', data);
        setAccelerometerData(prev => [...prev, data]);
      });

      // Start gyroscope
      gyroListenerRef.current = await Motion.addListener('orientation', (event) => {
        const data: MotionData = {
          x: event.alpha || 0,
          y: event.beta || 0,
          z: event.gamma || 0,
          timestamp: Date.now()
        };
        console.log('Gyro data:', data);
        setGyroscopeData(prev => [...prev, data]);
      });

      toast("Start Walking - Walk naturally for 15 seconds with phone against your chest");

      // Run test for 15 seconds
      const testDuration = 15000;
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / testDuration) * 100, 100);
        setTestProgress(progress);
        
        if (elapsed >= testDuration) {
          clearInterval(progressInterval);
          stopGaitTest();
        }
      }, 100);

    } catch (error) {
      console.error('Failed to start motion tracking:', error);
      toast("Error: Failed to start motion sensors. Using simulated data for demo.");
      
      // Fallback to simulated data for web testing
      simulateMotionData();
    }
  };

  const simulateMotionData = () => {
    console.log('Using simulated motion data...');
    const testDuration = 15000;
    const startTime = Date.now();
    
    const simulationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / testDuration) * 100, 100);
      setTestProgress(progress);
      
      // Generate realistic motion data
      const accelData: MotionData = {
        x: (Math.random() - 0.5) * 4 + Math.sin(elapsed / 500) * 2,
        y: (Math.random() - 0.5) * 4 + Math.cos(elapsed / 600) * 1.5,
        z: 9.8 + (Math.random() - 0.5) * 3,
        timestamp: Date.now()
      };
      
      const gyroData: MotionData = {
        x: (Math.random() - 0.5) * 0.3,
        y: (Math.random() - 0.5) * 0.3,
        z: (Math.random() - 0.5) * 0.2,
        timestamp: Date.now()
      };
      
      setAccelerometerData(prev => [...prev, accelData]);
      setGyroscopeData(prev => [...prev, gyroData]);
      
      if (elapsed >= testDuration) {
        clearInterval(simulationInterval);
        stopGaitTest();
      }
    }, 50);
  };

  const stopGaitTest = async () => {
    console.log('Stopping gait test...');
    try {
      await stopMotionListeners();
      setIsAnalyzing(true);
      
      console.log('Accel data points:', accelerometerData.length);
      console.log('Gyro data points:', gyroscopeData.length);
      
      // Analyze the gait data locally first
      const gaitResult = analyzeGaitPattern(accelerometerData, gyroscopeData);
      setTestResult(gaitResult);
      
      // Also try backend analysis
      const backendResult = await analyzeBalanceData(accelerometerData, gyroscopeData);
      setResult(backendResult);
      
      console.log('Analysis result:', gaitResult);
      
      if (gaitResult.isAbnormal) {
        setShowEmergency(true);
        toast("Abnormal Gait Detected - Emergency assistance activated");
      } else {
        setShowResults(true);
        toast("Gait Analysis Complete - Normal walking pattern detected");
      }

      setIsAnalyzing(false);
      setIsTestActive(false);

    } catch (error) {
      console.error('Failed to stop gait tracking:', error);
      setIsAnalyzing(false);
    }
  };

  const callEmergencyServices = () => {
    window.open('tel:911');
    shadcnToast({
      title: "Emergency Call",
      description: "Calling emergency services...",
      variant: "destructive",
    });
  };

  const goToEmergencyPage = () => {
    navigate('/emergency');
  };

  const resetTest = () => {
    // Clear interval when resetting
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsTestActive(false);
    setShowResults(false);
    setShowEmergency(false);
    setCountdown(0);
    setTestProgress(0);
    setResult(null);
    setTestResult(null);
    setAccelerometerData([]);
    setGyroscopeData([]);
    
    console.log("Test reset");
  };

  if (showEmergency) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-red-800 text-2xl">Abnormal Gait Detected</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-red-700 text-center mb-6">
                Your walking pattern shows irregularities that may indicate balance issues. 
                Please seek immediate medical attention.
              </p>
              
              <Button 
                onClick={callEmergencyServices}
                variant="destructive" 
                size="lg" 
                className="w-full text-lg py-4"
              >
                <Phone className="h-6 w-6 mr-2" />
                Call 911 Emergency Services
              </Button>
              
              <Button 
                onClick={goToEmergencyPage}
                variant="outline" 
                className="w-full border-red-300 text-red-700"
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Emergency Assistance Page
              </Button>
              
              {testResult && (
                <div className="bg-red-100 p-4 rounded-lg mt-4">
                  <h4 className="font-semibold text-red-800 mb-2">Test Results:</h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>Acceleration Change: {testResult.accelerationChange.toFixed(2)}</p>
                    <p>Angular Tilt: {testResult.angularTilt.toFixed(2)}</p>
                    <p>Overall Score: {testResult.overallScore.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={resetTest} className="w-full">
                Restart Test
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Balance Test</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-blue-800 flex items-center justify-center">
              <Activity className="h-6 w-6 mr-2" />
              Quick Gait Balance Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isTestActive && !showResults && (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  This test analyzes your walking pattern to detect balance abnormalities. 
                  Simply hold your phone against your chest and walk naturally for 15 seconds.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
                  <ol className="text-sm text-blue-700 space-y-2 text-left">
                    <li>1. Hold phone firmly against your chest</li>
                    <li>2. Walk at your normal pace</li>
                    <li>3. Walk in a straight line if possible</li>
                    <li>4. Keep the phone steady against your body</li>
                  </ol>
                </div>
              </div>
            )}

            {countdown > 0 && (
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">{countdown}</div>
                <p className="text-gray-600">Get ready to walk...</p>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Position your phone against your chest and prepare to walk naturally
                  </p>
                </div>
              </div>
            )}

            {isTestActive && countdown === 0 && (
              <div className="text-center space-y-4">
                <div className="text-2xl font-bold text-green-600">
                  Walking Test Active
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${testProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  Keep walking naturally: {Math.round(15 - (testProgress * 0.15))}s remaining
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">
                    📱 Keep phone against chest<br/>
                    👟 Walk at normal pace<br/>
                    ➡️ Walk in straight line
                  </p>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">Analyzing gait pattern...</p>
                <p className="text-sm text-gray-500">Processing sensor data...</p>
              </div>
            )}

            {showResults && testResult && (
              <div className="space-y-4">
                <h3 className="font-semibold text-center text-green-800">✅ Normal Gait Pattern</h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Test Results:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Acceleration Change:</span>
                      <span className="font-medium">{testResult.accelerationChange.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Angular Tilt:</span>
                      <span className="font-medium">{testResult.angularTilt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Overall Score:</span>
                      <span className="font-bold text-green-600">{testResult.overallScore.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Your walking pattern appears normal with no significant balance abnormalities detected.
                  </p>
                </div>
              </div>
            )}

            <Button 
              onClick={startTest}
              disabled={isTestActive || isAnalyzing}
              className="w-full"
            >
              {isTestActive ? 'Test in Progress...' : showResults ? 'Restart Test' : 'Start Gait Test'}
            </Button>
          </CardContent>
          {showResults && (
            <CardFooter className="flex justify-between w-full">
              <Button variant="outline" onClick={resetTest}>
                Restart Test
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BalanceTest;

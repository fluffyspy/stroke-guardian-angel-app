
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { StrokeDetectionResult } from "@/types";
import { toast } from "sonner";

// Import refactored components and utilities
import { TEST_DURATION, analyzeBalanceData } from "./balance/balanceUtils";
import { useSensorData } from "./balance/useSensorData";
import { InstructionsScreen } from "./balance/InstructionsScreen";
import { LiveTestScreen } from "./balance/LiveTestScreen";
import { ResultScreen } from "./balance/ResultScreen";
import { SensorDiagnostics } from "./balance/SensorDiagnostics";

const BalanceTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(TEST_DURATION);
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const [instructionsRead, setInstructionsRead] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  
  // Use ref to store interval ID for proper cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use our custom hook to handle sensor data
  const {
    accelerationData,
    rotationData,
    gyroscopeData,
    magnetometerData,
    rawSensorData,
    currentAccel,
    currentRotation,
    currentGyro,
    debugInfo,
    sensorAvailable,
    resetSensorData,
    readingsCountRef,
    abnormalReadingsCountRef,
    sensorTypesRef
  } = useSensorData(testStarted, testCompleted);

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTest = () => {
    if (!sensorAvailable) {
      toast.error("Cannot start test without motion sensors");
      setShowDiagnostics(true);
      return;
    }
    
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    setTestStarted(true);
    setTimer(TEST_DURATION);
    resetSensorData();
    setInstructionsRead(false);
    
    // Instructions for user
    toast.info("Hold the phone against the center of your chest and walk normally for 15 seconds");
    
    console.log("Starting timer countdown from", TEST_DURATION);
    
    // Start the test timer - this should continue regardless of sensor issues
    intervalRef.current = setInterval(() => {
      setTimer(prevTimer => {
        console.log("Timer tick, current value:", prevTimer, "Readings collected:", readingsCountRef.current);
        
        if (prevTimer <= 1) {
          console.log("Timer reached 0, completing test with", readingsCountRef.current, "readings");
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          completeTest();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const completeTest = () => {
    console.log("Completing test with", readingsCountRef.current, "total readings");
    setTestCompleted(true);
    
    // Ensure we have the latest data counts
    const finalReadingsCount = readingsCountRef.current;
    const finalAbnormalCount = abnormalReadingsCountRef.current;
    
    console.log("Final analysis - Readings:", finalReadingsCount, "Abnormal:", finalAbnormalCount);
    
    // Analyze collected data and set result
    const result = analyzeBalanceData(
      finalReadingsCount,
      finalAbnormalCount,
      accelerationData,
      rotationData,
      gyroscopeData,
      magnetometerData,
      rawSensorData
    );
    
    console.log("Analysis result:", result);
    setResult(result);
  };

  const resetTest = () => {
    // Clear interval when resetting
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTestStarted(false);
    setTestCompleted(false);
    setTimer(TEST_DURATION);
    setResult(null);
    resetSensorData();
    setInstructionsRead(false);
    setShowDiagnostics(false);
    
    console.log("Test reset");
  };

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true);
    setShowDiagnostics(false);
    toast.success("Sensors are ready! You can now start the balance test.");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Balance Test</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            {showDiagnostics ? "Hide" : "Show"} Diagnostics
          </Button>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {showDiagnostics && (
        <div className="mb-6">
          <SensorDiagnostics onPermissionsGranted={handlePermissionsGranted} />
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Stroke Detection - Balance Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!testStarted ? (
            <InstructionsScreen
              onReadInstructions={() => setInstructionsRead(true)}
              onStartTest={startTest}
              instructionsRead={instructionsRead}
              sensorAvailable={sensorAvailable}
              sensorTypes={debugInfo.sensorTypes}
            />
          ) : (
            <div className="space-y-6 relative">
              {!testCompleted ? (
                <LiveTestScreen
                  timer={timer}
                  currentAccel={currentAccel}
                  currentRotation={currentRotation}
                  currentGyro={currentGyro}
                  debugInfo={debugInfo}
                  accelerationData={accelerationData}
                  rotationData={rotationData}
                  gyroscopeData={gyroscopeData}
                  readingsCount={readingsCountRef.current}
                />
              ) : (
                <ResultScreen
                  result={result}
                  rawSensorData={rawSensorData}
                />
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

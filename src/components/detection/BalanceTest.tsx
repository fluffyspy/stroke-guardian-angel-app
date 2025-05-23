
import { useState, useEffect } from "react";
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

const BalanceTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(TEST_DURATION);
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const [instructionsRead, setInstructionsRead] = useState(false);

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

  const startTest = () => {
    if (!sensorAvailable) {
      toast.error("Cannot start test without motion sensors");
      return;
    }
    
    setTestStarted(true);
    setTimer(TEST_DURATION);
    resetSensorData();
    setInstructionsRead(false);
    
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
    
    // Analyze collected data and set result
    const result = analyzeBalanceData(
      readingsCountRef.current,
      abnormalReadingsCountRef.current,
      accelerationData,
      rotationData,
      gyroscopeData,
      magnetometerData,
      rawSensorData
    );
    
    setResult(result);
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setTimer(TEST_DURATION);
    setResult(null);
    resetSensorData();
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

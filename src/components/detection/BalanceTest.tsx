
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { StrokeDetectionResult } from "@/types";

const BalanceTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(30);
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);

  const startTest = () => {
    setTestStarted(true);
    setTimer(30);
    
    // Simulate balance detection over time
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTestCompleted(true);
          
          // Simulate a result
          setResult({
            detectionType: 'balance',
            result: Math.random() > 0.2 ? 'normal' : 'abnormal',
            timestamp: new Date(),
            details: "Balance test completed."
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setTimer(30);
    setResult(null);
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
                This test will check your balance abilities. Please ensure:
                <ul className="text-left list-disc list-inside mt-2">
                  <li>You are in a safe environment with nothing to trip over</li>
                  <li>Someone is nearby to assist if needed</li>
                  <li>You have space to stand comfortably</li>
                </ul>
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg text-blue-700 text-left">
                <p className="font-medium">Instructions:</p>
                <ol className="list-decimal list-inside mt-1">
                  <li>Position your phone's camera to capture your full body</li>
                  <li>When ready, press "Start Test" and stand on one foot</li>
                  <li>Try to maintain your balance for 30 seconds</li>
                  <li>The app will analyze your stability</li>
                </ol>
              </div>
              <Button onClick={startTest} className="mt-6">Start Test</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative">
                {/* This would be a camera feed in a real app */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-2xl font-bold">{timer}</p>
                </div>
                
                {/* Test instructions overlay */}
                {!testCompleted && (
                  <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 text-white p-2">
                    <p className="font-medium">Stand on one foot and maintain balance</p>
                  </div>
                )}
                
                {/* Results overlay */}
                {testCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="text-center p-6 bg-background rounded-lg shadow-lg text-foreground">
                      {result?.result === 'normal' ? (
                        <div>
                          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-medical-green" />
                          <h3 className="text-xl font-bold mb-2">Balance Test Passed</h3>
                          <p>Your balance appears normal.</p>
                        </div>
                      ) : (
                        <div>
                          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-medical-red" />
                          <h3 className="text-xl font-bold mb-2">Balance Concerns Detected</h3>
                          <p>The test indicates potential balance issues.</p>
                          <p className="mt-4 text-medical-red font-medium">
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
                  <Progress value={(timer / 30) * 100} />
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

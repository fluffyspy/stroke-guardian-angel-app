
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye } from "lucide-react";
import CameraView from "./eyeTracking/CameraView";
import DirectionGrid from "./eyeTracking/DirectionGrid";
import WelcomeScreen from "./eyeTracking/WelcomeScreen";
import { useEyeTracking } from "./eyeTracking/useEyeTracking";

const EyeTrackingTest = () => {
  const navigate = useNavigate();
  const {
    testStarted,
    testCompleted,
    currentDirection,
    currentDirectionIndex,
    matchedDirections,
    result,
    waitingForValidation,
    countdown,
    isCountingDown,
    directions,
    startTest,
    resetTest
  } = useEyeTracking();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Eye Tracking Test</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Stroke Detection - Eye Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!testStarted ? (
            <WelcomeScreen onStart={startTest} />
          ) : (
            <div className="space-y-4">
              <CameraView
                testStarted={testStarted}
                isCountingDown={isCountingDown}
                countdown={countdown}
                testCompleted={testCompleted}
                currentDirection={currentDirection}
                waitingForValidation={waitingForValidation}
                result={result}
                matchedDirections={matchedDirections}
                directions={directions}
              />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span>{matchedDirections.size}/{directions.length} directions matched</span>
                </div>
                <Progress value={(matchedDirections.size / directions.length) * 100} />
              </div>
              
              <DirectionGrid
                directions={directions}
                matchedDirections={matchedDirections}
                currentDirectionIndex={currentDirectionIndex}
                testCompleted={testCompleted}
              />
              
              {process.env.NODE_ENV === "development" && waitingForValidation && !testCompleted && (
                <div className="mt-4">
                  <Button 
                    onClick={() => console.log("Debug mode enabled")} 
                    variant="outline" 
                    size="sm" 
                    className="bg-yellow-100 text-yellow-800 border-yellow-300"
                  >
                    Debug: Manually Validate Direction
                  </Button>
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

export default EyeTrackingTest;

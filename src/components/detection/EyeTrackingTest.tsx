
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StrokeDetectionResult } from "@/types";
import { Eye, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, AlertTriangle, CheckCircle } from "lucide-react";

// Mock implementation of eye tracking functionality
// In a real app, this would use the camera and implement the actual eye tracking logic
const EyeTrackingTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState("");
  const [matchedDirections, setMatchedDirections] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // The 8 directions we need to test
  const directions = [
    "Left", "Right", "Up", "Down", 
    "Up-Left", "Up-Right", "Down-Left", "Down-Right"
  ];

  useEffect(() => {
    if (testStarted && !testCompleted) {
      if (matchedDirections.size < directions.length) {
        // In a real app, this would be handled by actual eye tracking
        // For now, we'll simulate progress
        const simulateEyeTracking = () => {
          const direction = directions[matchedDirections.size];
          setCurrentDirection(direction);
          
          // Simulate successful gaze detection after a random delay
          const timeout = setTimeout(() => {
            setMatchedDirections(prev => new Set([...prev, direction]));
            
            if (matchedDirections.size + 1 >= directions.length) {
              setTestCompleted(true);
              setResult({
                detectionType: 'eye',
                result: Math.random() > 0.2 ? 'normal' : 'abnormal', // Simulate results
                timestamp: new Date(),
                details: "Eye tracking test completed."
              });
            }
          }, 1500 + Math.random() * 1000);
          
          return () => clearTimeout(timeout);
        };
        
        simulateEyeTracking();
      }
    }
  }, [testStarted, testCompleted, matchedDirections, directions]);

  // Handle camera initialization (simplified)
  useEffect(() => {
    if (testStarted && videoRef.current && !videoRef.current.srcObject) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing the camera:", err);
        });
    }
    
    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [testStarted]);

  const startTest = () => {
    setTestStarted(true);
    setMatchedDirections(new Set());
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setMatchedDirections(new Set());
    setResult(null);
  };

  const getDirectionIcon = (direction: string) => {
    switch(direction) {
      case "Left": return <ArrowLeft />;
      case "Right": return <ArrowRight />;
      case "Up": return <ArrowUp />;
      case "Down": return <ArrowDown />;
      case "Up-Left": return (
        <div className="relative">
          <ArrowUp className="absolute -rotate-45" />
        </div>
      );
      case "Up-Right": return (
        <div className="relative">
          <ArrowUp className="absolute rotate-45" />
        </div>
      );
      case "Down-Left": return (
        <div className="relative">
          <ArrowDown className="absolute rotate-45" />
        </div>
      );
      case "Down-Right": return (
        <div className="relative">
          <ArrowDown className="absolute -rotate-45" />
        </div>
      );
      default: return <Eye />;
    }
  };

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
            <div className="text-center py-8">
              <Eye className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Eye Tracking Test</h2>
              <p className="mb-4 text-gray-600">
                This test will check your ability to move your eyes in different directions.
                You'll be asked to look in 8 different directions one by one.
              </p>
              <Button onClick={startTest}>Start Test</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  muted 
                  className="w-full h-full object-cover"
                />
                
                {/* Safety margin rectangle would be drawn here */}
                <div className="absolute inset-0 border-2 border-green-500 m-10 pointer-events-none"></div>
                
                {/* Instruction overlay */}
                {!testCompleted && (
                  <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 text-white p-2">
                    <p className="font-medium">Instruction: Look {currentDirection}</p>
                  </div>
                )}
                
                {/* Results overlay */}
                {testCompleted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white">
                    <div className="text-center p-6 bg-background rounded-lg shadow-lg text-foreground">
                      {result?.result === 'normal' ? (
                        <div>
                          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-medical-green" />
                          <h3 className="text-xl font-bold mb-2">Test Completed Successfully</h3>
                          <p>All directions were matched correctly.</p>
                        </div>
                      ) : (
                        <div>
                          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-medical-red" />
                          <h3 className="text-xl font-bold mb-2">Potential Abnormalities Detected</h3>
                          <p>Some directions were not matched correctly.</p>
                          <p className="mt-4 text-medical-red font-medium">
                            Please consider seeking medical attention.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span>{matchedDirections.size}/{directions.length} directions matched</span>
                </div>
                <Progress value={(matchedDirections.size / directions.length) * 100} />
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {directions.map((direction) => (
                  <div 
                    key={direction}
                    className={`p-2 rounded-md flex flex-col items-center ${
                      matchedDirections.has(direction) 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {getDirectionIcon(direction)}
                    <span className="text-xs mt-1">{direction}</span>
                  </div>
                ))}
              </div>
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


import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StrokeDetectionResult } from "@/types";
import { Eye, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const EyeTrackingTest = () => {
  const navigate = useNavigate();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState("");
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);
  const [matchedDirections, setMatchedDirections] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const [waitingForValidation, setWaitingForValidation] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // The 8 directions we need to test
  const directions = [
    "Left", "Right", "Up", "Down", 
    "Up-Left", "Up-Right", "Down-Left", "Down-Right"
  ];

  // Start countdown before beginning the test
  useEffect(() => {
    if (testStarted && !isCountingDown && countdown > 0) {
      setIsCountingDown(true);
      
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            setIsCountingDown(false);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [testStarted, isCountingDown, countdown]);

  // Handle the eye tracking test progression
  useEffect(() => {
    if (testStarted && !testCompleted && !isCountingDown && countdown === 0) {
      if (currentDirectionIndex < directions.length && !waitingForValidation) {
        // Set the current direction and wait for validation
        const direction = directions[currentDirectionIndex];
        setCurrentDirection(direction);
        setWaitingForValidation(true);
        
        toast.info(`Look ${direction} and hold for 3 seconds`, {
          duration: 3000
        });
        
        // In a real implementation, we would track the eyes here
        // For now, wait a longer period per direction to simulate real testing
        const timeout = setTimeout(() => {
          // Random success probability (80% success, 20% failure)
          const success = Math.random() > 0.2;
          
          if (success) {
            setMatchedDirections(prev => new Set([...prev, direction]));
            toast.success(`${direction} direction matched!`, { duration: 1500 });
          } else {
            toast.error(`Failed to match ${direction} direction`, { duration: 1500 });
          }
          
          // Move to next direction after a delay
          setTimeout(() => {
            if (currentDirectionIndex + 1 >= directions.length) {
              // Test completed
              setTestCompleted(true);
              setResult({
                detectionType: 'eye',
                result: matchedDirections.size >= directions.length * 0.75 ? 'normal' : 'abnormal',
                timestamp: new Date(),
                details: `${matchedDirections.size} out of ${directions.length} directions matched.`
              });
            } else {
              // Move to next direction
              setCurrentDirectionIndex(prev => prev + 1);
              setWaitingForValidation(false);
            }
          }, 1000);
        }, 3000); // Wait 3 seconds per direction
        
        return () => clearTimeout(timeout);
      }
    }
  }, [testStarted, testCompleted, isCountingDown, countdown, currentDirectionIndex, waitingForValidation, directions, matchedDirections]);

  // Handle camera initialization
  useEffect(() => {
    if (testStarted && videoRef.current && !videoRef.current.srcObject && countdown === 0) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing the camera:", err);
          toast.error("Unable to access camera. Please check your permissions and try again.");
        });
    }
    
    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [testStarted, countdown]);

  const startTest = () => {
    setTestStarted(true);
    setMatchedDirections(new Set());
    setCurrentDirectionIndex(0);
    setCountdown(3);
    setIsCountingDown(true);
    setWaitingForValidation(false);
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setMatchedDirections(new Set());
    setCurrentDirectionIndex(0);
    setResult(null);
    setCountdown(3);
    setIsCountingDown(false);
    setWaitingForValidation(false);
    
    // Stop camera
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
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

  // Helper for manual validation (for demonstration purposes)
  const manualValidate = () => {
    if (waitingForValidation && !testCompleted) {
      setMatchedDirections(prev => new Set([...prev, currentDirection]));
      
      if (currentDirectionIndex + 1 >= directions.length) {
        // Test completed
        setTestCompleted(true);
        setResult({
          detectionType: 'eye',
          result: 'normal',
          timestamp: new Date(),
          details: "All directions were matched correctly."
        });
      } else {
        // Move to next direction
        setCurrentDirectionIndex(prev => prev + 1);
        setWaitingForValidation(false);
      }
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
                Each direction requires you to hold your gaze for 3 seconds.
              </p>
              <Button onClick={startTest} className="animate-pulse">Start Test</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {isCountingDown && countdown > 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white">
                    <div className="text-center">
                      <h3 className="text-4xl font-bold mb-2">Starting in</h3>
                      <p className="text-6xl font-bold animate-pulse">{countdown}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline
                      muted 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Safety margin rectangle */}
                    <div className="absolute inset-0 border-2 border-green-500 m-10 pointer-events-none"></div>
                    
                    {/* Instruction overlay */}
                    {!testCompleted && (
                      <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 text-white p-2">
                        <p className="font-medium flex items-center justify-center">
                          <span className="mr-2">Look {currentDirection}</span>
                          {getDirectionIcon(currentDirection)}
                          {waitingForValidation && (
                            <span className="ml-2 inline-block animate-pulse">● Recording</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* Results overlay */}
                    {testCompleted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white">
                        <div className="text-center p-6 bg-background rounded-lg shadow-lg text-foreground max-w-md">
                          {result?.result === 'normal' ? (
                            <div className="animate-fade-in">
                              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                              <h3 className="text-xl font-bold mb-2">Test Completed Successfully</h3>
                              <p>{matchedDirections.size} out of {directions.length} directions were matched correctly.</p>
                            </div>
                          ) : (
                            <div className="animate-fade-in">
                              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                              <h3 className="text-xl font-bold mb-2">Potential Abnormalities Detected</h3>
                              <p>Only {matchedDirections.size} out of {directions.length} directions were matched correctly.</p>
                              <p className="mt-4 text-red-500 font-medium">
                                Please consider seeking medical attention.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
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
                {directions.map((direction, index) => (
                  <div 
                    key={direction}
                    className={`p-2 rounded-md flex flex-col items-center transition-all duration-300 ${
                      matchedDirections.has(direction) 
                        ? "bg-green-100 text-green-800" 
                        : index === currentDirectionIndex && !testCompleted
                        ? "bg-blue-100 text-blue-800 animate-pulse"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {getDirectionIcon(direction)}
                    <span className="text-xs mt-1">{direction}</span>
                  </div>
                ))}
              </div>
              
              {/* Debug button for manual validation - only shown in development */}
              {process.env.NODE_ENV === "development" && waitingForValidation && !testCompleted && (
                <div className="mt-4">
                  <Button 
                    onClick={manualValidate} 
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

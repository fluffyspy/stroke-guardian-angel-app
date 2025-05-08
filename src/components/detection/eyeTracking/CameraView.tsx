
import { useEffect } from "react";
import { toast } from "sonner";
import { Eye, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, AlertTriangle, CheckCircle } from "lucide-react";

interface CameraViewProps {
  testStarted: boolean;
  isCountingDown: boolean;
  countdown: number;
  testCompleted: boolean;
  currentDirection: string;
  waitingForValidation: boolean;
  result: { result: string } | null;
  matchedDirections: Set<string>;
  directions: string[];
  videoRef: React.RefObject<HTMLVideoElement>;
  detectedDirection?: string;
}

const CameraView = ({
  testStarted,
  isCountingDown,
  countdown,
  testCompleted,
  currentDirection,
  waitingForValidation,
  result,
  matchedDirections,
  directions,
  videoRef,
  detectedDirection
}: CameraViewProps) => {
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
    
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [testStarted, countdown, videoRef]);

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
          
          {!testCompleted && (
            <div className="absolute top-0 left-0 w-full bg-black bg-opacity-50 text-white p-2">
              <p className="font-medium flex items-center justify-center">
                <span className="mr-2">Look {currentDirection}</span>
                {getDirectionIcon(currentDirection)}
                {waitingForValidation && (
                  <span className="ml-2 inline-block animate-pulse">● Recording</span>
                )}
              </p>
              {detectedDirection && waitingForValidation && (
                <p className="text-xs text-center mt-1">
                  Detected: {detectedDirection}
                </p>
              )}
            </div>
          )}
          
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
  );
};

export default CameraView;

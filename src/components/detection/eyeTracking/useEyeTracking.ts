
import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { StrokeDetectionResult } from "@/types";
import { initializeFaceMeshModel, processEyeTrackingFrame } from './eyeTrackingModel';

const directions = [
  "Left", "Right", "Up", "Down", 
  "Up-Left", "Up-Right", "Down-Left", "Down-Right"
];

export const useEyeTracking = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState("");
  const [currentDirectionIndex, setCurrentDirectionIndex] = useState(0);
  const [matchedDirections, setMatchedDirections] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const [waitingForValidation, setWaitingForValidation] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [consecutiveMisses, setConsecutiveMisses] = useState(0);
  const [detectedDirection, setDetectedDirection] = useState("");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceMeshModelRef = useRef<any>(null);
  const processingRef = useRef<boolean>(false);
  const frameProcessorRef = useRef<number | null>(null);
  
  // Initialize face mesh model
  useEffect(() => {
    const init = async () => {
      if (testStarted && !faceMeshModelRef.current) {
        faceMeshModelRef.current = await initializeFaceMeshModel();
      }
    };
    
    init();
    
    return () => {
      faceMeshModelRef.current = null;
    };
  }, [testStarted]);

  // Start countdown effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (testStarted && isCountingDown) {
      timer = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            clearInterval(timer as NodeJS.Timeout);
            setIsCountingDown(false);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testStarted, isCountingDown]);

  // Process video frames for eye tracking
  useEffect(() => {
    const processFrame = async () => {
      if (processingRef.current) return;
      
      processingRef.current = true;
      
      if (waitingForValidation && videoRef.current && faceMeshModelRef.current) {
        const { matched, detectedDirection: detected } = await processEyeTrackingFrame(
          videoRef.current,
          faceMeshModelRef.current,
          currentDirection
        );
        
        setDetectedDirection(detected);
        
        if (matched) {
          setMatchedDirections(prev => new Set([...prev, currentDirection]));
          toast.success(`${currentDirection} direction matched!`, { duration: 1500 });
          setConsecutiveMisses(0);
          
          setTimeout(() => {
            if (currentDirectionIndex + 1 >= directions.length) {
              completeTest();
            } else {
              setCurrentDirectionIndex(prev => prev + 1);
              setWaitingForValidation(false);
            }
          }, 1000);
        } else {
          // Only count as a miss after a certain time period
          // This simulates the max_wait_time in the Python code
          const maxWaitSeconds = 5;
          const waitingTime = new Date().getTime() - (videoRef.current?.dataset?.startTime as unknown as number || 0);
          
          if (waitingTime > maxWaitSeconds * 1000) {
            toast.error(`Failed to match ${currentDirection} direction`, { duration: 1500 });
            setConsecutiveMisses(prev => prev + 1);
            
            setTimeout(() => {
              if (consecutiveMisses + 1 > 1) { // More than allowed misses
                completeTest(false);
              } else {
                // Move to next direction
                if (currentDirectionIndex + 1 >= directions.length) {
                  completeTest();
                } else {
                  setCurrentDirectionIndex(prev => prev + 1);
                  setWaitingForValidation(false);
                }
              }
            }, 1000);
          }
        }
      }
      
      processingRef.current = false;
    };
    
    // Start frame processing if test is active
    if (testStarted && !testCompleted && !isCountingDown && countdown === 0 && waitingForValidation) {
      if (!frameProcessorRef.current) {
        // Set start time for the current direction
        if (videoRef.current) {
          videoRef.current.dataset.startTime = new Date().getTime().toString();
        }
        
        frameProcessorRef.current = window.setInterval(processFrame, 500); // Process every 500ms
      }
    } else if (frameProcessorRef.current) {
      window.clearInterval(frameProcessorRef.current);
      frameProcessorRef.current = null;
    }
    
    return () => {
      if (frameProcessorRef.current) {
        window.clearInterval(frameProcessorRef.current);
        frameProcessorRef.current = null;
      }
    };
  }, [testStarted, testCompleted, isCountingDown, countdown, waitingForValidation, currentDirectionIndex, currentDirection, consecutiveMisses]);

  // Handle test progression
  useEffect(() => {
    if (testStarted && !testCompleted && !isCountingDown && countdown === 0) {
      if (currentDirectionIndex < directions.length && !waitingForValidation) {
        const direction = directions[currentDirectionIndex];
        setCurrentDirection(direction);
        setWaitingForValidation(true);
        
        toast.info(`Look ${direction} and hold for 3 seconds`, {
          duration: 3000
        });
      }
    }
  }, [testStarted, testCompleted, isCountingDown, countdown, currentDirectionIndex, waitingForValidation]);

  // Complete the test and set results
  const completeTest = (success = true) => {
    setTestCompleted(true);
    setResult({
      detectionType: 'eye',
      result: success && matchedDirections.size >= directions.length * 0.75 ? 'normal' : 'abnormal',
      timestamp: new Date(),
      details: `${matchedDirections.size} out of ${directions.length} directions matched.`
    });
    
    // Clean up
    if (frameProcessorRef.current) {
      window.clearInterval(frameProcessorRef.current);
      frameProcessorRef.current = null;
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setMatchedDirections(new Set());
    setCurrentDirectionIndex(0);
    setCountdown(3);
    setIsCountingDown(true);
    setWaitingForValidation(false);
    setConsecutiveMisses(0);
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
    setConsecutiveMisses(0);
    
    // Clean up
    if (frameProcessorRef.current) {
      window.clearInterval(frameProcessorRef.current);
      frameProcessorRef.current = null;
    }
  };

  const manuallyValidateDirection = (direction: string) => {
    console.log("Debug mode enabled");
    
    // Mark the current direction as matched
    setMatchedDirections(prev => new Set([...prev, direction]));
    toast.success(`${direction} direction manually validated!`, { duration: 1500 });
    
    // Proceed to the next direction or complete the test
    setTimeout(() => {
      if (currentDirectionIndex + 1 >= directions.length) {
        setTestCompleted(true);
        setResult({
          detectionType: 'eye',
          result: 'normal',
          timestamp: new Date(),
          details: `Test completed with manual validation.`
        });
      } else {
        setCurrentDirectionIndex(prev => prev + 1);
        setWaitingForValidation(false);
      }
    }, 1000);
  };

  return {
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
    resetTest,
    manuallyValidateDirection,
    videoRef,
    detectedDirection
  };
};

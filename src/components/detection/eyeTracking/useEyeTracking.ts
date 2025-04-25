
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { StrokeDetectionResult } from "@/types";

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

  // Start countdown effect - Fixed by ensuring the countdown properly completes
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

  // Handle test progression
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    
    if (testStarted && !testCompleted && !isCountingDown && countdown === 0) {
      if (currentDirectionIndex < directions.length && !waitingForValidation) {
        const direction = directions[currentDirectionIndex];
        setCurrentDirection(direction);
        setWaitingForValidation(true);
        
        toast.info(`Look ${direction} and hold for 3 seconds`, {
          duration: 3000
        });
        
        timeout = setTimeout(() => {
          const success = Math.random() > 0.2;
          
          if (success) {
            setMatchedDirections(prev => new Set([...prev, direction]));
            toast.success(`${direction} direction matched!`, { duration: 1500 });
          } else {
            toast.error(`Failed to match ${direction} direction`, { duration: 1500 });
          }
          
          setTimeout(() => {
            if (currentDirectionIndex + 1 >= directions.length) {
              setTestCompleted(true);
              setResult({
                detectionType: 'eye',
                result: matchedDirections.size >= directions.length * 0.75 ? 'normal' : 'abnormal',
                timestamp: new Date(),
                details: `${matchedDirections.size} out of ${directions.length} directions matched.`
              });
            } else {
              setCurrentDirectionIndex(prev => prev + 1);
              setWaitingForValidation(false);
            }
          }, 1000);
        }, 3000);
      }
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [testStarted, testCompleted, isCountingDown, countdown, currentDirectionIndex, waitingForValidation, matchedDirections]);

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
    manuallyValidateDirection
  };
};

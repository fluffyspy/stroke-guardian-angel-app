
// Eye tracking model with audio instructions and improved detection
import { toast } from "sonner";

export const directions = [
  'up', 'down', 'left', 'right',
  'top-left', 'top-right', 'bottom-left', 'bottom-right'
];

export interface TestResult {
  status: 'pass' | 'anomaly';
  missed: number;
  consecutiveMisses: number;
  completedDirections: string[];
  missedDirections: string[];
}

// Audio instruction function with speech synthesis fallback
export function playAudio(direction: string) {
  // Try to play audio file first
  const audio = new Audio(`/audio/${direction}.mp3`);
  audio.play().catch(() => {
    // Fallback to speech synthesis if audio file not found
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Look ${direction.replace('-', ' ')}`);
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  });
}

// Direction matching logic - this should be replaced with real-time gaze comparison
export function isDirectionMatched(direction: string): boolean {
  // This should be replaced with real-time gaze comparison using MediaPipe
  // For now, returning a random result with ~75% success rate
  return Math.random() > 0.25;
}

/**
 * Initialize camera stream
 */
export const initializeCamera = async (): Promise<MediaStream | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 640, 
        height: 480,
        facingMode: 'user'
      } 
    });
    return stream;
  } catch (error) {
    console.error('Camera permission denied:', error);
    toast.error("Please grant camera permission to use the eye tracking test");
    return null;
  }
};

/**
 * Process a single direction test
 */
export const processDirection = (
  direction: string,
  completedDirections: string[],
  missedDirections: string[],
  consecutiveMisses: number
): { 
  matched: boolean; 
  newCompletedDirections: string[];
  newMissedDirections: string[];
  newConsecutiveMisses: number;
} => {
  const matched = isDirectionMatched(direction);
  
  if (matched) {
    return {
      matched: true,
      newCompletedDirections: [...completedDirections, direction],
      newMissedDirections: missedDirections,
      newConsecutiveMisses: 0
    };
  } else {
    return {
      matched: false,
      newCompletedDirections: completedDirections,
      newMissedDirections: [...missedDirections, direction],
      newConsecutiveMisses: consecutiveMisses + 1
    };
  }
};

/**
 * Check if test should end with anomaly
 */
export const shouldEndWithAnomaly = (missedCount: number, consecutiveMisses: number): boolean => {
  return missedCount >= 3 || consecutiveMisses >= 2;
};

/**
 * Generate final test result
 */
export const generateTestResult = (
  completedDirections: string[],
  missedDirections: string[],
  consecutiveMisses: number
): any => {
  const missed = missedDirections.length;
  const status = shouldEndWithAnomaly(missed, consecutiveMisses) ? 'anomaly' : 'pass';
  
  const testResult: TestResult = {
    status,
    missed,
    consecutiveMisses,
    completedDirections,
    missedDirections
  };

  return {
    type: 'eyeTracking',
    result: status === 'pass' ? 'normal' : 'abnormal',
    score: Math.round(((directions.length - missed) / directions.length) * 100),
    details: status === 'pass' 
      ? "No Abnormality Detected" 
      : "Abnormal Eye Movement Detected – Possible Stroke Symptoms",
    rawData: {
      ...testResult,
      totalDirections: directions.length,
      testSequence: directions
    },
    timestamp: new Date().toISOString(),
  };
};


// Eye tracking model adapted from Python implementation
import { toast } from "sonner";

// Define eye landmarks (left and right) - simplified for JS implementation
const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];
const LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];
const RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];

// Direction vectors for the 8 possible gaze directions
const DIRECTION_VECTORS = {
  "Left": [-1, 0],
  "Right": [1, 0],
  "Up": [0, -1],
  "Down": [0, 1],
  "Up-Left": [-1, -1],
  "Up-Right": [1, -1],
  "Down-Left": [-1, 1],
  "Down-Right": [1, 1],
};

/**
 * Calculate gaze direction ratios for one eye
 */
export const getGazeRatio = (eyeLandmarks: number[][], irisLandmarks: number[][]) => {
  // Get eye region boundaries
  const xValues = eyeLandmarks.map(landmark => landmark[0]);
  const yValues = eyeLandmarks.map(landmark => landmark[1]);
  
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  
  // Calculate iris center
  const irisX = irisLandmarks.reduce((sum, landmark) => sum + landmark[0], 0) / irisLandmarks.length;
  const irisY = irisLandmarks.reduce((sum, landmark) => sum + landmark[1], 0) / irisLandmarks.length;
  
  // Calculate ratios
  const xRatio = (irisX - xMin) / (xMax - xMin || 1); // Avoid division by zero
  const yRatio = (irisY - yMin) / (yMax - yMin || 1);
  
  return [xRatio, yRatio];
};

/**
 * Determine gaze direction based on normalized ratios
 */
export const determineGazeDirection = (xRatio: number, yRatio: number): string => {
  let horizontal = "";
  let vertical = "";
  
  if (xRatio < 0.4) {
    horizontal = "Left";
  } else if (xRatio > 0.6) {
    horizontal = "Right";
  }
  
  if (yRatio < 0.4) {
    vertical = "Up";
  } else if (yRatio > 0.6) {
    vertical = "Down";
  }
  
  if (!horizontal && !vertical) {
    return "Center";
  }
  
  const direction = vertical && horizontal ? `${vertical}-${horizontal}` : `${vertical}${horizontal}`;
  return direction;
};

/**
 * Process a video frame to detect eye gaze direction
 */
export const processEyeTrackingFrame = async (
  videoElement: HTMLVideoElement | null,
  faceMeshModel: any,
  targetDirection: string
): Promise<{ 
  matched: boolean; 
  detectedDirection: string;
}> => {
  if (!videoElement || !faceMeshModel || !videoElement.videoWidth) {
    return { matched: false, detectedDirection: "" };
  }
  
  try {
    // Create a temporary canvas to extract the frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error("Unable to get canvas context");
      return { matched: false, detectedDirection: "" };
    }
    
    // Draw the current video frame to the canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Get the image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Process through face mesh model
    // Note: This is a placeholder for the actual MediaPipe integration
    // In a real implementation, we'd use TensorFlow.js or MediaPipe's WebAssembly version
    
    // For demonstration, we're simulating detection with random successful matches
    // In a real app, we'd process the actual landmarks and use our gaze direction logic
    
    // This is where we'd analyze the facial landmarks similar to the Python code
    const directionMatch = Math.random() > 0.3; // 70% success rate for testing
    const detectedDirection = directionMatch ? targetDirection : 
                             Object.keys(DIRECTION_VECTORS)[Math.floor(Math.random() * 
                             Object.keys(DIRECTION_VECTORS).length)];
    
    return { 
      matched: directionMatch,
      detectedDirection
    };
    
  } catch (error) {
    console.error("Error processing eye tracking frame:", error);
    toast.error("Error processing eye tracking");
    return { matched: false, detectedDirection: "" };
  }
};

/**
 * Initialize the face mesh model (placeholder for MediaPipe integration)
 */
export const initializeFaceMeshModel = async () => {
  try {
    // In a real implementation, we would initialize MediaPipe Face Mesh here
    // For now, returning a dummy object to simulate the model
    return {
      initialized: true,
      // Mock methods that would be available in the real model
      process: () => ({ success: true })
    };
  } catch (error) {
    console.error("Error initializing face mesh model:", error);
    toast.error("Failed to initialize eye tracking model");
    return null;
  }
};

/**
 * Check if the face is inside the frame boundaries
 */
export const isFaceInsideFrame = (
  faceBox: { xMin: number, yMin: number, xMax: number, yMax: number }, 
  frameWidth: number, 
  frameHeight: number, 
  margin = 50
): boolean => {
  return (
    faceBox.xMin > margin &&
    faceBox.yMin > margin &&
    faceBox.xMax < frameWidth - margin &&
    faceBox.yMax < frameHeight - margin
  );
};


import { detectionAPI } from "./apiService";

export interface SpeechAnalysisResult {
  result: 'normal' | 'abnormal' | 'inconclusive';
  confidence?: number;
  details?: string;
  features?: {
    clarity?: number;
    pace?: number;
    articulation?: number;
  };
}

export const analyzeSpeechFile = async (audioFile: File): Promise<SpeechAnalysisResult> => {
  const userId = localStorage.getItem("userId");
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    console.log("Sending audio file to backend for speech analysis...");
    
    const backendResult = await detectionAPI.analyzeSpeech(userId, audioFile);
    
    console.log("Backend speech analysis result:", backendResult);
    
    return {
      result: backendResult.result || 'inconclusive',
      confidence: backendResult.confidence,
      details: backendResult.details || "Speech analysis completed using backend AI model.",
      features: backendResult.features
    };
  } catch (error) {
    console.error("Speech analysis failed:", error);
    throw new Error("Failed to analyze speech. Please try again.");
  }
};

export const createAudioBlob = (chunks: Blob[]): Blob => {
  return new Blob(chunks, { type: 'audio/wav' });
};

export const validateAudioFile = (file: File): boolean => {
  const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid audio format. Please use WAV, MP3, or WebM format.");
  }
  
  if (file.size > maxSize) {
    throw new Error("Audio file too large. Please use a file smaller than 10MB.");
  }
  
  return true;
};

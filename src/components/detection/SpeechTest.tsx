
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, AlertTriangle, CheckCircle, MessageSquare } from "lucide-react";
import { StrokeDetectionResult } from "@/types";

const SpeechTest = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [result, setResult] = useState<StrokeDetectionResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // In a real app, this would use the MediaRecorder API to capture audio
    // For now, we'll just simulate with a timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 9) {
          stopRecording();
          return 10;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    
    // Simulate processing and results
    setTimeout(() => {
      setTestCompleted(true);
      setResult({
        detectionType: 'speech',
        result: Math.random() > 0.2 ? 'normal' : 'abnormal',
        timestamp: new Date(),
        details: "Speech clarity test completed."
      });
    }, 1500);
  };

  const resetTest = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setTestCompleted(false);
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Speech Test</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Stroke Detection - Speech Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isRecording && !testCompleted ? (
            <div className="text-center py-8">
              <Mic className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-semibold mb-2">Speech Clarity Test</h2>
              <p className="mb-4 text-gray-600">
                This test will analyze your speech for signs of slurring or difficulty speaking,
                which can be indicators of stroke.
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg text-blue-700 text-left">
                <p className="font-medium">Instructions:</p>
                <ol className="list-decimal list-inside mt-1">
                  <li>Find a quiet environment</li>
                  <li>When ready, press "Start Recording"</li>
                  <li>Read the following phrase clearly: "The early bird catches the worm but the second mouse gets the cheese."</li>
                  <li>Press "Stop" when finished</li>
                </ol>
              </div>
              <Button onClick={startRecording} className="mt-6">Start Recording</Button>
            </div>
          ) : isRecording ? (
            <div className="text-center py-8">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="absolute inset-0 bg-red-100 rounded-full flex items-center justify-center">
                  <Mic className="h-10 w-10 text-red-500" />
                </div>
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-red-500"
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    strokeWidth="4"
                    strokeDasharray={`${(recordingTime / 10) * 301} 301`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
              <p className="text-xl font-bold mb-6">Recording... {recordingTime}s</p>
              <div className="bg-white p-4 rounded-lg shadow mb-6 text-left">
                <p className="font-medium">Please read:</p>
                <p className="italic text-gray-700 mt-2">
                  "The early bird catches the worm but the second mouse gets the cheese."
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={stopRecording}
                className="flex items-center gap-2"
              >
                <Square className="h-4 w-4" />
                Stop Recording
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              {result?.result === 'normal' ? (
                <div>
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-medical-green" />
                  <h3 className="text-xl font-bold mb-2">Speech Test Passed</h3>
                  <p className="mb-4">Your speech appears clear and normal.</p>
                </div>
              ) : (
                <div>
                  <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-medical-red" />
                  <h3 className="text-xl font-bold mb-2">Speech Concerns Detected</h3>
                  <p className="mb-4">The test indicates potential speech issues.</p>
                  <p className="text-medical-red font-medium mb-4">
                    Please consider seeking medical attention.
                  </p>
                </div>
              )}
              
              <div className="flex justify-between w-full max-w-xs mx-auto mt-6">
                <Button variant="outline" onClick={resetTest}>
                  Restart Test
                </Button>
                <Button onClick={() => navigate("/dashboard")}>
                  Return
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeechTest;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Eye, Activity, MessageSquare, Brain, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { StrokeDetectionResult, CombinedAnalysisResult } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ComprehensiveAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentTest, setCurrentTest] = useState<'none' | 'balance' | 'eye' | 'speech'>('none');
  const [testResults, setTestResults] = useState<{
    balance?: StrokeDetectionResult;
    eye?: StrokeDetectionResult;
    speech?: StrokeDetectionResult;
  }>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [combinedResult, setCombinedResult] = useState<CombinedAnalysisResult | null>(null);

  const startTestSequence = () => {
    setCurrentTest('balance');
    navigate('/balance-detection');
  };

  useEffect(() => {
    // Check if we've returned from a test
    const checkTestResults = () => {
      // In a real app, this would fetch results from storage
      // For now, we'll simulate results
      if (currentTest !== 'none') {
        const mockResult: StrokeDetectionResult = {
          detectionType: currentTest,
          result: Math.random() > 0.3 ? 'normal' : 'abnormal',
          timestamp: new Date(),
          details: `${currentTest} test completed.`
        };

        setTestResults(prev => ({
          ...prev,
          [currentTest]: mockResult
        }));

        // Move to next test
        if (currentTest === 'balance') {
          setCurrentTest('eye');
          navigate('/eye-tracking');
        } else if (currentTest === 'eye') {
          setCurrentTest('speech');
          navigate('/speech-detection');
        } else if (currentTest === 'speech') {
          setCurrentTest('none');
          runAnalysis();
        }
      }
    };

    // Small delay to ensure navigation has completed
    const timer = setTimeout(checkTestResults, 500);
    return () => clearTimeout(timer);
  }, [currentTest, navigate]);

  const runAnalysis = () => {
    if (!testResults.balance || !testResults.eye || !testResults.speech) {
      return;
    }

    setAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          performEnsembleAnalysis();
          return 100;
        }
        return newProgress;
      });
    }, 150);
  };

  const performEnsembleAnalysis = () => {
    if (!testResults.balance || !testResults.eye || !testResults.speech) return;

    const abnormalCount = [testResults.balance, testResults.eye, testResults.speech].filter(
      result => result.result === 'abnormal'
    ).length;

    let overallResult: 'normal' | 'abnormal' | 'inconclusive';
    let riskLevel: 'low' | 'moderate' | 'high';
    let recommendations: string[] = [];

    if (abnormalCount === 0) {
      overallResult = 'normal';
      riskLevel = 'low';
      recommendations = [
        "Continue regular monitoring",
        "Maintain healthy lifestyle",
        "Schedule your next check in 3 months"
      ];
    } else if (abnormalCount === 1) {
      overallResult = 'inconclusive';
      riskLevel = 'moderate';
      recommendations = [
        "Repeat the abnormal test within 24 hours",
        "Monitor for any new symptoms",
        "Consider consulting a healthcare provider"
      ];
    } else {
      overallResult = 'abnormal';
      riskLevel = 'high';
      recommendations = [
        "Contact emergency services immediately",
        "Do not delay seeking medical attention",
        "Share these test results with healthcare providers"
      ];

      toast({
        title: "Warning: High Stroke Risk Detected",
        description: "Please seek immediate medical attention or navigate to the Emergency page.",
        variant: "destructive"
      });
    }

    const analysisResult: CombinedAnalysisResult = {
      balance: testResults.balance,
      eye: testResults.eye,
      speech: testResults.speech,
      overallResult,
      riskLevel,
      timestamp: new Date(),
      recommendations
    };

    setCombinedResult(analysisResult);
    setAnalyzing(false);
  };

  const getRiskColor = (riskLevel: 'low' | 'moderate' | 'high') => {
    switch (riskLevel) {
      case 'low': return "text-medical-green";
      case 'moderate': return "text-amber-500";
      case 'high': return "text-medical-red";
      default: return "text-gray-500";
    }
  };
  
  const getResultIcon = (result: 'normal' | 'abnormal' | 'inconclusive') => {
    switch (result) {
      case 'normal': 
        return <CheckCircle className="h-6 w-6 text-medical-green" />;
      case 'abnormal': 
        return <AlertTriangle className="h-6 w-6 text-medical-red" />;
      case 'inconclusive': 
        return <AlertCircle className="h-6 w-6 text-amber-500" />;
      default: 
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Comprehensive Analysis</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Stroke Analysis - Sequential Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyzing ? (
            <div className="space-y-4 py-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">Analyzing test results...</p>
                <p className="text-gray-500">Please wait while our ensemble model processes your data</p>
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Processing data</span>
                  <span>Finalizing results</span>
                </div>
              </div>
            </div>
          ) : combinedResult ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className={`text-center p-4 rounded-lg ${
                  combinedResult.riskLevel === 'high' 
                    ? 'bg-red-50' 
                    : combinedResult.riskLevel === 'moderate' 
                      ? 'bg-amber-50' 
                      : 'bg-green-50'
                }`}>
                  <div className="mb-2">
                    {combinedResult.riskLevel === 'high' && <AlertTriangle className="h-12 w-12 mx-auto text-medical-red" />}
                    {combinedResult.riskLevel === 'moderate' && <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />}
                    {combinedResult.riskLevel === 'low' && <CheckCircle className="h-12 w-12 mx-auto text-medical-green" />}
                  </div>
                  <h3 className={`text-xl font-bold ${getRiskColor(combinedResult.riskLevel)}`}>
                    {combinedResult.riskLevel === 'high' ? 'High Risk' : 
                     combinedResult.riskLevel === 'moderate' ? 'Moderate Risk' : 'Low Risk'}
                  </h3>
                  <p className="mt-1">
                    {combinedResult.riskLevel === 'high' 
                      ? 'Potential stroke detected. Seek medical attention immediately.' 
                      : combinedResult.riskLevel === 'moderate' 
                        ? 'Some concerning signs detected. Monitor closely.' 
                        : 'No significant stroke indicators detected.'}
                  </p>
                </div>
              </div>
              
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto mb-4 text-primary opacity-60" />
              <h2 className="text-xl font-semibold mb-2">Comprehensive Stroke Analysis</h2>
              <p className="mb-6 text-gray-600 max-w-md mx-auto">
                This analysis will guide you through three tests in sequence:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                <div className={`border rounded-lg p-4 flex flex-col items-center ${
                  currentTest === 'balance' ? 'border-primary bg-primary/5' : ''
                }`}>
                  <Activity className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">1. Balance Test</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {testResults.balance ? "✓ Completed" : "Not started"}
                  </p>
                </div>

                <div className={`border rounded-lg p-4 flex flex-col items-center ${
                  currentTest === 'eye' ? 'border-primary bg-primary/5' : ''
                }`}>
                  <Eye className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">2. Eye Tracking</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {testResults.eye ? "✓ Completed" : "Not started"}
                  </p>
                </div>

                <div className={`border rounded-lg p-4 flex flex-col items-center ${
                  currentTest === 'speech' ? 'border-primary bg-primary/5' : ''
                }`}>
                  <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">3. Speech Test</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {testResults.speech ? "✓ Completed" : "Not started"}
                  </p>
                </div>
              </div>

              <Button 
                onClick={startTestSequence} 
                disabled={currentTest !== 'none'}
                className="w-full md:w-auto"
              >
                {currentTest === 'none' ? "Start Tests Sequence" : "Tests in Progress..."}
              </Button>

              {currentTest !== 'none' && (
                <p className="mt-4 text-sm text-gray-500">
                  Please complete the current test before proceeding.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprehensiveAnalysis;

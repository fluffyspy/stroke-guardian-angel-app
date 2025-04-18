
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Eye, 
  MessageSquare, 
  Brain, 
  AlertCircle 
} from "lucide-react";
import { StrokeDetectionResult, CombinedAnalysisResult } from "@/types";
import { useToast } from "@/hooks/use-toast";

const ComprehensiveAnalysis = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [combinedResult, setCombinedResult] = useState<CombinedAnalysisResult | null>(null);
  
  // These would come from local storage in a real app
  const [balanceResult, setBalanceResult] = useState<StrokeDetectionResult | null>(null);
  const [eyeResult, setEyeResult] = useState<StrokeDetectionResult | null>(null);
  const [speechResult, setSpeechResult] = useState<StrokeDetectionResult | null>(null);

  // Fake loading the saved results (in a real app, these would come from storage)
  useEffect(() => {
    // Simulate loading saved test results
    const loadMockResults = () => {
      // For demo purposes, we'll create mock results
      // In a real app, these would come from storage
      const mockBalance: StrokeDetectionResult = {
        detectionType: 'balance',
        result: Math.random() > 0.7 ? 'abnormal' : 'normal',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        details: "Balance test completed with slight instability detected."
      };
      
      const mockEye: StrokeDetectionResult = {
        detectionType: 'eye',
        result: Math.random() > 0.7 ? 'abnormal' : 'normal',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        details: "Eye tracking test shows some deviation from normal patterns."
      };
      
      const mockSpeech: StrokeDetectionResult = {
        detectionType: 'speech',
        result: Math.random() > 0.7 ? 'abnormal' : 'normal',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        details: "Speech analysis indicates minor slurring in certain words."
      };
      
      setBalanceResult(mockBalance);
      setEyeResult(mockEye);
      setSpeechResult(mockSpeech);
    };
    
    loadMockResults();
  }, []);

  const runAnalysis = () => {
    if (!balanceResult || !eyeResult || !speechResult) {
      toast({
        title: "Missing test results",
        description: "Please complete all three tests before running comprehensive analysis.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    setProgress(0);
    
    // Simulate analysis with progress updates
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
    // This would be a complex algorithm in a real app
    // Here we'll simulate an ensemble model by counting abnormal results
    
    if (!balanceResult || !eyeResult || !speechResult) return;
    
    const abnormalCount = [balanceResult, eyeResult, speechResult].filter(
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
      
      // If high risk, trigger emergency notification
      toast({
        title: "Warning: High Stroke Risk Detected",
        description: "Please seek immediate medical attention or navigate to the Emergency page.",
        variant: "destructive"
      });
    }
    
    const analysisResult: CombinedAnalysisResult = {
      balance: balanceResult,
      eye: eyeResult,
      speech: speechResult,
      overallResult,
      riskLevel,
      timestamp: new Date(),
      recommendations
    };
    
    setCombinedResult(analysisResult);
    setAnalyzing(false);
    
    // Save to local storage in a real app
    // localStorage.setItem("latestAnalysis", JSON.stringify(analysisResult));
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
            Stroke Analysis - Ensemble Model
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
              
              <Tabs defaultValue="summary">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="details">Detailed Results</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="p-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Analysis Summary</h3>
                    <p>
                      Based on the combined analysis of balance, eye tracking, and speech tests,
                      the overall stroke risk assessment is <span className={`font-bold ${getRiskColor(combinedResult.riskLevel)}`}>
                        {combinedResult.riskLevel.toUpperCase()}
                      </span>.
                    </p>
                    <p className="text-sm text-gray-500">
                      Analysis performed on {combinedResult.timestamp.toLocaleString()}
                    </p>
                    
                    {combinedResult.riskLevel === 'high' && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Emergency</AlertTitle>
                        <AlertDescription>
                          Urgent medical attention is recommended based on these results.
                          <div className="mt-2">
                            <Button 
                              variant="destructive" 
                              className="w-full"
                              onClick={() => navigate("/emergency")}
                            >
                              Go to Emergency Page
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Balance Test</h3>
                      </div>
                      <div className="flex items-center mt-2">
                        {combinedResult.balance && getResultIcon(combinedResult.balance.result)}
                        <span className="ml-2">{combinedResult.balance?.result.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{combinedResult.balance?.details}</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Eye Tracking Test</h3>
                      </div>
                      <div className="flex items-center mt-2">
                        {combinedResult.eye && getResultIcon(combinedResult.eye.result)}
                        <span className="ml-2">{combinedResult.eye?.result.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{combinedResult.eye?.details}</p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Speech Test</h3>
                      </div>
                      <div className="flex items-center mt-2">
                        {combinedResult.speech && getResultIcon(combinedResult.speech.result)}
                        <span className="ml-2">{combinedResult.speech?.result.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">{combinedResult.speech?.details}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="recommendations" className="p-4">
                  <h3 className="font-medium text-lg mb-4">Recommendations</h3>
                  <ul className="space-y-2">
                    {combinedResult.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <div className="rounded-full bg-primary bg-opacity-10 p-1 mr-2 mt-0.5">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto mb-4 text-primary opacity-60" />
              <h2 className="text-xl font-semibold mb-2">Comprehensive Stroke Analysis</h2>
              <p className="mb-6 text-gray-600 max-w-md mx-auto">
                Our ensemble model combines data from balance, eye tracking, and speech tests to provide a comprehensive stroke risk assessment.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
                <div className="border rounded-lg p-4 flex flex-col items-center">
                  <Activity className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Balance Test</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {balanceResult ? "Completed" : "Not completed"}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 flex flex-col items-center">
                  <Eye className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Eye Tracking</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {eyeResult ? "Completed" : "Not completed"}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 flex flex-col items-center">
                  <MessageSquare className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="font-medium">Speech Test</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {speechResult ? "Completed" : "Not completed"}
                  </p>
                </div>
              </div>
              
              <Button onClick={runAnalysis} disabled={!balanceResult || !eyeResult || !speechResult}>
                {!balanceResult || !eyeResult || !speechResult 
                  ? "Complete All Tests First" 
                  : "Run Comprehensive Analysis"}
              </Button>
              
              {(!balanceResult || !eyeResult || !speechResult) && (
                <p className="mt-4 text-sm text-gray-500">
                  Please complete all three tests before running the comprehensive analysis.
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

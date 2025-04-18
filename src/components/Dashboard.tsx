
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Activity, MessageSquare, Phone, Brain } from "lucide-react";
import { Patient } from "@/types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    } else {
      navigate("/registration");
    }
  }, [navigate]);

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Stroke Guardian</h1>
        <Button variant="outline" onClick={() => navigate("/profile")}>
          Patient Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detection Modules</CardTitle>
            <CardDescription>Select a module to perform detection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate("/balance-detection")}
              >
                <Activity className="h-6 w-6" />
                <span>Balance</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate("/eye-tracking")}
              >
                <Eye className="h-6 w-6" />
                <span>Eye Tracking</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2"
                onClick={() => navigate("/speech-detection")}
              >
                <MessageSquare className="h-6 w-6" />
                <span>Speech</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-medical-red bg-opacity-10 border-medical-red"
                onClick={() => navigate("/emergency")}
              >
                <Phone className="h-6 w-6 text-medical-red" />
                <span className="text-medical-red">Emergency</span>
              </Button>
            </div>

            <Button 
              className="w-full mt-4 bg-primary"
              onClick={() => navigate("/comprehensive-analysis")}
            >
              <Brain className="h-5 w-5 mr-2" />
              Comprehensive Analysis
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Information</CardTitle>
            <CardDescription>Education about stroke</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => navigate("/education/symptoms")}
              >
                Recognizing Stroke Symptoms
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => navigate("/education/first-aid")}
              >
                First Aid for Stroke
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-12"
                onClick={() => navigate("/education/prevention")}
              >
                Stroke Prevention
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your recent detection results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No recent detection activities.
            <p className="mt-2 text-sm">Start by selecting a detection module above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;


import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Activity, MessageSquare, Phone, Brain } from "lucide-react";
import { Patient } from "@/types";
import { motion } from "framer-motion";

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
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <Brain className="h-12 w-12 text-primary" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div variants={item} className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Stroke Sense</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/profile")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Patient Profile
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Detection Modules</CardTitle>
              <CardDescription>Select a module to perform detection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    className="h-24 w-full flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigate("/balance-detection")}
                  >
                    <Activity className="h-6 w-6" />
                    <span>Balance</span>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    className="h-24 w-full flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigate("/eye-tracking")}
                  >
                    <Eye className="h-6 w-6" />
                    <span>Eye Tracking</span>
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    className="h-24 w-full flex flex-col items-center justify-center space-y-2"
                    onClick={() => navigate("/speech-detection")}
                  >
                    <MessageSquare className="h-6 w-6" />
                    <span>Speech</span>
                  </Button>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="pulse-animation"
                >
                  <Button 
                    variant="outline" 
                    className="h-24 w-full flex flex-col items-center justify-center space-y-2 bg-medical-red bg-opacity-10 border-medical-red"
                    onClick={() => navigate("/emergency")}
                  >
                    <Phone className="h-6 w-6 text-medical-red" />
                    <span className="text-medical-red">Emergency</span>
                  </Button>
                </motion.div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }}
                className="mt-4"
              >
                <Button 
                  className="w-full bg-primary"
                  onClick={() => navigate("/comprehensive-analysis")}
                >
                  <Brain className="h-5 w-5 mr-2" />
                  Comprehensive Analysis
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Information</CardTitle>
              <CardDescription>Education about stroke</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={() => navigate("/education/symptoms")}
                  >
                    Recognizing Stroke Symptoms
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={() => navigate("/education/first-aid")}
                  >
                    First Aid for Stroke
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12"
                    onClick={() => navigate("/education/prevention")}
                  >
                    Stroke Prevention
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your recent detection results</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center py-8 text-gray-500"
            >
              No recent detection activities.
              <p className="mt-2 text-sm">Start by selecting a detection module above.</p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;

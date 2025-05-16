
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Activity, MessageSquare, Phone, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const DetectionModules = () => {
  const navigate = useNavigate();

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
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
  );
};

export default DetectionModules;

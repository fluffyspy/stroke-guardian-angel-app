
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { Patient } from "@/types";
import { motion } from "framer-motion";
import DashboardHeader from "./dashboard/DashboardHeader";
import WelcomeCard from "./dashboard/WelcomeCard";
import DetectionModules from "./dashboard/DetectionModules";
import QuickInformation from "./dashboard/QuickInformation";
import RecentActivity from "./dashboard/RecentActivity";

const Dashboard = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user is logged in but don't redirect if not
    const storedPatient = localStorage.getItem("patient");
    const token = localStorage.getItem("authToken");
    
    if (storedPatient && token) {
      setPatient(JSON.parse(storedPatient));
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
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

  return (
    <motion.div 
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <DashboardHeader isLoggedIn={!!patient} />
      <WelcomeCard patient={patient} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DetectionModules />
        <QuickInformation />
      </div>

      <RecentActivity />
    </motion.div>
  );
};

export default Dashboard;

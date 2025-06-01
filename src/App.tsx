
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PatientRegistration from "./components/PatientRegistration";
import Dashboard from "./components/Dashboard";
import PatientProfile from "./components/PatientProfile";
import EyeTrackingTest from "./components/detection/EyeTrackingTest";
import BalanceTest from "./components/detection/BalanceTest";
import SpeechTest from "./components/detection/SpeechTest";
import Emergency from "./components/Emergency";
import StrokeEducation from "./components/education/StrokeEducation";
import ComprehensiveAnalysis from "./components/analysis/ComprehensiveAnalysis";
import PermissionsHandler from "./components/PermissionsHandler";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Back button handler component
const BackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = () => {
      const testScreens = [
        '/eye-tracking', 
        '/balance-detection', 
        '/speech-detection',
        '/emergency',
        '/comprehensive-analysis',
        '/education'
      ];
      
      // Check if we're on a test screen
      const isTestScreen = testScreens.some(path => 
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );
      
      if (isTestScreen) {
        navigate('/dashboard');
        return true; // Prevents default back action
      }
      
      // Let default behavior happen (might close the app)
      return false;
    };

    // Add listener for back button
    let backButtonListener: any;
    
    const setupListener = async () => {
      try {
        backButtonListener = await CapacitorApp.addListener(
          'backButton', 
          handleBackButton
        );
      } catch (error) {
        console.error("Error setting up back button listener:", error);
      }
    };
    
    setupListener();

    // Clean up the listener when component unmounts
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [navigate, location]);

  return null; // This component doesn't render anything
};

const AppContent = () => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const handlePermissionsGranted = () => {
    setPermissionsGranted(true);
  };

  if (!permissionsGranted) {
    return <PermissionsHandler onPermissionsGranted={handlePermissionsGranted} />;
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <BackButtonHandler />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<PatientRegistration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<PatientProfile />} />
        <Route path="/eye-tracking" element={<EyeTrackingTest />} />
        <Route path="/balance-detection" element={<BalanceTest />} />
        <Route path="/speech-detection" element={<SpeechTest />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/comprehensive-analysis" element={<ComprehensiveAnalysis />} />
        <Route path="/education/:topic" element={<StrokeEducation />} />
        <Route path="/education" element={<StrokeEducation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

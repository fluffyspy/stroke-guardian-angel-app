
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

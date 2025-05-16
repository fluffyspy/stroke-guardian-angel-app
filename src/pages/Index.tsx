
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Activity, Eye, MessageSquare, Phone, LogIn, UserPlus, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { checkUserSession } from "@/services/authService";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const user = await checkUserSession();
        if (user) {
          // If user is logged in, redirect to dashboard
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-white to-gray-100">
        <div className="animate-pulse flex flex-col items-center">
          <BrainCircuit className="h-16 w-16 text-primary animate-bounce" />
          <p className="mt-4 font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      {/* Header */}
      <motion.header 
        className="bg-primary text-white py-6 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BrainCircuit className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Stroke Sense</h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary"
                  onClick={() => navigate("/registration")}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white hover:text-primary"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with enhanced design */}
      <motion.section 
        className="py-16 bg-white relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        {/* Background design elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100 rounded-full opacity-50"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-100 rounded-full opacity-50"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-8 flex justify-center"
          >
            <div className="bg-blue-50 p-5 rounded-full shadow-inner">
              <BrainCircuit className="h-20 w-20 text-primary" />
            </div>
          </motion.div>
          
          <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">Early Stroke Detection <br/><span className="text-blue-800">Saves Lives</span></h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            A comprehensive mobile application that helps detect early stroke symptoms,
            provides timely assistance, and offers educational resources.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 shadow-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                onClick={() => navigate("/registration")}
              >
                Get Started Now
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 bg-white text-primary border border-blue-300 hover:bg-blue-50"
                onClick={() => navigate("/education")}
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section with card hover effects */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-4 text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Key Features
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 mb-12 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            Our comprehensive tools help detect and respond to stroke symptoms quickly
          </motion.p>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2"
              variants={fadeIn}
            >
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Balance Detection</h3>
              <p className="text-gray-600">
                Sophisticated sensors measure balance stability to detect potential stroke symptoms.
              </p>
              <motion.div className="mt-6" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/balance-detection")}
                >
                  Try Now
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2"
              variants={fadeIn}
            >
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Eye Tracking</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze eye movement patterns to identify neurological issues.
              </p>
              <motion.div className="mt-6" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/eye-tracking")}
                >
                  Try Now
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2"
              variants={fadeIn}
            >
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Speech Analysis</h3>
              <p className="text-gray-600">
                Cutting-edge voice recognition evaluates speech clarity to identify potential slurring.
              </p>
              <motion.div className="mt-6" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/speech-detection")}
                >
                  Try Now
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2"
              variants={fadeIn}
            >
              <div className="rounded-full bg-red-100 p-4 mb-4">
                <Phone className="h-8 w-8 text-medical-red" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">Emergency Assistance</h3>
              <p className="text-gray-600">
                Quick access to emergency services when every second matters for stroke treatment.
              </p>
              <motion.div className="mt-6" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/emergency")}
                >
                  Access
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section with enhanced timeline */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-4 text-gray-800"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            Our simple 4-step process helps you monitor and respond to stroke symptoms
          </motion.p>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Step line */}
              <div className="absolute left-9 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-medical-red"></div>
              
              {/* Steps */}
              <div className="space-y-12">
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl font-bold z-10 shadow-lg">
                    1
                  </div>
                  <div className="ml-8 pt-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Register</h3>
                    <p className="text-gray-600">
                      Create your profile with personal details, medical history, and emergency contacts for comprehensive care.
                    </p>
                    <motion.div className="mt-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="ghost" 
                        className="text-primary p-0 flex items-center"
                        onClick={() => navigate("/registration")}
                      >
                        Register Now <Check className="ml-1 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl font-bold z-10 shadow-lg">
                    2
                  </div>
                  <div className="ml-8 pt-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Regular Testing</h3>
                    <p className="text-gray-600">
                      Perform balance, eye tracking, and speech tests regularly to establish baseline data and monitor changes.
                    </p>
                    <motion.div className="mt-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="ghost" 
                        className="text-primary p-0 flex items-center"
                        onClick={() => navigate("/comprehensive-analysis")}
                      >
                        View Tests <Check className="ml-1 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-2xl font-bold z-10 shadow-lg">
                    3
                  </div>
                  <div className="ml-8 pt-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Automated Analysis</h3>
                    <p className="text-gray-600">
                      Our advanced AI algorithms analyze your results in real-time and detect potential stroke warning signs.
                    </p>
                    <motion.div className="mt-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="ghost" 
                        className="text-primary p-0 flex items-center"
                        onClick={() => navigate("/comprehensive-analysis")}
                      >
                        See Analysis <Check className="ml-1 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white text-2xl font-bold z-10 shadow-lg">
                    4
                  </div>
                  <div className="ml-8 pt-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Immediate Response</h3>
                    <p className="text-gray-600">
                      If stroke signs are detected, instantly access emergency assistance and contact your pre-defined medical team.
                    </p>
                    <motion.div className="mt-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="ghost" 
                        className="text-primary p-0 flex items-center"
                        onClick={() => navigate("/emergency")}
                      >
                        Emergency Info <Check className="ml-1 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action with enhanced design */}
      <motion.section 
        className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Early detection is crucial for effective stroke treatment. Register now and take the first step toward better protection for you and your loved ones.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="text-lg px-8 bg-white text-blue-700 hover:bg-blue-100 shadow-lg"
                onClick={() => navigate("/registration")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Register Now
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 text-white border-white hover:bg-blue-700"
                onClick={() => navigate("/login")}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Footer with enhanced design */}
      <footer className="py-10 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BrainCircuit className="h-6 w-6" />
                <span className="text-xl font-bold">Stroke Sense</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Early detection technology for better stroke outcomes.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0">
                  Facebook
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-0">
                  Instagram
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Button 
                    variant="link" 
                    className="text-gray-400 hover:text-white p-0"
                    onClick={() => navigate("/education/symptoms")}
                  >
                    Stroke Symptoms
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="link" 
                    className="text-gray-400 hover:text-white p-0"
                    onClick={() => navigate("/education/prevention")}
                  >
                    Prevention Tips
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="link" 
                    className="text-gray-400 hover:text-white p-0"
                    onClick={() => navigate("/education/first-aid")}
                  >
                    First Aid
                  </Button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                Have questions about Stroke Sense?
              </p>
              <Button 
                variant="outline" 
                className="mt-4 border-gray-600 text-gray-300 hover:text-white hover:border-white"
              >
                Contact Support
              </Button>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Stroke Sense. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Button variant="link" className="text-gray-400 hover:text-white text-sm p-0">
                Privacy Policy
              </Button>
              <Button variant="link" className="text-gray-400 hover:text-white text-sm p-0">
                Terms of Service
              </Button>
              <Button variant="link" className="text-gray-400 hover:text-white text-sm p-0">
                Cookie Policy
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

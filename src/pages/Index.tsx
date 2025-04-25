
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Activity, Eye, MessageSquare, Phone } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <motion.header 
        className="bg-primary text-white py-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Stroke Sense</h1>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        className="py-12 bg-white"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Early Stroke Detection</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive mobile application for early stroke detection, timely assistance, and educational resources.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => navigate("/registration")}
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            Key Features
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-primary bg-opacity-10 p-4 mb-4">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Balance Detection</h3>
              <p className="text-gray-600">
                Measures balance stability to detect potential stroke symptoms.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-primary bg-opacity-10 p-4 mb-4">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Eye Tracking</h3>
              <p className="text-gray-600">
                Analyzes eye movement patterns for signs of neurological issues.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-primary bg-opacity-10 p-4 mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Speech Analysis</h3>
              <p className="text-gray-600">
                Evaluates speech clarity and patterns to identify slurring.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center text-center hover:shadow-lg transition-all duration-300"
              variants={fadeIn}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-full bg-medical-red bg-opacity-10 p-4 mb-4">
                <Phone className="h-8 w-8 text-medical-red" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Emergency Assistance</h3>
              <p className="text-gray-600">
                Quick access to emergency contacts and ambulance services.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl font-bold text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Step line */}
              <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Steps */}
              <div className="space-y-12">
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white text-2xl font-bold z-10">
                    1
                  </div>
                  <div className="ml-6 pt-3">
                    <h3 className="text-xl font-bold mb-2">Register Patient Information</h3>
                    <p className="text-gray-600">
                      Enter personal details, medical history, and emergency contacts.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white text-2xl font-bold z-10">
                    2
                  </div>
                  <div className="ml-6 pt-3">
                    <h3 className="text-xl font-bold mb-2">Regular Testing</h3>
                    <p className="text-gray-600">
                      Perform balance, eye tracking, and speech tests regularly to establish baseline data.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white text-2xl font-bold z-10">
                    3
                  </div>
                  <div className="ml-6 pt-3">
                    <h3 className="text-xl font-bold mb-2">Automated Analysis</h3>
                    <p className="text-gray-600">
                      Advanced algorithms analyze results and detect potential stroke signs.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 rounded-full bg-medical-red text-white text-2xl font-bold z-10">
                    4
                  </div>
                  <div className="ml-6 pt-3">
                    <h3 className="text-xl font-bold mb-2">Immediate Response</h3>
                    <p className="text-gray-600">
                      If stroke signs are detected, instantly access emergency assistance and contacts.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <motion.section 
        className="py-16 bg-primary text-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Early detection is crucial for effective stroke treatment. Register now and take the first step toward better protection.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 text-white border-white hover:bg-white hover:text-primary"
              onClick={() => navigate("/registration")}
            >
              Register Now
            </Button>
          </motion.div>
        </div>
      </motion.section>
      
      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BrainCircuit className="h-6 w-6" />
              <span className="text-xl font-bold">Stroke Sense</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Stroke Sense. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

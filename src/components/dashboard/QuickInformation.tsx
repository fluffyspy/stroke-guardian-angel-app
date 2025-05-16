
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const QuickInformation = () => {
  const navigate = useNavigate();

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
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
  );
};

export default QuickInformation;

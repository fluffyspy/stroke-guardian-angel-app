
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Patient } from "@/types";

interface WelcomeCardProps {
  patient: Patient | null;
}

const WelcomeCard = ({ patient }: WelcomeCardProps) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-2">
            {patient ? `Welcome back, ${patient.name}!` : "Welcome to Stroke Sense!"}
          </h2>
          <p className="text-gray-600">Your regular assessment helps us monitor your health more effectively.</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeCard;

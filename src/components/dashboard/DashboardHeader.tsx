
import { Brain, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { logoutUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  isLoggedIn: boolean;
}

const DashboardHeader = ({ isLoggedIn }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out successfully",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <Brain className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-bold text-primary">Stroke Sense</h1>
      </div>
      <div className="flex items-center space-x-3">
        {isLoggedIn ? (
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                onClick={() => navigate("/profile")}
              >
                Patient Profile
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          </>
        ) : (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardHeader;

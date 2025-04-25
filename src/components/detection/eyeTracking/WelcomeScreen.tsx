
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="text-center py-8">
      <Eye className="h-16 w-16 mx-auto mb-4 text-primary" />
      <h2 className="text-xl font-semibold mb-2">Eye Tracking Test</h2>
      <p className="mb-4 text-gray-600">
        This test will check your ability to move your eyes in different directions.
        You'll be asked to look in 8 different directions one by one.
        Each direction requires you to hold your gaze for 3 seconds.
      </p>
      <Button onClick={onStart} className="animate-pulse">Start Test</Button>
    </div>
  );
};

export default WelcomeScreen;

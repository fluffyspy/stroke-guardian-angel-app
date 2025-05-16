
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const RecentActivity = () => {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Your recent detection results</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-8 text-gray-500"
          >
            No recent detection activities.
            <p className="mt-2 text-sm">Start by selecting a detection module above.</p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentActivity;

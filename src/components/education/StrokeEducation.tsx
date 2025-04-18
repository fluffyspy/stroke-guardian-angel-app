
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, AlertTriangle, Heart, Brain } from "lucide-react";

const StrokeEducation = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Stroke Education</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="symptoms" className="mb-6">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="firstaid">First Aid</TabsTrigger>
          <TabsTrigger value="prevention">Prevention</TabsTrigger>
        </TabsList>
        
        <TabsContent value="symptoms">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Recognizing Stroke Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-700 mb-2">F.A.S.T. Warning Signs</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><span className="font-medium">F</span>ace Drooping: One side of the face droops or is numb. Ask the person to smile.</li>
                  <li><span className="font-medium">A</span>rm Weakness: One arm is weak or numb. Ask the person to raise both arms.</li>
                  <li><span className="font-medium">S</span>peech Difficulty: Speech is slurred, or the person is unable to speak or hard to understand.</li>
                  <li><span className="font-medium">T</span>ime to Call: If someone shows any of these symptoms, even if they go away, call emergency services.</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Other Stroke Symptoms:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Sudden numbness or weakness in the face, arm, or leg, especially on one side of the body</li>
                  <li>Sudden confusion, trouble speaking or understanding speech</li>
                  <li>Sudden trouble seeing in one or both eyes</li>
                  <li>Sudden trouble walking, dizziness, loss of balance or coordination</li>
                  <li>Sudden severe headache with no known cause</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Important:</h3>
                <p>Stroke symptoms come on suddenly and should be treated as a medical emergency. The longer the brain is deprived of blood flow, the greater the damage. Quick treatment is crucial.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="firstaid">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                First Aid for Stroke
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-700 mb-2">Immediate Action:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Call emergency services immediately (911/112/999) if you suspect a stroke</li>
                  <li>Note the time when symptoms first appeared</li>
                  <li>Perform the F.A.S.T. test to confirm stroke symptoms</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">What To Do:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Keep the person calm and still</li>
                  <li>If the person is conscious and able to swallow, give them water (no food, medications, or other drinks)</li>
                  <li>If the person is unconscious but breathing, place them in the recovery position</li>
                  <li>Monitor breathing and pulse</li>
                  <li>Be prepared to perform CPR if they become unresponsive and stop breathing</li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-700 mb-2">What NOT To Do:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Do not give aspirin, as some strokes are caused by bleeding in the brain</li>
                  <li>Do not give food or drinks other than water</li>
                  <li>Do not let the person go to sleep</li>
                  <li>Do not drive the person to the hospital yourself (call emergency services)</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Remember:</h3>
                <p>Time is critical. The faster a stroke victim receives treatment, the better their chances of recovery. Don't wait to see if symptoms improve.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prevention">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Stroke Prevention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Lifestyle Changes:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Maintain a healthy diet, low in saturated fats, trans fats, and cholesterol</li>
                  <li>Exercise regularly (at least 30 minutes of moderate activity most days)</li>
                  <li>Maintain a healthy weight</li>
                  <li>Quit smoking and avoid secondhand smoke</li>
                  <li>Limit alcohol consumption (no more than 1-2 drinks per day)</li>
                  <li>Manage stress effectively</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-700 mb-2">Medical Management:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Control blood pressure (aim for less than 120/80 mm Hg)</li>
                  <li>Manage diabetes effectively</li>
                  <li>Treat high cholesterol</li>
                  <li>Take medications as prescribed by your doctor</li>
                  <li>Get regular check-ups and monitor your risk factors</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Risk Factors You Can't Control:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Age (risk increases with age)</li>
                  <li>Gender (men have a higher risk at younger ages)</li>
                  <li>Race and ethnicity (African Americans, Hispanic Americans, and Native Americans have higher risk)</li>
                  <li>Family history of stroke</li>
                  <li>Personal history of stroke, TIA, or heart attack</li>
                </ul>
                <p className="mt-2 text-sm">While you can't change these factors, being aware of them can help you focus on managing risk factors you can control.</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-700 mb-2">Know Your Numbers:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Blood pressure</li>
                  <li>Cholesterol levels</li>
                  <li>Blood sugar levels</li>
                  <li>Body mass index (BMI)</li>
                </ul>
                <p className="mt-2 text-sm">Regular monitoring of these values will help you and your healthcare provider manage your risk effectively.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrokeEducation;

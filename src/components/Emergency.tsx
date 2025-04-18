
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Patient } from "@/types";
import { Phone, AlertTriangle, User } from "lucide-react";

const Emergency = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    } else {
      navigate("/registration");
    }
  }, [navigate]);

  const simulateEmergencyCall = (contactName: string) => {
    setCalling(true);
    setTimeout(() => {
      setCalling(false);
    }, 2000);
  };

  const simulateAmbulanceCall = () => {
    setCalling(true);
    setTimeout(() => {
      setCalling(false);
    }, 2000);
  };

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-medical-red">Emergency Assistance</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <Card className="mb-6 border-medical-red">
        <CardHeader className="bg-medical-red bg-opacity-10">
          <CardTitle className="text-lg flex items-center text-medical-red">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Emergency Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <div className="space-y-6">
            <Button 
              className="w-full h-16 text-lg font-bold flex items-center justify-center gap-3 bg-medical-red hover:bg-red-700"
              onClick={simulateAmbulanceCall}
              disabled={calling}
            >
              {calling ? "Calling..." : (
                <>
                  <Phone className="h-6 w-6" />
                  Call Ambulance
                </>
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-gray-500 text-sm">OR</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium text-gray-700">Contact Emergency Contacts:</h3>
              
              {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
                patient.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div className="rounded-full bg-primary bg-opacity-10 p-3 mr-3">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.relationship}</p>
                      <p className="text-sm">{contact.phoneNumber}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => simulateEmergencyCall(contact.name)}
                      disabled={calling}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {calling ? "Calling..." : "Call"}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No emergency contacts found.</p>
                  <Button
                    variant="link"
                    className="mt-2"
                    onClick={() => navigate("/registration")}
                  >
                    Add emergency contacts
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Stroke First Aid Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700 mb-2">Remember F.A.S.T.</h3>
              <ul className="list-disc list-inside space-y-2">
                <li><span className="font-medium">F</span>ace: Ask the person to smile. Does one side of the face droop?</li>
                <li><span className="font-medium">A</span>rms: Ask the person to raise both arms. Does one arm drift downward?</li>
                <li><span className="font-medium">S</span>peech: Ask the person to repeat a simple phrase. Is their speech slurred or strange?</li>
                <li><span className="font-medium">T</span>ime: If you observe any of these signs, call for emergency help immediately.</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Additional First Aid Steps:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Note the time when symptoms first appeared</li>
                <li>Keep the person comfortable and calm</li>
                <li>Do not give them anything to eat or drink</li>
                <li>If unconscious, place them in the recovery position</li>
                <li>Be prepared to perform CPR if they become unresponsive</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Emergency;

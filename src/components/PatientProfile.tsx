
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Patient } from "@/types";
import { User, Phone, Clock, FileText } from "lucide-react";

const PatientProfile = () => {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    const storedPatient = localStorage.getItem("patient");
    if (storedPatient) {
      setPatient(JSON.parse(storedPatient));
    } else {
      navigate("/registration");
    }
  }, [navigate]);

  if (!patient) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Patient Profile</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={patient.photoUrl} alt={patient.name} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <CardTitle>{patient.name}</CardTitle>
            <p className="text-sm text-gray-500">{patient.age} years old</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Height:</span>
                <span>{patient.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Weight:</span>
                <span>{patient.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">BMI:</span>
                <span>
                  {patient.height && patient.weight
                    ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">
              {patient.medicalHistory || "No medical history recorded."}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.emergencyContacts && patient.emergencyContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div className="rounded-full bg-primary bg-opacity-10 p-3 mr-3">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.relationship}</p>
                      <p className="text-sm">{contact.phoneNumber}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No emergency contacts added.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Detection History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No detection history available.
              <p className="mt-2 text-sm">Detection results will appear here after tests are performed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientProfile;

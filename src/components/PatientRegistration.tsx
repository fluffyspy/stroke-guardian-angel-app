
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Patient, EmergencyContact } from "@/types";

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [patient, setPatient] = useState<Patient>({
    name: "",
    age: 0,
    height: 0,
    weight: 0,
    medicalHistory: "",
    emergencyContacts: [],
  });
  const [currentContact, setCurrentContact] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phoneNumber: "",
  });

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatient({ ...patient, [name]: name === "age" || name === "height" || name === "weight" ? Number(value) : value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentContact({ ...currentContact, [name]: value });
  };

  const addEmergencyContact = () => {
    if (currentContact.name && currentContact.phoneNumber) {
      setPatient({
        ...patient,
        emergencyContacts: [...patient.emergencyContacts, { ...currentContact, id: Date.now().toString() }],
      });
      setCurrentContact({ name: "", relationship: "", phoneNumber: "" });
    }
  };

  const handleSubmit = () => {
    // Here you would normally send data to a backend
    localStorage.setItem("patient", JSON.stringify(patient));
    navigate("/dashboard");
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Patient Registration</CardTitle>
          <CardDescription className="text-center">
            Step {step} of 3: {step === 1 ? "Basic Information" : step === 2 ? "Medical History" : "Emergency Contacts"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  value={patient.name}
                  onChange={handlePatientChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Enter your age"
                  value={patient.age || ""}
                  onChange={handlePatientChange}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="Height in cm"
                    value={patient.height || ""}
                    onChange={handlePatientChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    placeholder="Weight in kg"
                    value={patient.weight || ""}
                    onChange={handlePatientChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">Click to upload a photo</p>
                  <input type="file" accept="image/*" className="hidden" id="photo-upload" />
                  <Button variant="outline" className="mt-2" onClick={() => document.getElementById("photo-upload")?.click()}>
                    Upload Photo
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  placeholder="Enter any relevant medical history or conditions"
                  value={patient.medicalHistory}
                  onChange={handlePatientChange}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Voice Sample</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-500">Record a voice sample for speech analysis</p>
                  <Button variant="outline" className="mt-2">
                    Record Voice
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Emergency Contacts</Label>
                {patient.emergencyContacts.length > 0 ? (
                  <div className="space-y-2">
                    {patient.emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.relationship} - {contact.phoneNumber}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPatient({
                            ...patient,
                            emergencyContacts: patient.emergencyContacts.filter(c => c.id !== contact.id)
                          })}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No emergency contacts added yet.</p>
                )}
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="contactName">Contact Name</Label>
                <Input
                  id="contactName"
                  name="name"
                  placeholder="Contact's full name"
                  value={currentContact.name}
                  onChange={handleContactChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Input
                  id="relationship"
                  name="relationship"
                  placeholder="e.g. Spouse, Child, Sibling"
                  value={currentContact.relationship}
                  onChange={handleContactChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Contact's phone number"
                  value={currentContact.phoneNumber}
                  onChange={handleContactChange}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={addEmergencyContact}
                disabled={!currentContact.name || !currentContact.phoneNumber}
              >
                Add Contact
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          {step < 3 ? (
            <Button onClick={nextStep}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Complete Registration</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PatientRegistration;

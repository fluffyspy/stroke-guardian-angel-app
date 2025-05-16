import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Patient, EmergencyContact } from "@/types";
import { registerUser } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

const PatientRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<number>(1);
  const [patient, setPatient] = useState<Patient>({
    name: "",
    email: "",
    age: 0,
    height: 0,
    weight: 0,
    medicalHistory: "",
    emergencyContacts: [],
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentContact, setCurrentContact] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phoneNumber: "",
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Register the user with the registration data
      await registerUser({
        ...patient,
        password
      });
      
      toast({
        title: "Registration successful",
        description: "Welcome to Stroke Sense!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Patient Registration</CardTitle>
          <CardDescription className="text-center">
            Step {step} of 4: {
              step === 1 ? "Account Information" : 
              step === 2 ? "Basic Information" : 
              step === 3 ? "Medical History" : 
              "Emergency Contacts"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={patient.email}
                  onChange={handlePatientChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {step === 2 && (
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

          {step === 3 && (
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

          {step === 4 && (
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
            <Button variant="outline" onClick={prevStep} disabled={isLoading}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          {step < 4 ? (
            <Button onClick={nextStep} disabled={isLoading}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : (
                "Complete Registration"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PatientRegistration;


import { Patient } from "@/types";
import { authAPI, userAPI, UserCreate, UserOut, EmergencyContact as APIEmergencyContact } from "./apiService";

// Interface for login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for registration data
interface RegistrationData extends Patient {
  password: string;
}

// Helper function to convert API emergency contact to local type
const convertEmergencyContact = (apiContact: APIEmergencyContact) => ({
  id: `${Date.now()}-${Math.random()}`, // Generate local ID
  name: apiContact.name,
  relationship: apiContact.relation,
  phoneNumber: apiContact.phone
});

// Helper function to convert local emergency contact to API type
const convertToAPIEmergencyContact = (localContact: any): APIEmergencyContact => ({
  name: localContact.name,
  relation: localContact.relationship,
  phone: localContact.phoneNumber
});

// Helper function to convert API user to local Patient type
const convertUserToPatient = (apiUser: UserOut): Patient => ({
  id: apiUser._id || undefined,
  name: apiUser.name,
  email: apiUser.email,
  age: 0, // These fields aren't in the API schema, so we set defaults
  height: 0,
  weight: 0,
  medicalHistory: "",
  emergencyContacts: apiUser.emergency_contacts.map(convertEmergencyContact)
});

// Check if user is already logged in
export const checkUserSession = async (): Promise<Patient | null> => {
  try {
    const storedPatient = localStorage.getItem("patient");
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    
    if (!storedPatient || !token || !userId) {
      return null;
    }
    
    // Try to fetch fresh user data from the backend
    try {
      const apiUser = await userAPI.getUser(userId);
      const patient = convertUserToPatient(apiUser);
      
      // Update stored patient data with fresh data
      localStorage.setItem("patient", JSON.stringify(patient));
      return patient;
    } catch (error) {
      console.error("Failed to fetch fresh user data:", error);
      // Fall back to stored data if API call fails
      return JSON.parse(storedPatient);
    }
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
};

// Login user with email and password
export const loginUser = async (credentials: LoginCredentials): Promise<Patient> => {
  try {
    // Call the backend login API
    const loginResponse = await authAPI.login({
      email: credentials.email,
      password: credentials.password
    });
    
    // The login response should contain user data and token
    // Adjust this based on your actual backend response structure
    let user: UserOut;
    let token: string;
    
    if (loginResponse.user && loginResponse.token) {
      user = loginResponse.user;
      token = loginResponse.token;
    } else if (loginResponse.access_token) {
      // If token is returned but user data isn't, fetch user data separately
      token = loginResponse.access_token;
      // You might need to decode the token to get user ID or make another API call
      // For now, we'll assume the response includes user data
      user = loginResponse.user || loginResponse;
    } else {
      // Handle case where login response format is different
      token = `backend-token-${Date.now()}`;
      user = loginResponse;
    }
    
    const patient = convertUserToPatient(user);
    
    // Store auth data
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", user._id || '');
    localStorage.setItem("patient", JSON.stringify(patient));
    
    return patient;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register new user
export const registerUser = async (userData: RegistrationData): Promise<Patient> => {
  try {
    const { password, age, height, weight, medicalHistory, ...patientData } = userData;
    
    // Convert emergency contacts to API format
    const apiEmergencyContacts = userData.emergencyContacts.map(convertToAPIEmergencyContact);
    
    // Create user data for API
    const apiUserData: UserCreate = {
      name: patientData.name,
      email: patientData.email,
      password,
      role: 'patient',
      emergency_contacts: apiEmergencyContacts
    };
    
    // Call the backend signup API
    const apiUser = await authAPI.signup(apiUserData);
    
    const patient = convertUserToPatient(apiUser);
    
    // For now, create a mock token since the signup response might not include one
    // Adjust this based on your actual backend response
    const token = `backend-token-${Date.now()}`;
    
    // Store auth data
    localStorage.setItem("authToken", token);
    localStorage.setItem("userId", apiUser._id || '');
    localStorage.setItem("patient", JSON.stringify(patient));
    
    return patient;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  // Clear local storage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("patient");
};

// Get user data
export const getUserData = async (): Promise<Patient> => {
  const patientData = localStorage.getItem("patient");
  const userId = localStorage.getItem("userId");
  
  if (!patientData || !userId) {
    throw new Error("Not authenticated");
  }
  
  try {
    // Try to get fresh data from backend
    const apiUser = await userAPI.getUser(userId);
    const patient = convertUserToPatient(apiUser);
    
    // Update stored data
    localStorage.setItem("patient", JSON.stringify(patient));
    return patient;
  } catch (error) {
    console.error("Failed to fetch fresh user data:", error);
    // Fall back to stored data
    return JSON.parse(patientData);
  }
};

// Update user data
export const updateUserData = async (userId: string, updateData: Partial<Patient>): Promise<Patient> => {
  try {
    const apiUpdateData: any = {};
    
    if (updateData.name) apiUpdateData.name = updateData.name;
    if (updateData.emergencyContacts) {
      apiUpdateData.emergency_contacts = updateData.emergencyContacts.map(convertToAPIEmergencyContact);
    }
    
    const updatedUser = await userAPI.updateUser(userId, apiUpdateData);
    const patient = convertUserToPatient(updatedUser);
    
    // Update stored data
    localStorage.setItem("patient", JSON.stringify(patient));
    return patient;
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};


import { Patient } from "@/types";

// Mock API endpoint for local development
// In a real app, this would be replaced with actual backend endpoints
const API_BASE_URL = "http://localhost:5000/api";

// Interface for login credentials
interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for registration data
interface RegistrationData extends Patient {
  password: string;
}

// Check if user is already logged in
export const checkUserSession = async (): Promise<Patient | null> => {
  try {
    // Check if there's patient data in localStorage
    const storedPatient = localStorage.getItem("patient");
    const token = localStorage.getItem("authToken");
    
    if (!storedPatient || !token) {
      return null;
    }
    
    // For now, simply return the stored patient data
    return JSON.parse(storedPatient);
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
};

// Login user with email and password
export const loginUser = async (credentials: LoginCredentials): Promise<Patient> => {
  try {
    // For demo purposes, we'll just check the localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Find user with matching email
    const user = users.find((u: {email: string, password: string, patient: Patient}) => 
      u.email === credentials.email
    );
    
    if (!user) {
      throw new Error("User not found. Please register first.");
    }
    
    // Check password (IMPORTANT: In a real app, this would use proper hashing)
    if (user.password !== credentials.password) {
      throw new Error("Invalid password.");
    }
    
    // Create a mock token
    const token = `mock-jwt-token-${Date.now()}`;
    
    // Store auth token and user data
    localStorage.setItem("authToken", token);
    localStorage.setItem("patient", JSON.stringify(user.patient));
    
    return user.patient;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register new user
export const registerUser = async (userData: RegistrationData): Promise<Patient> => {
  try {
    const { password, ...patientData } = userData;
    
    // Add an ID to the patient
    const patient = {
      ...patientData,
      id: `user-${Date.now()}`
    };
    
    // Create a user object
    const user = {
      email: patient.email,
      password,
      patient
    };
    
    // Get existing users or initialize empty array
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Check if email already exists
    const emailExists = existingUsers.some((u: {email: string}) => u.email === patient.email);
    if (emailExists) {
      throw new Error("Email already registered. Please login instead.");
    }
    
    // Add new user to the array
    const users = [...existingUsers, user];
    
    // Store in localStorage
    localStorage.setItem("users", JSON.stringify(users));
    
    // Create a mock token
    const token = `mock-jwt-token-${Date.now()}`;
    
    // Store auth token and user data
    localStorage.setItem("authToken", token);
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
  localStorage.removeItem("patient");
};

// Get user data
export const getUserData = async (): Promise<Patient> => {
  const patientData = localStorage.getItem("patient");
  
  if (!patientData) {
    throw new Error("Not authenticated");
  }
  
  return JSON.parse(patientData);
};

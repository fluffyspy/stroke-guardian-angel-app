
import { Patient } from "@/types";

// Base API URL - replace with your actual backend URL
const API_BASE_URL = "http://localhost:5000/api"; // Replace with your actual backend URL

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
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      // Store the user data locally
      localStorage.setItem("patient", JSON.stringify(userData.patient));
      return userData.patient;
    } else {
      // Clear invalid token
      localStorage.removeItem("authToken");
      localStorage.removeItem("patient");
      return null;
    }
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<Patient> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to login");
    }
    
    const data = await response.json();
    
    // Store auth token and user data
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("patient", JSON.stringify(data.patient));
    
    return data.patient;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register new user
export const registerUser = async (userData: RegistrationData): Promise<Patient> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to register");
    }
    
    const data = await response.json();
    
    // Store auth token and user data
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("patient", JSON.stringify(data.patient));
    
    return data.patient;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    const token = localStorage.getItem("authToken");
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage regardless of API response
    localStorage.removeItem("authToken");
    localStorage.removeItem("patient");
  }
};

// Get user data
export const getUserData = async (): Promise<Patient> => {
  const token = localStorage.getItem("authToken");
  
  if (!token) {
    throw new Error("Not authenticated");
  }
  
  const response = await fetch(`${API_BASE_URL}/auth/user`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error("Failed to get user data");
  }
  
  const data = await response.json();
  return data.patient;
};

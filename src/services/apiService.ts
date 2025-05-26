
// Base API configuration and utility functions
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' // Replace with your actual backend URL
  : 'http://localhost:8000'; // Adjust port if needed

// Types based on your OpenAPI schema
export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'patient' | 'admin';
  emergency_contacts?: EmergencyContact[];
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserOut {
  _id: string | null;
  name: string;
  email: string;
  role: string;
  created_at: string;
  emergency_contacts: EmergencyContact[];
}

export interface UserUpdate {
  name?: string | null;
  role?: 'patient' | 'admin' | null;
  emergency_contacts?: EmergencyContact[] | null;
}

export interface SensorData {
  accel: number[][];
  gyro: number[][];
  user_id: string;
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Authentication endpoints
export const authAPI = {
  signup: async (userData: UserCreate): Promise<UserOut> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials: UserLogin): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  }
};

// User management endpoints
export const userAPI = {
  createUser: async (userData: UserCreate): Promise<UserOut> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  getUser: async (userId: string): Promise<UserOut> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateUser: async (userId: string, userData: UserUpdate): Promise<UserOut> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  deleteUser: async (userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await handleResponse(response);
  }
};

// Detection endpoints
export const detectionAPI = {
  analyzeBalance: async (sensorData: SensorData): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/analyze_balance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sensorData)
    });
    return handleResponse(response);
  },

  analyzeSpeech: async (userId: string, audioFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', audioFile);

    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/analyze_speech?user_id=${userId}`, {
      method: 'POST',
      headers,
      body: formData
    });
    return handleResponse(response);
  }
};

// Assistance endpoints
export const assistanceAPI = {
  getUserTimelyAssistance: async (userId: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/assistance/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

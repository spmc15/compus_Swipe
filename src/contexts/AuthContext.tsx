import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  profilePicture?: string;
  score: number;
  followers: number;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  college: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          api.setAuthToken(savedToken);
          const response = await api.get('/auth/me');
          if (response.success) {
            setUser(response.user);
            setToken(savedToken);
          } else {
            localStorage.removeItem('token');
            api.setAuthToken(null);
            setToken(null);
          }
        } catch (error) {
          localStorage.removeItem('token');
          api.setAuthToken(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        const { token: newToken, user: userData } = response;
        
        localStorage.setItem('token', newToken);
        api.setAuthToken(newToken);
        setToken(newToken);
        setUser(userData);
        
        toast.success(`Welcome back, ${userData.name}!`);
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.success) {
        const { token: newToken, user: newUser } = response;
        
        localStorage.setItem('token', newToken);
        api.setAuthToken(newToken);
        setToken(newToken);
        setUser(newUser);
        
        toast.success(`Welcome to Campus Swipe, ${newUser.name}!`);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
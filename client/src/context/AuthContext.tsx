import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../api/client';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    preferred_city: string;
    phone_number?: string;
  }) => Promise<UserProfile>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.auth.getMe();
      setUser(response.user);
    } catch (err) {
      console.warn('Session expired or invalid, logging out:', err);
      removeStoredToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    const response = await api.auth.login({ email, password });
    setStoredToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (payload: {
    full_name: string;
    email: string;
    password: string;
    preferred_city: string;
    phone_number?: string;
  }): Promise<UserProfile> => {
    const response = await api.auth.register(payload);
    setStoredToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const response = await api.auth.updateProfile(data);
    setUser(response.user);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

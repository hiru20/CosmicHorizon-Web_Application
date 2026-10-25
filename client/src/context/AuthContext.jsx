import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useNotification } from './NotificationContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('cosmic_token'));
  const [loading, setLoading] = useState(true);
  const { notifySuccess, notifyError, notifyInfo } = useNotification();

  // Verify and fetch profile on initial load if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('cosmic_token');
      if (storedToken) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setToken(storedToken);
        } catch (error) {
          console.warn('[Auth Initialization] Session expired or invalid');
          localStorage.removeItem('cosmic_token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = useCallback(
    async (email, password) => {
      try {
        const data = await authService.login(email, password);
        localStorage.setItem('cosmic_token', data.token);
        setUser(data.user);
        setToken(data.token);
        notifySuccess(`Welcome back, Astronaut ${data.user.name}!`);
        return { success: true };
      } catch (error) {
        notifyError(error.message || 'Login failed');
        return { success: false, error: error.message };
      }
    },
    [notifySuccess, notifyError]
  );

  // Register handler
  const register = useCallback(
    async (name, email, password) => {
      try {
        const data = await authService.register(name, email, password);
        localStorage.setItem('cosmic_token', data.token);
        setUser(data.user);
        setToken(data.token);
        notifySuccess(`Welcome aboard CosmicHorizon, ${data.user.name}!`);
        return { success: true };
      } catch (error) {
        notifyError(error.message || 'Registration failed');
        return { success: false, error: error.message };
      }
    },
    [notifySuccess, notifyError]
  );

  // Logout handler
  const logout = useCallback(() => {
    localStorage.removeItem('cosmic_token');
    setUser(null);
    setToken(null);
    notifyInfo('You have logged out safely.');
  }, [notifyInfo]);

  // Update profile handler
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const updated = await authService.updateProfile(profileData);
        setUser(updated);
        notifySuccess('Profile updated successfully');
        return { success: true, user: updated };
      } catch (error) {
        notifyError(error.message || 'Failed to update profile');
        return { success: false, error: error.message };
      }
    },
    [notifySuccess, notifyError]
  );

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

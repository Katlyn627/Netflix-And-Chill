import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUserId = await ApiService.getUserId();
      if (storedUserId) {
        setUserId(storedUserId);
        const userData = await ApiService.getUser(storedUserId);
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      const response = await ApiService.createUser(userData);
      setUserId(response.user.id);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await ApiService.clearUserId();
      setUserId(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await ApiService.updateProfile(userId, updates);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!userId) return;
    try {
      const userData = await ApiService.getUser(userId);
      setUser(userData.user);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        user,
        loading,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    const res = await api.post('/api/auth/login', formData);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    const res = await api.post('/api/auth/register', formData);
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('otp', otp);
    const res = await api.post('/api/auth/verify', formData);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.get('/api/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, verifyOTP, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

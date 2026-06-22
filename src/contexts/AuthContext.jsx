import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    const token = localStorage.getItem('ttt_token') || sessionStorage.getItem('ttt_token');
    if (!token) { setLoading(false); return; }

    try {
      const session = await api.getSession();
      setUser({ ...session, token });
    } catch {
      localStorage.removeItem('ttt_token');
      sessionStorage.removeItem('ttt_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = async (code, rememberMe) => {
    try {
      const data = await api.login(code, rememberMe);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('ttt_token', data.token);
      setUser({ ...data.contact, token: data.token });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logoutUser = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout: logoutUser, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
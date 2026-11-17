import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('campusrag_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('campusrag_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('campusrag_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Session verification notice:", err);
          // Only clear session if token is explicitly expired/unauthorized (401)
          if (err.response && err.response.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('campusrag_token', access_token);
    localStorage.setItem('campusrag_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('campusrag_token', access_token);
    localStorage.setItem('campusrag_user', JSON.stringify(userData));
    return userData;
  };

  const googleLogin = async (data) => {
    const res = await authAPI.googleLogin(data);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('campusrag_token', access_token);
    localStorage.setItem('campusrag_user', JSON.stringify(userData));
    return userData;
  };

  const quickPortalLogin = async (role) => {
    const res = await authAPI.quickPortalLogin(role);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('campusrag_token', access_token);
    localStorage.setItem('campusrag_user', JSON.stringify(userData));
    return userData;
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    const updatedUser = res.data;
    setUser(updatedUser);
    localStorage.setItem('campusrag_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const updateUser = (updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('campusrag_user', JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('campusrag_token');
    localStorage.removeItem('campusrag_user');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      googleLogin,
      quickPortalLogin,
      updateProfile,
      updateUser,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

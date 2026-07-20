import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('cinema_token');
        if (savedToken) {
          setToken(savedToken);
          const res = await authApi.get('/me');
          setUser(res.data.user);
        }
      } catch (e) {
        await AsyncStorage.removeItem('cinema_token');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.post('/login', { email, password });
    const { token: newToken, user: newUser } = res.data;
    await AsyncStorage.setItem('cinema_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('cinema_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.get('/me');
      setUser(res.data.user);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      const loginState = await AsyncStorage.getItem('loginState');
      setIsLoggedIn(JSON.parse(loginState) === true);
    };
    checkLogin();
  }, []);

  const login = async () => {
    await AsyncStorage.setItem('loginState', JSON.stringify(true));
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.setItem('loginState', JSON.stringify(false));
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

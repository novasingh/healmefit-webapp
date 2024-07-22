// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedIsAuthenticated = sessionStorage.getItem('isAuthenticated');
    return storedIsAuthenticated === 'true';
  });

  const [role, setRole] = useState(() => {
    return sessionStorage.getItem('role') || '';
  });

  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem('role', role);
  }, [role]);

  const login = (loggedRole) => {
    setIsAuthenticated(true);
    setRole(loggedRole);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

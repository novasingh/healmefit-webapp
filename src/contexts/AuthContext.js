// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(()=>{
        const storedAccessToken = sessionStorage.getItem('accessToken');
    return storedAccessToken
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedIsAuthenticated = sessionStorage.getItem('isAuthenticated');
    return storedIsAuthenticated === 'true';
  });

  const [role, setRole] = useState(() => {
    return sessionStorage.getItem('role') || '';
  });
  useEffect(() => {
    sessionStorage.setItem('accessToken', accessToken);
  }, [accessToken]);

  useEffect(() => {
    sessionStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    sessionStorage.setItem('role', role);
  }, [role]);

  const login = (loggedRole, token) => {
    setAccessToken(token)
    setIsAuthenticated(true);
    setRole(loggedRole);
  };

  const logout = () => {
    setAccessToken()
    setIsAuthenticated(false);
    setRole('');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

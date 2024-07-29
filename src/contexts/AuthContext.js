import React, { createContext, useState, useEffect } from "react";
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => {
    const storedAccessToken = sessionStorage.getItem("accessToken");
    return storedAccessToken;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const storedIsAuthenticated = sessionStorage.getItem("isAuthenticated");
    return storedIsAuthenticated === "true";
  });

  const [role, setRole] = useState(() => {
    return sessionStorage.getItem("role") || "";
  });
  const [userData, setUserData] = useState(() => {
    return JSON.parse(sessionStorage.getItem("user")) || "";
  });

  useEffect(() => {
    if (accessToken || isAuthenticated || role || userData) {
      sessionStorage.setItem("token", accessToken);
      sessionStorage.setItem("isAuthenticated", isAuthenticated);
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
  }, [accessToken, isAuthenticated, role, userData]);

  const login = (user, token) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    setUserData(user);
    setRole(user.role);
  };

  const logout = () => {
    setAccessToken();
    setIsAuthenticated(false);
    setRole("");
    setUserData("")
    sessionStorage.clear()
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, accessToken, userData, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

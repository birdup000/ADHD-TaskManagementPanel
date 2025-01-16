"use client";
// components/AuthContext.js
import { createContext, useState, useEffect } from "react";
import { verifyToken } from "../agixt/lib/auth-service";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = document.cookie.replace(/(?:(?:^|,*\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (token) {
      try {
        const payload = verifyToken(token);
        setUser(payload);
      } catch (error) {
        console.error("Invalid token.");
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    setUser(verifyToken(token));
    document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; HttpOnly; Secure`;
  };

  const logout = () => {
    setUser(null);
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
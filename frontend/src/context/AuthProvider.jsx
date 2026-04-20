import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import API from "../api/axios";

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(true);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }
    return null;
  });

  const fetchMe = async () => {
    const token = localStorage.getItem("token");
    const hasValidToken = token && token !== "undefined" && token !== "null";

    if (!hasValidToken) {
      localStorage.removeItem("token");
      setUser(null);
      localStorage.removeItem("user");
      return null;
    }

    try {
      const res = await API.get("/auth/me");
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch {
      // Token invalid/expired or backend unavailable
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    // Ensure user is real and up-to-date (not a stale cached object)
    const initAuth = async () => {
      try {
        await fetchMe();
      } finally {
        setAuthLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = async (dataOrToken) => {
    const token =
      typeof dataOrToken === "string" ? dataOrToken : dataOrToken?.token;

    if (!token) {
      throw new Error("Login token is missing");
    }

    localStorage.setItem("token", token);
    return await fetchMe();
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, authLoading, login, logout, refreshUser: fetchMe }}
    >
      {children}
    </AuthContext.Provider>
  );
};
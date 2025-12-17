import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "./utils/api";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await api.get("/auth/me");
        if (response.data.success) {
          // Update user data in localStorage
          const user = response.data.user;
          localStorage.setItem("name", user.fullName || user.username);
          localStorage.setItem("role", user.role);
          localStorage.setItem("userEmail", user.email);
          localStorage.setItem("username", user.username);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "'Cause', sans-serif"
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


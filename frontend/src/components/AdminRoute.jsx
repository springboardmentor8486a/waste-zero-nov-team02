import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminRoute - Protects routes that require admin role
 */
export default function AdminRoute({ children }) {
  const role = localStorage.getItem('role');
  
  if (role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}


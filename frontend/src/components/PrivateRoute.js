// PrivateRoute component
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';

export default function PrivateRoute({ children, roles }) {
  const user = getCurrentUser();
  const token = localStorage.getItem('token'); // <-- Add this line

  // Check for both user and token
  if (!user || !token) return <Navigate to="/login" replace />;

  // Role-based access
  if (roles && roles.length && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
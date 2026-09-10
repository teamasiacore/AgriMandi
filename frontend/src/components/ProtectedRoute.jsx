import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const location = useLocation();
  const rawUser = localStorage.getItem('agri_user');
  
  if (!rawUser) {
    // Redirect to login page with notice and return path
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}&role=${requiredRole || 'FARMER'}`} replace />;
  }

  try {
    const user = JSON.parse(rawUser);
    if (requiredRole && user.role !== requiredRole) {
      // If a logged-in Buyer tries to access /farmer, redirect them to /buyer, and vice-versa
      return <Navigate to={user.role === 'BUYER' ? '/buyer' : '/farmer'} replace />;
    }
    return children;
  } catch (e) {
    localStorage.removeItem('agri_user');
    return <Navigate to="/login" replace />;
  }
}

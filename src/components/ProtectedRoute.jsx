import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loaded } = useAuth();
  if (!loaded) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoadingState } from '../common/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, hostProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoadingState message="Verifying Host Credentials & Whitelist..." />;
  }

  if (!user) {
    return <Navigate to="/host/login" state={{ from: location }} replace />;
  }

  if (!hostProfile || !hostProfile.approved) {
    return <Navigate to="/host/unauthorized" replace />;
  }

  return <>{children}</>;
};

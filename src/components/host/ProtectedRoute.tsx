import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoadingState } from '../common/LoadingState';
import { APPROVED_HOSTS } from '../../utils/constants';

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

  const normalizedEmail = (user.email || '').toLowerCase().trim();
  const isApproved = !!APPROVED_HOSTS[normalizedEmail];

  if (!isApproved) {
    return <Navigate to="/host/unauthorized" replace />;
  }

  if (!hostProfile) {
    return <PageLoadingState message="Syncing Host Profile..." />;
  }

  return <>{children}</>;
};

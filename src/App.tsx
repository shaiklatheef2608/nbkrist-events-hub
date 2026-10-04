import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { EventsPage } from './pages/public/EventsPage';
import { EventDetailsPage } from './pages/public/EventDetailsPage';
import { SearchPage } from './pages/public/SearchPage';
import { ViewedEventsPage } from './pages/public/ViewedEventsPage';

import { HostLoginPage } from './pages/host/HostLoginPage';
import { HostRegisterPage } from './pages/host/HostRegisterPage';
import { HostForgotPasswordPage } from './pages/host/HostForgotPasswordPage';
import { HostUnauthorizedPage } from './pages/host/HostUnauthorizedPage';

import { HostLayout } from './components/host/HostLayout';
import { ProtectedRoute } from './components/host/ProtectedRoute';
import { HostDashboardPage } from './pages/host/HostDashboardPage';
import { HostEventsPage } from './pages/host/HostEventsPage';
import { HostCreateEventPage } from './pages/host/HostCreateEventPage';
import { HostEditEventPage } from './pages/host/HostEditEventPage';
import { HostManageEventPage } from './pages/host/HostManageEventPage';
import { HostRegistrationSettingsPage } from './pages/host/HostRegistrationSettingsPage';
import { HostProfilePage } from './pages/host/HostProfilePage';

import { ensureApprovedHostsSeeded } from './lib/firestore';

export default function App() {
  useEffect(() => {
    // Seed approved hosts whitelist records in Firestore if needed
    ensureApprovedHostsSeeded().catch((err) => {
      console.debug("Approved hosts registry init check:", err);
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Public Routes with Institutional Banner, Navbar, and Footer */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:eventId" element={<EventDetailsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/viewed-events" element={<ViewedEventsPage />} />
            <Route path="/my-registrations" element={<Navigate to="/viewed-events" replace />} />

            {/* Public Host Authentication Pages */}
            <Route path="/host/login" element={<HostLoginPage />} />
            <Route path="/host/register" element={<HostRegisterPage />} />
            <Route path="/host/forgot-password" element={<HostForgotPasswordPage />} />
            <Route path="/host/unauthorized" element={<HostUnauthorizedPage />} />
          </Route>

          {/* Protected Host Console Routes */}
          <Route
            path="/host"
            element={
              <ProtectedRoute>
                <HostLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/host/dashboard" replace />} />
            <Route path="dashboard" element={<HostDashboardPage />} />
            <Route path="events" element={<HostEventsPage />} />
            <Route path="events/create" element={<HostCreateEventPage />} />
            <Route path="events/:eventId/edit" element={<HostEditEventPage />} />
            <Route path="events/:eventId/manage" element={<HostManageEventPage />} />
            <Route path="registration-settings" element={<HostRegistrationSettingsPage />} />
            <Route path="profile" element={<HostProfilePage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

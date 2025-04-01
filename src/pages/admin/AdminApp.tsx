
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { AdminProvider } from '@/contexts/AdminContext';
import { AdminUsersProvider } from '@/contexts/AdminUsersContext';
import ProfilesPage from './ProfilesPage';
import AdminProjects from './AdminProjects';
import NotificationManagement from './NotificationManagement';
import ProjectUpdateNotifications from './ProjectUpdateNotifications';

const AdminApp = () => {
  console.log("AdminApp rendering...");
  
  useEffect(() => {
    console.log("AdminApp mounted");
  }, []);
  
  return (
    <AdminProvider>
      <AdminUsersProvider>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/projects" element={<AdminProjects />} />
            <Route path="/notifications" element={<NotificationManagement />} />
            <Route path="/project-updates" element={<ProjectUpdateNotifications />} />
            {/* Add placeholder routes for other admin pages */}
            <Route path="/scheduled-payments" element={<div>Paiements programmés</div>} />
            <Route path="/withdrawal-requests" element={<div>Demandes de retrait</div>} />
            <Route path="/bank-transfers" element={<div>Virements bancaires</div>} />
            <Route path="/settings" element={<div>Paramètres</div>} />
          </Route>
        </Routes>
      </AdminUsersProvider>
    </AdminProvider>
  );
};

export default AdminApp;


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import { AdminProvider } from '@/contexts/AdminContext';
import { AdminUsersProvider } from '@/contexts/AdminUsersContext';
import ProfileManagement from './ProfileManagement';
import ProfilesPage from './ProfilesPage';

const AdminApp = () => {
  console.log("AdminApp rendering...");
  
  return (
    <AdminProvider>
      <AdminUsersProvider>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/profiles" element={<ProfilesPage />} />
            <Route path="/profile-management" element={<ProfileManagement />} />
            {/* Other routes go here */}
          </Route>
        </Routes>
      </AdminUsersProvider>
    </AdminProvider>
  );
};

export default AdminApp;


import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminDashboardPage from './AdminDashboardPage';
import AdminKPIPage from './AdminKPIPage';
import { AdminProvider } from '@/contexts/AdminContext';
import { AdminUsersProvider } from '@/contexts/AdminUsersContext';
import AdminProjects from './AdminProjects';
import NotificationManagement from './NotificationManagement';
import ProjectUpdateNotifications from './ProjectUpdateNotifications';
import WithdrawalManagement from './WithdrawalManagement';
import BankTransferManagement from './BankTransferManagement';
import ScheduledPaymentsManagement from './ScheduledPaymentsManagement';
import ProfileManagement from './ProfileManagement';

const AdminApp = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log("AdminApp mounted, current path:", location.pathname);
  }, [location]);
  
  return (
    <AdminProvider>
      <AdminUsersProvider>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="kpi" element={<AdminKPIPage />} />
            <Route path="profiles" element={<ProfileManagement />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="project-updates" element={<ProjectUpdateNotifications />} />
            <Route path="withdrawal-requests" element={<WithdrawalManagement />} />
            <Route path="bank-transfers" element={<BankTransferManagement />} />
            <Route path="scheduled-payments" element={<ScheduledPaymentsManagement />} />
            <Route path="settings" element={<div>Paramètres</div>} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </AdminUsersProvider>
    </AdminProvider>
  );
};

export default AdminApp;

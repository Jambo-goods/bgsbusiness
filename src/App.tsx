
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AdminProvider } from './contexts/AdminContext';

// Lazy load components
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const About = lazy(() => import('./pages/About'));

// Admin pages
const AdminIndex = lazy(() => import('./pages/admin/index'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const BankTransferManagement = lazy(() => import('./pages/admin/BankTransferManagement'));
const WithdrawalManagement = lazy(() => import('./pages/admin/WithdrawalManagement'));
const ProjectManagement = lazy(() => import('./pages/admin/ProjectManagement'));
const ProfileManagement = lazy(() => import('./pages/admin/ProfileManagement'));
const NotificationManagement = lazy(() => import('./pages/admin/NotificationManagement'));

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AdminProvider>
          <Router>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bgs-blue"></div></div>}>
              <Routes>
                {/* Main site routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                
                {/* Admin interface routes */}
                <Route path="/admin" element={<AdminIndex />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="profiles" element={<ProfileManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="bank-transfers" element={<BankTransferManagement />} />
                  <Route path="withdrawals" element={<WithdrawalManagement />} />
                  <Route path="projects" element={<ProjectManagement />} />
                  <Route path="notifications" element={<NotificationManagement />} />
                </Route>
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster position="top-right" richColors />
        </AdminProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

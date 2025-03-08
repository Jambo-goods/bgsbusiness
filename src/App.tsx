import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Index from './pages/Index';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserRegistrations from './pages/admin/UserRegistrations';
import ProfileManagement from './pages/admin/ProfileManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import WalletManagement from './pages/admin/WalletManagement';
import WithdrawalManagement from './pages/admin/WithdrawalManagement';
import NotificationManagement from './pages/admin/NotificationManagement';
import NotFound from './pages/NotFound';
import AdminLayout from './components/admin/AdminLayout';
import { Toaster } from '@/components/ui/sonner';
import FinanceDashboard from './pages/admin/FinanceDashboard';

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Tableau de bord utilisateur */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Pages admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UserRegistrations /></AdminLayout>} />
          <Route path="/admin/profiles" element={<AdminLayout><ProfileManagement /></AdminLayout>} />
          <Route path="/admin/finance" element={<AdminLayout><FinanceDashboard /></AdminLayout>} />
          <Route path="/admin/projects" element={<AdminLayout><ProjectManagement /></AdminLayout>} />
          <Route path="/admin/wallet" element={<AdminLayout><WalletManagement /></AdminLayout>} />
          <Route path="/admin/withdrawals" element={<AdminLayout><WithdrawalManagement /></AdminLayout>} />
          <Route path="/admin/notifications" element={<AdminLayout><NotificationManagement /></AdminLayout>} />
          
          {/* Page non trouvée */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;

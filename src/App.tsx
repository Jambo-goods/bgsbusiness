
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from 'react-helmet-async';
import { AdminProvider } from '@/contexts/AdminContext';

// Pages principales
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Dashboard from '@/pages/Dashboard';
import HowItWorks from '@/pages/HowItWorks';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

// Pages Admin existantes
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import UserRegistrations from '@/pages/admin/UserRegistrations';
import ProfileManagement from '@/pages/admin/ProfileManagement';
import ProjectManagement from '@/pages/admin/ProjectManagement';
import TransactionManagement from '@/pages/admin/TransactionManagement';
import BankTransferManagement from '@/pages/admin/BankTransferManagement';
import WithdrawalManagement from '@/pages/admin/WithdrawalManagement';
import NotificationManagement from '@/pages/admin/NotificationManagement';
import AdminLayout from '@/components/admin/AdminLayout';

function App() {
  return (
    <HelmetProvider>
      <AdminProvider>
        <Router>
          <Routes>
            {/* Routes principales */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/about" element={<About />} />
            
            {/* Routes Admin avec layout */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/registrations" element={<UserRegistrations />} />
              <Route path="/admin/profiles" element={<ProfileManagement />} />
              <Route path="/admin/projects" element={<ProjectManagement />} />
              <Route path="/admin/transactions" element={<TransactionManagement />} />
              <Route path="/admin/bank-transfers" element={<BankTransferManagement />} />
              <Route path="/admin/withdrawals" element={<WithdrawalManagement />} />
              <Route path="/admin/notifications" element={<NotificationManagement />} />
            </Route>
            
            {/* Route 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        
        <Toaster />
      </AdminProvider>
    </HelmetProvider>
  );
}

export default App;

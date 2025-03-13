
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

// Nouvelles pages pour l'interface de base de données
import DatabaseLogin from '@/pages/database/DatabaseLogin';
import DatabaseDashboard from '@/pages/database/DatabaseDashboard';
import DatabaseUsers from '@/pages/database/DatabaseUsers';
import DatabaseScheduledPayments from '@/pages/database/DatabaseScheduledPayments';
import DatabaseWalletTransactions from '@/pages/database/DatabaseWalletTransactions';
import DatabaseWithdrawalRequests from '@/pages/database/DatabaseWithdrawalRequests';
import DatabaseProjects from '@/pages/database/DatabaseProjects';
import DatabaseBankTransfers from '@/pages/database/DatabaseBankTransfers';

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
            
            {/* Routes Admin existantes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/registrations" element={<UserRegistrations />} />
            <Route path="/admin/profiles" element={<ProfileManagement />} />
            <Route path="/admin/projects" element={<ProjectManagement />} />
            <Route path="/admin/transactions" element={<TransactionManagement />} />
            <Route path="/admin/bank-transfers" element={<BankTransferManagement />} />
            <Route path="/admin/withdrawals" element={<WithdrawalManagement />} />
            <Route path="/admin/notifications" element={<NotificationManagement />} />
            
            {/* Nouvelles routes pour l'interface de base de données */}
            <Route path="/database/login" element={<DatabaseLogin />} />
            <Route path="/database/dashboard" element={<DatabaseDashboard />} />
            <Route path="/database/users" element={<DatabaseUsers />} />
            <Route path="/database/scheduled-payments" element={<DatabaseScheduledPayments />} />
            <Route path="/database/wallet-transactions" element={<DatabaseWalletTransactions />} />
            <Route path="/database/withdrawal-requests" element={<DatabaseWithdrawalRequests />} />
            <Route path="/database/projects" element={<DatabaseProjects />} />
            <Route path="/database/bank-transfers" element={<DatabaseBankTransfers />} />
            
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

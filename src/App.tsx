
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

// Page Admin login
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import UserManagement from '@/pages/admin/UserManagement';
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
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagement />} />
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

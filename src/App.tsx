
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Opportunite from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Users from "./pages/Users";
import { AdminProvider } from "./contexts/AdminContext";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProjectManagement from "./pages/admin/ProjectManagement";
import WithdrawalManagement from "./pages/admin/WithdrawalManagement";
import WalletManagement from "./pages/admin/WalletManagement";
import NotificationManagement from "./pages/admin/NotificationManagement";
import ProfileManagement from "./pages/admin/ProfileManagement";
import InactiveUsersPage from "./pages/admin/InactiveUsersPage";

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AdminProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Opportunite />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/about" element={<About />} />
              <Route path="/users" element={<Users />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="projects" element={<ProjectManagement />} />
                <Route path="withdrawals" element={<WithdrawalManagement />} />
                <Route path="wallets" element={<WalletManagement />} />
                <Route path="profiles" element={<ProfileManagement />} />
                <Route path="inactive-users" element={<InactiveUsersPage />} />
                <Route path="notifications" element={<NotificationManagement />} />
              </Route>
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;

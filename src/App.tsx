import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { AdminProvider } from "@/contexts/AdminContext";
import Index from "./pages/Index";

const Opportunite = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const InvestmentTrackingPage = lazy(() => import("./components/dashboard/investment-tracking/InvestmentTrackingPage"));
const ScheduledPayments = lazy(() => import("./pages/ScheduledPayments"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const WithdrawalRequestsPage = lazy(() => import("./pages/WithdrawalRequestsPage"));
const BankTransfersPage = lazy(() => import("./pages/BankTransfersPage"));
const ProfilesPage = lazy(() => import("./pages/ProfilesPage"));
const AdminApp = lazy(() => import("./pages/admin/AdminApp"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const ReferralsManagement = lazy(() => import("./pages/admin/ReferralsManagement"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-b-2 border-bgs-blue"></div>
  </div>
);

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
    <AdminProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/projects" element={<Opportunite />} />
                <Route path="/project/:id" element={<ProjectDetail />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/dashboard/investment-tracking/:investmentId" element={<InvestmentTrackingPage />} />
                
                {/* Admin Login */}
                <Route path="/admin/login" element={<AdminApp />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="scheduled-payments" element={<ScheduledPayments />} />
                  <Route path="withdrawal-requests" element={<WithdrawalRequestsPage />} />
                  <Route path="bank-transfers" element={<BankTransfersPage />} />
                  <Route path="profiles" element={<ProfilesPage />} />
                  <Route path="referrals" element={<ReferralsManagement />} />
                  <Route path="settings" element={<div>Paramètres</div>} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </AdminProvider>
  </QueryClientProvider>
);

export default App;

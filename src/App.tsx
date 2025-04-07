
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { AdminProvider } from "@/contexts/AdminContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";

const Opportunite = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const InvestmentTrackingPage = lazy(() => import("./components/dashboard/investment-tracking/InvestmentTrackingPage"));
const ScheduledPayments = lazy(() => import("./pages/ScheduledPayments"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const WithdrawalRequestsPage = lazy(() => import("./pages/WithdrawalRequestsPage"));
const BankTransfersPage = lazy(() => import("./pages/BankTransfersPage"));
const AdminApp = lazy(() => import("./pages/admin/AdminApp"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const NotificationManagement = lazy(() => import("./pages/admin/NotificationManagement"));
const ProjectUpdateNotifications = lazy(() => import("./pages/admin/ProjectUpdateNotifications"));
const WithdrawalManagement = lazy(() => import("./pages/admin/WithdrawalManagement"));
const BankTransferManagement = lazy(() => import("./pages/admin/BankTransferManagement"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgs-blue"></div>
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminProvider>
        <AuthProvider>
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
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dashboard/*" element={<Dashboard />} />
                    <Route path="/dashboard/investment-tracking/:investmentId" element={<InvestmentTrackingPage />} />
                    
                    {/* Pages légales */}
                    <Route path="/politique-de-confidentialite" element={<PrivacyPolicy />} />
                    <Route path="/conditions-dutilisation" element={<TermsOfService />} />
                    <Route path="/politique-de-cookies" element={<CookiePolicy />} />
                    <Route path="/mentions-legales" element={<LegalNotice />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/centre-daide" element={<HelpCenter />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/*" element={<AdminApp />} />
                    
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </HelmetProvider>
        </AuthProvider>
      </AdminProvider>
    </QueryClientProvider>
  );
}

export default App;

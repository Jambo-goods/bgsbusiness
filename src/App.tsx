import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { supabase } from "./integrations/supabase/client";
import { ThemeProvider } from "./components/theme-provider";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminProjectDetail from "./pages/admin/AdminProjectDetail";
import AdminCreateProject from "./pages/admin/AdminCreateProject";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import UserManagement from "./pages/admin/UserManagement";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdminStatus(session?.user?.email);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdminStatus(session?.user?.email);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (email?: string) => {
    if (!email) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_admin', {
        user_email: email
      });

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div>Loading...</div>;
    if (!session) return <Navigate to="/login" replace />;
    return <>{children}</>;
  };

  // Admin route component
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) return <div>Loading...</div>;
    if (!session) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="bgs-theme">
      <Toaster position="top-center" richColors />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/projects" element={
            <AdminRoute>
              <AdminProjects />
            </AdminRoute>
          } />
          <Route path="/admin/projects/create" element={
            <AdminRoute>
              <AdminCreateProject />
            </AdminRoute>
          } />
          <Route path="/admin/projects/:id" element={
            <AdminRoute>
              <AdminProjectDetail />
            </AdminRoute>
          } />
          <Route path="/admin/withdrawals" element={
            <AdminRoute>
              <AdminWithdrawals />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

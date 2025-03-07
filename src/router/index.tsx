
import { createBrowserRouter, RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminLayout from "@/components/admin/AdminLayout";

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bgs-orange"></div>
  </div>
);

// Lazy loaded pages for better performance
const Index = lazy(() => import("@/pages/Index"));
const Projects = lazy(() => import("@/pages/Projects"));
const ProjectDetail = lazy(() => import("@/pages/ProjectDetail"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const About = lazy(() => import("@/pages/About"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin pages
const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("@/pages/admin/UserManagement"));
const ProjectManagement = lazy(() => import("@/pages/admin/ProjectManagement"));
const WithdrawalManagement = lazy(() => import("@/pages/admin/WithdrawalManagement"));
const WalletManagement = lazy(() => import("@/pages/admin/WalletManagement"));

// Route definitions
const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Index />
      </Suspense>
    ),
  },
  {
    path: "/projects",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Projects />
      </Suspense>
    ),
  },
  {
    path: "/project/:id",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProjectDetail />
      </Suspense>
    ),
  },
  {
    path: "/how-it-works",
    element: (
      <Suspense fallback={<PageLoader />}>
        <HowItWorks />
      </Suspense>
    ),
  },
  {
    path: "/about",
    element: (
      <Suspense fallback={<PageLoader />}>
        <About />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPassword />
      </Suspense>
    ),
  },
  {
    path: "/dashboard/*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Dashboard />
      </Suspense>
    ),
  },
  {
    path: "/admin/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminLayout />
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<PageLoader />}>
            <UserManagement />
          </Suspense>
        ),
      },
      {
        path: "projects",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProjectManagement />
          </Suspense>
        ),
      },
      {
        path: "withdrawals",
        element: (
          <Suspense fallback={<PageLoader />}>
            <WithdrawalManagement />
          </Suspense>
        ),
      },
      {
        path: "wallets",
        element: (
          <Suspense fallback={<PageLoader />}>
            <WalletManagement />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<PageLoader />}>
        <NotFound />
      </Suspense>
    ),
  },
];

// Create and export the router
export const router = createBrowserRouter(routes);

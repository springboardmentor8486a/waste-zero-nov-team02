import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UIProvider } from "./context/UIContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy loading components for performance
const LandingPage = lazy(() => import("./LandingPage"));
const ImpactOverview = lazy(() => import("./ImpactOverview"));
const LoginPage = lazy(() => import("./LoginPage"));
const RegisterPage = lazy(() => import("./RegisterPage"));
const ForgotPage = lazy(() => import("./ForgotPage"));
const OtpPage = lazy(() => import("./OtpPage"));
const ResetPasswordPage = lazy(() => import("./ResetPasswordPage"));

const Dashboard = lazy(() => import("./Dashboard").then(module => ({ default: module.default })));
const Overview = lazy(() => import("./Dashboard").then(module => ({ default: module.Overview })));

const Profile = lazy(() => import("./Profile"));
const MyImpact = lazy(() => import("./MyImpact"));
const Settings = lazy(() => import("./Settings"));
const Help = lazy(() => import("./Help"));
const Opportunities = lazy(() => import("./Opportunities"));
const Schedule = lazy(() => import("./Schedule"));
const AvailablePickups = lazy(() => import("./AvailablePickups"));
const MyPickups = lazy(() => import("./MyPickups"));
const NewMessages = lazy(() => import("./Messages"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminDashboardView = lazy(() => import("./pages/admin/AdminDashboardView"));
const Reports = lazy(() => import("./pages/reports/Reports"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));

// Loading Spinner Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#123524]"></div>
  </div>
);

export default function App() {
  // Load and apply saved theme on app startup
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('wz_settings_v1');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {
      console.error('Failed to load theme settings:', e);
    }
  }, []);

  return (
    <UIProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ... routes ... */}
            {/* ---------- PUBLIC ROUTES ---------- */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/impact-overview" element={<ImpactOverview />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot" element={<ForgotPage />} />
            <Route path="/otp" element={<OtpPage />} />
            <Route path="/resetpassword" element={<ResetPasswordPage />} />

            {/* ---------- PROTECTED DASHBOARD LAYOUT + CHILD PAGES ---------- */}
            <Route
              element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            >
              {/* Dashboard default overview */}
              <Route
                path="/dashboard"
                element={
                  localStorage.getItem("role") === 'admin' ? <AdminDashboardView /> : <Overview />
                }
              />
              {/* Other pages rendered inside the dashboard layout */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/impact" element={<MyImpact />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/my-pickups" element={<MyPickups />} />
              <Route path="/available-pickups" element={<AvailablePickups />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/opportunities/new" element={<Opportunities />} />
              <Route path="/opportunities/edit/:id" element={<Opportunities />} />
              <Route path="/messages" element={<NewMessages />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/logs" element={<AdminDashboard initialTab="logs" />} />
              <Route path="/admin/opportunities" element={<AdminDashboard initialTab="opportunities" />} />
              <Route path="/admin/users" element={<AdminDashboard initialTab="volunteer" />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />
            </Route>
            {/* ---------- FALLBACK ---------- */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    </UIProvider>
  );
}
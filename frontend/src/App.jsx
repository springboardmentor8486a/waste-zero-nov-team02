import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import WelcomePage from "./WelcomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ForgotPage from "./ForgotPage";
import OtpPage from "./OtpPage";
import ResetPasswordPage from "./ResetPasswordPage";

import Dashboard, { Overview } from "./Dashboard";
import Profile from "./Profile";
import MyImpact from "./MyImpact";

import Settings from "./Settings";
import Help from "./Help";
import Messages from "./Messages";
import Opportunities from "./Opportunities";
import Schedule from "./Schedule";

import OpportunityForm from "./OpportunityForm";
import OpportunityDetail from "./OpportunityDetail";

import ProtectedRoute from "./ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot" element={<ForgotPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/resetpassword" element={<ResetPasswordPage />} />

        {/* ---------- DASHBOARD LAYOUT (PROTECTED) ---------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* DEFAULT DASHBOARD PAGE */}
          <Route index element={<Overview />} />
        </Route>

        {/* ---------- OTHER PROTECTED PAGES ---------- */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/impact"
          element={
            <ProtectedRoute>
              <MyImpact />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />

        {/* ---------- OPPORTUNITY SUB-ROUTES ---------- */}
        <Route
          path="/opportunities/new"
          element={
            <ProtectedRoute>
              <OpportunityForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/opportunities/:id"
          element={
            <ProtectedRoute>
              <OpportunityDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}


//import NgoDashboard from "./NgoDashboard";

//function App() {
 // return <NgoDashboard />;
//}

//export default App;
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

import AvailablePickups from "./AvailablePickups";
import MySchedule from "./MySchedule";
import MyPickups from "./MyPickups";
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
          {/* Dashboard default overview */}
          <Route path="/dashboard" element={<Overview />} />
          {/* Other pages rendered inside the dashboard layout */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/impact" element={<MyImpact />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunities/new" element={<Opportunities />} />
          <Route path="/opportunities/edit/:id" element={<Opportunities />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
        </Route>

<<<<<<< HEAD
=======
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

>>>>>>> 1650e40257e0b4ec1a4810b8567af1802cea50e0
        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

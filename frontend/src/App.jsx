import { BrowserRouter, Routes, Route } from "react-router-dom";
import WelcomePage from "./WelcomePage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ForgotPage from "./ForgotPage";
import OtpPage from "./OtpPage";
import Dashboard from "./Dashboard";
import ResetPasswordPage from "./ResetPasswordPage.jsx";  
import Profile from "./Profile.jsx";
export default function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/forgot" element={<ForgotPage/>} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/dashboard" element={<Dashboard title="Dashboard" />} />
        <Route path="/resetpassword" element={<ResetPasswordPage/>} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

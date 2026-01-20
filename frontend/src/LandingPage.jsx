import React from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./LandingPage.css";
import PlatformImpactModal from "./components/PlatformImpactModal";


export default function LandingPage() {
  const [isImpactModalOpen, setIsImpactModalOpen] = React.useState(false);
  return (
    <div className="min-h-screen landing-page" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
      {/* Glassmorphism Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-md bg-[#123524]/80 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="bg-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform duration-300">
            <img
              src="/waste-truck.png"
              alt="WasteZero Logo"
              className="w-7 h-7 md:w-9 md:h-9 object-contain"
            />
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-white tracking-wide" style={{ fontFamily: "'Poppins', sans-serif", textShadow: "2px 2px 8px rgba(0,0,0,0.7)" }}>
            WasteZero
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            to="/login"
            className="px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white border-2 border-white/30 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium text-white bg-white/20 rounded-full hover:bg-white/30 transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-xl hover:scale-105"
          >
            Register
          </Link>
        </div>
      </header>


      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center min-h-screen bg-cover bg-center pt-20"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#123524]/70"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6 md:px-12 max-w-7xl text-white">

          {/* Hero Content with Animation */}
          <div className="text-center animate-slide-in-right max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight mb-6" style={{ fontFamily: "'Poppins', sans-serif", textShadow: "3px 3px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)" }}>
              SMART WASTE<br />
              SCHEDULING<br />
              <span className="text-emerald-300" style={{ textShadow: "3px 3px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)" }}>MADE SIMPLE</span>
            </h2>
            <p className="text-lg md:text-xl text-white font-normal max-w-2xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif", textShadow: "2px 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.6)" }}>
              Build cleaner cities through efficient and eco-friendly waste
              management. Join thousands making a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/impact-overview"
                className="group px-10 py-4 text-lg font-medium bg-white text-[#123524] rounded-full hover:bg-emerald-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform inline-block text-center"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                FIND OUT MORE
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link
                to="/register"
                className="px-10 py-4 text-lg font-bold bg-transparent border-2 border-white text-white rounded-full hover:bg-white hover:text-[#123524] transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 transform text-center"
                style={{ fontFamily: "'Poppins', sans-serif", textShadow: "1px 1px 4px rgba(0,0,0,0.5)" }}
              >
                GET STARTED
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-[#123524] text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-full p-1.5 shadow-lg">
                  <img
                    src="/waste-truck.png"
                    alt="WasteZero"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h3 className="font-medium text-xl text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  WasteZero
                </h3>
              </div>
              <p className="text-sm text-white/90 max-w-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                A smart, eco-friendly platform that simplifies waste scheduling
                and management for cleaner, sustainable communities.
              </p>
            </div>


            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Quick Links
              </h4>
              <ul className="space-y-2 text-sm text-white/90" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Connect Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Connect With Us
              </h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaTwitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="Email"
                >
                  <FaEnvelope className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
            <p style={{ fontFamily: "'Poppins', sans-serif" }}>
              © 2026 WasteZero.in. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <PlatformImpactModal
        isOpen={isImpactModalOpen}
        onClose={() => setIsImpactModalOpen(false)}
      />
    </div>
  );
}


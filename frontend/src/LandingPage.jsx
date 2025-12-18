import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Cause', sans-serif" }}>
      {/* Navbar */}
      <header className="flex items-center justify-between px-10 py-4 bg-waste-dark-green shadow-sm">
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cause', sans-serif" }}>WasteWise</h1>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-white bg-waste-dark-green rounded-full hover:bg-[#054d38] transition">
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-waste-dark-green rounded-full hover:bg-[#054d38] transition">
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center h-[80vh] bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-10 max-w-6xl text-white">
          {/* Left Image */}
          <div className="flex justify-center">
            <img
              src="/waste-truck.png"
              alt="Waste Truck"
              className="w-48 md:w-64"
            />
          </div>

          {/* Right Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ fontFamily: "'Cause', sans-serif" }}>
              SMART WASTE SCHEDULING <br /> MADE SIMPLE
            </h2>
            <p className="mt-4 text-sm md:text-base text-white max-w-md" style={{ fontFamily: "'Cause', sans-serif" }}>
              Build cleaner cities through efficient and eco-friendly waste
              management.
            </p>
            <button className="mt-6 px-6 py-3 text-sm font-semibold bg-waste-dark-green rounded-full hover:bg-[#054d38] transition text-white" style={{ fontFamily: "'Cause', sans-serif" }}>
              FIND OUT MORE
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white">
        <div className="max-w-6xl mx-auto px-10 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-lg text-white" style={{ fontFamily: "'Cause', sans-serif" }}>WasteWise</h3>
            <p className="text-sm text-white mt-2 max-w-md" style={{ fontFamily: "'Cause', sans-serif" }}>
              A smart, eco-friendly platform that simplifies waste scheduling
              and management for cleaner, sustainable communities.
            </p>
          </div>
          <div className="flex items-end md:justify-end text-xs text-white" style={{ fontFamily: "'Cause', sans-serif" }}>
            © 2024 WasteWise.com. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Graphik', sans-serif" }}>
      {/* Hero Section */}
      <section
        className="flex-1 relative flex items-center p-6 md:p-12 min-h-screen"
        style={{
          backgroundImage: "url('/image.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* WasteZero Name - Top Left */}
        <div className="absolute top-6 left-6 md:top-8 md:left-12 z-20 flex items-center gap-3">
          <img
            src="/waste-truck.png"
            alt="WasteZero Logo"
            className="w-10 h-10 md:w-12 md:h-12 object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-normal text-white" style={{ fontFamily: "'Graphik', sans-serif" }}>
            WasteZero
          </h1>
        </div>

        {/* Login and Register Buttons - Top Right */}
        <div className="absolute top-6 right-6 md:top-8 md:right-12 flex gap-4 z-20">
          <Link
            to="/login"
            className="px-8 py-3 rounded-[40px] text-base font-normal opacity-80 cursor-pointer transition-all duration-300 bg-[#123524] text-white hover:bg-[#0d281a] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#123524]/30"
            style={{ fontFamily: "'Graphik', sans-serif" }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 rounded-[40px] text-base font-normal opacity-80 cursor-pointer transition-all duration-300 bg-[#123524] text-white hover:bg-[#0d281a] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#123524]/30"
            style={{ fontFamily: "'Graphik', sans-serif" }}
          >
            Register
          </Link>
        </div>
        <div className="max-w-7xl w-full mx-auto flex flex-col justify-center items-center h-full relative z-10 mt-16 md:mt-0">
          <div className="flex flex-col gap-6 text-center items-center max-w-5xl">
            <div className="flex items-center gap-4 justify-center">

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-tight text-white uppercase text-center" style={{ fontFamily: "'Graphik', sans-serif" }}>
                <span className="block lowercase first-letter:capitalize">Smart waste scheduling</span>
                <span className="block lowercase first-letter:capitalize">made simple</span>
              </h2>
            </div>

            <div className="w-32 h-1.5 bg-[#123524] my-2"></div>

            <p className="text-base md:text-lg text-white leading-relaxed max-w-lg text-center" style={{ fontFamily: "'Graphik', sans-serif" }}>
              Build cleaner cities through efficient<br />
              and eco-friendly management.
            </p>
            <Link
              to="/register"
              className="px-8 py-3 bg-[#123524] text-white rounded-[40px] text-base font-normal opacity-80 cursor-pointer no-underline inline-block w-fit mt-2 transition-all duration-300 hover:bg-[#0d281a] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#123524]/40"
              style={{ fontFamily: "'Graphik', sans-serif" }}
            >
              FIND OUT MORE
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#123524] text-white p-8 md:p-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-start gap-8 flex-col md:flex-row">
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-4 mb-2">
              <img
                src="/waste-truck.png"
                alt="WasteZero logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-normal text-white" style={{ fontFamily: "'Graphik', sans-serif" }}>WasteZero</span>
            </div>
            <p className="text-sm md:text-base text-white leading-relaxed max-w-lg" style={{ fontFamily: "'Graphik', sans-serif" }}>
              A smart, eco-friendly platform that simplifies waste scheduling and management for cleaner, sustainable communities.
            </p>
            <div className="flex gap-4 mt-4">
              {/* Location Icon */}
              <svg
                className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer transition-colors duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              {/* X/Twitter Icon */}
              <svg
                className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer transition-colors duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {/* Calendar Icon */}
              <svg
                className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer transition-colors duration-300"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright Banner */}
      <div className="bg-gray-600 text-white py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs md:text-sm text-white" style={{ fontFamily: "'Graphik', sans-serif" }}>
            COPYRIGHT 2026 WASTEZERO.IN ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Cause', sans-serif" }}>
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
        {/* WasteWise Name - Top Left */}
        <h1 className="absolute top-6 left-6 md:top-8 md:left-12 text-3xl md:text-4xl font-bold text-white z-20" style={{ fontFamily: "'Cause', sans-serif" }}>
          WasteWise
        </h1>
        
        {/* Login and Register Buttons - Top Right */}
        <div className="absolute top-6 right-6 md:top-8 md:right-12 flex gap-4 z-20">
          <Link 
            to="/login" 
            className="px-8 py-3 rounded-[40px] text-base font-semibold cursor-pointer transition-all duration-300 bg-waste-dark-green text-white hover:bg-[#054d38] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-waste-dark-green/30"
            style={{ fontFamily: "'Cause', sans-serif" }}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="px-8 py-3 rounded-[40px] text-base font-semibold cursor-pointer transition-all duration-300 bg-waste-dark-green text-white hover:bg-[#054d38] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-waste-dark-green/30"
            style={{ fontFamily: "'Cause', sans-serif" }}
          >
            Register
          </Link>
        </div>
        <div className="max-w-7xl w-full mx-auto flex items-center gap-2 md:gap-3 relative z-10 flex-col lg:flex-row mt-16 md:mt-0">
          <div className="flex flex-col gap-2 flex-1">
            <div className="relative w-[250px] h-[250px] md:w-[300px] md:h-[300px] flex items-center justify-center mx-auto lg:mx-0">
              <img 
                src="/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png" 
                alt="Garbage truck with recycling symbol" 
                 className="w-full h-full object-contain relative -top-16 left-48"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 flex-1 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white" style={{ fontFamily: "'Cause', sans-serif" }}>
              <span className="block">SMART WASTE SCHEDULING</span>
              <span className="block">MADE SIMPLE</span>
            </h2>
            <div className="w-32 h-1.5 bg-waste-dark-green my-4 mx-auto"></div>
            <p className="text-lg md:text-xl text-white leading-relaxed max-w-lg mx-auto" style={{ fontFamily: "'Cause', sans-serif" }}>
              Build cleaner cities through efficient<br />
              and eco-friendly management.
            </p>
            <Link 
              to="/register" 
              className="px-10 py-4 bg-waste-dark-green text-white rounded-[40px] text-lg font-semibold cursor-pointer no-underline inline-block w-fit mt-2 transition-all duration-300 hover:bg-[#054d38] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-waste-dark-green/40 mx-auto"
              style={{ fontFamily: "'Cause', sans-serif" }}
            >
              FIND OUT MORE
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-900 text-white p-8 md:p-12 border-t-2 border-waste-green">
        <div className="max-w-7xl mx-auto flex justify-between items-start gap-8 flex-col md:flex-row">
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-4 mb-2">
              <img 
                src="/ChatGPT_Image_Dec_14__2025__09_56_58_AM-removebg-preview.png" 
                alt="WasteWise logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Cause', sans-serif" }}>WasteWise</span>
            </div>
            <p className="text-sm md:text-base text-white leading-relaxed max-w-lg" style={{ fontFamily: "'Cause', sans-serif" }}>
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
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              {/* X/Twitter Icon */}
              <svg 
                className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer transition-colors duration-300" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {/* Calendar Icon */}
              <svg 
                className="w-6 h-6 text-gray-500 hover:text-white cursor-pointer transition-colors duration-300" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
              </svg>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright Banner */}
      <div className="bg-gray-600 text-white py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs md:text-sm text-white" style={{ fontFamily: "'Cause', sans-serif" }}>
            COPYRIGHT 2024 WASTEWISE.COM ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}

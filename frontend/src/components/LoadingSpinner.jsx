import React from 'react';

const LoadingSpinner = ({ message = "Loading...", fullPage = false }) => {
    return (
        <div className={`loading-spinner-container ${fullPage ? 'min-h-screen' : 'p-8 min-h-[400px]'}`}>
            <div className="spinner-wrapper">
                <div className="spinner-outer"></div>
                <div className="spinner-inner"></div>
            </div>
            {message && (
                <p className="text-sm font-medium text-gray-500 animate-pulse uppercase tracking-[0.2em]">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;

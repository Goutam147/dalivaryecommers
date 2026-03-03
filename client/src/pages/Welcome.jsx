import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <img
                src="/appImages/logo.png"
                alt="Food Delivery Logo"
                className="w-48 h-auto drop-shadow-2xl object-contain mb-4 transition-transform hover:scale-105 duration-300"
            />
            <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold text-green-900 tracking-tight">
                    Welcome!
                </h1>
                <p className="text-gray-600 text-lg">
                    Your premier food delivery management system. Proceed to the admin portal or sign in to continue.
                </p>
            </div>

            <div className="flex gap-4 w-full">
                <Link to="/login" className="flex-1 px-6 py-3 bg-white text-green-700 font-semibold rounded-xl border border-green-200 shadow-sm hover:shadow-md hover:bg-green-50 transition-all text-center">
                    Login
                </Link>
                <Link to="/admin/dashboard" className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-600 transition-all text-center">
                    Admin Portal
                </Link>
            </div>
        </div>
    );
};

export default Welcome;

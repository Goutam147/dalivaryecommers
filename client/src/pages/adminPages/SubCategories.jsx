import React from 'react';
import { FiClock } from 'react-icons/fi';

const SubCategories = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <FiClock className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">Coming Soon!</h2>
            <p className="text-gray-500 text-lg max-w-md">
                The Sub Categories feature is currently under development and will be ready very soon. Stay tuned!
            </p>
        </div>
    );
};

export default SubCategories;

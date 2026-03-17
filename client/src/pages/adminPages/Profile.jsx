import React from 'react';

const Profile = () => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Profile Details</h2>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-gray-500 text-lg font-medium">Administrator Settings</p>
            </div>
        </div>
    );
};

export default Profile;

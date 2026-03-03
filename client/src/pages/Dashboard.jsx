import React from 'react';
import { MdOutlineAttachMoney, MdOutlineShoppingCart } from 'react-icons/md';
import { FaUsers, FaBoxOpen } from 'react-icons/fa';

const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-xl ${colorClass} mr-5`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{value}</h3>
        </div>
    </div>
);

const Dashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h2>
                    <p className="text-gray-500 mt-2 text-lg">Here's what's happening with your store today.</p>
                </div>
                <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium hover:bg-gray-50 transition-colors">
                    Generate Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Revenue"
                    value="$24,562"
                    icon={<MdOutlineAttachMoney className="w-7 h-7 text-green-600" />}
                    colorClass="bg-green-100"
                />
                <StatCard
                    title="Total Orders"
                    value="452"
                    icon={<MdOutlineShoppingCart className="w-7 h-7 text-emerald-600" />}
                    colorClass="bg-emerald-100"
                />
                <StatCard
                    title="Active Users"
                    value="1,204"
                    icon={<FaUsers className="w-7 h-7 text-teal-600" />}
                    colorClass="bg-teal-100"
                />
                <StatCard
                    title="Total Products"
                    value="84"
                    icon={<FaBoxOpen className="w-7 h-7 text-lime-600" />}
                    colorClass="bg-lime-100"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h3>
                <div className="flex items-center justify-center h-72 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <p className="text-gray-400 font-medium">Activity charts will render here seamlessly!</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

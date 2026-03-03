import React from 'react';
import { useAppContext } from '../context/AppContext';
import { FiMenu, FiBell, FiLogOut } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const TopBar = () => {
    const { toggleSidebar, user, logout } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    // Dynamically derive the page header and document title based on current path
    const getPageData = () => {
        switch (location.pathname) {
            case '/admin/dashboard': return { header: `Welcome back, ${user?.username || 'Admin'} 👋`, title: 'Dashboard | Admin' };
            case '/admin/users': return { header: 'Manage Users', title: 'Manage Users | Admin' };
            case '/admin/customers': return { header: 'Manage Customers', title: 'Manage Customers | Admin' };
            case '/admin/categories': return { header: 'Manage Categories', title: 'Manage Categories | Admin' };
            case '/admin/brands': return { header: 'Manage Brands', title: 'Manage Brands | Admin' };
            case '/admin/vendors': return { header: 'Manage Vendors', title: 'Manage Vendors | Admin' };
            case '/admin/profile': return { header: 'My Profile', title: 'Profile | Admin' };
            default: return { header: 'Admin Panel', title: 'Admin Panel' };
        }
    };

    const { header, title } = getPageData();

    // Update document title whenever route changes
    useEffect(() => {
        document.title = title;
    }, [title]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            logout();
            toast.success("Successfully logged out");
            navigate('/login');
        } catch (error) {
            toast.error("Error logging out. Please try again.");
            console.error("Logout Error:", error);
        }
    };

    return (
        <header className="flex items-center justify-between h-16 px-4 bg-white shadow-sm border-b border-gray-200 lg:px-8 z-30 relative">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-gray-600 rounded-md hover:bg-green-50 hover:text-green-700 lg:hidden transition-colors"
                >
                    <FiMenu className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">{header}</h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors relative">
                    <FiBell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white box-content"></span>
                </button>

                <div className="h-8 w-px bg-gray-200 mx-1"></div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <FiLogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default TopBar;

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
    MdDashboard, MdPeople, MdCategory, MdStorefront,
    MdKeyboardArrowDown, MdKeyboardArrowRight, MdSettings
} from 'react-icons/md';
import { FaTags, FaUserCircle } from 'react-icons/fa';
import { FiX, FiMenu, FiChevronLeft, FiChevronRight, FiUsers, FiShoppingBag } from 'react-icons/fi';

const Sidebar = () => {
    const { sidebarOpen, toggleSidebar } = useAppContext();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const location = useLocation();

    // Toggle specific dropdown menu
    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));

        // If sidebar is collapsed and we click a dropdown, expand the sidebar
        if (isCollapsed) {
            setIsCollapsed(false);
        }
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <MdDashboard className="w-5 h-5 shrink-0" /> },
        { name: 'Users', path: '/admin/users', icon: <MdPeople className="w-5 h-5 shrink-0" /> },
        { name: 'Customers', path: '/admin/customers', icon: <FiUsers className="w-5 h-5 shrink-0" /> },
        {
            name: 'Categories',
            icon: <MdCategory className="w-5 h-5 shrink-0" />,
            children: [
                { name: 'Main Category', path: '/admin/categories' },
                { name: 'Category Type', path: '/admin/category-types' },
                { name: 'Sub Category', path: '/admin/sub-categories' },
            ]
        },
        { name: 'Brands', path: '/admin/brands', icon: <FaTags className="w-4 h-4 ml-0.5 shrink-0" /> },
        { name: 'Vendors', path: '/admin/vendors', icon: <MdStorefront className="w-5 h-5 shrink-0" /> },
        { name: 'Products', path: '/admin/products', icon: <FiShoppingBag className="w-5 h-5 shrink-0" /> },
        {
            name: 'Settings',
            icon: <MdSettings className="w-5 h-5 shrink-0" />,
            children: [
                { name: 'Set Unit', path: '/admin/units' },
                { name: 'General', path: '/admin/settings/general' },
                { name: 'Advanced', path: '/admin/settings/advanced' },
            ]
        },
        { name: 'Profile', path: '/admin/profile', icon: <FaUserCircle className="w-5 h-5 shrink-0" /> },
    ];

    // Determine sidebar width based on collapsed state on desktop
    const sidebarWidth = isCollapsed ? 'lg:w-20' : 'lg:w-64';

    return (
        <>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out bg-green-900 text-white shadow-xl flex flex-col shrink-0
                ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'} 
                ${sidebarWidth} lg:relative`}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 bg-green-950 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Always show small logo or icon in collapsed mode */}
                        <div className="w-8 h-8 bg-green-800 rounded flex items-center justify-center shrink-0">
                            <MdStorefront className="text-xl" />
                        </div>

                        {/* Only show title if not collapsed (or on mobile where it's always full width) */}
                        <span className={`text-lg font-bold tracking-wider text-green-50 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'} lg:block`}>
                            Admin Panel
                        </span>
                    </div>

                    {/* Mobile Close Button */}
                    <button onClick={toggleSidebar} className="lg:hidden text-green-200 hover:text-white transition-colors p-1">
                        <FiX className="w-6 h-6" />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-green-800 text-green-200 hover:bg-green-700 hover:text-white transition-colors absolute -right-4 top-4 border-2 border-gray-50 z-50 shadow-md"
                    >
                        {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className={`flex-1 p-3 space-y-1 custom-scrollbar ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
                    {navItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openMenus[item.name];

                        // Check if an item or its children is active based on path
                        const isChildActive = hasChildren && item.children.some(child => location.pathname === child.path);
                        const isMainActive = !hasChildren && location.pathname === item.path;
                        const isActive = isMainActive || isChildActive;

                        return (
                            <div key={item.name} className="relative group/navitem">
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive
                                            ? 'bg-green-800/50 text-white'
                                            : 'text-green-100 hover:bg-green-800 hover:text-white'
                                            } ${isCollapsed ? 'lg:justify-center' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                        {!isCollapsed && (
                                            isOpen ? <MdKeyboardArrowDown className="w-5 h-5 shrink-0" /> : <MdKeyboardArrowRight className="w-5 h-5 shrink-0" />
                                        )}
                                    </button>
                                ) : (
                                    <NavLink
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive
                                            ? 'bg-green-700 text-white shadow-md border-l-4 border-green-400'
                                            : 'text-green-100 hover:bg-green-800 hover:text-white border-l-4 border-transparent'
                                            } ${isCollapsed ? 'lg:justify-center lg:px-0 lg:border-l-0 lg:border-r-4' : ''}`}
                                    >
                                        {item.icon}
                                        <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                                            {item.name}
                                        </span>
                                    </NavLink>
                                )}

                                {/* Collapsed state Custom Tooltip */}
                                {isCollapsed && (
                                    <div className="absolute left-full top-0 h-full ml-3 hidden lg:group-hover/navitem:flex items-center z-[100] pointer-events-none">
                                        <div className="bg-green-700 text-white text-sm px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap flex items-center relative border border-green-600">
                                            {/* Tooltip pointer arrow */}
                                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-green-700 border-l border-b border-green-600 rotate-45"></div>
                                            <span className="relative z-10 font-bold tracking-wide drop-shadow-sm">{item.name}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Dropdown Menu Render */}
                                {hasChildren && (
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !isCollapsed ? 'max-h-48 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="pl-11 pr-3 py-1 space-y-1 border-l-2 border-green-800 ml-5 relative before:content-[''] before:absolute before:left-[-2px] before:top-0 before:h-full before:bg-green-800/20 text-sm">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.name}
                                                    to={child.path}
                                                    className={({ isActive }) =>
                                                        `block py-1.5 px-3 rounded-md transition-colors whitespace-nowrap ${isActive
                                                            ? 'text-green-300 bg-green-800/30 font-medium'
                                                            : 'text-green-200 hover:text-white hover:bg-green-800/50'
                                                        }`
                                                    }
                                                >
                                                    {child.name}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer / Session */}
                <div className="p-3 bg-green-950 shrink-0 border-t border-green-900">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-green-700 shrink-0 flex items-center justify-center text-sm font-bold shadow-inner">
                            AD
                        </div>
                        <div className={`transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                            <p className="text-xs text-green-400 font-semibold mb-0.5">Administrator</p>
                            <div className="flex items-center gap-1.5 opacity-80">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                <p className="text-[10px] uppercase tracking-wider">Online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

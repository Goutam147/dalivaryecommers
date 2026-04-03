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

    const toggleMenu = (menuName) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));

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
        {
            name: 'Products',
            icon: <FiShoppingBag className="w-5 h-5 shrink-0" />,
            children: [
                { name: 'Add Product', path: '/admin/products/add' },
                { name: 'Manage Product', path: '/admin/products' },
            ]
        },
        {
            name: 'Settings',
            icon: <MdSettings className="w-5 h-5 shrink-0" />,
            children: [
                { name: 'Shop Master', path: '/admin/settings' },
                { name: 'Set Unit', path: '/admin/units' },
                { name: 'Time Slot', path: '/admin/settings/time-slots' },
            ]
        },
        { name: 'Profile', path: '/admin/profile', icon: <FaUserCircle className="w-5 h-5 shrink-0" /> },
    ];

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
                className={`fixed top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out bg-white text-gray-700 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 flex flex-col shrink-0
                ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:translate-x-0'} 
                ${sidebarWidth} lg:relative`}
            >
                {/* Header */}
                <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-3 overflow-hidden">
                        {/* Always show small logo or icon in collapsed mode */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: 'var(--color-color1)' }}>
                            <MdStorefront className="text-xl text-white" />
                        </div>

                        {/* Only show title if not collapsed */}
                        <span className={`text-lg font-black tracking-tight text-gray-900 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'} lg:block`}>
                            Admin Panel
                        </span>
                    </div>

                    {/* Mobile Close Button */}
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-gray-900 transition-colors p-1">
                        <FiX className="w-6 h-6" />
                    </button>

                    {/* Desktop Collapse Toggle */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors absolute -right-4 top-4 border border-gray-200 z-50 shadow-sm"
                    >
                        {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className={`flex-1 p-3 space-y-1 custom-scrollbar ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
                    {navItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openMenus[item.name];

                        const isChildActive = hasChildren && item.children.some(child => location.pathname === child.path);
                        const isMainActive = !hasChildren && location.pathname === item.path;
                        const isActive = isMainActive || isChildActive;

                        return (
                            <div key={item.name} className="relative group/navitem">
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 font-medium ${isActive
                                            ? 'bg-emerald-50/50 text-gray-900 font-bold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            } ${isCollapsed ? 'lg:justify-center' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`${isActive ? 'text-[var(--color-color1)]' : 'text-gray-400'}`}>{item.icon}</div>
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
                                            ? 'bg-emerald-50 text-gray-900 shadow-sm border-l-4'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                            } ${isCollapsed ? 'lg:justify-center lg:px-0 lg:border-l-0 lg:border-r-4' : ''}`}
                                        style={isActive ? { borderColor: 'var(--color-color1)' } : {}}
                                    >
                                        <div className={`${isActive ? 'text-[var(--color-color1)]' : 'text-gray-400'}`}>{item.icon}</div>
                                        <span className={`whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                                            {item.name}
                                        </span>
                                    </NavLink>
                                )}

                                {/* Collapsed state Custom Tooltip */}
                                {isCollapsed && (
                                    <div className="absolute left-full top-0 h-full ml-3 hidden lg:group-hover/navitem:flex items-center z-[100] pointer-events-none">
                                        <div className="bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg shadow-2xl whitespace-nowrap flex items-center relative border border-gray-800">
                                            {/* Tooltip pointer arrow */}
                                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gray-900 border-l border-b border-gray-800 rotate-45"></div>
                                            <span className="relative z-10 font-bold tracking-wide drop-shadow-sm">{item.name}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Dropdown Menu Render */}
                                {hasChildren && (
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen && !isCollapsed ? 'max-h-56 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="pl-11 pr-3 py-1 space-y-1 border-l-2 border-gray-100 ml-5 relative before:content-[''] before:absolute before:left-[-2px] before:top-0 before:h-full before:bg-gray-100 text-sm">
                                            {item.children.map((child) => (
                                                <NavLink
                                                    key={child.name}
                                                    to={child.path}
                                                    end={child.path === '/admin/products' || child.path === '/admin/categories'}
                                                    className={({ isActive }) =>
                                                        `block py-1.5 px-3 rounded-md transition-colors whitespace-nowrap ${isActive
                                                            ? 'text-[var(--color-color1)] font-bold bg-emerald-50/50'
                                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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
                <div className="p-3 bg-white shrink-0 border-t border-gray-100">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-inner" style={{ backgroundColor: 'var(--color-color1)' }}>
                            AD
                        </div>
                        <div className={`transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0' : 'opacity-100'}`}>
                            <p className="text-xs font-bold text-gray-900 mb-0.5">Administrator</p>
                            <div className="flex items-center gap-1.5 opacity-80">
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-color1)' }}></div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Online</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

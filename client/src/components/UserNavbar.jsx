import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';

const UserNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform duration-300">
                            <MdStorefront className="text-white text-2xl" />
                        </div>
                        <span className="text-xl font-black text-gray-800 tracking-tighter uppercase italic">
                            Food<span className="text-green-600">Dash</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <NavLink to="/" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>Home</NavLink>
                        <NavLink to="/categories" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>Categories</NavLink>
                        <NavLink to="/offers" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest transition-colors ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>Offers</NavLink>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-5">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                        >
                            <FiSearch className="w-5 h-5" />
                        </button>

                        <Link to="/cart" className="relative p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
                            <FiShoppingCart className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">3</span>
                        </Link>

                        <div className="h-6 w-px bg-gray-200"></div>

                        <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm border border-gray-100">
                            <FiUser className="w-4 h-4" />
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <Link to="/cart" className="relative p-2.5 text-gray-400">
                            <FiShoppingCart className="w-6 h-6" />
                            <span className="absolute top-1 right-1 w-4 h-4 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                        </Link>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600">
                            {isMenuOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute w-full bg-white border-b border-gray-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pt-2 pb-6 space-y-2">
                    <NavLink to="/" className="block px-4 py-3 text-lg font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all">Home</NavLink>
                    <NavLink to="/categories" className="block px-4 py-3 text-lg font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all">Categories</NavLink>
                    <NavLink to="/offers" className="block px-4 py-3 text-lg font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all">Offers</NavLink>
                    <div className="pt-4 flex flex-col gap-3">
                        <Link to="/login" className="w-full py-4 bg-green-600 text-white text-center font-bold rounded-2xl shadow-lg shadow-green-600/20 transition-all">
                            Login / Register
                        </Link>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            {isSearchOpen && (
                <div className="absolute inset-0 bg-white z-[60] flex items-center px-4 sm:px-8 animate-in slide-in-from-top duration-300">
                    <div className="max-w-7xl mx-auto w-full flex items-center gap-4">
                        <FiSearch className="text-gray-400 w-6 h-6 flex-shrink-0" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search for delicious food, categories..."
                            className="flex-1 bg-transparent py-4 text-xl font-bold text-gray-800 outline-none placeholder-gray-300"
                        />
                        <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default UserNavbar;

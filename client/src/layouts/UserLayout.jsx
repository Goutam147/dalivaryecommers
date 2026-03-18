import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import UserNavbar from '../components/UserNavbar';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube } from 'react-icons/fi';

const UserLayout = () => {
    const navigation = useNavigation();
    const location = useLocation();
    const loadingBarRef = useRef(null);

    useEffect(() => {
        // Simulate a smooth top loading bar progression on navigation
        loadingBarRef.current?.staticStart(30);
        const timer = setTimeout(() => {
            loadingBarRef.current?.complete();
        }, 400); // 400ms duration makes it feel smooth

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-white text-gray-900 selection:bg-green-200 selection:text-green-900 font-sans">
            <LoadingBar color="#10b981" ref={loadingBarRef} shadow={true} height={3} className="z-[9999]" />

            <UserNavbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <span className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">
                            Food<span className="text-green-600">Dash</span>
                        </span>
                        <p className="mt-6 text-gray-500 text-sm leading-relaxed">
                            Your favorite meals, delivered fresh and fast to your doorstep. Experience the finest culinary delights from your local vendors.
                        </p>
                        <div className="flex items-center gap-4 mt-8">
                            <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-200 transition-all shadow-sm"><FiInstagram /></a>
                            <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-200 transition-all shadow-sm"><FiTwitter /></a>
                            <a href="#" className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-600 hover:border-green-200 transition-all shadow-sm"><FiFacebook /></a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-6">Explore</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            <li><a href="#" className="hover:text-green-600 transition-colors">Categories</a></li>
                            <li><a href="#" className="hover:text-green-600 transition-colors">Popular Deals</a></li>
                            <li><a href="#" className="hover:text-green-600 transition-colors">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-green-600 transition-colors">Top Sellers</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-6">Support</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                            <li><a href="#" className="hover:text-green-600 transition-colors">Track Order</a></li>
                            <li><a href="#" className="hover:text-green-600 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-green-600 transition-colors">Terms of Use</a></li>
                            <li><a href="#" className="hover:text-green-600 transition-colors">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-gray-900 text-xs uppercase tracking-widest mb-6">Newsletter</h4>
                        <p className="text-sm text-gray-500 mb-6">Get weekly food inspiration and exclusive discounts.</p>
                        <div className="flex bg-white border border-gray-200 p-1.5 rounded-2xl shadow-sm focus-within:border-green-500 transition-all">
                            <input type="email" placeholder="email@example.com" className="flex-1 bg-transparent px-3 py-2 outline-none text-sm font-medium" />
                            <button className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20">Join</button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">© 2026 FoodDash. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://img.icons8.com/color/48/000000/paypal.png" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default UserLayout;

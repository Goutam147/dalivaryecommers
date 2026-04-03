import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const AdminLayout = () => {
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
        <div className="flex flex-row h-screen overflow-hidden bg-[#f8f9fa] font-sans text-gray-900 selection:bg-green-200 selection:text-green-900">

            {/* Top Loading Progress Bar injected directly into routing logic */}
            <LoadingBar color="#10b981" ref={loadingBarRef} shadow={true} height={3} className="z-[9999]" />

            <Sidebar />

            <div className="flex flex-col flex-1 w-full relative h-screen">
                <TopBar />

                <main className="flex-1 overflow-y-auto p-3 lg:p-4 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

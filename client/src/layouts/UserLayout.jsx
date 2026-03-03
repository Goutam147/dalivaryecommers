import React, { useEffect, useRef } from 'react';
import { Outlet, useNavigation, useLocation } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';

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
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 selection:bg-green-200 selection:text-green-900">
            <LoadingBar color="#10b981" ref={loadingBarRef} shadow={true} height={3} className="z-[9999]" />
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;

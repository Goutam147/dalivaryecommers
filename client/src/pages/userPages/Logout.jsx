import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Logout = () => {
    const { logout } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                await api.post('/auth/logout');
            } catch (err) {
                console.error("Logout API failed silently", err);
            } finally {
                logout();
                toast.info("You have been logged out");
                navigate('/login', { replace: true });
            }
        };

        performLogout();
    }, [logout, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-50">
            <p className="text-green-800 font-medium animate-pulse">Logging out...</p>
        </div>
    );
};

export default Logout;

import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAppContext } from '../context/AppContext';

const Login = () => {
    const { user, login } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.warning("Please enter your credentials.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Note: Sending emailOrPhone to map to the backend's expected field
            const response = await api.post('/auth/login', {
                emailOrPhone: email,
                password
            });

            if (response.data.success) {
                // Save user to context (which saves to LocalStorage)
                login(response.data.data);
                toast.success("Successfully logged in!");
                navigate('/admin/dashboard', { replace: true });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed. Please check your credentials.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (user) {
        return null; // Prevents rendering flash of login screen while navigating away
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-50/50 selection:bg-green-200">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl shadow-green-900/5 border border-green-100 mx-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-4 bg-green-100 rounded-2xl text-green-600 mb-5 shadow-sm">
                        <FaLeaf className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Admin Portal</h1>
                    <p className="text-gray-500 text-sm mt-2">Sign in to manage your e-commerce platform</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 disabled:hover:shadow-none"
                    >
                        {isSubmitting ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

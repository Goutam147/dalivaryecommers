import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAppContext();

    // If there is no user logged in, redirect them to the login page immediately
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the child routes or passed children
    return children ? children : <Outlet />;
};

export default ProtectedRoute;

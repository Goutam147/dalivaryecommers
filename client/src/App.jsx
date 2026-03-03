import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts & Pages
import ProtectedRoute from './components/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Categories from './pages/Categories';
import Brands from './pages/Brands';
import Vendors from './pages/Vendors';
import Logout from './pages/Logout';
import Customers from './pages/Customers';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: '/admin/logout',
    element: <Logout />,
  },
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <Welcome /> },
    ]
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'users', element: <Users /> },
      { path: 'customers', element: <Customers /> },
      { path: 'categories', element: <Categories /> },
      { path: 'brands', element: <Brands /> },
      { path: 'vendors', element: <Vendors /> },
    ],
  },
  // Catch all unmatched routes and redirect to index naturally
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" theme="colored" autoClose={3000} hideProgressBar={false} />
    </AppProvider>
  );
}

export default App;

import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts & Pages
import ProtectedRoute from './components/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/userPages/Home';
import Login from './pages/userPages/Login';
import Logout from './pages/userPages/Logout';
import Dashboard from './pages/adminPages/Dashboard';
import Profile from './pages/adminPages/Profile';
import Users from './pages/adminPages/Users';
import Customers from './pages/adminPages/Customers';
import Categories from './pages/adminPages/Categories';
import CategoryTypes from './pages/adminPages/CategoryTypes';
import SubCategories from './pages/adminPages/SubCategories';
import Brands from './pages/adminPages/Brands';
import Vendors from './pages/adminPages/Vendors';
import Products from './pages/adminPages/Products';
import AddProduct from './pages/adminPages/AddProduct';
import Units from './pages/adminPages/Units';
import TimeManagement from './pages/adminPages/TimeManagement';
import ShopSettings from './pages/adminPages/ShopSettings';
import ProductDetails from './pages/userPages/ProductDetails';

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
      { index: true, element: <Home /> },
      { path: 'products/:id', element: <ProductDetails /> },
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
      { path: 'category-types', element: <CategoryTypes /> },
      { path: 'sub-categories', element: <SubCategories /> },
      { path: 'products', element: <Products /> },
      { path: 'products/add', element: <AddProduct /> },
      { path: 'brands', element: <Brands /> },
      { path: 'vendors', element: <Vendors /> },
      { path: 'units', element: <Units /> },
      { path: 'settings', element: <ShopSettings /> },
      { path: 'settings/time-slots', element: <TimeManagement /> },
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

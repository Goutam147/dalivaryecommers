import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Lazy initialization: fetch user from localStorage on first load only
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                return null;
            }
        }
        return null; // Start logged out by default
    });

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('adminUser');
    };

    return (
        <AppContext.Provider value={{ sidebarOpen, toggleSidebar, user, login, logout }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

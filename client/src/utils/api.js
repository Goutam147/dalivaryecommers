import axios from 'axios';

// Create an Axios instance with predefined configurations
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Maps to our Express backend
    withCredentials: true, // Crucial for sending cookies (JWT) in cross-origin requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to handle global errors cleanly (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Call Error:", error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default api;

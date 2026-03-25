require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Route files
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Allow requests from our React frontend
    credentials: true, // Crucial for allowing the frontend to receive and send HttpOnly cookies
}));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Public Static Files (like our generated webp Images)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/category-type', require('./routes/categoryTypeRoutes'));
app.use('/api/unit', require('./routes/unitRoutes'));
app.use('/api/brand', brandRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/product', productRoutes);
app.use('/api/sub-category', subCategoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/time', require('./routes/timeRoutes'));

// Base route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT} on http://localhost:${PORT}`);
});

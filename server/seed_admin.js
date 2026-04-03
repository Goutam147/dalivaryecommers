require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/User');

const seedAdmin = async () => {
    try {
        console.log(`Connecting to database at ${process.env.DB_URL} ...`);
        await mongoose.connect(process.env.DB_URL);
        console.log('Database connected successfully.');

        const email = 'admin@gmail.com';
        const password = '123456';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log('Admin user already exists. Updating password...');
            const salt = await bcrypt.genSalt(10);
            existingAdmin.password = await bcrypt.hash(password, salt);
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin password updated successfully.');
        } else {
            console.log('Creating new admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newAdmin = new User({
                username: 'Super Admin',
                email: email,
                phone: '1234567890',
                password: hashedPassword,
                role: 'admin',
                active: true
            });

            await newAdmin.save();
            console.log('Admin created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();

const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        // 1. Check if user already exists (by email or phone)
        const orConditions = [{ phone: phone }];
        if (email) {
            orConditions.push({ email: email });
        }

        const userExists = await User.findOne({ $or: orConditions });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User with this email or phone already exists."
            });
        }

        // 2. Hash the password before saving (default to phone if not provided)
        const salt = await bcrypt.genSalt(10);
        const finalPassword = password ? password : phone.toString();
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        // Build the basic user object
        const userData = {
            username,
            phone,
            password: hashedPassword,
            role: 'customer', // Force customer role for public signup
            active: true
        };

        // Only add email explicitly if it was provided
        if (email && email.trim() !== '') {
            userData.email = email;
        }

        // 3. Create the new user
        const newUser = await User.create(userData);

        // 4. Return success response (avoid sending the password back)
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                active: newUser.active
            }
        });

    } catch (error) {
        console.error("Signup Error: ", error);
        res.status(500).json({
            success: false,
            message: "Server error during registration",
            error: error.message
        });
    }
};

// @desc    Login user with email or phone
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;

        // 1. Find user by either email or phone
        const user = await User.findOne({
            $or: [
                { email: emailOrPhone.toLowerCase() },
                { phone: emailOrPhone }
            ]
        });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 2. Check if account is active
        if (!user.active) {
            return res.status(403).json({ success: false, message: "Account is deactivated. Please contact support." });
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'super_secret_fallback_key',
            { expiresIn: '30d' }
        );

        // 5. Optionally set HTTP-Only cookie for security
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // 6. Return response with token and user data
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error: ", error);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
    // Clear the HTTP-Only cookie if they are using it
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports = {
    signup,
    login,
    logout
};

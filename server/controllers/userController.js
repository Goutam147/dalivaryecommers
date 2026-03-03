const User = require('../model/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users (excluding passwords)
// @route   GET /api/users
// @access  Admin Private (Add auth middleware later if needed)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'customer' } }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching users" });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Admin Private
const updateUser = async (req, res) => {
    try {
        const { username, email, phone, role, active, password } = req.body;

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if email or phone is being updated to one that already exists
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ success: false, message: "Email already in use" });
        }
        if (phone && phone !== user.phone) {
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) return res.status(400).json({ success: false, message: "Phone number already in use" });
        }

        // Build update object
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (phone) updateFields.phone = phone;
        if (role) updateFields.role = role;
        if (active !== undefined) updateFields.active = active;

        // If password is provided, re-hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(password, salt);
        }

        user = await User.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true }).select('-password');

        res.status(200).json({ success: true, message: "User updated successfully", data: user });

    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({ success: false, message: "Server Error updating user" });
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin Private
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        await user.deleteOne();

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: "Server Error deleting user" });
    }
};

// @desc    Get all customers
// @route   GET /api/users/customers
// @access  Admin Private
const getCustomers = async (req, res) => {
    try {
        const users = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error("Get Customers Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching customers" });
    }
};

// @desc    Create a new user (Admin functionality)
// @route   POST /api/users
// @access  Admin Private
const createUser = async (req, res) => {
    try {
        const { username, email, phone, password, role } = req.body;

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

        const salt = await bcrypt.genSalt(10);
        const finalPassword = password ? password : phone.toString();
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        const userData = {
            username,
            phone,
            password: hashedPassword,
            role: role || 'customer',
            active: true
        };

        if (email && email.trim() !== '') {
            userData.email = email;
        }

        const newUser = await User.create(userData);

        res.status(201).json({
            success: true,
            message: "User created successfully",
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
        console.error("Create User Error: ", error);
        res.status(500).json({ success: false, message: "Server error during creation" });
    }
};

module.exports = {
    getUsers,
    getCustomers,
    createUser,
    updateUser,
    deleteUser
};

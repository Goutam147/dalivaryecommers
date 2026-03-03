const Expense = require('../model/Expense');

// @desc    Create new expense
// @route   POST /api/expense
// @access  Private / Auth
const createExpense = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if an expense with this name already exists (case-insensitive)
        const expenseExists = await Expense.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (expenseExists) {
            return res.status(400).json({ success: false, message: "Expense with this name already exists" });
        }

        const expense = await Expense.create(req.body);
        res.status(201).json({ success: true, message: "Expense created successfully", data: expense });
    } catch (error) {
        console.error("Create Expense Error: ", error);
        res.status(500).json({ success: false, message: "Server error creating expense", error: error.message });
    }
};

// @desc    Get all expenses
// @route   GET /api/expense
// @access  Public
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: expenses.length, data: expenses });
    } catch (error) {
        console.error("Get Expenses Error: ", error);
        res.status(500).json({ success: false, message: "Server error fetching expenses" });
    }
};

// @desc    Update expense by ID
// @route   PUT /api/expense/:id
// @access  Private / Auth
const updateExpense = async (req, res) => {
    try {
        const { name } = req.body;

        // Verify another expense doesn't already have this name
        if (name) {
            const nameExists = await Expense.findOne({
                name: new RegExp(`^${name}$`, 'i'),
                _id: { $ne: req.params.id }
            });
            if (nameExists) {
                return res.status(400).json({ success: false, message: "Another expense with this name already exists" });
            }
        }

        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!expense) {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }

        res.status(200).json({ success: true, message: "Expense updated successfully", data: expense });
    } catch (error) {
        console.error("Update Expense Error: ", error);
        if (error.name === 'CastError') {
            return res.status(404).json({ success: false, message: "Expense not found" });
        }
        res.status(500).json({ success: false, message: "Server error updating expense", error: error.message });
    }
};

module.exports = {
    createExpense,
    getExpenses,
    updateExpense
};

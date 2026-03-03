const express = require('express');
const router = express.Router();
const { validateExpense } = require('../middleware/validator/expenseValidator');
const { createExpense, getExpenses, updateExpense } = require('../controllers/expenseController');
const multer = require('multer');

const upload = multer();

// @route   POST /api/expense
// @desc    Create a new expense
// @access  Private / Auth
router.post('/', upload.none(), validateExpense, createExpense);

// @route   GET /api/expense
// @desc    Get all expenses
// @access  Public
router.get('/', getExpenses);

// @route   PUT /api/expense/:id
// @desc    Update a specific expense
// @access  Private / Auth
router.put('/:id', upload.none(), validateExpense, updateExpense);

module.exports = router;

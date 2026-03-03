const express = require('express');
const router = express.Router();
const { validateCategory } = require('../middleware/validator/categoryValidator');
const { createCategory, getCategories, updateCategory } = require('../controllers/categoryController');
const multer = require('multer');

const upload = multer();

// @route   POST /api/category
// @desc    Create a new category
// @access  Private / Auth
router.post('/', upload.none(), validateCategory, createCategory);

// @route   GET /api/category
// @desc    Get all categories
// @access  Public
router.get('/', getCategories);

// @route   PUT /api/category/:id
// @desc    Update a specific category
// @access  Private / Auth
router.put('/:id', upload.none(), validateCategory, updateCategory);

module.exports = router;

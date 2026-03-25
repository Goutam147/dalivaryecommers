const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    createSubCategory,
    getSubCategories,
    updateSubCategory,
    deleteSubCategory
} = require('../controllers/subCategoryController');
const { validateSubCategory } = require('../middleware/validator/subCategoryValidator');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// @route   POST /api/sub-category
// @desc    Create a new sub-category
// @access  Private
router.post('/', upload.array('files', 1), validateSubCategory, createSubCategory);

// @route   GET /api/sub-category
// @desc    Get all sub-categories
// @access  Public
router.get('/', getSubCategories);

// @route   PUT /api/sub-category/:id
// @desc    Update a sub-category
// @access  Private
router.put('/:id', upload.array('files', 1), validateSubCategory, updateSubCategory);

// @route   DELETE /api/sub-category/:id
// @desc    Delete a sub-category
// @access  Private
router.delete('/:id', deleteSubCategory);

module.exports = router;

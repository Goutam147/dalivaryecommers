const express = require('express');
const router = express.Router();
const {
    createCategoryType,
    getCategoryTypes,
    updateCategoryType,
    deleteCategoryType
} = require('../controllers/categoryTypeController');
const { validateCategoryType } = require('../middleware/validator/categoryTypeValidator');

// @route   POST /api/category-type
// @desc    Create a new category type
// @access  Private / Auth
router.post('/', validateCategoryType, createCategoryType);

// @route   GET /api/category-type
// @desc    Get all category types
// @access  Public
router.get('/', getCategoryTypes);

// @route   PUT /api/category-type/:id
// @desc    Update a specific category type
// @access  Private / Auth
router.put('/:id', validateCategoryType, updateCategoryType);

// @route   DELETE /api/category-type/:id
// @desc    Delete a specific category type
// @access  Private / Auth
router.delete('/:id', deleteCategoryType);

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const {
    createCategoryType,
    getCategoryTypes,
    updateCategoryType,
    deleteCategoryType,
    reorderCategoryTypes
} = require('../controllers/categoryTypeController');
const { validateCategoryType } = require('../middleware/validator/categoryTypeValidator');

// @route   POST /api/category-type
// @desc    Create a new category type
// @access  Private / Auth
router.post('/', upload.any(), validateCategoryType, createCategoryType);

// @route   GET /api/category-type
// @desc    Get all category types
// @access  Public
router.get('/', getCategoryTypes);

// @route   PUT /api/category-type/reorder
// @desc    Reorder category types
// @access  Private / Auth
router.put('/reorder', reorderCategoryTypes);

// @route   PUT /api/category-type/:id
// @desc    Update a specific category type
// @access  Private / Auth
router.put('/:id', upload.any(), validateCategoryType, updateCategoryType);

// @route   DELETE /api/category-type/:id
// @desc    Delete a specific category type
// @access  Private / Auth
router.delete('/:id', deleteCategoryType);

module.exports = router;

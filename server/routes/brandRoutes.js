const express = require('express');
const router = express.Router();
const { validateBrand } = require('../middleware/validator/brandValidator');
const { createBrand, getBrands, updateBrand } = require('../controllers/brandController');
const multer = require('multer');

const upload = multer();

// @route   POST /api/brand
// @desc    Create a new brand
// @access  Private / Auth
router.post('/', upload.none(), validateBrand, createBrand);

// @route   GET /api/brand
// @desc    Get all brands
// @access  Public
router.get('/', getBrands);

// @route   PUT /api/brand/:id
// @desc    Update a specific brand
// @access  Private / Auth
router.put('/:id', upload.none(), validateBrand, updateBrand);

module.exports = router;

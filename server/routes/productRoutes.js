const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validateProduct } = require('../middleware/validator/productValidator');
const { createProduct, getProducts, getProductById, updateProduct } = require('../controllers/productController');

// Define memory storage for multer because we process them dynamically using Sharp
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// We allow multiple fields of images: a 'thumbnail' image, and an array of 'images'
const productUploads = upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 } // Allows multiple images uploaded concurrently array-style
]);

// @route   POST /api/product
// @desc    Create a new Product
// @access  Private / Auth
router.post('/', productUploads, validateProduct, createProduct);

// @route   GET /api/product
// @desc    Get all Products
// @access  Public
router.get('/', getProducts);

// @route   GET /api/product/:id
// @desc    Get Product Details
// @access  Public
router.get('/:id', getProductById);

// @route   PUT /api/product/:id
// @desc    Update a specific Product
// @access  Private / Auth
router.put('/:id', productUploads, validateProduct, updateProduct);

module.exports = router;

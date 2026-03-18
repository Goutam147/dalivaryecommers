const express = require('express');
const router = express.Router();
const multer = require('multer');
const { validateProduct } = require('../middleware/validator/productValidator');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct, deleteProductImage } = require('../controllers/productController');

// Define memory storage for multer because we process them dynamically using Sharp
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// We allow any fields of images, as the frontend generates dynamic fields `images_0`, `images_1`, `images_all` etc. 
// depending on variations.
const productUploads = upload.any();

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

// @route   DELETE /api/product/:id
// @desc    Delete a specific Product
// @access  Private / Auth
router.delete('/:id', deleteProduct);

// @route   DELETE /api/product/:productId/images/:imageId
// @desc    Delete a specific Product Gallery Image
// @access  Private / Auth
router.delete('/:productId/images/:imageId', deleteProductImage);

module.exports = router;

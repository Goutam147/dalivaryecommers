const express = require('express');
const router = express.Router();
const { validateShop } = require('../middleware/validator/shopValidator');
const { upsertShop, getShop } = require('../controllers/shopController');
const multer = require('multer');

const upload = multer();

// @route   POST /api/shop
// @desc    Create or Update the ShopMaster
// @access  Private / Auth
router.post('/', upload.none(), validateShop, upsertShop);

// @route   GET /api/shop
// @desc    Get the ShopMaster record
// @access  Public
router.get('/', getShop);

module.exports = router;

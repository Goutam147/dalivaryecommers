const express = require('express');
const router = express.Router();
const { validateVendor } = require('../middleware/validator/vendorValidator');
const { createVendor, getVendors, getVendorById, updateVendor } = require('../controllers/vendorController');
const multer = require('multer');

const upload = multer();

router.post('/', upload.none(), validateVendor, createVendor);
router.get('/', getVendors);
router.get('/:id', getVendorById);
router.put('/:id', upload.none(), validateVendor, updateVendor);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    createUnit,
    getUnits,
    updateUnit,
    deleteUnit
} = require('../controllers/unitController');
const { validateUnit } = require('../middleware/validator/unitValidator');

// @route   POST /api/unit
router.post('/', validateUnit, createUnit);

// @route   GET /api/unit
router.get('/', getUnits);

// @route   PUT /api/unit/:id
router.put('/:id', validateUnit, updateUnit);

// @route   DELETE /api/unit/:id
router.delete('/:id', deleteUnit);

module.exports = router;

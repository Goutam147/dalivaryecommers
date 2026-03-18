const express = require('express');
const router = express.Router();
const { validateTime } = require('../middleware/validator/timeValidator');
const { createTime, getTimeSlots, updateTime, deleteTime } = require('../controllers/timeController');

// @route   POST /api/time
// @desc    Create a new Time Slot
// @access  Private / Auth
router.post('/', validateTime, createTime);

// @route   GET /api/time
// @desc    Get all Time Slots
// @access  Public
router.get('/', getTimeSlots);

// @route   PUT /api/time/:id
// @desc    Update a specific Time Slot
// @access  Private / Auth
router.put('/:id', validateTime, updateTime);

// @route   DELETE /api/time/:id
// @desc    Delete a specific Time Slot
// @access  Private / Auth
router.delete('/:id', deleteTime);

module.exports = router;

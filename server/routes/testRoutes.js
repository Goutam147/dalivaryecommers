const express = require('express');
const router = express.Router();

// @route   GET /api/test
// @desc    Test route
// @access  Public
router.get('/', (req, res) => {
    res.json({ message: 'API is running successfully!' });
});

module.exports = router;

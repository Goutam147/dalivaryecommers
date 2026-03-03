const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getUsers, getCustomers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { validateSignup } = require('../middleware/validator/userValidator');

const upload = multer();

// @route   GET /api/users
router.get('/', getUsers);

// @route   GET /api/users/customers
router.get('/customers', getCustomers);

// @route   POST /api/users
router.post('/', upload.none(), validateSignup, createUser);

// @route   PUT /api/users/:id
router.put('/:id', upload.none(), updateUser);

// @route   DELETE /api/users/:id
router.delete('/:id', deleteUser);

module.exports = router;

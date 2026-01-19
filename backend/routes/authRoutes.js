const express = require('express');
const router = express.Router();
const { register, login, updatePassword, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { registerValidation, loginValidation, updatePasswordValidation } = require('../middleware/validators');

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.put('/password', authenticateToken, updatePasswordValidation, updatePassword);
router.get('/profile', authenticateToken, getProfile);

module.exports = router;

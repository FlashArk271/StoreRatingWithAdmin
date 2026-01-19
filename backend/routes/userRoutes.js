const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, createUser, deleteUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { createUserValidation } = require('../middleware/validators');

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, createUser);
router.delete('/:id', deleteUser);

module.exports = router;

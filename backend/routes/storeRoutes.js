const express = require('express');
const router = express.Router();
const { getAllStores, getStoreById, createStore, deleteStore, getStoresForAdmin } = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { storeValidation } = require('../middleware/validators');

// Public routes (with optional auth for user ratings)
router.get('/', authenticateToken, getAllStores);
router.get('/:id', authenticateToken, getStoreById);

// Admin only routes
router.get('/admin/list', authenticateToken, authorizeRoles('admin'), getStoresForAdmin);
router.post('/', authenticateToken, authorizeRoles('admin'), storeValidation, createStore);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteStore);

module.exports = router;

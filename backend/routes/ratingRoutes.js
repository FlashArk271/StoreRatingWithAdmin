const express = require('express');
const router = express.Router();
const { submitRating, getUserRatingForStore, getStoreOwnerRatings } = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { ratingValidation } = require('../middleware/validators');

// User routes
router.post('/', authenticateToken, authorizeRoles('user'), ratingValidation, submitRating);
router.get('/store/:storeId', authenticateToken, getUserRatingForStore);

// Store owner routes
router.get('/my-store', authenticateToken, authorizeRoles('store_owner'), getStoreOwnerRatings);

module.exports = router;

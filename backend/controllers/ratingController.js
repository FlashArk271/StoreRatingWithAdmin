const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// Submit or update rating
const submitRating = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { store_id, rating } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const [stores] = await pool.query('SELECT id FROM stores WHERE id = ?', [store_id]);
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const [existingRating] = await pool.query(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, store_id]
    );

    if (existingRating.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, userId, store_id]
      );
      res.json({ message: 'Rating updated successfully' });
    } else {
      // Create new rating
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, store_id, rating]
      );
      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error while submitting rating' });
  }
};

// Get user's rating for a store
const getUserRatingForStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    const [ratings] = await pool.query(
      'SELECT rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (ratings.length === 0) {
      return res.json({ rating: null });
    }

    res.json({ rating: ratings[0].rating });
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ message: 'Server error while fetching rating' });
  }
};

// Get ratings for store owner's store
const getStoreOwnerRatings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get store owned by this user
    const [stores] = await pool.query('SELECT id, name FROM stores WHERE owner_id = ?', [ownerId]);
    
    if (stores.length === 0) {
      return res.json({ store: null, ratings: [], averageRating: null });
    }

    const store = stores[0];

    // Get all ratings with user details
    const [ratings] = await pool.query(
      `SELECT r.id, r.rating, r.created_at, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    // Get average rating
    const [avgResult] = await pool.query(
      'SELECT ROUND(AVG(rating), 2) as average_rating FROM ratings WHERE store_id = ?',
      [store.id]
    );

    res.json({
      store,
      ratings,
      averageRating: avgResult[0].average_rating
    });
  } catch (error) {
    console.error('Get store owner ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching ratings' });
  }
};

module.exports = { submitRating, getUserRatingForStore, getStoreOwnerRatings };

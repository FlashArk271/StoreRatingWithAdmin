const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all stores with optional filters
const getAllStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    const userId = req.user?.id;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
      ROUND(AVG(r.rating), 2) as average_rating,
      COUNT(r.id) as total_ratings
      ${userId ? ', (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating' : ''}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = userId ? [userId] : [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';

    // Validate sort columns
    const allowedSortColumns = ['name', 'email', 'address', 'average_rating', 'created_at'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${sortColumn} ${order}`;

    const [stores] = await pool.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error while fetching stores' });
  }
};

// Get store by ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const [stores] = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
       ROUND(AVG(r.rating), 2) as average_rating,
       COUNT(r.id) as total_ratings
       ${userId ? ', (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating' : ''}
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id`,
      userId ? [userId, id] : [id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(stores[0]);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error while fetching store' });
  }
};

// Create new store (Admin only)
const createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address, owner_id } = req.body;

    // Check if store with email exists
    const [existingStores] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existingStores.length > 0) {
      return res.status(400).json({ message: 'Store with this email already exists' });
    }

    // If owner_id provided, verify it's a store_owner
    if (owner_id) {
      const [owners] = await pool.query('SELECT id FROM users WHERE id = ? AND role = ?', [owner_id, 'store_owner']);
      if (owners.length === 0) {
        return res.status(400).json({ message: 'Invalid owner. User must be a store owner.' });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );

    res.status(201).json({ message: 'Store created successfully', storeId: result.insertId });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error while creating store' });
  }
};

// Delete store
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM stores WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Server error while deleting store' });
  }
};

// Get stores for admin list
const getStoresForAdmin = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
      ROUND(AVG(r.rating), 2) as average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    query += ' GROUP BY s.id';

    const allowedSortColumns = ['name', 'email', 'address', 'average_rating', 'created_at'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY ${sortColumn} ${order}`;

    const [stores] = await pool.query(query, params);
    res.json(stores);
  } catch (error) {
    console.error('Get stores for admin error:', error);
    res.status(500).json({ message: 'Server error while fetching stores' });
  }
};

module.exports = { getAllStores, getStoreById, createStore, deleteStore, getStoresForAdmin };

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// Get all users with optional filters
const getAllUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
      CASE 
        WHEN u.role = 'store_owner' THEN (
          SELECT ROUND(AVG(r.rating), 2) 
          FROM stores s 
          LEFT JOIN ratings r ON s.id = r.store_id 
          WHERE s.owner_id = u.id
        )
        ELSE NULL 
      END as rating
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND u.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      query += ' AND u.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      query += ' AND u.address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    // Validate sort columns
    const allowedSortColumns = ['name', 'email', 'address', 'role', 'created_at'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    query += ` ORDER BY u.${sortColumn} ${order}`;

    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
       CASE 
         WHEN u.role = 'store_owner' THEN (
           SELECT ROUND(AVG(r.rating), 2) 
           FROM stores s 
           LEFT JOIN ratings r ON s.id = r.store_id 
           WHERE s.owner_id = u.id
         )
         ELSE NULL 
       END as rating
       FROM users u WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role = 'user' } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

module.exports = { getAllUsers, getUserById, createUser, deleteUser };

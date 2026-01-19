const { pool } = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const [usersResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Get total stores
    const [storesResult] = await pool.query('SELECT COUNT(*) as count FROM stores');
    
    // Get total ratings
    const [ratingsResult] = await pool.query('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: usersResult[0].count,
      totalStores: storesResult[0].count,
      totalRatings: ratingsResult[0].count
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
};

module.exports = { getDashboardStats };

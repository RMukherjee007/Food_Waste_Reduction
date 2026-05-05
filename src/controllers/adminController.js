const pool = require('../config/db');

const getSystemOverview = async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT COUNT(*) as total FROM Users');
    const [batches] = await pool.execute('SELECT COUNT(*) as total FROM Food_Batches');
    const [claims] = await pool.execute('SELECT COUNT(*) as total FROM Claims');
    
    // Get all users for admin table
    const [allUsers] = await pool.execute('SELECT user_id, role, name, address FROM Users ORDER BY role');

    res.status(200).json({
      metrics: {
        totalUsers: users[0].total,
        totalBatches: batches[0].total,
        totalClaims: claims[0].total
      },
      users: allUsers
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch admin overview' });
  }
};

module.exports = { getSystemOverview };

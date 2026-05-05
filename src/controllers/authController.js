const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_key_123';

const login = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'Please provide a user_id to login.' });
  }

  try {
    // Check if user exists
    const [users] = await pool.execute('SELECT user_id, role, name FROM Users WHERE user_id = ?', [user_id]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid user_id. User not found.' });
    }

    const user = users[0];

    // Issue JWT token containing role and id
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { login, JWT_SECRET };

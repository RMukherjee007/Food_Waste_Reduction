const pool = require('../config/db');
const redisClient = require('../config/redis');

/**
 * Finds all 'available' Food_Batches within a 10km radius of a user's location.
 * Implements the Haversine formula directly in raw SQL.
 */
const getAvailableBatchesNearby = async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'latitude and longitude are required' });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({ error: 'latitude and longitude must be valid numbers' });
  }

  const radiusKm = 10;
  const cacheKey = 'batches:available'; // Generalized cache key for demo purposes

  try {
    // Check Cache first
    const cachedBatches = await redisClient.get(cacheKey);
    if (cachedBatches) {
      console.log('Serving batches from Redis Cache');
      // For a real app, distance filtering would happen post-cache or per-location key.
      return res.status(200).json(JSON.parse(cachedBatches));
    }

    console.log('Cache miss. Fetching from MySQL...');
    const query = `
      SELECT 
        fb.batch_id, 
        fb.description, 
        fb.batch_type, 
        fb.weight_kg, 
        fb.expiry_timestamp,
        u.name AS donor_name,
        u.address,
        u.latitude,
        u.longitude,
        (6371 * acos(
          cos(radians(?)) * cos(radians(u.latitude)) * 
          cos(radians(u.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(u.latitude))
        )) AS distance_km
      FROM Food_Batches fb
      JOIN Users u ON fb.donor_id = u.user_id
      WHERE fb.status = 'available'
      HAVING distance_km <= ?
      ORDER BY distance_km ASC;
    `;

    // Parameters: userLat, userLon, userLat, radiusKm
    const [rows] = await pool.execute(query, [userLat, userLon, userLat, radiusKm]);

    const resultData = {
      count: rows.length,
      batches: rows
    };

    // Set Cache with 1-hour TTL (3600 seconds)
    await redisClient.set(cacheKey, JSON.stringify(resultData), { EX: 3600 });

    res.status(200).json(resultData);
  } catch (error) {
    console.error('Distance Search Error:', error);
    res.status(500).json({ error: 'Internal server error during distance search' });
  }
};

/**
 * Fetch all batches created by the logged-in restaurant (donor)
 */
const getMyBatches = async (req, res) => {
  const donor_id = req.user.user_id;

  try {
    const query = `
      SELECT batch_id, description, batch_type, weight_kg, expiry_timestamp, status
      FROM Food_Batches
      WHERE donor_id = ?
      ORDER BY batch_id DESC
    `;
    const [batches] = await pool.execute(query, [donor_id]);
    
    // Gamification Stats Query
    const [stats] = await pool.execute(
      `SELECT COUNT(*) as successful_pickups 
       FROM Claims c 
       JOIN Food_Batches fb ON c.batch_id = fb.batch_id 
       WHERE fb.donor_id = ? AND c.pickup_status = 'completed'`,
      [donor_id]
    );

    res.status(200).json({
      batches,
      stats: {
        successful_pickups: stats[0].successful_pickups
      }
    });
  } catch (error) {
    console.error('Error fetching my batches:', error);
    res.status(500).json({ error: 'Failed to fetch your batches' });
  }
};

/**
 * Create a new food batch (for Restaurants)
 */
const createBatch = async (req, res) => {
  const donor_id = req.user.user_id;
  const { description, batch_type, weight_kg, expiry_hours } = req.body;

  if (!description || !batch_type || !weight_kg || !expiry_hours) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + parseInt(expiry_hours, 10));
    const expiryStr = expiryDate.toISOString().slice(0, 19).replace('T', ' ');

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        'INSERT INTO Food_Batches (donor_id, description, batch_type, weight_kg, expiry_timestamp, status) VALUES (?, ?, ?, ?, ?, "available")',
        [donor_id, description, batch_type, weight_kg, expiryStr]
      );

      await connection.commit();
      
      // Cache Invalidation: Delete the relevant Redis cache key
      await redisClient.del('batches:available');
      console.log('Successfully invalidated Redis cache for batches:available');

      // Emit WebSocket Event to connected Charities
      const newBatchData = {
        batch_id: result.insertId,
        donor_id,
        description,
        batch_type,
        weight_kg,
        expiry_timestamp: expiryStr,
        status: 'available',
        distance_km: 0 // Will be calculated on frontend if needed or we can fetch exact data
      };
      req.io.emit('new_food_posted', newBatchData);

      res.status(201).json({
        message: 'Food batch posted successfully!',
        batch_id: result.insertId
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({ error: 'Failed to create food batch' });
  }
};

module.exports = { getAvailableBatchesNearby, getMyBatches, createBatch };

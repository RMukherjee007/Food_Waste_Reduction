const pool = require('../config/db');

/**
 * Step 1: Charity requests a food batch.
 * Creates a pending claim and locks the batch.
 */
const requestBatch = async (req, res) => {
  const { batch_id } = req.body;
  const charity_id = req.user.user_id;

  if (!batch_id || !charity_id) {
    return res.status(400).json({ error: 'batch_id and charity_id are required' });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Check if the batch is still 'available' and lock the row
      const [batches] = await connection.execute(
        'SELECT status FROM Food_Batches WHERE batch_id = ? FOR UPDATE',
        [batch_id]
      );

      if (batches.length === 0) {
        throw new Error('Food batch not found');
      }

      if (batches[0].status !== 'available') {
        throw new Error('This batch is no longer available for requests');
      }

      // 2. Set batch status to 'locked'
      await connection.execute(
        'UPDATE Food_Batches SET status = "locked" WHERE batch_id = ?',
        [batch_id]
      );

      // 3. Create a pending claim
      const [claimResult] = await connection.execute(
        'INSERT INTO Claims (batch_id, charity_id, pickup_status) VALUES (?, ?, "pending")',
        [batch_id, charity_id]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Request sent successfully. Pending restaurant approval.',
        claim_id: claimResult.insertId
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Request Error:', error);
    res.status(500).json({ error: error.message || 'Failed to request food batch' });
  }
};

/**
 * Fetch pending claims for a Restaurant
 */
const getPendingRequests = async (req, res) => {
  const donor_id = req.user.user_id;
  try {
    const query = `
      SELECT c.claim_id, c.batch_id, c.charity_id, c.claimed_at, fb.description, fb.weight_kg, u.name as charity_name
      FROM Claims c
      JOIN Food_Batches fb ON c.batch_id = fb.batch_id
      JOIN Users u ON c.charity_id = u.user_id
      WHERE fb.donor_id = ? AND c.pickup_status = 'pending'
      ORDER BY c.claimed_at ASC
    `;
    const [requests] = await pool.execute(query, [donor_id]);
    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

/**
 * Step 2: Restaurant accepts the request.
 * Sets claim to completed, batch to claimed.
 */
const acceptClaim = async (req, res) => {
  const { claim_id } = req.body;
  const donor_id = req.user.user_id;

  if (!claim_id) return res.status(400).json({ error: 'claim_id is required' });

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Verify the claim belongs to a batch owned by this donor and is pending
      const [claims] = await connection.execute(
        `SELECT c.batch_id, c.charity_id FROM Claims c 
         JOIN Food_Batches fb ON c.batch_id = fb.batch_id 
         WHERE c.claim_id = ? AND fb.donor_id = ? AND c.pickup_status = 'pending' FOR UPDATE`,
        [claim_id, donor_id]
      );

      if (claims.length === 0) {
        throw new Error('Valid pending request not found');
      }

      const batch_id = claims[0].batch_id;

      // Update Claim to completed
      await connection.execute(
        'UPDATE Claims SET pickup_status = "completed" WHERE claim_id = ?',
        [claim_id]
      );

      // Update Food_Batch to claimed
      await connection.execute(
        'UPDATE Food_Batches SET status = "claimed" WHERE batch_id = ?',
        [batch_id]
      );

      await connection.commit();

      // Emit WebSocket Event to notify charity
      req.io.emit(`claim_accepted_${claims[0].charity_id}`, { batch_id, message: 'Your request was accepted!' });

      res.status(200).json({ message: 'Request accepted successfully.' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Accept Claim Error:', error);
    res.status(500).json({ error: error.message || 'Failed to accept claim' });
  }
};

module.exports = { requestBatch, getPendingRequests, acceptClaim };

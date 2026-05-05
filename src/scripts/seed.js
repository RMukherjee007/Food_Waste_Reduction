const pool = require('../config/db');

async function seedDatabase() {
  console.log('Starting Database Seeding...');

  try {
    // 1. Insert Users (2 Restaurants, 1 Charity)
    // Central point: 40.7306, -73.9352
    console.log('Inserting Users...');
    await pool.execute(`
      INSERT INTO Users (role, name, address, latitude, longitude) VALUES
      ('Restaurant', 'Green Apple Bistro', '123 Apple St, NY', 40.730610, -73.935242),
      ('Restaurant', 'The Daily Loaf', '456 Bread Blvd, NY', 40.748817, -73.985428),
      ('Charity', 'Hope Food Bank', '789 Charity Ln, NY', 40.730000, -73.950000)
    `);

    // 2. Insert Dietary Tags
    console.log('Inserting Dietary Tags...');
    await pool.execute(`
      INSERT IGNORE INTO Dietary_Tags (name) VALUES
      ('Vegan'), ('Gluten-Free'), ('Halal'), ('Dairy-Free')
    `);

    // Fetch the inserted users to get their IDs
    const [restaurants] = await pool.execute("SELECT user_id FROM Users WHERE role = 'Restaurant'");
    const donor1_id = restaurants[0].user_id;
    const donor2_id = restaurants[1].user_id;

    // 3. Insert Food Batches
    console.log('Inserting Food Batches...');
    // Expiry date set to 2 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const expiryStr = futureDate.toISOString().slice(0, 19).replace('T', ' ');

    await pool.execute(`
      INSERT INTO Food_Batches (donor_id, description, batch_type, weight_kg, expiry_timestamp, status) VALUES
      (?, 'Assorted artisan bread and pastries', 'Dry_Goods', 15.5, ?, 'available'),
      (?, 'Organic salads and fruit bowls', 'Refrigerated', 8.0, ?, 'available'),
      (?, 'Canned soups and vegetables', 'Dry_Goods', 20.0, ?, 'available')
    `, [donor1_id, expiryStr, donor2_id, expiryStr, donor1_id, expiryStr]);

    // Fetch the inserted batches and tags to link them
    const [batches] = await pool.execute("SELECT batch_id FROM Food_Batches");
    const [tags] = await pool.execute("SELECT tag_id, name FROM Dietary_Tags");

    const veganTag = tags.find(t => t.name === 'Vegan').tag_id;
    const glutenFreeTag = tags.find(t => t.name === 'Gluten-Free').tag_id;

    // 4. Link Batches with Tags
    console.log('Linking Tags to Batches...');
    await pool.execute(`
      INSERT INTO Batch_Tags (batch_id, tag_id) VALUES
      (?, ?), -- Batch 1 is Vegan
      (?, ?), -- Batch 2 is Vegan
      (?, ?)  -- Batch 2 is also Gluten-Free
    `, [batches[0].batch_id, veganTag, batches[1].batch_id, veganTag, batches[1].batch_id, glutenFreeTag]);

    console.log(' Seeding Complete! Demo data is ready.');
  } catch (error) {
    console.error(' Seeding Error:', error);
  } finally {
    process.exit(0); // Exit the process
  }
}

seedDatabase();

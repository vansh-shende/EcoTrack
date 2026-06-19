const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
  console.log('🌱 Starting Database Seeding...');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ecotrack_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password_here',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };

  const client = new Client(config);

  try {
    await client.connect();
    console.log(`Connected to database "${config.database}" to perform seeding.`);

    // 1. Create Test User
    const username = 'eco_warrior';
    const email = 'test@ecotrack.com';
    const rawPassword = 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Clean up any existing logs/users to prevent unique constraint violations
    await client.query('BEGIN');
    
    // Check if user exists
    const userRes = await client.query('SELECT user_id FROM users WHERE email = $1', [email]);
    let userId;

    if (userRes.rows.length > 0) {
      userId = userRes.rows[0].user_id;
      console.log(`User "${email}" already exists with ID: ${userId}. Clearing old logs...`);
      await client.query('DELETE FROM carbon_logs WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM ai_insights WHERE user_id = $1', [userId]);
    } else {
      const insertUserRes = await client.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id',
        [username, email, hashedPassword]
      );
      userId = insertUserRes.rows[0].user_id;
      console.log(`Created new test user "${email}" with ID: ${userId}`);
    }

    // 2. Insert 14 Days of Carbon Logs
    const categories = [
      { name: 'transportation', factor: 0.18, valueRange: [10, 80] },
      { name: 'energy',         factor: 0.45, valueRange: [5, 30] },
      { name: 'food',           factor: 2.5,  valueRange: [2, 10] },
      { name: 'shopping',       factor: 1.8,  valueRange: [1, 5] },
      { name: 'waste',          factor: 0.5,  valueRange: [1, 4] },
      { name: 'water',          factor: 0.003,valueRange: [100, 400] },
      { name: 'digital',        factor: 0.05, valueRange: [5, 40] },
    ];

    console.log('Generating carbon log history for the past 14 days...');
    
    const now = new Date();
    let logCount = 0;

    // Loop through each of the last 14 days
    for (let d = 0; d < 14; d++) {
      const logDate = new Date(now);
      logDate.setDate(now.getDate() - d);
      
      // Seed 2 to 4 logs per day
      const dailyCount = Math.floor(Math.random() * 3) + 2;
      const shuffledCategories = [...categories].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < dailyCount; i++) {
        const cat = shuffledCategories[i];
        const minVal = cat.valueRange[0];
        const maxVal = cat.valueRange[1];
        const inputValue = parseFloat((Math.random() * (maxVal - minVal) + minVal).toFixed(2));
        const calculatedCo2 = parseFloat((inputValue * cat.factor).toFixed(4));
        
        await client.query(
          `INSERT INTO carbon_logs (user_id, category, input_value, calculated_co2, log_date)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, cat.name, inputValue, calculatedCo2, logDate.toISOString().split('T')[0]]
        );
        logCount++;
      }
    }

    // 3. Insert some mock AI Insights
    await client.query(
      `INSERT INTO ai_insights (user_id, message, is_read)
       VALUES 
       ($1, 'Great job! Your transportation emissions are down 15% this week compared to last week.', false),
       ($1, 'Switching off unused appliances can reduce your energy usage footprint by up to 2.4 kg CO2e per day.', false),
       ($1, 'Consider opting for public transport on your next commute to hit your monthly reduction goals.', false)`,
      [userId]
    );

    await client.query('COMMIT');
    console.log(`✅ Successfully seeded ${logCount} carbon logs and AI insights!`);
    console.log(`\n🔑 Login Credentials:`);
    console.log(`   Email:    test@ecotrack.com`);
    console.log(`   Password: password123`);

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      // Ignore
    }
    process.exit(1);
  } finally {
    await client.end();
  }
};

seed();

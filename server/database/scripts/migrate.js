const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const migrate = async () => {
  console.log('🚀 Starting Database Migration...');

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
    console.log(`Connected to database "${config.database}" at ${config.host}:${config.port}`);

    // Read the SQL schema file
    // The migrations directory is located at e:\Carbon footprint\EcoTrack\database\migrations
    const schemaPath = path.join(__dirname, '../../../database/migrations/001_initial_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Executing schema script...');
    
    await client.query('BEGIN');
    await client.query(schemaSql);
    await client.query('COMMIT');

    console.log('✅ Schema migration completed successfully!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      // Ignore rollback errors if not in a transaction block
    }
    process.exit(1);
  } finally {
    await client.end();
  }
};

migrate();

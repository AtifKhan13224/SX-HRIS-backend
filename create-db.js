const { Client } = require('pg');

async function createDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Atif@44042',
    database: 'postgres', // Connect to default database first
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Check if database exists
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'sx_hris_db'"
    );

    if (checkDb.rows.length > 0) {
      console.log('⚠️  Database sx_hris_db already exists!');
    } else {
      // Create database
      await client.query('CREATE DATABASE sx_hris_db');
      console.log('🎉 Database sx_hris_db created successfully!');
    }

    await client.end();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDatabase();

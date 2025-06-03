// src/config/db.js
require('dotenv').config()

const { Sequelize, DataTypes } = require('sequelize')

// Check if DATABASE_URL is provided (Railway provides this)
const DATABASE_URL = process.env.DATABASE_URL;

// Debug logging for DATABASE_URL (redacted for security)
console.log('🔍 DATABASE_URL exists:', !!DATABASE_URL);
if (DATABASE_URL) {
  const maskedUrl = DATABASE_URL.replace(/:\/\/(.*?)@/, '://****:****@');
  console.log('🔍 DATABASE_URL format:', maskedUrl);
}

let sequelize;

if (DATABASE_URL) {
  // Use the connection string directly if provided (Railway deployment)
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Railway PostgreSQL
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30_000,
      idle: 10_000
    },
    retry: {
      max: 3
    }
  });
} else {
  // Fall back to individual connection parameters (local development)
  const {
    DB_NAME     = 'budget_project_db',
    DB_USER     = 'postgres',
    DB_PASSWORD = '1122',
    DB_HOST     = 'localhost',
    DB_PORT     = 5432,
    NODE_ENV    = 'development'
  } = process.env

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host:     DB_HOST,
    port:     parseInt(DB_PORT, 10),
    dialect:  'postgres',
    logging:  NODE_ENV === 'development' ? console.log : false,
    pool: {
      max:     5,
      min:     0,
      acquire: 30_000,
      idle:    10_000
    },
    retry: {
      max: 3
    }
  });
}

/**
 * Try to authenticate up to `retries` times before throwing.
 */
async function testConnection(retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log('🔄 Attempting to connect to database...');
      if (DATABASE_URL) {
        console.log('🔄 Using DATABASE_URL connection string');
      } else {
        console.log('🔄 Using individual connection parameters');
        console.log('🔄 DB_NAME:', process.env.DB_NAME || 'default value');
        console.log('🔄 DB_HOST:', process.env.DB_HOST || 'default value');
        console.log('🔄 DB_PORT:', process.env.DB_PORT || 'default value');
      }
      
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      return true;
    } catch (err) {
      console.error('❌ Unable to connect to the database:', err.message);
      console.error('❌ Error name:', err.name);
      console.error('❌ Error stack:', err.stack);
      if (attempt === retries) {
        throw new Error('❌ Unable to connect to the database after all retries')
      }
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

module.exports = {
  sequelize,
  DataTypes,
  testConnection
}

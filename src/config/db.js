// src/config/db.js
require('dotenv').config()

const { Sequelize, DataTypes } = require('sequelize')

// Check if DATABASE_URL is provided (Railway provides this)
const DATABASE_URL = process.env.DATABASE_URL;

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
      await sequelize.authenticate()
      console.log('✅ Database connection established.')
      return
    } catch (err) {
      console.error(`⚠️  DB connect attempt ${attempt}/${retries} failed:`, err.message)
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

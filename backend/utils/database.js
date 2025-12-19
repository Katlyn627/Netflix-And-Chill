/**
 * Shared database instance
 * Ensures all controllers use the same database adapter (file, MongoDB, or PostgreSQL)
 * based on the DB_TYPE environment variable.
 */
const DatabaseFactory = require('../database/databaseFactory');

let databaseInstance = null;
let databasePromise = null;

/**
 * Get the shared database instance
 * Creates a new instance on first call, then returns the same instance
 * Uses a promise-based approach to prevent race conditions
 */
async function getDatabase() {
  if (databaseInstance) {
    return databaseInstance;
  }
  
  if (databasePromise) {
    return databasePromise;
  }
  
  databasePromise = DatabaseFactory.createDatabase();
  databaseInstance = await databasePromise;
  databasePromise = null;
  
  return databaseInstance;
}

/**
 * Reset the database instance (useful for testing)
 */
function resetDatabase() {
  databaseInstance = null;
  databasePromise = null;
}

module.exports = {
  getDatabase,
  resetDatabase
};

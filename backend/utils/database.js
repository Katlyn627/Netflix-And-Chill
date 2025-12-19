/**
 * Shared database instance
 * Ensures all controllers use the same database adapter (file, MongoDB, or PostgreSQL)
 * based on the DB_TYPE environment variable.
 */
const DatabaseFactory = require('../database/databaseFactory');

let databaseInstance = null;

/**
 * Get the shared database instance
 * Creates a new instance on first call, then returns the same instance
 */
async function getDatabase() {
  if (!databaseInstance) {
    databaseInstance = await DatabaseFactory.createDatabase();
  }
  return databaseInstance;
}

/**
 * Reset the database instance (useful for testing)
 */
function resetDatabase() {
  databaseInstance = null;
}

module.exports = {
  getDatabase,
  resetDatabase
};

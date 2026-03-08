const config = require('../config/config');
const DataStore = require('../utils/dataStore');
const MongoDBAdapter = require('./mongodbAdapter');
const PostgreSQLAdapter = require('./postgresqlAdapter');

/**
 * Database factory to handle different database types
 */
class DatabaseFactory {
  static async createDatabase() {
    const dbType = config.database.type;

    switch (dbType) {
      case 'mongodb':
        try {
          const mongoAdapter = new MongoDBAdapter();
          await mongoAdapter.connect();
          return mongoAdapter;
        } catch (error) {
          console.error('\n❌ Failed to connect to MongoDB:\n');
          console.error(error.message);
          console.error('\n⚠️  Falling back to file-based database.');
          console.error('   Data will NOT be saved to MongoDB until the connection is fixed.');
          console.error('   To use MongoDB, fix the connection issue above and restart.');
          console.error('   To suppress this warning, set DB_TYPE=file in your .env file.\n');
          return new DataStore();
        }

      case 'postgresql':
        const pgAdapter = new PostgreSQLAdapter();
        await pgAdapter.connect();
        return pgAdapter;

      case 'file':
      default:
        return new DataStore();
    }
  }
}

module.exports = DatabaseFactory;

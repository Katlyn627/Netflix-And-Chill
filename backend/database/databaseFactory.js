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
        const mongoAdapter = new MongoDBAdapter();
        await mongoAdapter.connect();
        return mongoAdapter;

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

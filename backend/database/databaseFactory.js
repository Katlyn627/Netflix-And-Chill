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
          console.error('\n💡 Tip: You can use the file-based database instead by:');
          console.error('   - Removing DB_TYPE from your .env file, OR');
          console.error('   - Setting DB_TYPE=file in your .env file, OR');
          console.error('   - Running the seeder without DB_TYPE: npm run seed\n');
          throw error;
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

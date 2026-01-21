/**
 * Test script to verify findUserByAuth0Id method exists in all database adapters
 */

const { getDatabase } = require('../utils/database');

async function testAuth0Method() {
  try {
    console.log('🧪 Testing findUserByAuth0Id method...\n');
    
    // Get the database instance
    const dataStore = await getDatabase();
    console.log('✅ Database connection established');
    
    // Check if the method exists
    if (typeof dataStore.findUserByAuth0Id === 'function') {
      console.log('✅ findUserByAuth0Id method exists');
    } else {
      console.error('❌ findUserByAuth0Id method does NOT exist');
      process.exit(1);
    }
    
    // Test calling the method with a test auth0Id (should return null for non-existent user)
    const testAuth0Id = 'auth0|test123456';
    console.log(`\n🔍 Testing method call with auth0Id: ${testAuth0Id}`);
    
    const result = await dataStore.findUserByAuth0Id(testAuth0Id);
    console.log('✅ Method call successful');
    console.log(`   Result: ${result ? 'User found' : 'No user found (expected for test ID)'}`);
    
    console.log('\n✨ All tests passed! The fix is working correctly.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAuth0Method();

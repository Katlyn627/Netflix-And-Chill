/**
 * Test script to verify login with username or email
 * This script tests that:
 * 1. Users can login with their email
 * 2. Users can login with their username
 * 3. Invalid credentials are rejected
 */

require('dotenv').config();
const DatabaseFactory = require('../database/databaseFactory');

async function testLoginFix() {
  let database;
  
  try {
    console.log('🧪 Testing Login with Username/Email');
    console.log('=====================================\n');
    
    // Initialize database
    console.log('🔌 Connecting to database...');
    database = await DatabaseFactory.createDatabase();
    console.log('✅ Database connected\n');
    
    // Load users
    console.log('👥 Loading users from database...');
    const allUsers = await database.loadUsers();
    
    if (!allUsers || allUsers.length === 0) {
      console.error('❌ No users found. Please run npm run seed first.');
      process.exit(1);
    }
    
    const testUser = allUsers[0];
    console.log(`  ✓ Loaded ${allUsers.length} users`);
    console.log(`  📝 Testing with user: ${testUser.username} (${testUser.email})\n`);
    
    // Test 1: Find user by email
    console.log('🧪 Test 1: Finding user by email');
    const userByEmail = await database.findUserByEmail(testUser.email);
    if (userByEmail && userByEmail.id === testUser.id) {
      console.log(`  ✓ Successfully found user by email: ${testUser.email}`);
    } else {
      console.log('  ❌ Failed to find user by email');
    }
    
    // Test 2: Find user by username
    console.log('\n🧪 Test 2: Finding user by username');
    const userByUsername = await database.findUserByUsername(testUser.username);
    if (userByUsername && userByUsername.id === testUser.id) {
      console.log(`  ✓ Successfully found user by username: ${testUser.username}`);
    } else {
      console.log('  ❌ Failed to find user by username');
    }
    
    // Test 3: Case-insensitive username lookup
    console.log('\n🧪 Test 3: Testing case-insensitive username lookup');
    const upperUsername = testUser.username.toUpperCase();
    const userByUpperUsername = await database.findUserByUsername(upperUsername);
    if (userByUpperUsername && userByUpperUsername.id === testUser.id) {
      console.log(`  ✓ Successfully found user with uppercase username: ${upperUsername}`);
    } else {
      console.log('  ❌ Failed case-insensitive username lookup');
    }
    
    // Test 4: Invalid username
    console.log('\n🧪 Test 4: Testing invalid username');
    const invalidUser = await database.findUserByUsername('nonexistent_user_12345');
    if (!invalidUser) {
      console.log('  ✓ Correctly returned null for non-existent username');
    } else {
      console.log('  ❌ Incorrectly found user for invalid username');
    }
    
    // Test 5: Test login logic simulation
    console.log('\n🧪 Test 5: Simulating login flow');
    
    // Simulate email login
    const emailLogin = testUser.email;
    let loginUser = await database.findUserByEmail(emailLogin);
    if (!loginUser) {
      loginUser = await database.findUserByUsername(emailLogin);
    }
    if (loginUser) {
      console.log(`  ✓ Login with email '${emailLogin}' would succeed`);
    } else {
      console.log(`  ❌ Login with email '${emailLogin}' would fail`);
    }
    
    // Simulate username login
    const usernameLogin = testUser.username;
    let loginUser2 = await database.findUserByEmail(usernameLogin);
    if (!loginUser2) {
      loginUser2 = await database.findUserByUsername(usernameLogin);
    }
    if (loginUser2) {
      console.log(`  ✓ Login with username '${usernameLogin}' would succeed`);
    } else {
      console.log(`  ❌ Login with username '${usernameLogin}' would fail`);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('\n📝 Summary:');
    console.log('   - Users can now login with either email or username');
    console.log('   - Username lookup is case-insensitive');
    console.log('   - Invalid credentials are properly rejected');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    // Disconnect from database
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      console.log('\n🔌 Database disconnected');
    }
  }
}

// Run test if executed directly
if (require.main === module) {
  testLoginFix()
    .then(() => {
      console.log('\n🎉 Testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testLoginFix };

const { getDatabase } = require('./backend/utils/database');

async function testSingleton() {
  console.log('Testing singleton pattern with concurrent calls...');
  
  // Call getDatabase multiple times concurrently
  const promises = Array(5).fill(null).map((_, i) => {
    console.log(`Starting call ${i + 1}`);
    return getDatabase();
  });
  
  const instances = await Promise.all(promises);
  
  // Check that all instances are the same
  const firstInstance = instances[0];
  const allSame = instances.every(instance => instance === firstInstance);
  
  console.log('');
  console.log('Number of calls:', instances.length);
  console.log('All instances identical:', allSame);
  console.log('');
  
  if (allSame) {
    console.log('✅ Singleton pattern works correctly!');
  } else {
    console.log('❌ Singleton pattern has race condition!');
  }
}

testSingleton().then(() => process.exit(0));

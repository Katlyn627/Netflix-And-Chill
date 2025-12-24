/**
 * Test script to verify streaming providers configuration
 * 
 * This script verifies that:
 * 1. Exactly 15 streaming providers are configured
 * 2. Providers are returned in alphabetical order
 * 3. All expected services are included
 */

const streamingAPIService = require('../services/streamingAPIService');

async function testStreamingProviders() {
  console.log('Testing Streaming Providers Configuration\n');
  console.log('=' .repeat(60));
  
  try {
    // Get providers
    const providers = await streamingAPIService.getStreamingProviders('US');
    
    // Test 1: Count
    console.log('\n1. Provider Count Test:');
    console.log(`   Expected: 15 providers`);
    console.log(`   Actual: ${providers.length} providers`);
    console.log(`   Result: ${providers.length === 15 ? '✓ PASS' : '✗ FAIL'}`);
    
    // Test 2: Alphabetical Order
    console.log('\n2. Alphabetical Order Test:');
    const names = providers.map(p => p.name);
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
    const isAlphabetical = JSON.stringify(names) === JSON.stringify(sortedNames);
    console.log(`   Result: ${isAlphabetical ? '✓ PASS' : '✗ FAIL'}`);
    
    // Test 3: Expected Services
    console.log('\n3. Expected Services Test:');
    const expectedServices = [
      'AMC+',
      'Amazon Prime Video',
      'Apple TV+',
      'BritBox',
      'Crunchyroll',
      'Disney+',
      'HBO Max',
      'Hulu',
      'Netflix',
      'Paramount+',
      'Peacock',
      'Roku Channel',
      'Showtime',
      'Sling TV',
      'Starz'
    ];
    
    const missingServices = expectedServices.filter(s => !names.includes(s));
    const extraServices = names.filter(s => !expectedServices.includes(s));
    
    console.log(`   Expected services all present: ${missingServices.length === 0 ? '✓ PASS' : '✗ FAIL'}`);
    if (missingServices.length > 0) {
      console.log(`   Missing: ${missingServices.join(', ')}`);
    }
    if (extraServices.length > 0) {
      console.log(`   Extra: ${extraServices.join(', ')}`);
    }
    
    // Display all providers
    console.log('\n4. All Providers (in order returned):');
    console.log('=' .repeat(60));
    providers.forEach((provider, index) => {
      console.log(`   ${index + 1}. ${provider.name} (ID: ${provider.id})`);
    });
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    const allTestsPassed = providers.length === 15 && isAlphabetical && missingServices.length === 0 && extraServices.length === 0;
    console.log(`\nOverall: ${allTestsPassed ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
    console.log('=' .repeat(60) + '\n');
    
    process.exit(allTestsPassed ? 0 : 1);
  } catch (error) {
    console.error('Error testing streaming providers:', error);
    process.exit(1);
  }
}

// Run the test
testStreamingProviders();

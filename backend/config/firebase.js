// Firebase configuration and initialization
// This file sets up Firebase Authentication for the Netflix and Chill app

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Validate Firebase configuration
function validateFirebaseConfig() {
    const requiredFields = [
        'apiKey',
        'authDomain',
        'projectId',
        'storageBucket',
        'messagingSenderId',
        'appId'
    ];
    
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
        console.warn('⚠️  Firebase configuration incomplete. Missing:', missingFields.join(', '));
        console.warn('⚠️  Firebase features will be disabled until configuration is complete.');
        console.warn('📖 See CHAT_SETUP_GUIDE.md for setup instructions.');
        return false;
    }
    
    console.log('✅ Firebase configuration loaded successfully');
    return true;
}

// Check if Firebase is configured
const isFirebaseConfigured = validateFirebaseConfig();

module.exports = {
    firebaseConfig,
    isFirebaseConfigured
};

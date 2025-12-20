// Firebase Frontend Configuration
// This file initializes Firebase for client-side authentication

(function() {
    'use strict';

    // Firebase configuration will be loaded from backend API
    let firebaseApp = null;
    let firebaseAuth = null;

    // Initialize Firebase with configuration from backend
    async function initializeFirebase() {
        try {
            // Check if Firebase SDK is loaded
            if (typeof firebase === 'undefined') {
                console.warn('Firebase SDK not loaded. Authentication features will be limited.');
                return false;
            }

            // Get Firebase config from backend (in production, this should be from env)
            // For now, we'll try to initialize with a dummy config and let it fail gracefully
            const firebaseConfig = {
                apiKey: window.FIREBASE_API_KEY || '',
                authDomain: window.FIREBASE_AUTH_DOMAIN || '',
                projectId: window.FIREBASE_PROJECT_ID || '',
                storageBucket: window.FIREBASE_STORAGE_BUCKET || '',
                messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || '',
                appId: window.FIREBASE_APP_ID || ''
            };

            // Check if config is complete
            const hasConfig = Object.values(firebaseConfig).every(val => val !== '');
            
            if (!hasConfig) {
                console.warn('⚠️  Firebase not configured. Using fallback authentication.');
                console.warn('📖 See CHAT_SETUP_GUIDE.md for Firebase setup instructions.');
                return false;
            }

            // Initialize Firebase
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseAuth = firebase.auth();

            console.log('✅ Firebase initialized successfully');
            return true;
        } catch (error) {
            console.warn('Firebase initialization failed:', error.message);
            return false;
        }
    }

    // Sign in with email and password
    async function signInWithEmail(email, password) {
        if (!firebaseAuth) {
            throw new Error('Firebase authentication not initialized');
        }
        
        try {
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);
            return {
                success: true,
                user: userCredential.user,
                userId: userCredential.user.uid
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Sign up with email and password
    async function signUpWithEmail(email, password) {
        if (!firebaseAuth) {
            throw new Error('Firebase authentication not initialized');
        }
        
        try {
            const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            return {
                success: true,
                user: userCredential.user,
                userId: userCredential.user.uid
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Sign in with Google
    async function signInWithGoogle() {
        if (!firebaseAuth) {
            throw new Error('Firebase authentication not initialized');
        }
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await firebaseAuth.signInWithPopup(provider);
            return {
                success: true,
                user: userCredential.user,
                userId: userCredential.user.uid
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Sign out
    async function signOut() {
        if (!firebaseAuth) {
            return { success: true };
        }
        
        try {
            await firebaseAuth.signOut();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get current user
    function getCurrentUser() {
        if (!firebaseAuth) {
            return null;
        }
        return firebaseAuth.currentUser;
    }

    // Listen to auth state changes
    function onAuthStateChanged(callback) {
        if (!firebaseAuth) {
            console.warn('Firebase auth not initialized');
            return () => {};
        }
        return firebaseAuth.onAuthStateChanged(callback);
    }

    // Export Firebase utilities
    window.FirebaseAuth = {
        initialize: initializeFirebase,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        getCurrentUser,
        onAuthStateChanged,
        isInitialized: () => firebaseAuth !== null
    };

    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFirebase);
    } else {
        initializeFirebase();
    }
})();

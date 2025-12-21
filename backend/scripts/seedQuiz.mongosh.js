/**
 * Quiz Seeder for MongoDB
 * Seeds quiz questions and configuration into MongoDB
 * 
 * Usage:
 *   mongosh < backend/scripts/seedQuiz.mongosh.js
 *   OR
 *   node backend/scripts/seedQuiz.mongosh.js (when run as Node.js script)
 * 
 * This script can be run in two ways:
 * 1. As a mongosh script (MongoDB Shell)
 * 2. As a Node.js script using the MongoDB driver
 */

// For Node.js execution
if (typeof require !== 'undefined') {
  const fs = require('fs');
  const path = require('path');
  const { MongoClient } = require('mongodb');
  require('dotenv').config();

  const QUIZ_QUESTIONS = require('../constants/quizQuestions').QUIZ_QUESTIONS;
  const QUIZ_CATEGORIES = require('../constants/quizQuestions').QUIZ_CATEGORIES;
  const quizConfig = require('../constants/quiz.movie-personality-25.v1.json');

  async function seedQuizToMongoDB() {
    const uri = process.env.MONGODB_URI;
    
    if (!uri || uri.includes('<') || uri.includes('YOUR_')) {
      console.log('MongoDB URI not configured. Skipping MongoDB seeding.');
      console.log('To seed MongoDB:');
      console.log('1. Set MONGODB_URI in your .env file');
      console.log('2. Run: DB_TYPE=mongodb node backend/scripts/seedQuiz.mongosh.js');
      return;
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      console.log('Connected to MongoDB');

      const db = client.db();

      // Create/update quiz questions collection
      const questionsCollection = db.collection('quiz_questions');
      
      // Clear existing questions (optional - comment out to preserve)
      // await questionsCollection.deleteMany({});
      
      // Insert or update quiz questions
      for (const question of QUIZ_QUESTIONS) {
        await questionsCollection.updateOne(
          { id: question.id },
          { 
            $set: {
              ...question,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { upsert: true }
        );
      }
      
      console.log(`✓ Seeded ${QUIZ_QUESTIONS.length} quiz questions`);

      // Create/update quiz configuration collection
      const configCollection = db.collection('quiz_config');
      await configCollection.updateOne(
        { version: quizConfig.version },
        {
          $set: {
            ...quizConfig,
            categories: QUIZ_CATEGORIES,
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
      
      console.log(`✓ Seeded quiz configuration (${quizConfig.version})`);

      // Create indexes for efficient querying
      await questionsCollection.createIndex({ id: 1 }, { unique: true });
      await questionsCollection.createIndex({ category: 1 });
      console.log('✓ Created indexes on quiz_questions collection');

      await configCollection.createIndex({ version: 1 }, { unique: true });
      console.log('✓ Created indexes on quiz_config collection');

      // Create indexes on users collection for quiz-related fields
      const usersCollection = db.collection('users');
      await usersCollection.createIndex({ 'quizAttempts.completedAt': -1 });
      await usersCollection.createIndex({ lastQuizCompletedAt: -1 });
      console.log('✓ Created quiz-related indexes on users collection');

      console.log('\n✅ Quiz seeding completed successfully!');
      console.log('\nCollections created/updated:');
      console.log('  - quiz_questions: Quiz questions with categories and options');
      console.log('  - quiz_config: Quiz configuration and metadata');
      console.log('  - users: Updated with quiz-related indexes');

    } catch (error) {
      console.error('Error seeding quiz data:', error);
      throw error;
    } finally {
      await client.close();
      console.log('\nDisconnected from MongoDB');
    }
  }

  // Run seeding if executed directly
  if (require.main === module) {
    seedQuizToMongoDB()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Seeding failed:', error);
        process.exit(1);
      });
  }

  module.exports = { seedQuizToMongoDB };
}

// For mongosh execution (MongoDB Shell script)
// The following code runs when executed with: mongosh < seedQuiz.mongosh.js
if (typeof db !== 'undefined') {
  // Load quiz questions and configuration
  // Note: In mongosh, we need to have the data inline or loaded separately
  
  print('Quiz Seeder for MongoDB');
  print('======================');
  print('');
  print('Note: This script is designed to run as a Node.js script:');
  print('  node backend/scripts/seedQuiz.mongosh.js');
  print('');
  print('For mongosh execution, use the MongoDB driver approach above.');
}

#!/bin/bash
# MongoDB Setup Script for Netflix and Chill

echo "🎬 Netflix and Chill - MongoDB Setup"
echo "===================================="
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it with MongoDB configuration? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Copy MongoDB example to .env
echo "📝 Creating .env file with MongoDB configuration..."
cp .env.mongodb.example .env

echo "✅ .env file created successfully!"
echo ""
echo "📊 Testing MongoDB connection and seeding database..."
echo ""

# Run the seeder
npm run seed

echo ""
echo "🎉 MongoDB setup complete!"
echo ""
echo "To use the application:"
echo "  1. Start the server: npm start"
echo "  2. Open http://localhost:3000 in your browser"
echo "  3. Check TEST_CREDENTIALS.md for login credentials"

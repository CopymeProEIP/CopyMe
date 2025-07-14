#!/bin/bash

# Build and start services
echo "🚀 Starting CopyMe AI application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration!"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads logs model nginx/ssl

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo "✅ Application started!"
echo "🌐 API available at: http://localhost:8000"
echo "📚 API documentation at: http://localhost:8000/docs"
echo "🗄️  MongoDB available at: localhost:27017"

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20 copyme-ai

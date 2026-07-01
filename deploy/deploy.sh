#!/bin/bash
set -e

echo "=== TeamSight Tracker Deployment ==="

# Check .env
if [ ! -f .env ]; then
    echo "Creating .env from .env.server..."
    cp .env.server .env
    echo "Edit .env with your actual values, then re-run this script."
    exit 1
fi

# Build and start
echo "Building Docker image..."
docker compose -f deploy/docker-compose.prod.yml build

echo "Starting services..."
docker compose -f deploy/docker-compose.prod.yml up -d

echo "Waiting for database..."
sleep 3

echo "=== Deployment complete ==="
echo "App is running at http://91.220.69.232:8000"
echo "Health check: http://91.220.69.232:8000/health"

# Show logs
docker compose -f deploy/docker-compose.prod.yml logs -f app

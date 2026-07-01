#!/bin/bash
set -e

echo "=== TeamSight Tracker Deployment ==="

# Check .env
if [ ! -f .env ]; then
    echo "Creating .env from .env.server..."
    cp deploy/.env.server .env
    echo "Edit .env with your actual values, then re-run this script."
    exit 1
fi

# Create database in existing PostgreSQL
echo "Creating database trello_timetracker..."
docker exec teamsight.database psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'trello_timetracker'" | grep -q 1 || \
docker exec teamsight.database psql -U postgres -c "CREATE DATABASE trello_timetracker;"

# Build and start
echo "Building Docker image..."
docker compose -f deploy/docker-compose.prod.yml build

echo "Starting app..."
docker compose -f deploy/docker-compose.prod.yml up -d

echo "=== Deployment complete ==="
echo "App is running at http://91.220.69.232:8080"
echo "Health check: http://91.220.69.232:8080/health"

docker compose -f deploy/docker-compose.prod.yml logs -f app

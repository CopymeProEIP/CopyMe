#!/bin/bash
set -e  # Stop the script on any error

# Stop and clean up containers
docker compose -f docker-compose.development.yml down --remove-orphans --volumes --rmi all
docker volume prune -f

# Remove old MongoDB files
rm -rf .mongodb
ls -l | grep .mongodb || echo "MongoDB directory deleted"

# Export UID/GID
export MY_UID=$(id -u)
export MY_GID=$(id -g)

echo "MY_UID=$MY_UID, MY_GID=$MY_GID"

# Recreate the directory with correct permissions
mkdir -p .mongodb
#sudo chown $MY_UID:$MY_GID .mongodb

# Build without cache
docker compose --verbose -f docker-compose.development.yml build --no-cache

# Start with forced recreation
docker compose -f docker-compose.development.yml --env-file .env up -d --force-recreate --always-recreate-deps

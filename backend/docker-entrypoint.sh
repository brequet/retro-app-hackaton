#!/bin/sh
set -e

echo "Starting RetroBreaker backend..."

# Check if database is empty (no activities)
# If empty, run seed script
if [ -f "./data/retrobreaker.db" ]; then
  echo "Database exists, checking if seeding is needed..."
  # We'll let the app handle this in code instead
else
  echo "Database not found, will be created on first run"
fi

# Start the application
echo "Starting Node.js server..."
exec node dist/index.js
